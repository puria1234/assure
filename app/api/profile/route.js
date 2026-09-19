import { queryOne } from '../../../lib/db';
import { withUser } from '../../../lib/session';
import { getUsage } from '../../../lib/usage';
import { ENFORCED_PLAN } from '../../../lib/plans';

export const GET = withUser(async (_request, _ctx, user) => {
  const usage = await getUsage(user.id);

  return Response.json({
    profile: {
      id: user.id,
      email: user.email,
      name: user.name,
      notificationPrefs: {
        enabled: user.notif_enabled,
        daysBefore: user.notif_days_before,
      },
    },
    usage,
    // The dashboard renders its meters from these rather than keeping its own
    // copy of the numbers, so they cannot drift from what the server enforces.
    limits: ENFORCED_PLAN.limits,
    plan: { key: ENFORCED_PLAN.key, name: ENFORCED_PLAN.name, period: ENFORCED_PLAN.period },
  });
});

export const PATCH = withUser(async (request, _ctx, user) => {
  const body = await request.json().catch(() => ({}));
  const sets = [];
  const vals = [];

  if (typeof body.name === 'string') {
    vals.push(body.name.trim());
    sets.push(`name = $${vals.length}`);
  }
  if (body.notificationPrefs) {
    if ('enabled' in body.notificationPrefs) {
      vals.push(!!body.notificationPrefs.enabled);
      sets.push(`notif_enabled = $${vals.length}`);
    }
    if ('daysBefore' in body.notificationPrefs) {
      const days = Number(body.notificationPrefs.daysBefore);
      if (!Number.isInteger(days) || days < 1) {
        return Response.json({ error: 'daysBefore must be a positive whole number.' }, { status: 400 });
      }
      vals.push(days);
      sets.push(`notif_days_before = $${vals.length}`);
    }
  }
  if (!sets.length) return Response.json({ error: 'Nothing to update.' }, { status: 400 });

  vals.push(user.id);
  const row = await queryOne(
    `UPDATE app_users SET ${sets.join(', ')} WHERE id = $${vals.length}
       RETURNING id, email, name, notif_enabled, notif_days_before`,
    vals
  );
  return Response.json({
    profile: {
      id: row.id,
      email: row.email,
      name: row.name,
      notificationPrefs: { enabled: row.notif_enabled, daysBefore: row.notif_days_before },
    },
  });
});
