import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { fmt, askQuestion, scoreColor } from '../utils/helpers';

// ── Glassmorphism Tooltip ─────────────────────────────────────────────────────
const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,10,18,0.88)',
      border: '0.5px solid rgba(255,255,255,0.12)',
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: 12,
      backdropFilter: 'blur(24px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      minWidth: 120,
    }}>
      <div style={{ color: 'var(--text3)', marginBottom: 6, fontSize: 11, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text)', display: 'flex', justifyContent: 'space-between', gap: 16, fontWeight: 600 }}>
          <span style={{ color: 'var(--text2)', fontWeight: 400 }}>{p.name}</span>
          <span>{typeof p.value === 'number' && p.value > 10000 ? fmt.rupees(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Fund Overlap Heatmap ──────────────────────────────────────────────────────
function HeatmapMatrix({ pairs = [] }) {
  // Build unique fund list from pairs
  const fundSet = new Set();
  pairs.forEach(p => { fundSet.add(p.fund_a); fundSet.add(p.fund_b); });
  const allFunds = Array.from(fundSet);

  const [selectedFunds, setSelectedFunds] = useState(allFunds);

  // Sync when allFunds changes (on data load)
  useEffect(() => {
    setSelectedFunds(allFunds);
    // intentionally depends only on pairs.length to reset on data change
    // eslint-disable-next-line
  }, [pairs.length]);

  const visibleFunds = allFunds.filter(f => selectedFunds.includes(f));

  // Build lookup map: "A|||B" → overlap_pct
  const lookup = {};
  pairs.forEach(p => {
    lookup[`${p.fund_a}|||${p.fund_b}`] = p.overlap_pct;
    lookup[`${p.fund_b}|||${p.fund_a}`] = p.overlap_pct;
  });

  const getOverlap = (a, b) => {
    if (a === b) return 100;
    return lookup[`${a}|||${b}`] ?? 0;
  };

  const overlapColor = (pct, isself) => {
    if (isself) return 'rgba(255,255,255,0.08)';
    if (pct === 0) return 'rgba(255,255,255,0.02)';
    const intensity = Math.min(pct / 80, 1);
    const r = Math.round(255 * intensity);
    const g = Math.round(77 * (1 - intensity * 0.6));
    const b = Math.round(109 * (1 - intensity * 0.4));
    return `rgba(${r},${g},${b},${0.15 + intensity * 0.55})`;
  };

  const cellSize = Math.max(Math.min(Math.floor(340 / (visibleFunds.length || 1)), 72), 32);
  const labelW = 110;

  if (allFunds.length === 0) {
    return (
      <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 24 }}>
        No significant overlaps — well diversified ✓
      </div>
    );
  }

  return (
    <div>
      {/* Fund filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        <button
          onClick={() => setSelectedFunds(
            selectedFunds.length === allFunds.length ? [] : [...allFunds]
          )}
          style={{
            fontSize: 10, padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
            border: '0.5px solid var(--glass-border2)', fontWeight: 700,
            background: selectedFunds.length === allFunds.length ? 'var(--green-dim)' : 'transparent',
            color: selectedFunds.length === allFunds.length ? 'var(--green)' : 'var(--text3)',
            fontFamily: 'inherit',
          }}
        >
          All
        </button>
        {allFunds.map(f => {
          const active = selectedFunds.includes(f);
          const shortName = f.length > 18 ? f.slice(0, 16) + '…' : f;
          return (
            <button
              key={f}
              onClick={() => setSelectedFunds(prev =>
                active ? prev.filter(x => x !== f) : [...prev, f]
              )}
              style={{
                fontSize: 10, padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
                border: `0.5px solid ${active ? 'rgba(0,229,160,0.3)' : 'var(--glass-border)'}`,
                fontWeight: 600,
                background: active ? 'rgba(0,229,160,0.08)' : 'transparent',
                color: active ? 'var(--green)' : 'var(--text3)',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              {shortName}
            </button>
          );
        })}
      </div>

      {visibleFunds.length < 2 ? (
        <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 16 }}>
          Select at least 2 funds to view the heatmap.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 2 }}>
            <thead>
              <tr>
                <th style={{ width: labelW, minWidth: labelW }} />
                {visibleFunds.map(f => (
                  <th key={f} style={{
                    width: cellSize, minWidth: cellSize, maxWidth: cellSize,
                    fontSize: 9, color: 'var(--text3)', fontWeight: 600,
                    textAlign: 'center', padding: '0 2px 6px',
                  }}>
                    <div style={{
                      writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                      maxHeight: 80, overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {f.length > 22 ? f.slice(0, 20) + '…' : f}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleFunds.map(rowFund => (
                <tr key={rowFund}>
                  <td style={{
                    fontSize: 9, color: 'var(--text2)', fontWeight: 600, paddingRight: 8,
                    maxWidth: labelW, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {rowFund.length > 24 ? rowFund.slice(0, 22) + '…' : rowFund}
                  </td>
                  {visibleFunds.map(colFund => {
                    const isSelf = rowFund === colFund;
                    const pct = getOverlap(rowFund, colFund);
                    return (
                      <td key={colFund}>
                        <div
                          className="heatmap-cell"
                          title={isSelf ? rowFund : `${rowFund} ↔ ${colFund}: ${pct}%`}
                          style={{
                            width: cellSize, height: cellSize,
                            background: overlapColor(pct, isSelf),
                            borderRadius: 5,
                            fontSize: cellSize > 40 ? 10 : 8,
                            color: pct > 40 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
                            fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {isSelf ? '—' : pct > 0 ? `${pct}%` : ''}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>Low overlap</span>
        <div style={{
          flex: 1, height: 6, borderRadius: 3,
          background: 'linear-gradient(90deg, rgba(77,159,255,0.15), rgba(255,183,77,0.4), rgba(255,77,109,0.7))',
          maxWidth: 120,
        }} />
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>High overlap</span>
      </div>
    </div>
  );
}

// ── Command Palette ───────────────────────────────────────────────────────────
function CommandPalette({ open, onClose, onNavigate, onAskAI }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const tabs = [
    { id: 'xray',  label: 'X-Ray Analysis',   icon: '📊', hint: 'Ctrl+1' },
    { id: 'fire',  label: 'FIRE Planner',      icon: '🔥', hint: 'Ctrl+2' },
    { id: 'tax',   label: 'Tax Wizard',        icon: '💸', hint: 'Ctrl+3' },
    { id: 'chat',  label: 'Ask AI',            icon: '💬', hint: 'Ctrl+4' },
  ];

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  const filteredTabs = tabs.filter(t =>
    !query || t.label.toLowerCase().includes(query.toLowerCase())
  );
  const isAiQuery = query.trim().length > 0 &&
    !tabs.some(t => t.label.toLowerCase().includes(query.toLowerCase()));

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') {
      if (isAiQuery) { onAskAI(query.trim()); onClose(); }
      else if (filteredTabs.length === 1) { onNavigate(filteredTabs[0].id); onClose(); }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmd-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="cmd-palette"
            initial={{ opacity: 0, scale: 0.94, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Input row */}
            <div className="cmd-input-row">
              <span style={{ fontSize: 18, color: 'var(--text3)' }}>⌘</span>
              <input
                ref={inputRef}
                className="cmd-input"
                type="text"
                placeholder="Navigate or ask AI anything..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span style={{
                fontSize: 11, color: 'var(--text3)',
                background: 'rgba(255,255,255,0.06)',
                border: '0.5px solid var(--glass-border)',
                borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap',
              }}>ESC</span>
            </div>

            {/* Navigation items */}
            {filteredTabs.length > 0 && (
              <>
                <div className="cmd-section-label">Navigate</div>
                {filteredTabs.map(t => (
                  <div
                    key={t.id}
                    className="cmd-item"
                    onClick={() => { onNavigate(t.id); onClose(); }}
                  >
                    <div className="cmd-item-icon">{t.icon}</div>
                    <div className="cmd-item-label">{t.label}</div>
                    <div className="cmd-item-hint">{t.hint}</div>
                  </div>
                ))}
              </>
            )}

            {/* AI query mode */}
            {isAiQuery && (
              <>
                <div className="cmd-section-label">Ask AI</div>
                <div
                  className="cmd-item"
                  onClick={() => { onAskAI(query.trim()); onClose(); }}
                >
                  <div className="cmd-item-icon">✨</div>
                  <div className="cmd-item-label">Ask: "{query}"</div>
                  <div className="cmd-item-hint">↵ Enter</div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="cmd-footer">
              <div className="cmd-kb"><kbd>↑ ↓</kbd> Navigate</div>
              <div className="cmd-kb"><kbd>↵</kbd> Select</div>
              <div className="cmd-kb"><kbd>ESC</kbd> Close</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── X-Ray Tab ─────────────────────────────────────────────────────────────────
function XRayTab({ xray }) {
  const fr     = xray?.folio_returns || [];
  const alloc  = Object.entries(xray?.allocation || {}).map(([name, value]) => ({ name, value }));
  const COLORS  = ['#00e5a0','#4d9fff','#ffb74d','#a78bfa','#ff4d6d'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Fund XIRR — full width */}
      <div className="card">
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 16, color: 'var(--text)', letterSpacing: '0.01em' }}>
          Fund-wise XIRR vs Nifty 50
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={fr} margin={{ top: 10, right: 10, bottom: 60, left: 0 }}>
            <XAxis dataKey="scheme_name" tick={{ fontSize: 9, fill: 'var(--text3)', fontFamily: 'Plus Jakarta Sans' }}
              angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text3)', fontFamily: 'Plus Jakarta Sans' }} unit="%" />
            <Tooltip content={<GlassTooltip />} />
            <Bar dataKey="xirr_pct" name="XIRR %" radius={[5,5,0,0]}>
              {fr.map((f, i) => (
                <Cell key={i} fill={f.xirr_pct >= xray.nifty_3y_pct ? '#00e5a0' : '#ff4d6d'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', marginTop: 6 }}>
          Nifty 50 benchmark: {xray?.nifty_3y_pct}% — <span style={{ color: 'var(--green)' }}>green</span> bars beat it, <span style={{ color: 'var(--red)' }}>red</span> bars trail
        </div>
      </div>

      {/* 2-col: Allocation + Heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Asset Allocation */}
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 14 }}>Asset Allocation</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={alloc} cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                dataKey="value" nameKey="name" paddingAngle={3}>
                {alloc.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />)}
              </Pie>
              <Tooltip content={<GlassTooltip />} formatter={(v) => fmt.rupees(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {alloc.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text2)' }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                {a.name}: {a.value}%
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="card" style={{ overflowX: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 14 }}>Fund Overlap Heatmap</div>
          <HeatmapMatrix pairs={xray?.high_overlap_pairs || []} />
        </div>
      </div>

      {/* Expense drag */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4, fontWeight: 700 }}>
            Annual Expense Drag
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--amber)', letterSpacing: '-0.02em' }}>
            {fmt.rupees(xray?.annual_expense_drag)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            10-year compounding cost: {fmt.rupees(xray?.expense_drag_10y)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Switching to direct plans saves ~40%</div>
          <div style={{
            fontSize: 18, fontWeight: 700, color: 'var(--green)',
            background: 'var(--green-dim)', padding: '6px 14px', borderRadius: 10,
            border: '0.5px solid rgba(0,229,160,0.2)',
          }}>
            + {fmt.rupees((xray?.annual_expense_drag || 0) * 0.4)}/yr
          </div>
        </div>
      </div>
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

  const sliderPct = (extraSip / 50000) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Retirement readiness card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4, fontWeight: 700 }}>
              Retirement Readiness
            </div>
            <div style={{ fontSize: 38, fontWeight: 800, color: scoreColor(fire?.readiness_score || 0), letterSpacing: '-0.03em', lineHeight: 1 }}>
              {fire?.readiness_score}
              <span style={{ fontSize: 18, color: 'var(--text3)', fontWeight: 500 }}>/100</span>
            </div>
            <div style={{ fontSize: 12, color: fire?.is_on_track ? 'var(--green)' : 'var(--red)', marginTop: 6, fontWeight: 600 }}>
              {fire?.is_on_track ? '✓ On track for retirement' : '✗ Needs attention'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['Corpus Needed', fmt.rupees(need)],
              ['Projected', fmt.rupees(base)],
              ['Gap', fmt.rupees(fire?.corpus_gap)],
              ['Retire At', `${fire?.retirement_age} yrs`],
            ].map(([l, v]) => (
              <div key={l} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px',
                border: '0.5px solid var(--glass-border)',
              }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Slider */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Additional monthly SIP</span>
            <span style={{ color: 'var(--green)', fontWeight: 800 }}>+{fmt.rupees(extraSip)}/mo</span>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)',
              height: 4, width: `${sliderPct}%`,
              background: 'linear-gradient(90deg, var(--green), #00c47a)',
              borderRadius: 4, pointerEvents: 'none', zIndex: 1,
              boxShadow: '0 0 8px rgba(0,229,160,0.4)',
            }} />
            <input
              type="range" min={0} max={50000} step={1000} value={extraSip}
              onChange={e => setExtraSip(Number(e.target.value))}
              style={{ width: '100%', position: 'relative', zIndex: 2 }}
            />
          </div>
        </div>

        {/* Area chart — animates on SIP change */}
        <motion.div layout transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={adjustedProj}>
              <defs>
                <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4d9fff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4d9fff" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="adjustedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5a0" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00e5a0" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="age" tick={{ fontSize: 9, fill: 'var(--text3)', fontFamily: 'Plus Jakarta Sans' }} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text3)', fontFamily: 'Plus Jakarta Sans' }} tickFormatter={v => fmt.rupees(v)} width={64} />
              <Tooltip content={<GlassTooltip />} />
              <Area type="monotone" dataKey="corpus" name="Current projection"
                stroke="#4d9fff" fill="url(#corpusGrad)" strokeWidth={2}
                isAnimationActive={true} animationDuration={600} animationEasing="ease-out" />
              {extraSip > 0 && (
                <Area type="monotone" dataKey="adjusted" name="With extra SIP"
                  stroke="#00e5a0" fill="url(#adjustedGrad)" strokeWidth={2}
                  isAnimationActive={true} animationDuration={600} animationEasing="ease-out" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Goal SIPs */}
      <div className="card">
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 14 }}>Goal-wise SIP Required</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(fire?.goal_sips || []).map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 12,
                border: '0.5px solid var(--glass-border)',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{g.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                  Target: {fmt.rupees(g.inflation_target)} by {g.years}yr · {g.asset} funds
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)', letterSpacing: '-0.02em' }}>
                  {fmt.rupees(g.sip_needed)}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600 }}>per month</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Savings snapshot */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {[
          ['Savings Rate', `${fire?.savings_rate_pct}%`, fire?.savings_rate_pct > 30 ? 'var(--green)' : 'var(--amber)'],
          ['Monthly Investable', fmt.rupees(fire?.current_investable), 'var(--text)'],
          ['Emergency Fund', fmt.rupees(fire?.emergency_fund_target), 'var(--text)'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6, fontWeight: 700 }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c, letterSpacing: '-0.02em' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tax Tab ───────────────────────────────────────────────────────────────────
function TaxTab({ tax }) {
  const gaps   = tax?.deduction_gaps || [];
  const winner = tax?.recommended;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 18 }}>Regime Comparison</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {['Old regime', 'New regime'].map(r => {
            const isWinner = r === winner;
            const taxAmt   = r === 'Old regime' ? tax?.old_regime_tax   : tax?.new_regime_tax;
            const effRate  = r === 'Old regime' ? tax?.old_effective_pct : tax?.new_effective_pct;
            return (
              <motion.div
                key={r}
                whileHover={{ scale: 1.02 }}
                style={{
                  padding: '18px 20px', borderRadius: 14,
                  border: `0.5px solid ${isWinner ? 'rgba(0,229,160,0.35)' : 'var(--glass-border)'}`,
                  background: isWinner ? 'rgba(0,229,160,0.07)' : 'rgba(255,255,255,0.02)',
                  position: 'relative',
                  backdropFilter: 'blur(20px)',
                  boxShadow: isWinner ? '0 0 24px rgba(0,229,160,0.12)' : 'none',
                }}
              >
                {isWinner && (
                  <div style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--green)', color: '#030b06', fontSize: 9, fontWeight: 800,
                    padding: '3px 12px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                  }}>Recommended</div>
                )}
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 5, fontWeight: 600 }}>{r}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: isWinner ? 'var(--green)' : 'var(--text)', letterSpacing: '-0.02em' }}>
                  {fmt.rupees(taxAmt)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>Effective rate: {effRate}%</div>
              </motion.div>
            );
          })}
        </div>
        <div style={{
          background: 'rgba(0,229,160,0.06)', border: '0.5px solid rgba(0,229,160,0.2)',
          borderRadius: 12, padding: '14px 18px', textAlign: 'center',
        }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>Switch to {winner} and save </span>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)', letterSpacing: '-0.02em' }}>{fmt.rupees(tax?.annual_saving)}/year</span>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}> — that's </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>{fmt.rupees(tax?.monthly_saving)}/month</span>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}> more in your pocket</span>
        </div>
      </div>

      {gaps.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 14 }}>Deductions You're Missing</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {gaps.map((g, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  display: 'flex', gap: 14, padding: '14px 16px',
                  background: 'rgba(255,183,77,0.05)', border: '0.5px solid rgba(255,183,77,0.2)',
                  borderRadius: 12,
                }}
              >
                <div style={{ fontSize: 22, flexShrink: 0 }}>💡</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Section {g.section}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--amber)' }}>Save {fmt.rupees(g.tax_saving)} in tax</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>Unused deduction: {fmt.rupees(g.gap)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>{g.action}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{
            marginTop: 14, padding: '10px 16px',
            background: 'var(--red-dim)', border: '0.5px solid rgba(255,77,109,0.2)',
            borderRadius: 10, fontSize: 13, color: 'var(--text2)', textAlign: 'center',
          }}>
            Total missed savings: <strong style={{ color: 'var(--red)' }}>{fmt.rupees(tax?.total_gap_saving)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chat Tab ──────────────────────────────────────────────────────────────────
function ChatTab({ data, prefillQuestion, onPrefillConsumed }) {
  const [msgs, setMsgs] = useState([{
    role: 'assistant',
    text: `Hi! I'm FinMentor AI. I've analysed ${data.investor_name}'s complete financial picture. Ask me anything — I'll answer using your actual numbers.`,
  }]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const QUICK = [
    'Can I retire at 50?',
    'Which fund should I exit?',
    'How much more SIP do I need?',
    'Should I switch to direct plans?',
    'How much tax will NPS save me?',
    'Am I over-diversified?',
  ];

  const context = {
    portfolio_xirr: data.xray?.portfolio_xirr_pct,
    nifty_benchmark: data.xray?.nifty_3y_pct,
    total_value: data.xray?.total_current_value,
    total_invested: data.xray?.total_invested,
    high_overlap_pairs: data.xray?.high_overlap_pairs,
    annual_expense_drag: data.xray?.annual_expense_drag,
    retirement_readiness: data.fire?.readiness_score,
    corpus_needed: data.fire?.corpus_needed,
    projected_corpus: data.fire?.projected_corpus,
    is_on_track: data.fire?.is_on_track,
    extra_sip_needed: data.fire?.extra_sip_needed,
    goal_sips: data.fire?.goal_sips,
    tax_recommended: data.tax?.recommended,
    tax_saving: data.tax?.annual_saving,
    deduction_gaps: data.tax?.deduction_gaps,
    investor_name: data.investor_name,
  };

  const send = useCallback(async (q) => {
    const question = q || input.trim();
    if (!question) return;
    setInput('');
    setMsgs(m => [...m, { role: 'user', text: question }]);
    setLoading(true);
    try {
      const res = await askQuestion(question, context);
      setMsgs(m => [...m, { role: 'assistant', text: res.answer }]);
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: 'Sorry, I hit an error. Try again.' }]);
    }
    setLoading(false);
  }, [input, context]);

  // Handle prefilled question from Command Palette
  useEffect(() => {
    if (prefillQuestion) {
      setInput(prefillQuestion);
      onPrefillConsumed?.();
      setTimeout(() => send(prefillQuestion), 100);
    }
    // eslint-disable-next-line
  }, [prefillQuestion]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Quick chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {QUICK.map(q => (
          <motion.button
            key={q}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="btn-ghost"
            style={{ fontSize: 11 }}
            onClick={() => send(q)}
          >
            {q}
          </motion.button>
        ))}
      </div>

      {/* Chat history */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200 }}>
        <AnimatePresence initial={false}>
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ maxWidth: '85%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}
            >
              <div
                className={`chat-${m.role}`}
                style={{ borderRadius: 14, padding: '11px 15px', fontSize: 13, lineHeight: 1.65 }}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ alignSelf: 'flex-start' }}
          >
            <div className="chat-assistant" style={{ borderRadius: 14, padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--green)',
                    animation: `pulse 1s ease-in-out ${i*0.22}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text" value={input}
          placeholder="Ask anything about your finances..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          style={{ flex: 1 }}
        />
        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => send()}
          disabled={!input.trim() || loading}
        >
          Send
        </motion.button>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage({ data, onReset }) {
  const [tab, setTab] = useState('xray');
  const [prevTab, setPrevTab] = useState('xray');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [aiPrefill, setAiPrefill] = useState('');

  const tabs = [
    { id: 'xray', label: '📊 X-Ray'       },
    { id: 'fire', label: '🔥 FIRE'        },
    { id: 'tax',  label: '💸 Tax'         },
    { id: 'chat', label: '💬 Ask AI'      },
  ];

  const tabOrder = tabs.map(t => t.id);
  const direction = tabOrder.indexOf(tab) >= tabOrder.indexOf(prevTab) ? 1 : -1;

  const switchTab = (id) => {
    setPrevTab(tab);
    setTab(id);
  };

  // Ctrl+K / Cmd+K to open command palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
      // Shortcut keys Ctrl+1..4
      if ((e.metaKey || e.ctrlKey) && ['1','2','3','4'].includes(e.key)) {
        e.preventDefault();
        const ids = ['xray','fire','tax','chat'];
        switchTab(ids[Number(e.key) - 1]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tab]);

  const handleCmdNavigate = (id) => {
    switchTab(id);
  };

  const handleCmdAskAI = (q) => {
    setAiPrefill(q);
    switchTab('chat');
  };

  const tabVariants = {
    enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
  };

  return (
    <>
      {/* Command Palette */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNavigate={handleCmdNavigate}
        onAskAI={handleCmdAskAI}
      />

      {/* Sticky nav header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,5,5,0.80)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '0.5px solid var(--glass-border)',
        padding: '12px 20px',
      }}>
        <div style={{ maxWidth: 940, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>FinMentor AI</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{data.investor_name} · Full Analysis</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Cmd+K hint button */}
            <button
              onClick={() => setCmdOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid var(--glass-border)',
                borderRadius: 10, padding: '7px 14px', cursor: 'pointer',
                color: 'var(--text3)', fontSize: 12, fontWeight: 500,
                fontFamily: 'inherit',
              }}
            >
              <span>⌘K</span>
              <span style={{
                background: 'rgba(255,255,255,0.06)',
                border: '0.5px solid var(--glass-border)',
                borderRadius: 4, padding: '1px 6px', fontSize: 10, color: 'var(--text3)',
              }}>Search</span>
            </button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="btn-ghost" onClick={onReset} style={{ fontSize: 12 }}>
              ← New Analysis
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '28px 20px 80px' }}>
        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 28 }}>
          {tabs.map(t => (
            <div
              key={t.id}
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => switchTab(t.id)}
            >
              {t.label}
            </div>
          ))}
        </div>

        {/* Animated tab content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tab}
            custom={direction}
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === 'xray' && <XRayTab xray={data.xray} />}
            {tab === 'fire' && <FireTab fire={data.fire} />}
            {tab === 'tax'  && <TaxTab  tax={data.tax}   />}
            {tab === 'chat' && (
              <ChatTab
                data={data}
                prefillQuestion={aiPrefill || undefined}
                onPrefillConsumed={() => setAiPrefill('')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
