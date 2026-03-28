import React, { useState } from 'react';

export interface GameSettings {
  sfx: number;
  music: number;
  pixelSize: number;
  controls: 'arrows' | 'wasd';
  difficulty: 'easy' | 'normal' | 'hard';
}

interface SettingsScreenProps {
  settings: GameSettings;
  onSave: (s: GameSettings) => void;
  onBack: () => void;
}

const Row: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: '2px solid var(--pixel-gray)' }}>
    <span className="font-pixel" style={{ fontSize: 9, color: 'var(--pixel-light)', minWidth: 120 }}>
      {label}
    </span>
    <div className="flex items-center gap-2">
      {children}
    </div>
  </div>
);

const SliderControl: React.FC<{
  value: number;
  onChange: (v: number) => void;
  max?: number;
}> = ({ value, onChange, max = 10 }) => {
  const blocks = Array.from({ length: max }, (_, i) => i);
  return (
    <div className="flex gap-1 items-center">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="font-pixel"
        style={{ fontSize: 10, color: 'var(--pixel-gold)', width: 24, height: 24, background: 'var(--pixel-gray)', border: '2px solid var(--pixel-gold)', cursor: 'pointer' }}
      >◀</button>
      <div className="flex gap-0.5">
        {blocks.map(i => (
          <div
            key={i}
            onClick={() => onChange(i + 1)}
            style={{
              width: 10, height: 18,
              background: i < value ? 'var(--pixel-gold)' : 'var(--pixel-gray)',
              border: '1px solid var(--pixel-gold)',
              cursor: 'pointer',
              opacity: i < value ? 1 : 0.4,
            }}
          />
        ))}
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="font-pixel"
        style={{ fontSize: 10, color: 'var(--pixel-gold)', width: 24, height: 24, background: 'var(--pixel-gray)', border: '2px solid var(--pixel-gold)', cursor: 'pointer' }}
      >▶</button>
      <span className="font-vt323 text-xl ml-2" style={{ color: 'var(--pixel-light)', minWidth: 30 }}>
        {value * 10}%
      </span>
    </div>
  );
};

const ToggleGroup: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="flex gap-1">
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className="font-pixel px-3 py-2"
        style={{
          fontSize: 8,
          letterSpacing: 0,
          background: value === opt.value ? 'var(--pixel-gold)' : 'var(--pixel-gray)',
          color: value === opt.value ? 'var(--pixel-darker)' : 'var(--pixel-gold)',
          border: `2px solid var(--pixel-gold)`,
          cursor: 'pointer',
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onSave, onBack }) => {
  const [local, setLocal] = useState<GameSettings>({ ...settings });

  const update = <K extends keyof GameSettings>(key: K, val: GameSettings[K]) => {
    setLocal(prev => ({ ...prev, [key]: val }));
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
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)',
          zIndex: 1,
        }}
      />

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="font-pixel"
            style={{
              fontSize: 16,
              color: 'var(--pixel-gold)',
              textShadow: '0 0 10px var(--pixel-gold)',
              letterSpacing: '3px',
            }}
          >
            ⚙ НАСТРОЙКИ
          </div>
        </div>

        {/* Settings box */}
        <div
          className="p-6"
          style={{
            background: 'rgba(13,17,23,0.95)',
            border: '4px solid var(--pixel-gold)',
            boxShadow: '0 0 20px rgba(245,200,66,0.2), 4px 4px 0 rgba(0,0,0,0.8)',
          }}
        >
          {/* Sound section */}
          <div className="font-pixel mb-3" style={{ fontSize: 8, color: 'var(--pixel-green)', letterSpacing: '2px' }}>
            — ЗВУК —
          </div>
          <Row label="ЭФФЕКТЫ">
            <SliderControl value={local.sfx} onChange={v => update('sfx', v)} />
          </Row>
          <Row label="МУЗЫКА">
            <SliderControl value={local.music} onChange={v => update('music', v)} />
          </Row>

          {/* Controls section */}
          <div className="font-pixel mt-5 mb-3" style={{ fontSize: 8, color: 'var(--pixel-green)', letterSpacing: '2px' }}>
            — УПРАВЛЕНИЕ —
          </div>
          <Row label="СХЕМА">
            <ToggleGroup
              value={local.controls}
              onChange={v => update('controls', v as GameSettings['controls'])}
              options={[
                { value: 'wasd', label: 'WASD' },
                { value: 'arrows', label: '↑↓←→' },
              ]}
            />
          </Row>

          {/* Graphics section */}
          <div className="font-pixel mt-5 mb-3" style={{ fontSize: 8, color: 'var(--pixel-green)', letterSpacing: '2px' }}>
            — ГРАФИКА —
          </div>
          <Row label="СЛОЖНОСТЬ">
            <ToggleGroup
              value={local.difficulty}
              onChange={v => update('difficulty', v as GameSettings['difficulty'])}
              options={[
                { value: 'easy', label: 'ЛЕГКО' },
                { value: 'normal', label: 'НОРМА' },
                { value: 'hard', label: 'СЛОЖНО' },
              ]}
            />
          </Row>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={() => { onSave(local); onBack(); }}
            className="pixel-btn pixel-btn-green"
            style={{ minWidth: 140 }}
          >
            СОХРАНИТЬ
          </button>
          <button
            onClick={onBack}
            className="pixel-btn pixel-btn-red"
            style={{ minWidth: 140 }}
          >
            НАЗАД
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
