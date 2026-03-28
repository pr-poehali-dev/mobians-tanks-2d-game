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
    id: 'forest', name: 'Лес', label: 'ЛЕСНАЯ ЗОНА',
    bg: '#0a1a0a', ground: '#1a2e1a', groundGrid: '#1e341e', groundDetail: '#243824',
    wall: '#3a5a2a', wallDark: '#2a4a1a', wallAccent: '#4a7a3a', borderColor: '#4a7a3a',
    playerColor: '#4a8a2a', playerLight: '#6ab040', enemyColor: '#8a2a2a', enemyLight: '#b04040',
    hudColor: '#a0e050', mapIcon: '🌲', mapBg: '#1a2e1a', description: 'Густой лес. Деревья скрывают врагов.',
  },
  desert: {
    id: 'desert', name: 'Пустыня', label: 'ПУСТЫНЯ',
    bg: '#1a1206', ground: '#2e2210', groundGrid: '#342818', groundDetail: '#3e3020',
    wall: '#6a5020', wallDark: '#4a3810', wallAccent: '#8a6830', borderColor: '#c8901a',
    playerColor: '#c8901a', playerLight: '#e8b040', enemyColor: '#8a3a1a', enemyLight: '#b05030',
    hudColor: '#f5c842', mapIcon: '🏜', mapBg: '#2e2210', description: 'Жаркая пустыня. Нет укрытий.',
  },
  base: {
    id: 'base', name: 'База', label: 'ВОЕННАЯ БАЗА',
    bg: '#080c12', ground: '#101820', groundGrid: '#141e28', groundDetail: '#182030',
    wall: '#2a3a4a', wallDark: '#1a2a3a', wallAccent: '#3a5060', borderColor: '#4090c0',
    playerColor: '#2060a0', playerLight: '#4090d0', enemyColor: '#802020', enemyLight: '#a04040',
    hudColor: '#4090e0', mapIcon: '🏭', mapBg: '#101820', description: 'Укреплённая база. Прочные стены.',
  },
  volcano: {
    id: 'volcano', name: 'Вулкан', label: 'ВУЛКАНИЧЕСКАЯ ЗОНА',
    bg: '#120604', ground: '#200c08', groundGrid: '#2a1008', groundDetail: '#341408',
    wall: '#5a2010', wallDark: '#3a1008', wallAccent: '#8a3018', borderColor: '#e04010',
    playerColor: '#c03010', playerLight: '#e06030', enemyColor: '#601808', enemyLight: '#8a2010',
    hudColor: '#e07820', mapIcon: '🌋', mapBg: '#200c08', description: 'Опасная зона. Вулканические скалы.',
  },
  snow: {
    id: 'snow', name: 'Снег', label: 'АРКТИКА',
    bg: '#0c0e14', ground: '#1a1e2a', groundGrid: '#1e2430', groundDetail: '#242a38',
    wall: '#3a4060', wallDark: '#2a3050', wallAccent: '#5a6080', borderColor: '#a0b8d8',
    playerColor: '#5a7090', playerLight: '#8090b0', enemyColor: '#6a3030', enemyLight: '#8a5050',
    hudColor: '#c8d8e8', mapIcon: '❄', mapBg: '#1a1e2a', description: 'Арктика. Скользкий лёд замедляет.',
  },
  city: {
    id: 'city', name: 'Город', label: 'ГОРОДСКИЕ РУИНЫ',
    bg: '#0a0c10', ground: '#151820', groundGrid: '#1a1e28', groundDetail: '#202430',
    wall: '#303848', wallDark: '#202830', wallAccent: '#505870', borderColor: '#7090c0',
    playerColor: '#4060a0', playerLight: '#6080c0', enemyColor: '#703030', enemyLight: '#904050',
    hudColor: '#80a8e0', mapIcon: '🏙', mapBg: '#151820', description: 'Разрушенный город. Укрытий много.',
  },
  space: {
    id: 'space', name: 'Космос', label: 'КОСМИЧЕСКАЯ СТАНЦИЯ',
    bg: '#04040c', ground: '#0a0a18', groundGrid: '#0e0e20', groundDetail: '#121228',
    wall: '#1a1a40', wallDark: '#101030', wallAccent: '#2a2a60', borderColor: '#6060e0',
    playerColor: '#4040c0', playerLight: '#8080f0', enemyColor: '#802040', enemyLight: '#a04060',
    hudColor: '#a0a0ff', mapIcon: '🚀', mapBg: '#0a0a18', description: 'Невесомость изменяет движение.',
  },
  jungle: {
    id: 'jungle', name: 'Джунгли', label: 'ДЖУНГЛИ',
    bg: '#061008', ground: '#0e1e10', groundGrid: '#122214', groundDetail: '#162818',
    wall: '#2a4a18', wallDark: '#1e3810', wallAccent: '#3a6020',borderColor: '#508a20',
    playerColor: '#3a7020', playerLight: '#60a040', enemyColor: '#7a2030', enemyLight: '#a04050',
    hudColor: '#80c040', mapIcon: '🌴', mapBg: '#0e1e10', description: 'Густые джунгли. Видимость ограничена.',
  },
  underwater: {
    id: 'underwater', name: 'Глубины', label: 'ПОДВОДНАЯ БАЗА',
    bg: '#020c14', ground: '#04121e', groundGrid: '#061628', groundDetail: '#081a30',
    wall: '#0a2a40', wallDark: '#061c2c', wallAccent: '#103860', borderColor: '#1070a0',
    playerColor: '#0860a0', playerLight: '#20a0d0', enemyColor: '#402030', enemyLight: '#603050',
    hudColor: '#40c0e0', mapIcon: '🌊', mapBg: '#04121e', description: 'Под водой. Замедленное движение.',
  },
  castle: {
    id: 'castle', name: 'Замок', label: 'СРЕДНЕВЕКОВЫЙ ЗАМОК',
    bg: '#0c0a08', ground: '#181410', groundGrid: '#1e1a14', groundDetail: '#241e18',
    wall: '#4a3a28', wallDark: '#342a1c', wallAccent: '#604a30', borderColor: '#907050',
    playerColor: '#806040', playerLight: '#a08060', enemyColor: '#602020', enemyLight: '#803030',
    hudColor: '#c0a060', mapIcon: '🏰', mapBg: '#181410', description: 'Средневековый замок. Тёмные коридоры.',
  },
};

export interface LevelConfig {
  level: number;
  themeId: string;
  name: string;
  stars: number;
  unlocked: boolean;
  completed: boolean;
  isBoss: boolean;
}

// Выбор темы для уровня (10 тем, каждые 5 уровней одна тема)
export function getLevelTheme(level: number): LevelTheme {
  const themeKeys = Object.keys(THEMES);
  const idx = Math.floor((level - 1) / 5) % themeKeys.length;
  return THEMES[themeKeys[idx]];
}

// Является ли уровень боссовым
export function isBossLevel(level: number): boolean {
  return level % 10 === 0;
}

// Сколько врагов на уровне (рандом 1-10, боссы = 1 + бонусные)
export function getEnemyCount(level: number): number {
  if (isBossLevel(level)) return 1; // только один БОСС
  // Псевдорандом но детерминированный по номеру уровня
  const seed = (level * 1103515245 + 12345) & 0x7fffffff;
  return 1 + (seed % 10); // 1..10
}

export function buildLevelConfigs(maxUnlocked: number): LevelConfig[] {
  const configs: LevelConfig[] = [];
  const themeKeys = Object.keys(THEMES);
  const total = 1000;
  for (let i = 1; i <= total; i++) {
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
