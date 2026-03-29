import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyseDemo, analyseWithFiles } from '../utils/helpers';

const SCAN_MESSAGES = [
  'Reading your CAMS statement...',
  'Calculating true XIRR across all funds...',
  'Detecting fund overlaps...',
  'Running FIRE retirement simulation...',
  'Comparing old vs new tax regime...',
  'Generating your personalised verdict...',
];

// ── Skeleton Dashboard Loader ─────────────────────────────────────────────────
function SkeletonDashboard({ scanMsg, progress }) {
  const SkRect = ({ w = '100%', h = 16, r = 8, style = {} }) => (
    <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
  );

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 60px' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkRect w={160} h={22} />
          <SkRect w={120} h={12} />
        </div>
        <SkRect w={110} h={36} r={10} />
      </div>

      {/* Tabs skeleton */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        {[80, 85, 70, 80].map((w, i) => <SkRect key={i} w={w} h={40} r={10} />)}
      </div>

      {/* Bento score grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', gridTemplateRows: 'auto auto', gap: 12, marginBottom: 20 }}>
        <div className="skeleton" style={{ gridRow: '1 / 3', borderRadius: 20, height: 200 }} />
        {[1,2,3,4].map(i => <SkRect key={i} h={90} r={14} />)}
      </div>

      {/* Metric row skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[1,2,3].map(i => (
          <div key={i} className="skeleton" style={{ borderRadius: 14, height: 88, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, boxSizing: 'border-box', background: 'rgba(255,255,255,0.03)' }}>
            <SkRect w="60%" h={10} />
            <SkRect w="80%" h={24} />
            <SkRect w="50%" h={10} />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="card" style={{ marginBottom: 14, padding: '22px 24px' }}>
        <SkRect w={180} h={14} style={{ marginBottom: 18 }} />
        <SkRect h={200} r={10} />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <SkRect w={220} h={10} />
        </div>
      </div>

      {/* 2-col chart skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="card" style={{ padding: '22px 24px' }}>
          <SkRect w={120} h={14} style={{ marginBottom: 16 }} />
          <SkRect h={160} r={10} />
        </div>
        <div className="card" style={{ padding: '22px 24px' }}>
          <SkRect w={150} h={14} style={{ marginBottom: 16 }} />
          {[1,2,3].map(i => <SkRect key={i} h={38} r={8} style={{ marginBottom: 8 }} />)}
        </div>
      </div>

      {/* Status overlay */}
      <div style={{
        position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(10,10,18,0.92)',
        border: '0.5px solid rgba(0,229,160,0.25)',
        borderRadius: 20, padding: '14px 28px',
        backdropFilter: 'blur(24px)', zIndex: 200,
        minWidth: 340, textAlign: 'center',
        boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 40px rgba(0,229,160,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, justifyContent: 'center' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--green)',
            boxShadow: '0 0 10px rgba(0,229,160,0.8)',
            animation: 'pulse 1s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            Analysing your finances
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--green)', marginBottom: 14, minHeight: 18, fontWeight: 500 }}>
          {SCAN_MESSAGES[scanMsg]}
        </div>
        <div style={{ width: '100%' }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'right', marginTop: 5 }}>
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Upload Page ───────────────────────────────────────────────────────────
export default function UploadPage({ onResult }) {
  const [scanning, setScanning]   = useState(false);
  const [scanMsg, setScanMsg]     = useState(0);
  const [progress, setProgress]   = useState(0);
  const [camsFile, setCamsFile]   = useState(null);
  const [showGoals, setShowGoals] = useState(false);
  const [goals, setGoals] = useState({
    age: 32, monthly_income: 120000, monthly_expenses: 65000,
    retirement_age: 55, risk_profile: 'moderate', city: 'metro',
    rent_paid_monthly: 25000, current_corpus: 466074,
  });
  const camsRef = useRef();

  const startScan = async (useDemo) => {
    setScanning(true);
    setProgress(0);
    setScanMsg(0);

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, SCAN_MESSAGES.length - 1);
      setScanMsg(msgIdx);
    }, 900);

    let prog = 0;
    const progInterval = setInterval(() => {
      prog = Math.min(prog + Math.random() * 8, 90);
      setProgress(prog);
    }, 300);

    try {
      const result = useDemo
        ? await analyseDemo()
        : await analyseWithFiles(camsFile, null, goals);
      clearInterval(msgInterval); clearInterval(progInterval);
      setProgress(100);
      await new Promise(r => setTimeout(r, 700));
      onResult(result);
    } catch (err) {
      clearInterval(msgInterval); clearInterval(progInterval);
      setScanning(false); setProgress(0);
      alert('Analysis failed: ' + err.message);
    }
  };

  if (scanning) {
    return <SkeletonDashboard scanMsg={scanMsg} progress={progress} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '32px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,229,160,0.08)', border: '0.5px solid rgba(0,229,160,0.2)',
            borderRadius: 20, padding: '5px 16px', marginBottom: 22,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--green)',
              boxShadow: '0 0 8px rgba(0,229,160,0.9)',
            }} />
            <span style={{ color: 'var(--green)', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em' }}>
              ET GENAI HACKATHON 2026
            </span>
          </div>
          <h1 style={{
            fontSize: 42, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #f0f1f5 20%, #00e5a0 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 14,
          }}>
            FinMentor AI
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.75, maxWidth: 400, margin: '0 auto' }}>
            Your personal financial advisor. Upload your CAMS statement and get a complete portfolio analysis in 10 seconds.
          </p>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
            ₹25,000/year for a CA → free, instant, AI-powered
          </div>
        </motion.div>

        {/* Upload card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="card-lg"
          style={{ marginBottom: 16 }}
        >
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
              Upload CAMS Statement
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
              Download from camsonline.com → Consolidated Statement
            </div>
            <div
              className={`upload-zone ${camsFile ? 'active' : ''}`}
              onClick={() => camsRef.current.click()}
            >
              <input ref={camsRef} type="file" accept=".pdf"
                onChange={e => setCamsFile(e.target.files[0])} />
              <AnimatePresence mode="wait">
                {camsFile ? (
                  <motion.div key="done"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                    <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{camsFile.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Click to replace</div>
                  </motion.div>
                ) : (
                  <motion.div key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Drop PDF here or click to browse</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>CAMS or KFintech statement</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Goals toggle */}
          <motion.div
            whileHover={{ background: 'rgba(255,255,255,0.04)' }}
            style={{
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 10,
              border: '0.5px solid var(--glass-border)',
              marginBottom: 12, transition: 'background 0.15s',
            }}
            onClick={() => setShowGoals(g => !g)}
          >
            <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Your profile & goals</span>
            <motion.span animate={{ rotate: showGoals ? 180 : 0 }} transition={{ duration: 0.22 }}
              style={{ color: 'var(--text3)', fontSize: 12 }}>▼</motion.span>
          </motion.div>

          <AnimatePresence initial={false}>
            {showGoals && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[
                    ['Age', 'age', 'number'],
                    ['Monthly Income (₹)', 'monthly_income', 'number'],
                    ['Monthly Expenses (₹)', 'monthly_expenses', 'number'],
                    ['Current Savings (₹)', 'current_corpus', 'number'],
                    ['Retirement Age', 'retirement_age', 'number'],
                    ['Monthly Rent (₹)', 'rent_paid_monthly', 'number'],
                  ].map(([lbl, key, type]) => (
                    <div key={key}>
                      <label>{lbl}</label>
                      <input type={type} value={goals[key]}
                        onChange={e => setGoals(g => ({ ...g, [key]: Number(e.target.value) }))} />
                    </div>
                  ))}
                  <div>
                    <label>Risk Profile</label>
                    <select value={goals.risk_profile}
                      onChange={e => setGoals(g => ({ ...g, risk_profile: e.target.value }))}>
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                  <div>
                    <label>City Type</label>
                    <select value={goals.city}
                      onChange={e => setGoals(g => ({ ...g, city: e.target.value }))}>
                      <option value="metro">Metro</option>
                      <option value="non-metro">Non-Metro</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 800 }}
            onClick={() => startScan(false)}
            disabled={!camsFile}
          >
            Scan My Portfolio
          </motion.button>
        </motion.div>

        {/* Demo button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
            Don't have a CAMS PDF right now?
          </div>
          <motion.button
            className="btn-ghost"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{ width: '100%' }}
            onClick={() => startScan(true)}
          >
            Try with sample portfolio (Rahul Sharma, 5 funds, ₹4.6L)
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
