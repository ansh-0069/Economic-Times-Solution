import React, { useEffect, useState } from 'react';
import { scoreColor } from '../utils/helpers';

export default function ScoreRing({ score = 0, size = 120, label = 'Score', animate = true }) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);
  const stroke = size * 0.1;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = displayed / 100;
  const dash = pct * circ;
  const color = scoreColor(displayed);

  useEffect(() => {
    if (!animate) { setDisplayed(score); return; }
    let start = null;
    const duration = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setDisplayed(Math.round(ease * score));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score, animate]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke 0.3s' }} />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', textAlign: 'center',
        }}>
          <div style={{ fontSize: size * 0.22, fontWeight: 700, color, lineHeight: 1 }}>{displayed}</div>
          <div style={{ fontSize: size * 0.1, color: 'var(--text3)', marginTop: 2 }}>/100</div>
        </div>
      </div>
      {label && <div style={{ fontSize: 12, color: 'var(--text2)', textAlign: 'center' }}>{label}</div>}
    </div>
  );
}
