export default function RefundsPage() {
  const h2Style = { fontSize:'18px', fontWeight:'700', margin:'40px 0 12px', color:'#ccc' };
  const pStyle = { fontSize:'15px', color:'#666', lineHeight:'1.75', marginBottom:'16px' };

  return (
    <html>
      <head>
        <title>Refund Policy | Aegis</title>
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
          <h1 style={{ fontSize:'40px', fontWeight:'900', letterSpacing:'-0.03em', marginBottom:'8px' }}>Refund Policy</h1>
          <div style={{ fontSize:'14px', color:'#555', marginBottom:'56px' }}>Last updated: July 2026</div>

          <h2 style={h2Style}>1. Free Trial</h2>
          <p style={pStyle}>All paid Aegis plans include a 14-day free trial. You will not be charged during the trial period. You may cancel at any time before the trial ends with no obligation and no charge whatsoever. We do not require a credit card for sandbox/evaluation purposes, but a valid payment method is required to start a paid trial on the live service.</p>

          <h2 style={h2Style}>2. Subscription Billing</h2>
          <p style={pStyle}>After the free trial period, your chosen plan is billed on a monthly recurring basis. Billing occurs on the same calendar day each month (the "billing date"). You authorise Aegis to charge your payment method on file through our payment processor, Paddle, on each billing date until you cancel.</p>

          <h2 style={h2Style}>3. 7-Day Money-Back Guarantee</h2>
          <p style={pStyle}>If you are unsatisfied with Aegis for any reason within the first 7 days following your initial paid charge (i.e. after the free trial ends), you may request a full refund of that charge. To request a refund under this guarantee, <a href="/support" style={{ color:'#888' }}>submit a support request</a> from the email address associated with your account within 7 days of the charge. Refund requests received after 7 days of the relevant charge are not eligible under this guarantee.</p>

          <h2 style={h2Style}>4. Cancellation</h2>
          <p style={pStyle}>You may cancel your Aegis subscription at any time. Cancellation takes effect at the end of your current billing period. You will retain full access to all paid features until that date. We do not issue prorated refunds for the unused portion of a billing period after the 7-day money-back window has passed. To cancel, manage your subscription from within the Aegis app or <a href="/support" style={{ color:'#888' }}>submit a support request</a>.</p>

          <h2 style={h2Style}>5. Exceptions and Discretionary Refunds</h2>
          <p style={pStyle}>Outside the 7-day guarantee window, refunds are issued at our sole discretion. We may consider refunds in cases of significant service outages, billing errors on our end, duplicate charges, or other exceptional circumstances. <a href="/support" style={{ color:'#888' }}>Submit a support request</a> with your account email and a description of the issue; we will review and respond within 5 business days.</p>

          <h2 style={h2Style}>6. Fraudulent or Disputed Charges</h2>
          <p style={pStyle}>If you believe a charge was made in error or without your authorisation, <a href="/support" style={{ color:'#888' }}>contact us</a> before initiating a chargeback with your bank. We will work to resolve the issue promptly. Initiating an unjustified chargeback may result in suspension of your account.</p>

          <h2 style={h2Style}>7. Refund Processing</h2>
          <p style={pStyle}>Approved refunds are processed through Paddle, our payment processor, and typically appear on your original payment method within 5–10 business days, depending on your bank or card issuer. We do not issue refunds in the form of account credit.</p>

          <h2 style={h2Style}>8. Changes to This Policy</h2>
          <p style={pStyle}>We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with an updated date. Continued use of Aegis following any change constitutes your acceptance of the revised policy.</p>

          <h2 style={h2Style}>9. Contact</h2>
          <p style={pStyle}>For all refund or billing enquiries, <a href="/support" style={{ color:'#888' }}>submit a support request</a>. Please include your account email and the date of the charge in question.</p>
        </main>
        <footer style={{ textAlign:'center', padding:'40px 24px', borderTop:'1px solid #141414', fontSize:'12px', color:'#333' }}>
          © 2026 Aegis. All rights reserved. · <a href="/terms" style={{ color:'#444', textDecoration:'none' }}>Terms</a> · <a href="/privacy" style={{ color:'#444', textDecoration:'none' }}>Privacy</a>
        </footer>
      </body>
    </html>
  );
}
