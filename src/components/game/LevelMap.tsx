import React, { useState, useEffect } from 'react';
import { buildLevelConfigs, THEMES, type LevelConfig } from './levelThemes';

interface LevelMapProps {
  maxUnlocked: number;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

const COLS = 5;
const NODE_SIZE = 96;
const NODE_GAP = 32;

const PATH_COORDS = [
  { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 0 },
  { col: 3, row: 0 }, { col: 4, row: 1 }, { col: 3, row: 2 },
  { col: 2, row: 2 }, { col: 1, row: 2 }, { col: 0, row: 3 },
  { col: 1, row: 3 },
];

const LevelNode: React.FC<{
  config: LevelConfig;
  selected: boolean;
  onSelect: () => void;
  col: number;
  row: number;
}> = ({ config, selected, onSelect, col, row }) => {
  const theme = THEMES[config.themeId];
  const locked = !config.unlocked;

  const x = col * (NODE_SIZE + NODE_GAP);
  const y = row * (NODE_SIZE + NODE_GAP * 0.8);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: NODE_SIZE,
        height: NODE_SIZE,
        cursor: locked ? 'not-allowed' : 'pointer',
        transition: 'transform 0.1s',
        transform: selected ? 'scale(1.12)' : 'scale(1)',
        zIndex: selected ? 10 : 1,
      }}
      onClick={() => !locked && onSelect()}
    >
      {/* Node background */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: locked ? '#1a1a2a' : theme.mapBg,
          border: `4px solid ${selected ? theme.borderColor : locked ? '#2a2a4a' : theme.wall}`,
          boxShadow: selected
            ? `0 0 20px ${theme.borderColor}, 4px 4px 0 rgba(0,0,0,0.8)`
            : '4px 4px 0 rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid pattern */}
        {!locked && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(${theme.groundGrid} 1px, transparent 1px),
                linear-gradient(90deg, ${theme.groundGrid} 1px, transparent 1px)
              `,
              backgroundSize: '16px 16px',
              opacity: 0.4,
            }}
          />
        )}

        {/* Scanlines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)',
            zIndex: 2,
          }}
        />

        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center' }}>
          {locked ? (
            <div style={{ fontSize: 28 }}>🔒</div>
          ) : (
            <div
              style={{
                fontSize: 28,
                filter: selected ? `drop-shadow(0 0 6px ${theme.borderColor})` : 'none',
              }}
            >
              {theme.mapIcon}
            </div>
          )}
          <div
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 8,
              color: locked ? '#3a3a5a' : selected ? theme.borderColor : theme.hudColor,
              textShadow: selected ? `0 0 8px ${theme.borderColor}` : 'none',
              marginTop: 4,
            }}
          >
            {config.level}
          </div>
          {config.completed && (
            <div style={{ color: '#f5c842', fontSize: 10, marginTop: 2 }}>★</div>
          )}
        </div>
      </div>

      {/* Selected glow pulse */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            inset: -4,
            border: `2px solid ${theme.borderColor}`,
            animation: 'pixel-blink 0.5s steps(1) infinite',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

const LevelMap: React.FC<LevelMapProps> = ({ maxUnlocked, onSelectLevel, onBack }) => {
  const configs = buildLevelConfigs(maxUnlocked);
  const [selected, setSelected] = useState(maxUnlocked - 1);

  const selectedConfig = configs[selected];
  const selectedTheme = THEMES[selectedConfig.themeId];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') setSelected(s => Math.max(0, s - 1));
      if (e.code === 'ArrowRight') setSelected(s => Math.min(configs.length - 1, s + 1));
      if (e.code === 'Enter' || e.code === 'Space') {
        if (configs[selected].unlocked) onSelectLevel(configs[selected].level);
      }
      if (e.code === 'Escape') onBack();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, configs, onSelectLevel, onBack]);

  // Calculate map dimensions
  const mapW = COLS * (NODE_SIZE + NODE_GAP) - NODE_GAP;
  const mapH = 4 * (NODE_SIZE + NODE_GAP * 0.8);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-start pt-6 pixel-bg"
      style={{ background: 'var(--pixel-darker)', overflow: 'hidden' }}
    >
      {/* Scanlines bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
          zIndex: 1,
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center gap-4">
        {/* Header */}
        <div
          className="font-pixel text-center"
          style={{
            fontSize: 14,
            color: 'var(--pixel-gold)',
            textShadow: '0 0 12px var(--pixel-gold)',
            letterSpacing: '3px',
          }}
        >
          КАРТА УРОВНЕЙ
        </div>

        {/* Content area */}
        <div className="flex gap-6 items-start justify-center w-full px-6">
          {/* Map */}
          <div
            style={{
              position: 'relative',
              width: mapW,
              height: mapH,
              flexShrink: 0,
            }}
          >
            {/* Path lines between nodes */}
            <svg
              style={{ position: 'absolute', inset: 0, width: mapW, height: mapH, zIndex: 0 }}
            >
              {PATH_COORDS.slice(0, -1).map((from, i) => {
                const to = PATH_COORDS[i + 1];
                const x1 = from.col * (NODE_SIZE + NODE_GAP) + NODE_SIZE / 2;
                const y1 = from.row * (NODE_SIZE + NODE_GAP * 0.8) + NODE_SIZE / 2;
                const x2 = to.col * (NODE_SIZE + NODE_GAP) + NODE_SIZE / 2;
                const y2 = to.row * (NODE_SIZE + NODE_GAP * 0.8) + NODE_SIZE / 2;
                const unlocked = i + 1 < maxUnlocked;
                return (
                  <g key={i}>
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={unlocked ? '#f5c842' : '#2a3040'}
                      strokeWidth={3}
                      strokeDasharray="8 4"
                      opacity={unlocked ? 0.7 : 0.3}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Level nodes */}
            {configs.map((cfg, i) => (
              <LevelNode
                key={cfg.level}
                config={cfg}
                selected={selected === i}
                onSelect={() => setSelected(i)}
                col={PATH_COORDS[i]?.col ?? i % COLS}
                row={PATH_COORDS[i]?.row ?? Math.floor(i / COLS)}
              />
            ))}
          </div>

          {/* Info panel */}
          <div
            style={{
              width: 200,
              background: 'rgba(8,12,16,0.95)',
              border: `4px solid ${selectedConfig.unlocked ? selectedTheme.borderColor : '#2a3040'}`,
              boxShadow: selectedConfig.unlocked
                ? `0 0 16px ${selectedTheme.borderColor}40, 4px 4px 0 rgba(0,0,0,0.8)`
                : '4px 4px 0 rgba(0,0,0,0.8)',
              padding: 16,
              flexShrink: 0,
            }}
          >
            <div
              className="font-pixel text-center mb-3"
              style={{
                fontSize: 7,
                color: selectedConfig.unlocked ? selectedTheme.hudColor : '#3a3a5a',
                letterSpacing: '1px',
                lineHeight: 1.8,
              }}
            >
              {selectedConfig.unlocked ? selectedTheme.label : '???'}
            </div>

            <div
              style={{
                width: '100%',
                height: 80,
                background: selectedConfig.unlocked ? selectedTheme.mapBg : '#1a1a2a',
                border: `2px solid ${selectedConfig.unlocked ? selectedTheme.wall : '#2a2a3a'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                marginBottom: 12,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {selectedConfig.unlocked && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
                      linear-gradient(${selectedTheme.groundGrid} 1px, transparent 1px),
                      linear-gradient(90deg, ${selectedTheme.groundGrid} 1px, transparent 1px)
                    `,
                    backgroundSize: '16px 16px',
                    opacity: 0.4,
                  }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>
                {selectedConfig.unlocked ? selectedTheme.mapIcon : '🔒'}
              </span>
            </div>

            <div className="font-vt323 text-lg text-center mb-3" style={{ color: '#c8d8e8', lineHeight: 1.4 }}>
              {selectedConfig.unlocked ? selectedTheme.description : 'Заблокировано'}
            </div>

            {selectedConfig.unlocked && (
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex justify-between">
                  <span className="font-pixel" style={{ fontSize: 7, color: '#808090' }}>УРОВЕНЬ</span>
                  <span className="font-pixel" style={{ fontSize: 7, color: selectedTheme.hudColor }}>{selectedConfig.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel" style={{ fontSize: 7, color: '#808090' }}>ВРАГИ</span>
                  <span className="font-pixel" style={{ fontSize: 7, color: '#e05050' }}>{3 + selectedConfig.level * 2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel" style={{ fontSize: 7, color: '#808090' }}>СТАТУС</span>
                  <span className="font-pixel" style={{ fontSize: 7, color: selectedConfig.completed ? '#f5c842' : '#4090e0' }}>
                    {selectedConfig.completed ? '★ ПРОЙДЕН' : 'НЕ ПРОЙДЕН'}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => selectedConfig.unlocked && onSelectLevel(selectedConfig.level)}
              disabled={!selectedConfig.unlocked}
              className="pixel-btn w-full"
              style={{
                borderColor: selectedConfig.unlocked ? selectedTheme.borderColor : '#2a3040',
                color: selectedConfig.unlocked ? selectedTheme.hudColor : '#3a3a5a',
                fontSize: 8,
                opacity: selectedConfig.unlocked ? 1 : 0.4,
                cursor: selectedConfig.unlocked ? 'pointer' : 'not-allowed',
              }}
            >
              {selectedConfig.unlocked ? '▶ ИГРАТЬ' : '🔒 ЗАКРЫТО'}
            </button>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex gap-4 justify-center mt-2">
          <button onClick={onBack} className="pixel-btn pixel-btn-red" style={{ fontSize: 8 }}>
            ← МЕНЮ
          </button>
          <div className="font-vt323 text-xl flex items-center" style={{ color: 'var(--pixel-light)', opacity: 0.5 }}>
            ←→ выбор  &nbsp; ENTER — играть
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
