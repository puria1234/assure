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
            <p style={{ fontSize:'14px', color:'#888', lineHeight:'1.6', margin:0 }}>Aegis is built on the principle that your data belongs to you. We collect the minimum necessary to operate the Service, we never sell your personal information, and we never use your data to train AI models.</p>
          </div>

          <h2 style={h2Style}>1. Who We Are</h2>
          <p style={pStyle}>Aegis ("we", "us", "our") operates the warranty tracking application and website at ae-gis.app.</p>

          <h2 style={h2Style}>2. Information We Collect</h2>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Account information:</strong> When you create an account, we collect your email address. If you sign in with Google, we receive only your email address and display name from Google's OAuth service. If you register with email/password, we collect your name and email. Passwords are never handled or stored by Aegis. They are managed entirely by Google's Firebase Authentication infrastructure.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Warranty data:</strong> The product names, brands, retailers, purchase dates, expiry dates, prices, serial numbers, notes, and any other information you voluntarily enter into the Service.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Receipt images:</strong> If you use AI receipt scanning, the image you upload is temporarily processed to extract warranty fields. The image is stored in Vercel Blob storage during processing and is not retained after extraction is complete.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Claim chat messages:</strong> When you use the AI claim assistant, your messages and the relevant warranty details (product name, brand, expiry date, retailer) are sent to an AI model to generate responses. This conversation is not retained by Aegis beyond your active session unless you choose to save it.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Payment information:</strong> We do not collect or store your payment card details. All payment processing is handled directly by Paddle, our payment processor. We receive only transaction metadata (plan type, subscription status, billing dates) from Paddle.</p>
          <p style={pStyle}><strong style={{ color:'#bbb' }}>Usage and technical data:</strong> We collect minimal technical data necessary to operate the Service, such as authentication tokens and session identifiers. We do not use third-party analytics scripts or advertising trackers.</p>

          <h2 style={h2Style}>3. How We Use Your Information</h2>
          <p style={pStyle}>We use your information solely to:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>Create and authenticate your account;</li>
            <li style={liStyle}>Store and display your warranty records to you;</li>
            <li style={liStyle}>Send expiry alert notifications (only if you enable this feature);</li>
            <li style={liStyle}>Process AI receipt scanning and claim assistant requests;</li>
            <li style={liStyle}>Manage your subscription and billing through Paddle;</li>
            <li style={liStyle}>Comply with our legal obligations.</li>
          </ul>
          <p style={pStyle}>We do not use your data for advertising, behavioural profiling, or to train AI models. We do not sell, rent, or trade your personal information to any third party for any purpose.</p>

          <h2 style={h2Style}>4. Legal Basis for Processing (UK/EEA Users)</h2>
          <p style={pStyle}>Where applicable data protection law requires a legal basis for processing, we rely on the following:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Contract performance:</strong> to provide the Service you have signed up for;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Legitimate interests:</strong> to maintain security, prevent fraud, and improve service reliability;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Consent:</strong> for optional features such as expiry notifications, which you can withdraw at any time;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Legal obligation:</strong> where required by law.</li>
          </ul>

          <h2 style={h2Style}>5. Data Storage and Security</h2>
          <p style={pStyle}>Your warranty data is stored in Google Firestore, a Google-operated cloud database. All data is encrypted in transit using TLS and encrypted at rest using AES-256. Access is governed by strict Firebase Security Rules. Only your authenticated account can read or write your records. Receipt images are stored temporarily in Vercel Blob storage, which provides server-side encryption at rest.</p>
          <p style={pStyle}>Authentication tokens are short-lived (1-hour validity), cryptographically signed by Google's identity infrastructure, and automatically rotated. Aegis servers verify these tokens on every request. We never have access to your raw password at any point.</p>
          <p style={pStyle}>While we implement industry-standard security measures, no method of internet transmission or electronic storage is 100% secure. We cannot guarantee absolute security.</p>

          <h2 style={h2Style}>6. AI Features and Data Processing</h2>
          <p style={pStyle}>AI receipt scanning and the claim assistant are powered via Vercel's AI Gateway using language models. When you use these features, the relevant data (receipt image URL or claim conversation context plus warranty details) is transmitted to the AI provider for processing. This data is not retained by the AI provider beyond the immediate request and is not used to train AI models. We select AI providers whose data processing agreements include zero data retention and no training-use provisions.</p>

          <h2 style={h2Style}>7. Third-Party Services</h2>
          <p style={pStyle}>Aegis relies on the following third-party sub-processors:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Google Firebase:</strong> authentication and Firestore database (Google LLC, USA)</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Vercel:</strong> hosting, Blob storage, and AI Gateway (Vercel Inc., USA)</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Paddle:</strong> payment processing and subscription management (Paddle.com Market Limited, UK)</li>
          </ul>
          <p style={pStyle}>Each sub-processor is subject to contractual data processing agreements. Data transfers to the USA are covered by appropriate transfer mechanisms (Standard Contractual Clauses where applicable).</p>

          <h2 style={h2Style}>8. Cookies and Local Storage</h2>
          <p style={pStyle}>Aegis uses browser local storage to persist your authentication session between visits. This stores only a session token and contains no personal data. We do not use advertising cookies, tracking pixels, or third-party analytics scripts. No cookie consent banner is necessary because we only use technically essential storage.</p>

          <h2 style={h2Style}>9. Data Retention</h2>
          <p style={pStyle}>Your account data and warranty records are retained for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law (e.g. payment records which Paddle retains per applicable financial regulations). Receipt images are automatically deleted after AI processing is complete, typically within minutes. You may delete individual warranty records at any time within the app.</p>

          <h2 style={h2Style}>10. Your Rights</h2>
          <p style={pStyle}>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Access:</strong> request a copy of the personal data we hold about you;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Rectification:</strong> correct inaccurate data;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Erasure:</strong> request deletion of your data ("right to be forgotten");</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Restriction:</strong> request that we limit processing in certain circumstances;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Portability:</strong> receive your data in a machine-readable format;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Objection:</strong> object to processing based on legitimate interests;</li>
            <li style={liStyle}><strong style={{ color:'#bbb' }}>Withdraw consent:</strong> at any time for processing based on consent.</li>
          </ul>
          <p style={pStyle}>We will respond within 30 days. You also have the right to lodge a complaint with your local supervisory authority (in the UK, the Information Commissioner's Office at ico.org.uk).</p>

          <h2 style={h2Style}>11. Children's Privacy</h2>
          <p style={pStyle}>Aegis is not directed at children under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that a child under 16 has provided personal information, we will delete it promptly.</p>

          <h2 style={h2Style}>12. Changes to This Policy</h2>
          <p style={pStyle}>We may update this Privacy Policy periodically. If we make material changes, we will notify you by email or via a notice within the Service at least 14 days before the changes take effect. The date at the top of this page reflects the most recent revision. Your continued use of the Service after changes take effect constitutes your acceptance of the updated Policy.</p>

        </main>
        <footer style={{ textAlign:'center', padding:'40px 24px', borderTop:'1px solid #141414', fontSize:'12px', color:'#333' }}>
          © 2026 Aegis. All rights reserved. · <a href="/terms" style={{ color:'#444', textDecoration:'none' }}>Terms</a> · <a href="/refunds" style={{ color:'#444', textDecoration:'none' }}>Refunds</a>
        </footer>
      </body>
    </html>
  );
}
