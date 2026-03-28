import React, { useState, useEffect, useCallback } from 'react';
import { THEMES, isBossLevel, getEnemyCount, type LevelConfig } from './levelThemes';
import { type MobianCharacter } from './CharacterSelect';

const TOTAL_LEVELS = 1000;
const PAGE_SIZE = 10; // levels per page

interface LevelMapProps {
  maxUnlocked: number;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
  character?: MobianCharacter;
  gameMode?: 'quest' | 'battle';
}

// Build configs for a page of levels (pageStart..pageStart+PAGE_SIZE-1)
function buildPageConfigs(pageStart: number, maxUnlocked: number): LevelConfig[] {
  const themeKeys = Object.keys(THEMES);
  const configs: LevelConfig[] = [];
  for (let i = pageStart; i < pageStart + PAGE_SIZE && i <= TOTAL_LEVELS; i++) {
    const themeIdx = Math.floor((i - 1) / 5) % themeKeys.length;
    const theme = THEMES[themeKeys[themeIdx]];
    const boss = isBossLevel(i);
    configs.push({
      level: i,
      themeId: theme.id,
      name: boss ? `${theme.label} — БОСС ${i}` : `${theme.label} — ${i}`,
      stars: 0,
      unlocked: i <= maxUnlocked,
      completed: i < maxUnlocked,
      isBoss: boss,
    });
  }
  return configs;
}

const LevelNode: React.FC<{
  config: LevelConfig;
  selected: boolean;
  onSelect: () => void;
  index: number; // 0..9
}> = ({ config, selected, onSelect, index }) => {
  const theme = THEMES[config.themeId];
  const locked = !config.unlocked;
  const col = index % 5;
  const row = Math.floor(index / 5);
  const NODE = 88;
  const GAP = 14;
  const x = col * (NODE + GAP);
  const y = row * (NODE + GAP);

  return (
    <div
      style={{
        position: 'absolute',
        left: x, top: y,
        width: NODE, height: NODE,
        cursor: locked ? 'not-allowed' : 'pointer',
        transition: 'transform 0.1s',
        transform: selected ? 'scale(1.1)' : 'scale(1)',
        zIndex: selected ? 10 : 1,
      }}
      onClick={() => !locked && onSelect()}
    >
      <div
        style={{
          width: '100%', height: '100%',
          background: locked ? '#10101e' : theme.mapBg,
          border: `3px solid ${selected ? theme.borderColor : locked ? '#1e1e30' : theme.wall}`,
          boxShadow: selected
            ? `0 0 18px ${theme.borderColor}, 3px 3px 0 rgba(0,0,0,0.8)`
            : '3px 3px 0 rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 2, position: 'relative', overflow: 'hidden',
        }}
      >
        {!locked && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(${theme.groundGrid} 1px, transparent 1px), linear-gradient(90deg, ${theme.groundGrid} 1px, transparent 1px)`,
            backgroundSize: '14px 14px', opacity: 0.35,
          }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)', zIndex: 2 }} />

        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center' }}>
          {config.isBoss && !locked ? (
            <div style={{ fontSize: 22, filter: `drop-shadow(0 0 6px #ff2020)` }}>☠</div>
          ) : locked ? (
            <div style={{ fontSize: 22 }}>🔒</div>
          ) : (
            <div style={{ fontSize: 22, filter: selected ? `drop-shadow(0 0 6px ${theme.borderColor})` : 'none' }}>
              {theme.mapIcon}
            </div>
          )}
          <div style={{
            fontFamily: '"Press Start 2P", monospace', fontSize: 7,
            color: locked ? '#2a2a4a' : selected ? theme.borderColor : theme.hudColor,
            textShadow: selected && !locked ? `0 0 8px ${theme.borderColor}` : 'none',
            marginTop: 2,
          }}>
            {config.level}
          </div>
          {config.isBoss && !locked && (
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#ff4040', marginTop: 1 }}>BOSS</div>
          )}
          {config.completed && !config.isBoss && (
            <div style={{ color: '#f5c842', fontSize: 8, marginTop: 1 }}>★</div>
          )}
        </div>
      </div>

      {selected && (
        <div style={{
          position: 'absolute', inset: -3,
          border: `2px solid ${theme.borderColor}`,
          animation: 'pixel-blink 0.5s steps(1) infinite',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
};

const LevelMap: React.FC<LevelMapProps> = ({ maxUnlocked, onSelectLevel, onBack, character, gameMode }) => {
  const [page, setPage] = useState(() => Math.max(0, Math.floor((maxUnlocked - 1) / PAGE_SIZE)));
  const [selectedIdx, setSelectedIdx] = useState(() => (maxUnlocked - 1) % PAGE_SIZE);

  const pageStart = page * PAGE_SIZE + 1;
  const configs = buildPageConfigs(pageStart, maxUnlocked);
  const totalPages = Math.ceil(TOTAL_LEVELS / PAGE_SIZE);

  const selectedConfig = configs[Math.min(selectedIdx, configs.length - 1)];
  const selectedTheme = THEMES[selectedConfig?.themeId ?? 'forest'];

  const goPage = useCallback((newPage: number) => {
    const p = Math.max(0, Math.min(totalPages - 1, newPage));
    setPage(p);
    setSelectedIdx(0);
  }, [totalPages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') setSelectedIdx(s => Math.max(0, s - 1));
      if (e.code === 'ArrowRight') setSelectedIdx(s => Math.min(configs.length - 1, s + 1));
      if (e.code === 'ArrowUp') {
        if (selectedIdx < 5) goPage(page - 1);
        else setSelectedIdx(s => Math.max(0, s - 5));
      }
      if (e.code === 'ArrowDown') {
        if (selectedIdx >= 5) goPage(page + 1);
        else setSelectedIdx(s => Math.min(configs.length - 1, s + 5));
      }
      if (e.code === 'Enter' || e.code === 'Space') {
        if (selectedConfig?.unlocked) onSelectLevel(selectedConfig.level);
      }
      if (e.code === 'Escape') onBack();
      if (e.code === 'BracketRight') goPage(page + 1);
      if (e.code === 'BracketLeft') goPage(page - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIdx, configs, selectedConfig, onSelectLevel, onBack, page, goPage]);

  const NODE = 88;
  const GAP = 14;
  const mapW = 5 * (NODE + GAP) - GAP;
  const mapH = 2 * (NODE + GAP) - GAP;

  const enemyCount = selectedConfig ? getEnemyCount(selectedConfig.level) : 0;

  // Jump to level by number
  const [jumpVal, setJumpVal] = useState('');
  const handleJump = () => {
    const lvl = parseInt(jumpVal);
    if (!isNaN(lvl) && lvl >= 1 && lvl <= TOTAL_LEVELS && lvl <= maxUnlocked) {
      const p = Math.floor((lvl - 1) / PAGE_SIZE);
      const idx = (lvl - 1) % PAGE_SIZE;
      setPage(p);
      setSelectedIdx(idx);
    }
    setJumpVal('');
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-start pixel-bg"
      style={{ background: 'var(--pixel-darker)', overflow: 'hidden', paddingTop: 8 }}
    >
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
        zIndex: 1,
      }} />

      <div className="relative z-10 w-full flex flex-col items-center gap-3">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 12, color: 'var(--pixel-gold)', textShadow: '0 0 12px var(--pixel-gold)', letterSpacing: '2px' }}>
            КАРТА УРОВНЕЙ
          </div>
          <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: '#505060' }}>
            {maxUnlocked}/{TOTAL_LEVELS}
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-4 items-start justify-center w-full px-4">
          {/* Left: nav + grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            {/* Page nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => goPage(page - 1)}
                disabled={page === 0}
                style={{
                  fontFamily: '"Press Start 2P", monospace', fontSize: 7,
                  padding: '5px 10px',
                  background: '#0a0e18', color: page === 0 ? '#303040' : '#c0c0d0',
                  border: `2px solid ${page === 0 ? '#1e1e30' : '#404060'}`,
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                ◄
              </button>
              <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: '#a0a0c0', minWidth: 120, textAlign: 'center' }}>
                УРОВНИ {pageStart}–{Math.min(pageStart + PAGE_SIZE - 1, TOTAL_LEVELS)}
              </div>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page >= totalPages - 1 || pageStart + PAGE_SIZE - 1 > maxUnlocked}
                style={{
                  fontFamily: '"Press Start 2P", monospace', fontSize: 7,
                  padding: '5px 10px',
                  background: '#0a0e18',
                  color: (page >= totalPages - 1 || pageStart + PAGE_SIZE - 1 > maxUnlocked) ? '#303040' : '#c0c0d0',
                  border: `2px solid ${(page >= totalPages - 1 || pageStart + PAGE_SIZE - 1 > maxUnlocked) ? '#1e1e30' : '#404060'}`,
                  cursor: (page >= totalPages - 1 || pageStart + PAGE_SIZE - 1 > maxUnlocked) ? 'not-allowed' : 'pointer',
                }}
              >
                ►
              </button>
            </div>

            {/* Level grid */}
            <div style={{ position: 'relative', width: mapW, height: mapH }}>
              {/* SVG path lines */}
              <svg style={{ position: 'absolute', inset: 0, width: mapW, height: mapH, zIndex: 0, pointerEvents: 'none' }}>
                {configs.slice(0, -1).map((cfg, i) => {
                  const c1 = i % 5, r1 = Math.floor(i / 5);
                  const c2 = (i + 1) % 5, r2 = Math.floor((i + 1) / 5);
                  const x1 = c1 * (NODE + GAP) + NODE / 2;
                  const y1 = r1 * (NODE + GAP) + NODE / 2;
                  const x2 = c2 * (NODE + GAP) + NODE / 2;
                  const y2 = r2 * (NODE + GAP) + NODE / 2;
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={cfg.completed ? '#f5c84260' : '#2a304060'}
                      strokeWidth={2} strokeDasharray="6 4" opacity={0.6}
                    />
                  );
                })}
              </svg>

              {configs.map((cfg, i) => (
                <LevelNode
                  key={cfg.level}
                  config={cfg}
                  selected={selectedIdx === i}
                  onSelect={() => setSelectedIdx(i)}
                  index={i}
                />
              ))}
            </div>

            {/* Jump input */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: '#505060' }}>ПЕРЕЙТИ:</span>
              <input
                type="number"
                value={jumpVal}
                onChange={e => setJumpVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJump()}
                placeholder="№"
                min={1} max={maxUnlocked}
                style={{
                  fontFamily: '"Press Start 2P", monospace', fontSize: 7,
                  width: 60, padding: '4px 6px',
                  background: '#0a0e18', color: '#c0c0e0',
                  border: '2px solid #303050', outline: 'none',
                }}
              />
              <button
                onClick={handleJump}
                style={{
                  fontFamily: '"Press Start 2P", monospace', fontSize: 6,
                  padding: '5px 8px',
                  background: '#0a1a0a', color: '#80c060',
                  border: '2px solid #3a5a2a', cursor: 'pointer',
                }}
              >
                ОК
              </button>
            </div>
          </div>

          {/* Info panel */}
          {selectedConfig && (
            <div style={{
              width: 188,
              background: 'rgba(8,12,16,0.95)',
              border: `3px solid ${selectedConfig.unlocked ? selectedTheme.borderColor : '#2a3040'}`,
              boxShadow: selectedConfig.unlocked ? `0 0 14px ${selectedTheme.borderColor}40` : 'none',
              padding: 12, flexShrink: 0,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              {/* Boss badge */}
              {selectedConfig.isBoss && selectedConfig.unlocked && (
                <div style={{
                  fontFamily: '"Press Start 2P", monospace', fontSize: 7,
                  color: '#ff2020', textShadow: '0 0 10px #ff2020',
                  textAlign: 'center', padding: '4px',
                  border: '2px solid #ff2020', background: 'rgba(30,0,0,0.7)',
                  animation: 'pixel-blink 0.8s steps(1) infinite',
                }}>
                  ☠ БОСС УРОВЕНЬ ☠
                </div>
              )}

              <div style={{
                fontFamily: '"Press Start 2P", monospace', fontSize: 6,
                color: selectedConfig.unlocked ? selectedTheme.hudColor : '#3a3a5a',
                lineHeight: 1.7, textAlign: 'center',
              }}>
                {selectedConfig.unlocked ? selectedTheme.label : '???'}
              </div>

              {/* Preview */}
              <div style={{
                width: '100%', height: 64,
                background: selectedConfig.unlocked ? selectedTheme.mapBg : '#1a1a2a',
                border: `2px solid ${selectedConfig.unlocked ? selectedTheme.wall : '#2a2a3a'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, position: 'relative', overflow: 'hidden',
              }}>
                {selectedConfig.unlocked && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `linear-gradient(${selectedTheme.groundGrid} 1px, transparent 1px), linear-gradient(90deg, ${selectedTheme.groundGrid} 1px, transparent 1px)`,
                    backgroundSize: '12px 12px', opacity: 0.3,
                  }} />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {selectedConfig.isBoss && selectedConfig.unlocked ? '☠' : (selectedConfig.unlocked ? selectedTheme.mapIcon : '🔒')}
                </span>
              </div>

              <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#808090', lineHeight: 1.8 }}>
                {selectedConfig.unlocked ? selectedTheme.description : 'Заблокировано'}
              </div>

              {selectedConfig.unlocked && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: 'УРОВЕНЬ', value: String(selectedConfig.level), color: selectedTheme.hudColor },
                    { label: selectedConfig.isBoss ? 'ТАЙП' : 'ВРАГИ', value: selectedConfig.isBoss ? 'BOSS+2' : String(enemyCount), color: '#e05050' },
                    { label: 'СТАТУС', value: selectedConfig.completed ? '★ ПРОЙДЕН' : 'АКТИВЕН', color: selectedConfig.completed ? '#f5c842' : '#4090e0' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#606070' }}>{row.label}</span>
                      <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => selectedConfig.unlocked && onSelectLevel(selectedConfig.level)}
                disabled={!selectedConfig.unlocked}
                style={{
                  fontFamily: '"Press Start 2P", monospace', fontSize: 7,
                  padding: '8px', width: '100%',
                  background: selectedConfig.unlocked ? (selectedConfig.isBoss ? 'rgba(60,0,0,0.8)' : 'rgba(8,20,8,0.8)') : 'rgba(4,8,16,0.8)',
                  color: selectedConfig.unlocked ? (selectedConfig.isBoss ? '#ff4040' : selectedTheme.hudColor) : '#3a3a5a',
                  border: `2px solid ${selectedConfig.unlocked ? (selectedConfig.isBoss ? '#ff2020' : selectedTheme.borderColor) : '#2a3040'}`,
                  cursor: selectedConfig.unlocked ? 'pointer' : 'not-allowed',
                  opacity: selectedConfig.unlocked ? 1 : 0.4,
                }}
              >
                {selectedConfig.unlocked ? (selectedConfig.isBoss ? '☠ СРАЗИТЬСЯ' : '▶ ИГРАТЬ') : '🔒 ЗАКРЫТО'}
              </button>
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
          <button onClick={onBack} style={{
            fontFamily: '"Press Start 2P", monospace', fontSize: 7,
            padding: '6px 10px', background: 'rgba(40,8,8,0.9)',
            color: '#e05050', border: '2px solid #603020', cursor: 'pointer',
          }}>
            ← НАЗАД
          </button>

          {character && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(8,12,20,0.9)', border: `2px solid ${character.color}`,
              padding: '3px 8px',
            }}>
              <div style={{
                width: 18, height: 18, background: character.colorDark, border: `1px solid ${character.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: character.accentColor,
              }}>
                {character.name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: character.accentColor }}>
                {character.name}
              </span>
              <span style={{
                fontFamily: '"Press Start 2P", monospace', fontSize: 5,
                color: gameMode === 'quest' ? '#4abaff' : '#f5c842',
                padding: '2px 4px',
                background: gameMode === 'quest' ? 'rgba(74,186,255,0.15)' : 'rgba(245,200,66,0.15)',
              }}>
                {gameMode === 'quest' ? '⏱ КВЕСТ' : '🤖 БОЙ'}
              </span>
            </div>
          )}

          <div style={{ fontFamily: '"VT323", monospace', fontSize: 16, color: '#c8d8e8', opacity: 0.4 }}>
            ←→↑↓ выбор &nbsp; ENTER — играть &nbsp; [/] — страница
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
