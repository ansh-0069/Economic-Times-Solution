import React, { useState, useRef } from 'react';
import { analyseDemo, analyseWithFiles } from '../utils/helpers';

const SCAN_MESSAGES = [
  'Reading your CAMS statement...',
  'Calculating true XIRR across all funds...',
  'Detecting fund overlaps...',
  'Running FIRE retirement simulation...',
  'Comparing old vs new tax regime...',
  'Generating your personalised verdict...',
];

export default function UploadPage({ onResult }) {
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState(0);
  const [progress, setProgress] = useState(0);
  const [camsFile, setCamsFile] = useState(null);
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

    // Animate messages
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, SCAN_MESSAGES.length - 1);
      setScanMsg(msgIdx);
    }, 900);

    // Animate progress
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
      await new Promise(r => setTimeout(r, 600));
      onResult(result);
    } catch (err) {
      clearInterval(msgInterval); clearInterval(progInterval);
      setScanning(false);
      setProgress(0);
      alert('Analysis failed: ' + err.message);
    }
  };

  if (scanning) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 32, padding: 24,
      }}>
        {/* Scan animation */}
        <div style={{
          width: 180, height: 220, background: 'var(--bg2)',
          border: '1px solid var(--border)', borderRadius: 16,
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', zIndex: 2, position: 'relative' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.05em' }}>SCANNING</div>
          </div>
          {/* Scan line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, var(--green), transparent)',
            animation: 'scanLine 1.4s ease-in-out infinite',
          }} />
        </div>

        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
            Analysing your finances
          </div>
          <div style={{
            fontSize: 13, color: 'var(--green)',
            minHeight: 20, transition: 'opacity 0.3s',
          }}>
            {SCAN_MESSAGES[scanMsg]}
          </div>
        </div>

        <div style={{ width: 320 }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'right', marginTop: 6 }}>
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '32px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--green-dim)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 20, padding: '4px 14px', marginBottom: 20,
          }}>
            <span style={{ color: 'var(--green)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>
              ET GENAI HACKATHON 2026
            </span>
          </div>
          <h1 style={{
            fontSize: 38, fontWeight: 700, lineHeight: 1.2,
            background: 'linear-gradient(135deg, #f1f2f4 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 14,
          }}>
            FinMentor AI
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
            Your personal financial advisor. Upload your CAMS statement and get a complete portfolio analysis in 10 seconds.
          </p>
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text3)' }}>
            ₹25,000/year for a CA → free, instant, AI-powered
          </div>
        </div>

        {/* Upload card */}
        <div className="card-lg" style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
              Upload CAMS Statement
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
              Download from camsonline.com → Consolidated Statement
            </div>
            <div
              className={`upload-zone ${camsFile ? 'active' : ''}`}
              onClick={() => camsRef.current.click()}
            >
              <input
                ref={camsRef} type="file" accept=".pdf"
                onChange={e => setCamsFile(e.target.files[0])}
              />
              {camsFile ? (
                <div>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                  <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>{camsFile.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Click to replace</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Drop PDF here or click to browse</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>CAMS or KFintech statement</div>
                </div>
              )}
            </div>
          </div>

          {/* Goals toggle */}
          <div
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 12,
              border: '1px solid var(--border)',
            }}
            onClick={() => setShowGoals(g => !g)}
          >
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Your profile & goals</span>
            <span style={{ color: 'var(--text3)' }}>{showGoals ? '▲' : '▼'}</span>
          </div>

          {showGoals && (
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
          )}

          <button
            className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: 15 }}
            onClick={() => startScan(false)} disabled={!camsFile}
          >
            Scan My Portfolio
          </button>
        </div>

        {/* Demo button */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
            Don't have a CAMS PDF right now?
          </div>
          <button className="btn-ghost" style={{ width: '100%' }} onClick={() => startScan(true)}>
            Try with sample portfolio (Rahul Sharma, 5 funds, ₹4.6L)
          </button>
        </div>

      </div>
    </div>
  );
}
