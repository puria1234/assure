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
          <div style={{ fontSize:'14px', color:'#555', marginBottom:'48px' }}>Last updated: 8/18/2026</div>

          <h2 style={h2Style}>1. What we collect</h2>
          <p style={pStyle}>We only collect what the service needs to work:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>Your name and email address, from when you register or sign in with Google</li>
            <li style={liStyle}>Warranty details you enter, such as product names, brands, retailers, dates, prices, and serial numbers</li>
            <li style={liStyle}>Receipt images you upload for AI scanning</li>
            <li style={liStyle}>Messages you send to the AI claim assistant</li>
            <li style={liStyle}>Basic account settings, such as your notification preferences</li>
          </ul>
          <p style={pStyle}>We never see or store your password. Sign in is handled by Neon Auth, which stores only a hashed form of it.</p>

          <h2 style={h2Style}>2. How we use it</h2>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>To create and run your account</li>
            <li style={liStyle}>To store your warranty records and show them back to you</li>
            <li style={liStyle}>To send expiry alerts, if you turn them on</li>
            <li style={liStyle}>To power AI receipt scanning and the claim assistant</li>
            <li style={liStyle}>To keep the service working, secure, and free of abuse</li>
          </ul>
          <p style={pStyle}>We do not use your data for advertising, and we do not build profiles of you.</p>

          <h2 style={h2Style}>3. Where your data is stored</h2>
          <p style={pStyle}>We do not sell or rent your personal information, and we never share it with other users. Your account and your warranty records live in a Neon Postgres database, so the day to day safety of your data rests on infrastructure Neon secures and audits rather than on servers we maintain ourselves.</p>
          <p style={pStyle}>Measures that apply to data held there include:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Encryption at rest:</strong> stored data and its backups are encrypted on disk</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Encryption in transit:</strong> every connection between the application and the database is made over TLS, and so is the traffic between you and the application</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Isolated storage per project:</strong> the database is dedicated to Assure rather than shared with other customers' data</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Credentials never held in the clear:</strong> passwords are hashed by the authentication service, so neither we nor it can read them</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Scoped queries:</strong> every read and write is filtered by your own account id, so one account cannot reach another's records</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Independent auditing:</strong> the platform is assessed against recognised standards such as SOC 2 by outside auditors</li>
          </ul>
          <p style={pStyle}>We may also disclose information where the law requires it, or where it is necessary to protect the service, our rights, or someone's safety.</p>

          <h2 style={h2Style}>4. How AI features handle your data</h2>
          <p style={pStyle}>When you scan a receipt, the image is sent to an external AI provider to be read. When you use the claim assistant, your messages and the warranty details relevant to that claim are sent the same way. This happens only when you actively use those features, and it is the only time your content leaves our own storage.</p>
          <p style={pStyle}>We do not use your content to train AI models, and we do not permit our providers to train on it either.</p>

          <h2 style={h2Style}>5. Security</h2>
          <p style={pStyle}>The measures we rely on:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Encryption in transit:</strong> traffic between your device and our services is protected with TLS</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Encryption at rest:</strong> the database and uploaded receipt images are encrypted on disk by the platforms that host them</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Account scoped access:</strong> the database is never reachable from your browser. Every read and write goes through our server, which filters it by your own account id, so one account cannot reach another's records</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Private receipt storage:</strong> uploaded receipt images are stored privately and served only to you through an authenticated route</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Signed session cookies:</strong> sessions are held in signed, expiring cookies rather than credentials stored in your browser</li>
          </ul>
          <p style={pStyle}>No service can promise perfect security, and we will not pretend otherwise. We keep our practices under review and will tell you promptly if a breach affects your data.</p>

          <h2 style={h2Style}>6. How long we keep it</h2>
          <p style={pStyle}>Your warranty records and receipt images stay until you delete them or ask us to close your account, at which point we remove them from our active systems. Residual copies may persist briefly in provider backups before being overwritten.</p>

          <h2 style={h2Style}>7. Your rights</h2>
          <p style={pStyle}>You can:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>See and correct the information held about you</li>
            <li style={liStyle}>Delete individual warranty records at any time from within the app</li>
            <li style={liStyle}>Ask us to delete your account and everything attached to it</li>
            <li style={liStyle}>Ask for a copy of your data</li>
            <li style={liStyle}>Turn expiry notifications off at any time</li>
          </ul>
          <p style={pStyle}>Depending on where you live, you may have further rights under laws such as the GDPR or the CCPA, including the right to object to processing or to complain to your local data protection authority.</p>

          <h2 style={h2Style}>8. Changes to this policy</h2>
          <p style={pStyle}>We will post any update here with a new date, and we will give at least 14 days' notice before a material change takes effect.</p>

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
