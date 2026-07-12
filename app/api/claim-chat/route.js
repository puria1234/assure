import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../lib/firebase-admin';

const CLAIM_LIMIT = 1; // Free plan — messages per month
const AI_GATEWAY_URL = process.env.AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1';
const CLAIM_MODEL = process.env.MISTRAL_CHAT_MODEL || 'mistral/devstral-2';

function stripMarkdown(text) {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/gs, '$1')   // bold+italic
    .replace(/\*\*(.+?)\*\*/gs, '$1')        // bold
    .replace(/\*(.+?)\*/gs, '$1')            // italic
    .replace(/_{2}(.+?)_{2}/gs, '$1')        // __bold__
    .replace(/_(.+?)_/gs, '$1')              // _italic_
    .replace(/`{3}[\s\S]*?`{3}/g, '')        // code blocks
    .replace(/`(.+?)`/g, '$1')              // inline code
    .replace(/^#{1,6}\s+/gm, '')             // headings
    .replace(/^\s*[-*+]\s+/gm, '• ')         // unordered list → bullet
    .replace(/^\s*\d+\.\s+/gm, '')           // numbered list markers
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')      // links → just label
    .replace(/!\[.*?\]\(.+?\)/g, '')         // images
    .replace(/^[-_*]{3,}$/gm, '—')           // horizontal rules
    .replace(/\n{3,}/g, '\n\n')              // collapse excess newlines
    .trim();
}

export async function POST(request) {
  try {
    // Verify auth token
    const authHeader = request.headers.get('authorization') || '';
    const idToken = authHeader.replace('Bearer ', '');
    if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    let uid;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // Enforce claim limit
    const monthKey = new Date().toISOString().slice(0, 7);
    const userSnap = await adminDb.collection('users').doc(uid).get();
    const claimCount = userSnap.exists ? (userSnap.data()?.claimCounts?.[monthKey] || 0) : 0;
    if (claimCount >= CLAIM_LIMIT) {
      return NextResponse.json({ error: `Monthly claim limit reached (${CLAIM_LIMIT}/month). Resets next month.` }, { status: 429 });
    }

    const { messages, warrantyContext } = await request.json();

    const {
      productName = 'Unknown product',
      brand = null,
      category = null,
      purchaseDate = null,
      expiryDate = null,
      retailer = null,
      serial = null,
      price = null,
      status = 'unknown',
    } = warrantyContext || {};

    const systemPrompt = `You are an expert warranty claims assistant. Help users understand their rights and file claims.

WARRANTY ON FILE:
Product: ${productName}${brand ? ` by ${brand}` : ''}
Category: ${category || 'Unknown'}
Purchase Date: ${purchaseDate || 'Unknown'}
Expiry Date: ${expiryDate || 'Unknown'}
Status: ${status.toUpperCase()}
Retailer: ${retailer || 'Unknown'}
Serial / Model: ${serial || 'Unknown'}
Purchase Price: ${price ? '$' + price : 'Unknown'}

INSTRUCTIONS:
- Help the user understand whether their issue is covered under warranty
- Advise on documentation to gather (receipt, photos of defect, proof of purchase)
- Draft professional claim letters when asked, addressed to the manufacturer or retailer
- Guide them through the claims process step by step
- Suggest escalation options (BBB, credit card chargeback, small claims court) if needed
- Write in plain, clear prose. Do not use markdown, asterisks, pound signs, backticks, or any special formatting characters. Use plain sentences and paragraphs only.
- Keep responses under 250 words unless drafting a letter.`;

    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      throw new Error('Missing AI_GATEWAY_API_KEY');
    }

    const response = await fetch(`${AI_GATEWAY_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: CLAIM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 1200,
        temperature: 0.6,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI Gateway claim-chat error:', response.status, errText);
      if (response.status === 429) {
        return NextResponse.json({ error: 'Rate limit reached. Wait a few seconds and try again.' }, { status: 429 });
      }
      return NextResponse.json({ error: 'AI service unavailable. Check your AI Gateway key and model access.' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const raw = Array.isArray(content)
      ? content.map((part) => (typeof part === 'string' ? part : part?.text || '')).join('')
      : (typeof content === 'string' ? content : '');
    const clean = stripMarkdown(raw);

    return NextResponse.json({ success: true, message: clean });
  } catch (err) {
    console.error('claim-chat error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
