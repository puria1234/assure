'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { PLANS } from '../../lib/plans';

const CHECK_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function PricingPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      {/* Nav */}
      <nav id="navbar">
        <a href="/" className="nav-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="nav-logo-text">Aegis</span>
        </a>
        <div className="nav-links">
          <a href="/#features" className="nav-link">Features</a>
          <a href="/pricing" className="nav-link" style={{ color: '#fff' }}>Pricing</a>
          {user ? (
            <a href="/app" className="btn-cta" style={{ padding: '10px 24px', fontSize: '12px' }}>Open App</a>
          ) : (
            <a href="/login" className="btn-cta" style={{ padding: '10px 24px', fontSize: '12px' }}>Sign in</a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '140px 48px 64px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        {/* Coming soon badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          border: '1px solid #2a2a2a', borderRadius: '100px',
          padding: '6px 16px 6px 10px', marginBottom: '32px',
          background: 'rgba(255,255,255,0.03)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888' }}>Coming Soon</span>
        </div>
        <h1 className="headline-lg" style={{ marginBottom: '20px' }}>
          Simple, honest<br />pricing.
        </h1>
        <p className="body-text" style={{ maxWidth: '440px', margin: '0 auto' }}>
          Paid plans are on the way. For now, enjoy the free tier. No card required, ever.
        </p>
      </section>

      {/* Plan cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 320px))',
        gap: '16px',
        maxWidth: '1040px',
        margin: '0 auto',
        padding: '0 48px 120px',
        justifyContent: 'center',
      }}>
        <PlanCard plan={PLANS.free} planKey="free" current />
        <PlanCard plan={PLANS.protect} planKey="protect" badge="Coming Soon" />
        <PlanCard plan={PLANS.protectPlus} planKey="protectPlus" badge="Coming Soon" highlighted />
      </div>

      {/* FAQ */}
      <div style={{
        borderTop: '1px solid #141414',
        maxWidth: '680px',
        margin: '0 auto',
        padding: '64px 48px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '40px',
      }}>
        {[
          { q: 'When will paid plans launch?', a: 'We\'re working on it. You\'ll be notified via your account email when subscriptions go live.' },
          { q: 'Will my free data carry over?', a: 'Yes. Everything you add now will be there when paid plans launch.' },
          { q: 'What counts as a scan?', a: 'Each time you use AI receipt scanning to extract warranty details from a photo.' },
          { q: 'What is a claim session?', a: 'One message exchange with the AI claim assistant. Free plan allows 1 per month.' },
        ].map(({ q, a }) => (
          <div key={q}>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.01em' }}>{q}</div>
            <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>{a}</div>
          </div>
        ))}
      </div>

      <footer>
        <div style={{ fontSize: '13px', color: '#444' }}>© {new Date().getFullYear()} Aegis. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="/privacy" style={{ fontSize: '13px', color: '#444', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ fontSize: '13px', color: '#444', textDecoration: 'none' }}>Terms</a>
          <a href="/refunds" style={{ fontSize: '13px', color: '#444', textDecoration: 'none' }}>Refunds</a>
        </div>
      </footer>
    </div>
  );
}

function PlanCard({ plan, planKey, badge, highlighted, current }) {
  const isFree = planKey === 'free';

  return (
    <div style={{
      background: highlighted ? '#fff' : '#0f0f0f',
      border: `1px solid ${highlighted ? 'transparent' : '#1a1a1a'}`,
      borderRadius: '24px',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      opacity: current ? 1 : 0.75,
      transition: 'opacity 0.2s',
    }}>
      {badge && (
        <div style={{
          position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
          background: highlighted ? '#f59e0b' : '#2a2a2a',
          color: highlighted ? '#000' : '#888',
          fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase',
          padding: '4px 14px', borderRadius: '100px', whiteSpace: 'nowrap',
        }}>
          {badge}
        </div>
      )}

      {current && (
        <div style={{
          position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
          background: '#4ade80', color: '#000',
          fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase',
          padding: '4px 14px', borderRadius: '100px', whiteSpace: 'nowrap',
        }}>
          Your current plan
        </div>
      )}

      <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: highlighted ? '#888' : '#555', marginBottom: '12px' }}>
        {plan.name}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
        <span style={{ fontSize: '44px', fontWeight: '900', letterSpacing: '-0.04em', color: highlighted ? '#000' : '#fff', lineHeight: 1 }}>
          {plan.price}
        </span>
        {plan.interval && (
          <span style={{ fontSize: '13px', color: highlighted ? '#888' : '#555' }}>/ mo</span>
        )}
      </div>

      <div style={{ fontSize: '12px', color: highlighted ? '#999' : '#444', marginBottom: '28px' }}>
        {isFree ? 'Free forever' : '14-day free trial included'}
      </div>

      {/* CTA */}
      {isFree ? (
        <a href="/login" style={{
          display: 'block', textAlign: 'center',
          background: '#fff', color: '#000', border: 'none', borderRadius: '100px',
          padding: '13px 28px', fontSize: '12px', fontWeight: '800',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          textDecoration: 'none', marginBottom: '28px',
        }}>
          Get started free
        </a>
      ) : (
        <div style={{
          background: highlighted ? '#f5f5f5' : '#1a1a1a',
          color: highlighted ? '#999' : '#444',
          border: `1px solid ${highlighted ? '#e8e8e8' : '#2a2a2a'}`,
          borderRadius: '100px', padding: '13px 28px',
          fontSize: '12px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase',
          textAlign: 'center', marginBottom: '28px', cursor: 'default',
        }}>
          Coming soon
        </div>
      )}

      <div style={{ borderTop: `1px solid ${highlighted ? '#e8e8e8' : '#1a1a1a'}`, marginBottom: '24px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {plan.features.map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: highlighted ? '#000' : (isFree ? '#4ade80' : '#555'), flexShrink: 0, marginTop: '1px' }}>{CHECK_ICON}</span>
            <span style={{ fontSize: '13px', color: highlighted ? '#444' : (isFree ? '#bbb' : '#555'), lineHeight: '1.4' }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
