import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { fmt, askQuestion, scoreColor } from '../utils/helpers';

// ── Tooltip ────────────────────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text)' }}>
          {p.name}: {typeof p.value === 'number' && p.value > 10000
            ? fmt.rupees(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

// ── X-Ray Tab ─────────────────────────────────────────────────────────────────
function XRayTab({ xray }) {
  const fr = xray?.folio_returns || [];
  const ovMatrix = xray?.overlap_matrix || [];
  const alloc = Object.entries(xray?.allocation || {}).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Fund returns */}
      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Fund-wise XIRR vs Nifty 50</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={fr} margin={{ top: 10, right: 10, bottom: 60, left: 0 }}>
            <XAxis dataKey="scheme_name" tick={{ fontSize: 10, fill: 'var(--text3)' }}
              angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} unit="%" />
            <Tooltip content={<DarkTooltip />} />
            <Bar dataKey="xirr_pct" name="XIRR %" radius={[4,4,0,0]}>
              {fr.map((f, i) => (
                <Cell key={i} fill={f.xirr_pct >= xray.nifty_3y_pct ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
            {/* Nifty reference line via custom bar */}
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 4 }}>
          Nifty 50 benchmark: {xray?.nifty_3y_pct}% — green bars beat it, red bars trail it
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Allocation */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Asset Allocation</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={alloc} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" nameKey="name" paddingAngle={3}>
                {alloc.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt.rupees(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {alloc.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                {a.name}: {a.value}%
              </div>
            ))}
          </div>
        </div>

        {/* Overlap */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Fund Overlap Heatmap</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(xray?.high_overlap_pairs || []).map((p, i) => (
              <div key={i} style={{
                background: p.overlap_pct > 45 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${p.overlap_pct > 45 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                borderRadius: 8, padding: '8px 12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text2)', flex: 1 }}>
                    <div>{p.fund_a.slice(0, 28)}</div>
                    <div style={{ color: 'var(--text3)' }}>↕ {p.fund_b.slice(0, 28)}</div>
                  </div>
                  <div style={{
                    fontSize: 18, fontWeight: 700,
                    color: p.overlap_pct > 45 ? 'var(--red)' : 'var(--amber)', marginLeft: 12,
                  }}>
                    {p.overlap_pct}%
                  </div>
                </div>
              </div>
            ))}
            {(xray?.high_overlap_pairs || []).length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 20 }}>
                No significant overlaps — well diversified ✓
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expense drag */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
            letterSpacing: '0.06em', marginBottom: 4 }}>Annual Expense Drag</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--amber)' }}>
            {fmt.rupees(xray?.annual_expense_drag)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            10-year compounding cost: {fmt.rupees(xray?.expense_drag_10y)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
            Switching to direct plans saves ~40%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            Potential annual saving: {fmt.rupees((xray?.annual_expense_drag || 0) * 0.4)}
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
  const retYear = (proj[fire?.years_to_retire] || {}).year || 2050;

  // Adjust projection with extra SIP
  const adjustedProj = proj.map((p, i) => ({
    ...p,
    adjusted: Math.round(p.corpus + (extraSip * 12 * ((1.12 ** i - 1) / 0.12))),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Retirement gauge */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Retirement Readiness
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: scoreColor(fire?.readiness_score || 0) }}>
              {fire?.readiness_score}/100
            </div>
            <div style={{ fontSize: 12, color: fire?.is_on_track ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>
              {fire?.is_on_track ? '✓ On track' : '✗ Needs attention'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Corpus Needed', fmt.rupees(need)],
              ['Projected', fmt.rupees(base)],
              ['Gap', fmt.rupees(fire?.corpus_gap)],
              ['Retire At', fire?.retirement_age + ' yrs'],
            ].map(([l, v]) => (
              <div key={l} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SIP slider */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
            <span>Adjust additional monthly SIP</span>
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>+{fmt.rupees(extraSip)}/mo</span>
          </div>
          <input type="range" min={0} max={50000} step={1000} value={extraSip}
            onChange={e => setExtraSip(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--green)' }} />
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={adjustedProj}>
            <XAxis dataKey="age" tick={{ fontSize: 10, fill: 'var(--text3)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} tickFormatter={v => fmt.rupees(v)} width={60} />
            <Tooltip content={<DarkTooltip />} />
            <Area type="monotone" dataKey="corpus" name="Current projection"
              stroke="#3b82f6" fill="rgba(59,130,246,0.08)" strokeWidth={2} />
            {extraSip > 0 && (
              <Area type="monotone" dataKey="adjusted" name="With extra SIP"
                stroke="#10b981" fill="rgba(16,185,129,0.08)" strokeWidth={2} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Goal SIPs */}
      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Goal-wise SIP Required</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(fire?.goal_sips || []).map((g, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', background: 'var(--bg3)', borderRadius: 10,
              border: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  Target: {fmt.rupees(g.inflation_target)} by {g.years}yr · {g.asset} funds
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>
                  {fmt.rupees(g.sip_needed)}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>per month</div>
              </div>
            </div>
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
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tax Tab ───────────────────────────────────────────────────────────────────
function TaxTab({ tax }) {
  const gaps = tax?.deduction_gaps || [];
  const winner = tax?.recommended;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Regime comparison */}
      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 18 }}>Regime Comparison</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {['Old regime', 'New regime'].map(r => {
            const isWinner = r === winner;
            const taxAmt = r === 'Old regime' ? tax?.old_regime_tax : tax?.new_regime_tax;
            const effRate = r === 'Old regime' ? tax?.old_effective_pct : tax?.new_effective_pct;
            return (
              <div key={r} style={{
                padding: '18px 20px', borderRadius: 12,
                border: `2px solid ${isWinner ? 'var(--green)' : 'var(--border)'}`,
                background: isWinner ? 'var(--green-dim)' : 'var(--bg3)',
                position: 'relative',
              }}>
                {isWinner && (
                  <div style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--green)', color: '#fff', fontSize: 9, fontWeight: 700,
                    padding: '2px 10px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>Recommended</div>
                )}
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>{r}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: isWinner ? 'var(--green)' : 'var(--text)' }}>
                  {fmt.rupees(taxAmt)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                  Effective rate: {effRate}%
                </div>
              </div>
            );
          })}
        </div>
        <div style={{
          background: 'var(--green-dim)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 10, padding: '12px 16px', textAlign: 'center',
        }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>Switch to {winner} and save </span>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>{fmt.rupees(tax?.annual_saving)}/year</span>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}> — that's </span>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)' }}>{fmt.rupees(tax?.monthly_saving)}/month</span>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}> more in your pocket</span>
        </div>
      </div>

      {/* Deduction gaps */}
      {gaps.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
            Deductions You're Missing
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {gaps.map((g, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, padding: '14px 16px',
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 10,
              }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>💡</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Section {g.section}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)' }}>
                      Save {fmt.rupees(g.tax_saving)} in tax
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
                    Unused deduction: {fmt.rupees(g.gap)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{g.action}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px',
            background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8, fontSize: 13, color: 'var(--text2)', textAlign: 'center' }}>
            Total missed deduction savings: <strong style={{ color: 'var(--red)' }}>{fmt.rupees(tax?.total_gap_saving)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chat Tab ──────────────────────────────────────────────────────────────────
function ChatTab({ data }) {
  const [msgs, setMsgs] = useState([{
    role: 'assistant',
    text: `Hi! I'm FinMentor AI. I've analysed ${data.investor_name}'s complete financial picture. Ask me anything — I'll answer using your actual numbers.`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
    age: data.fire?.monthly_income ? 32 : null,
  };

  const send = async (q) => {
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Quick questions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {QUICK.map(q => (
          <button key={q} className="btn-ghost" style={{ fontSize: 12 }} onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>

      {/* Chat history */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            maxWidth: '85%',
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div className={`chat-${m.role}`} style={{ borderRadius: 12, padding: '10px 14px', fontSize: 13, lineHeight: 1.6 }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div className="chat-assistant" style={{ borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)',
                    animation: `pulse 1s ease-in-out ${i*0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text" value={input} placeholder="Ask anything about your finances..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          style={{ flex: 1 }}
        />
        <button className="btn-primary" onClick={() => send()} disabled={!input.trim() || loading}>
          Send
        </button>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage({ data, onReset }) {
  const [tab, setTab] = useState('xray');

  const tabs = [
    { id: 'xray',  label: '📊 X-Ray' },
    { id: 'fire',  label: '🔥 FIRE Planner' },
    { id: 'tax',   label: '💸 Tax Wizard' },
    { id: 'chat',  label: '💬 Ask AI' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 60px' }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>FinMentor AI</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{data.investor_name} · Full Analysis</div>
        </div>
        <button className="btn-ghost" onClick={onReset} style={{ fontSize: 12 }}>
          ← New Analysis
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {/* Content */}
      {tab === 'xray'  && <XRayTab  xray={data.xray} />}
      {tab === 'fire'  && <FireTab  fire={data.fire} />}
      {tab === 'tax'   && <TaxTab   tax={data.tax} />}
      {tab === 'chat'  && <ChatTab  data={data} />}
    </div>
  );
}
