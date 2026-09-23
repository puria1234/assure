import { NextResponse } from 'next/server';
import { getSessionUser } from '../../../lib/session';
import { startClaimSession, takeClaimMessage, releaseClaim, claimsUsed } from '../../../lib/claims';
import { LIMITS } from '../../../lib/warranties';

const CLAIM_LIMIT = LIMITS.claims;             // claim sessions the plan allows
const CLAIM_MESSAGES = LIMITS.claimMessages;   // messages allowed within one session
const MAX_TOTAL_CHARS = 24000;                 // bounds input cost of a single request
const AI_GATEWAY_URL = process.env.AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1';
const CLAIM_MODEL = 'openai/gpt-5.6-luna';

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
    .replace(/^[-_*]{3,}$/gm, '')            // horizontal rules
    .replace(/\n{3,}/g, '\n\n')              // collapse excess newlines
    .trim();
}

// The client sends the whole conversation, so nothing in it can be trusted:
// only user and assistant turns are allowed (a "system" turn would let a caller
// rewrite the assistant's instructions), and size is bounded.
function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return 'No messages provided.';
  if (messages.length > CLAIM_MESSAGES * 2 + 2) return 'This conversation is too long.';
  let total = 0;
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
      return 'Invalid message.';
    }
    total += m.content.length;
  }
  if (total > MAX_TOTAL_CHARS) return 'This conversation is too long.';
  if (messages[messages.length - 1].role !== 'user') return 'The last message must be from the user.';
  return null;
}

export async function POST(request) {
  // What this request took from the user's allowance, so a failure can return it.
  let reservation = null;
  let userId = null;
  const giveBack = async () => {
    if (!reservation) return;
    const r = reservation;
    reservation = null;
    try {
      await releaseClaim(userId, r.sessionId, r.isNew);
    } catch (err) {
      console.error('claim release failed:', err);
    }
  };

  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    userId = user.id;

    const { messages, warrantyContext, sessionId } = await request.json();

    const invalid = validateMessages(messages);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    // A conversation exists only because the server created it, and that is
    // the only place the claim allowance is spent. A request without a session
    // id is therefore always a NEW conversation, however many messages it
    // claims to contain, so a caller cannot dodge the limit by fabricating a
    // history. Follow-ups must present the id the server issued.
    if (sessionId) {
      const taken = await takeClaimMessage(user.id, sessionId, CLAIM_MESSAGES);
      if (!taken.ok) {
        return taken.reason === 'full'
          ? NextResponse.json(
              { error: `This claim session has reached its ${CLAIM_MESSAGES} message limit.`, code: 'session_full' },
              { status: 429 }
            )
          : NextResponse.json(
              { error: 'This claim session could not be found. Start a new one.', code: 'session_missing' },
              { status: 404 }
            );
      }
      reservation = { sessionId, isNew: false, count: taken.count };
    } else {
      const started = await startClaimSession(user.id);
      if (started.blocked) {
        return NextResponse.json(
          {
            error: `You have used your free trial claim session${CLAIM_LIMIT === 1 ? '' : 's'} (${started.used}/${CLAIM_LIMIT}).`,
            code: 'allowance_used',
          },
          { status: 429 }
        );
      }
      reservation = { sessionId: started.sessionId, isNew: true, count: 1 };
    }

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
Status: ${String(status).toUpperCase()}
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
      await giveBack();
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

    const { sessionId: sid, count: messageCount } = reservation;
    reservation = null; // the reply was produced, so the allowance stays spent

    return NextResponse.json({
      success: true,
      message: clean,
      sessionId: sid,
      messageCount,
      claimCount: await claimsUsed(user.id),
    });
  } catch (err) {
    console.error('claim-chat error:', err);
    await giveBack();
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
