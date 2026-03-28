import React, { useState } from 'react';
import { severityColor } from '../utils/helpers';

const borderColors = {
  critical:    'var(--red)',
  warning:     'var(--amber)',
  opportunity: 'var(--green)',
};
const bgColors = {
  critical:    'rgba(239,68,68,0.06)',
  warning:     'rgba(245,158,11,0.06)',
  opportunity: 'rgba(16,185,129,0.06)',
};

export default function FindingCard({ finding, delay = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const c = borderColors[finding.severity] || 'var(--border)';
  const bg = bgColors[finding.severity] || 'var(--bg2)';

  return (
    <div
      className="fade-up"
      style={{
        animationDelay: `${delay}ms`,
        border: `1px solid ${c}`,
        borderLeft: `4px solid ${c}`,
        borderRadius: 'var(--radius)',
        background: bg,
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'transform 0.15s',
      }}
      onClick={() => setExpanded(e => !e)}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{finding.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: severityColor(finding.severity),
            }}>
              {finding.severity}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>·</span>
            <span style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {finding.category}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, marginBottom: 4 }}>
            {finding.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
            {finding.headline}
          </div>
        </div>
        <span style={{ color: 'var(--text3)', fontSize: 16, flexShrink: 0, marginTop: 4 }}>
          {expanded ? '↑' : '↓'}
        </span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ marginLeft: 34, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 12 }}>
            {finding.detail}
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 8,
            padding: '10px 14px', fontSize: 13,
            borderLeft: `3px solid ${c}`,
          }}>
            <span style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Action →{' '}
            </span>
            <span style={{ color: 'var(--text)' }}>{finding.action}</span>
          </div>
        </div>
      )}
    </div>
  );
}
