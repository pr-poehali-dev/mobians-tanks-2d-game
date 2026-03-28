import React, { useState, useEffect } from 'react';

export type MobianCharacter = {
  id: string;
  name: string;
  species: string;
  color: string;
  colorLight: string;
  colorDark: string;
  accentColor: string;
  eyeColor: string;
  earColor: string;
  tankColor: string;
  tankLight: string;
  speed: number;
  power: number;
  armor: number;
  special: string;
  description: string;
};

export const CHARACTERS: MobianCharacter[] = [
  {
    id: 'sonic',
    name: 'Соник',
    species: 'Ёж',
    color: '#1a7ad4',
    colorLight: '#2a9af4',
    colorDark: '#0a5aaa',
    accentColor: '#f5c842',
    eyeColor: '#1a6baa',
    earColor: '#e87870',
    tankColor: '#1a7ad4',
    tankLight: '#4abaff',
    speed: 10,
    power: 6,
    armor: 5,
    special: 'Молния-выстрел',
    description: 'Максимальная скорость движения и перезарядки!',
  },
  {
    id: 'tails',
    name: 'Тейлз',
    species: 'Лис',
    color: '#e88820',
    colorLight: '#f8b840',
    colorDark: '#b86810',
    accentColor: '#fff0c0',
    eyeColor: '#1a6baa',
    earColor: '#fff0c0',
    tankColor: '#e88820',
    tankLight: '#f8c840',
    speed: 7,
    power: 8,
    armor: 6,
    special: 'Двойной выстрел',
    description: 'Стреляет двумя снарядами одновременно!',
  },
  {
    id: 'knuckles',
    name: 'Наклз',
    species: 'Ехидна',
    color: '#d42020',
    colorLight: '#f44040',
    colorDark: '#a01010',
    accentColor: '#ffffff',
    eyeColor: '#800000',
    earColor: '#a01010',
    tankColor: '#cc2020',
    tankLight: '#ee4444',
    speed: 5,
    power: 10,
    armor: 9,
    special: 'Бронебойный',
    description: 'Максимальная броня и урон, но медленный.',
  },
  {
    id: 'amy',
    name: 'Эми',
    species: 'Ёж',
    color: '#e83070',
    colorLight: '#f860a0',
    colorDark: '#b81050',
    accentColor: '#ffb0d0',
    eyeColor: '#1a8a1a',
    earColor: '#c01050',
    tankColor: '#e83070',
    tankLight: '#ff80b0',
    speed: 7,
    power: 7,
    armor: 6,
    special: 'Молот-бомба',
    description: 'Взрывной снаряд с зоной поражения!',
  },
  {
    id: 'shadow',
    name: 'Шэдоу',
    species: 'Ёж',
    color: '#202020',
    colorLight: '#484848',
    colorDark: '#080808',
    accentColor: '#e02020',
    eyeColor: '#e02020',
    earColor: '#e02020',
    tankColor: '#282828',
    tankLight: '#505050',
    speed: 9,
    power: 9,
    armor: 7,
    special: 'Хаос-удар',
    description: 'Телепортирующийся снаряд — пробивает стены!',
  },
  {
    id: 'rouge',
    name: 'Руж',
    species: 'Летучая мышь',
    color: '#f0c0e0',
    colorLight: '#ffd0f0',
    colorDark: '#c090b0',
    accentColor: '#ffffff',
    eyeColor: '#60a0ff',
    earColor: '#e090c0',
    tankColor: '#e080c0',
    tankLight: '#f0b0d8',
    speed: 8,
    power: 7,
    armor: 5,
    special: 'Невидимость',
    description: 'Временно становится невидимой для врагов!',
  },
  {
    id: 'silver',
    name: 'Сильвер',
    species: 'Ёж',
    color: '#c8d0e0',
    colorLight: '#e0eaf8',
    colorDark: '#9090a8',
    accentColor: '#60f0ff',
    eyeColor: '#ffa820',
    earColor: '#9898b0',
    tankColor: '#b0c0d8',
    tankLight: '#d8e8f8',
    speed: 6,
    power: 8,
    armor: 7,
    special: 'Телекинез',
    description: 'Замедляет вражеские снаряды вокруг себя!',
  },
  {
    id: 'blaze',
    name: 'Блейз',
    species: 'Кошка',
    color: '#9030b0',
    colorLight: '#c050e0',
    colorDark: '#601080',
    accentColor: '#ff8020',
    eyeColor: '#ffa020',
    earColor: '#7020a0',
    tankColor: '#9030b0',
    tankLight: '#d060f0',
    speed: 8,
    power: 9,
    armor: 6,
    special: 'Огненный вал',
    description: 'Снаряд оставляет огненный след на земле!',
  },
];

function drawMobianHead(
  ctx: CanvasRenderingContext2D,
  char: MobianCharacter,
  cx: number,
  cy: number,
  scale: number = 1
) {
  const s = scale;
  ctx.save();
  ctx.translate(cx, cy);

  const faceColor = char.color;
  const faceLight = char.colorLight;
  const faceDark = char.colorDark;
  const muzzleColor = char.id === 'knuckles' || char.id === 'shadow' ? '#e0c0b0' : '#f0d8c8';
  const accent = char.accentColor;
  const eyeC = char.eyeColor;
  const earInner = char.earColor;

  // --- ears ---
  if (char.id === 'sonic' || char.id === 'shadow' || char.id === 'silver') {
    // pointed hedgehog ears
    ctx.fillStyle = faceDark;
    ctx.beginPath();
    ctx.moveTo(-7 * s, -10 * s); ctx.lineTo(-12 * s, -20 * s); ctx.lineTo(-2 * s, -14 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7 * s, -10 * s); ctx.lineTo(12 * s, -20 * s); ctx.lineTo(2 * s, -14 * s);
    ctx.fill();
    ctx.fillStyle = earInner;
    ctx.fillRect(-9 * s, -18 * s, 4 * s, 6 * s);
    ctx.fillRect(5 * s, -18 * s, 4 * s, 6 * s);
  } else if (char.id === 'tails') {
    // fox ears
    ctx.fillStyle = faceDark;
    ctx.fillRect(-11 * s, -18 * s, 7 * s, 10 * s);
    ctx.fillRect(4 * s, -18 * s, 7 * s, 10 * s);
    ctx.fillStyle = earInner;
    ctx.fillRect(-9 * s, -16 * s, 4 * s, 6 * s);
    ctx.fillRect(5 * s, -16 * s, 4 * s, 6 * s);
  } else if (char.id === 'knuckles') {
    // echidna flat ears
    ctx.fillStyle = faceDark;
    ctx.fillRect(-12 * s, -12 * s, 5 * s, 6 * s);
    ctx.fillRect(7 * s, -12 * s, 5 * s, 6 * s);
    ctx.fillStyle = earInner;
    ctx.fillRect(-10 * s, -11 * s, 3 * s, 4 * s);
    ctx.fillRect(7 * s, -11 * s, 3 * s, 4 * s);
  } else if (char.id === 'amy') {
    // hedgehog rounded
    ctx.fillStyle = faceDark;
    ctx.fillRect(-11 * s, -16 * s, 6 * s, 8 * s);
    ctx.fillRect(5 * s, -16 * s, 6 * s, 8 * s);
    ctx.fillStyle = earInner;
    ctx.fillRect(-9 * s, -14 * s, 3 * s, 5 * s);
    ctx.fillRect(6 * s, -14 * s, 3 * s, 5 * s);
    // headband
    ctx.fillStyle = '#e02060';
    ctx.fillRect(-10 * s, -12 * s, 20 * s, 3 * s);
    // bow
    ctx.fillStyle = '#e02060';
    ctx.fillRect(-4 * s, -15 * s, 8 * s, 4 * s);
    ctx.fillRect(-6 * s, -13 * s, 4 * s, 2 * s);
    ctx.fillRect(2 * s, -13 * s, 4 * s, 2 * s);
  } else if (char.id === 'rouge') {
    // bat ears pointed
    ctx.fillStyle = faceDark;
    ctx.beginPath();
    ctx.moveTo(-5 * s, -10 * s); ctx.lineTo(-14 * s, -22 * s); ctx.lineTo(0, -12 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(5 * s, -10 * s); ctx.lineTo(14 * s, -22 * s); ctx.lineTo(0, -12 * s);
    ctx.fill();
    ctx.fillStyle = earInner;
    ctx.fillRect(-7 * s, -20 * s, 4 * s, 8 * s);
    ctx.fillRect(3 * s, -20 * s, 4 * s, 8 * s);
  } else if (char.id === 'blaze') {
    // cat ears
    ctx.fillStyle = faceDark;
    ctx.fillRect(-11 * s, -18 * s, 6 * s, 9 * s);
    ctx.fillRect(5 * s, -18 * s, 6 * s, 9 * s);
    ctx.fillStyle = earInner;
    ctx.fillRect(-9 * s, -16 * s, 3 * s, 6 * s);
    ctx.fillRect(6 * s, -16 * s, 3 * s, 6 * s);
  }

  // --- main head ---
  ctx.fillStyle = faceColor;
  ctx.fillRect(-10 * s, -10 * s, 20 * s, 18 * s);
  ctx.fillStyle = faceLight;
  ctx.fillRect(-8 * s, -8 * s, 16 * s, 10 * s);

  // --- muzzle ---
  ctx.fillStyle = muzzleColor;
  ctx.fillRect(-6 * s, 0, 12 * s, 8 * s);
  ctx.fillStyle = accent === '#ffffff' ? '#f0e0d8' : muzzleColor;
  ctx.fillRect(-4 * s, 2 * s, 8 * s, 4 * s);

  // --- eyes ---
  ctx.fillStyle = 'white';
  ctx.fillRect(-8 * s, -7 * s, 6 * s, 5 * s);
  ctx.fillRect(2 * s, -7 * s, 6 * s, 5 * s);
  ctx.fillStyle = eyeC;
  ctx.fillRect(-7 * s, -6 * s, 4 * s, 3 * s);
  ctx.fillRect(3 * s, -6 * s, 4 * s, 3 * s);
  ctx.fillStyle = '#000';
  ctx.fillRect(-6 * s, -6 * s, 2 * s, 2 * s);
  ctx.fillRect(4 * s, -6 * s, 2 * s, 2 * s);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-5 * s, -6 * s, 1 * s, 1 * s);
  ctx.fillRect(5 * s, -6 * s, 1 * s, 1 * s);

  // --- nose ---
  ctx.fillStyle = '#302020';
  ctx.fillRect(-2 * s, 1 * s, 4 * s, 2 * s);

  // --- character-specific details ---
  if (char.id === 'sonic') {
    // white eyes area
    ctx.fillStyle = '#f0f8f0';
    ctx.fillRect(-8 * s, -9 * s, 16 * s, 4 * s);
    // re-draw eyes properly
    ctx.fillStyle = eyeC;
    ctx.fillRect(-7 * s, -8 * s, 5 * s, 4 * s);
    ctx.fillRect(2 * s, -8 * s, 5 * s, 4 * s);
    ctx.fillStyle = '#000';
    ctx.fillRect(-6 * s, -8 * s, 3 * s, 3 * s);
    ctx.fillRect(3 * s, -8 * s, 3 * s, 3 * s);
  } else if (char.id === 'shadow') {
    // red eye stripe
    ctx.fillStyle = accent;
    ctx.fillRect(-10 * s, -5 * s, 4 * s, 2 * s);
    ctx.fillRect(6 * s, -5 * s, 4 * s, 2 * s);
    // chest stripe
    ctx.fillStyle = accent;
    ctx.fillRect(-3 * s, 3 * s, 6 * s, 2 * s);
  } else if (char.id === 'knuckles') {
    // spiky forehead
    ctx.fillStyle = faceDark;
    for (let i = -8; i <= 8; i += 4) {
      ctx.fillRect(i * s - 1, -12 * s, 2 * s, 4 * s);
    }
  } else if (char.id === 'blaze') {
    // purple gem on forehead
    ctx.fillStyle = char.accentColor;
    ctx.fillRect(-2 * s, -11 * s, 4 * s, 4 * s);
    ctx.fillStyle = '#ffb060';
    ctx.fillRect(-1 * s, -10 * s, 2 * s, 2 * s);
  } else if (char.id === 'silver') {
    // psychic markings
    ctx.fillStyle = char.accentColor;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(-9 * s, -5 * s, 2 * s, 8 * s);
    ctx.fillRect(7 * s, -5 * s, 2 * s, 8 * s);
    ctx.globalAlpha = 1;
  } else if (char.id === 'rouge') {
    // heart on forehead
    ctx.fillStyle = '#ff4080';
    ctx.fillRect(-3 * s, -11 * s, 2 * s, 3 * s);
    ctx.fillRect(1 * s, -11 * s, 2 * s, 3 * s);
    ctx.fillRect(-4 * s, -10 * s, 2 * s, 2 * s);
    ctx.fillRect(2 * s, -10 * s, 2 * s, 2 * s);
    ctx.fillRect(-3 * s, -9 * s, 6 * s, 2 * s);
    ctx.fillRect(-2 * s, -8 * s, 4 * s, 2 * s);
    ctx.fillRect(-1 * s, -7 * s, 2 * s, 2 * s);
  }

  ctx.restore();
}

interface CharacterSelectProps {
  onSelect: (character: MobianCharacter, mode: 'quest' | 'battle') => void;
  onBack: () => void;
}

const StatBar: React.FC<{ label: string; value: number; max?: number; color: string }> = ({ label, value, max = 10, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: '#8090a8', width: 50 }}>{label}</span>
    <div style={{ flex: 1, height: 8, background: '#1a2030', border: '1px solid #2a3040', position: 'relative' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${(value / max) * 100}%`,
        background: color,
        transition: 'width 0.3s',
      }} />
    </div>
    <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color, width: 12 }}>{value}</span>
  </div>
);

const CharacterCard: React.FC<{
  char: MobianCharacter;
  selected: boolean;
  onSelect: () => void;
}> = ({ char, selected, onSelect }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 80, 100);

    // Tank body
    const tc = char.tankColor;
    const tl = char.tankLight;
    const trackBase = char.colorDark;
    ctx.save();
    ctx.translate(40, 68);

    // tracks
    ctx.fillStyle = trackBase;
    ctx.fillRect(-16, -13, 6, 26);
    ctx.fillRect(10, -13, 6, 26);
    ctx.fillStyle = '#101018';
    for (let i = -10; i <= 10; i += 4) {
      ctx.fillRect(-16, i, 6, 2);
      ctx.fillRect(10, i, 6, 2);
    }
    // hull
    ctx.fillStyle = tc;
    ctx.fillRect(-10, -12, 20, 24);
    ctx.fillStyle = tl;
    ctx.fillRect(-8, -10, 16, 18);
    ctx.fillStyle = tc;
    ctx.fillRect(-6, -9, 12, 12);
    // turret base
    ctx.fillStyle = tl;
    ctx.fillRect(-4, -11, 8, 9);
    ctx.fillStyle = tc;
    ctx.fillRect(-2, -20, 4, 14);
    // barrel tip glow
    ctx.fillStyle = char.accentColor;
    ctx.fillRect(-2, -22, 4, 4);
    // star on hull
    ctx.fillStyle = char.accentColor;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(-2, 2, 4, 4);
    ctx.globalAlpha = 1;

    ctx.restore();

    // Head on top of tank
    drawMobianHead(ctx, char, 40, 36, 1.6);

  }, [char]);

  return (
    <div
      onClick={onSelect}
      style={{
        width: 80,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        position: 'relative',
        transform: selected ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
        transition: 'transform 0.15s',
        zIndex: selected ? 10 : 1,
      }}
    >
      <div
        style={{
          border: `3px solid ${selected ? char.color : '#2a3040'}`,
          boxShadow: selected ? `0 0 16px ${char.color}` : '3px 3px 0 rgba(0,0,0,0.8)',
          background: selected ? `${char.colorDark}30` : '#0a0e18',
          padding: 4,
        }}
      >
        <canvas
          ref={canvasRef}
          width={80}
          height={100}
          style={{ imageRendering: 'pixelated', display: 'block' }}
        />
      </div>
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 6,
        color: selected ? char.accentColor : '#6070a0',
        textShadow: selected ? `0 0 8px ${char.accentColor}` : 'none',
        textAlign: 'center',
      }}>
        {char.name}
      </div>
      {selected && (
        <div style={{
          position: 'absolute', inset: -2,
          border: `1px solid ${char.color}`,
          animation: 'pixel-blink 0.5s steps(1) infinite',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
};

const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, onBack }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'quest' | 'battle'>('quest');

  const char = CHARACTERS[selectedIndex];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') setSelectedIndex(i => (i - 1 + CHARACTERS.length) % CHARACTERS.length);
      if (e.code === 'ArrowRight') setSelectedIndex(i => (i + 1) % CHARACTERS.length);
      if (e.code === 'ArrowUp' || e.code === 'ArrowDown') setSelectedMode(m => m === 'quest' ? 'battle' : 'quest');
      if (e.code === 'Enter' || e.code === 'Space') onSelect(char, selectedMode);
      if (e.code === 'Escape') onBack();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [char, selectedMode, onSelect, onBack]);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center"
      style={{ background: '#04060e', overflow: 'hidden' }}
    >
      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'hidden' }}>
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${((i * 137.5) % 100)}%`,
              top: `${((i * 97.3) % 100)}%`,
              width: i % 3 === 0 ? 2 : 1,
              height: i % 3 === 0 ? 2 : 1,
              background: '#c8d8e8',
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 13,
        color: '#f5c842',
        textShadow: '0 0 16px #f5c842',
        marginTop: 18,
        letterSpacing: 4,
      }}>
        ВЫБОР БОЙЦА
      </div>
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 7,
        color: '#5060a0',
        marginTop: 4,
      }}>
        ← → выбор  ENTER старт  ESC назад
      </div>

      {/* Characters row */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginTop: 14,
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: '0 16px',
        maxWidth: 760,
      }}>
        {CHARACTERS.map((c, i) => (
          <CharacterCard
            key={c.id}
            char={c}
            selected={selectedIndex === i}
            onSelect={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      {/* Info + mode panel */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginTop: 10,
        alignItems: 'flex-start',
        width: '100%',
        padding: '0 20px',
        maxWidth: 760,
      }}>
        {/* Character info */}
        <div style={{
          flex: 1,
          background: '#080e1a',
          border: `3px solid ${char.color}`,
          boxShadow: `0 0 12px ${char.color}40`,
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: char.accentColor }}>
            {char.name} — {char.species}
          </div>
          <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: '#8090a8', lineHeight: 1.6 }}>
            {char.description}
          </div>
          <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: char.color, marginTop: 2 }}>
            ⚡ {char.special}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            <StatBar label="СКОРОСТЬ" value={char.speed} color="#4abaff" />
            <StatBar label="УДАР" value={char.power} color="#f5c842" />
            <StatBar label="БРОНЯ" value={char.armor} color="#a0e050" />
          </div>
        </div>

        {/* Mode selection */}
        <div style={{
          width: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: '#f5c842', textAlign: 'center', marginBottom: 4 }}>
            РЕЖИМ ИГРЫ
          </div>

          {/* Quest mode */}
          <div
            onClick={() => setSelectedMode('quest')}
            style={{
              background: selectedMode === 'quest' ? '#0a2040' : '#080e1a',
              border: `3px solid ${selectedMode === 'quest' ? '#4abaff' : '#1a2030'}`,
              boxShadow: selectedMode === 'quest' ? '0 0 12px #4abaff80' : 'none',
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>⏱</span>
              <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: selectedMode === 'quest' ? '#4abaff' : '#405060' }}>
                КВЕСТ
              </span>
              {selectedMode === 'quest' && (
                <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: '#4abaff', marginLeft: 'auto' }}>▶</span>
              )}
            </div>
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#506080', lineHeight: 1.5 }}>
              Уничтожь всех врагов до истечения времени
            </div>
          </div>

          {/* Battle mode */}
          <div
            onClick={() => setSelectedMode('battle')}
            style={{
              background: selectedMode === 'battle' ? '#201a08' : '#080e1a',
              border: `3px solid ${selectedMode === 'battle' ? '#f5c842' : '#1a2030'}`,
              boxShadow: selectedMode === 'battle' ? '0 0 12px #f5c84280' : 'none',
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>🤖</span>
              <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: selectedMode === 'battle' ? '#f5c842' : '#405060' }}>
                БОЙ
              </span>
              {selectedMode === 'battle' && (
                <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: '#f5c842', marginLeft: 'auto' }}>▶</span>
              )}
            </div>
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#506080', lineHeight: 1.5 }}>
              Сражайся против умных ботов без ограничений
            </div>
          </div>

          {/* Start button */}
          <div
            onClick={() => onSelect(char, selectedMode)}
            style={{
              background: char.color,
              border: `3px solid ${char.colorLight}`,
              padding: '10px',
              cursor: 'pointer',
              textAlign: 'center',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 9,
              color: '#fff',
              textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
              boxShadow: `0 0 16px ${char.color}`,
              marginTop: 4,
              animation: 'pixel-blink 1s steps(1) infinite',
            }}
          >
            СТАРТ!
          </div>

          <div
            onClick={onBack}
            style={{
              padding: '6px',
              cursor: 'pointer',
              textAlign: 'center',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 6,
              color: '#405060',
              border: '2px solid #1a2030',
            }}
          >
            ← НАЗАД
          </div>
        </div>
      </div>
    </div>
  );
};

export { drawMobianHead };
export default CharacterSelect;
