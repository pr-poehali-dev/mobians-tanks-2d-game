import React, { useState } from 'react';
import { type MobianCharacter } from './CharacterSelect';

export interface TankSkin {
  id: string;
  name: string;
  description: string;
  bodyColor: string;
  lightColor: string;
  accentColor: string;
  trackColor: string;
  unlockLevel: number;
  icon: string;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  slot: 'weapon' | 'armor' | 'engine' | 'special';
  icon: string;
  bonusDamage: number;
  bonusArmor: number;
  bonusSpeed: number;
  bonusSpecial: string;
  unlockLevel: number;
  color: string;
}

export interface LoadoutConfig {
  skin: TankSkin;
  weapon: Equipment;
  armor: Equipment;
  engine: Equipment;
  special: Equipment;
}

export const SKINS: TankSkin[] = [
  { id: 'classic', name: 'Классик', description: 'Стандартный танк', bodyColor: '#3a5a8a', lightColor: '#5a8ab0', accentColor: '#f5c842', trackColor: '#1a2a3a', unlockLevel: 1, icon: '🪖' },
  { id: 'desert_camo', name: 'Пустынный', description: 'Камуфляж пустыни', bodyColor: '#8a6a20', lightColor: '#b09040', accentColor: '#e8c060', trackColor: '#4a3010', unlockLevel: 5, icon: '🏜' },
  { id: 'stealth', name: 'Стелс', description: 'Чёрный танк-невидимка', bodyColor: '#1a1a1a', lightColor: '#303030', accentColor: '#ff4040', trackColor: '#080808', unlockLevel: 10, icon: '🕶' },
  { id: 'arctic', name: 'Арктика', description: 'Снежный камуфляж', bodyColor: '#c0d0e0', lightColor: '#e0eaf8', accentColor: '#60a0ff', trackColor: '#8090a0', unlockLevel: 20, icon: '❄' },
  { id: 'lava', name: 'Лава', description: 'Огненный танк', bodyColor: '#8a2010', lightColor: '#c04020', accentColor: '#ff8020', trackColor: '#401008', unlockLevel: 30, icon: '🌋' },
  { id: 'cyber', name: 'Кибер', description: 'Неоновый киберпанк', bodyColor: '#080820', lightColor: '#1010a0', accentColor: '#00ffff', trackColor: '#040410', unlockLevel: 50, icon: '💻' },
  { id: 'gold', name: 'Золотой', description: 'Легендарный золотой', bodyColor: '#806000', lightColor: '#c09020', accentColor: '#ffe060', trackColor: '#402000', unlockLevel: 100, icon: '👑' },
  { id: 'shadow_realm', name: 'Тёмное царство', description: 'Из другого измерения', bodyColor: '#200040', lightColor: '#400060', accentColor: '#c040ff', trackColor: '#100020', unlockLevel: 200, icon: '⚡' },
  { id: 'mach', name: 'Маховик', description: 'Красный гоночный', bodyColor: '#8a0020', lightColor: '#c02040', accentColor: '#ff2060', trackColor: '#400010', unlockLevel: 300, icon: '🏎' },
  { id: 'rainbow', name: 'Радуга', description: 'Легендарная радуга', bodyColor: '#6a20c0', lightColor: '#9040e0', accentColor: '#40ffff', trackColor: '#301060', unlockLevel: 500, icon: '🌈' },
];

export const WEAPONS: Equipment[] = [
  { id: 'standard', name: 'Стандарт', description: 'Обычная пушка', slot: 'weapon', icon: '🔫', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: '', unlockLevel: 1, color: '#a0a0a0' },
  { id: 'rapid', name: 'Скорострел', description: '+30% скорострельность', slot: 'weapon', icon: '💨', bonusDamage: -10, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: 'rapid', unlockLevel: 5, color: '#60a0ff' },
  { id: 'heavy', name: 'Тяжёлый', description: '+50% урон, медленно', slot: 'weapon', icon: '💥', bonusDamage: 50, bonusArmor: 0, bonusSpeed: -10, bonusSpecial: '', unlockLevel: 10, color: '#ff6020' },
  { id: 'plasma', name: 'Плазма', description: 'Прожигает броню', slot: 'weapon', icon: '⚡', bonusDamage: 30, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: 'phase', unlockLevel: 25, color: '#c040ff' },
  { id: 'cluster', name: 'Кассетный', description: 'Взрывной урон AOE', slot: 'weapon', icon: '💣', bonusDamage: 20, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: 'explode', unlockLevel: 50, color: '#ff4040' },
  { id: 'laser', name: 'Лазер', description: 'Двойной выстрел', slot: 'weapon', icon: '🔦', bonusDamage: 10, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: 'double', unlockLevel: 100, color: '#ff2080' },
  { id: 'antimatter', name: 'Антиматерия', description: 'Сквозной урон', slot: 'weapon', icon: '☢', bonusDamage: 80, bonusArmor: 0, bonusSpeed: -20, bonusSpecial: 'trail', unlockLevel: 250, color: '#40ffff' },
];

export const ARMORS: Equipment[] = [
  { id: 'light', name: 'Лёгкая', description: 'Стандартная броня', slot: 'armor', icon: '🛡', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: '', unlockLevel: 1, color: '#a0a0a0' },
  { id: 'reactive', name: 'Реактивная', description: '+25% защита от взрывов', slot: 'armor', icon: '🔰', bonusDamage: 0, bonusArmor: 25, bonusSpeed: -5, bonusSpecial: '', unlockLevel: 5, color: '#60ff60' },
  { id: 'heavy_armor', name: 'Тяжёлая', description: '+50% HP, -20% скорость', slot: 'armor', icon: '⚙', bonusDamage: 0, bonusArmor: 50, bonusSpeed: -20, bonusSpecial: '', unlockLevel: 15, color: '#c08040' },
  { id: 'mirror', name: 'Зеркальная', description: 'Отражает часть урона', slot: 'armor', icon: '🪞', bonusDamage: 0, bonusArmor: 30, bonusSpeed: -10, bonusSpecial: 'reflect', unlockLevel: 40, color: '#c0c0ff' },
  { id: 'nano', name: 'Нано-броня', description: 'Авторегенерация HP', slot: 'armor', icon: '🔬', bonusDamage: 0, bonusArmor: 20, bonusSpeed: 0, bonusSpecial: 'regen', unlockLevel: 75, color: '#40ffff' },
  { id: 'titan', name: 'Титан', description: '+100% HP, но медленно', slot: 'armor', icon: '🗿', bonusDamage: 0, bonusArmor: 100, bonusSpeed: -30, bonusSpecial: '', unlockLevel: 200, color: '#8080a0' },
];

export const ENGINES: Equipment[] = [
  { id: 'standard_engine', name: 'Стандарт', description: 'Обычный двигатель', slot: 'engine', icon: '⚙', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: '', unlockLevel: 1, color: '#a0a0a0' },
  { id: 'turbo', name: 'Турбо', description: '+25% скорость', slot: 'engine', icon: '🚀', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 25, bonusSpecial: '', unlockLevel: 5, color: '#60a0ff' },
  { id: 'nitro', name: 'Нитро', description: '+40% скорость, -10% броня', slot: 'engine', icon: '💨', bonusDamage: 0, bonusArmor: -10, bonusSpeed: 40, bonusSpecial: '', unlockLevel: 20, color: '#40ffff' },
  { id: 'stealth_engine', name: 'Тихий', description: 'Бесшумное движение', slot: 'engine', icon: '🌙', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 10, bonusSpecial: 'silent', unlockLevel: 35, color: '#4040a0' },
  { id: 'warp', name: 'Варп', description: 'Рывок-уклонение', slot: 'engine', icon: '⚡', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 20, bonusSpecial: 'dash', unlockLevel: 60, color: '#c040ff' },
  { id: 'quantum', name: 'Квантовый', description: '+50% скорость', slot: 'engine', icon: '🔮', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 50, bonusSpecial: '', unlockLevel: 150, color: '#ff60ff' },
];

export const SPECIALS: Equipment[] = [
  { id: 'none', name: 'Нет', description: 'Без спецоснащения', slot: 'special', icon: '—', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: '', unlockLevel: 1, color: '#404040' },
  { id: 'airstrike', name: 'Авиаудар', description: 'Вызов бомбардировки', slot: 'special', icon: '✈', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: 'airstrike', unlockLevel: 10, color: '#c08020' },
  { id: 'mines', name: 'Мины', description: 'Расставляет мины', slot: 'special', icon: '💣', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: 'mines', unlockLevel: 20, color: '#a04020' },
  { id: 'emp', name: 'ЭМИ-удар', description: 'Глушит врагов вокруг', slot: 'special', icon: '🔇', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: 'emp', unlockLevel: 40, color: '#4080ff' },
  { id: 'shield_gen', name: 'Щит', description: 'Активирует щит на 5 сек', slot: 'special', icon: '🛡', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: 'shield', unlockLevel: 60, color: '#60e0ff' },
  { id: 'repair', name: 'Ремонт', description: 'Восстанавливает HP', slot: 'special', icon: '🔧', bonusDamage: 0, bonusArmor: 0, bonusSpeed: 0, bonusSpecial: 'repair', unlockLevel: 80, color: '#60d060' },
];

export const DEFAULT_LOADOUT: LoadoutConfig = {
  skin: SKINS[0],
  weapon: WEAPONS[0],
  armor: ARMORS[0],
  engine: ENGINES[0],
  special: SPECIALS[0],
};

interface EquipmentSelectProps {
  character: MobianCharacter;
  maxUnlocked: number;
  loadout: LoadoutConfig;
  onSave: (loadout: LoadoutConfig) => void;
  onBack: () => void;
}

type Tab = 'skin' | 'weapon' | 'armor' | 'engine' | 'special';

const PixelBtn: React.FC<{
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ onClick, active, disabled, children, color = '#4a7a3a', style }) => (
  <button
    onClick={disabled ? undefined : onClick}
    style={{
      fontFamily: '"Press Start 2P", monospace',
      fontSize: 7,
      padding: '6px 10px',
      background: active ? color : 'rgba(10,14,22,0.9)',
      color: active ? '#fff' : disabled ? '#404040' : '#c0c0c0',
      border: `2px solid ${active ? color : disabled ? '#303030' : '#404050'}`,
      cursor: disabled ? 'not-allowed' : 'pointer',
      imageRendering: 'pixelated',
      letterSpacing: '0.5px',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.1s',
      ...style,
    }}
  >
    {children}
  </button>
);

const StatBar: React.FC<{ label: string; value: number; max?: number; color: string }> = ({ label, value, max = 10, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
    <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: '#808080', width: 60 }}>{label}</span>
    <div style={{ flex: 1, height: 6, background: '#1a1a2a', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(value / max) * 100}%`, background: color }} />
    </div>
    <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 6, color, width: 16, textAlign: 'right' }}>{value}</span>
  </div>
);

const EquipmentSelect: React.FC<EquipmentSelectProps> = ({ character, maxUnlocked, loadout, onSave, onBack }) => {
  const [tab, setTab] = useState<Tab>('skin');
  const [current, setCurrent] = useState<LoadoutConfig>(loadout);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'skin', label: 'СКИН', icon: '🎨' },
    { id: 'weapon', label: 'ОРУЖИЕ', icon: '🔫' },
    { id: 'armor', label: 'БРОНЯ', icon: '🛡' },
    { id: 'engine', label: 'ДВИГАТЕЛЬ', icon: '⚙' },
    { id: 'special', label: 'СПЕЦ', icon: '⚡' },
  ];

  const getItems = () => {
    if (tab === 'skin') return SKINS;
    if (tab === 'weapon') return WEAPONS;
    if (tab === 'armor') return ARMORS;
    if (tab === 'engine') return ENGINES;
    return SPECIALS;
  };

  const getSelected = () => {
    if (tab === 'skin') return current.skin.id;
    if (tab === 'weapon') return current.weapon.id;
    if (tab === 'armor') return current.armor.id;
    if (tab === 'engine') return current.engine.id;
    return current.special.id;
  };

  const selectItem = (item: TankSkin | Equipment) => {
    if (tab === 'skin') setCurrent(c => ({ ...c, skin: item as TankSkin }));
    else if (tab === 'weapon') setCurrent(c => ({ ...c, weapon: item as Equipment }));
    else if (tab === 'armor') setCurrent(c => ({ ...c, armor: item as Equipment }));
    else if (tab === 'engine') setCurrent(c => ({ ...c, engine: item as Equipment }));
    else setCurrent(c => ({ ...c, special: item as Equipment }));
  };

  const getTotalStats = () => {
    const base = { speed: character.speed, power: character.power, armor: character.armor };
    const wMult = 1 + current.weapon.bonusDamage / 100;
    const aMult = 1 + current.armor.bonusArmor / 100;
    const eMult = 1 + current.engine.bonusSpeed / 100;
    const speedPenaltyW = current.weapon.bonusSpeed / 100;
    const speedPenaltyA = current.armor.bonusSpeed / 100;
    return {
      speed: Math.max(1, Math.min(10, Math.round(base.speed * eMult * (1 + speedPenaltyW + speedPenaltyA)))),
      power: Math.max(1, Math.min(10, Math.round(base.power * wMult))),
      armor: Math.max(1, Math.min(10, Math.round(base.armor * aMult))),
    };
  };

  const stats = getTotalStats();
  const items = getItems();
  const selectedId = getSelected();
  const skin = current.skin;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#04060c',
      fontFamily: '"Press Start 2P", monospace',
      display: 'flex', flexDirection: 'column',
      border: '2px solid #303048',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '2px solid #202030',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, background: character.colorDark, border: `2px solid ${character.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: character.accentColor }}>
            {character.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 10, color: character.accentColor }}>{character.name.toUpperCase()}</div>
            <div style={{ fontSize: 6, color: '#606060', marginTop: 2 }}>СНАРЯЖЕНИЕ И СКИНЫ</div>
          </div>
        </div>
        <PixelBtn onClick={onBack} color="#603020">← НАЗАД</PixelBtn>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: item list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid #202030', padding: '6px 8px', gap: 4 }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 6,
                  padding: '5px 8px',
                  background: tab === t.id ? '#1a2a1a' : 'transparent',
                  color: tab === t.id ? '#a0e050' : '#505050',
                  border: tab === t.id ? '1px solid #4a7a3a' : '1px solid #252535',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {items.map((item) => {
              const locked = item.unlockLevel > maxUnlocked;
              const active = item.id === selectedId;
              const eq = item as Equipment;
              const sk = item as TankSkin;
              const color = tab === 'skin' ? sk.accentColor : eq.color;
              return (
                <button
                  key={item.id}
                  onClick={() => !locked && selectItem(item)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px',
                    background: active ? 'rgba(74,122,58,0.2)' : locked ? 'rgba(4,6,10,0.5)' : 'rgba(8,12,20,0.9)',
                    border: `2px solid ${active ? '#4a7a3a' : locked ? '#181820' : '#252535'}`,
                    cursor: locked ? 'not-allowed' : 'pointer',
                    opacity: locked ? 0.45 : 1,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: active ? color : locked ? '#404040' : '#c0c0c0' }}>
                      {item.name}
                      {active && <span style={{ color: '#60d060', marginLeft: 6 }}>✓</span>}
                    </div>
                    <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#505060', marginTop: 2 }}>
                      {item.description}
                    </div>
                  </div>
                  {locked && (
                    <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#504030' }}>
                      🔒 ур.{item.unlockLevel}
                    </div>
                  )}
                  {!locked && tab !== 'skin' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 50 }}>
                      {eq.bonusDamage !== 0 && <span style={{ fontSize: 5, color: eq.bonusDamage > 0 ? '#60d060' : '#d06060', fontFamily: '"Press Start 2P", monospace' }}>{eq.bonusDamage > 0 ? '+' : ''}{eq.bonusDamage}% ⚔</span>}
                      {eq.bonusArmor !== 0 && <span style={{ fontSize: 5, color: eq.bonusArmor > 0 ? '#60d060' : '#d06060', fontFamily: '"Press Start 2P", monospace' }}>{eq.bonusArmor > 0 ? '+' : ''}{eq.bonusArmor}% 🛡</span>}
                      {eq.bonusSpeed !== 0 && <span style={{ fontSize: 5, color: eq.bonusSpeed > 0 ? '#60d060' : '#d06060', fontFamily: '"Press Start 2P", monospace' }}>{eq.bonusSpeed > 0 ? '+' : ''}{eq.bonusSpeed}% 🚀</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: preview */}
        <div style={{ width: 200, borderLeft: '2px solid #202030', display: 'flex', flexDirection: 'column', padding: 12, gap: 10 }}>
          <div style={{ fontSize: 7, color: '#606060', textAlign: 'center' }}>ПРЕДПРОСМОТР</div>

          {/* Tank preview */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
            <svg width="60" height="80" viewBox="-30 -40 60 80" style={{ imageRendering: 'pixelated' }}>
              {/* Tracks */}
              <rect x="-15" y="-13" width="5" height="26" fill={skin.trackColor} />
              <rect x="10" y="-13" width="5" height="26" fill={skin.trackColor} />
              {/* Hull */}
              <rect x="-10" y="-12" width="20" height="24" fill={skin.bodyColor} />
              <rect x="-8" y="-10" width="16" height="20" fill={skin.lightColor} />
              {/* Turret */}
              <rect x="-5" y="-14" width="10" height="10" fill={skin.lightColor} />
              <rect x="-3" y="-24" width="6" height="16" fill={skin.bodyColor} />
              <rect x="-3" y="-28" width="6" height="6" fill={skin.accentColor} />
              {/* Emblem */}
              <rect x="-3" y="-1" width="6" height="6" fill={skin.accentColor} opacity="0.7" />
            </svg>
          </div>

          {/* Skin color preview */}
          {tab === 'skin' && (
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              <div style={{ width: 14, height: 14, background: skin.bodyColor, border: '1px solid #404040' }} />
              <div style={{ width: 14, height: 14, background: skin.lightColor, border: '1px solid #404040' }} />
              <div style={{ width: 14, height: 14, background: skin.accentColor, border: '1px solid #404040' }} />
              <div style={{ width: 14, height: 14, background: skin.trackColor, border: '1px solid #404040' }} />
            </div>
          )}

          {/* Stats */}
          <div style={{ background: 'rgba(8,12,20,0.8)', border: '1px solid #202030', padding: '8px 10px' }}>
            <div style={{ fontSize: 6, color: '#606060', marginBottom: 6 }}>ИТОГОВЫЕ СТАТЫ</div>
            <StatBar label="СКОРОСТЬ" value={stats.speed} color="#60a0ff" />
            <StatBar label="УРОН" value={stats.power} color="#ff6020" />
            <StatBar label="БРОНЯ" value={stats.armor} color="#60d060" />
          </div>

          {/* Equipped */}
          <div style={{ background: 'rgba(8,12,20,0.8)', border: '1px solid #202030', padding: '8px 10px', fontSize: 6, color: '#505060' }}>
            <div style={{ marginBottom: 4, color: '#606070' }}>ЭКИПИРОВАНО:</div>
            <div>🎨 {current.skin.name}</div>
            <div>🔫 {current.weapon.name}</div>
            <div>🛡 {current.armor.name}</div>
            <div>⚙ {current.engine.name}</div>
            <div>⚡ {current.special.name}</div>
          </div>

          {/* Save */}
          <PixelBtn onClick={() => onSave(current)} color="#2a5a2a" style={{ width: '100%', textAlign: 'center' }}>
            ✓ СОХРАНИТЬ
          </PixelBtn>
        </div>
      </div>
    </div>
  );
};

export default EquipmentSelect;
