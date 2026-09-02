import { queryOne } from '../../../../lib/db';
import { withUser } from '../../../../lib/session';
import { toApi, WRITABLE, normalise } from '../../../../lib/warranties';

const SELECT = `id, user_id, product_name, brand, category, purchase_date,
                expiry_date, price, retailer, serial, notes, receipt_url,
                created_at, updated_at`;

export const PATCH = withUser(async (request, ctx, user) => {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  const sets = [];
  const vals = [];
  for (const [key, col] of Object.entries(WRITABLE)) {
    if (key in body) { vals.push(normalise(key, body[key])); sets.push(`${col} = $${vals.length}`); }
  }
  if (!sets.length) return Response.json({ error: 'Nothing to update.' }, { status: 400 });

  vals.push(id, user.id);
  try {
    // The user_id predicate is the authorisation check: a row belonging to
    // someone else simply does not match, so this cannot update another
    // account's warranty even with a guessed id.
    const row = await queryOne(
      `UPDATE warranties SET ${sets.join(', ')}
        WHERE id = $${vals.length - 1} AND user_id = $${vals.length}
    RETURNING ${SELECT}`,
      vals
    );
    if (!row) return Response.json({ error: 'Not found.' }, { status: 404 });
    return Response.json({ warranty: toApi(row) });
  } catch (err) {
    if (err.code === '23514') {
      return Response.json({ error: 'Expiry date cannot be before the purchase date.' }, { status: 400 });
    }
    if (err.code === '22P02') return Response.json({ error: 'Not found.' }, { status: 404 });
    console.error('update warranty failed:', err);
    return Response.json({ error: 'Could not update warranty.' }, { status: 500 });
  }
});

export const DELETE = withUser(async (_request, ctx, user) => {
  const { id } = await ctx.params;
  try {
    const row = await queryOne(
      'DELETE FROM warranties WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user.id]
    );
    if (!row) return Response.json({ error: 'Not found.' }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    if (err.code === '22P02') return Response.json({ error: 'Not found.' }, { status: 404 });
    console.error('delete warranty failed:', err);
    return Response.json({ error: 'Could not delete warranty.' }, { status: 500 });
  }
});
