'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { initializePaddle } from '@paddle/paddle-js';
import { auth } from '../../lib/firebase';
import { PLANS } from '../../lib/paddle';

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function PricingPage() {
  const [paddle, setPaddle] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(null); // 'protect' | 'protectPlus' | null

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Paddle init
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const env = process.env.NEXT_PUBLIC_PADDLE_ENV;
    if (!token || !env) return;

    initializePaddle({ token, environment: env }).then((p) => {
      if (p) setPaddle(p);
    });
  }, []);

  function openCheckout(planKey) {
    const plan = PLANS[planKey];
    if (!plan?.priceId || !paddle) return;

    setLoading(planKey);

    paddle.Checkout.open({
      items: [{ priceId: plan.priceId, quantity: 1 }],
      ...(user?.email && { customer: { email: user.email } }),
      settings: {
        variant: 'one-page',
        successUrl: `${window.location.origin}/app`,
      },
    });

    // Clear loading state when checkout opens (Paddle doesn't give us a reliable open event)
    setTimeout(() => setLoading(null), 800);
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      {/* Nav */}
      <nav id="navbar" ref={null}>
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
      <section style={{ padding: '140px 48px 80px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div className="eyebrow" style={{ marginBottom: '24px' }}>Pricing</div>
        <h1 className="headline-lg" style={{ marginBottom: '20px' }}>
          Simple, honest<br />pricing.
        </h1>
        <p className="body-text" style={{ maxWidth: '480px', margin: '0 auto' }}>
          Every plan includes a 14-day free trial. No credit card required to start.
        </p>
      </section>

      {/* Plan cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 360px))',
        gap: '16px',
        maxWidth: '780px',
        margin: '0 auto',
        padding: '0 48px 120px',
        justifyContent: 'center',
      }}>
        {/* Protect */}
        <PlanCard
          plan={PLANS.protect}
          planKey="protect"
          badge={null}
          onSelect={openCheckout}
          loading={loading === 'protect'}
          paddleReady={!!paddle}
        />

        {/* Protect+ */}
        <PlanCard
          plan={PLANS.protectPlus}
          planKey="protectPlus"
          badge="Most popular"
          highlighted
          onSelect={openCheckout}
          loading={loading === 'protectPlus'}
          paddleReady={!!paddle}
        />
      </div>

      {/* FAQ row */}
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
          {
            q: 'What happens after the trial?',
            a: "You'll be charged at the end of the 14-day trial. Cancel anytime before and you won't be billed.",
          },
          {
            q: 'Can I switch plans?',
            a: 'Yes — upgrade or downgrade at any time. Paddle prorates the difference automatically.',
          },
          {
            q: 'What payment methods are accepted?',
            a: 'All major credit and debit cards, PayPal, and Apple Pay where available.',
          },
          {
            q: 'Is my data safe?',
            a: 'All warranty data is encrypted and stored securely. We never sell your data.',
          },
        ].map(({ q, a }) => (
          <div key={q}>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.01em' }}>{q}</div>
            <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>{a}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer>
        <div style={{ fontSize: '13px', color: '#444' }}>© {new Date().getFullYear()} Aegis. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="/privacy" style={{ fontSize: '13px', color: '#444', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ fontSize: '13px', color: '#444', textDecoration: 'none' }}>Terms</a>
        </div>
      </footer>
    </div>
  );
}

function PlanCard({ plan, planKey, badge, highlighted, onSelect, loading, paddleReady }) {
  return (
    <div style={{
      background: highlighted ? '#fff' : '#0f0f0f',
      border: `1px solid ${highlighted ? 'transparent' : '#1a1a1a'}`,
      borderRadius: '24px',
      padding: '36px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      position: 'relative',
      transition: 'transform 0.2s, border-color 0.2s',
    }}>
      {badge && (
        <div style={{
          position: 'absolute',
          top: '-13px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#4ade80',
          color: '#000',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '4px 14px',
          borderRadius: '100px',
          whiteSpace: 'nowrap',
        }}>
          {badge}
        </div>
      )}

      {/* Plan name */}
      <div style={{
        fontSize: '13px',
        fontWeight: '700',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: highlighted ? '#888' : '#555',
        marginBottom: '12px',
      }}>
        {plan.name}
      </div>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
        <span style={{
          fontSize: '52px',
          fontWeight: '900',
          letterSpacing: '-0.04em',
          color: highlighted ? '#000' : '#fff',
          lineHeight: 1,
        }}>
          {plan.price}
        </span>
        <span style={{ fontSize: '14px', color: highlighted ? '#888' : '#555', fontWeight: '500' }}>/ mo</span>
      </div>

      <div style={{ fontSize: '13px', color: highlighted ? '#888' : '#555', marginBottom: '32px' }}>
        14-day free trial included
      </div>

      {/* CTA */}
      <button
        onClick={() => onSelect(planKey)}
        disabled={!paddleReady || loading}
        style={{
          background: highlighted ? '#000' : '#fff',
          color: highlighted ? '#fff' : '#000',
          border: 'none',
          borderRadius: '100px',
          padding: '15px 28px',
          fontSize: '13px',
          fontWeight: '800',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: paddleReady ? 'pointer' : 'not-allowed',
          opacity: !paddleReady ? 0.5 : 1,
          marginBottom: '32px',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {loading ? (
          <>
            <span style={{
              width: '14px', height: '14px', border: `2px solid ${highlighted ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
              borderTopColor: highlighted ? '#fff' : '#000',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
            }} />
            Opening...
          </>
        ) : (
          'Start free trial'
        )}
      </button>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${highlighted ? '#e8e8e8' : '#1a1a1a'}`, marginBottom: '28px' }} />

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {plan.features.map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: highlighted ? '#000' : '#4ade80', flexShrink: 0 }}>{CHECK_ICON}</span>
            <span style={{ fontSize: '14px', color: highlighted ? '#333' : '#bbb', lineHeight: '1.4' }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
