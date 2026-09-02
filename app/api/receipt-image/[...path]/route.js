import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { withUser } from '../../../../lib/session';
import { queryOne } from '../../../../lib/db';

export const GET = withUser(async (_request, ctx, user) => {
  const { path } = await ctx.params;
  const pathname = path.join('/');

  // The blob is stored privately, so this route is the only way to read it.
  // Authorisation is ownership of a warranty pointing at this exact URL, not
  // merely knowing the path: a signed-in user must not be able to fetch
  // someone else's receipt by guessing or replaying a URL.
  const owned = await queryOne(
    'SELECT 1 FROM warranties WHERE user_id = $1 AND receipt_url = $2 LIMIT 1',
    [user.id, `/api/receipt-image/${pathname}`]
  );
  if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const result = await get(pathname, { access: 'private' }).catch(() => null);
  if (!result || !result.stream) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType || 'application/octet-stream',
      'Cache-Control': 'private, max-age=3600',
    },
  });
});
