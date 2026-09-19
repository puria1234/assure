import { query, queryOne } from './db';
import { ENFORCED_PLAN } from './plans';

export const monthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * How much of each AI allowance a user has used, counted the way their plan
 * counts it. A lifetime plan (the free trial) sums every month ever recorded;
 * a monthly plan reads only the current month.
 */
export async function getUsage(userId, plan = ENFORCED_PLAN, client) {
  // `client` lets a caller run this inside its own transaction, so the check
  // and the write that spends the allowance can be made atomic.
  const run = client ? (text, params) => client.query(text, params).then((r) => r.rows) : query;

  const rows =
    plan.period === 'lifetime'
      ? await run(
          `SELECT kind, sum(count)::int AS count
             FROM usage_counters WHERE user_id = $1 GROUP BY kind`,
          [userId]
        )
      : await run(
          'SELECT kind, count FROM usage_counters WHERE user_id = $1 AND month = $2',
          [userId, monthKey()]
        );

  const usage = { scan: 0, claim: 0 };
  for (const row of rows) usage[row.kind] = row.count;
  return usage;
}

/**
 * Record one use and return the new total for the plan's period.
 * Rows are always written per calendar month so a user can move between a
 * lifetime plan and a monthly one without losing history.
 */
export async function recordUsage(userId, kind, plan = ENFORCED_PLAN) {
  await queryOne(
    `INSERT INTO usage_counters (user_id, month, kind, count) VALUES ($1, $2, $3, 1)
     ON CONFLICT (user_id, month, kind)
     DO UPDATE SET count = usage_counters.count + 1`,
    [userId, monthKey(), kind]
  );
  const usage = await getUsage(userId, plan);
  return usage[kind];
}
