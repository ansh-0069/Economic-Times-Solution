// Formatting
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

// API
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

// Colour helpers
export const severityColor = (s) => ({
  critical:    'var(--red)',
  warning:     'var(--amber)',
  opportunity: 'var(--green)',
}[s] || 'var(--text2)');

export const scoreColor = (n) =>
  n >= 75 ? 'var(--green)' : n >= 50 ? 'var(--amber)' : 'var(--red)';
