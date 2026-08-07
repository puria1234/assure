export default function TermsPage() {
  const h2Style = { fontSize:'18px', fontWeight:'700', margin:'40px 0 12px', color:'#ccc' };
  const pStyle = { fontSize:'15px', color:'#666', lineHeight:'1.75', marginBottom:'16px' };
  const liStyle = { fontSize:'15px', color:'#666', lineHeight:'1.75', marginBottom:'8px' };

  return (
    <html>
      <head>
        <title>Terms of Service | Aegis</title>
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
          <h1 style={{ fontSize:'40px', fontWeight:'900', letterSpacing:'-0.03em', marginBottom:'8px' }}>Terms of Service</h1>
          <div style={{ fontSize:'14px', color:'#555', marginBottom:'48px' }}>Last updated: 8/7/2026</div>

          <h2 style={h2Style}>1. Acceptance of Terms</h2>
          <p style={pStyle}>By accessing or using Aegis, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>

          <h2 style={h2Style}>2. Description of Service</h2>
          <p style={pStyle}>Aegis is a platform that helps you track product warranties, get expiry alerts, scan receipts with AI, and get AI assisted help filing warranty claims. It's a convenience tool only, not legal advice, an insurance product, or a guarantee that any given claim will succeed.</p>

          <h2 style={h2Style}>3. User Responsibilities</h2>
          <p style={pStyle}>As a user, you agree to:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>Provide accurate and truthful information</li>
            <li style={liStyle}>Keep your account credentials secure</li>
            <li style={liStyle}>Use the service only for legitimate warranty tracking purposes</li>
            <li style={liStyle}>Not attempt to gain unauthorized access to the service or other accounts</li>
            <li style={liStyle}>Not share harmful, malicious, or inappropriate content</li>
          </ul>

          <h2 style={h2Style}>4. AI Features Disclaimer</h2>
          <p style={pStyle}>AI receipt scanning and the claim assistant are convenience tools, and their output may contain errors. Nothing they produce is legal, financial, or professional advice, so double check anything important before you rely on it. A successful warranty claim is never guaranteed.</p>

          <h2 style={h2Style}>5. Subscriptions and Billing</h2>
          <p style={pStyle}>Paid plans run through Paddle, our payment processor, and renew automatically unless you cancel. Every plan starts with a 14 day free trial, and your first charge is covered by a 7 day money back guarantee, with cancellation available anytime right in the app.</p>

          <h2 style={h2Style}>6. Limitation of Liability</h2>
          <p style={pStyle}>Aegis is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service, and our total liability is capped at whichever is greater: what you paid us in the past 12 months, or $50.</p>

          <h2 style={h2Style}>7. Account Termination</h2>
          <p style={pStyle}>We reserve the right to suspend or terminate accounts that violate these terms or engage in harmful behavior. You may delete your account at any time through your profile settings.</p>

          <h2 style={h2Style}>8. Changes to Terms</h2>
          <p style={pStyle}>We may update these terms from time to time, and we'll give you at least 14 days' notice before a material change takes effect. Continued use of the service after that means you accept the new terms.</p>

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
