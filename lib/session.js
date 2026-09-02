import { auth } from './auth/server';
import { queryOne } from './db';

/**
 * Resolve the signed-in user and guarantee an app_users row exists for them.
 *
 * Neon Auth owns identity in the neon_auth schema; app_users holds our own
 * profile fields. The row is created lazily on first authenticated request
 * rather than by a webhook, so there is no window where a session exists but
 * its profile does not.
 *
 * Returns null when there is no valid session.
 */
export async function getSessionUser() {
  const { data } = await auth.getSession().catch(() => ({ data: null }));
  const user = data?.user;
  if (!user?.id) return null;

  const profile = await queryOne(
    `INSERT INTO app_users (id, email, name)
          VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
       RETURNING id, email, name, notif_enabled, notif_days_before, created_at`,
    [user.id, user.email ?? '', user.name ?? (user.email ?? '').split('@')[0]]
  );
  return profile;
}

/** Wrap a route handler so it only runs for signed-in users. */
export function withUser(handler) {
  return async (request, ctx) => {
    let user;
    try {
      user = await getSessionUser();
    } catch (err) {
      console.error('session lookup failed:', err);
      return Response.json({ error: 'Auth unavailable' }, { status: 503 });
    }
    if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });
    return handler(request, ctx, user);
  };
}

export const monthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
