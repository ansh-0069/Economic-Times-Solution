import React, { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Download, TrendingUp, Target, Zap, Calendar, CheckCircle } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import ScoreRing from '../components/ScoreRing';
import FindingCard from '../components/FindingCard';
import { fmt, useReveal, useRevealStagger, AnimatedNumber, scoreGlowClass } from '../utils/helpers';

function MetricTile({ label, value, sub, color }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      }}
      className="card"
      style={{ textAlign: 'center', padding: '20px 22px' }}
    >
      <div className="stat-label" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{
        fontSize: 22, fontWeight: 700, color: color || 'var(--text)',
        letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{sub}</div>}
    </motion.div>
  );
}

function MoneyHealthRadar({ scores, fire, tax }) {
  const emergencyTarget = fire?.emergency_fund_target || 1;
  const currentCorpus = fire?.current_investable ? fire.current_investable * 6 : 0;
  const emergencyScore = Math.min(100, Math.round((currentCorpus / emergencyTarget) * 70 + 30));
  const insuranceScore = tax?.deduction_gaps?.some(g => g.section?.includes('80D')) ? 40 : 72;

  const dimensions = [
    { dim: 'Diversification', score: scores.diversification || 50 },
    { dim: 'Tax Efficiency', score: scores.tax_optimisation || 50 },
    { dim: 'Returns', score: scores.returns || 50 },
    { dim: 'Cost Efficiency', score: scores.cost_efficiency || 50 },
    { dim: 'Emergency Fund', score: emergencyScore },
    { dim: 'Insurance', score: insuranceScore },
  ];

  const avg = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);
  const reveal = useReveal({ delay: 0.1 });

  return (
    <motion.div {...reveal} className="card" style={{ marginBottom: 28, padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div className="section-title" style={{ fontSize: 16 }}>Money Health Score</div>
          <div className="section-sub">6-dimensional financial wellness</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em' }}>
            <AnimatedNumber value={avg} style={{ color: avg >= 70 ? 'var(--green)' : avg >= 50 ? 'var(--amber)' : 'var(--red)' }} />
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text3)' }}>/100</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Overall Wellness</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={270}>
        <RadarChart data={dimensions} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: 'var(--text2)' }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Score" dataKey="score" stroke="#818cf8" fill="url(#radarGrad)" fillOpacity={0.2} strokeWidth={2} />
          <defs>
            <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{ background: 'rgba(12,12,18,0.9)', backdropFilter: 'blur(12px)', border: '1px solid var(--border2)', borderRadius: 10, fontSize: 12 }}
            formatter={(v) => [`${v}/100`, 'Score']}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
        {dimensions.map(d => (
          <div key={d.dim} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: d.score >= 70 ? 'var(--green)' : d.score >= 50 ? 'var(--amber)' : 'var(--red)',
            }} />
            <span style={{ color: 'var(--text2)' }}>{d.dim}: </span>
            <span style={{ fontWeight: 600, color: d.score >= 70 ? 'var(--green)' : d.score >= 50 ? 'var(--amber)' : 'var(--red)' }}>
              {d.score}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Peer Percentile Rank ──────────────────────────────────────────────────────
function PeerPercentile({ score }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const percentile = useMemo(() => {
    if (score >= 85) return 95;
    if (score >= 75) return 82;
    if (score >= 65) return 68;
    if (score >= 55) return 52;
    if (score >= 45) return 35;
    if (score >= 35) return 22;
    return 10;
  }, [score]);

  const desc = percentile >= 80 ? 'Top tier — better than most retail investors'
    : percentile >= 60 ? 'Above average — you\'re on the right track'
    : percentile >= 40 ? 'Average — room for improvement'
    : 'Below average — needs attention';

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card" style={{ marginBottom: 28, padding: '24px 28px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
        <div className="section-title" style={{ fontSize: 15 }}>Peer Comparison</div>
      </div>
      <div className="section-sub" style={{ marginBottom: 20 }}>
        How your financial health compares to other Indian retail investors
      </div>

      <div style={{ position: 'relative', padding: '28px 0 8px' }}>
        <div className="percentile-bar">
          <div className="percentile-bar-bg" />
          <div className="percentile-marker" style={{ left: isInView ? `${percentile}%` : '0%' }}>
            <div className="percentile-label">
              Top {100 - percentile}%
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text3)' }}>
          <span>Needs work</span>
          <span>Average</span>
          <span>Excellent</span>
        </div>
      </div>

      <div style={{
        marginTop: 16, padding: '14px 18px', borderRadius: 12,
        background: percentile >= 60 ? 'var(--green-dim)' : 'var(--amber-dim)',
        border: `1px solid ${percentile >= 60 ? 'var(--green-border)' : 'var(--amber-border)'}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em',
          color: percentile >= 60 ? 'var(--green)' : 'var(--amber)',
        }}>
          P{percentile}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{desc}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            Based on Money Health Score: {score}/100
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Action Timeline ───────────────────────────────────────────────────────────
function ActionTimeline({ findings = [], fire, tax, xray }) {
  const actions = useMemo(() => {
    const list = [];

    const highOverlap = xray?.high_overlap_pairs?.length > 0;
    if (highOverlap) {
      list.push({
        week: 'Week 1',
        title: 'Consolidate overlapping funds',
        detail: `Exit ${xray.high_overlap_pairs[0]?.fund_b?.split(' ').slice(0, 3).join(' ')} and redirect SIP to your best-performing fund.`,
        icon: Target,
        priority: 'high',
      });
    }

    if (tax?.annual_saving > 0) {
      list.push({
        week: highOverlap ? 'Week 2' : 'Week 1',
        title: `Switch to ${tax.recommended}`,
        detail: `Save ${fmt.rupees(tax.annual_saving)}/year by switching tax regime.`,
        icon: Zap,
        priority: 'high',
      });
    }

    const gaps = tax?.deduction_gaps || [];
    if (gaps.length > 0) {
      list.push({
        week: `Week ${list.length + 1}`,
        title: `Claim missing deductions`,
        detail: `Invest in ${gaps.map(g => `Sec ${g.section}`).join(', ')} to save ${fmt.rupees(tax.total_gap_saving)}.`,
        icon: Calendar,
        priority: 'moderate',
      });
    }

    if (fire?.extra_sip_needed > 0) {
      list.push({
        week: `Month 1`,
        title: `Increase SIP by ${fmt.rupees(fire.extra_sip_needed)}/mo`,
        detail: `Close your retirement corpus gap of ${fmt.rupees(fire.corpus_gap || 0)}.`,
        icon: TrendingUp,
        priority: 'moderate',
      });
    }

    const drag = xray?.annual_expense_drag;
    if (drag > 5000) {
      list.push({
        week: `Month 2`,
        title: 'Switch to Direct plans',
        detail: `Save ~${fmt.rupees(drag * 0.4)}/year by moving from Regular to Direct plans.`,
        icon: CheckCircle,
        priority: 'low',
      });
    }

    findings.filter(f => f.severity === 'good').forEach(f => {
      list.push({
        week: 'Ongoing',
        title: `Keep up: ${f.title}`,
        detail: f.detail || 'Continue your current strategy.',
        icon: CheckCircle,
        priority: 'done',
      });
    });

    return list;
  }, [findings, fire, tax, xray]);

  if (!actions.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card" style={{ marginBottom: 28, padding: '24px 28px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Calendar size={14} style={{ color: 'var(--accent)' }} />
        <div className="section-title" style={{ fontSize: 15 }}>Your Action Plan</div>
      </div>
      <div className="section-sub" style={{ marginBottom: 20 }}>
        A prioritized, time-bound plan to optimize your finances
      </div>

      <div>
        {actions.map((a, i) => {
          const Icon = a.icon;
          const dotColor = a.priority === 'high' ? 'var(--red)' : a.priority === 'moderate' ? 'var(--amber)' : a.priority === 'done' ? 'var(--green)' : 'var(--accent)';
          return (
            <motion.div key={i} className="action-timeline-step"
              initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            >
              <div className="action-timeline-dot" style={{ borderColor: dotColor, color: dotColor }}>{i + 1}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{a.detail}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: dotColor,
                  background: `${dotColor}15`, padding: '3px 10px', borderRadius: 100,
                  whiteSpace: 'nowrap',
                }}>{a.week}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function VerdictPage({ data, onContinue, onReset }) {
  const { verdict, xray, fire, tax, investor_name } = data;
  const scores   = verdict?.scores   || {};
  const findings = verdict?.findings || [];
  const beatsNifty = (xray?.alpha_pct ?? 0) >= 0;

  const headerReveal = useReveal();
  const bentoReveal = useRevealStagger({ stagger: 0.06 });
  const metricsReveal = useRevealStagger({ stagger: 0.08 });
  const findingsReveal = useReveal({ delay: 0.05 });
  const ctaReveal = useReveal({ delay: 0.1 });

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Nav */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 24 }}
      >
        <motion.button className="btn-ghost" onClick={onReset} whileTap={{ scale: 0.96 }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12 }}>
          <ArrowLeft size={13} /> New Analysis
        </motion.button>
      </motion.div>

      {/* Header */}
      <motion.div ref={headerReveal.ref} variants={headerReveal.variants}
        initial={headerReveal.initial} animate={headerReveal.animate}
        style={{ marginBottom: 40 }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11, color: 'var(--accent)', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
          background: 'var(--accent-dim)', padding: '5px 14px', borderRadius: 100,
          border: '1px solid var(--accent-border)',
        }}>
          <CheckCircle2 size={12} />
          Analysis Complete
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.25, marginBottom: 14, letterSpacing: '-0.03em' }}>
          {investor_name ? `${investor_name}, here's your` : "Here's your"}{' '}
          <span className="gradient-text">financial X-ray.</span>
        </h1>
        {verdict?.summary && (
          <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 600 }}>
            {verdict.summary}
          </p>
        )}
      </motion.div>

      {/* Score Bento Grid */}
      <motion.div ref={bentoReveal.ref} variants={bentoReveal.container}
        initial="hidden" animate={bentoReveal.animate}
        style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: 14,
          marginBottom: 28,
        }}
      >
        <motion.div
          variants={bentoReveal.item}
          className={`card ${scoreGlowClass(scores.overall || 0)}`}
          style={{
            gridRow: '1 / 3',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '28px 20px',
          }}
        >
          <div className="stat-label" style={{ marginBottom: 4 }}>Overall Health</div>
          <ScoreRing score={scores.overall || 0} size={130} label="" />
        </motion.div>

        {[
          { score: scores.returns || 0, label: 'Returns' },
          { score: scores.diversification || 0, label: 'Diversification' },
          { score: scores.cost_efficiency || 0, label: 'Cost Efficiency' },
          { score: scores.tax_optimisation || 0, label: 'Tax Optimisation' },
        ].map(({ score, label }) => (
          <motion.div key={label} variants={bentoReveal.item}
            className={`card ${scoreGlowClass(score)}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px 20px' }}>
            <ScoreRing score={score} size={80} label={label} />
          </motion.div>
        ))}
      </motion.div>

      {/* Money Health Radar */}
      <MoneyHealthRadar scores={scores} fire={fire} tax={tax} />

      {/* Peer Percentile */}
      <PeerPercentile score={scores.overall || 0} />

      {/* Action Plan Timeline */}
      <ActionTimeline findings={findings} fire={fire} tax={tax} xray={xray} />

      {/* Snapshot Metrics */}
      <motion.div ref={metricsReveal.ref} variants={metricsReveal.container}
        initial="hidden" animate={metricsReveal.animate}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}
      >
        <MetricTile
          label="Portfolio Value"
          value={fmt.rupees(xray?.total_current_value)}
          sub={`Invested ${fmt.rupees(xray?.total_invested)}`}
        />
        <MetricTile
          label="Portfolio XIRR"
          value={`${xray?.portfolio_xirr_pct?.toFixed(1)}%`}
          sub={beatsNifty ? `+${xray?.alpha_pct?.toFixed(1)}% alpha vs Nifty` : `${xray?.alpha_pct?.toFixed(1)}% vs Nifty`}
          color={beatsNifty ? 'var(--green)' : 'var(--red)'}
        />
        <MetricTile
          label="Absolute Gain"
          value={fmt.rupees(xray?.absolute_gain)}
          sub={`${xray?.absolute_gain_pct?.toFixed(1)}% total return`}
          color={(xray?.absolute_gain ?? 0) >= 0 ? 'var(--green)' : 'var(--red)'}
        />
      </motion.div>

      {/* Findings */}
      <motion.div ref={findingsReveal.ref} variants={findingsReveal.variants}
        initial={findingsReveal.initial} animate={findingsReveal.animate}
        style={{ marginBottom: 28 }}
      >
        <div className="stat-label" style={{ marginBottom: 16 }}>Key Findings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {findings.map((f, i) => (
            <FindingCard key={f.id || i} finding={f} delay={i * 100} />
          ))}
        </div>
      </motion.div>

      {/* Good news */}
      {verdict?.good_news && (
        <motion.div ref={useReveal({ delay: 0.05 }).ref}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'var(--green-dim)',
            border: '1px solid var(--green-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 22px',
            marginBottom: 28,
            fontSize: 13,
            color: 'var(--text2)',
            lineHeight: 1.7,
          }}
        >
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>Good news: </span>
          {verdict.good_news}
        </motion.div>
      )}

      {/* CTA */}
      <motion.div ref={ctaReveal.ref} variants={ctaReveal.variants}
        initial={ctaReveal.initial} animate={ctaReveal.animate}
        style={{ display: 'flex', gap: 12, flexDirection: 'column' }}
      >
        <motion.button
          className="btn-primary"
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.01 }}
          style={{ width: '100%', padding: '16px 24px', fontSize: 16, fontWeight: 700 }}
          onClick={onContinue}
        >
          See Full Analysis
        </motion.button>
        <motion.button
          className="btn-ghost"
          whileTap={{ scale: 0.96 }}
          style={{ width: '100%', padding: '12px 24px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onClick={() => window.print()}
        >
          <Download size={14} /> Download Report as PDF
        </motion.button>
      </motion.div>

      {/* SEBI Disclaimer */}
      <div className="disclaimer-footer">
        <strong>Disclaimer:</strong> This tool is for informational and educational purposes only. It does not constitute
        investment advice, tax advice, or financial planning services under SEBI (Investment Advisers)
        Regulations, 2013. Always consult a SEBI-registered investment advisor before making financial decisions.
        Past performance does not guarantee future returns. Mutual fund investments are subject to market risks.
      </div>
    </div>
  );
}
