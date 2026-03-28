export interface LevelTheme {
  id: string;
  name: string;
  label: string;
  bg: string;
  ground: string;
  groundGrid: string;
  groundDetail: string;
  wall: string;
  wallDark: string;
  wallAccent: string;
  borderColor: string;
  playerColor: string;
  playerLight: string;
  enemyColor: string;
  enemyLight: string;
  hudColor: string;
  mapIcon: string;
  mapBg: string;
  description: string;
}

export const THEMES: Record<string, LevelTheme> = {
  forest: {
    id: 'forest',
    name: 'Лес',
    label: 'ЛЕСНАЯ ЗОНА',
    bg: '#0a1a0a',
    ground: '#1a2e1a',
    groundGrid: '#1e341e',
    groundDetail: '#243824',
    wall: '#3a5a2a',
    wallDark: '#2a4a1a',
    wallAccent: '#4a7a3a',
    borderColor: '#4a7a3a',
    playerColor: '#4a8a2a',
    playerLight: '#6ab040',
    enemyColor: '#8a2a2a',
    enemyLight: '#b04040',
    hudColor: '#a0e050',
    mapIcon: '🌲',
    mapBg: '#1a2e1a',
    description: 'Густой лес. Деревья скрывают врагов.',
  },
  desert: {
    id: 'desert',
    name: 'Пустыня',
    label: 'ПУСТЫНЯ',
    bg: '#1a1206',
    ground: '#2e2210',
    groundGrid: '#342818',
    groundDetail: '#3e3020',
    wall: '#6a5020',
    wallDark: '#4a3810',
    wallAccent: '#8a6830',
    borderColor: '#c8901a',
    playerColor: '#c8901a',
    playerLight: '#e8b040',
    enemyColor: '#8a3a1a',
    enemyLight: '#b05030',
    hudColor: '#f5c842',
    mapIcon: '🏜',
    mapBg: '#2e2210',
    description: 'Жаркая пустыня. Нет укрытий.',
  },
  base: {
    id: 'base',
    name: 'База',
    label: 'ВОЕННАЯ БАЗА',
    bg: '#080c12',
    ground: '#101820',
    groundGrid: '#141e28',
    groundDetail: '#182030',
    wall: '#2a3a4a',
    wallDark: '#1a2a3a',
    wallAccent: '#3a5060',
    borderColor: '#4090c0',
    playerColor: '#2060a0',
    playerLight: '#4090d0',
    enemyColor: '#802020',
    enemyLight: '#a04040',
    hudColor: '#4090e0',
    mapIcon: '🏭',
    mapBg: '#101820',
    description: 'Укреплённая база. Прочные стены.',
  },
  volcano: {
    id: 'volcano',
    name: 'Вулкан',
    label: 'ВУЛКАНИЧЕСКАЯ ЗОНА',
    bg: '#120604',
    ground: '#200c08',
    groundGrid: '#2a1008',
    groundDetail: '#341408',
    wall: '#5a2010',
    wallDark: '#3a1008',
    wallAccent: '#8a3018',
    borderColor: '#e04010',
    playerColor: '#c03010',
    playerLight: '#e06030',
    enemyColor: '#601808',
    enemyLight: '#8a2010',
    hudColor: '#e07820',
    mapIcon: '🌋',
    mapBg: '#200c08',
    description: 'Опасная зона. Вулканические скалы.',
  },
  snow: {
    id: 'snow',
    name: 'Снег',
    label: 'АРКТИКА',
    bg: '#0c0e14',
    ground: '#1a1e2a',
    groundGrid: '#1e2430',
    groundDetail: '#242a38',
    wall: '#3a4060',
    wallDark: '#2a3050',
    wallAccent: '#5a6080',
    borderColor: '#a0b8d8',
    playerColor: '#5a7090',
    playerLight: '#8090b0',
    enemyColor: '#6a3030',
    enemyLight: '#8a5050',
    hudColor: '#c8d8e8',
    mapIcon: '❄',
    mapBg: '#1a1e2a',
    description: 'Арктика. Скользкий лёд замедляет.',
  },
};

export interface LevelConfig {
  level: number;
  themeId: string;
  name: string;
  stars: number;
  unlocked: boolean;
  completed: boolean;
}

export function getLevelTheme(level: number): LevelTheme {
  const themeKeys = Object.keys(THEMES);
  const idx = Math.floor((level - 1) / 2) % themeKeys.length;
  return THEMES[themeKeys[idx]];
}

export function buildLevelConfigs(maxUnlocked: number): LevelConfig[] {
  const configs: LevelConfig[] = [];
  const themeKeys = Object.keys(THEMES);
  for (let i = 1; i <= 10; i++) {
    const themeIdx = Math.floor((i - 1) / 2) % themeKeys.length;
    const theme = THEMES[themeKeys[themeIdx]];
    configs.push({
      level: i,
      themeId: theme.id,
      name: `${theme.label} — ${i}`,
      stars: 0,
      unlocked: i <= maxUnlocked,
      completed: i < maxUnlocked,
    });
  }
  return configs;
}
