import { query, queryOne } from '../../../lib/db';
import { withUser } from '../../../lib/session';
import { toApi, WRITABLE, normalise, LIMITS } from '../../../lib/warranties';

const SELECT = `id, user_id, product_name, brand, category, purchase_date,
                expiry_date, price, retailer, serial, notes, receipt_url,
                created_at, updated_at`;

export const GET = withUser(async (_request, _ctx, user) => {
  const rows = await query(
    `SELECT ${SELECT} FROM warranties WHERE user_id = $1 ORDER BY expiry_date ASC`,
    [user.id]
  );
  return Response.json({ warranties: rows.map(toApi) });
});

export const POST = withUser(async (request, _ctx, user) => {
  const body = await request.json().catch(() => ({}));
  if (!body.productName || !body.expiryDate) {
    return Response.json({ error: 'Product name and expiry date are required.' }, { status: 400 });
  }

  const { count } = await queryOne(
    'SELECT count(*)::int AS count FROM warranties WHERE user_id = $1',
    [user.id]
  );
  if (count >= LIMITS.warranties) {
    return Response.json(
      { error: `Free plan is limited to ${LIMITS.warranties} warranties.` },
      { status: 403 }
    );
  }

  const cols = ['user_id'];
  const vals = [user.id];
  for (const [key, col] of Object.entries(WRITABLE)) {
    if (key in body) { cols.push(col); vals.push(normalise(key, body[key])); }
  }
  const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');

  try {
    const row = await queryOne(
      `INSERT INTO warranties (${cols.join(', ')}) VALUES (${placeholders}) RETURNING ${SELECT}`,
      vals
    );
    return Response.json({ warranty: toApi(row) }, { status: 201 });
  } catch (err) {
    if (err.code === '23514') {
      return Response.json({ error: 'Expiry date cannot be before the purchase date.' }, { status: 400 });
    }
    console.error('create warranty failed:', err);
    return Response.json({ error: 'Could not save warranty.' }, { status: 500 });
  }
});
