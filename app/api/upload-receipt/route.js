import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { withUser } from '../../../lib/session';

// 10 MB. Vercel Functions accept far larger bodies, but a receipt photo has no
// business being bigger, and an unbounded endpoint is an easy way to run up a
// storage bill.
const MAX_BYTES = 10 * 1024 * 1024;

export const POST = withUser(async (request) => {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!file.type?.startsWith('image/')) {
      return NextResponse.json({ error: 'Receipts must be image files.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Receipt image must be under 10MB.' }, { status: 413 });
    }

    const ext = file.name?.includes('.') ? file.name.split('.').pop() : 'jpg';
    const key = `receipts/${crypto.randomUUID()}.${ext}`;

    const blob = await put(key, file, {
      access: 'private',
      contentType: file.type || 'application/octet-stream',
    });

    return NextResponse.json({ url: `/api/receipt-image/${blob.pathname}` });
  } catch (err) {
    console.error('upload-receipt error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
});
