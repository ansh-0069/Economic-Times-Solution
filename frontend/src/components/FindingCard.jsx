import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { severityColor } from '../utils/helpers';

const borderColors = {
  critical:    'var(--red)',
  warning:     'var(--amber)',
  opportunity: 'var(--green)',
};
const bgColors = {
  critical:    'rgba(255,77,109,0.05)',
  warning:     'rgba(255,183,77,0.05)',
  opportunity: 'rgba(0,229,160,0.05)',
};
const glowColors = {
  critical:    '0 0 20px rgba(255,77,109,0.12)',
  warning:     '0 0 20px rgba(255,183,77,0.10)',
  opportunity: '0 0 20px rgba(0,229,160,0.10)',
};

export default function FindingCard({ finding, delay = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const c   = borderColors[finding.severity] || 'var(--glass-border)';
  const bg  = bgColors[finding.severity]     || 'var(--glass-bg)';
  const glow = glowColors[finding.severity]  || 'none';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, scale: 1.008 }}
      style={{
        border: `0.5px solid ${c}`,
        borderLeft: `3px solid ${c}`,
        borderRadius: 'var(--radius)',
        background: bg,
        padding: '18px 20px',
        cursor: 'pointer',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'box-shadow 0.25s',
        boxShadow: glow,
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Subtle gradient sheen */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%)`,
        pointerEvents: 'none',
        borderRadius: 'inherit',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{finding.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{
              fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: severityColor(finding.severity),
              background: bgColors[finding.severity],
              padding: '2px 8px', borderRadius: 20,
              border: `0.5px solid ${c}`,
            }}>
              {finding.severity}
            </span>
            <span style={{ fontSize: 9, color: 'var(--text3)' }}>·</span>
            <span style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
              {finding.category}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, marginBottom: 4 }}>
            {finding.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>
            {finding.headline}
          </div>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ color: 'var(--text3)', fontSize: 14, flexShrink: 0, marginTop: 6 }}
        >
          ▼
        </motion.span>
      </div>

      {/* Expanded section */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginLeft: 34, borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: 14, marginTop: 10 }}>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 14 }}>
                {finding.detail}
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 13,
                borderLeft: `2px solid ${c}`,
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{ color: 'var(--text3)', fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Action →{' '}
                </span>
                <span style={{ color: 'var(--text)' }}>{finding.action}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
