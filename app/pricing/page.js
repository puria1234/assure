'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/client';
import { PLANS } from '@/lib/plans';
import PlanCard from '@/components/PlanCard';

export default function PricingPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    authClient.getSession()
      .then(({ data }) => { if (!cancelled) setUser(data?.user ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      {/* Nav */}
      <nav id="navbar">
        <a href="/" className="nav-logo">
          <img src="/favicon.png" width="22" height="22" alt="Assure" />
          <span className="nav-logo-text">Assure</span>
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
        <h1 className="headline-lg" style={{ marginBottom: '20px' }}>
          Simple, honest<br />pricing.
        </h1>
        <p className="body-text" style={{ maxWidth: '460px', margin: '0 auto' }}>
          Try Assure free with a one time allowance. Assure+ is on the way for when you need more.
        </p>
      </section>

      {/* Plan cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        maxWidth: '720px',
        margin: '0 auto',
        padding: '0 48px 120px',
        justifyContent: 'center',
      }}>
        <PlanCard
          plan={PLANS.free}
          current={!!user}
          href={user ? '/app' : '/login'}
          cta={user ? 'Open Assure' : 'Start free trial'}
        />
        <PlanCard plan={PLANS.plus} highlighted available={false} />
      </div>

      {/* Definitions */}
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
          { q: 'What counts as a scan?', a: 'Each time AI receipt scanning reads a photo and fills in the warranty details for you.' },
          { q: 'What is a claim session?', a: `One conversation with the AI claim assistant about a single product, up to ${PLANS.free.limits.claimMessages} messages. Follow up questions in the same conversation do not use another session.` },
          { q: 'When does Assure+ launch?', a: 'It is not available to buy yet. Until then, the free trial is the only plan.' },
        ].map(({ q, a }) => (
          <div key={q}>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.01em' }}>{q}</div>
            <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>{a}</div>
          </div>
        ))}
      </div>

      <footer>
        <div style={{ fontSize: '13px', color: '#444' }}>© {new Date().getFullYear()} Assure. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="/privacy" style={{ fontSize: '13px', color: '#444', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ fontSize: '13px', color: '#444', textDecoration: 'none' }}>Terms</a>
        </div>
      </footer>
    </div>
  );
}
