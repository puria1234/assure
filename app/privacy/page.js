export default function PrivacyPage() {
  const h2Style = { fontSize:'18px', fontWeight:'700', margin:'40px 0 12px', color:'#ccc' };
  const pStyle = { fontSize:'15px', color:'#666', lineHeight:'1.75', marginBottom:'16px' };
  const liStyle = { fontSize:'15px', color:'#666', lineHeight:'1.75', marginBottom:'8px' };

  return (
    <html>
      <head>
        <title>Privacy Policy | Aegis</title>
      </head>
      <body style={{ background:'#0a0a0a', color:'#fff', fontFamily:'Inter, sans-serif', margin:0 }}>
        <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 48px', height:'68px', borderBottom:'1px solid #141414' }}>
          <a href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
            <img src="/favicon.png" width="24" height="24" alt="Aegis" />
            <span style={{ fontSize:'15px', fontWeight:'800', letterSpacing:'0.15em', textTransform:'uppercase', color:'#fff', lineHeight:1 }}>Aegis</span>
          </a>
          <a href="/" style={{ fontSize:'13px', color:'#555', textDecoration:'none' }}>← Back</a>
        </nav>
        <main style={{ maxWidth:'760px', margin:'0 auto', padding:'80px 24px' }}>
          <h1 style={{ fontSize:'40px', fontWeight:'900', letterSpacing:'-0.03em', marginBottom:'8px' }}>Privacy Policy</h1>
          <div style={{ fontSize:'14px', color:'#555', marginBottom:'24px' }}>Last updated: July 2026</div>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'16px 20px', marginBottom:'48px' }}>
            <p style={{ fontSize:'14px', color:'#888', lineHeight:'1.6', margin:0 }}>TL;DR — your data is yours. We only grab what we actually need to make Aegis work, we never sell it, and we never feed it into training AI models. That's the whole vibe. The details are below for anyone who wants them.</p>
          </div>

          <h2 style={h2Style}>1. Who's "we"?</h2>
          <p style={pStyle}>Aegis ("we", "us", "our") runs the warranty tracking app and website at ae-gis.app. Nothing fancy — just us trying to help you not lose money on broken stuff.</p>

          <h2 style={h2Style}>2. What we actually collect</h2>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Account info:</strong> just your email, basically. Sign in with Google and we only get your email and display name from their OAuth flow. Sign up the old-fashioned way and we get your name and email too. We never touch your password — that's entirely handled by Google's Firebase Authentication, so it never even passes through our hands.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Warranty data:</strong> whatever you type in — product names, brands, retailers, purchase and expiry dates, prices, serial numbers, notes, that kind of thing.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Receipt images:</strong> if you use AI receipt scanning, we briefly process the image you upload to pull out the warranty details. It sits in Vercel Blob storage just long enough to get scanned, then it's gone — we don't keep it around.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Claim chat messages:</strong> when you chat with the AI claim assistant, your messages plus the relevant warranty details (product, brand, expiry, retailer) get sent to an AI model so it can actually help you. We don't hang onto the conversation after your session ends, unless you choose to save it.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Payment info:</strong> we never see your card details, full stop. Paddle handles all of that. All we get back is transaction metadata — plan type, subscription status, billing dates.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Usage and technical data:</strong> the bare minimum needed to keep things running, like auth tokens and session IDs. No third-party analytics, no ad trackers — we're not watching you around the internet.</p>

          <h2 style={h2Style}>3. What we do with it</h2>
          <p style={pStyle}>Pretty much just this:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>Create and log you into your account;</li>
            <li style={liStyle}>Store and show you your own warranty records;</li>
            <li style={liStyle}>Send expiry reminders (only if you've turned that on);</li>
            <li style={liStyle}>Run the AI receipt scanning and claim assistant when you use them;</li>
            <li style={liStyle}>Handle your subscription and billing through Paddle;</li>
            <li style={liStyle}>Meet our legal obligations when we have to.</li>
          </ul>
          <p style={pStyle}>That's it. No ads, no behavioural profiling, no training AI models on your data. We don't sell, rent, or trade your personal info to anyone, ever.</p>

          <h2 style={h2Style}>4. Our legal basis (for UK/EEA folks)</h2>
          <p style={pStyle}>For anyone in a place where data protection law wants us to spell out our legal basis for processing, here's the breakdown:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Contract performance:</strong> to actually deliver the service you signed up for;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Legitimate interests:</strong> keeping things secure, stopping fraud, making the service more reliable;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Consent:</strong> for opt-in stuff like expiry notifications, which you can turn off whenever;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Legal obligation:</strong> when the law says we have to.</li>
          </ul>

          <h2 style={h2Style}>5. How we keep it safe</h2>
          <p style={pStyle}>Your warranty data lives in Google Firestore. Everything's encrypted in transit (TLS) and at rest (AES-256), and locked down behind strict Firebase Security Rules — only your own authenticated account can read or write your records. Receipt images sit temporarily in Vercel Blob storage, which also encrypts at rest.</p>
          <p style={pStyle}>Auth tokens are short-lived (an hour), cryptographically signed by Google, and rotate automatically. We check them on every single request. We never have access to your raw password, ever.</p>
          <p style={pStyle}>That said — nothing on the internet is 100% bulletproof. We use solid, industry-standard security practices, but we can't promise absolute security. Nobody honestly can.</p>

          <h2 style={h2Style}>6. AI features and your data</h2>
          <p style={pStyle}>AI receipt scanning and the claim assistant run through Vercel's AI Gateway. When you use them, the relevant bits (the receipt image URL, or your claim conversation plus warranty details) get sent to the AI provider to do its thing. That data isn't kept around afterward and isn't used to train anything — we specifically pick providers whose agreements guarantee zero retention and no training use.</p>

          <h2 style={h2Style}>7. Who else touches your data</h2>
          <p style={pStyle}>A short list of the third parties we rely on to make Aegis work:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Google Firebase:</strong> auth and the Firestore database (Google LLC, USA)</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Vercel:</strong> hosting, Blob storage, and the AI Gateway (Vercel Inc., USA)</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Paddle:</strong> payments and subscriptions (Paddle.com Market Limited, UK)</li>
          </ul>
          <p style={pStyle}>Each of these is bound by proper data processing agreements. Where data crosses into the USA, it's covered by the right transfer mechanisms (Standard Contractual Clauses, where they apply).</p>

          <h2 style={h2Style}>8. Cookies and local storage</h2>
          <p style={pStyle}>We use browser local storage to keep you signed in between visits — just a session token, no personal data in there. No ad cookies, no tracking pixels, no third-party analytics. And because we only use the technically essential stuff, you won't see one of those annoying cookie banners.</p>

          <h2 style={h2Style}>9. How long we keep things</h2>
          <p style={pStyle}>Your account and warranty records stick around as long as your account is active. Delete your account, and we delete your personal data within 30 days — except where the law makes us hang onto something (like payment records, which Paddle retains per financial regs). Receipt images get auto-deleted right after AI processing finishes, usually within minutes. You can delete individual warranty records yourself, anytime, right in the app.</p>

          <h2 style={h2Style}>10. Your rights</h2>
          <p style={pStyle}>Depending on where you're based, you may have some or all of these rights over your data:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Access:</strong> get a copy of what we hold on you;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Rectification:</strong> fix anything that's wrong;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Erasure:</strong> ask us to delete your data ("right to be forgotten");</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Restriction:</strong> ask us to limit how we process it in certain cases;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Portability:</strong> get your data in a machine-readable format;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Objection:</strong> object to processing based on legitimate interests;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Withdraw consent:</strong> anytime, for anything based on consent.</li>
          </ul>
          <p style={pStyle}>We'll get back to you within 30 days. You've also always got the right to complain to your local supervisory authority (in the UK, that's the Information Commissioner's Office at ico.org.uk).</p>

          <h2 style={h2Style}>11. Kids</h2>
          <p style={pStyle}>Aegis isn't meant for anyone under 16, and we don't knowingly collect data from kids under that age. If we find out a child under 16 has given us personal info, we'll delete it right away.</p>

          <h2 style={h2Style}>12. Changes to this policy</h2>
          <p style={pStyle}>We might update this policy from time to time. If we make a change that actually matters, we'll give you a heads-up by email or an in-app notice at least 14 days before it kicks in. The date up top always reflects the latest version. Keep using Aegis after a change goes live, and that counts as you being cool with it.</p>

        </main>
        <footer style={{ textAlign:'center', padding:'40px 24px', borderTop:'1px solid #141414', fontSize:'12px', color:'#333' }}>
          © 2026 Aegis. All rights reserved. · <a href="/terms" style={{ color:'#444', textDecoration:'none' }}>Terms</a> · <a href="/refunds" style={{ color:'#444', textDecoration:'none' }}>Refunds</a>
        </footer>
      </body>
    </html>
  );
}
