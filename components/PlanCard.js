'use client';

const CHECK_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/**
 * One plan tile. Used by the landing page and the pricing page, and reads
 * everything from lib/plans.js so the two can never show different numbers.
 *
 * `available` is false for a plan nobody can buy yet; it shows a disabled
 * "Coming soon" button instead of a call to action that goes nowhere.
 */
export default function PlanCard({ plan, highlighted = false, available = true, current = false, href = '/login', cta = 'Get started' }) {
  const isFree = plan.key === 'free';
  const muted = highlighted ? '#888' : '#555';

  return (
    <div style={{
      background: highlighted ? '#fff' : '#0f0f0f',
      border: `1px solid ${highlighted ? 'transparent' : '#1a1a1a'}`,
      borderRadius: '24px',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {(current || !available) && (
        <div style={{
          position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
          background: current ? '#4ade80' : (highlighted ? '#f59e0b' : '#2a2a2a'),
          color: current ? '#000' : (highlighted ? '#000' : '#888'),
          fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase',
          padding: '4px 14px', borderRadius: '100px', whiteSpace: 'nowrap',
        }}>
          {current ? 'Your current plan' : 'Coming soon'}
        </div>
      )}

      <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: muted, marginBottom: '12px' }}>
        {plan.name}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
        <span style={{ fontSize: '44px', fontWeight: '900', letterSpacing: '-0.04em', color: highlighted ? '#000' : '#fff', lineHeight: 1 }}>
          {plan.price}
        </span>
        {plan.interval && <span style={{ fontSize: '13px', color: muted }}>/ {plan.interval}</span>}
      </div>

      <div style={{ fontSize: '12px', color: highlighted ? '#999' : '#444', marginBottom: '28px' }}>
        {isFree ? 'One time allowance. No card required.' : (available ? 'Billed monthly' : 'Coming soon. Not yet available to buy.')}
      </div>

      {available ? (
        <a href={href} style={{
          display: 'block', textAlign: 'center',
          background: '#fff', color: '#000', border: 'none', borderRadius: '100px',
          padding: '13px 28px', fontSize: '12px', fontWeight: '800',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          textDecoration: 'none', marginBottom: '28px',
        }}>
          {cta}
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
            <span style={{ color: highlighted ? '#000' : (isFree ? '#4ade80' : '#777'), flexShrink: 0, marginTop: '1px' }}>{CHECK_ICON}</span>
            <span style={{ fontSize: '13px', color: highlighted ? '#444' : (isFree ? '#bbb' : '#888'), lineHeight: '1.4' }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
