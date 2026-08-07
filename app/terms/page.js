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
          <div style={{ fontSize:'14px', color:'#555', marginBottom:'48px' }}>Last updated: July 2026</div>

          <h2 style={h2Style}>1. Acceptance of Terms</h2>
          <p style={pStyle}>These Terms are the agreement between you and Aegis ("we", "us", "our") for using the Aegis warranty tracking app and website (the "Service"). Creating an account means you're at least 16 and you're on board with these Terms.</p>

          <h2 style={h2Style}>2. Description of Service</h2>
          <p style={pStyle}>Aegis helps you track product warranties, get expiry alerts, scan receipts with AI, and get AI-assisted help filing warranty claims. It's a convenience tool, not legal advice, an insurance product, or a promise that any given claim will succeed.</p>

          <h2 style={h2Style}>3. Accounts and Eligibility</h2>
          <p style={pStyle}>Keep your account info accurate and your login secure — you're responsible for what happens under your account. Let us know if you spot any unauthorized use, and know that we can refuse or terminate accounts at our discretion.</p>

          <h2 style={h2Style}>4. Subscriptions and Billing</h2>
          <p style={pStyle}>Paid plans run through Paddle, our payment processor, and renew automatically unless you cancel. Every plan starts with a 14-day free trial, and your first charge is covered by a 7-day money-back guarantee — cancel anytime right in the app.</p>
          <p style={pStyle}>After that window, refunds are at our discretion, typically for things like outages or billing errors on our end. We'll always give you 30 days' notice by email before a price change kicks in.</p>

          <h2 style={h2Style}>5. Acceptable Use</h2>
          <p style={pStyle}>Basically, don't misuse Aegis — no illegal activity, hacking, reverse-engineering, malware, scraping, or impersonation, and don't use the AI features to generate harmful content. Breaking this can get your account suspended or shut down.</p>

          <h2 style={h2Style}>6. AI Features: Disclaimer and Limitations</h2>
          <p style={pStyle}>AI receipt scanning and the claim assistant are here to help, but AI can get things wrong. Nothing they produce is legal, financial, or professional advice, so double-check before you rely on it — and no, a successful claim is never guaranteed.</p>

          <h2 style={h2Style}>7. User Content</h2>
          <p style={pStyle}>Whatever you upload to Aegis is still yours. We just need a limited license to store and process it so we can run the Service, and we never use it to train AI models.</p>

          <h2 style={h2Style}>8. Intellectual Property</h2>
          <p style={pStyle}>Aegis's software, design, and branding belong to us and are protected by IP law. Nothing here gives you rights to use our name or logo.</p>

          <h2 style={h2Style}>9. Privacy</h2>
          <p style={pStyle}>How we handle your data is covered in our <a href="/privacy" style={{ color:'#888' }}>Privacy Policy</a>, which is part of these Terms.</p>

          <h2 style={h2Style}>10. Third-Party Services</h2>
          <p style={pStyle}>Aegis relies on Google, Paddle, Vercel, and AI model providers to work. We're not on the hook for their uptime or security practices.</p>

          <h2 style={h2Style}>11. Disclaimer of Warranties</h2>
          <p style={pStyle}>The Service is provided "as is," with no guarantees it'll be uninterrupted, error-free, or fully secure. You use it at your own risk.</p>

          <h2 style={h2Style}>12. Limitation of Liability</h2>
          <p style={pStyle}>To the extent the law allows, Aegis isn't liable for indirect or consequential damages from your use of the Service. Our total liability is capped at whichever is greater: what you paid us in the past 12 months, or $50.</p>

          <h2 style={h2Style}>13. Indemnification</h2>
          <p style={pStyle}>You agree to cover us for claims that come from your use of the Service, your content, or breaking these Terms or the law.</p>

          <h2 style={h2Style}>14. Termination</h2>
          <p style={pStyle}>You can delete your account whenever you want. We can also suspend or end your access at our discretion, and once that happens, your right to use the Service stops right away.</p>

          <h2 style={h2Style}>15. Governing Law and Disputes</h2>
          <p style={pStyle}>These Terms are governed by applicable law. If a dispute comes up, we'll try to work it out informally before either side takes formal action.</p>

          <h2 style={h2Style}>16. General Provisions</h2>
          <p style={pStyle}>These Terms plus our Privacy Policy are the whole agreement between you and Aegis. If one part turns out unenforceable, the rest still stands, and us not enforcing something once doesn't mean we're waiving it.</p>

          <h2 style={h2Style}>17. Changes to These Terms</h2>
          <p style={pStyle}>If we make a material change, we'll give you at least 14 days' notice before it takes effect. Sticking around after that means you're good with the update.</p>

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
