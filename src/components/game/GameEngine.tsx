import React, { useEffect, useRef, useCallback, useState } from 'react';
import { getLevelTheme, type LevelTheme } from './levelThemes';

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
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fromPlayer: boolean;
  life: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
}

export interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GameState {
  tanks: Tank[];
  bullets: Bullet[];
  explosions: Explosion[];
  walls: Wall[];
  score: number;
  level: number;
  gameOver: boolean;
  victory: boolean;
  killCount: number;
  totalEnemies: number;
}

interface GameEngineProps {
  width: number;
  height: number;
  onGameOver: (score: number, kills: number, level: number) => void;
  onVictory: (score: number, kills: number, level: number) => void;
  settings: { sfx: number; pixelSize: number };
  level: number;
}

const TILE = 32;
const SPEED = 2.5;
const BULLET_SPEED = 7;
const BULLET_DAMAGE = 25;

function generateLevel(level: number, W: number, H: number) {
  const walls: Wall[] = [];
  const borderThick = TILE;
  walls.push({ x: 0, y: 0, w: W, h: borderThick });
  walls.push({ x: 0, y: H - borderThick, w: W, h: borderThick });
  walls.push({ x: 0, y: 0, w: borderThick, h: H });
  walls.push({ x: W - borderThick, y: 0, w: borderThick, h: H });

  const count = 8 + level * 2;
  const placed: Wall[] = [];
  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const cols = Math.floor(Math.random() * 2) + 1;
      const rows = Math.floor(Math.random() * 2) + 1;
      const gx = Math.floor(Math.random() * ((W - borderThick * 2) / TILE - cols)) * TILE + borderThick;
      const gy = Math.floor(Math.random() * ((H - borderThick * 2) / TILE - rows)) * TILE + borderThick;
      if (gx > 150 && gy > 150) {
        const w: Wall = { x: gx, y: gy, w: cols * TILE, h: rows * TILE };
        const safe = !placed.some(p =>
          p.x < w.x + w.w + 20 && p.x + p.w > w.x - 20 &&
          p.y < w.y + w.h + 20 && p.y + p.h > w.y - 20
        );
        if (safe) { placed.push(w); break; }
      }
    }
  }
  walls.push(...placed);

  const enemyCount = 3 + level * 2;
  const enemies: Tank[] = [];
  for (let i = 0; i < enemyCount; i++) {
    let ex = 0, ey = 0;
    for (let a = 0; a < 50; a++) {
      ex = borderThick + TILE + Math.random() * (W - borderThick * 2 - TILE * 2);
      ey = borderThick + TILE + Math.random() * (H - borderThick * 2 - TILE * 2);
      const farFromPlayer = ex > 300 || ey > 300;
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
    });
  }

  return { walls, enemies, enemyCount };
}

function rectCircle(rx: number, ry: number, rw: number, rh: number, cx: number, cy: number, cr: number) {
  const nearX = Math.max(rx, Math.min(cx, rx + rw));
  const nearY = Math.max(ry, Math.min(cy, ry + rh));
  return Math.hypot(cx - nearX, cy - nearY) < cr;
}

// Draw themed ground tile decorations
function drawGroundDecoration(ctx: CanvasRenderingContext2D, theme: LevelTheme, W: number, H: number, seed: number) {
  const rng = (n: number) => ((Math.sin(n * 127.1 + seed * 311.7) * 43758.5453) % 1 + 1) % 1;

  if (theme.id === 'forest') {
    ctx.fillStyle = theme.groundDetail;
    for (let i = 0; i < 30; i++) {
      const x = rng(i * 3) * W;
      const y = rng(i * 3 + 1) * H;
      const s = 4 + rng(i * 3 + 2) * 6;
      ctx.fillRect(x, y, s, s);
    }
  } else if (theme.id === 'desert') {
    ctx.fillStyle = theme.groundDetail;
    for (let i = 0; i < 20; i++) {
      const x = rng(i * 5) * W;
      const y = rng(i * 5 + 1) * H;
      ctx.fillRect(x, y, 8 + rng(i * 5 + 2) * 20, 2);
    }
  } else if (theme.id === 'base') {
    ctx.fillStyle = theme.groundDetail;
    for (let gx = TILE * 2; gx < W - TILE * 2; gx += TILE * 2) {
      ctx.fillRect(gx, TILE, 2, H - TILE * 2);
      ctx.fillRect(TILE, gx, W - TILE * 2, 2);
    }
  } else if (theme.id === 'volcano') {
    ctx.fillStyle = theme.groundDetail;
    for (let i = 0; i < 15; i++) {
      const x = rng(i * 7) * W;
      const y = rng(i * 7 + 1) * H;
      const s = 6 + rng(i * 7 + 2) * 10;
      ctx.fillRect(x - s / 2, y - s / 4, s, s / 2);
    }
    ctx.fillStyle = '#e04010';
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 5; i++) {
      const x = rng(i * 11) * W;
      const y = rng(i * 11 + 1) * H;
      ctx.fillRect(x, y, 4 + rng(i * 11 + 2) * 8, 2);
    }
    ctx.globalAlpha = 1;
  } else if (theme.id === 'snow') {
    ctx.fillStyle = '#d0e8f8';
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 25; i++) {
      const x = rng(i * 9) * W;
      const y = rng(i * 9 + 1) * H;
      const s = 2 + rng(i * 9 + 2) * 4;
      ctx.fillRect(x, y, s, s);
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
    ctx.fillStyle = theme.wallAccent;
    ctx.fillRect(w.x, w.y, w.w, 3);
  } else if (theme.id === 'base') {
    ctx.fillStyle = theme.wallDark;
    ctx.fillRect(w.x + 2, w.y + 2, w.w - 4, w.h - 4);
    ctx.fillStyle = theme.wallAccent;
    ctx.fillRect(w.x, w.y, w.w, 4);
    ctx.fillRect(w.x, w.y, 4, w.h);
    for (let i = 8; i < w.w - 4; i += 16) {
      ctx.fillStyle = '#5080a0';
      ctx.fillRect(w.x + i, w.y + 2, 8, 8);
    }
  } else if (theme.id === 'volcano') {
    ctx.fillStyle = theme.wallDark;
    for (let row = 0; row * 8 < w.h; row++) {
      for (let col = 0; col * 8 < w.w; col++) {
        if (Math.sin(row * 3 + col * 7) > 0.3) ctx.fillRect(w.x + col * 8, w.y + row * 8, 8, 8);
      }
    }
    ctx.fillStyle = '#e04010';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(w.x, w.y + w.h - 4, w.w, 4);
    ctx.globalAlpha = 1;
  } else if (theme.id === 'snow') {
    ctx.fillStyle = theme.wallDark;
    for (let row = 0; row * 8 < w.h; row++) {
      const offset = row % 2 === 0 ? 0 : 8;
      for (let col = -1; col * 16 < w.w + 16; col++) {
        ctx.fillRect(w.x + col * 16 + offset, w.y + row * 8, 14, 6);
      }
    }
    ctx.fillStyle = '#d0e8f8';
    ctx.globalAlpha = 0.4;
    ctx.fillRect(w.x, w.y, w.w, 4);
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = theme.wallAccent;
  ctx.lineWidth = 1;
  ctx.strokeRect(w.x, w.y, w.w, w.h);
}

const GameEngine: React.FC<GameEngineProps> = ({ width, height, onGameOver, onVictory, settings, level }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const bulletIdRef = useRef(0);
  const explosionIdRef = useRef(0);
  const theme = getLevelTheme(level);

  const [hpDisplay, setHpDisplay] = useState(100);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [killDisplay, setKillDisplay] = useState(0);
  const [totalDisplay, setTotalDisplay] = useState(5);

  const initGame = useCallback(() => {
    const { walls, enemies, enemyCount } = generateLevel(level, width, height);
    const player: Tank = {
      id: 'player',
      x: 80, y: 80,
      rotation: 0,
      hp: 100, maxHp: 100,
      isPlayer: true,
      vx: 0, vy: 0,
      shootCooldown: 0,
      aiTimer: 0,
      aiTargetAngle: 0,
    };
    stateRef.current = {
      tanks: [player, ...enemies],
      bullets: [],
      explosions: [],
      walls,
      score: 0,
      level,
      gameOver: false,
      victory: false,
      killCount: 0,
      totalEnemies: enemyCount,
    };
    setTotalDisplay(enemyCount);
  }, [level, width, height]);

  const spawnExplosion = (x: number, y: number, big = false) => {
    const s = stateRef.current;
    if (!s) return;
    s.explosions.push({
      id: `exp-${explosionIdRef.current++}`,
      x, y,
      frame: 0,
      maxFrames: big ? 20 : 12,
    });
  };

  const shoot = (tank: Tank, s: GameState) => {
    const rad = (tank.rotation - 90) * Math.PI / 180;
    const bx = tank.x + Math.cos(rad) * 20;
    const by = tank.y + Math.sin(rad) * 20;
    s.bullets.push({
      id: `b-${bulletIdRef.current++}`,
      x: bx, y: by,
      vx: Math.cos(rad) * BULLET_SPEED,
      vy: Math.sin(rad) * BULLET_SPEED,
      fromPlayer: tank.isPlayer,
      life: 120,
    });
    tank.shootCooldown = tank.isPlayer ? 30 : 80 + Math.random() * 40;
  };

  const update = useCallback((dt: number) => {
    const s = stateRef.current;
    if (!s || s.gameOver || s.victory) return;

    const keys = keysRef.current;
    const player = s.tanks.find(t => t.isPlayer);
    if (!player) return;

    let moved = false;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) { player.rotation -= 3; }
    if (keys.has('ArrowRight') || keys.has('KeyD')) { player.rotation += 3; }
    if (keys.has('ArrowUp') || keys.has('KeyW')) {
      const rad = (player.rotation - 90) * Math.PI / 180;
      player.vx = Math.cos(rad) * SPEED;
      player.vy = Math.sin(rad) * SPEED;
      moved = true;
    } else if (keys.has('ArrowDown') || keys.has('KeyS')) {
      const rad = (player.rotation - 90) * Math.PI / 180;
      player.vx = -Math.cos(rad) * SPEED * 0.6;
      player.vy = -Math.sin(rad) * SPEED * 0.6;
      moved = true;
    } else {
      player.vx = 0;
      player.vy = 0;
    }
    if (!moved) { player.vx *= 0.7; player.vy *= 0.7; }

    if ((keys.has('Space') || keys.has('KeyZ')) && player.shootCooldown <= 0) {
      shoot(player, s);
    }
    if (player.shootCooldown > 0) player.shootCooldown--;

    for (const tank of s.tanks) {
      if (!tank.isPlayer) {
        tank.aiTimer--;
        if (tank.aiTimer <= 0) {
          tank.aiTimer = 60 + Math.random() * 120;
          const dx = player.x - tank.x;
          const dy = player.y - tank.y;
          const angleToPlayer = Math.atan2(dy, dx) * 180 / Math.PI + 90;
          tank.aiTargetAngle = angleToPlayer + (Math.random() - 0.5) * 60;
        }
        const diff = ((tank.aiTargetAngle - tank.rotation + 540) % 360) - 180;
        tank.rotation += Math.sign(diff) * Math.min(Math.abs(diff), 2.5);

        const dist = Math.hypot(player.x - tank.x, player.y - tank.y);
        if (dist > 120) {
          const rad = (tank.rotation - 90) * Math.PI / 180;
          tank.vx = Math.cos(rad) * SPEED * 0.8;
          tank.vy = Math.sin(rad) * SPEED * 0.8;
        } else {
          tank.vx *= 0.8;
          tank.vy *= 0.8;
        }

        if (tank.shootCooldown <= 0) {
          const dx = player.x - tank.x;
          const dy = player.y - tank.y;
          const angleToPlayer = Math.atan2(dy, dx) * 180 / Math.PI + 90;
          const aimDiff = Math.abs(((angleToPlayer - tank.rotation + 540) % 360) - 180);
          if (aimDiff < 15 && dist < 500) shoot(tank, s);
        }
        if (tank.shootCooldown > 0) tank.shootCooldown--;
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

    s.bullets = s.bullets.filter(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (b.life <= 0) return false;

      const hitWall = s.walls.some(w => b.x > w.x && b.x < w.x + w.w && b.y > w.y && b.y < w.y + w.h);
      if (hitWall) { spawnExplosion(b.x, b.y); return false; }

      for (const tank of s.tanks) {
        if (tank.isPlayer === b.fromPlayer) continue;
        const dist = Math.hypot(b.x - tank.x, b.y - tank.y);
        if (dist < 18) {
          tank.hp -= BULLET_DAMAGE;
          spawnExplosion(b.x, b.y);
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

    s.explosions = s.explosions.filter(e => { e.frame++; return e.frame < e.maxFrames; });

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
  }, [onGameOver, onVictory, width, height]);

  const drawTank = (ctx: CanvasRenderingContext2D, tank: Tank, t: LevelTheme) => {
    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate((tank.rotation * Math.PI) / 180);
    const c = tank.isPlayer ? t.playerColor : t.enemyColor;
    const cl = tank.isPlayer ? t.playerLight : t.enemyLight;
    const trackDark = tank.isPlayer ? (t.id === 'forest' ? '#2a4a0a' : '#2a4060') : '#4a0a0a';
    const trackBase = tank.isPlayer ? (t.id === 'forest' ? '#3a5a1a' : '#3a5060') : '#5a1a1a';

    ctx.fillStyle = trackBase;
    ctx.fillRect(-13, -11, 5, 22);
    ctx.fillRect(8, -11, 5, 22);
    ctx.fillStyle = trackDark;
    for (let i = -8; i <= 8; i += 4) {
      ctx.fillRect(-13, i, 5, 2);
      ctx.fillRect(8, i, 5, 2);
    }
    ctx.fillStyle = c;
    ctx.fillRect(-8, -10, 16, 20);
    ctx.fillStyle = cl;
    ctx.fillRect(-6, -8, 12, 16);
    ctx.fillStyle = c;
    ctx.fillRect(-5, -7, 10, 10);
    ctx.fillStyle = cl;
    ctx.fillRect(-3, -9, 6, 8);
    ctx.fillStyle = c;
    ctx.fillRect(-2, -18, 4, 14);
    ctx.fillStyle = tank.isPlayer ? '#a0e050' : '#e05050';
    ctx.fillRect(-2, -5, 4, 3);
    if (tank.isPlayer) {
      ctx.fillStyle = '#f5c842';
      ctx.fillRect(-2, 3, 4, 4);
    }
    ctx.restore();
  };

  const drawBullet = (ctx: CanvasRenderingContext2D, b: Bullet, t: LevelTheme) => {
    ctx.fillStyle = b.fromPlayer ? '#f5c842' : '#e05050';
    ctx.fillRect(b.x - 3, b.y - 5, 6, 10);
    ctx.fillStyle = 'white';
    ctx.fillRect(b.x - 1, b.y - 4, 2, 6);
  };

  const drawExplosion = (ctx: CanvasRenderingContext2D, e: Explosion, t: LevelTheme) => {
    const progress = e.frame / e.maxFrames;
    const r = (progress * 30) | 0;
    const colors = [t.hudColor, '#e07820', '#e04040'];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = r * (0.5 + 0.5);
      const px = e.x + Math.cos(angle) * dist;
      const py = e.y + Math.sin(angle) * dist;
      const size = Math.max(2, (1 - progress) * 8);
      ctx.fillStyle = colors[i % 3];
      ctx.globalAlpha = 1 - progress;
      ctx.fillRect(px - size / 2, py - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const s = stateRef.current;
    if (!canvas || !s) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    // Ground
    ctx.fillStyle = theme.ground;
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = theme.groundGrid;
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += TILE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += TILE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Ground decorations
    drawGroundDecoration(ctx, theme, width, height, s.level * 999);

    // Walls
    s.walls.forEach(w => drawWallThemed(ctx, w, theme));

    // Bullets
    s.bullets.forEach(b => drawBullet(ctx, b, theme));

    // Tanks
    s.tanks.forEach(t2 => drawTank(ctx, t2, theme));

    // Explosions
    s.explosions.forEach(e => drawExplosion(ctx, e, theme));
  }, [width, height, theme]);

  const loop = useCallback((time: number) => {
    const dt = Math.min((time - lastTimeRef.current) / 16, 3);
    lastTimeRef.current = time;
    update(dt);
    render();
    rafRef.current = requestAnimationFrame(loop);
  }, [update, render]);

  useEffect(() => {
    initGame();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [initGame, loop]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { e.preventDefault(); keysRef.current.add(e.code); };
    const up = (e: KeyboardEvent) => { keysRef.current.delete(e.code); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const player = stateRef.current?.tanks.find(t => t.isPlayer);
  const hpPct = player ? (hpDisplay / player.maxHp) * 100 : 0;

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
      <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-3 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="font-pixel text-[8px]" style={{ color: theme.hudColor }}>HP</div>
          <div className="health-bar" style={{ width: 120, borderColor: theme.hudColor }}>
            <div
              className={`health-fill ${hpPct < 30 ? 'health-fill-red' : ''}`}
              style={{ width: `${Math.max(0, hpPct)}%`, background: hpPct < 30 ? '#e04040' : theme.playerLight }}
            />
          </div>
          <div className="font-pixel text-[8px]" style={{ color: '#c8d8e8' }}>{Math.max(0, hpDisplay)} / 100</div>
        </div>

        {/* Level badge */}
        <div className="flex flex-col items-center gap-1">
          <div className="font-pixel text-[8px]" style={{ color: theme.hudColor, textShadow: `0 0 8px ${theme.hudColor}` }}>
            {theme.label}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="font-pixel text-[8px]" style={{ color: theme.hudColor }}>SCORE: {scoreDisplay}</div>
          <div className="font-pixel text-[8px]" style={{ color: '#e05050' }}>KILLS: {killDisplay}/{totalDisplay}</div>
          <div className="font-pixel text-[8px]" style={{ color: '#c8d8e8' }}>LVL {level}</div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
        <span className="font-vt323 text-lg opacity-50" style={{ color: '#c8d8e8' }}>WASD/↑↓←→ — движение</span>
        <span className="font-vt323 text-lg opacity-50" style={{ color: theme.hudColor }}>SPACE — огонь</span>
      </div>
    </div>
  );
};

export default GameEngine;
