import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
  LineChart as RLineChart, Line, Legend,
} from 'recharts';
import {
  Crosshair, Flame, Receipt, MessageCircle, Search,
  ArrowUpRight, ArrowDownRight, TrendingUp, Lightbulb,
  Send, BarChart3, DollarSign, Target, Shield, X,
  AlertTriangle, Zap, Baby, Heart, Gift, Briefcase,
  ArrowLeft, Mic, MicOff, Newspaper, LineChart,
} from 'lucide-react';
import { fmt, askQuestion, scoreColor, useReveal } from '../utils/helpers';

const CHART_COLORS = ['#818cf8', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(12,12,18,0.9)', backdropFilter: 'blur(12px)',
      border: '1px solid var(--border2)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ color: 'var(--text3)', marginBottom: 4, fontWeight: 600, fontSize: 11 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text)', fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' && p.value > 10000 ? fmt.rupees(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

// ── Reveal wrapper ─────────────────────────────────────────────────────────────
function RevealCard({ children, delay = 0, className = 'card', style = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div ref={ref} className={className} style={style}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Overlap Network Graph ──────────────────────────────────────────────────────
function OverlapNetworkGraph({ folios = [], overlapMatrix = [] }) {
  const [hovered, setHovered] = useState(null);
  const W = 340, H = 260;
  const cx = W / 2, cy = H / 2;
  const n = folios.length;
  const radius = Math.min(W, H) * 0.34;

  const nodes = folios.map((f, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      id: i, label: f.scheme_name.split(' ').slice(0, 2).join(' '),
      x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle),
      xirr: f.xirr_pct,
    };
  });

  const edges = overlapMatrix.filter(e => e.pct > 0).map(e => {
    const ai = folios.findIndex(f => f.scheme_name === e.a);
    const bi = folios.findIndex(f => f.scheme_name === e.b);
    return { ...e, ai, bi };
  }).filter(e => e.ai >= 0 && e.bi >= 0);

  const edgeColor = (pct) =>
    pct > 45 ? 'var(--red)' : pct > 25 ? 'var(--amber)' : 'var(--border2)';

  return (
    <div>
      <div className="section-title" style={{ marginBottom: 4 }}>Fund Overlap Network</div>
      <div className="section-sub" style={{ marginBottom: 16 }}>
        Hover edges to see overlap. Red = paying for duplicate exposure.
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {edges.map((e, i) => {
          if (e.ai < 0 || e.bi < 0 || !nodes[e.ai] || !nodes[e.bi]) return null;
          const a = nodes[e.ai], b = nodes[e.bi];
          const isH = hovered === i;
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="transparent" strokeWidth={14} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)} />
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={edgeColor(e.pct)}
                strokeWidth={isH ? 2.5 : e.pct > 35 ? 1.5 : 1}
                strokeDasharray={e.pct < 20 ? '4 4' : 'none'}
                strokeOpacity={isH ? 1 : 0.6}
                style={{ transition: 'all 0.15s', pointerEvents: 'none' }} />
              {isH && (
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 9}
                  textAnchor="middle" fontSize={11} fontWeight={700}
                  fill={e.pct > 45 ? 'var(--red)' : 'var(--amber)'}
                  style={{ pointerEvents: 'none' }}>
                  {e.pct}% overlap
                </text>
              )}
            </g>
          );
        })}
        {nodes.map((nd, i) => {
          const isActive = hovered !== null && edges.some((e, ei) => ei === hovered && (e.ai === i || e.bi === i));
          return (
            <g key={i}>
              <circle cx={nd.x} cy={nd.y} r={20}
                fill="var(--bg3)"
                stroke={isActive ? 'var(--accent)' : 'var(--border2)'}
                strokeWidth={isActive ? 1.5 : 1}
                style={{ transition: 'stroke 0.15s' }} />
              <text x={nd.x} y={nd.y - 2} textAnchor="middle" fontSize={9} fontWeight={700}
                fill="var(--text)" style={{ pointerEvents: 'none' }}>
                {nd.label.split(' ').map(w => w[0]).join('').slice(0, 3)}
              </text>
              <text x={nd.x} y={nd.y + 9} textAnchor="middle" fontSize={7.5}
                fill="var(--text3)" style={{ pointerEvents: 'none' }}>
                {nd.xirr?.toFixed(1)}%
              </text>
              <text x={nd.x} y={nd.y + 33} textAnchor="middle" fontSize={8.5}
                fill="var(--text2)" fontWeight={500} style={{ pointerEvents: 'none' }}>
                {nd.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {[
          { c: 'var(--red)', l: '> 45% Critical' },
          { c: 'var(--amber)', l: '25-45% Moderate' },
          { c: 'var(--border2)', l: '< 25% Low' },
        ].map(({ c, l }) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text3)' }}>
            <div style={{ width: 16, height: 2, background: c, borderRadius: 1 }} />{l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Command Palette ────────────────────────────────────────────────────────────
function CommandPalette({ open, onClose, onAsk }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef();

  const QUICK = [
    { icon: BarChart3,  label: 'XIRR vs Nifty comparison',     hint: 'Returns',  q: 'How does my XIRR compare to Nifty?' },
    { icon: X,          label: 'Which fund should I exit?',     hint: 'Overlap',  q: 'Which fund should I exit first?' },
    { icon: Flame,      label: 'Can I retire at 50?',           hint: 'FIRE',     q: 'Can I retire at 50?' },
    { icon: DollarSign, label: 'Best tax regime for me?',       hint: 'Tax',      q: 'Which tax regime saves me more?' },
    { icon: TrendingUp, label: 'How much more SIP needed?',     hint: 'Planning', q: 'How much more SIP do I need monthly?' },
    { icon: Shield,     label: 'Expense drag over 10 years',    hint: 'Cost',     q: 'How much is my expense drag costing me over 10 years?' },
  ];

  const filtered = query.trim()
    ? QUICK.filter(q => q.label.toLowerCase().includes(query.toLowerCase()))
    : QUICK;

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const select = (q) => { onAsk(q); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="cmd-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }} onClick={onClose}>
          <motion.div className="cmd-palette"
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}>
            <div className="cmd-input-row">
              <Search size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              <input ref={inputRef} className="cmd-input"
                placeholder="Ask anything about your finances..."
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && query.trim()) select(query.trim()); }} />
              <kbd style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', fontSize: 11, color: 'var(--text3)' }}>ESC</kbd>
            </div>
            <div className="cmd-section-label">Quick questions</div>
            {filtered.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="cmd-item" onClick={() => select(item.q)}>
                  <div className="cmd-item-icon"><Icon size={15} /></div>
                  <div className="cmd-item-label">{item.label}</div>
                  <div className="cmd-item-hint">{item.hint}</div>
                </div>
              );
            })}
            {filtered.length === 0 && query && (
              <div className="cmd-item" onClick={() => select(query)}>
                <div className="cmd-item-icon"><MessageCircle size={15} /></div>
                <div className="cmd-item-label">Ask: "{query}"</div>
                <div className="cmd-item-hint">Send</div>
              </div>
            )}
            <div className="cmd-footer">
              <div className="cmd-kb"><kbd>Enter</kbd><span>to ask</span></div>
              <div className="cmd-kb"><kbd>ESC</kbd><span>to close</span></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Wealth Bleed Ticker ────────────────────────────────────────────────────────
function WealthBleedTicker({ annualDrag }) {
  const [elapsed, setElapsed] = useState(0);
  const perSecond = (annualDrag || 0) / (365.25 * 24 * 3600);

  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - t0) / 1000), 50);
    return () => clearInterval(id);
  }, []);

  const bled = perSecond * elapsed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bleed-ticker"
      style={{
        background: 'var(--red-dim)', border: '1px solid var(--red-border)',
        borderRadius: 'var(--radius-lg)', padding: '16px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18, gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={16} style={{ color: 'var(--red)', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
            Since you opened this page, your expense ratio has cost you
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
            {fmt.rupees(annualDrag)}/year in hidden fees across all funds
          </div>
        </div>
      </div>
      <div style={{
        fontSize: 24, fontWeight: 700, color: 'var(--red)',
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
        minWidth: 85, textAlign: 'right',
      }}>
        ₹{bled.toFixed(2)}
      </div>
    </motion.div>
  );
}

// ── Portfolio Stress Test ──────────────────────────────────────────────────────
function StressTestCard({ xray }) {
  const totalValue = xray?.total_current_value || 0;
  const equityPct = (xray?.allocation?.Equity || 0) / 100;
  const overlapPairs = xray?.high_overlap_pairs?.length || 0;
  const concentrationPenalty = Math.min(overlapPairs * 0.03, 0.12);
  const betaEstimate = equityPct * (1 + concentrationPenalty);

  const scenarios = [
    { label: 'Nifty -10%', drop: 0.10 },
    { label: 'Nifty -15%', drop: 0.15 },
    { label: 'Nifty -25%', drop: 0.25 },
  ];

  return (
    <RevealCard delay={0.1}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Zap size={14} style={{ color: 'var(--amber)' }} />
        <div className="section-title">Portfolio Stress Test</div>
      </div>
      <div className="section-sub" style={{ marginBottom: 14 }}>
        Estimated impact if the market corrects (beta: {betaEstimate.toFixed(2)}x)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {scenarios.map(({ label, drop }) => {
          const portfolioDrop = drop * betaEstimate;
          const loss = totalValue * portfolioDrop;
          return (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '16px 14px', textAlign: 'center',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--red)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                -{(portfolioDrop * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                -{fmt.rupees(loss)} loss
              </div>
            </div>
          );
        })}
      </div>
      {overlapPairs > 0 && (
        <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 10 }}>
          {overlapPairs} high-overlap pairs increase your concentration risk by ~{(concentrationPenalty * 100).toFixed(0)}%
        </div>
      )}
    </RevealCard>
  );
}

// ── What-If Life Event Simulator ───────────────────────────────────────────────
function WhatIfSimulator({ fire }) {
  const [event, setEvent] = useState(null);
  const [amount, setAmount] = useState('');

  const events = [
    { id: 'bonus', label: 'Got a Bonus', icon: Gift, defaultAmt: 500000 },
    { id: 'marriage', label: 'Getting Married', icon: Heart, defaultAmt: 1500000 },
    { id: 'baby', label: 'New Baby', icon: Baby, defaultAmt: 0 },
    { id: 'job', label: 'Job Switch', icon: Briefcase, defaultAmt: 0 },
  ];

  const amt = Number(amount) || 0;
  const need = fire?.corpus_needed || 0;
  const projected = fire?.projected_corpus || 0;
  const investable = fire?.current_investable || 0;
  const yrs = fire?.years_to_retire || 23;

  let newProjected = projected;
  let description = '';

  if (event === 'bonus' && amt > 0) {
    const invested = amt * 0.7;
    newProjected = projected + invested * Math.pow(1.12, yrs);
    description = `Invest 70% (${fmt.rupees(invested)}) of your bonus. Projected corpus increases by ${fmt.rupees(newProjected - projected)}.`;
  } else if (event === 'marriage' && amt > 0) {
    const spent = amt;
    const reducedCorpus = Math.max(0, (fire?.corpus_breakdown?.existing || 0) - spent);
    newProjected = reducedCorpus * Math.pow(1.12, yrs) + (projected - (fire?.corpus_breakdown?.existing || 0) * Math.pow(1.12, yrs));
    newProjected = Math.max(0, newProjected);
    description = `Wedding expense of ${fmt.rupees(spent)} reduces your projected corpus by ${fmt.rupees(Math.max(0, projected - newProjected))}.`;
  } else if (event === 'baby') {
    const extraExpense = 15000;
    const sipReduction = extraExpense * 12 * ((Math.pow(1.12, yrs) - 1) / 0.12);
    newProjected = Math.max(0, projected - sipReduction);
    description = `Additional ~₹15K/mo expenses reduce investable surplus. Corpus impact: -${fmt.rupees(Math.max(0, projected - newProjected))}.`;
  } else if (event === 'job' && amt > 0) {
    const newSip = amt * 0.5;
    const sipGain = newSip * 12 * ((Math.pow(1.12, yrs) - 1) / 0.12);
    newProjected = projected + sipGain;
    description = `Investing 50% of your raise (${fmt.rupees(newSip)}/mo) adds ${fmt.rupees(sipGain)} to projected corpus.`;
  }

  const newReadiness = need > 0 ? Math.min(100, Math.round(newProjected / need * 100)) : 0;
  const oldReadiness = fire?.readiness_score || 0;

  return (
    <RevealCard delay={0.15}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Zap size={14} style={{ color: 'var(--accent)' }} />
        <div className="section-title">What-If Simulator</div>
      </div>
      <div className="section-sub" style={{ marginBottom: 14 }}>
        How would a life event change your financial plan?
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
        {events.map(ev => {
          const Icon = ev.icon;
          const active = event === ev.id;
          return (
            <motion.div key={ev.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setEvent(active ? null : ev.id); setAmount(ev.defaultAmt || ''); }}
              style={{
                padding: '12px 8px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                background: active ? 'var(--accent-dim)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
                transition: 'all 0.2s',
              }}>
              <Icon size={16} style={{ color: active ? 'var(--accent)' : 'var(--text3)', margin: '0 auto 4px' }} />
              <div style={{ fontSize: 11, fontWeight: 500, color: active ? 'var(--accent)' : 'var(--text2)' }}>{ev.label}</div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {event && (
          <motion.div key={event} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            {(event === 'bonus' || event === 'marriage' || event === 'job') && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11 }}>
                  {event === 'bonus' ? 'Bonus amount' : event === 'marriage' ? 'Wedding budget' : 'Monthly salary increase'}
                </label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder={event === 'job' ? 'e.g. 30000' : 'e.g. 500000'}
                  style={{ marginTop: 4 }} />
              </div>
            )}
            {description && (
              <div style={{
                padding: '14px 16px', borderRadius: 10,
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', marginBottom: 12,
              }}>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 10 }}>{description}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Readiness</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: newReadiness >= oldReadiness ? 'var(--green)' : 'var(--red)' }}>
                      {newReadiness}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text3)' }}>/100</span>
                    </div>
                    <div style={{ fontSize: 10, color: newReadiness >= oldReadiness ? 'var(--green)' : 'var(--red)' }}>
                      {newReadiness >= oldReadiness ? '+' : ''}{newReadiness - oldReadiness} pts
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>New Corpus</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: newProjected >= projected ? 'var(--green)' : 'var(--red)' }}>
                      {fmt.rupees(newProjected)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Gap</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: newProjected >= need ? 'var(--green)' : 'var(--red)' }}>
                      {newProjected >= need ? 'None' : fmt.rupees(need - newProjected)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </RevealCard>
  );
}

// ── Benchmark Timeline ────────────────────────────────────────────────────────
function BenchmarkTimeline({ timeline = [] }) {
  if (!timeline.length) return null;
  const every = Math.max(1, Math.floor(timeline.length / 8));
  return (
    <RevealCard delay={0.08}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <LineChart size={14} style={{ color: 'var(--accent)' }} />
        <div className="section-title">Portfolio vs Nifty 50 Growth</div>
      </div>
      <div className="section-sub" style={{ marginBottom: 16 }}>
        Your actual portfolio growth compared to if you had invested the same amounts in Nifty 50
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <RLineChart data={timeline} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <defs>
            <linearGradient id="actualLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fontSize: 9.5, fill: 'var(--text3)' }} interval={every} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} tickFormatter={v => fmt.rupees(v)} width={60} />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--text2)' }}
            formatter={(value) => <span style={{ color: 'var(--text2)', fontSize: 11 }}>{value}</span>}
          />
          <Line type="monotone" dataKey="invested" name="Invested" stroke="var(--text3)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
          <Line type="monotone" dataKey="nifty" name="Nifty 50" stroke="#fbbf24" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="actual" name="Your Portfolio" stroke="url(#actualLine)" strokeWidth={2.5} dot={false} />
        </RLineChart>
      </ResponsiveContainer>
    </RevealCard>
  );
}

// ── Regulatory News Feed ──────────────────────────────────────────────────────
function RegulatoryNewsFeed() {
  const updates = [
    {
      date: 'Mar 2026',
      source: 'SEBI',
      title: 'New flexi-cap allocation norms',
      impact: 'Flexi-cap funds must now hold min 65% in equity across large/mid/small caps. Your flexi-cap funds may rebalance — check if this changes your overlap.',
      severity: 'moderate',
    },
    {
      date: 'Feb 2026',
      source: 'RBI',
      title: 'Repo rate held at 6.25%',
      impact: 'Stable rates favor equity over debt. Your current equity-heavy allocation is well-positioned. No action needed on debt funds.',
      severity: 'low',
    },
    {
      date: 'Feb 2026',
      source: 'Income Tax',
      title: 'New Tax Regime: Sec 87A rebate raised to ₹12L',
      impact: 'If your taxable income is under ₹12L, the new regime is now more attractive. Re-evaluate your Old vs New regime choice on the Tax tab.',
      severity: 'high',
    },
    {
      date: 'Jan 2026',
      source: 'SEBI',
      title: 'ELSS lock-in reduced to 2 years (proposed)',
      impact: 'If approved, your ELSS investments will be available sooner. Consider ELSS over PPF for 80C if you need liquidity.',
      severity: 'moderate',
    },
  ];

  return (
    <RevealCard delay={0.2}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Newspaper size={14} style={{ color: 'var(--accent)' }} />
        <div className="section-title">Regulatory Impact Feed</div>
      </div>
      <div className="section-sub" style={{ marginBottom: 14 }}>
        Recent SEBI / RBI / Tax changes and what they mean for <em>your</em> portfolio
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {updates.map((u, i) => {
          const borderColor = u.severity === 'high' ? 'var(--red-border)' : u.severity === 'moderate' ? 'var(--amber-border)' : 'var(--border)';
          const bgColor = u.severity === 'high' ? 'var(--red-dim)' : u.severity === 'moderate' ? 'var(--amber-dim)' : 'rgba(255,255,255,0.02)';
          const tagColor = u.severity === 'high' ? 'var(--red)' : u.severity === 'moderate' ? 'var(--amber)' : 'var(--green)';
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              style={{
                padding: '14px 16px', borderRadius: 12, background: bgColor, border: `1px solid ${borderColor}`,
                borderLeft: `3px solid ${tagColor}`,
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: tagColor, background: `${tagColor}15`, padding: '2px 8px', borderRadius: 100 }}>{u.source}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{u.title}</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{u.date}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{u.impact}</div>
            </motion.div>
          );
        })}
      </div>
    </RevealCard>
  );
}

// ── X-Ray Tab ─────────────────────────────────────────────────────────────────
function XRayTab({ xray }) {
  const fr = xray?.folio_returns || [];
  const alloc = Object.entries(xray?.allocation || {}).map(([name, value]) => ({ name, value }));
  const nifty = xray?.nifty_3y_pct || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <WealthBleedTicker annualDrag={xray?.annual_expense_drag} />

      <RevealCard>
        <div className="section-title">Fund-wise XIRR vs Nifty 50</div>
        <div className="section-sub" style={{ marginBottom: 16 }}>
          Nifty benchmark: {nifty}% — green beats it, red trails it
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={fr} margin={{ top: 10, right: 10, bottom: 64, left: 0 }}>
            <XAxis dataKey="scheme_name"
              tick={{ fontSize: 9.5, fill: 'var(--text3)', fontFamily: 'Inter' }}
              angle={-32} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} unit="%" width={32} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="xirr_pct" name="XIRR %" radius={[5, 5, 0, 0]} maxBarSize={48}>
              {fr.map((f, i) => (
                <Cell key={i} fill={f.xirr_pct >= nifty ? '#34d399' : '#f87171'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </RevealCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <RevealCard delay={0.05}>
          <div className="section-title" style={{ marginBottom: 14 }}>Asset Allocation</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={alloc} cx="50%" cy="50%" innerRadius={46} outerRadius={68}
                dataKey="value" nameKey="name" paddingAngle={3}>
                {alloc.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />)}
              </Pie>
              <Tooltip formatter={v => fmt.rupees(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {alloc.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {a.name}: {a.value}%
              </div>
            ))}
          </div>
        </RevealCard>

        <RevealCard delay={0.1} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="section-title" style={{ marginBottom: 12 }}>Expense Drag</div>
            <div className="stat-label" style={{ marginBottom: 4 }}>Annual bleed</div>
            <div className="stat-value" style={{ color: 'var(--amber)' }}>
              {fmt.rupees(xray?.annual_expense_drag)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
              10-yr cost: <span style={{ color: 'var(--red)', fontWeight: 600 }}>{fmt.rupees(xray?.expense_drag_10y)}</span>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'var(--green-dim)', border: '1px solid var(--green-border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
              Switch to direct plans and save{' '}
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>{fmt.rupees((xray?.annual_expense_drag || 0) * 0.4)}/yr</span>
            </div>
          </div>
        </RevealCard>
      </div>

      <BenchmarkTimeline timeline={xray?.growth_timeline} />

      <RevealCard delay={0.15}>
        <OverlapNetworkGraph folios={fr} overlapMatrix={xray?.overlap_matrix || []} />
      </RevealCard>

      <StressTestCard xray={xray} />

      <RegulatoryNewsFeed />
    </div>
  );
}

// ── FIRE Tab ──────────────────────────────────────────────────────────────────
function FireTab({ fire }) {
  const [extraSip, setExtraSip] = useState(0);
  const proj = fire?.projection || [];
  const need = fire?.corpus_needed || 0;
  const base = fire?.projected_corpus || 0;

  const adjustedProj = proj.map((p, i) => ({
    ...p,
    adjusted: Math.round(p.corpus + (extraSip * 12 * ((1.12 ** i - 1) / 0.12))),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Readiness', value: `${fire?.readiness_score}/100`, color: scoreColor(fire?.readiness_score || 0) },
          { label: 'Corpus Needed', value: fmt.rupees(need) },
          { label: 'Projected', value: fmt.rupees(base), color: base >= need ? 'var(--green)' : 'var(--red)' },
          { label: 'Gap SIP', value: fmt.rupees(fire?.extra_sip_needed), color: 'var(--amber)' },
        ].map(({ label, value, color }, idx) => (
          <RevealCard key={label} delay={idx * 0.05} style={{ textAlign: 'center', padding: '20px 14px' }}>
            <div className="stat-label" style={{ marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: color || 'var(--text)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
          </RevealCard>
        ))}
      </div>

      <RevealCard delay={0.1}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 2 }}>Retirement Corpus Projection</div>
            <div style={{ fontSize: 12, color: fire?.is_on_track ? 'var(--green)' : 'var(--red)', fontWeight: 500 }}>
              {fire?.is_on_track ? 'On track' : 'Shortfall'} — retire at {fire?.retirement_age}
            </div>
          </div>
          {extraSip > 0 && (
            <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>+{fmt.rupees(extraSip)}/mo</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Extra SIP</span>
          <input type="range" min={0} max={50000} step={1000} value={extraSip}
            onChange={e => setExtraSip(Number(e.target.value))} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', minWidth: 50, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt.rupees(extraSip)}</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={adjustedProj}>
            <defs>
              <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="areaIndigo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="age" tick={{ fontSize: 10, fill: 'var(--text3)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} tickFormatter={v => fmt.rupees(v)} width={56} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="corpus" name="Current" stroke="#60a5fa" fill="url(#areaBlue)" strokeWidth={2} />
            {extraSip > 0 && <Area type="monotone" dataKey="adjusted" name="With extra SIP" stroke="#818cf8" fill="url(#areaIndigo)" strokeWidth={2} />}
          </AreaChart>
        </ResponsiveContainer>
      </RevealCard>

      <RevealCard delay={0.15}>
        <div className="section-title" style={{ marginBottom: 14 }}>Goal-wise SIP Required</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(fire?.goal_sips || []).map((g, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)',
                borderRadius: 12, transition: 'all 0.2s',
              }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{fmt.rupees(g.inflation_target)} in {g.years}yr · {g.asset}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)', letterSpacing: '-0.02em' }}>{fmt.rupees(g.sip_needed)}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>per month</div>
              </div>
            </motion.div>
          ))}
        </div>
      </RevealCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          ['Savings Rate', `${fire?.savings_rate_pct}%`, fire?.savings_rate_pct > 30 ? 'var(--green)' : 'var(--amber)'],
          ['Monthly Investable', fmt.rupees(fire?.current_investable), 'var(--text)'],
          ['Emergency Fund', fmt.rupees(fire?.emergency_fund_target), 'var(--text)'],
        ].map(([l, v, c], idx) => (
          <RevealCard key={l} delay={idx * 0.05} style={{ textAlign: 'center' }}>
            <div className="stat-label" style={{ marginBottom: 8 }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: c, letterSpacing: '-0.02em' }}>{v}</div>
          </RevealCard>
        ))}
      </div>

      <WhatIfSimulator fire={fire} />
    </div>
  );
}

// ── Tax Tab ───────────────────────────────────────────────────────────────────
function TaxTab({ tax }) {
  const gaps = tax?.deduction_gaps || [];
  const winner = tax?.recommended;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {['Old regime', 'New regime'].map((r, idx) => {
          const isWinner = r === winner;
          const taxAmt = r === 'Old regime' ? tax?.old_regime_tax : tax?.new_regime_tax;
          const effRate = r === 'Old regime' ? tax?.old_effective_pct : tax?.new_effective_pct;
          return (
            <RevealCard key={r} delay={idx * 0.06}
              style={{
                padding: '24px 26px', position: 'relative',
                borderColor: isWinner ? 'var(--green-border)' : undefined,
                background: isWinner ? 'var(--green-dim)' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>{r}</span>
                {isWinner && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: 'var(--green)',
                    background: 'var(--green-dim)', border: '1px solid var(--green-border)',
                    padding: '3px 10px', borderRadius: 100,
                  }}>
                    Recommended
                  </span>
                )}
              </div>
              <div style={{ fontSize: 30, fontWeight: 700, color: isWinner ? 'var(--green)' : 'var(--text)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                {fmt.rupees(taxAmt)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
                Effective: <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{effRate}%</span>
              </div>
            </RevealCard>
          );
        })}
      </div>

      <RevealCard delay={0.08} style={{
        background: 'var(--green-dim)', border: '1px solid var(--green-border)',
        borderRadius: 'var(--radius-lg)', padding: '18px 22px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Switch to {winner} and save</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green)', letterSpacing: '-0.02em' }}>
          {fmt.rupees(tax?.annual_saving)}<span style={{ fontSize: 13, fontWeight: 500 }}>/year</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
          {fmt.rupees(tax?.monthly_saving)} extra in-hand every month
        </div>
      </RevealCard>

      {gaps.length > 0 && (
        <RevealCard delay={0.12}>
          <div className="section-title" style={{ marginBottom: 14 }}>Deductions You're Missing</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {gaps.map((g, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                style={{
                  display: 'flex', gap: 14, padding: '16px 18px',
                  background: 'var(--amber-dim)', border: '1px solid var(--amber-border)', borderRadius: 12,
                }}>
                <Lightbulb size={18} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Section {g.section}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)' }}>Save {fmt.rupees(g.tax_saving)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Unused: {fmt.rupees(g.gap)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{g.action}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{
            marginTop: 12, padding: '12px 16px',
            background: 'var(--red-dim)', border: '1px solid var(--red-border)',
            borderRadius: 10, fontSize: 13, color: 'var(--text2)', textAlign: 'center',
          }}>
            Total missed: <strong style={{ color: 'var(--red)', fontWeight: 700 }}>{fmt.rupees(tax?.total_gap_saving)}</strong> in tax savings
          </div>
        </RevealCard>
      )}
    </div>
  );
}

// ── Voice Input Hook ──────────────────────────────────────────────────────────
function useVoiceInput(onTranscript) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef(null);
  const callbackRef = useRef(onTranscript);
  const activeRef = useRef(false);
  callbackRef.current = onTranscript;

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      setInterim(interimText);
      if (finalText) {
        activeRef.current = false;
        setInterim('');
        setListening(false);
        callbackRef.current(finalText.trim());
        try { recognition.stop(); } catch {}
      }
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') {
        if (activeRef.current) {
          try { recognition.stop(); } catch {}
        }
        return;
      }
      console.warn('Speech recognition error:', e.error);
      activeRef.current = false;
      setListening(false);
      setInterim('');
    };

    recognition.onend = () => {
      if (activeRef.current) {
        try { recognition.start(); return; } catch {}
      }
      activeRef.current = false;
      setListening(false);
      setInterim('');
    };

    recognitionRef.current = recognition;
    return () => {
      activeRef.current = false;
      try { recognition.abort(); } catch {}
    };
  }, []);

  const toggle = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (activeRef.current) {
      activeRef.current = false;
      try { rec.stop(); } catch {}
      setListening(false);
      setInterim('');
    } else {
      activeRef.current = true;
      try { rec.start(); setListening(true); }
      catch { activeRef.current = false; setListening(false); }
    }
  }, []);

  return { listening, supported, toggle, interim };
}

// ── Chat Tab ──────────────────────────────────────────────────────────────────
function ChatTab({ data, onOpenPalette, externalQuestion, onExternalHandled }) {
  const [msgs, setMsgs] = useState([{
    role: 'assistant',
    text: `Hi! I've analysed ${data.investor_name}'s complete financial picture. Ask me anything about your portfolio, retirement, or taxes. You can also use the microphone to speak your questions.`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  const context = {
    investor_name: data.investor_name,
    portfolio_xirr: data.xray?.portfolio_xirr_pct,
    alpha_pct: data.xray?.alpha_pct,
    nifty_benchmark: data.xray?.nifty_3y_pct,
    total_value: data.xray?.total_current_value,
    total_invested: data.xray?.total_invested,
    absolute_gain: data.xray?.absolute_gain,
    absolute_gain_pct: data.xray?.absolute_gain_pct,
    folio_returns: data.xray?.folio_returns,
    high_overlap_pairs: data.xray?.high_overlap_pairs,
    annual_expense_drag: data.xray?.annual_expense_drag,
    ten_year_drag: data.xray?.ten_year_drag,
    retirement_readiness: data.fire?.readiness_score,
    is_on_track: data.fire?.is_on_track,
    corpus_needed: data.fire?.corpus_needed,
    projected_corpus: data.fire?.projected_corpus,
    corpus_gap: data.fire?.corpus_gap,
    extra_sip_needed: data.fire?.extra_sip_needed,
    savings_rate_pct: data.fire?.savings_rate_pct,
    fire_age: data.fire?.fire_age,
    goal_sips: data.fire?.goal_sips,
    emergency_fund_target: data.fire?.emergency_fund_target,
    old_regime_tax: data.tax?.old_regime_tax,
    new_regime_tax: data.tax?.new_regime_tax,
    tax_recommended: data.tax?.recommended,
    tax_saving: data.tax?.annual_saving,
    deduction_gaps: data.tax?.deduction_gaps,
    total_gap_saving: data.tax?.total_gap_saving,
    gross_salary: data.tax?.gross_salary,
    verdict_scores: data.verdict?.scores,
    verdict_findings: data.verdict?.findings,
    verdict_summary: data.verdict?.summary,
  };

  const loadingRef = useRef(false);
  const contextRef = useRef(context);
  contextRef.current = context;

  const send = useCallback(async (q) => {
    const question = q || input.trim();
    if (!question || loadingRef.current) return;
    loadingRef.current = true;
    setInput('');
    setMsgs(m => [...m, { role: 'user', text: question }]);
    setLoading(true);
    try {
      const res = await askQuestion(question, contextRef.current);
      setMsgs(m => [...m, { role: 'assistant', text: res.answer }]);
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: 'Sorry, hit an error. Try again.' }]);
    }
    loadingRef.current = false;
    setLoading(false);
  }, [input]);

  useEffect(() => {
    if (externalQuestion) { send(externalQuestion); onExternalHandled?.(); }
  }, [externalQuestion]);

  const voice = useVoiceInput((transcript) => {
    setInput(transcript);
    send(transcript);
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <motion.button onClick={onOpenPalette} whileTap={{ scale: 0.98 }}
        style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '11px 16px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'var(--text3)', fontSize: 13, fontFamily: 'inherit', width: '100%',
          transition: 'all 0.2s',
        }}>
        <Search size={14} />
        <span>Browse quick questions...</span>
        <kbd style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', fontSize: 11 }}>Ctrl+K</kbd>
      </motion.button>

      {/* Voice indicator */}
      <AnimatePresence>
        {voice.listening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
              borderRadius: 12, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden',
            }}>
            <div className="voice-pulse" />
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
              {voice.interim ? `"${voice.interim}"` : 'Listening... speak your question'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 260, maxHeight: 440, overflowY: 'auto', padding: '4px 0' }}>
        {msgs.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ maxWidth: '86%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Target size={12} style={{ color: 'var(--accent)' }} />
              </div>
            )}
            <div className={`chat-${m.role}`} style={{ padding: '11px 15px', fontSize: 13, lineHeight: 1.7 }}>
              {m.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
              <Target size={12} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="chat-assistant" style={{ padding: '11px 15px' }}>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <span className="wave-dot" />
                <span className="wave-dot" />
                <span className="wave-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {voice.supported && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={voice.toggle}
            style={{
              width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: voice.listening ? 'var(--red)' : 'var(--accent)',
              color: '#fff', transition: 'all 0.2s', flexShrink: 0,
            }}
            title={voice.listening ? 'Stop listening' : 'Voice input'}
          >
            {voice.listening ? <MicOff size={16} /> : <Mic size={16} />}
          </motion.button>
        )}
        <input type="text" value={input} placeholder={voice.listening ? 'Listening...' : 'Ask anything about your finances...'}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} style={{ flex: 1 }} />
        <motion.button className="btn-primary" whileTap={{ scale: 0.96 }}
          onClick={() => send()} disabled={!input.trim() || loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Send size={14} /> Send
        </motion.button>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage({ data, onReset, onBack }) {
  const [tab, setTab] = useState('xray');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [pendingQ, setPendingQ] = useState(null);

  useEffect(() => {
    const h = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const handleAsk = (q) => {
    setTab('chat');
    setTimeout(() => setPendingQ(q), 80);
  };

  const tabDefs = [
    { id: 'xray', label: 'X-Ray',  icon: Crosshair },
    { id: 'fire', label: 'FIRE',   icon: Flame },
    { id: 'tax',  label: 'Tax',    icon: Receipt },
    { id: 'chat', label: 'Ask AI', icon: MessageCircle },
  ];

  return (
    <>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onAsk={handleAsk} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 80px' }}>
        {/* Glass Nav */}
        <div className="glass-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>
              <span className="gradient-text">FinMentor AI</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{data.investor_name} · Full Analysis</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <motion.button onClick={onBack} className="btn-ghost" whileTap={{ scale: 0.96 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12 }}>
              <ArrowLeft size={13} /> Verdict
            </motion.button>
            <motion.button onClick={() => setCmdOpen(true)} className="btn-ghost" whileTap={{ scale: 0.96 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12 }}>
              <Search size={13} /> <span>Ctrl+K</span>
            </motion.button>
            <motion.button className="btn-ghost" onClick={onReset} whileTap={{ scale: 0.96 }}
              style={{ fontSize: 12 }}>
              New Analysis
            </motion.button>
          </div>
        </div>

        {/* Sticky Tabs */}
        <div className="sticky-tabs">
          <div className="tabs">
            {tabDefs.map(t => {
              const Icon = t.icon;
              return (
                <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)} style={{ position: 'relative' }}>
                  {tab === t.id && (
                    <motion.div className="tab-indicator" layoutId="tab-indicator"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                  <Icon size={14} style={{ position: 'relative', zIndex: 1 }} />
                  <span style={{ position: 'relative', zIndex: 1 }}>{t.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ paddingTop: 20 }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
              {tab === 'xray' && <XRayTab xray={data.xray} />}
              {tab === 'fire' && <FireTab fire={data.fire} />}
              {tab === 'tax'  && <TaxTab  tax={data.tax} />}
              {tab === 'chat' && (
                <ChatTab
                  data={data}
                  onOpenPalette={() => setCmdOpen(true)}
                  externalQuestion={pendingQ}
                  onExternalHandled={() => setPendingQ(null)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* SEBI Disclaimer */}
        <div className="disclaimer-footer">
          <strong>Disclaimer:</strong> This tool is for informational and educational purposes only. It does not constitute
          investment advice, tax advice, or financial planning services under SEBI (Investment Advisers)
          Regulations, 2013. Always consult a SEBI-registered investment advisor before making financial decisions.
          Past performance does not guarantee future returns. Mutual fund investments are subject to market risks.
        </div>
      </div>
    </>
  );
}
