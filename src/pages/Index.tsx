import React, { useState, useCallback, useEffect, useRef } from 'react';
import MainMenu from '@/components/game/MainMenu';
import GameEngine from '@/components/game/GameEngine';
import SettingsScreen, { GameSettings } from '@/components/game/SettingsScreen';
import ResultScreen from '@/components/game/ResultScreen';
import LevelMap from '@/components/game/LevelMap';
import CharacterSelect, { type MobianCharacter, CHARACTERS } from '@/components/game/CharacterSelect';
import EquipmentSelect, { DEFAULT_LOADOUT, type LoadoutConfig } from '@/components/game/EquipmentSelect';

const FpsCounter: React.FC = () => {
  const [fps, setFps] = useState(0);
  const framesRef = useRef(0);
  const lastRef = useRef(performance.now());
  useEffect(() => {
    let raf: number;
    const tick = () => {
      framesRef.current++;
      const now = performance.now();
      if (now - lastRef.current >= 1000) {
        setFps(framesRef.current);
        framesRef.current = 0;
        lastRef.current = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div
      style={{
        position: 'absolute', top: 4, right: 4, zIndex: 200,
        fontFamily: '"Press Start 2P", monospace', fontSize: 7,
        color: fps >= 55 ? '#a0e050' : fps >= 30 ? '#f5c842' : '#e05050',
        background: 'rgba(0,0,0,0.7)', padding: '3px 6px',
        border: '1px solid rgba(245,200,66,0.3)',
        pointerEvents: 'none',
      }}
    >
      {fps} FPS
    </div>
  );
};

type Screen = 'menu' | 'charselect' | 'equipment' | 'levelmap' | 'game' | 'settings' | 'result';

interface ResultData {
  score: number;
  kills: number;
  level: number;
  victory: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  sfx: 7,
  music: 5,
  pixelSize: 2,
  controls: 'both',
  difficulty: 'normal',
  scanlines: true,
  brightness: 8,
  showFps: false,
};

const GAME_W = 800;
const GAME_H = 560;

const Index: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxUnlocked, setMaxUnlocked] = useState(10);
  const [result, setResult] = useState<ResultData | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<MobianCharacter>(CHARACTERS[0]);
  const [gameMode, setGameMode] = useState<'quest' | 'battle'>('battle');
  const [loadout, setLoadout] = useState<LoadoutConfig>(DEFAULT_LOADOUT);

  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scale = Math.min(viewport.w / GAME_W, viewport.h / GAME_H);

  const handleGameOver = useCallback((score: number, kills: number, level: number) => {
    setResult({ score, kills, level, victory: false });
    setTimeout(() => setScreen('result'), 800);
  }, []);

  const handleVictory = useCallback((score: number, kills: number, level: number) => {
    setResult({ score, kills, level, victory: true });
    setMaxUnlocked(prev => Math.max(prev, level + 1));
    setTimeout(() => setScreen('result'), 800);
  }, []);

  const handleNextLevel = () => {
    const next = currentLevel + 1;
    setCurrentLevel(next);
    setMaxUnlocked(prev => Math.max(prev, next));
    setGameKey(k => k + 1);
    setScreen('game');
  };

  const handleRetry = () => {
    setGameKey(k => k + 1);
    setScreen('game');
  };

  const handleResetProgress = () => {
    setMaxUnlocked(10);
    setCurrentLevel(1);
    setScreen('menu');
  };

  const handleStart = () => {
    setScreen('charselect');
  };

  const handleCharSelect = (char: MobianCharacter, mode: 'quest' | 'battle') => {
    setSelectedCharacter(char);
    setGameMode(mode);
    setScreen('equipment');
  };

  const handleEquipmentSave = (newLoadout: LoadoutConfig) => {
    setLoadout(newLoadout);
    setScreen('levelmap');
  };

  const handleSelectLevel = (level: number) => {
    setCurrentLevel(level);
    setGameKey(k => k + 1);
    setScreen('game');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: '#000', overflow: 'hidden' }}
    >
      <div
        style={{
          width: GAME_W,
          height: GAME_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          position: 'relative',
          overflow: 'hidden',
          filter: `brightness(${0.4 + settings.brightness * 0.07})`,
        }}
      >
        {screen === 'menu' && (
          <div className="w-full h-full animate-fade-in">
            <MainMenu
              onStart={handleStart}
              onSettings={() => setScreen('settings')}
              onQuit={() => setScreen('menu')}
            />
          </div>
        )}

        {screen === 'charselect' && (
          <div className="w-full h-full animate-fade-in">
            <CharacterSelect
              onSelect={handleCharSelect}
              onBack={() => setScreen('menu')}
            />
          </div>
        )}

        {screen === 'equipment' && (
          <div className="w-full h-full animate-fade-in">
            <EquipmentSelect
              character={selectedCharacter}
              maxUnlocked={maxUnlocked}
              loadout={loadout}
              onSave={handleEquipmentSave}
              onBack={() => setScreen('charselect')}
            />
          </div>
        )}

        {screen === 'levelmap' && (
          <div className="w-full h-full animate-fade-in">
            <LevelMap
              maxUnlocked={maxUnlocked}
              onSelectLevel={handleSelectLevel}
              onBack={() => setScreen('equipment')}
              character={selectedCharacter}
              gameMode={gameMode}
            />
          </div>
        )}

        {screen === 'game' && (
          <div className="w-full h-full">
            <GameEngine
              key={gameKey}
              width={GAME_W}
              height={GAME_H}
              onGameOver={handleGameOver}
              onVictory={handleVictory}
              settings={{ sfx: settings.sfx, pixelSize: settings.pixelSize }}
              level={currentLevel}
              character={selectedCharacter}
              gameMode={gameMode}
              loadout={loadout}
            />
          </div>
        )}

        {/* Global scanlines overlay */}
        {settings.scanlines && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
              zIndex: 40,
            }}
          />
        )}

        {/* FPS counter */}
        {settings.showFps && <FpsCounter />}

        {screen === 'settings' && (
          <div className="w-full h-full animate-fade-in">
            <SettingsScreen
              settings={settings}
              onSave={setSettings}
              onBack={() => setScreen('menu')}
              onResetProgress={handleResetProgress}
            />
          </div>
        )}

        {screen === 'result' && result && (
          <div className="w-full h-full animate-fade-in">
            <ResultScreen
              score={result.score}
              kills={result.kills}
              level={result.level}
              victory={result.victory}
              onNextLevel={handleNextLevel}
              onRetry={handleRetry}
              onMenu={() => setScreen('levelmap')}
            />
          </div>
        )}

        {/* CRT vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%)',
            zIndex: 50,
          }}
        />
      </div>
    </div>
  );
};

export default Index;
