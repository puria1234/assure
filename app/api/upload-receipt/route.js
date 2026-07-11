import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name?.includes('.') ? file.name.split('.').pop() : 'jpg';
    const key = `receipts/${crypto.randomUUID()}.${ext}`;

    const blob = await put(key, file, {
      access: 'private',
      contentType: file.type || 'application/octet-stream',
    });

    return NextResponse.json({ url: `/api/receipt-image/${blob.pathname}` });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
