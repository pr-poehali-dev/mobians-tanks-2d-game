import React, { useState } from 'react';

export interface GameSettings {
  sfx: number;
  music: number;
  pixelSize: number;
  controls: 'arrows' | 'wasd' | 'both';
  difficulty: 'easy' | 'normal' | 'hard';
  scanlines: boolean;
  brightness: number;
  showFps: boolean;
}

interface SettingsScreenProps {
  settings: GameSettings;
  onSave: (s: GameSettings) => void;
  onBack: () => void;
  onResetProgress?: () => void;
}

const Row: React.FC<{ label: string; sub?: string; children: React.ReactNode }> = ({ label, sub, children }) => (
  <div
    className="flex items-center justify-between gap-4 py-3"
    style={{ borderBottom: '2px solid var(--pixel-gray)' }}
  >
    <div>
      <span className="font-pixel" style={{ fontSize: 8, color: 'var(--pixel-light)' }}>
        {label}
      </span>
      {sub && (
        <div className="font-vt323 text-lg" style={{ color: 'var(--pixel-light)', opacity: 0.45, marginTop: 1 }}>
          {sub}
        </div>
      )}
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">{children}</div>
  </div>
);

const SliderControl: React.FC<{ value: number; onChange: (v: number) => void; max?: number }> = ({
  value, onChange, max = 10,
}) => {
  const blocks = Array.from({ length: max }, (_, i) => i);
  return (
    <div className="flex gap-1 items-center">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        style={{
          fontSize: 10, color: 'var(--pixel-gold)', width: 22, height: 22,
          background: 'var(--pixel-gray)', border: '2px solid var(--pixel-gold)', cursor: 'pointer',
          fontFamily: 'monospace',
        }}
      >◀</button>
      <div className="flex gap-px">
        {blocks.map(i => (
          <div
            key={i}
            onClick={() => onChange(i + 1)}
            style={{
              width: 9, height: 16,
              background: i < value ? 'var(--pixel-gold)' : 'var(--pixel-gray)',
              border: '1px solid var(--pixel-gold)',
              cursor: 'pointer',
              opacity: i < value ? 1 : 0.3,
              transition: 'background 0.05s',
            }}
          />
        ))}
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{
          fontSize: 10, color: 'var(--pixel-gold)', width: 22, height: 22,
          background: 'var(--pixel-gray)', border: '2px solid var(--pixel-gold)', cursor: 'pointer',
          fontFamily: 'monospace',
        }}
      >▶</button>
      <span className="font-vt323 text-xl ml-1" style={{ color: 'var(--pixel-light)', minWidth: 36, textAlign: 'right' }}>
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
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 7,
          padding: '6px 10px',
          background: value === opt.value ? 'var(--pixel-gold)' : 'var(--pixel-gray)',
          color: value === opt.value ? 'var(--pixel-darker)' : 'var(--pixel-gold)',
          border: `2px solid ${value === opt.value ? 'var(--pixel-gold)' : 'rgba(245,200,66,0.4)'}`,
          cursor: 'pointer',
          boxShadow: value === opt.value ? '0 0 8px rgba(245,200,66,0.4)' : 'none',
          transition: 'all 0.05s',
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: 48, height: 24,
      background: value ? 'var(--pixel-green)' : 'var(--pixel-gray)',
      border: `2px solid ${value ? 'var(--pixel-green)' : 'rgba(245,200,66,0.4)'}`,
      position: 'relative', cursor: 'pointer',
      transition: 'background 0.1s',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 2, left: value ? 24 : 2,
        width: 16, height: 16,
        background: value ? '#fff' : 'var(--pixel-light)',
        transition: 'left 0.1s steps(4)',
      }}
    />
    <span
      style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 5,
        color: value ? '#fff' : 'var(--pixel-light)',
        position: 'absolute',
        top: '50%', left: value ? 4 : 6,
        transform: 'translateY(-50%)',
        opacity: 0.8,
      }}
    >
      {value ? 'ON' : 'OFF'}
    </span>
  </button>
);

type TabId = 'sound' | 'controls' | 'graphics';

const TABS: { id: TabId; label: string }[] = [
  { id: 'sound', label: '♪ ЗВУК' },
  { id: 'controls', label: '⌨ УПРАВЛ.' },
  { id: 'graphics', label: '◈ ГРАФИКА' },
];

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onSave, onBack, onResetProgress }) => {
  const [local, setLocal] = useState<GameSettings>({ ...settings });
  const [tab, setTab] = useState<TabId>('sound');
  const [confirmReset, setConfirmReset] = useState(false);

  const update = <K extends keyof GameSettings>(key: K, val: GameSettings[K]) => {
    setLocal(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center pixel-bg"
      style={{ background: 'var(--pixel-darker)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
          zIndex: 1,
        }}
      />

      <div className="relative z-10 w-full max-w-xl px-6">
        {/* Header */}
        <div className="text-center mb-5">
          <div
            className="font-pixel"
            style={{
              fontSize: 15,
              color: 'var(--pixel-gold)',
              textShadow: '0 0 10px var(--pixel-gold)',
              letterSpacing: '3px',
            }}
          >
            ⚙ НАСТРОЙКИ
          </div>
          <div className="font-vt323 text-lg mt-1" style={{ color: 'var(--pixel-light)', opacity: 0.4, letterSpacing: '2px' }}>
            MOBIANS UND TANKS v1.0
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-0" style={{ borderBottom: '4px solid var(--pixel-gold)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 7,
                letterSpacing: '0.5px',
                padding: '8px 14px',
                background: tab === t.id ? 'var(--pixel-gold)' : 'var(--pixel-gray)',
                color: tab === t.id ? 'var(--pixel-darker)' : 'var(--pixel-gold)',
                border: '2px solid var(--pixel-gold)',
                borderBottom: tab === t.id ? '4px solid var(--pixel-gold)' : '2px solid var(--pixel-gold)',
                marginBottom: tab === t.id ? -4 : 0,
                cursor: 'pointer',
                flex: 1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Settings panel */}
        <div
          style={{
            background: 'rgba(10,14,20,0.98)',
            border: '4px solid var(--pixel-gold)',
            borderTop: 'none',
            padding: '16px 20px',
            minHeight: 200,
            boxShadow: '0 0 20px rgba(245,200,66,0.15), 4px 4px 0 rgba(0,0,0,0.8)',
          }}
        >
          {/* SOUND TAB */}
          {tab === 'sound' && (
            <>
              <Row label="ЭФФЕКТЫ" sub="Звуки выстрелов и взрывов">
                <SliderControl value={local.sfx} onChange={v => update('sfx', v)} />
              </Row>
              <Row label="МУЗЫКА" sub="Фоновая музыка в меню и игре">
                <SliderControl value={local.music} onChange={v => update('music', v)} />
              </Row>
              <div className="font-vt323 text-lg mt-3" style={{ color: 'var(--pixel-light)', opacity: 0.4 }}>
                Подсказка: установи 0% чтобы отключить полностью
              </div>
            </>
          )}

          {/* CONTROLS TAB */}
          {tab === 'controls' && (
            <>
              <Row label="СХЕМА УПРАВЛЕНИЯ" sub="Кнопки для движения танка">
                <ToggleGroup
                  value={local.controls}
                  onChange={v => update('controls', v as GameSettings['controls'])}
                  options={[
                    { value: 'wasd', label: 'WASD' },
                    { value: 'arrows', label: '↑↓←→' },
                    { value: 'both', label: 'ОБА' },
                  ]}
                />
              </Row>
              <Row label="СЛОЖНОСТЬ" sub="Скорость и точность врагов">
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
              <div
                className="mt-4 p-3"
                style={{ background: 'rgba(245,200,66,0.05)', border: '2px solid rgba(245,200,66,0.2)' }}
              >
                <div className="font-pixel mb-2" style={{ fontSize: 7, color: 'var(--pixel-gold)' }}>РАСКЛАДКА:</div>
                {[
                  ['ДВИЖЕНИЕ', 'WASD / ↑↓←→'],
                  ['ОГОНЬ', 'ПРОБЕЛ / Z'],
                  ['ПАУЗА', 'ESC'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="font-vt323 text-xl" style={{ color: 'var(--pixel-light)', opacity: 0.6 }}>{k}</span>
                    <span className="font-vt323 text-xl" style={{ color: 'var(--pixel-gold)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* GRAPHICS TAB */}
          {tab === 'graphics' && (
            <>
              <Row label="ЯРКОСТЬ ЭКРАНА" sub="Общая яркость игры">
                <SliderControl value={local.brightness} onChange={v => update('brightness', v)} />
              </Row>
              <Row label="СКАНЛАЙНЫ" sub="CRT-эффект ретро-монитора">
                <Toggle value={local.scanlines} onChange={v => update('scanlines', v)} />
              </Row>
              <Row label="ПОКАЗЫВАТЬ FPS" sub="Счётчик кадров в секунду">
                <Toggle value={local.showFps} onChange={v => update('showFps', v)} />
              </Row>
              <Row label="РАЗМЕР ПИКСЕЛЕЙ" sub="Масштаб пиксельной сетки">
                <ToggleGroup
                  value={String(local.pixelSize)}
                  onChange={v => update('pixelSize', Number(v))}
                  options={[
                    { value: '1', label: '1×' },
                    { value: '2', label: '2×' },
                    { value: '3', label: '3×' },
                  ]}
                />
              </Row>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-between mt-4">
          <div className="flex gap-3">
            <button
              onClick={() => { onSave(local); onBack(); }}
              className="pixel-btn pixel-btn-green"
              style={{ fontSize: 8, minWidth: 120 }}
            >
              ✓ СОХРАНИТЬ
            </button>
            <button
              onClick={onBack}
              className="pixel-btn pixel-btn-red"
              style={{ fontSize: 8, minWidth: 100 }}
            >
              ✕ НАЗАД
            </button>
          </div>

          {/* Reset progress */}
          {onResetProgress && (
            confirmReset ? (
              <div className="flex gap-2 items-center">
                <span className="font-pixel" style={{ fontSize: 7, color: 'var(--pixel-red)' }}>УВЕРЕН?</span>
                <button
                  onClick={() => { onResetProgress(); setConfirmReset(false); }}
                  className="pixel-btn pixel-btn-red"
                  style={{ fontSize: 7, padding: '8px 12px' }}
                >
                  ДА
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="pixel-btn"
                  style={{ fontSize: 7, padding: '8px 12px' }}
                >
                  НЕТ
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="pixel-btn"
                style={{ fontSize: 7, borderColor: '#555', color: '#777', padding: '8px 12px' }}
              >
                СБРОС
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
