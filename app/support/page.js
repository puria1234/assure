// ─────────────────────────────────────────────
// Paste your Typeform embed URL here.
// e.g. "https://yourname.typeform.com/to/XXXXXXXX"
// ─────────────────────────────────────────────
const TYPEFORM_URL = 'https://form.typeform.com/to/QwxNP7bW';

export default function SupportPage() {
  return (
    <html>
      <head>
        <title>Support — Aegis</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0a0a0a; color: #fff; font-family: Inter, sans-serif; }
        `}</style>
      </head>
      <body>
        <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 48px', height:'68px', borderBottom:'1px solid #141414' }}>
          <a href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
            <img src="/favicon.png" width="24" height="24" alt="Aegis" />
            <span style={{ fontSize:'15px', fontWeight:'800', letterSpacing:'0.15em', textTransform:'uppercase', color:'#fff', lineHeight:1 }}>Aegis</span>
          </a>
          <a href="/" style={{ fontSize:'13px', color:'#555', textDecoration:'none' }}>← Back</a>
        </nav>

        <main style={{ maxWidth:'760px', margin:'0 auto', padding:'80px 24px 120px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'0.18em', textTransform:'uppercase', color:'#555', marginBottom:'20px' }}>Support</div>
          <h1 style={{ fontSize:'40px', fontWeight:'900', letterSpacing:'-0.03em', marginBottom:'16px' }}>How can we help?</h1>
          <p style={{ fontSize:'16px', color:'#666', lineHeight:'1.7', marginBottom:'56px', maxWidth:'520px' }}>
            Fill out the form below and we'll get back to you as soon as possible — typically within one business day.
          </p>

          {/* Typeform embed */}
          <div style={{ borderRadius:'16px', overflow:'hidden', border:'1px solid #1a1a1a', minHeight:'560px' }}>
            <iframe
              src={TYPEFORM_URL}
              width="100%"
              height="560"
              frameBorder="0"
              allow="camera; microphone; autoplay; encrypted-media;"
              style={{ display:'block', background:'#111' }}
              title="Aegis Support Form"
            />
          </div>

          {/* Quick links */}
          <div style={{ marginTop:'56px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px' }}>
            {[
              { label:'Refund Policy', href:'/refunds', desc:'Trials, cancellations, and refund requests.' },
              { label:'Privacy Policy', href:'/privacy', desc:'How we handle your data.' },
              { label:'Terms of Service', href:'/terms', desc:'Your rights and ours.' },
            ].map(({ label, href, desc }) => (
              <a key={href} href={href} style={{ display:'block', background:'#0f0f0f', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'20px', textDecoration:'none', transition:'border-color 0.2s' }}
                onMouseOver={e => e.currentTarget.style.borderColor='#333'}
                onMouseOut={e => e.currentTarget.style.borderColor='#1a1a1a'}>
                <div style={{ fontSize:'14px', fontWeight:'700', color:'#fff', marginBottom:'6px' }}>{label}</div>
                <div style={{ fontSize:'13px', color:'#555', lineHeight:'1.5' }}>{desc}</div>
              </a>
            ))}
          </div>
        </main>

        <footer style={{ textAlign:'center', padding:'40px 24px', borderTop:'1px solid #141414', fontSize:'12px', color:'#333' }}>
          © 2026 Aegis. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
