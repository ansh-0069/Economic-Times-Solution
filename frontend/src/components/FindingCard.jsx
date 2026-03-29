import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { severityColor } from '../utils/helpers';

const accentMap = {
  critical:    { border: 'var(--red)',   bg: 'var(--red-dim)',   dot: 'var(--red)'   },
  warning:     { border: 'var(--amber)', bg: 'var(--amber-dim)', dot: 'var(--amber)' },
  opportunity: { border: 'var(--green)', bg: 'var(--green-dim)', dot: 'var(--green)' },
};

export default function FindingCard({ finding, delay = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const palette = accentMap[finding.severity] || { border: 'var(--border)', bg: 'var(--bg3)', dot: 'var(--text3)' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      style={{
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${palette.border}`,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg2)',
        padding: '18px 22px',
        cursor: 'pointer',
        transition: 'box-shadow 0.3s, border-color 0.3s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      }}
      onClick={() => setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: palette.dot, flexShrink: 0, marginTop: 7,
          boxShadow: `0 0 8px ${palette.dot}`,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: severityColor(finding.severity),
            }}>
              {finding.severity}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>·</span>
            <span style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
              {finding.category}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, marginBottom: 3 }}>
            {finding.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
            {finding.headline}
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ color: 'var(--text3)', flexShrink: 0, marginTop: 4 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </div>

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
            <div style={{ marginLeft: 20, borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 12 }}>
                {finding.detail}
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 13,
                borderLeft: `2px solid ${palette.border}`,
              }}>
                <span style={{ color: 'var(--text3)', fontSize: 10, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Action{' '}
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
