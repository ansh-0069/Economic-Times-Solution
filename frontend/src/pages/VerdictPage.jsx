import React from 'react';
import { motion } from 'framer-motion';
import ScoreRing from '../components/ScoreRing';
import FindingCard from '../components/FindingCard';
import { fmt } from '../utils/helpers';

const tileVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1 },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

// ── Metric Tile ────────────────────────────────────────────────────────────────
function MetricTile({ label, value, sub, color, alphaGlow = false, style = {} }) {
  return (
    <motion.div
      variants={tileVariants}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={alphaGlow ? 'alpha-glow' : ''}
      style={{
        background: 'var(--glass-bg)',
        border: `0.5px solid ${alphaGlow ? 'rgba(0,229,160,0.25)' : 'var(--glass-border)'}`,
        borderRadius: 'var(--radius)',
        padding: '18px 20px',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Top-right glow dot for alpha glow cards */}
      {alphaGlow && (
        <div style={{
          position: 'absolute', top: 10, right: 12,
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--green)',
          boxShadow: '0 0 12px rgba(0,229,160,0.9)',
        }} />
      )}
      <div style={{
        fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase',
        letterSpacing: '0.09em', marginBottom: 7, fontWeight: 700,
      }}>{label}</div>
      <div style={{
        fontSize: 22, fontWeight: 800, color: color || 'var(--text)',
        letterSpacing: '-0.02em', lineHeight: 1,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>{sub}</div>}
    </motion.div>
  );
}

// ── Main Verdict Page ──────────────────────────────────────────────────────────
export default function VerdictPage({ data, onContinue }) {
  const { verdict, xray, investor_name } = data;
  const scores   = verdict?.scores   || {};
  const findings = verdict?.findings || [];
  const beatsNifty = (xray?.alpha_pct ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: 820, margin: '0 auto', padding: '44px 20px 80px' }}
    >

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 40 }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 11, color: 'var(--green)', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12,
          background: 'rgba(0,229,160,0.1)', padding: '5px 14px', borderRadius: 20,
          border: '0.5px solid rgba(0,229,160,0.2)',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--green)',
            boxShadow: '0 0 8px rgba(0,229,160,0.8)',
          }} />
          FinMentor AI · Analysis Complete
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.25, marginBottom: 14, letterSpacing: '-0.02em' }}>
          {investor_name ? `${investor_name}, here's what I found.` : "Here's what I found."}
        </h1>
        {verdict?.summary && (
          <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 640 }}>
            {verdict.summary}
          </p>
        )}
      </motion.div>

      {/* ── Score Bento Grid ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {/* Overall — big tile, spans 2 rows */}
        <motion.div
          variants={tileVariants}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            gridRow: '1 / 3',
            background: 'var(--glass-bg)',
            border: '0.5px solid var(--glass-border2)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 20px',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: 'linear-gradient(160deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.01) 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.4,
            background: `radial-gradient(ellipse at 50% 80%, rgba(0,229,160,0.08) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Overall Health
          </div>
          <ScoreRing score={scores.overall || 0} size={130} label="" />
        </motion.div>

        {/* Sub-scores grid (2 cols × 2 rows) */}
        <motion.div variants={tileVariants} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
          style={{ background: 'var(--glass-bg)', border: '0.5px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '18px 20px', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ScoreRing score={scores.returns || 0} size={80} label="Returns" />
        </motion.div>
        <motion.div variants={tileVariants} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
          style={{ background: 'var(--glass-bg)', border: '0.5px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '18px 20px', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ScoreRing score={scores.diversification || 0} size={80} label="Diversification" />
        </motion.div>
        <motion.div variants={tileVariants} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
          style={{ background: 'var(--glass-bg)', border: '0.5px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '18px 20px', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ScoreRing score={scores.cost_efficiency || 0} size={80} label="Cost Efficiency" />
        </motion.div>
        <motion.div variants={tileVariants} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
          style={{ background: 'var(--glass-bg)', border: '0.5px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '18px 20px', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ScoreRing score={scores.tax_optimisation || 0} size={80} label="Tax Optimisation" />
        </motion.div>
      </motion.div>

      {/* ── Snapshot Metrics — Bento row ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}
      >
        <MetricTile
          label="Portfolio Value"
          value={fmt.rupees(xray?.total_current_value)}
          sub={`Invested ${fmt.rupees(xray?.total_invested)}`}
        />
        <MetricTile
          label="Portfolio XIRR"
          value={`${xray?.portfolio_xirr_pct?.toFixed(1)}%`}
          sub={beatsNifty ? `↑ +${xray?.alpha_pct?.toFixed(1)}% alpha vs Nifty` : `↓ ${xray?.alpha_pct?.toFixed(1)}% vs Nifty`}
          color={beatsNifty ? 'var(--green)' : 'var(--red)'}
          alphaGlow={beatsNifty}
        />
        <MetricTile
          label="Absolute Gain"
          value={fmt.rupees(xray?.absolute_gain)}
          sub={`${xray?.absolute_gain_pct?.toFixed(1)}% total return`}
          color={(xray?.absolute_gain ?? 0) >= 0 ? 'var(--green)' : 'var(--red)'}
        />
      </motion.div>

      {/* ── Findings ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 32 }}
      >
        <div style={{
          fontSize: 10, color: 'var(--text3)', marginBottom: 14,
          textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
        }}>
          3 Things I Found In Your Portfolio
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {findings.map((f, i) => (
            <FindingCard key={f.id || i} finding={f} delay={i * 100} />
          ))}
        </div>
      </motion.div>

      {/* ── Good news banner ── */}
      {verdict?.good_news && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'rgba(0,229,160,0.07)',
            border: '0.5px solid rgba(0,229,160,0.22)',
            borderRadius: 'var(--radius)',
            padding: '14px 20px',
            marginBottom: 28,
            fontSize: 13,
            color: 'var(--text2)',
            lineHeight: 1.7,
            backdropFilter: 'blur(16px)',
          }}
        >
          <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓ Good news: </span>
          {verdict.good_news}
        </motion.div>
      )}

      {/* ── CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', gap: 12 }}
      >
        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{ flex: 1, padding: '15px 24px', fontSize: 16, fontWeight: 800, letterSpacing: '0.01em' }}
          onClick={onContinue}
        >
          See Full Analysis →
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
