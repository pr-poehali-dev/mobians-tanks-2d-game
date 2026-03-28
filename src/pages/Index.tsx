import React, { useState, useCallback, useEffect } from 'react';
import MainMenu from '@/components/game/MainMenu';
import GameEngine from '@/components/game/GameEngine';
import SettingsScreen, { GameSettings } from '@/components/game/SettingsScreen';
import ResultScreen from '@/components/game/ResultScreen';
import LevelMap from '@/components/game/LevelMap';

type Screen = 'menu' | 'levelmap' | 'game' | 'settings' | 'result';

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
  controls: 'wasd',
  difficulty: 'normal',
};

const GAME_W = 800;
const GAME_H = 560;

const Index: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxUnlocked, setMaxUnlocked] = useState(1);
  const [result, setResult] = useState<ResultData | null>(null);
  const [gameKey, setGameKey] = useState(0);

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

  const handleStart = () => {
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

        {screen === 'levelmap' && (
          <div className="w-full h-full animate-fade-in">
            <LevelMap
              maxUnlocked={maxUnlocked}
              onSelectLevel={handleSelectLevel}
              onBack={() => setScreen('menu')}
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
            />
          </div>
        )}

        {screen === 'settings' && (
          <div className="w-full h-full animate-fade-in">
            <SettingsScreen
              settings={settings}
              onSave={setSettings}
              onBack={() => setScreen('menu')}
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
