import React, { useRef, useEffect, useState } from 'react';
import { useInView, useSpring, useTransform, motion } from 'framer-motion';

// ── Formatting ──────────────────────────────────────────────────────────────────
export const fmt = {
  rupees: (n) => {
    if (!n && n !== 0) return '—';
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    if (abs >= 1e7)  return `${sign}₹${(abs/1e7).toFixed(1)}Cr`;
    if (abs >= 1e5)  return `${sign}₹${(abs/1e5).toFixed(1)}L`;
    if (abs >= 1000) return `${sign}₹${(abs/1000).toFixed(0)}K`;
    return `${sign}₹${abs.toFixed(0)}`;
  },
  pct: (n, decimals=1) => {
    if (n === null || n === undefined) return '—';
    const sign = n > 0 ? '+' : '';
    return `${sign}${Number(n).toFixed(decimals)}%`;
  },
  num: (n) => Number(n).toLocaleString('en-IN'),
};

// ── API ─────────────────────────────────────────────────────────────────────────
const BASE = process.env.REACT_APP_API || 'http://localhost:8000';

export async function analyseDemo() {
  const fd = new FormData();
  fd.append('use_demo', 'true');
  const r = await fetch(`${BASE}/analyse`, { method: 'POST', body: fd });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}

export async function analyseWithFiles(camsFile, form16File, goalData) {
  const fd = new FormData();
  fd.append('use_demo', 'false');
  if (camsFile)   fd.append('cams_file', camsFile);
  if (form16File) fd.append('form16_file', form16File);
  if (goalData)   fd.append('goal_data_json', JSON.stringify(goalData));
  const r = await fetch(`${BASE}/analyse`, { method: 'POST', body: fd });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}

export async function askQuestion(question, context) {
  const r = await fetch(`${BASE}/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context }),
  });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}

// ── Colour helpers ──────────────────────────────────────────────────────────────
export const severityColor = (s) => ({
  critical:    'var(--red)',
  warning:     'var(--amber)',
  opportunity: 'var(--green)',
}[s] || 'var(--text2)');

export const scoreColor = (n) =>
  n >= 75 ? 'var(--green)' : n >= 50 ? 'var(--amber)' : 'var(--red)';

export const scoreGlowClass = (n) =>
  n >= 75 ? 'score-glow-green' : n >= 50 ? 'score-glow-amber' : 'score-glow-red';

// ── Scroll-reveal hook ──────────────────────────────────────────────────────────
export function useReveal({ threshold = 0.15, once = true, delay = 0 } = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: threshold, once });

  const variants = {
    hidden: { opacity: 0, y: 40, scale: 0.97 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: {
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return { ref, variants, animate: isInView ? 'visible' : 'hidden', initial: 'hidden' };
}

export function useRevealStagger({ threshold = 0.1, once = true, stagger = 0.08 } = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: threshold, once });

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return { ref, container, item, animate: isInView ? 'visible' : 'hidden' };
}

// ── Animated number component ───────────────────────────────────────────────────
export function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0, duration = 1.2, style = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-IN')
  );

  useEffect(() => {
    if (isInView) spring.set(value || 0);
  }, [isInView, value, spring]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}<motion.span>{display}</motion.span>{suffix}
    </span>
  );
}
