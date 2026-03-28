import React, { useEffect, useState } from 'react';

interface ResultScreenProps {
  score: number;
  kills: number;
  level: number;
  victory: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onMenu: () => void;
}

const StatRow: React.FC<{ label: string; value: string | number; color?: string }> = ({
  label, value, color = 'var(--pixel-light)'
}) => (
  <div className="flex justify-between items-center py-2" style={{ borderBottom: '2px solid var(--pixel-gray)' }}>
    <span className="font-vt323 text-2xl" style={{ color: 'var(--pixel-light)', opacity: 0.8 }}>{label}</span>
    <span className="font-vt323 text-2xl" style={{ color }}>{value}</span>
  </div>
);

const ResultScreen: React.FC<ResultScreenProps> = ({
  score, kills, level, victory,
  onNextLevel, onRetry, onMenu
}) => {
  const [show, setShow] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!show) return;
    let cur = 0;
    const step = Math.max(1, Math.floor(score / 40));
    const t = setInterval(() => {
      cur = Math.min(cur + step, score);
      setScoreCount(cur);
      if (cur >= score) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [show, score]);

  const rank = score >= 800 ? 'S' : score >= 500 ? 'A' : score >= 300 ? 'B' : score >= 100 ? 'C' : 'D';
  const rankColors: Record<string, string> = {
    S: '#f5c842', A: '#a0e050', B: '#4090e0', C: '#e07820', D: '#e04040'
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center pixel-bg"
      style={{ background: 'var(--pixel-darker)' }}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
          zIndex: 1,
        }}
      />

      {/* Particles for victory */}
      {victory && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: 6, height: 6,
                background: ['var(--pixel-gold)', 'var(--pixel-green)', 'var(--pixel-blue)'][i % 3],
                opacity: Math.random() * 0.8 + 0.2,
                animation: `float-y ${1 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="relative z-10 w-full max-w-md px-6"
        style={{ opacity: show ? 1 : 0, transition: 'opacity 0.4s', transform: show ? 'translateY(0)' : 'translateY(20px)' }}
      >
        {/* Title */}
        <div className="text-center mb-6">
          <div
            className="font-pixel"
            style={{
              fontSize: victory ? 20 : 16,
              color: victory ? 'var(--pixel-gold)' : 'var(--pixel-red)',
              textShadow: `0 0 16px ${victory ? 'var(--pixel-gold)' : 'var(--pixel-red)'}`,
              letterSpacing: '2px',
              animation: 'title-flicker 3s infinite',
            }}
          >
            {victory ? '★ ПОБЕДА! ★' : '✕ ПОРАЖЕНИЕ'}
          </div>
          <div
            className="font-vt323 text-xl mt-2"
            style={{ color: 'var(--pixel-light)', opacity: 0.6, letterSpacing: '2px' }}
          >
            УРОВЕНЬ {level} ЗАВЕРШЁН
          </div>
        </div>

        {/* Stats box */}
        <div
          className="p-5 mb-5"
          style={{
            background: 'rgba(13,17,23,0.95)',
            border: `4px solid ${victory ? 'var(--pixel-gold)' : 'var(--pixel-red)'}`,
            boxShadow: `0 0 20px rgba(${victory ? '245,200,66' : '224,64,64'},0.2), 4px 4px 0 rgba(0,0,0,0.8)`,
          }}
        >
          {/* Rank */}
          <div className="flex justify-center items-center mb-4">
            <div
              className="font-pixel flex items-center justify-center"
              style={{
                fontSize: 48,
                color: rankColors[rank],
                textShadow: `0 0 20px ${rankColors[rank]}`,
                width: 80, height: 80,
                border: `4px solid ${rankColors[rank]}`,
                background: 'rgba(0,0,0,0.6)',
                lineHeight: 1,
              }}
            >
              {rank}
            </div>
          </div>

          <StatRow label="СЧЁТ" value={scoreCount.toLocaleString()} color="var(--pixel-gold)" />
          <StatRow label="УНИЧТОЖЕНО" value={kills} color="var(--pixel-red)" />
          <StatRow label="УРОВЕНЬ" value={level} color="var(--pixel-blue)" />
          <div className="flex justify-between items-center pt-2">
            <span className="font-vt323 text-2xl" style={{ color: 'var(--pixel-light)', opacity: 0.8 }}>РАНГ</span>
            <span className="font-vt323 text-2xl" style={{ color: rankColors[rank] }}>
              {rank === 'S' ? 'ЛЕГЕНДА' : rank === 'A' ? 'ОТЛИЧНО' : rank === 'B' ? 'ХОРОШО' : rank === 'C' ? 'ПРОЙДЕНО' : 'НОВИЧОК'}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 items-center">
          {victory ? (
            <button onClick={onNextLevel} className="pixel-btn pixel-btn-green" style={{ minWidth: 240 }}>
              ▶ СЛЕДУЮЩИЙ УРОВЕНЬ
            </button>
          ) : (
            <button onClick={onRetry} className="pixel-btn" style={{ minWidth: 240 }}>
              ↺ ПОВТОРИТЬ
            </button>
          )}
          <button onClick={onMenu} className="pixel-btn pixel-btn-red" style={{ minWidth: 240 }}>
            ← ГЛАВНОЕ МЕНЮ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
