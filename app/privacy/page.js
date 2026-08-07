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
          <div style={{ fontSize:'14px', color:'#555', marginBottom:'48px' }}>Last updated: July 2026</div>

          <h2 style={h2Style}>1. Who We Are</h2>
          <p style={pStyle}>Aegis ("we", "us", "our") runs the warranty tracking app and website at ae-gis.app.</p>

          <h2 style={h2Style}>2. Information We Collect</h2>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Account info:</strong> your email, plus your name if you sign up directly. Google sign in only hands us your email and display name, and your password never touches our servers since Firebase Authentication handles that entirely.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Warranty data:</strong> whatever you enter, like product names, brands, retailers, dates, prices, serial numbers, and notes.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Receipt images:</strong> briefly processed for AI scanning, then deleted once we've pulled out the details.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Claim chat messages:</strong> sent to an AI model along with the relevant warranty details so it can help you. We don't keep the conversation after your session unless you save it.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Payment info:</strong> we never see your card details, since Paddle handles that. We just get transaction metadata like plan type and billing dates.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Usage data:</strong> the basics needed to keep things running, like auth tokens and session IDs. No third party analytics or ad trackers.</p>

          <h2 style={h2Style}>3. How We Use Your Information</h2>
          <p style={pStyle}>We use it to run your account, show you your warranty records, send expiry alerts if you've turned them on, power the AI features, handle billing through Paddle, and meet our legal obligations. That's it. No advertising, no profiling, and we never sell or rent your data.</p>

          <h2 style={h2Style}>4. Legal Basis for Processing</h2>
          <p style={pStyle}>Where data protection law requires a stated basis, we rely on contract performance (delivering the Service), legitimate interests (security and reliability), consent (optional features), and legal obligation where it applies.</p>

          <h2 style={h2Style}>5. Data Storage and Security</h2>
          <p style={pStyle}>Your data lives in Google Firestore, encrypted in transit and at rest, with access rules that only let your own account read or write your records. Auth tokens are short lived and rotate automatically, and we never see your raw password.</p>
          <p style={pStyle}>No system is 100% secure, so while we take security seriously, we can't promise it's bulletproof.</p>

          <h2 style={h2Style}>6. AI Features and Data Processing</h2>
          <p style={pStyle}>AI receipt scanning and the claim assistant run through Vercel's AI Gateway. Only what's needed to process your request gets sent to the AI provider, it isn't kept afterward, and it's never used to train anything.</p>

          <h2 style={h2Style}>7. Third Party Services</h2>
          <p style={pStyle}>We rely on a handful of providers to run Aegis: Google Firebase for authentication and our database, Vercel for hosting, storage, and the AI Gateway, and Paddle for payments and subscriptions. Each is bound by an agreement covering how they handle your data.</p>

          <h2 style={h2Style}>8. Cookies and Local Storage</h2>
          <p style={pStyle}>We use local storage just to keep you signed in between visits. No advertising cookies, tracking pixels, or analytics scripts.</p>

          <h2 style={h2Style}>9. Data Retention</h2>
          <p style={pStyle}>We keep your data while your account is active. Delete your account and we delete your personal data within 30 days, except where the law requires us to hold onto something longer; receipt images get deleted right after processing either way.</p>

          <h2 style={h2Style}>10. Your Rights</h2>
          <p style={pStyle}>You can ask to access, correct, delete, or export your data, or object to or withdraw consent for how we use it. We'll respond within 30 days, and you can always reach out to your local privacy regulator if you're not satisfied.</p>

          <h2 style={h2Style}>11. Children's Privacy</h2>
          <p style={pStyle}>Aegis isn't meant for anyone under 16, and we don't knowingly collect their data. If we find out we have, we'll delete it right away.</p>

          <h2 style={h2Style}>12. Changes to This Policy</h2>
          <p style={pStyle}>We'll give you at least 14 days' notice before any material change takes effect. Using Aegis after that means you're on board with the update.</p>

        </main>
        <footer>
          <div className="footer-text">© 2026 Aegis. All rights reserved.</div>
          <div style={{ display:'flex', gap:'24px' }}>
            <a href="/privacy" style={{ fontSize:'13px', color:'#444', textDecoration:'none' }}>Privacy</a>
            <a href="/terms" style={{ fontSize:'13px', color:'#444', textDecoration:'none' }}>Terms</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
