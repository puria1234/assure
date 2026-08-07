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
            <p style={{ fontSize:'14px', color:'#888', lineHeight:'1.6', margin:0 }}>Aegis collects only what's needed to run the Service. We never sell your data or use it to train AI models.</p>
          </div>

          <h2 style={h2Style}>1. Who We Are</h2>
          <p style={pStyle}>Aegis ("we", "us", "our") operates the warranty tracking application and website at ae-gis.app.</p>

          <h2 style={h2Style}>2. Information We Collect</h2>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Account information:</strong> your email address, plus your name if you register directly. Google sign-in only shares your email and display name. Passwords are handled entirely by Firebase Authentication and never reach us.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Warranty data:</strong> product names, brands, retailers, dates, prices, serial numbers, and notes you enter.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Receipt images:</strong> temporarily processed for AI scanning, then deleted once extraction is complete.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Claim chat messages:</strong> sent to an AI model along with relevant warranty details to generate a response. Not retained beyond your session unless you save it.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Payment information:</strong> handled entirely by Paddle. We only receive transaction metadata like plan type and billing dates.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Usage data:</strong> minimal technical data such as auth tokens and session identifiers. No third-party analytics or ad trackers.</p>

          <h2 style={h2Style}>3. How We Use Your Information</h2>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>Create and authenticate your account;</li>
            <li style={liStyle}>Store and display your warranty records;</li>
            <li style={liStyle}>Send expiry alerts, if enabled;</li>
            <li style={liStyle}>Run AI receipt scanning and the claim assistant;</li>
            <li style={liStyle}>Manage billing through Paddle;</li>
            <li style={liStyle}>Meet legal obligations.</li>
          </ul>
          <p style={pStyle}>We don't use your data for advertising or profiling, and we never sell or rent it to third parties.</p>

          <h2 style={h2Style}>4. Legal Basis for Processing</h2>
          <p style={pStyle}>Where required by data protection law, we rely on contract performance (to provide the Service), legitimate interests (security and reliability), consent (optional features like notifications), and legal obligation where applicable.</p>

          <h2 style={h2Style}>5. Data Storage and Security</h2>
          <p style={pStyle}>Your data is stored in Google Firestore, encrypted in transit and at rest, and protected by strict access rules so only your account can read or write your records. Auth tokens are short-lived and automatically rotated; we never see your raw password.</p>
          <p style={pStyle}>No method of transmission or storage is 100% secure, so we can't guarantee absolute security.</p>

          <h2 style={h2Style}>6. AI Features and Data Processing</h2>
          <p style={pStyle}>AI receipt scanning and the claim assistant run through Vercel's AI Gateway. Relevant data is sent to the AI provider only to process your request, is not retained afterward, and is never used for training.</p>

          <h2 style={h2Style}>7. Third-Party Services</h2>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Google Firebase:</strong> authentication and database</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Vercel:</strong> hosting, storage, and AI Gateway</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Paddle:</strong> payments and subscriptions</li>
          </ul>
          <p style={pStyle}>Each is bound by a data processing agreement covering how they handle your information.</p>

          <h2 style={h2Style}>8. Cookies and Local Storage</h2>
          <p style={pStyle}>We use local storage only to keep you signed in between visits. No advertising cookies, tracking pixels, or analytics scripts are used.</p>

          <h2 style={h2Style}>9. Data Retention</h2>
          <p style={pStyle}>Your data is retained while your account is active. If you delete your account, we delete your personal data within 30 days, except where retention is legally required. Receipt images are deleted automatically after processing.</p>

          <h2 style={h2Style}>10. Your Rights</h2>
          <p style={pStyle}>Depending on your jurisdiction, you may have rights to access, correct, delete, restrict, or port your data, and to object to or withdraw consent for processing.</p>
          <p style={pStyle}>We respond to requests within 30 days. You also have the right to lodge a complaint with your local data protection authority.</p>

          <h2 style={h2Style}>11. Children's Privacy</h2>
          <p style={pStyle}>Aegis is not directed at children under 16, and we do not knowingly collect their data. If we learn we've collected data from a child under 16, we'll delete it promptly.</p>

          <h2 style={h2Style}>12. Changes to This Policy</h2>
          <p style={pStyle}>We'll notify you of material changes at least 14 days before they take effect. Continued use of the Service after that constitutes acceptance of the updated policy.</p>

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
