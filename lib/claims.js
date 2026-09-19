import { queryOne, transaction } from './db';
import { ENFORCED_PLAN } from './plans';
import { getUsage, monthKey } from './usage';

/**
 * Claim conversations are tracked on the server so a client cannot invent one.
 * A conversation exists only because startClaimSession created it, which is
 * also the only place the claim allowance is spent. Follow-ups must present
 * that conversation's id and are capped per conversation.
 */

/**
 * Begin a conversation and spend one allowance, atomically.
 *
 * The user's app_users row is locked for the duration, so two simultaneous
 * "first messages" cannot both read the same remaining allowance and both
 * succeed. Only this short check-and-write holds the lock; the model call
 * happens after it is released.
 *
 * Returns { sessionId, used } on success, or { blocked: true, used } when the
 * allowance is already spent.
 */
export async function startClaimSession(userId, plan = ENFORCED_PLAN) {
  return transaction(async (client) => {
    await client.query('SELECT 1 FROM app_users WHERE id = $1 FOR UPDATE', [userId]);

    const usage = await getUsage(userId, plan, client);
    if (usage.claim >= plan.limits.claims) return { blocked: true, used: usage.claim };

    const month = monthKey();
    const { rows } = await client.query(
      `INSERT INTO claim_sessions (user_id, month, message_count)
       VALUES ($1, $2, 1) RETURNING id`,
      [userId, month]
    );
    await client.query(
      `INSERT INTO usage_counters (user_id, month, kind, count) VALUES ($1, $2, 'claim', 1)
       ON CONFLICT (user_id, month, kind)
       DO UPDATE SET count = usage_counters.count + 1`,
      [userId, month]
    );
    return { sessionId: rows[0].id, used: usage.claim + 1 };
  });
}

/**
 * Take one message from an existing conversation.
 *
 * Returns { ok: true } or { ok: false, reason } where reason is 'full' when
 * the conversation has hit its message cap, or 'missing' when the id does not
 * exist or belongs to someone else. Both look identical to the caller on
 * purpose: a user cannot probe for other people's conversation ids.
 */
export async function takeClaimMessage(userId, sessionId, cap = ENFORCED_PLAN.limits.claimMessages) {
  try {
    const row = await queryOne(
      `UPDATE claim_sessions SET message_count = message_count + 1
        WHERE id = $1 AND user_id = $2 AND message_count < $3
    RETURNING message_count`,
      [sessionId, userId, cap]
    );
    if (row) return { ok: true, count: row.message_count };

    const exists = await queryOne(
      'SELECT 1 AS found FROM claim_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );
    return { ok: false, reason: exists ? 'full' : 'missing' };
  } catch (err) {
    if (err.code === '22P02') return { ok: false, reason: 'missing' }; // not a valid uuid
    throw err;
  }
}

/**
 * Hand back what a failed request took. A new conversation that never produced
 * a reply is deleted and its allowance refunded; a follow-up just gives its
 * message back. The user should not lose their one free claim to an outage.
 */
export async function releaseClaim(userId, sessionId, wasNewSession) {
  if (!wasNewSession) {
    await queryOne(
      `UPDATE claim_sessions SET message_count = GREATEST(message_count - 1, 0)
        WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );
    return;
  }
  await transaction(async (client) => {
    const { rows } = await client.query(
      'DELETE FROM claim_sessions WHERE id = $1 AND user_id = $2 RETURNING month',
      [sessionId, userId]
    );
    if (!rows[0]) return;
    await client.query(
      `UPDATE usage_counters SET count = GREATEST(count - 1, 0)
        WHERE user_id = $1 AND month = $2 AND kind = 'claim'`,
      [userId, rows[0].month]
    );
  });
}

/** Total claim sessions the user has used, in the plan's own period. */
export async function claimsUsed(userId, plan = ENFORCED_PLAN) {
  return (await getUsage(userId, plan)).claim;
}
