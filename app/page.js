'use client';

import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

function PreviewCategoryIcon({ category }) {
  const props = {
    width: 13,
    height: 13,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  if (category === 'Appliances') {
    return (
      <svg {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export default function LandingPage() {
  const navRef = useRef(null);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ipadSectionRef = useRef(null);
  const ipadInnerRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    // Scroll-driven iPad pop-out
    const updateIpad = () => {
      if (!ipadSectionRef.current || !ipadInnerRef.current) return;
      const rect = ipadSectionRef.current.getBoundingClientRect();
      const viewH = window.innerHeight;
      // 0 when section top hits bottom of viewport, 1 when section is centered
      const raw = (viewH - rect.top) / (viewH * 0.75 + rect.height * 0.5);
      const p = Math.max(0, Math.min(1, raw));
      // Ease in-out quad
      const t = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const rotX  = 38 - t * 36;      // 38° tilted back → 2° (slight float tilt)
      const rotY  = -12 + t * 10;     // -12° → -2°
      const scale = 0.68 + t * 0.32;  // 0.68 → 1.0
      const transY = 130 - t * 130;   // drops down → 0
      ipadInnerRef.current.style.transform =
        `perspective(2400px) translateY(${transY}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
    };

    // Nav scroll effect
    const onScroll = () => {
      if (navRef.current) {
        navRef.current.style.borderBottomColor = window.scrollY > 40
          ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)';
      }
      updateIpad();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateIpad, { passive: true });
    updateIpad();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateIpad);
    };
  }, []);

  const previewStats = [
    { label: 'Total', value: '24', color: '#fff', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg> },
    { label: 'Active', value: '18', color: '#4ade80', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
    { label: 'Expiring', value: '3', color: '#f59e0b', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
    { label: 'Expired', value: '3', color: '#ef4444', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg> },
  ];

  const previewFilters = [
    { label: 'All', count: '24', active: true },
    { label: 'Active', count: '18', active: false },
    { label: 'Expiring', count: '3', active: false },
    { label: 'Expired', count: '3', active: false },
  ];

  const previewStatusColor = { active: '#4ade80', expiring: '#f59e0b', expired: '#ef4444' };
  const previewStatusBg = { active: 'rgba(74,222,128,0.08)', expiring: 'rgba(245,158,11,0.08)', expired: 'rgba(239,68,68,0.08)' };

  const previewWarranties = [
    { id: '1', productName: 'Sony WH-1000XM5', brand: 'Sony', category: 'Electronics', expires: 'Nov 12, 2026', remaining: '240d left', progress: 35, status: 'active', price: '$349.00' },
    { id: '2', productName: 'Dyson V15 Vacuum', brand: 'Dyson', category: 'Appliances', expires: 'Apr 2, 2026', remaining: '14d left', progress: 88, status: 'expiring', price: '$699.00' },
    { id: '3', productName: 'MacBook Pro 14"', brand: 'Apple', category: 'Electronics', expires: 'Mar 17, 2027', remaining: '363d left', progress: 12, status: 'active', price: '$1,999.00' },
  ];

  return (
    <div>

      {/* NAV */}
      <nav id="navbar" ref={navRef} style={{ position: 'fixed', width: '100%', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '68px', padding: '0 5vmin', background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'border-color 0.3s ease' }}>
        <a href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src="/favicon.png" width="28" height="28" alt="ASSURE" />
          <span className="nav-logo-text" style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>Assure</span>
        </a>
        
        {/* Desktop Links */}
        <div className="nav-links hide-sm" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#features" className="nav-link" style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#888'}>Features</a>
          <a href="#how-it-works" className="nav-link" style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#888'}>How It Works</a>
          <a href="#pricing" className="nav-link" style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#888'}>Pricing</a>
          <a href={user ? "/app" : "/login"} className="btn-cta" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#000', padding: '10px 20px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none', transition: 'all 0.2s' }}>
            {user ? "Go to Dashboard" : "Open App"}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="mobile-menu-btn hide-desktop" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className="mobile-menu-overlay hide-desktop"
        style={{
          position: 'fixed',
          top: '68px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(8,8,8,0.98)',
          backdropFilter: 'blur(24px)',
          zIndex: 99,
          display: mobileMenuOpen ? 'flex' : 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          opacity: mobileMenuOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
          visibility: mobileMenuOpen ? 'visible' : 'hidden'
        }}
      >
        <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', textDecoration: 'none' }}>Features</a>
        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', textDecoration: 'none' }}>How It Works</a>
        <a href={user ? "/app" : "/login"} onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', color: '#000', padding: '14px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none', marginTop: '16px' }}>
          {user ? "Go to Dashboard" : "Open App"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>

      {/* HERO */}
      <div className="hero">
        <div className="hero-bg-number">W.</div>
        <div className="hero-grid-lines"></div>
        <div className="hero-glow"></div>

        <div className="hero-content">
          <h1 className="headline-xl" style={{ maxWidth:'900px' }}>
            Every<br/>Warranty.<br/><span style={{ color:'#333' }}>Assured.</span>
          </h1>

          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:'48px', flexWrap:'wrap', gap:'32px' }}>
            <div style={{ maxWidth:'440px' }}>
              <p className="body-text" style={{ fontSize:'18px', marginBottom:'32px' }}>
                Every warranty you own in one place. Assure tracks what's still covered, counts down what's running out, and tells you before a claim window closes.
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                <a href={user ? "/app" : "/login"} className="btn-cta">
                  {user ? "Go to Dashboard" : "Get Started"}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a href="#features" className="btn-outline">Explore Features</a>
              </div>
            </div>

            {/* Mini UI Preview */}
            <div className="hide-sm" style={{ display:'flex', flexDirection:'column', gap:'10px', minWidth:'280px', maxWidth:'300px' }}>

              {/* Card 1: Active */}
              <div className="mock-card" style={{ animation:'float 4s ease-in-out infinite' }}>
                <div style={{ padding:'20px 20px 16px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px', marginBottom:'12px' }}>
                    <div style={{ minWidth:'0' }}>
                      <div className="mock-tag">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        Electronics
                      </div>
                      <div style={{ fontSize:'16px', fontWeight:'800', letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Sony XM5 Headphones</div>
                      <div style={{ fontSize:'12px', color:'#666', marginTop:'2px' }}>Sony</div>
                    </div>
                    <span className="status-active" style={{ fontSize:'11px', fontWeight:'700', whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.06em' }}>Active</span>
                  </div>
                  <div className="mock-bar"><div className="mock-bar-fill" style={{ width:'35%', background:'#4ade80' }}></div></div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize:'12px', color:'#666' }}>Nov 12, 2026</div>
                    <div style={{ fontSize:'12px', fontWeight:'700', color:'#4ade80' }}>240d left</div>
                  </div>
                </div>
                <div style={{ borderTop:'1px solid #1a1a1a', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:'12px', color:'#555' }}>$349.00</div>
                  <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', color:'#666', padding:'5px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.04em' }}>Edit</div>
                </div>
              </div>

              {/* Card 2: Expiring */}
              <div className="mock-card" style={{ opacity:'0.65', animation:'float 4s ease-in-out 1.5s infinite' }}>
                <div style={{ padding:'20px 20px 16px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px', marginBottom:'12px' }}>
                    <div style={{ minWidth:'0' }}>
                      <div className="mock-tag">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        Appliances
                      </div>
                      <div style={{ fontSize:'16px', fontWeight:'800', letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Dyson V15 Vacuum</div>
                      <div style={{ fontSize:'12px', color:'#666', marginTop:'2px' }}>Dyson</div>
                    </div>
                    <span className="status-expiring" style={{ fontSize:'11px', fontWeight:'700', whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.06em' }}>Expiring</span>
                  </div>
                  <div className="mock-bar"><div className="mock-bar-fill" style={{ width:'88%', background:'#f59e0b' }}></div></div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize:'12px', color:'#666' }}>Apr 2, 2026</div>
                    <div style={{ fontSize:'12px', fontWeight:'700', color:'#f59e0b' }}>16d left</div>
                  </div>
                </div>
                <div style={{ borderTop:'1px solid #1a1a1a', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:'12px', color:'#555' }}>$699.00</div>
                  <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', color:'#666', padding:'5px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.04em' }}>Edit</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          <span className="ticker-item"><span className="ticker-dot"></span> Electronics</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Appliances</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Automotive</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Footwear</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Tools</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Furniture</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Clothing</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Sports Gear</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Cameras</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Computers</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Smartphones</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Wearables</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Electronics</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Appliances</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Automotive</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Footwear</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Tools</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Furniture</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Clothing</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Sports Gear</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Cameras</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Computers</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Smartphones</span>
          <span className="ticker-item"><span className="ticker-dot"></span> Wearables</span>
        </div>
      </div>


      {/* ── 3D IPAD DEMO ── */}
      <section ref={ipadSectionRef} style={{ padding:'120px 24px 180px', textAlign:'center', overflow:'visible', position:'relative' }}>
        {/* Ambient glow */}
        <div style={{ position:'absolute', top:'45%', left:'50%', transform:'translate(-50%,-50%)', width:'1100px', height:'600px', background:'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 40%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

        <div className="reveal" style={{ marginBottom:'80px', position:'relative', zIndex:1 }}>
          <div className="eyebrow" style={{ marginBottom:'16px' }}>The App</div>
          <h2 className="headline-lg" style={{ marginBottom:'16px' }}>Your warranties,<br/>beautifully organized.</h2>
          <p className="body-text" style={{ maxWidth:'420px', margin:'0 auto' }}>Everything tracked in one clean dashboard. Always know what's covered and what's about to expire.</p>
        </div>

        {/* iPad scene */}
        <div style={{ position:'relative', zIndex:1, display:'flex', justifyContent:'center', alignItems:'center', userSelect:'none', paddingBottom:'60px' }}>

          {/* This wrapper gets the scroll-driven 3D transform */}
          <div ref={ipadInnerRef} style={{ display:'inline-block', transformStyle:'preserve-3d', willChange:'transform', transformOrigin:'center bottom' }}>

            <div className="ipad-scale-wrapper" style={{ position:'relative', display:'inline-block' }}>

              {/* ── iPad Pro PNG frame ── */}
              {/* Screen area in SVG: x=30..910, y=16..664 out of 940×680 */}
              {/* As percentages: left=3.19%, top=2.35%, width=93.62%, height=95.29% */}
              <div style={{ width:'940px', height:'680px', position:'relative' }}>

                {/* iPad PNG, behind the content, bezels frame the screen area visually */}
                <img
                  src="/ipad_landscape.png"
                  alt="iPad Pro"
                  width={940} height={680}
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:1 }}
                />

                {/* Screen content, on top of the PNG, fills exactly the screen area (x=30..910 y=16..664) */}
                <div style={{
                  position:'absolute',
                  left:'30px', top:'16px', right:'30px', bottom:'16px',
                  borderRadius:'6px',
                  overflow:'hidden',
                  background:'#080808',
                  zIndex:2,
                }}>

                  {/* Anti-glare coating texture (subtle) */}
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 40%, transparent 60%)', zIndex:10, pointerEvents:'none', borderRadius:'22px' }} />

                  {/* App UI content at full 1200px scale */}
                  <div style={{ width:'1200px', minHeight:'860px', transform:'scale(0.726)', transformOrigin:'top left', pointerEvents:'none', textAlign:'left', background:'#080808', color:'#fff', fontFamily:'Inter, sans-serif' }}>
                    <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:'56px', borderBottom:'1px solid #141414', background:'rgba(8,8,8,0.95)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:100 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <img src="/icon.png" width="28" height="28" alt="ASSURE" style={{ borderRadius:'6px' }} />
                        <span style={{ fontSize:'15px', fontWeight:'800', letterSpacing:'0.15em', textTransform:'uppercase', color:'#fff', lineHeight:1 }}>ASSURE</span>
                        <span style={{ fontSize:'12px', fontWeight:500, color:'#444', letterSpacing:'0.02em', marginLeft:'2px' }}>Warranty Tracker</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <button style={{ position:'relative', background:'none', border:'1px solid #1e1e1e', borderRadius:'8px', padding:'7px', color:'#666', lineHeight:0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                          <span style={{ position:'absolute', top:'-4px', right:'-4px', background:'#f59e0b', color:'#000', fontSize:'9px', fontWeight:800, borderRadius:'10px', minWidth:'16px', height:'16px', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', border:'2px solid #0a0a0a' }}>3</span>
                        </button>
                        <button style={{ display:'flex', alignItems:'center', gap:'8px', background:'#111', border:'1px solid #1e1e1e', borderRadius:'8px', padding:'6px 10px' }}>
                          <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg, hsl(190,88%,42%), hsl(36,96%,56%))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:800, color:'#fff', flexShrink:0 }}>J</div>
                          <span style={{ fontSize:'13px', fontWeight:600, color:'#ccc' }}>John</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                        </button>
                      </div>
                    </nav>

                    <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'24px 20px' }}>
                      <div style={{ background:'linear-gradient(135deg, #0f0f0f 0%, #111 50%, #0f0f0f 100%)', border:'1px solid #1a1a1a', borderRadius:'16px', padding:'28px 32px', marginBottom:'24px', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:0, right:0, width:'300px', height:'100%', background:'radial-gradient(ellipse at right center, rgba(255,255,255,0.02) 0%, transparent 70%)', pointerEvents:'none' }} />
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px' }}>
                          <div>
                            <div style={{ fontSize:'22px', fontWeight:900, letterSpacing:'-0.03em', marginBottom:'6px', textAlign:'left' }}>Welcome back, John</div>
                            <div style={{ fontSize:'13px', color:'#555' }}>You have 24 warranties tracked · 3 expiring soon.</div>
                          </div>
                          <button style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#fff', color:'#000', fontWeight:700, letterSpacing:'0.05em', borderRadius:'8px', padding:'10px 20px', border:'none', textTransform:'uppercase', fontSize:'12px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Warranty
                          </button>
                        </div>
                      </div>

                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'12px', marginBottom:'24px' }}>
                        {previewStats.map(({ label, value, color, icon }) => (
                          <div key={label} style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:'16px', padding:'20px' }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                              <div style={{ fontSize:'11px', fontWeight:700, color:'#444', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</div>
                              <div style={{ color: label === 'Total' ? '#333' : color, opacity:0.7 }}>{icon}</div>
                            </div>
                            <div style={{ fontSize:'32px', fontWeight:900, color, letterSpacing:'-0.04em', lineHeight:1 }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-start', gap:'12px', marginBottom:'18px', flexWrap:'wrap' }}>
                        <div style={{ flex:1, minWidth:'260px', position:'relative' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                          <div style={{ background:'#111', border:'1px solid #222', borderRadius:'10px', color:'#666', padding:'10px 16px 10px 36px', width:'100%', fontSize:'15px', textAlign:'left' }}>Search warranties…</div>
                        </div>
                        <div style={{ background:'#111', border:'1px solid #222', borderRadius:'10px', color:'#888', padding:'10px 14px', minWidth:'160px', fontSize:'14px', display:'flex', alignItems:'center', gap:'6px' }}>
                          Expiry (Soonest)
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                        </div>
                        <div style={{ display:'flex', gap:'4px' }}>
                          {[true, false].map((active, idx) => (
                            <div key={idx} style={{ padding:'7px 10px', borderRadius:'6px', background:active ? '#fff' : 'transparent', border:`1px solid ${active ? '#fff' : '#2a2a2a'}`, color:active ? '#000' : '#666', lineHeight:1 }}>
                              {idx === 0 ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
                        {previewFilters.map(({ label, count, active }) => (
                          <div key={label} style={{ padding:'6px 16px', borderRadius:'100px', fontSize:'12px', fontWeight:600, border:`1px solid ${active ? '#fff' : '#2a2a2a'}`, background:active ? '#fff' : 'transparent', color:active ? '#000' : '#888', textTransform:'uppercase', letterSpacing:'0.06em', display:'inline-flex', alignItems:'center' }}>
                            {label}
                            <span style={{ background:active ? 'rgba(0,0,0,0.2)' : '#1a1a1a', borderRadius:'10px', padding:'1px 6px', fontSize:'10px', marginLeft:'4px' }}>{count}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:'14px' }}>
                        {previewWarranties.map((w) => {
                          const color = previewStatusColor[w.status];
                          const bg = previewStatusBg[w.status];
                          return (
                            <div key={w.id} style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:'12px', padding:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
                              {/* Card body */}
                              <div style={{ padding:'20px 20px 16px', flex:1 }}>
                                {/* Top row: category tag left, status badge right */}
                                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px', marginBottom:'12px' }}>
                                  <div style={{ minWidth:0, flex:1 }}>
                                    {/* Category tag */}
                                    <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'#161616', border:'1px solid #222', borderRadius:'6px', padding:'4px 9px', marginBottom:'9px', color:'#666', fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                                      <PreviewCategoryIcon category={w.category} />
                                      {w.category}
                                    </div>
                                    {/* Product name */}
                                    <div style={{ fontSize:'16px', fontWeight:800, letterSpacing:'-0.02em', color:'#f0f0f0', lineHeight:1.25 }}>{w.productName}</div>
                                    <div style={{ fontSize:'12px', color:'#555', marginTop:'3px' }}>{w.brand}</div>
                                  </div>
                                  {/* Status badge */}
                                  <div style={{ display:'flex', alignItems:'center', gap:'5px', background:bg, border:`1px solid ${color}30`, borderRadius:'20px', padding:'4px 10px', flexShrink:0 }}>
                                    <div style={{ width:5, height:5, borderRadius:'50%', background:color }} />
                                    <span style={{ fontSize:'10px', fontWeight:700, color:color, textTransform:'uppercase', letterSpacing:'0.08em' }}>{w.status}</span>
                                  </div>
                                </div>
                                {/* Progress bar */}
                                <div style={{ height:'4px', borderRadius:'2px', background:'#1a1a1a', overflow:'hidden', marginBottom:'10px' }}>
                                  <div style={{ height:'100%', borderRadius:'2px', width:`${w.progress}%`, background:color }} />
                                </div>
                                {/* Expiry + remaining */}
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                  <div style={{ fontSize:'12px', color:'#555' }}>{w.expires}</div>
                                  <div style={{ fontSize:'12px', fontWeight:700, color }}>{w.remaining}</div>
                                </div>
                              </div>
                              {/* Footer bar */}
                              <div style={{ borderTop:'1px solid #161616', padding:'11px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                <div style={{ fontSize:'12px', color:'#555', fontWeight:500 }}>{w.price}</div>
                                <div style={{ display:'flex', alignItems:'center', gap:'4px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'6px', color:'#666', fontSize:'10px', fontWeight:700, padding:'5px 9px', letterSpacing:'0.04em', textTransform:'uppercase' }}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  Edit
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>{/* end screen content */}

                  {/* ── Demo FAB: File a Claim, pinned to screen corner ── */}
                  <div style={{ position:'absolute', bottom:'20px', right:'20px', zIndex:20, display:'inline-flex', alignItems:'center', gap:'9px', background:'#fff', borderRadius:'14px', color:'#000', fontSize:'13px', fontWeight:700, padding:'13px 20px', boxShadow:'0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.15)', fontFamily:'Inter, sans-serif', letterSpacing:'0.01em', cursor:'default' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    File a Claim
                  </div>

                </div>{/* end screen overlay */}

              </div>{/* end iPad PNG wrapper */}

              {/* ── Ground shadow ── */}
              <div style={{ position:'absolute', top:'100%', left:'8%', right:'8%', height:'100px', background:'radial-gradient(ellipse, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 75%)', filter:'blur(24px)', transform:'translateY(-30px) scaleY(0.4)', pointerEvents:'none', zIndex:-1 }} />

              {/* ── Purple ambient glow ── */}
              <div style={{ position:'absolute', inset:'-40px', borderRadius:'80px', background:'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)', filter:'blur(30px)', pointerEvents:'none', zIndex:-2 }} />

            </div>{/* end ipad-scale-wrapper */}
          </div>{/* end ipadInnerRef */}
        </div>{/* end scene */}

        <style>{`
          @media (max-width: 1080px) {
            .ipad-scale-wrapper { transform: scale(0.82); transform-origin: top center; margin-bottom: -102px; }
          }
          @media (max-width: 800px) {
            .ipad-scale-wrapper { transform: scale(0.56); transform-origin: top center; margin-bottom: -250px; }
          }
          @media (max-width: 520px) {
            .ipad-scale-wrapper { transform: scale(0.40); transform-origin: top center; margin-bottom: -360px; }
          }
        `}</style>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="reveal" style={{ marginBottom:'64px' }}>
          <div className="eyebrow" style={{ marginBottom:'16px' }}>Why Assure</div>
          <h2 className="headline-lg" style={{ maxWidth:'620px' }}>Built for every<br/>product you own.</h2>
        </div>

        <div className="responsive-features-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'16px' }}>

          <div className="feature-card reveal">
            <div className="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 26" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L3 7v7c0 5 4.5 9.5 9 11 4.5-1.5 9-6 9-11V7L12 2z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div className="feature-title">Universal Tracking</div>
            <div className="feature-desc">Track warranties across every product category, from sneakers to refrigerators to cars. If you bought it, Assure keeps a record of it.</div>
          </div>

          <div className="feature-card reveal reveal-delay-1">
            <div className="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div className="feature-title">Expiry Countdown</div>
            <div className="feature-desc">Live countdowns show exactly how many days remain on every warranty. Color-coded alerts fire 30 days before expiry so you&apos;re never caught off guard.</div>
          </div>

          <div className="feature-card reveal reveal-delay-2">
            <div className="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </div>
            <div className="feature-title">Coverage Progress</div>
            <div className="feature-desc">Visual progress bars show at a glance how much of your warranty coverage remains. Green to amber to red, know exactly where you stand.</div>
          </div>

          <div className="feature-card reveal reveal-delay-3">
            <div className="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div className="feature-title">Instant Search</div>
            <div className="feature-desc">Real-time search across product names, brands, retailers, and notes. Find any warranty in under a second no matter how many you&apos;re tracking.</div>
          </div>

          <div className="feature-card reveal reveal-delay-4">
            <div className="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
              </svg>
            </div>
            <div className="feature-title">AI Receipt Scanning</div>
            <div className="feature-desc">Snap a photo of any receipt and let AI instantly extract the product, brand, purchase date, price, and retailer. No manual entry needed.</div>
          </div>

          <div className="feature-card reveal reveal-delay-5">
            <div className="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="feature-title">AI Claim Assistant</div>
            <div className="feature-desc">Filing a warranty claim is painful. Assure AI guides you through it, drafting dispute letters, suggesting next steps, and knowing exactly what to say.</div>
          </div>

        </div>
      </section>

      <hr className="divider" />

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <div className="reveal" style={{ marginBottom:'80px', textAlign:'center' }}>
          <div className="eyebrow" style={{ marginBottom:'16px' }}>The Process</div>
          <h2 className="headline-lg">Up and running<br/>in three steps.</h2>
        </div>

        <div className="responsive-grid-3 reveal" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0', position:'relative' }}>

          {/* Connecting line */}
          <div className="hide-sm" style={{ position:'absolute', top:'36px', left:'calc(16.66% + 20px)', right:'calc(16.66% + 20px)', height:'1px', background:'linear-gradient(to right, #222 0%, #444 50%, #222 100%)', zIndex:'0' }}></div>

          <div style={{ textAlign:'center', padding:'0 32px', position:'relative', zIndex:'1' }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'#111', border:'1px solid #333', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <div className="step-number">01</div>
            <div style={{ fontSize:'18px', fontWeight:'800', letterSpacing:'-0.02em', marginBottom:'12px' }}>Add Your Product</div>
            <div className="feature-desc">Enter the product name, brand, purchase date, and category. Takes under 30 seconds.</div>
          </div>

          <div style={{ textAlign:'center', padding:'0 32px', position:'relative', zIndex:'1' }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'#111', border:'1px solid #333', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="step-number">02</div>
            <div style={{ fontSize:'18px', fontWeight:'800', letterSpacing:'-0.02em', marginBottom:'12px' }}>Set the Duration</div>
            <div className="feature-desc">Use quick-duration buttons (1 yr, 2 yr, 5 yr) or pick a custom expiry date. Assure calculates everything.</div>
          </div>

          <div style={{ textAlign:'center', padding:'0 32px', position:'relative', zIndex:'1' }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'#111', border:'1px solid #333', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px' }}>
              <svg width="28" height="28" viewBox="0 0 24 26" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L3 7v7c0 5 4.5 9.5 9 11 4.5-1.5 9-6 9-11V7L12 2z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div className="step-number">03</div>
            <div style={{ fontSize:'18px', fontWeight:'800', letterSpacing:'-0.02em', marginBottom:'12px' }}>Never Miss a Claim</div>
            <div className="feature-desc">Assure tracks your coverage, alerts you when warranties are about to expire, and keeps your entire collection organized.</div>
          </div>

        </div>
      </section>

      <hr className="divider" />

      {/* CATEGORIES */}
      <section>
        <div className="responsive-grid-2 reveal" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'center' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom:'16px' }}>Everything, Organized</div>
            <h2 className="headline-lg" style={{ marginBottom:'24px' }}>Nine categories.<br/>One dashboard.</h2>
            <p className="body-text" style={{ marginBottom:'36px' }}>From AirPods to automobiles, Assure handles every type of purchase. Tap any category to instantly filter your view.</p>
            <a href="/login" className="btn-cta">Open Assure</a>
          </div>
          <div className="responsive-grid-cat" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>

            <div className="feature-card" style={{ padding:'20px', textAlign:'center', cursor:'default' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'10px' }}>
                <div className="cat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
              </div>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#666', letterSpacing:'0.06em', textTransform:'uppercase' }}>Electronics</div>
            </div>

            <div className="feature-card" style={{ padding:'20px', textAlign:'center', cursor:'default' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'10px' }}>
                <div className="cat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
              </div>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#666', letterSpacing:'0.06em', textTransform:'uppercase' }}>Appliances</div>
            </div>

            <div className="feature-card" style={{ padding:'20px', textAlign:'center', cursor:'default' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'10px' }}>
                <div className="cat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </div>
              </div>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#666', letterSpacing:'0.06em', textTransform:'uppercase' }}>Automotive</div>
            </div>

            <div className="feature-card" style={{ padding:'20px', textAlign:'center', cursor:'default' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'10px' }}>
                <div className="cat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17v-3c0-1 .8-2 1.8-2 1.4 0 2.8-.7 3.7-1.8L9 7.5c.6-.8 1.8-.6 2.1.4L12 11h7c1.5 0 2 1 2 2v4"/><path d="M2 17h20v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><line x1="13" y1="14" x2="16" y2="14"/></svg>
                </div>
              </div>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#666', letterSpacing:'0.06em', textTransform:'uppercase' }}>Footwear</div>
            </div>

            <div className="feature-card" style={{ padding:'20px', textAlign:'center', cursor:'default' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'10px' }}>
                <div className="cat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                </div>
              </div>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#666', letterSpacing:'0.06em', textTransform:'uppercase' }}>Tools</div>
            </div>

          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* PRIVACY FIRST */}
      <section>
        <div className="reveal" style={{ marginBottom:'56px', textAlign:'center' }}>
          <div className="eyebrow" style={{ marginBottom:'16px' }}>Privacy First</div>
          <h2 className="headline-lg" style={{ maxWidth:'760px', margin:'0 auto 18px' }}>Your warranty data<br/>belongs to you.</h2>
          <p className="body-text" style={{ maxWidth:'640px', margin:'0 auto' }}>
            Assure is built to keep your warranties, receipts, and scan insights private by default. Your data stays secure, under your control, and never sold.
          </p>
        </div>

        <div className="responsive-features-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'16px' }}>
          {[
            {
              title: 'Encrypted Storage',
              desc: 'Your account and warranty records are protected in transit and at rest using modern, industry-standard security.',
              icon: <svg width="22" height="22" viewBox="0 0 24 26" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L3 7v7c0 5 4.5 9.5 9 11 4.5-1.5 9-6 9-11V7L12 2z"/><path d="M9 12l2 2 4-4"/></svg>,
            },
            {
              title: 'Never Sold',
              desc: 'We do not sell your personal information, receipt data, or AI scan history. Ever.',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/><path d="M20 12 9 23l-5-5"/></svg>,
            },
            {
              title: 'Private By Default',
              desc: 'Your dashboard, claim chats, and scan results are visible only to your account unless you choose to share them.',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
            },
            {
              title: 'Delete Anytime',
              desc: 'Delete individual warranties in-app anytime, or request full account deletion and we will permanently remove your data.',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
            },
          ].map((item) => (
            <div key={item.title} className="feature-card reveal">
              <div className="feature-icon">{item.icon}</div>
              <div className="feature-title">{item.title}</div>
              <div className="feature-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="reveal">
        <div className="eyebrow" style={{ marginBottom:'20px' }}>Pricing</div>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:'16px', marginBottom:'48px' }}>
          <h2 className="headline-lg">Simple, honest<br/>pricing.</h2>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', border:'1px solid #2a2a2a', borderRadius:'100px', padding:'6px 16px', background:'rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'0.15em', textTransform:'uppercase', color:'#888' }}>Paid plans coming soon</span>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'16px', maxWidth:'900px' }}>
          {[
            {
              key:'free', name:'Free', price:'$0', sub:'Free forever', cta:'Get started', href:'/login', ctaStyle:{ background:'#fff', color:'#000', border:'none' }, highlighted:false, current:true,
              features:['Up to 5 warranties','3 AI receipt scans / month','1 claim session / month','Expiry countdown and alerts'],
            },
            {
              key:'plus', name:'Plus', price:'$3.99', sub:'per month', cta:'Coming soon', href:null, ctaStyle:{ background:'#1a1a1a', color:'#444', border:'1px solid #2a2a2a' }, highlighted:false,
              features:['Up to 30 warranties','20 AI receipt scans / month','10 claim sessions / month','Expiry alerts (30 day)','Coverage progress tracking'],
            },
            {
              key:'unlimited', name:'Unlimited', price:'$6.99', sub:'per month', cta:'Coming soon', href:null, ctaStyle:{ background:'#f0f0f0', color:'#999', border:'none' }, highlighted:true,
              features:['Unlimited warranties','Unlimited AI receipt scans','Unlimited claim sessions','Priority support','Family sharing (up to 5)'],
            },
          ].map((plan) => (
            <div key={plan.key} style={{ background: plan.highlighted ? '#fff' : '#0f0f0f', border:`1px solid ${plan.highlighted ? 'transparent' : '#1a1a1a'}`, borderRadius:'24px', padding:'32px', position:'relative' }}>
              {plan.current && (
                <div style={{ position:'absolute', top:'-13px', left:'50%', transform:'translateX(-50%)', background:'#4ade80', color:'#000', fontSize:'10px', fontWeight:'700', letterSpacing:'0.12em', textTransform:'uppercase', padding:'4px 14px', borderRadius:'100px', whiteSpace:'nowrap' }}>
                  Your current plan
                </div>
              )}
              <div style={{ fontSize:'12px', fontWeight:'700', letterSpacing:'0.12em', textTransform:'uppercase', color: plan.highlighted ? '#888' : '#555', marginBottom:'10px' }}>{plan.name}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'4px' }}>
                <span style={{ fontSize:'42px', fontWeight:'900', letterSpacing:'-0.04em', color: plan.highlighted ? '#000' : '#fff', lineHeight:1 }}>{plan.price}</span>
                {plan.key !== 'free' && <span style={{ fontSize:'13px', color: plan.highlighted ? '#888' : '#555' }}>/ mo</span>}
              </div>
              <div style={{ fontSize:'12px', color: plan.highlighted ? '#999' : '#444', marginBottom:'24px' }}>{plan.sub}</div>
              {plan.href ? (
                <a href={plan.href} style={{ display:'block', textAlign:'center', borderRadius:'100px', padding:'12px 24px', fontSize:'12px', fontWeight:'800', letterSpacing:'0.08em', textTransform:'uppercase', textDecoration:'none', marginBottom:'24px', ...plan.ctaStyle }}>
                  {plan.cta}
                </a>
              ) : (
                <div style={{ textAlign:'center', borderRadius:'100px', padding:'12px 24px', fontSize:'12px', fontWeight:'800', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'24px', cursor:'default', ...plan.ctaStyle }}>
                  {plan.cta}
                </div>
              )}
              <div style={{ borderTop:`1px solid ${plan.highlighted ? '#e8e8e8' : '#1a1a1a'}`, marginBottom:'20px' }} />
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display:'flex', alignItems:'flex-start', gap:'8px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={plan.highlighted ? '#000' : (plan.key === 'free' ? '#4ade80' : '#555')} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:'2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize:'13px', color: plan.highlighted ? '#444' : (plan.key === 'free' ? '#bbb' : '#555'), lineHeight:'1.4' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BIG STATEMENT */}
      <div style={{ background:'#0c0c0c', borderTop:'1px solid #141414', borderBottom:'1px solid #141414', padding:'100px 48px', textAlign:'center', overflow:'hidden' }} className="reveal">
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <div className="eyebrow" style={{ marginBottom:'20px' }}>The Assure Philosophy</div>
          <p style={{ fontSize:'clamp(22px,4vw,42px)', fontWeight:'800', letterSpacing:'-0.03em', lineHeight:'1.15', color:'#fff' }}>
            The average household owns over<br/>
            <span style={{ color:'transparent', WebkitTextStroke:'1px #555' }}>40 products</span>
            {' '}with active warranties.<br/>
            Most people track{' '}
            <span style={{ position:'relative', display:'inline-block' }}>
              <span style={{ color:'#fff' }}>zero</span>
              <span style={{ position:'absolute', bottom:'4px', left:'0', right:'0', height:'2px', background:'#fff', borderRadius:'2px' }}></span>
            </span>
            {' '}of them.
          </p>
          <p className="body-text" style={{ marginTop:'24px', fontSize:'16px', maxWidth:'520px', marginLeft:'auto', marginRight:'auto' }}>
            Assure exists to change that. No excuses, no missed claims, no wasted money on extended warranties you already have.
          </p>
        </div>
      </div>

      <hr className="divider" />

      {/* FINAL CTA */}
      <section>
        <div className="cta-section reveal">
          <div className="cta-bg-text">Assure</div>
          <div style={{ position:'relative', zIndex:'1' }}>
            <h2 className="headline-lg" style={{ color:'#000', marginBottom:'20px', maxWidth:'700px', marginLeft:'auto', marginRight:'auto' }}>
              Never miss<br/>another claim.
            </h2>
            <p style={{ fontSize:'17px', color:'#777', marginBottom:'40px', maxWidth:'420px', marginLeft:'auto', marginRight:'auto', lineHeight:'1.6' }}>
              Start tracking your warranties in minutes. Free to use.
            </p>
            <a href="/login" className="btn-cta-dark">
              Open Assure
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ flexDirection:'column', gap:'0', padding:'0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px', padding:'20px 48px' }}>
          <div style={{ fontSize:'12px', color:'#333' }}>&copy; 2026 Assure. All rights reserved.</div>
          <div style={{ display:'flex', alignItems:'center', gap:'24px' }}>
            <a href="/terms" style={{ fontSize:'12px', color:'#444', textDecoration:'none', transition:'color 0.15s' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#888'}
              onMouseOut={(e) => e.currentTarget.style.color = '#444'}>Terms of Service</a>
            <a href="/privacy" style={{ fontSize:'12px', color:'#444', textDecoration:'none', transition:'color 0.15s' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#888'}
              onMouseOut={(e) => e.currentTarget.style.color = '#444'}>Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
