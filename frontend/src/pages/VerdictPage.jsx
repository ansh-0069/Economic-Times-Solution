import React from 'react';
import ScoreRing from '../components/ScoreRing';
import FindingCard from '../components/FindingCard';
import { fmt } from '../utils/helpers';

export default function VerdictPage({ data, onContinue }) {
  const { verdict, xray, investor_name } = data;
  const scores = verdict?.scores || {};
  const findings = verdict?.findings || [];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          FinMentor AI · Analysis Complete
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>
          {investor_name ? `${investor_name}, here's what I found.` : "Here's what I found."}
        </h1>
        {verdict?.summary && (
          <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 600 }}>
            {verdict.summary}
          </p>
        )}
      </div>

      {/* Score rings */}
      <div className="card fade-up-delay-1" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20,
          textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          Portfolio Health Score
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: 24, justifyItems: 'center',
        }}>
          <ScoreRing score={scores.overall || 0} size={110} label="Overall" />
          <ScoreRing score={scores.returns || 0} size={80} label="Returns" />
          <ScoreRing score={scores.diversification || 0} size={80} label="Diversification" />
          <ScoreRing score={scores.cost_efficiency || 0} size={80} label="Cost Efficiency" />
          <ScoreRing score={scores.tax_optimisation || 0} size={80} label="Tax Optimisation" />
        </div>
      </div>

      {/* Snapshot metrics */}
      <div className="fade-up-delay-1" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Portfolio Value', value: fmt.rupees(xray?.total_current_value), sub: `Invested ${fmt.rupees(xray?.total_invested)}` },
          { label: 'Portfolio XIRR', value: `${xray?.portfolio_xirr_pct?.toFixed(1)}%`, sub: `Nifty: ${xray?.nifty_3y_pct}%`, color: xray?.alpha_pct >= 0 ? 'var(--green)' : 'var(--red)' },
          { label: 'Absolute Gain', value: fmt.rupees(xray?.absolute_gain), sub: `${xray?.absolute_gain_pct?.toFixed(1)}% total return`, color: xray?.absolute_gain >= 0 ? 'var(--green)' : 'var(--red)' },
        ].map((m, i) => (
          <div key={i} className="card" style={{ textAlign: 'center' }}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value" style={{ fontSize: 20, color: m.color || 'var(--text)' }}>{m.value}</div>
            <div className="metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Findings */}
      <div className="fade-up-delay-2" style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14,
          textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          3 Things I Found In Your Portfolio
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {findings.map((f, i) => (
            <FindingCard key={f.id} finding={f} delay={i * 120} />
          ))}
        </div>
      </div>

      {/* Good news */}
      {verdict?.good_news && (
        <div className="fade-up-delay-3" style={{
          background: 'var(--green-dim)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 28,
          fontSize: 13, color: 'var(--text2)', lineHeight: 1.6,
        }}>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Good news: </span>
          {verdict.good_news}
        </div>
      )}

      {/* CTA */}
      <div className="fade-up-delay-3" style={{ display: 'flex', gap: 12 }}>
        <button className="btn-primary" style={{ flex: 1, padding: 13, fontSize: 15 }}
          onClick={onContinue}>
          See Full Analysis →
        </button>
      </div>

    </div>
  );
}
