import React, { useState, useEffect } from 'react';
import UploadPage    from './pages/UploadPage';
import VerdictPage   from './pages/VerdictPage';
import DashboardPage from './pages/DashboardPage';

const STORAGE_KEY = 'finmentor_last_analysis';
const BASE = process.env.REACT_APP_API || 'http://localhost:8000';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.xray && parsed.verdict) return parsed;
  } catch { /* ignore corrupt data */ }
  return null;
}

function getSessionParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('session');
}

export default function App() {
  const saved = loadSaved();
  const [screen, setScreen] = useState('upload');
  const [data,   setData]   = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionId = getSessionParam();
    if (!sessionId) return;

    setLoading(true);
    fetch(`${BASE}/session/${sessionId}`)
      .then(r => {
        if (!r.ok) throw new Error('Session not found');
        return r.json();
      })
      .then(d => {
        setData(d);
        setScreen('verdict');
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onResult = (d) => {
    setData(d);
    setScreen('verdict');
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
  };

  const onResume = () => {
    const s = loadSaved();
    if (s) { setData(s); setScreen('verdict'); }
  };

  const onContinue = ()  => {               setScreen('dashboard'); };
  const onBack     = ()  => {               setScreen('verdict');   };
  const onReset    = ()  => { setData(null); setScreen('upload');    };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div className="spinner" />
        <div style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>
          Loading your analysis from Telegram...
        </div>
      </div>
    );
  }

  if (screen === 'upload')    return <UploadPage    onResult={onResult} hasSaved={!!saved} onResume={onResume} />;
  if (screen === 'verdict')   return <VerdictPage   data={data} onContinue={onContinue} onReset={onReset} />;
  if (screen === 'dashboard') return <DashboardPage data={data} onReset={onReset} onBack={onBack} />;
  return null;
}
