import React, { useEffect, useState } from 'react';
import { scoreColor } from '../utils/helpers';

export default function ScoreRing({ score = 0, size = 120, label = 'Score', animate = true }) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);

  const stroke = Math.max(size * 0.08, 6);
  const r = (size - stroke) / 2 - 4;
  const circ = 2 * Math.PI * r;
  const pct = displayed / 100;
  const dash = pct * circ;
  const color = scoreColor(displayed);

  const glowColor = displayed >= 75
    ? 'rgba(52,211,153,0.25)'
    : displayed >= 50
      ? 'rgba(251,191,36,0.25)'
      : 'rgba(248,113,113,0.25)';

  useEffect(() => {
    if (!animate) { setDisplayed(score); return; }
    let start = null;
    const duration = 1400;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setDisplayed(Math.round(ease * score));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score, animate]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        position: 'relative', width: size, height: size,
        filter: `drop-shadow(0 0 ${size * 0.12}px ${glowColor})`,
        transition: 'filter 0.6s',
      }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={stroke}
          />
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1), stroke 0.4s' }}
          />
        </svg>

        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: size * 0.28, fontWeight: 800, color, lineHeight: 1,
            letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums',
          }}>
            {displayed}
          </div>
          <div style={{ fontSize: size * 0.09, color: 'var(--text3)', marginTop: 2 }}>/100</div>
        </div>
      </div>

      {label && (
        <div style={{
          fontSize: Math.max(size * 0.1, 10),
          color: 'var(--text2)',
          textAlign: 'center',
          fontWeight: 500,
          letterSpacing: '-0.01em',
        }}>
          {label}
        </div>
      )}
    </div>
  );
}
