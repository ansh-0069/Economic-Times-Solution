import React, { useEffect, useState } from 'react';
import { scoreColor } from '../utils/helpers';

// Tick mark positions at 0%, 25%, 50%, 75%, 100%
function Tick({ cx, cy, r, angle, size }) {
  const rad = (angle - 90) * (Math.PI / 180);
  const x1 = cx + (r - size * 0.1 - 3) * Math.cos(rad);
  const y1 = cy + (r - size * 0.1 - 3) * Math.sin(rad);
  const x2 = cx + (r + 3) * Math.cos(rad);
  const y2 = cy + (r + 3) * Math.sin(rad);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeLinecap="round" />;
}

export default function ScoreRing({ score = 0, size = 120, label = 'Score', animate = true }) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);

  const stroke      = Math.max(size * 0.095, 7);
  const strokeOuter = Math.max(size * 0.025, 2);
  const r           = (size - stroke) / 2 - strokeOuter - 4;
  const rOuter      = (size / 2) - strokeOuter / 2 - 1;
  const circ        = 2 * Math.PI * r;
  const circOuter   = 2 * Math.PI * rOuter;
  const pct         = displayed / 100;
  const dash        = pct * circ;
  const dashOuter   = pct * circOuter * 0.92; // outer decorative ring — slightly shorter
  const color       = scoreColor(displayed);

  const glowColor = displayed >= 75
    ? 'rgba(0,229,160,0.55)'
    : displayed >= 50
    ? 'rgba(255,183,77,0.55)'
    : 'rgba(255,77,109,0.55)';

  useEffect(() => {
    if (!animate) { setDisplayed(score); return; }
    let start = null;
    const duration = 1400;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      // Springy cubic ease-out
      const ease = 1 - Math.pow(1 - prog, 4);
      setDisplayed(Math.round(ease * score));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score, animate]);

  const cx = size / 2;
  const cy = size / 2;
  const filterId = `glow-${label.replace(/\s/g, '')}`;

  // Tick angles: every 25 score points → every 90° around the circle
  const tickAngles = [0, 90, 180, 270, 360];

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          <defs>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={size * 0.06} result="blur" />
              <feFlood floodColor={glowColor} result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer decorative ring — track */}
          <circle
            cx={cx} cy={cy} r={rOuter}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={strokeOuter}
          />
          {/* Outer decorative ring — filled */}
          <circle
            cx={cx} cy={cy} r={rOuter}
            fill="none"
            stroke={color}
            strokeWidth={strokeOuter}
            strokeOpacity={0.35}
            strokeDasharray={`${dashOuter} ${circOuter}`}
            strokeLinecap="round"
            style={{ transition: `stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1), stroke 0.4s` }}
          />

          {/* Main track ring */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
          />

          {/* Tick marks */}
          {tickAngles.map(a => (
            <Tick key={a} cx={cx} cy={cy} r={r} angle={a * 3.6} size={size} />
          ))}

          {/* Main progress ring — glowing */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            filter={displayed > 0 ? `url(#${filterId})` : undefined}
            style={{ transition: `stroke-dasharray 0.7s cubic-bezier(0.16,1,0.3,1), stroke 0.4s` }}
          />
        </svg>

        {/* Center label */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: size * 0.24, fontWeight: 800, color, lineHeight: 1,
            letterSpacing: '-0.03em',
            textShadow: `0 0 ${size * 0.15}px ${glowColor}`,
            transition: 'color 0.4s',
          }}>
            {displayed}
          </div>
          <div style={{ fontSize: size * 0.095, color: 'var(--text3)', marginTop: 2 }}>/100</div>
        </div>
      </div>

      {label && (
        <div style={{
          fontSize: Math.max(size * 0.105, 10),
          color: 'var(--text2)',
          textAlign: 'center',
          fontWeight: 600,
          letterSpacing: '0.01em',
        }}>
          {label}
        </div>
      )}
    </div>
  );
}
