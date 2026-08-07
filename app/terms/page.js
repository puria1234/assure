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
          <div style={{ fontSize:'14px', color:'#555', marginBottom:'24px' }}>Last updated: July 2026</div>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'16px 20px', marginBottom:'48px' }}>
            <p style={{ fontSize:'14px', color:'#888', lineHeight:'1.6', margin:0 }}>
              <strong style={{ color:'#ccc' }}>Please read these Terms carefully.</strong> By creating an account or using Aegis in any way, you agree to be bound by these Terms of Service and our <a href="/privacy" style={{ color:'#aaa' }}>Privacy Policy</a>. If you do not agree, do not access or use Aegis.
            </p>
          </div>

          <h2 style={h2Style}>1. Acceptance of Terms</h2>
          <p style={pStyle}>These Terms form a binding agreement between you and Aegis ("we", "us", "our") governing your use of the Aegis warranty tracking application and website (the "Service"). By creating an account or otherwise using the Service, you confirm you're at least 16 years old and agree to be bound by these Terms.</p>

          <h2 style={h2Style}>2. Description of Service</h2>
          <p style={pStyle}>Aegis helps you track product warranties, receive expiry alerts, scan receipts with AI, and get AI-assisted guidance on filing warranty claims. It's a convenience tool only — it does not constitute legal advice, an insurance product, or a guarantee of any claim outcome.</p>

          <h2 style={h2Style}>3. Accounts and Eligibility</h2>
          <p style={pStyle}>You must provide accurate information when creating an account and are responsible for activity under it. Notify us of any unauthorised use, and note that we may refuse registration or terminate accounts at our discretion.</p>

          <h2 style={h2Style}>4. Subscriptions and Billing</h2>
          <p style={pStyle}>Paid plans are billed through Paddle, our payment processor, on a recurring basis and renew automatically unless cancelled. Every plan starts with a 14-day free trial, and your first charge after that is covered by a 7-day money-back guarantee — cancel anytime from within the app.</p>
          <p style={pStyle}>Outside that window, refunds are discretionary and may be granted for service outages, billing errors, or similar exceptional circumstances. We'll give 30 days' notice by email before any pricing change takes effect.</p>

          <h2 style={h2Style}>5. Acceptable Use</h2>
          <p style={pStyle}>You agree not to misuse the Service — no unlawful activity, unauthorised access, reverse-engineering, malware, scraping, impersonation, or harmful AI-generated content. Violating this may result in immediate account suspension or termination.</p>

          <h2 style={h2Style}>6. AI Features: Disclaimer and Limitations</h2>
          <p style={pStyle}>AI receipt scanning and the claim assistant are convenience tools, and their outputs may contain errors. They don't constitute legal, financial, or professional advice, and you're responsible for verifying anything before relying on it — a successful claim is never guaranteed.</p>

          <h2 style={h2Style}>7. User Content</h2>
          <p style={pStyle}>You retain ownership of the data you upload to Aegis. You grant us a limited licence to store and process it solely to provide the Service, and we never use it to train AI models.</p>

          <h2 style={h2Style}>8. Intellectual Property</h2>
          <p style={pStyle}>The Service itself — its software, design, and branding — is owned by Aegis and protected by applicable IP law. Nothing here grants you rights to our trademarks or branding.</p>

          <h2 style={h2Style}>9. Privacy</h2>
          <p style={pStyle}>Our handling of your personal data is governed by our <a href="/privacy" style={{ color:'#888' }}>Privacy Policy</a>, incorporated into these Terms by reference.</p>

          <h2 style={h2Style}>10. Third-Party Services</h2>
          <p style={pStyle}>The Service integrates with Google, Paddle, Vercel, and AI model providers. We aren't responsible for the availability or security practices of these third parties.</p>

          <h2 style={h2Style}>11. Disclaimer of Warranties</h2>
          <p style={pStyle}>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DON'T GUARANTEE IT WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. YOUR USE OF THE SERVICE IS AT YOUR OWN RISK.</p>

          <h2 style={h2Style}>12. Limitation of Liability</h2>
          <p style={pStyle}>TO THE MAXIMUM EXTENT PERMITTED BY LAW, AEGIS IS NOT LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY WILL NOT EXCEED THE GREATER OF WHAT YOU PAID US IN THE PRECEDING 12 MONTHS OR £50.</p>

          <h2 style={h2Style}>13. Indemnification</h2>
          <p style={pStyle}>You agree to indemnify Aegis against claims arising from your use of the Service, your content, or your violation of these Terms or applicable law.</p>

          <h2 style={h2Style}>14. Termination</h2>
          <p style={pStyle}>You can delete your account anytime. We may suspend or terminate your access at our discretion, including for violations of these Terms, and your right to use the Service ends immediately upon termination.</p>

          <h2 style={h2Style}>15. Governing Law and Disputes</h2>
          <p style={pStyle}>These Terms are governed by applicable law. Any dispute will first go through informal negotiation before either party pursues formal proceedings.</p>

          <h2 style={h2Style}>16. General Provisions</h2>
          <p style={pStyle}>These Terms, together with our Privacy Policy, form the entire agreement between you and Aegis. If any provision is unenforceable, the rest remain in effect, and our failure to enforce a provision isn't a waiver of it.</p>

          <h2 style={h2Style}>17. Changes to These Terms</h2>
          <p style={pStyle}>We may update these Terms and will notify you of material changes at least 14 days before they take effect. Continued use of the Service after that constitutes acceptance of the updated Terms.</p>

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
