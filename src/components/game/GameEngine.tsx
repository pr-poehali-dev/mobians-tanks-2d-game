import React, { useEffect, useRef, useCallback, useState } from 'react';
import { getLevelTheme, type LevelTheme } from './levelThemes';
import { type MobianCharacter, CHARACTERS } from './CharacterSelect';

export interface Tank {
  id: string;
  x: number;
  y: number;
  rotation: number;
  hp: number;
  maxHp: number;
  isPlayer: boolean;
  vx: number;
  vy: number;
  shootCooldown: number;
  aiTimer: number;
  aiTargetAngle: number;
  charId?: string;
  invisible?: number;
  slowAura?: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fromPlayer: boolean;
  life: number;
  special?: 'phase' | 'explode' | 'trail';
  trailX?: number[];
  trailY?: number[];
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
  big?: boolean;
}

export interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Pickup {
  id: string;
  x: number;
  y: number;
  type: 'health' | 'ammo' | 'shield';
  life: number;
}

export interface GameState {
  tanks: Tank[];
  bullets: Bullet[];
  explosions: Explosion[];
  walls: Wall[];
  pickups: Pickup[];
  score: number;
  level: number;
  gameOver: boolean;
  victory: boolean;
  killCount: number;
  totalEnemies: number;
  timeLeft: number;
  shieldActive: number;
}

interface GameEngineProps {
  width: number;
  height: number;
  onGameOver: (score: number, kills: number, level: number) => void;
  onVictory: (score: number, kills: number, level: number) => void;
  settings: { sfx: number; pixelSize: number };
  level: number;
  character?: MobianCharacter;
  gameMode?: 'quest' | 'battle';
}

const TILE = 32;
const SPEED = 2.5;
const BULLET_SPEED = 7;
const BULLET_DAMAGE = 25;
const QUEST_TIME = 90;

// ─── Level generation ────────────────────────────────────────────────────────
function generateLevel(level: number, W: number, H: number) {
  const walls: Wall[] = [];
  const borderThick = TILE;
  walls.push({ x: 0, y: 0, w: W, h: borderThick });
  walls.push({ x: 0, y: H - borderThick, w: W, h: borderThick });
  walls.push({ x: 0, y: 0, w: borderThick, h: H });
  walls.push({ x: W - borderThick, y: 0, w: borderThick, h: H });

  // Предопределённые паттерны карт по теме
  const themePatterns: Wall[][] = [
    // Лес — "+" перекрёсток
    [
      { x: 240, y: 160, w: 32, h: 128 }, { x: 160, y: 240, w: 128, h: 32 },
      { x: 480, y: 200, w: 64, h: 32 }, { x: 520, y: 320, w: 32, h: 96 },
      { x: 300, y: 400, w: 128, h: 32 }, { x: 100, y: 360, w: 96, h: 32 },
      { x: 600, y: 160, w: 32, h: 128 }, { x: 680, y: 400, w: 64, h: 64 },
    ],
    // Пустыня — дюны и руины
    [
      { x: 160, y: 128, w: 128, h: 32 }, { x: 400, y: 96, w: 32, h: 96 },
      { x: 560, y: 160, w: 96, h: 32 }, { x: 200, y: 320, w: 32, h: 128 },
      { x: 300, y: 400, w: 160, h: 32 }, { x: 560, y: 360, w: 128, h: 32 },
      { x: 96, y: 448, w: 96, h: 32 }, { x: 640, y: 256, w: 32, h: 96 },
    ],
    // База — коридоры
    [
      { x: 128, y: 96, w: 256, h: 32 }, { x: 128, y: 96, w: 32, h: 128 },
      { x: 352, y: 96, w: 32, h: 64 }, { x: 480, y: 128, w: 192, h: 32 },
      { x: 640, y: 128, w: 32, h: 192 }, { x: 160, y: 320, w: 32, h: 192 },
      { x: 160, y: 480, w: 256, h: 32 }, { x: 416, y: 384, w: 256, h: 32 },
      { x: 320, y: 224, w: 128, h: 32 },
    ],
    // Вулкан — скалы
    [
      { x: 192, y: 128, w: 64, h: 64 }, { x: 512, y: 96, w: 64, h: 96 },
      { x: 128, y: 288, w: 96, h: 64 }, { x: 352, y: 256, w: 64, h: 64 },
      { x: 576, y: 288, w: 96, h: 32 }, { x: 256, y: 400, w: 160, h: 64 },
      { x: 544, y: 416, w: 96, h: 64 }, { x: 96, y: 448, w: 64, h: 32 },
    ],
    // Снег — льдины
    [
      { x: 160, y: 160, w: 96, h: 32 }, { x: 320, y: 128, w: 32, h: 96 },
      { x: 480, y: 160, w: 128, h: 32 }, { x: 128, y: 320, w: 32, h: 128 },
      { x: 256, y: 352, w: 192, h: 32 }, { x: 544, y: 288, w: 32, h: 128 },
      { x: 320, y: 448, w: 64, h: 64 }, { x: 672, y: 160, w: 64, h: 64 },
    ],
  ];

  const themeIdx = Math.floor((level - 1) / 2) % themePatterns.length;
  const basePattern = themePatterns[themeIdx];
  walls.push(...basePattern);

  // Дополнительные случайные стены
  const placed: Wall[] = [...basePattern];
  const extraCount = 2 + Math.floor(level / 3);
  for (let i = 0; i < extraCount; i++) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const cols = Math.floor(Math.random() * 2) + 1;
      const rows = Math.floor(Math.random() * 2) + 1;
      const gx = Math.floor(Math.random() * ((W - borderThick * 2) / TILE - cols)) * TILE + borderThick;
      const gy = Math.floor(Math.random() * ((H - borderThick * 2) / TILE - rows)) * TILE + borderThick;
      if (gx > 150 && gy > 150) {
        const w: Wall = { x: gx, y: gy, w: cols * TILE, h: rows * TILE };
        const safe = !placed.some(p =>
          p.x < w.x + w.w + 24 && p.x + p.w > w.x - 24 &&
          p.y < w.y + w.h + 24 && p.y + p.h > w.y - 24
        );
        if (safe) { placed.push(w); walls.push(w); break; }
      }
    }
  }

  const enemyCount = 2 + level * 2;
  const enemies: Tank[] = [];
  const enemyCharIds = CHARACTERS.filter(c => c.id !== 'sonic').map(c => c.id);
  for (let i = 0; i < enemyCount; i++) {
    let ex = 0, ey = 0;
    for (let a = 0; a < 50; a++) {
      ex = borderThick + TILE + Math.random() * (W - borderThick * 2 - TILE * 2);
      ey = borderThick + TILE + Math.random() * (H - borderThick * 2 - TILE * 2);
      const farFromPlayer = ex > 280 || ey > 280;
      const noWall = !walls.some(w => ex > w.x - TILE && ex < w.x + w.w + TILE && ey > w.y - TILE && ey < w.y + w.h + TILE);
      if (farFromPlayer && noWall) break;
    }
    enemies.push({
      id: `enemy-${i}`,
      x: ex, y: ey,
      rotation: Math.random() * 360,
      hp: 60 + level * 10,
      maxHp: 60 + level * 10,
      isPlayer: false,
      vx: 0, vy: 0,
      shootCooldown: Math.random() * 120,
      aiTimer: 0,
      aiTargetAngle: Math.random() * 360,
      charId: enemyCharIds[i % enemyCharIds.length],
    });
  }

  // pickups
  const pickups: Pickup[] = [];
  const pickupTypes: Pickup['type'][] = ['health', 'ammo', 'shield'];
  for (let i = 0; i < 3; i++) {
    let px = 0, py = 0;
    for (let a = 0; a < 20; a++) {
      px = borderThick + TILE + Math.random() * (W - borderThick * 2 - TILE * 2);
      py = borderThick + TILE + Math.random() * (H - borderThick * 2 - TILE * 2);
      const noWall = !walls.some(w => px > w.x - TILE && px < w.x + w.w + TILE && py > w.y - TILE && py < w.y + w.h + TILE);
      if (noWall) break;
    }
    pickups.push({ id: `pickup-${i}`, x: px, y: py, type: pickupTypes[i % 3], life: 600 });
  }

  return { walls, enemies, enemyCount, pickups };
}

function rectCircle(rx: number, ry: number, rw: number, rh: number, cx: number, cy: number, cr: number) {
  const nearX = Math.max(rx, Math.min(cx, rx + rw));
  const nearY = Math.max(ry, Math.min(cy, ry + rh));
  return Math.hypot(cx - nearX, cy - nearY) < cr;
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────
function drawGroundDecoration(ctx: CanvasRenderingContext2D, theme: LevelTheme, W: number, H: number, seed: number) {
  const rng = (n: number) => ((Math.sin(n * 127.1 + seed * 311.7) * 43758.5453) % 1 + 1) % 1;

  if (theme.id === 'forest') {
    ctx.fillStyle = theme.groundDetail;
    for (let i = 0; i < 30; i++) {
      const x = rng(i * 3) * W; const y = rng(i * 3 + 1) * H; const s = 4 + rng(i * 3 + 2) * 6;
      ctx.fillRect(x, y, s, s);
    }
    // Trees decoration
    ctx.fillStyle = '#2a4820';
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 8; i++) {
      const x = rng(i * 13) * (W - 64) + 32; const y = rng(i * 13 + 1) * (H - 64) + 32;
      ctx.fillRect(x - 6, y - 8, 12, 16);
      ctx.fillRect(x - 12, y - 20, 24, 16);
    }
    ctx.globalAlpha = 1;
  } else if (theme.id === 'desert') {
    ctx.fillStyle = theme.groundDetail;
    for (let i = 0; i < 20; i++) {
      const x = rng(i * 5) * W; const y = rng(i * 5 + 1) * H;
      ctx.fillRect(x, y, 8 + rng(i * 5 + 2) * 20, 2);
    }
    // Dunes
    ctx.fillStyle = '#4a3818';
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 5; i++) {
      const x = rng(i * 17) * W; const y = rng(i * 17 + 1) * H;
      ctx.fillRect(x, y, 80 + rng(i * 17 + 2) * 60, 6);
    }
    ctx.globalAlpha = 1;
  } else if (theme.id === 'base') {
    ctx.fillStyle = theme.groundDetail;
    for (let gx = TILE * 2; gx < W - TILE * 2; gx += TILE * 2) {
      ctx.fillRect(gx, TILE, 2, H - TILE * 2);
      ctx.fillRect(TILE, gx, W - TILE * 2, 2);
    }
    // Arrows on floor
    ctx.fillStyle = '#182838'; ctx.globalAlpha = 0.4;
    for (let i = 0; i < 4; i++) {
      const x = rng(i * 23) * (W - 96) + 48; const y = rng(i * 23 + 1) * (H - 96) + 48;
      ctx.fillRect(x, y, 4, 20); ctx.fillRect(x - 8, y + 8, 20, 4);
    }
    ctx.globalAlpha = 1;
  } else if (theme.id === 'volcano') {
    ctx.fillStyle = theme.groundDetail;
    for (let i = 0; i < 15; i++) {
      const x = rng(i * 7) * W; const y = rng(i * 7 + 1) * H; const s = 6 + rng(i * 7 + 2) * 10;
      ctx.fillRect(x - s / 2, y - s / 4, s, s / 2);
    }
    // Lava streams
    ctx.fillStyle = '#e04010'; ctx.globalAlpha = 0.18;
    for (let i = 0; i < 5; i++) {
      const x = rng(i * 11) * W; const y = rng(i * 11 + 1) * H;
      ctx.fillRect(x, y, 4 + rng(i * 11 + 2) * 8, 2);
    }
    ctx.globalAlpha = 1;
  } else if (theme.id === 'snow') {
    ctx.fillStyle = '#d0e8f8'; ctx.globalAlpha = 0.12;
    for (let i = 0; i < 25; i++) {
      const x = rng(i * 9) * W; const y = rng(i * 9 + 1) * H; const s = 2 + rng(i * 9 + 2) * 4;
      ctx.fillRect(x, y, s, s);
    }
    ctx.globalAlpha = 1;
    // Ice patches
    ctx.fillStyle = '#b8d8f0'; ctx.globalAlpha = 0.1;
    for (let i = 0; i < 6; i++) {
      const x = rng(i * 31) * W; const y = rng(i * 31 + 1) * H;
      ctx.fillRect(x, y, 40 + rng(i * 31 + 2) * 40, 20);
    }
    ctx.globalAlpha = 1;
  }
}

function drawWallThemed(ctx: CanvasRenderingContext2D, w: Wall, theme: LevelTheme) {
  ctx.fillStyle = theme.wall;
  ctx.fillRect(w.x, w.y, w.w, w.h);

  if (theme.id === 'forest') {
    ctx.fillStyle = theme.wallDark;
    for (let row = 0; row * 8 < w.h; row++) {
      for (let col = 0; col * 8 < w.w; col++) {
        if ((row + col) % 2 === 0) ctx.fillRect(w.x + col * 8, w.y + row * 8, 8, 8);
      }
    }
    ctx.fillStyle = theme.wallAccent;
    for (let i = 0; i * 16 < w.w; i++) {
      ctx.fillRect(w.x + i * 16, w.y, 6, 4);
      ctx.fillRect(w.x + i * 16, w.y + w.h - 4, 6, 4);
    }
  } else if (theme.id === 'desert') {
    ctx.fillStyle = theme.wallDark;
    for (let row = 0; row * 10 < w.h; row++) {
      const offset = row % 2 === 0 ? 0 : 10;
      for (let col = -1; col * 20 < w.w + 20; col++) {
        ctx.fillRect(w.x + col * 20 + offset, w.y + row * 10, 18, 8);
      }
    }
    ctx.fillStyle = theme.wallAccent; ctx.fillRect(w.x, w.y, w.w, 3);
  } else if (theme.id === 'base') {
    ctx.fillStyle = theme.wallDark; ctx.fillRect(w.x + 2, w.y + 2, w.w - 4, w.h - 4);
    ctx.fillStyle = theme.wallAccent;
    ctx.fillRect(w.x, w.y, w.w, 4); ctx.fillRect(w.x, w.y, 4, w.h);
    for (let i = 8; i < w.w - 4; i += 16) {
      ctx.fillStyle = '#5080a0'; ctx.fillRect(w.x + i, w.y + 2, 8, 8);
    }
  } else if (theme.id === 'volcano') {
    ctx.fillStyle = theme.wallDark;
    for (let row = 0; row * 8 < w.h; row++) {
      for (let col = 0; col * 8 < w.w; col++) {
        if (Math.sin(row * 3 + col * 7) > 0.3) ctx.fillRect(w.x + col * 8, w.y + row * 8, 8, 8);
      }
    }
    ctx.fillStyle = '#e04010'; ctx.globalAlpha = 0.3;
    ctx.fillRect(w.x, w.y + w.h - 4, w.w, 4); ctx.globalAlpha = 1;
  } else if (theme.id === 'snow') {
    ctx.fillStyle = theme.wallDark;
    for (let row = 0; row * 8 < w.h; row++) {
      const offset = row % 2 === 0 ? 0 : 8;
      for (let col = -1; col * 16 < w.w + 16; col++) {
        ctx.fillRect(w.x + col * 16 + offset, w.y + row * 8, 14, 6);
      }
    }
    ctx.fillStyle = '#d0e8f8'; ctx.globalAlpha = 0.4;
    ctx.fillRect(w.x, w.y, w.w, 4); ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = theme.wallAccent; ctx.lineWidth = 1;
  ctx.strokeRect(w.x, w.y, w.w, w.h);
}

function drawMobianHeadCanvas(
  ctx: CanvasRenderingContext2D,
  char: MobianCharacter,
  cx: number,
  cy: number,
  s: number = 1
) {
  ctx.save();
  ctx.translate(cx, cy);

  const faceColor = char.color;
  const faceLight = char.colorLight;
  const faceDark = char.colorDark;
  const muzzleColor = '#f0d8c8';
  const eyeC = char.eyeColor;
  const earInner = char.earColor;

  // ears
  if (char.id === 'sonic' || char.id === 'shadow' || char.id === 'silver' || char.id === 'amy') {
    ctx.fillStyle = faceDark;
    ctx.beginPath();
    ctx.moveTo(-6 * s, -8 * s); ctx.lineTo(-10 * s, -16 * s); ctx.lineTo(-2 * s, -11 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6 * s, -8 * s); ctx.lineTo(10 * s, -16 * s); ctx.lineTo(2 * s, -11 * s);
    ctx.fill();
    ctx.fillStyle = earInner;
    ctx.fillRect(-8 * s, -14 * s, 3 * s, 5 * s);
    ctx.fillRect(5 * s, -14 * s, 3 * s, 5 * s);
    if (char.id === 'amy') {
      ctx.fillStyle = '#e02060';
      ctx.fillRect(-8 * s, -10 * s, 16 * s, 2 * s);
      ctx.fillRect(-3 * s, -12 * s, 6 * s, 3 * s);
    }
  } else if (char.id === 'tails') {
    ctx.fillStyle = faceDark;
    ctx.fillRect(-9 * s, -14 * s, 5 * s, 8 * s);
    ctx.fillRect(4 * s, -14 * s, 5 * s, 8 * s);
    ctx.fillStyle = earInner;
    ctx.fillRect(-8 * s, -12 * s, 3 * s, 5 * s);
    ctx.fillRect(5 * s, -12 * s, 3 * s, 5 * s);
  } else if (char.id === 'knuckles') {
    ctx.fillStyle = faceDark;
    ctx.fillRect(-10 * s, -10 * s, 4 * s, 5 * s);
    ctx.fillRect(6 * s, -10 * s, 4 * s, 5 * s);
    ctx.fillStyle = earInner;
    ctx.fillRect(-9 * s, -9 * s, 2 * s, 3 * s);
    ctx.fillRect(7 * s, -9 * s, 2 * s, 3 * s);
  } else if (char.id === 'rouge') {
    ctx.fillStyle = faceDark;
    ctx.beginPath();
    ctx.moveTo(-4 * s, -8 * s); ctx.lineTo(-11 * s, -18 * s); ctx.lineTo(0, -10 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(4 * s, -8 * s); ctx.lineTo(11 * s, -18 * s); ctx.lineTo(0, -10 * s);
    ctx.fill();
    ctx.fillStyle = earInner;
    ctx.fillRect(-6 * s, -16 * s, 3 * s, 6 * s);
    ctx.fillRect(3 * s, -16 * s, 3 * s, 6 * s);
  } else if (char.id === 'blaze') {
    ctx.fillStyle = faceDark;
    ctx.fillRect(-9 * s, -14 * s, 5 * s, 7 * s);
    ctx.fillRect(4 * s, -14 * s, 5 * s, 7 * s);
    ctx.fillStyle = earInner;
    ctx.fillRect(-8 * s, -13 * s, 3 * s, 5 * s);
    ctx.fillRect(5 * s, -13 * s, 3 * s, 5 * s);
  }

  // head
  ctx.fillStyle = faceColor;
  ctx.fillRect(-8 * s, -8 * s, 16 * s, 15 * s);
  ctx.fillStyle = faceLight;
  ctx.fillRect(-6 * s, -6 * s, 12 * s, 8 * s);

  // muzzle
  ctx.fillStyle = muzzleColor;
  ctx.fillRect(-5 * s, 0, 10 * s, 6 * s);

  // eyes
  ctx.fillStyle = 'white';
  ctx.fillRect(-7 * s, -5 * s, 5 * s, 4 * s);
  ctx.fillRect(2 * s, -5 * s, 5 * s, 4 * s);
  ctx.fillStyle = eyeC;
  ctx.fillRect(-6 * s, -4 * s, 3 * s, 2 * s);
  ctx.fillRect(3 * s, -4 * s, 3 * s, 2 * s);
  ctx.fillStyle = '#000';
  ctx.fillRect(-5 * s, -4 * s, 2 * s, 2 * s);
  ctx.fillRect(4 * s, -4 * s, 2 * s, 2 * s);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-4 * s, -4 * s, 1 * s, 1 * s);
  ctx.fillRect(5 * s, -4 * s, 1 * s, 1 * s);

  // nose
  ctx.fillStyle = '#302020';
  ctx.fillRect(-2 * s, 1 * s, 4 * s, 2 * s);

  // specials
  if (char.id === 'shadow') {
    ctx.fillStyle = char.accentColor;
    ctx.fillRect(-8 * s, -3 * s, 3 * s, 1 * s);
    ctx.fillRect(5 * s, -3 * s, 3 * s, 1 * s);
  } else if (char.id === 'knuckles') {
    ctx.fillStyle = faceDark;
    for (let i = -6; i <= 6; i += 3) {
      ctx.fillRect(i * s - 1, -10 * s, 2 * s, 3 * s);
    }
  } else if (char.id === 'blaze') {
    ctx.fillStyle = char.accentColor;
    ctx.fillRect(-2 * s, -9 * s, 4 * s, 3 * s);
  } else if (char.id === 'rouge') {
    ctx.fillStyle = '#ff4080';
    ctx.fillRect(-2 * s, -9 * s, 4 * s, 3 * s);
    ctx.fillRect(-3 * s, -8 * s, 6 * s, 1 * s);
  } else if (char.id === 'silver') {
    ctx.fillStyle = char.accentColor; ctx.globalAlpha = 0.5;
    ctx.fillRect(-7 * s, -3 * s, 2 * s, 6 * s);
    ctx.fillRect(5 * s, -3 * s, 2 * s, 6 * s);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ─── Main Component ───────────────────────────────────────────────────────────
const GameEngine: React.FC<GameEngineProps> = ({
  width, height, onGameOver, onVictory, settings, level,
  character, gameMode = 'battle',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radarRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const bulletIdRef = useRef(0);
  const explosionIdRef = useRef(0);
  const theme = getLevelTheme(level);
  const char = character ?? CHARACTERS[0];

  const [hpDisplay, setHpDisplay] = useState(100);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [killDisplay, setKillDisplay] = useState(0);
  const [totalDisplay, setTotalDisplay] = useState(5);
  const [timeDisplay, setTimeDisplay] = useState(QUEST_TIME);
  const [shieldDisplay, setShieldDisplay] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  const playerSpeed = 2 + (char.speed / 10) * 1.5;
  const playerDamage = BULLET_DAMAGE * (0.7 + (char.power / 10) * 0.6);
  const playerMaxHp = Math.round(80 + (char.armor / 10) * 40);

  const initGame = useCallback(() => {
    const { walls, enemies, enemyCount, pickups } = generateLevel(level, width, height);
    const player: Tank = {
      id: 'player',
      x: 80, y: 80,
      rotation: 0,
      hp: playerMaxHp, maxHp: playerMaxHp,
      isPlayer: true,
      vx: 0, vy: 0,
      shootCooldown: 0,
      aiTimer: 0,
      aiTargetAngle: 0,
      charId: char.id,
      invisible: 0,
      slowAura: 0,
    };
    stateRef.current = {
      tanks: [player, ...enemies],
      bullets: [],
      explosions: [],
      walls,
      pickups,
      score: 0,
      level,
      gameOver: false,
      victory: false,
      killCount: 0,
      totalEnemies: enemyCount,
      timeLeft: QUEST_TIME * 60,
      shieldActive: 0,
    };
    setTotalDisplay(enemyCount);
    setTimeDisplay(QUEST_TIME);
  }, [level, width, height, char, playerMaxHp]);

  const spawnExplosion = (x: number, y: number, big = false) => {
    const s = stateRef.current;
    if (!s) return;
    s.explosions.push({
      id: `exp-${explosionIdRef.current++}`,
      x, y, frame: 0,
      maxFrames: big ? 24 : 12,
      big,
    });
  };

  const shoot = (tank: Tank, s: GameState) => {
    const rad = (tank.rotation - 90) * Math.PI / 180;
    const bx = tank.x + Math.cos(rad) * 20;
    const by = tank.y + Math.sin(rad) * 20;

    if (tank.isPlayer && char.id === 'tails') {
      // Double shot
      for (const side of [-5, 5]) {
        s.bullets.push({
          id: `b-${bulletIdRef.current++}`,
          x: bx + Math.cos(rad + Math.PI / 2) * side,
          y: by + Math.sin(rad + Math.PI / 2) * side,
          vx: Math.cos(rad) * BULLET_SPEED,
          vy: Math.sin(rad) * BULLET_SPEED,
          fromPlayer: true, life: 100,
        });
      }
    } else if (tank.isPlayer && char.id === 'shadow') {
      s.bullets.push({
        id: `b-${bulletIdRef.current++}`,
        x: bx, y: by,
        vx: Math.cos(rad) * BULLET_SPEED * 1.3,
        vy: Math.sin(rad) * BULLET_SPEED * 1.3,
        fromPlayer: true, life: 160, special: 'phase',
      });
    } else if (tank.isPlayer && char.id === 'amy') {
      s.bullets.push({
        id: `b-${bulletIdRef.current++}`,
        x: bx, y: by,
        vx: Math.cos(rad) * BULLET_SPEED * 0.7,
        vy: Math.sin(rad) * BULLET_SPEED * 0.7,
        fromPlayer: true, life: 80, special: 'explode',
      });
    } else if (tank.isPlayer && char.id === 'blaze') {
      s.bullets.push({
        id: `b-${bulletIdRef.current++}`,
        x: bx, y: by,
        vx: Math.cos(rad) * BULLET_SPEED,
        vy: Math.sin(rad) * BULLET_SPEED,
        fromPlayer: true, life: 100, special: 'trail',
        trailX: [], trailY: [],
      });
    } else {
      s.bullets.push({
        id: `b-${bulletIdRef.current++}`,
        x: bx, y: by,
        vx: Math.cos(rad) * BULLET_SPEED,
        vy: Math.sin(rad) * BULLET_SPEED,
        fromPlayer: tank.isPlayer, life: 120,
      });
    }

    const cooldown = tank.isPlayer
      ? Math.round(30 * (1 - (char.speed - 5) * 0.04))
      : 80 + Math.random() * 40;
    tank.shootCooldown = Math.max(10, cooldown);
  };

  const update = useCallback((dt: number) => {
    const s = stateRef.current;
    if (!s || s.gameOver || s.victory || pausedRef.current) return;

    // Quest timer
    if (gameMode === 'quest') {
      s.timeLeft -= dt;
      if (s.timeLeft <= 0) {
        s.gameOver = true;
        onGameOver(s.score, s.killCount, s.level);
        return;
      }
      setTimeDisplay(Math.ceil(s.timeLeft / 60));
    }

    // Shield countdown
    if (s.shieldActive > 0) s.shieldActive -= dt;

    const keys = keysRef.current;
    const player = s.tanks.find(t => t.isPlayer);
    if (!player) return;

    // Rouge invisibility toggle
    if (char.id === 'rouge' && keys.has('KeyQ') && player.invisible === 0) {
      player.invisible = 180;
    }
    if (player.invisible !== undefined && player.invisible > 0) player.invisible -= dt;

    // Silver slow aura
    if (char.id === 'silver') {
      player.slowAura = 1;
    }

    let moved = false;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) { player.rotation -= 3; }
    if (keys.has('ArrowRight') || keys.has('KeyD')) { player.rotation += 3; }
    if (keys.has('ArrowUp') || keys.has('KeyW')) {
      const rad = (player.rotation - 90) * Math.PI / 180;
      player.vx = Math.cos(rad) * playerSpeed;
      player.vy = Math.sin(rad) * playerSpeed;
      moved = true;
    } else if (keys.has('ArrowDown') || keys.has('KeyS')) {
      const rad = (player.rotation - 90) * Math.PI / 180;
      player.vx = -Math.cos(rad) * playerSpeed * 0.6;
      player.vy = -Math.sin(rad) * playerSpeed * 0.6;
      moved = true;
    } else {
      player.vx = 0; player.vy = 0;
    }
    if (!moved) { player.vx *= 0.7; player.vy *= 0.7; }

    if ((keys.has('Space') || keys.has('KeyZ')) && player.shootCooldown <= 0) {
      shoot(player, s);
    }
    if (player.shootCooldown > 0) player.shootCooldown -= dt;

    // AI
    for (const tank of s.tanks) {
      if (!tank.isPlayer) {
        const isSlowed = player.slowAura && Math.hypot(player.x - tank.x, player.y - tank.y) < 200;
        const aiSpeed = isSlowed ? SPEED * 0.3 : SPEED * 0.8;
        const isBlind = player.invisible && player.invisible > 0 && Math.hypot(player.x - tank.x, player.y - tank.y) > 80;

        tank.aiTimer -= dt;
        if (tank.aiTimer <= 0) {
          tank.aiTimer = 60 + Math.random() * 100;
          if (!isBlind) {
            const dx = player.x - tank.x;
            const dy = player.y - tank.y;
            const angleToPlayer = Math.atan2(dy, dx) * 180 / Math.PI + 90;
            tank.aiTargetAngle = angleToPlayer + (Math.random() - 0.5) * 50;
          } else {
            tank.aiTargetAngle = tank.rotation + (Math.random() - 0.5) * 120;
          }
        }
        const diff = ((tank.aiTargetAngle - tank.rotation + 540) % 360) - 180;
        const rotSpeed = isSlowed ? 1 : 2.5;
        tank.rotation += Math.sign(diff) * Math.min(Math.abs(diff), rotSpeed);

        const dist = Math.hypot(player.x - tank.x, player.y - tank.y);
        if (dist > 100 && !isBlind) {
          const rad = (tank.rotation - 90) * Math.PI / 180;
          tank.vx = Math.cos(rad) * aiSpeed;
          tank.vy = Math.sin(rad) * aiSpeed;
        } else {
          tank.vx *= 0.85; tank.vy *= 0.85;
        }

        if (tank.shootCooldown <= 0 && !isBlind) {
          const dx = player.x - tank.x;
          const dy = player.y - tank.y;
          const angleToPlayer = Math.atan2(dy, dx) * 180 / Math.PI + 90;
          const aimDiff = Math.abs(((angleToPlayer - tank.rotation + 540) % 360) - 180);
          if (aimDiff < 12 && dist < 480) shoot(tank, s);
        }
        if (tank.shootCooldown > 0) tank.shootCooldown -= dt;
      }

      const nx = tank.x + tank.vx;
      const ny = tank.y + tank.vy;
      const r = 14;
      const wallX = s.walls.some(w => rectCircle(w.x, w.y, w.w, w.h, nx, tank.y, r));
      const wallY = s.walls.some(w => rectCircle(w.x, w.y, w.w, w.h, tank.x, ny, r));
      if (!wallX) tank.x = nx; else tank.vx = 0;
      if (!wallY) tank.y = ny; else tank.vy = 0;
      tank.x = Math.max(50, Math.min(width - 50, tank.x));
      tank.y = Math.max(50, Math.min(height - 50, tank.y));
    }

    // Bullets
    s.bullets = s.bullets.filter(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.life -= dt;
      if (b.life <= 0) return false;

      // Trail bullet fire effect
      if (b.special === 'trail') {
        if (!b.trailX) b.trailX = [];
        if (!b.trailY) b.trailY = [];
        b.trailX.push(b.x); b.trailY.push(b.y);
        if (b.trailX.length > 8) { b.trailX.shift(); b.trailY.shift(); }
      }

      // Phase bullet ignores walls
      if (b.special !== 'phase') {
        const hitWall = s.walls.some(w => b.x > w.x && b.x < w.x + w.w && b.y > w.y && b.y < w.y + w.h);
        if (hitWall) {
          if (b.special === 'explode') {
            for (let i = 0; i < 6; i++) {
              spawnExplosion(b.x + (Math.random() - 0.5) * 30, b.y + (Math.random() - 0.5) * 30);
            }
          } else {
            spawnExplosion(b.x, b.y);
          }
          return false;
        }
      }

      for (const tank of s.tanks) {
        if (tank.isPlayer === b.fromPlayer) continue;
        const dist = Math.hypot(b.x - tank.x, b.y - tank.y);
        const hitRadius = b.special === 'explode' ? 30 : 18;
        if (dist < hitRadius) {
          const dmg = b.fromPlayer
            ? playerDamage * (s.shieldActive > 0 ? 0 : 1)
            : (s.shieldActive > 0 ? playerDamage * 0.2 : BULLET_DAMAGE);
          tank.hp -= dmg;
          if (b.special === 'explode') {
            for (let i = 0; i < 4; i++) spawnExplosion(b.x + (Math.random() - 0.5) * 20, b.y + (Math.random() - 0.5) * 20);
          } else {
            spawnExplosion(b.x, b.y);
          }
          if (tank.hp <= 0) {
            spawnExplosion(tank.x, tank.y, true);
            s.tanks = s.tanks.filter(t => t.id !== tank.id);
            if (!tank.isPlayer) { s.score += 100; s.killCount++; }
          }
          return false;
        }
      }
      return true;
    });

    // Pickups
    s.pickups = s.pickups.filter(p => {
      p.life -= dt;
      if (p.life <= 0) return false;
      const dist = Math.hypot(player.x - p.x, player.y - p.y);
      if (dist < 22) {
        if (p.type === 'health') player.hp = Math.min(player.maxHp, player.hp + 30);
        if (p.type === 'ammo') player.shootCooldown = 0;
        if (p.type === 'shield') s.shieldActive = 300;
        s.score += 20;
        spawnExplosion(p.x, p.y);
        return false;
      }
      return true;
    });

    s.explosions = s.explosions.filter(e => { e.frame += dt; return e.frame < e.maxFrames; });

    if (!s.tanks.find(t => t.isPlayer)) {
      s.gameOver = true;
      onGameOver(s.score, s.killCount, s.level);
    }
    if (s.tanks.every(t => t.isPlayer)) {
      s.victory = true;
      onVictory(s.score + 500, s.killCount, s.level);
    }

    setHpDisplay(player.hp);
    setScoreDisplay(s.score);
    setKillDisplay(s.killCount);
    setShieldDisplay(s.shieldActive);
  }, [onGameOver, onVictory, width, height, gameMode, char, playerSpeed, playerDamage]);

  const drawTank = (ctx: CanvasRenderingContext2D, tank: Tank, t: LevelTheme) => {
    const tankChar = tank.isPlayer ? char : (CHARACTERS.find(c => c.id === tank.charId) ?? CHARACTERS[2]);
    const c = tank.isPlayer ? char.tankColor : tankChar.tankColor;
    const cl = tank.isPlayer ? char.tankLight : tankChar.tankLight;
    const trackBase = tank.isPlayer ? char.colorDark : tankChar.colorDark;

    ctx.save();
    ctx.translate(tank.x, tank.y);

    // Invisibility effect for Rouge
    if (tank.isPlayer && tank.invisible && tank.invisible > 0) {
      ctx.globalAlpha = 0.35;
    }

    // Shield glow
    if (tank.isPlayer && stateRef.current && stateRef.current.shieldActive > 0) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#60f0ff';
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = tank.invisible && tank.invisible > 0 ? 0.35 : 1;
    }

    ctx.rotate((tank.rotation * Math.PI) / 180);

    // tracks
    ctx.fillStyle = trackBase;
    ctx.fillRect(-13, -11, 5, 22);
    ctx.fillRect(8, -11, 5, 22);
    ctx.fillStyle = '#101018';
    for (let i = -8; i <= 8; i += 4) {
      ctx.fillRect(-13, i, 5, 2);
      ctx.fillRect(8, i, 5, 2);
    }
    // hull
    ctx.fillStyle = c;
    ctx.fillRect(-8, -10, 16, 20);
    ctx.fillStyle = cl;
    ctx.fillRect(-6, -8, 12, 16);
    ctx.fillStyle = c;
    ctx.fillRect(-5, -7, 10, 10);
    // turret
    ctx.fillStyle = cl;
    ctx.fillRect(-4, -11, 8, 9);
    ctx.fillStyle = c;
    ctx.fillRect(-2, -20, 4, 14);
    // barrel tip — character accent
    ctx.fillStyle = tankChar.accentColor;
    ctx.fillRect(-2, -22, 4, 4);
    // star/emblem
    ctx.fillStyle = tankChar.accentColor;
    ctx.globalAlpha = (ctx.globalAlpha === 0.35 ? 0.2 : 0.7);
    ctx.fillRect(-2, 2, 4, 4);
    ctx.globalAlpha = 1;

    ctx.restore();

    // HP bar
    const hpPct = tank.hp / tank.maxHp;
    const barW = 28;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(tank.x - barW / 2, tank.y - 28, barW, 4);
    ctx.fillStyle = hpPct > 0.5 ? '#60d030' : hpPct > 0.25 ? '#f5c842' : '#e03030';
    ctx.fillRect(tank.x - barW / 2, tank.y - 28, barW * Math.max(0, hpPct), 4);

    // Draw head on top of tank
    const headScale = tank.isPlayer ? 1.1 : 0.85;
    drawMobianHeadCanvas(ctx, tankChar, tank.x, tank.y - 6, headScale);
  };

  const drawBullet = (ctx: CanvasRenderingContext2D, b: Bullet) => {
    // Trail effect
    if (b.special === 'trail' && b.trailX && b.trailY) {
      for (let i = 0; i < b.trailX.length; i++) {
        const alpha = (i / b.trailX.length) * 0.6;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#e07020';
        const s = 4 - (b.trailX.length - i) * 0.4;
        ctx.fillRect(b.trailX[i] - s / 2, b.trailY[i] - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    }

    if (b.special === 'phase') {
      ctx.fillStyle = '#c050ff';
      ctx.fillRect(b.x - 4, b.y - 6, 8, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(b.x - 2, b.y - 4, 4, 8);
    } else if (b.special === 'explode') {
      ctx.fillStyle = '#e83060';
      ctx.fillRect(b.x - 5, b.y - 5, 10, 10);
      ctx.fillStyle = '#ffa020';
      ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
    } else {
      ctx.fillStyle = b.fromPlayer ? char.accentColor : '#e05050';
      ctx.fillRect(b.x - 3, b.y - 5, 6, 10);
      ctx.fillStyle = 'white';
      ctx.fillRect(b.x - 1, b.y - 4, 2, 6);
    }
  };

  const drawExplosion = (ctx: CanvasRenderingContext2D, e: Explosion) => {
    const progress = e.frame / e.maxFrames;
    const r = (progress * (e.big ? 40 : 24)) | 0;
    const colors = ['#f5c842', '#e07820', '#e04040'];
    ctx.globalAlpha = 1 - progress;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = e.x + Math.cos(angle) * r;
      const py = e.y + Math.sin(angle) * r;
      const sz = Math.max(2, (1 - progress) * (e.big ? 12 : 7));
      ctx.fillStyle = colors[i % 3];
      ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
    }
    if (e.big) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(e.x - 3, e.y - 3, 6, 6);
    }
    ctx.globalAlpha = 1;
  };

  const drawPickup = (ctx: CanvasRenderingContext2D, p: Pickup, frame: number) => {
    const bob = Math.sin(frame * 0.05) * 3;
    ctx.save();
    ctx.translate(p.x, p.y + bob);

    const col = p.type === 'health' ? '#e02060' : p.type === 'ammo' ? '#f5c842' : '#60d0ff';
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(-8, -8, 16, 16);
    ctx.fillStyle = '#ffffff';
    if (p.type === 'health') {
      ctx.fillRect(-2, -6, 4, 12); ctx.fillRect(-6, -2, 12, 4);
    } else if (p.type === 'ammo') {
      ctx.fillRect(-4, -5, 8, 10);
    } else {
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillRect(-2, -5, 4, 10);
    }
    ctx.globalAlpha = 1;

    // glow
    ctx.globalAlpha = 0.3 + Math.sin(frame * 0.1) * 0.2;
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.strokeRect(-10, -10, 20, 20);
    ctx.globalAlpha = 1;
    ctx.restore();
  };

  const drawRadar = useCallback(() => {
    const canvas = radarRef.current;
    const s = stateRef.current;
    if (!canvas || !s) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rW = canvas.width; const rH = canvas.height;
    const scaleX = rW / width; const scaleY = rH / height;

    ctx.fillStyle = 'rgba(4,8,16,0.85)';
    ctx.fillRect(0, 0, rW, rH);

    // Walls
    ctx.fillStyle = '#304050';
    for (const w of s.walls) {
      ctx.fillRect(w.x * scaleX, w.y * scaleY, w.w * scaleX, w.h * scaleY);
    }

    // Enemies
    for (const tank of s.tanks) {
      if (tank.isPlayer) continue;
      const tc = CHARACTERS.find(c => c.id === tank.charId);
      ctx.fillStyle = tc ? tc.color : '#e03030';
      ctx.fillRect(tank.x * scaleX - 2, tank.y * scaleY - 2, 4, 4);
    }

    // Pickups
    for (const p of s.pickups) {
      ctx.fillStyle = p.type === 'health' ? '#e02060' : p.type === 'ammo' ? '#f5c842' : '#60d0ff';
      ctx.fillRect(p.x * scaleX - 1.5, p.y * scaleY - 1.5, 3, 3);
    }

    // Player
    const player = s.tanks.find(t => t.isPlayer);
    if (player) {
      ctx.fillStyle = char.accentColor;
      ctx.fillRect(player.x * scaleX - 3, player.y * scaleY - 3, 6, 6);
    }

    ctx.strokeStyle = `${theme.borderColor}80`;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, rW, rH);
  }, [width, height, char, theme]);

  const frameRef = useRef(0);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const s = stateRef.current;
    if (!canvas || !s) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    frameRef.current++;

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = theme.ground;
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = theme.groundGrid; ctx.lineWidth = 1;
    for (let x = 0; x < width; x += TILE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += TILE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    drawGroundDecoration(ctx, theme, width, height, s.level * 999);
    s.walls.forEach(w => drawWallThemed(ctx, w, theme));
    s.pickups.forEach(p => drawPickup(ctx, p, frameRef.current));
    s.bullets.forEach(b => drawBullet(ctx, b));
    s.tanks.forEach(t => drawTank(ctx, t, theme));
    s.explosions.forEach(e => drawExplosion(ctx, e));

    drawRadar();
  }, [width, height, theme, drawRadar]);

  const loop = useCallback((time: number) => {
    const dt = Math.min((time - lastTimeRef.current) / 16, 3);
    lastTimeRef.current = time;
    if (!pausedRef.current) {
      update(dt);
      render();
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [update, render]);

  useEffect(() => {
    initGame();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [initGame, loop]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        pausedRef.current = !pausedRef.current;
        setPaused(p => !p);
        return;
      }
      e.preventDefault();
      keysRef.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => { keysRef.current.delete(e.code); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const player = stateRef.current?.tanks.find(t => t.isPlayer);
  const hpPct = player ? (hpDisplay / player.maxHp) * 100 : 0;
  const questUrgent = gameMode === 'quest' && timeDisplay <= 20;
  const timePercent = (timeDisplay / QUEST_TIME) * 100;

  return (
    <div className="relative" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-2 pointer-events-none">
        {/* Left — HP + character */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 28, height: 28,
              border: `2px solid ${char.color}`,
              background: char.colorDark,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: char.accentColor,
            }}>
              {char.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-pixel text-[6px]" style={{ color: char.accentColor }}>{char.name}</div>
              <div className="health-bar" style={{ width: 100, borderColor: char.color }}>
                <div
                  className={`health-fill ${hpPct < 30 ? 'health-fill-red' : ''}`}
                  style={{ width: `${Math.max(0, hpPct)}%`, background: hpPct < 30 ? '#e04040' : char.tankLight }}
                />
              </div>
              <div className="font-pixel text-[6px]" style={{ color: '#c8d8e8' }}>
                {Math.max(0, Math.round(hpDisplay))} / {player?.maxHp ?? 100}
              </div>
            </div>
          </div>
          {shieldDisplay > 0 && (
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: '#60d0ff', textShadow: '0 0 8px #60d0ff' }}>
              🛡 ЩИТА {Math.ceil(shieldDisplay / 60)}с
            </div>
          )}
        </div>

        {/* Center — Level + Quest timer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div className="font-pixel text-[7px]" style={{ color: theme.hudColor, textShadow: `0 0 8px ${theme.hudColor}` }}>
            {theme.label}
          </div>
          {gameMode === 'quest' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div className="font-pixel text-[7px]" style={{
                color: questUrgent ? '#ff4040' : '#f5c842',
                textShadow: questUrgent ? '0 0 12px #ff4040' : '0 0 8px #f5c842',
                animation: questUrgent ? 'pixel-blink 0.3s steps(1) infinite' : 'none',
              }}>
                ⏱ {timeDisplay}с
              </div>
              <div style={{
                width: 80, height: 5,
                background: '#1a2030',
                border: `1px solid ${questUrgent ? '#ff4040' : '#f5c842'}`,
              }}>
                <div style={{
                  width: `${timePercent}%`, height: '100%',
                  background: questUrgent ? '#ff4040' : '#f5c842',
                  transition: 'width 1s linear',
                }} />
              </div>
            </div>
          )}
          <div className="font-pixel text-[6px]" style={{ color: '#4060a0' }}>
            {gameMode === 'quest' ? '⏱ КВЕСТ' : '🤖 БОЙ'} • LVL {level}
          </div>
        </div>

        {/* Right — Score + Kills */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <div className="font-pixel text-[7px]" style={{ color: theme.hudColor }}>SCORE: {scoreDisplay}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div className="font-pixel text-[7px]" style={{ color: '#e05050' }}>
              УНИЧТ: {killDisplay}/{totalDisplay}
            </div>
          </div>
          {/* Kill progress bar */}
          <div style={{ width: 80, height: 5, background: '#1a2030', border: '1px solid #e05050' }}>
            <div style={{
              width: `${totalDisplay > 0 ? (killDisplay / totalDisplay) * 100 : 0}%`,
              height: '100%', background: '#e05050',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      </div>

      {/* Radar / mini-map */}
      <div style={{
        position: 'absolute', bottom: 36, right: 8,
        border: `2px solid ${theme.borderColor}60`,
        boxShadow: `0 0 8px ${theme.borderColor}30`,
      }}>
        <div style={{
          fontFamily: '"Press Start 2P", monospace', fontSize: 5,
          color: theme.hudColor, textAlign: 'center', background: 'rgba(4,8,16,0.9)',
          padding: '1px 0',
        }}>
          РАДАР
        </div>
        <canvas
          ref={radarRef}
          width={120}
          height={84}
          style={{ imageRendering: 'pixelated', display: 'block' }}
        />
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
        <span className="font-vt323 text-base opacity-40" style={{ color: '#c8d8e8' }}>WASD/↑↓←→ — движение</span>
        <span className="font-vt323 text-base opacity-40" style={{ color: char.accentColor }}>SPACE — огонь</span>
        {char.id === 'rouge' && <span className="font-vt323 text-base opacity-40" style={{ color: char.color }}>Q — невидимость</span>}
        <span className="font-vt323 text-base opacity-30" style={{ color: '#606080' }}>ESC — пауза</span>
      </div>

      {/* Pause overlay */}
      {paused && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,8,0.8)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16,
          zIndex: 100,
        }}>
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 20, color: '#f5c842',
            textShadow: '0 0 20px #f5c842',
            letterSpacing: 4,
          }}>
            ПАУЗА
          </div>
          <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: '#8090a8' }}>
            ESC — продолжить
          </div>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
