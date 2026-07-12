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
          <p style={pStyle}>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you") and Aegis ("Aegis", "we", "us", "our") governing your access to and use of the Aegis warranty tracking application, website, and all associated services (collectively, the "Service"). By registering an account, clicking "Create Account", continuing with a third-party authentication provider, or otherwise accessing the Service, you confirm that you are at least 16 years of age, have read and understood these Terms, and agree to be bound by them. If you are using the Service on behalf of a company or organisation, you represent that you have the authority to bind that entity to these Terms.</p>

          <h2 style={h2Style}>2. Description of Service</h2>
          <p style={pStyle}>Aegis is a personal warranty management tool that allows users to track product warranties, receive expiry alerts, scan receipts using AI, and receive AI-assisted guidance for filing warranty claims. The Service is intended for personal and household use. Aegis is a tracking and convenience tool only and does not constitute legal advice, an insurance product, or a guarantee of any warranty claim outcome.</p>

          <h2 style={h2Style}>3. Accounts and Eligibility</h2>
          <p style={pStyle}>To use the Service you must create an account by providing accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately via our <a href="/support" style={{ color:'#888' }}>support form</a> of any unauthorised use. We reserve the right to refuse registration or terminate accounts at our discretion. You may not create an account if you have previously been suspended or removed from the Service.</p>

          <h2 style={h2Style}>4. Subscriptions and Billing</h2>
          <p style={pStyle}>Certain features of Aegis require a paid subscription ("Paid Plan"). By subscribing, you authorise Aegis to charge the applicable fees through our payment processor, Paddle (paddle.com), on a recurring basis according to the plan you select. All fees are exclusive of any applicable taxes, which may be added at checkout. Paddle acts as the Merchant of Record for all transactions; payments are subject to Paddle's terms of service in addition to these Terms.</p>
          <p style={pStyle}>Your subscription renews automatically at the end of each billing period unless you cancel before the renewal date. All subscriptions begin with a 14-day free trial. You will not be charged during the trial. After the trial, you are subject to a 7-day money-back guarantee on your first charge. See our <a href="/refunds" style={{ color:'#888' }}>Refund Policy</a> for full details. We reserve the right to change pricing with 30 days' notice to your registered email address.</p>

          <h2 style={h2Style}>5. Acceptable Use</h2>
          <p style={pStyle}>You agree not to:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>Use the Service for any unlawful purpose or in violation of any applicable law or regulation;</li>
            <li style={liStyle}>Attempt to gain unauthorised access to any part of the Service, other user accounts, or Aegis's infrastructure;</li>
            <li style={liStyle}>Reverse-engineer, decompile, disassemble, or create derivative works from the Service;</li>
            <li style={liStyle}>Transmit any malware, viruses, or malicious code through the Service;</li>
            <li style={liStyle}>Use the AI features to generate content that is defamatory, harassing, or otherwise harmful;</li>
            <li style={liStyle}>Scrape, crawl, or data-mine the Service by automated means;</li>
            <li style={liStyle}>Misrepresent your identity or affiliation with any person or entity;</li>
            <li style={liStyle}>Use the Service in any manner that could damage, disable, or impair the Service or interfere with any other party's use of it.</li>
          </ul>
          <p style={pStyle}>We reserve the right to suspend or terminate your account immediately and without notice for any violation of this section.</p>

          <h2 style={h2Style}>6. AI Features: Disclaimer and Limitations</h2>
          <p style={pStyle}>Aegis provides AI-powered receipt scanning and a warranty claim assistant (collectively, "AI Features"). These features are provided as convenience tools to assist you in organising and understanding your warranty coverage. AI-generated outputs (including extracted receipt data, claim letters, and suggested next steps) may contain errors, inaccuracies, or omissions. You acknowledge and agree that:</p>
          <ul style={{ paddingLeft:'24px', marginBottom:'16px' }}>
            <li style={liStyle}>AI outputs do not constitute legal, financial, or professional advice of any kind;</li>
            <li style={liStyle}>You are solely responsible for verifying the accuracy of all AI-generated information before relying on it or sharing it with third parties;</li>
            <li style={liStyle}>Aegis makes no representation or warranty regarding the accuracy, completeness, or fitness for purpose of any AI-generated content;</li>
            <li style={liStyle}>A successful warranty claim is not guaranteed by use of the AI Features.</li>
          </ul>

          <h2 style={h2Style}>7. User Content</h2>
          <p style={pStyle}>You retain all ownership rights in the data you upload to Aegis (warranty records, receipt images, notes, etc.) ("User Content"). By uploading User Content, you grant Aegis a limited, non-exclusive, royalty-free licence to store, process, and display your User Content solely for the purpose of providing the Service to you. We do not claim any ownership of your User Content and do not use it for training AI models. You represent that you have all necessary rights to upload and use any content you submit.</p>

          <h2 style={h2Style}>8. Intellectual Property</h2>
          <p style={pStyle}>The Service, including its software, design, branding, trademarks, and content (excluding User Content), is owned by Aegis and protected by applicable intellectual property laws. Nothing in these Terms grants you any right to use Aegis's trademarks, logos, or branding without our prior written consent. Feedback or suggestions you provide about the Service may be used by us without any obligation to you.</p>

          <h2 style={h2Style}>9. Privacy</h2>
          <p style={pStyle}>Our collection, use, and storage of your personal data is governed by our <a href="/privacy" style={{ color:'#888' }}>Privacy Policy</a>, which is incorporated into these Terms by reference. By using the Service, you consent to data practices described in the Privacy Policy.</p>

          <h2 style={h2Style}>10. Third-Party Services</h2>
          <p style={pStyle}>The Service integrates with third-party platforms including Google (authentication and database), Paddle (payments), Vercel (hosting and storage), and AI model providers. Your use of these integrations may be subject to the respective third-party terms of service. Aegis is not responsible for the availability, accuracy, or security practices of any third-party service.</p>

          <h2 style={h2Style}>11. Disclaimer of Warranties</h2>
          <p style={pStyle}>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. AEGIS DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. YOUR USE OF THE SERVICE IS ENTIRELY AT YOUR OWN RISK.</p>

          <h2 style={h2Style}>12. Limitation of Liability</h2>
          <p style={pStyle}>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AEGIS AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, MISSED WARRANTY CLAIMS, OR BUSINESS INTERRUPTION, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF AEGIS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL AEGIS'S TOTAL AGGREGATE LIABILITY TO YOU EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO AEGIS IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) £50.</p>

          <h2 style={h2Style}>13. Indemnification</h2>
          <p style={pStyle}>You agree to defend, indemnify, and hold harmless Aegis and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with: (a) your access to or use of the Service; (b) your User Content; (c) your violation of these Terms; or (d) your violation of any applicable law or the rights of any third party.</p>

          <h2 style={h2Style}>14. Termination</h2>
          <p style={pStyle}>You may stop using the Service and delete your account at any time. We reserve the right to suspend or terminate your access to the Service at any time, with or without cause or notice, including if we reasonably believe you have violated these Terms. Upon termination, your right to use the Service ceases immediately. Provisions of these Terms that by their nature should survive termination shall survive, including Sections 6, 8, 11, 12, 13, 15, and 16.</p>

          <h2 style={h2Style}>15. Governing Law and Dispute Resolution</h2>
          <p style={pStyle}>These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to conflict-of-law principles. Any dispute arising out of or in connection with these Terms or the Service shall first be submitted to informal negotiation by submitting a <a href="/support" style={{ color:'#888' }}>support request</a>. If not resolved within 30 days, either party may bring proceedings in the courts of England and Wales, to whose exclusive jurisdiction both parties irrevocably submit.</p>

          <h2 style={h2Style}>16. General Provisions</h2>
          <p style={pStyle}>These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between you and Aegis regarding the Service and supersede all prior agreements. If any provision is found unenforceable, the remaining provisions will remain in full force. Our failure to enforce any provision shall not be deemed a waiver. You may not assign your rights under these Terms without our written consent. We may assign our rights freely. Notices to you will be sent to your registered email address.</p>

          <h2 style={h2Style}>17. Changes to These Terms</h2>
          <p style={pStyle}>We may update these Terms at any time. If we make material changes, we will notify you by email or by a prominent notice within the Service at least 14 days before the changes take effect. Your continued use of the Service after that date constitutes your acceptance of the updated Terms. If you do not agree, you must stop using the Service and cancel any active subscription before the effective date.</p>

          <h2 style={h2Style}>18. Contact</h2>
          <p style={pStyle}>For questions about these Terms, <a href="/support" style={{ color:'#888' }}>contact us via our support form</a>.</p>
        </main>
        <footer style={{ textAlign:'center', padding:'40px 24px', borderTop:'1px solid #141414', fontSize:'12px', color:'#333' }}>
          © 2026 Aegis. All rights reserved. · <a href="/privacy" style={{ color:'#444', textDecoration:'none' }}>Privacy</a> · <a href="/refunds" style={{ color:'#444', textDecoration:'none' }}>Refunds</a>
        </footer>
      </body>
    </html>
  );
}
