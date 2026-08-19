export default function TermsPage() {
  const h2Style = { fontSize:'18px', fontWeight:'700', margin:'40px 0 12px', color:'#ccc' };
  const pStyle = { fontSize:'15px', color:'#666', lineHeight:'1.75', marginBottom:'16px' };
  const liStyle = { fontSize:'15px', color:'#666', lineHeight:'1.75', marginBottom:'8px' };

  return (
    <html>
      <head>
        <title>Terms of Service | Assure</title>
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
          <h1 style={{ fontSize:'40px', fontWeight:'900', letterSpacing:'-0.03em', marginBottom:'8px' }}>Terms of Service</h1>
          <div style={{ fontSize:'14px', color:'#555', marginBottom:'48px' }}>Last updated: 8/18/2026</div>

          <h2 style={h2Style}>1. Acceptance of these terms</h2>
          <p style={pStyle}>By creating an account or using Assure, you agree to these Terms. If you don't agree, please don't use the service. If you're using Assure on behalf of an organisation, you're confirming you have authority to accept these Terms for it.</p>

          <h2 style={h2Style}>2. Description of the service</h2>
          <p style={pStyle}>Assure is a record keeping tool. You enter the products you own and their warranty periods, and we store that information, show you what is still in coverage, and remind you before it runs out. We also offer AI features that read receipt images and help you think through a claim.</p>
          <p style={pStyle}>We are not a party to any warranty between you and a manufacturer or retailer, and we do not file or pursue claims on your behalf. Whether a claim succeeds is between you and whoever issued the warranty.</p>

          <h2 style={h2Style}>3. Eligibility and your account</h2>
          <p style={pStyle}>You must be at least 16 to use Assure. You're responsible for keeping your login credentials secure and for everything that happens under your account. Tell us promptly if you believe someone else has gained access to it.</p>

          <h2 style={h2Style}>4. Acceptable use</h2>
          <p style={pStyle}>You agree not to:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>Upload content you don't have the right to upload, or anything unlawful or malicious</li>
            <li style={liStyle}>Attempt to access another user's account or data</li>
            <li style={liStyle}>Probe, scrape, overload, or interfere with the service or the infrastructure behind it</li>
            <li style={liStyle}>Reverse engineer the service, except where that restriction is unenforceable by law</li>
            <li style={liStyle}>Resell or redistribute the service without our written permission</li>
          </ul>

          <h2 style={h2Style}>5. Your content stays yours</h2>
          <p style={pStyle}>You keep all rights to the warranty records, receipt images, and messages you put into Assure. You grant us only the narrow licence we need to actually run the service for you: to store your content, display it back to you, and pass it to the processors described in our <a href="/privacy" style={{ color:'#999' }}>Privacy Policy</a> so features like receipt scanning can work. We don't use your content to train AI models, and we don't sell it.</p>

          <h2 style={h2Style}>6. AI features come with limits</h2>
          <p style={pStyle}>Receipt scanning and the claim assistant are conveniences, not authorities. They are built on language models that make mistakes, misread images, and state wrong things confidently. Nothing either feature produces is legal, financial, or professional advice. Check anything that matters against the original receipt or warranty document before relying on it.</p>

          <h2 style={h2Style}>7. Plans and billing</h2>
          <p style={pStyle}>Assure is currently free to use, within the usage limits shown on our pricing page. Paid plans are not yet available and no payment method is collected. If we introduce paid plans, we'll publish the pricing and terms before they take effect, and moving to a paid plan will always be something you actively choose.</p>

          <h2 style={h2Style}>8. Availability and changes to the service</h2>
          <p style={pStyle}>We may add, change, or remove features, and the service may be unavailable at times for maintenance or reasons outside our control. We don't guarantee uninterrupted access. Assure is not a backup service, so please keep your own copies of receipts and documents that matter to you.</p>

          <h2 style={h2Style}>9. Ending your use of Assure</h2>
          <p style={pStyle}>You can stop using Assure at any time and ask us to delete your account and the data attached to it. We may suspend or close an account that breaches these Terms or puts the service or other users at risk. Where it's reasonable to do so, we'll give notice first.</p>

          <h2 style={h2Style}>10. Disclaimers and limitation of liability</h2>
          <p style={pStyle}>Assure is provided "as is" and "as available", without warranties of any kind, to the fullest extent the law allows. In particular, we do not warrant that warranty information stored in the service is accurate or complete, since most of it comes from you or from AI reading your receipts.</p>
          <p style={pStyle}>To the extent permitted by law, we are not liable for indirect or consequential losses, and that expressly includes the value of a warranty claim you missed, were denied, or couldn't pursue. Our total liability to you is capped at the greater of what you paid us in the previous 12 months or $50. Nothing here limits liability that can't be limited by law.</p>

          <h2 style={h2Style}>11. Governing law</h2>
          <p style={pStyle}>These Terms are governed by the laws of the State of California and the laws of the United States that apply there, without regard to conflict of law rules. You agree that the state and federal courts located in California have exclusive jurisdiction over any dispute arising from these Terms or your use of Assure.</p>

          <h2 style={h2Style}>12. Changes to these Terms</h2>
          <p style={pStyle}>We may update these Terms. If a change is material, we'll give you at least 14 days' notice by posting the updated Terms here with a new date, and continuing to use Assure after that means you accept them.</p>


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
