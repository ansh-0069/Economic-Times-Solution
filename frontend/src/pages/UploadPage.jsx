import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileCheck, ChevronDown, Crosshair, Flame, Receipt, MessageCircle, History } from 'lucide-react';
import { analyseDemo, analyseWithFiles } from '../utils/helpers';

const SCAN_MESSAGES = [
  'Reading your CAMS statement...',
  'Calculating true XIRR across all funds...',
  'Detecting fund overlaps...',
  'Running FIRE retirement simulation...',
  'Comparing old vs new tax regime...',
  'Generating your personalised verdict...',
];

const FEATURES = [
  { icon: Crosshair, label: 'XIRR Analysis' },
  { icon: Flame,     label: 'FIRE Planning' },
  { icon: Receipt,   label: 'Tax Optimizer' },
  { icon: MessageCircle, label: 'AI Chat' },
];

function SkeletonDashboard({ scanMsg, progress }) {
  const SkRect = ({ w = '100%', h = 16, r = 8, style = {} }) => (
    <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
  );

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkRect w={160} h={22} />
          <SkRect w={120} h={12} />
        </div>
        <SkRect w={110} h={36} r={10} />
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        {[80, 85, 70, 80].map((w, i) => <SkRect key={i} w={w} h={40} r={8} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', gridTemplateRows: 'auto auto', gap: 12, marginBottom: 20 }}>
        <div className="skeleton" style={{ gridRow: '1 / 3', borderRadius: 14, height: 200 }} />
        {[1,2,3,4].map(i => <SkRect key={i} h={90} r={12} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[1,2,3].map(i => (
          <div key={i} className="skeleton" style={{ borderRadius: 12, height: 88, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, boxSizing: 'border-box' }}>
            <SkRect w="60%" h={10} />
            <SkRect w="80%" h={24} />
            <SkRect w="50%" h={10} />
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 14, padding: '22px 24px' }}>
        <SkRect w={180} h={14} style={{ marginBottom: 18 }} />
        <SkRect h={200} r={10} />
      </div>

      <div style={{
        position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(12,12,18,0.85)', backdropFilter: 'blur(20px)',
        border: '1px solid var(--border2)',
        borderRadius: 18, padding: '16px 32px',
        zIndex: 200, minWidth: 360, textAlign: 'center',
        boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, justifyContent: 'center' }}>
          <div className="spinner" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            Analysing your finances
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 12, minHeight: 18, fontWeight: 500 }}>
          {SCAN_MESSAGES[scanMsg]}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'right', marginTop: 5, fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}

export default function UploadPage({ onResult, hasSaved, onResume }) {
  const [scanning, setScanning]   = useState(false);
  const [scanMsg, setScanMsg]     = useState(0);
  const [progress, setProgress]   = useState(0);
  const [camsFile, setCamsFile]     = useState(null);
  const [form16File, setForm16File] = useState(null);
  const [showGoals, setShowGoals] = useState(false);
  const [goals, setGoals] = useState({
    age: 32, monthly_income: 120000, monthly_expenses: 65000,
    retirement_age: 55, risk_profile: 'moderate', city: 'metro',
    rent_paid_monthly: 25000, current_corpus: 466074,
  });
  const camsRef = useRef();
  const form16Ref = useRef();

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
        : await analyseWithFiles(camsFile, form16File, goals);
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
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Gradient Orb */}
      <motion.div
        className="gradient-orb"
        style={{ top: '-15%', left: '50%', marginLeft: '-250px' }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -25, 15, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <h1 className="heading-xl gradient-text" style={{ marginBottom: 16 }}>
            FinMentor AI
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 400, margin: '0 auto' }}
          >
            Your AI-powered financial advisor. Upload your CAMS statement and get a complete portfolio X-ray in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ marginTop: 12, fontSize: 13, color: 'var(--text3)' }}
          >
            What costs ₹25,000/year from a CA — free, instant, AI-powered.
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07, delayChildren: 0.45 } },
            }}
            style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <motion.div
                key={label}
                className="feature-pill"
                variants={{
                  hidden: { opacity: 0, y: 12, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
              >
                <Icon size={12} />
                {label}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Upload card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="card-glass"
          style={{ marginBottom: 20 }}
        >
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.01em' }}>
              Upload CAMS Statement
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
              Download from camsonline.com — Consolidated Statement
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
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}>
                    <FileCheck size={30} style={{ color: 'var(--green)', marginBottom: 8 }} />
                    <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{camsFile.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Click to replace</div>
                  </motion.div>
                ) : (
                  <motion.div key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Upload size={30} style={{ color: 'var(--text3)', marginBottom: 8 }} />
                    <div style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>Drop PDF here or click to browse</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>CAMS or KFintech statement</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Form 16 upload (optional) */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 4 }}>
              Upload Form 16 <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400 }}>(optional — for personalized tax analysis)</span>
            </div>
            <div
              className={`upload-zone ${form16File ? 'active' : ''}`}
              onClick={() => form16Ref.current.click()}
              style={{ padding: '14px 16px', minHeight: 'auto' }}
            >
              <input ref={form16Ref} type="file" accept=".pdf"
                onChange={e => setForm16File(e.target.files[0])} />
              {form16File ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileCheck size={16} style={{ color: 'var(--green)' }} />
                  <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>{form16File.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>Click to replace</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Receipt size={16} style={{ color: 'var(--text3)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>Drop Form 16 PDF or click to browse</span>
                </div>
              )}
            </div>
          </div>

          {/* Goals toggle */}
          <div
            style={{
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 16px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              marginBottom: 14, transition: 'all 0.2s',
            }}
            onClick={() => setShowGoals(g => !g)}
          >
            <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Your profile & goals</span>
            <motion.div animate={{ rotate: showGoals ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown size={14} style={{ color: 'var(--text3)' }} />
            </motion.div>
          </div>

          <AnimatePresence initial={false}>
            {showGoals && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                  {[
                    ['Age', 'age', 'number'],
                    ['Monthly Income', 'monthly_income', 'number'],
                    ['Monthly Expenses', 'monthly_expenses', 'number'],
                    ['Current Savings', 'current_corpus', 'number'],
                    ['Retirement Age', 'retirement_age', 'number'],
                    ['Monthly Rent', 'rent_paid_monthly', 'number'],
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
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.01 }}
            style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700 }}
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
          transition={{ delay: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
            Don't have a CAMS PDF right now?
          </div>
          <motion.button
            className="btn-ghost btn-pulse"
            whileTap={{ scale: 0.96 }}
            style={{ width: '100%', padding: '12px 20px', fontSize: 13 }}
            onClick={() => startScan(true)}
          >
            Try with sample portfolio (Rahul Sharma, 5 funds, ₹4.6L)
          </motion.button>
        </motion.div>

        {/* Resume previous analysis */}
        {hasSaved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ textAlign: 'center', marginTop: 16 }}
          >
            <motion.button
              className="btn-ghost"
              whileTap={{ scale: 0.96 }}
              style={{ padding: '10px 20px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onClick={onResume}
            >
              <History size={13} /> Resume Previous Analysis
            </motion.button>
          </motion.div>
        )}

        {/* SEBI Disclaimer */}
        <div className="disclaimer-footer" style={{ marginTop: 32 }}>
          <strong>Disclaimer:</strong> This tool is for informational and educational purposes only. It does not constitute
          investment advice, tax advice, or financial planning services under SEBI (Investment Advisers)
          Regulations, 2013. Always consult a SEBI-registered investment advisor.
          Mutual fund investments are subject to market risks.
        </div>
      </div>
    </div>
  );
}
