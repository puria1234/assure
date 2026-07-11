import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';

export async function GET(request, { params }) {
  const { path } = await params;
  const pathname = path.join('/');

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
}
