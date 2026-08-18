export default function PrivacyPage() {
  const h2Style = { fontSize:'18px', fontWeight:'700', margin:'40px 0 12px', color:'#ccc' };
  const pStyle = { fontSize:'15px', color:'#666', lineHeight:'1.75', marginBottom:'16px' };
  const liStyle = { fontSize:'15px', color:'#666', lineHeight:'1.75', marginBottom:'8px' };

  return (
    <html>
      <head>
        <title>Privacy Policy | Assure</title>
      </head>
      <body style={{ background:'#0a0a0a', color:'#fff', fontFamily:'Inter, sans-serif', margin:0 }}>
        <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 48px', height:'68px', borderBottom:'1px solid #141414' }}>
          <a href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
            <img src="/favicon.png" width="24" height="24" alt="Assure" />
            <span style={{ fontSize:'15px', fontWeight:'800', letterSpacing:'0.15em', textTransform:'uppercase', color:'#fff', lineHeight:1 }}>Assure</span>
          </a>
          <a href="/" style={{ fontSize:'13px', color:'#555', textDecoration:'none' }}>← Back</a>
        </nav>
        <main style={{ maxWidth:'760px', margin:'0 auto', padding:'80px 24px' }}>
          <h1 style={{ fontSize:'40px', fontWeight:'900', letterSpacing:'-0.03em', marginBottom:'8px' }}>Privacy Policy</h1>
          <div style={{ fontSize:'14px', color:'#555', marginBottom:'48px' }}>Last updated: 8/7/2026</div>

          <h2 style={h2Style}>1. Information We Collect</h2>
          <p style={pStyle}>We collect information you provide directly to us, including:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>Name and email address</li>
            <li style={liStyle}>Warranty details you enter, like product names, brands, retailers, dates, prices, and serial numbers</li>
            <li style={liStyle}>Receipt images, when you use AI scanning</li>
            <li style={liStyle}>Claim chat messages, when you use the AI claim assistant</li>
            <li style={liStyle}>Payment and subscription details, handled by Paddle</li>
          </ul>

          <h2 style={h2Style}>2. How We Use Your Information</h2>
          <p style={pStyle}>We use the information we collect to:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>Create and run your account</li>
            <li style={liStyle}>Store and display your warranty records</li>
            <li style={liStyle}>Send expiry alerts, if you've turned them on</li>
            <li style={liStyle}>Power AI receipt scanning and the claim assistant</li>
            <li style={liStyle}>Manage your subscription and billing</li>
            <li style={liStyle}>Improve and maintain our service</li>
          </ul>

          <h2 style={h2Style}>3. Information Sharing</h2>
          <p style={pStyle}>We do not sell your personal information. Your data is only used to provide the service to you and is never shared with other users or third parties, aside from the providers listed below who help us run Assure.</p>

          <h2 style={h2Style}>4. Data Security</h2>
          <p style={pStyle}>We take the security of your data seriously and implement industry standard security measures:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Encryption in transit (TLS):</strong> all data sent between your device and our servers is encrypted using Transport Layer Security</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Encryption at rest (AES 256):</strong> all data stored in our database is encrypted using AES 256 encryption</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Secure infrastructure:</strong> we use Google Firestore and Vercel, both enterprise grade platforms with built in security features</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Access controls:</strong> your data is isolated and protected so only your own authenticated account can read or write it</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Short lived tokens:</strong> authentication tokens rotate automatically, and we never see your raw password</li>
          </ul>
          <p style={pStyle}>While we implement robust security measures, no method of transmission over the internet or electronic storage is 100% secure. We continuously monitor and update our security practices.</p>

          <h2 style={h2Style}>5. Your Rights</h2>
          <p style={pStyle}>You have the right to:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>Access your personal data</li>
            <li style={liStyle}>Update or correct your information</li>
            <li style={liStyle}>Delete your account and associated data</li>
            <li style={liStyle}>Export your data</li>
            <li style={liStyle}>Opt out of notifications</li>
          </ul>

          <h2 style={h2Style}>6. Children's Privacy</h2>
          <p style={pStyle}>Assure isn't meant for anyone under 16, and we don't knowingly collect their data. If we find out we have, we'll delete it right away.</p>

          <h2 style={h2Style}>7. Changes to This Policy</h2>
          <p style={pStyle}>We'll give you at least 14 days' notice before any material change takes effect. Using Assure after that means you're on board with the update.</p>

        </main>
        <footer>
          <div className="footer-text">© 2026 Assure. All rights reserved.</div>
          <div style={{ display:'flex', gap:'24px' }}>
            <a href="/privacy" style={{ fontSize:'13px', color:'#444', textDecoration:'none' }}>Privacy</a>
            <a href="/terms" style={{ fontSize:'13px', color:'#444', textDecoration:'none' }}>Terms</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
