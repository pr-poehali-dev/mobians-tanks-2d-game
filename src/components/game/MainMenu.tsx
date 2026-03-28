import React, { useState, useEffect } from 'react';

interface MainMenuProps {
  onStart: () => void;
  onSettings: () => void;
  onQuit: () => void;
}

const MENU_ITEMS = ['СТАРТ', 'НАСТРОЙКИ', 'ВЫХОД'];

const Stars: React.FC = () => {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-none"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: '#c8d8e8',
            opacity: 0.6,
            animation: `twinkle ${1.5 + star.delay}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

const TankSprite: React.FC<{ x: number; y: number; color: string; dir: number }> = ({ x, y, color, dir }) => (
  <div
    className="absolute"
    style={{
      left: x,
      top: y,
      transform: `rotate(${dir}deg)`,
      animation: 'float-y 2.5s ease-in-out infinite',
      fontSize: 0,
    }}
  >
    <svg width="40" height="40" viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="3" width="5" height="26" fill={color === 'green' ? '#3a5a1a' : '#5a1a1a'} />
      <rect x="25" y="3" width="5" height="26" fill={color === 'green' ? '#3a5a1a' : '#5a1a1a'} />
      <rect x="7" y="5" width="18" height="22" fill={color === 'green' ? '#4a8a2a' : '#8a2a2a'} />
      <rect x="9" y="7" width="14" height="18" fill={color === 'green' ? '#5a9a3a' : '#9a3a3a'} />
      <rect x="11" y="5" width="10" height="12" fill={color === 'green' ? '#4a7a2a' : '#7a2a2a'} />
      <rect x="13" y="2" width="6" height="10" fill={color === 'green' ? '#3a6a1a' : '#6a1a1a'} />
      <rect x="13" y="10" width="6" height="4" fill={color === 'green' ? '#a0e050' : '#e05050'} />
      {color === 'green' && <rect x="13" y="19" width="6" height="4" fill="#f5c842" />}
    </svg>
  </div>
);

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onSettings, onQuit }) => {
  const [selected, setSelected] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setFlash(f => !f), 500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp') setSelected(s => (s - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
      if (e.code === 'ArrowDown') setSelected(s => (s + 1) % MENU_ITEMS.length);
      if (e.code === 'Enter' || e.code === 'Space') {
        if (selected === 0) onStart();
        if (selected === 1) onSettings();
        if (selected === 2) onQuit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, onStart, onSettings, onQuit]);

  const actions = [onStart, onSettings, onQuit];

  return (
    <div
      className="relative w-full h-full pixel-bg overflow-hidden scanlines"
      style={{ background: 'var(--pixel-darker)' }}
    >
      <Stars />

      {/* Decorative tanks */}
      <TankSprite x={30} y={120} color="green" dir={90} />
      <TankSprite x={-10} y={300} color="red" dir={-70} />
      <div style={{ right: 30, top: 140, position: 'absolute' }}>
        <TankSprite x={0} y={0} color="red" dir={-90} />
      </div>
      <div style={{ right: -10, top: 320, position: 'absolute' }}>
        <TankSprite x={0} y={0} color="green" dir={60} />
      </div>

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)',
          zIndex: 5,
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6">
        {/* Title */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div
            className="font-pixel text-center leading-relaxed"
            style={{
              fontSize: 'clamp(14px, 3vw, 24px)',
              color: 'var(--pixel-gold)',
              textShadow: '0 0 12px var(--pixel-gold), 0 0 24px rgba(245,200,66,0.4)',
              animation: 'title-flicker 5s infinite',
              letterSpacing: '2px',
            }}
          >
            MOBIANS
          </div>
          <div
            className="font-pixel text-center"
            style={{
              fontSize: 'clamp(8px, 1.5vw, 12px)',
              color: 'var(--pixel-light)',
              letterSpacing: '6px',
              opacity: 0.8,
            }}
          >
            UND
          </div>
          <div
            className="font-pixel text-center leading-relaxed"
            style={{
              fontSize: 'clamp(14px, 3vw, 24px)',
              color: 'var(--pixel-red)',
              textShadow: '0 0 12px var(--pixel-red), 0 0 24px rgba(224,64,64,0.4)',
              animation: 'title-flicker 5s infinite 0.3s',
              letterSpacing: '2px',
            }}
          >
            TANKS
          </div>
        </div>

        {/* Version badge */}
        <div
          className="font-vt323 text-xl"
          style={{ color: 'var(--pixel-light)', opacity: 0.5, letterSpacing: '3px' }}
        >
          v1.0 — 2026
        </div>

        {/* Menu items */}
        <div className="flex flex-col gap-2 items-center mt-4">
          {MENU_ITEMS.map((item, i) => (
            <button
              key={item}
              onClick={() => actions[i]()}
              onMouseEnter={() => setSelected(i)}
              className="flex items-center gap-4 px-6 py-3 transition-all duration-75"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 11,
                letterSpacing: '1px',
                color: selected === i ? 'var(--pixel-darker)' : 'var(--pixel-gold)',
                background: selected === i ? 'var(--pixel-gold)' : 'transparent',
                border: `3px solid ${selected === i ? 'var(--pixel-gold)' : 'transparent'}`,
                textShadow: selected === i ? 'none' : '0 0 8px var(--pixel-gold)',
                boxShadow: selected === i ? '0 0 16px rgba(245,200,66,0.5)' : 'none',
                minWidth: 220,
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 16, display: 'inline-block', opacity: selected === i ? 1 : 0 }}>▶</span>
              {item}
            </button>
          ))}
        </div>

        {/* Keyboard hint */}
        <div
          className="font-vt323 text-lg mt-6 text-center"
          style={{ color: 'var(--pixel-light)', opacity: 0.4, lineHeight: 1.6 }}
        >
          ↑↓ — выбор  &nbsp; ENTER — подтвердить
        </div>

        {/* Blinking insert coin */}
        <div
          className="font-vt323 text-2xl absolute bottom-8"
          style={{
            color: 'var(--pixel-gold)',
            opacity: flash ? 1 : 0,
            letterSpacing: '2px',
            transition: 'opacity 0.1s',
          }}
        >
          НАЖМИ ENTER ДЛЯ СТАРТА
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
