import { SudokuVariant } from './sudoku';

export type AbilityId =
  | 'oracle_eye'
  | 'crystal_shield'
  | 'rhythm_bender'
  | 'seal_breaker'
  | 'rune_magnet';

export type AbilityTriggerType = 'active' | 'reactive_passive' | 'level_passive';

export interface AbilityDef {
  id: AbilityId;
  icon: string;
  triggerType: AbilityTriggerType;
  defaultLevel: number;
  maxLevel: number;
  baseCooldownMs: number;
  minCooldownMs: number;
}

export interface AbilityProgress {
  level: number;
  cooldownEndsAtMs: number;
}

export interface UpgradeCost {
  crystals: number;
  gold: number;
}

export const ECONOMY_CONFIG = {
  mapBaseReward: { basit: 5, orta: 10, zor: 15 },
  abilityRechargeGoldCost: 15,
  crackedCrystalRepairGoldCost: 15,
  maxLoadoutSlots: 2
} as const;

export const ABILITY_UPGRADE_COSTS: Record<number, UpgradeCost> = {
  0: { crystals: 5, gold: 20 },
  1: { crystals: 12, gold: 45 },
  2: { crystals: 25, gold: 90 },
  3: { crystals: 45, gold: 160 },
  4: { crystals: 75, gold: 280 }
};

export interface AbilityTierDef {
  level: number;
  titleKey: string;
  descKey: string;
}

export const ABILITY_TIER_DEFS: Record<AbilityId, AbilityTierDef[]> = {
  oracle_eye: [
    { level: 1, titleKey: 'ability_tier_oracle_eye_1', descKey: 'ability_tier_desc_oracle_eye_1' },
    { level: 2, titleKey: 'ability_tier_oracle_eye_2', descKey: 'ability_tier_desc_oracle_eye_2' },
    { level: 3, titleKey: 'ability_tier_oracle_eye_3', descKey: 'ability_tier_desc_oracle_eye_3' },
    { level: 4, titleKey: 'ability_tier_oracle_eye_4', descKey: 'ability_tier_desc_oracle_eye_4' },
    { level: 5, titleKey: 'ability_tier_oracle_eye_5', descKey: 'ability_tier_desc_oracle_eye_5' }
  ],
  crystal_shield: [
    { level: 1, titleKey: 'ability_tier_crystal_shield_1', descKey: 'ability_tier_desc_crystal_shield_1' },
    { level: 2, titleKey: 'ability_tier_crystal_shield_2', descKey: 'ability_tier_desc_crystal_shield_2' },
    { level: 3, titleKey: 'ability_tier_crystal_shield_3', descKey: 'ability_tier_desc_crystal_shield_3' },
    { level: 4, titleKey: 'ability_tier_crystal_shield_4', descKey: 'ability_tier_desc_crystal_shield_4' },
    { level: 5, titleKey: 'ability_tier_crystal_shield_5', descKey: 'ability_tier_desc_crystal_shield_5' }
  ],
  rhythm_bender: [
    { level: 1, titleKey: 'ability_tier_rhythm_bender_1', descKey: 'ability_tier_desc_rhythm_bender_1' },
    { level: 2, titleKey: 'ability_tier_rhythm_bender_2', descKey: 'ability_tier_desc_rhythm_bender_2' },
    { level: 3, titleKey: 'ability_tier_rhythm_bender_3', descKey: 'ability_tier_desc_rhythm_bender_3' },
    { level: 4, titleKey: 'ability_tier_rhythm_bender_4', descKey: 'ability_tier_desc_rhythm_bender_4' },
    { level: 5, titleKey: 'ability_tier_rhythm_bender_5', descKey: 'ability_tier_desc_rhythm_bender_5' }
  ],
  seal_breaker: [
    { level: 1, titleKey: 'ability_tier_seal_breaker_1', descKey: 'ability_tier_desc_seal_breaker_1' },
    { level: 2, titleKey: 'ability_tier_seal_breaker_2', descKey: 'ability_tier_desc_seal_breaker_2' },
    { level: 3, titleKey: 'ability_tier_seal_breaker_3', descKey: 'ability_tier_desc_seal_breaker_3' },
    { level: 4, titleKey: 'ability_tier_seal_breaker_4', descKey: 'ability_tier_desc_seal_breaker_4' },
    { level: 5, titleKey: 'ability_tier_seal_breaker_5', descKey: 'ability_tier_desc_seal_breaker_5' }
  ],
  rune_magnet: [
    { level: 1, titleKey: 'ability_tier_rune_magnet_1', descKey: 'ability_tier_desc_rune_magnet_1' },
    { level: 2, titleKey: 'ability_tier_rune_magnet_2', descKey: 'ability_tier_desc_rune_magnet_2' },
    { level: 3, titleKey: 'ability_tier_rune_magnet_3', descKey: 'ability_tier_desc_rune_magnet_3' },
    { level: 4, titleKey: 'ability_tier_rune_magnet_4', descKey: 'ability_tier_desc_rune_magnet_4' },
    { level: 5, titleKey: 'ability_tier_rune_magnet_5', descKey: 'ability_tier_desc_rune_magnet_5' }
  ]
};

export function getAbilityTierDefs(id: AbilityId): AbilityTierDef[] {
  return ABILITY_TIER_DEFS[id] || ABILITY_TIER_DEFS.oracle_eye;
}

export const ABILITIES: AbilityDef[] = [
  {
    id: 'oracle_eye',
    icon: '👁️',
    triggerType: 'active',
    defaultLevel: 1,
    maxLevel: 5,
    baseCooldownMs: 2 * 3600_000,
    minCooldownMs: 1 * 3600_000
  },
  {
    id: 'crystal_shield',
    icon: '🛡️',
    triggerType: 'reactive_passive',
    defaultLevel: 0,
    maxLevel: 5,
    baseCooldownMs: 3 * 3600_000,
    minCooldownMs: 1.5 * 3600_000
  },
  {
    id: 'rhythm_bender',
    icon: '⏳',
    triggerType: 'level_passive',
    defaultLevel: 0,
    maxLevel: 5,
    baseCooldownMs: 3 * 3600_000,
    minCooldownMs: 1.5 * 3600_000
  },
  {
    id: 'seal_breaker',
    icon: '🗝️',
    triggerType: 'active',
    defaultLevel: 0,
    maxLevel: 5,
    baseCooldownMs: 2.5 * 3600_000,
    minCooldownMs: 1.25 * 3600_000
  },
  {
    id: 'rune_magnet',
    icon: '🧲',
    triggerType: 'level_passive',
    defaultLevel: 0,
    maxLevel: 5,
    baseCooldownMs: 4 * 3600_000,
    minCooldownMs: 2 * 3600_000
  }
];

export function createDefaultAbilitiesState(): Record<AbilityId, AbilityProgress> {
  const state: Partial<Record<AbilityId, AbilityProgress>> = {};
  ABILITIES.forEach(def => {
    state[def.id] = {
      level: def.defaultLevel,
      cooldownEndsAtMs: 0
    };
  });
  return state as Record<AbilityId, AbilityProgress>;
}

export function getAbilityDef(id: AbilityId): AbilityDef {
  const def = ABILITIES.find(a => a.id === id);
  return def || ABILITIES[0];
}

export function getAbilityCooldownMs(id: AbilityId, level: number): number {
  const def = getAbilityDef(id);
  if (level <= 1) return def.baseCooldownMs;
  if (level >= def.maxLevel) return def.minCooldownMs;

  const ratio = (level - 1) / (def.maxLevel - 1);
  return Math.round(def.baseCooldownMs - ratio * (def.baseCooldownMs - def.minCooldownMs));
}

export function getRemainingCooldownMs(
  progress: AbilityProgress,
  id: AbilityId,
  nowMs: number = Date.now()
): number {
  if (!progress || progress.cooldownEndsAtMs <= nowMs) return 0;

  const diff = progress.cooldownEndsAtMs - nowMs;
  const maxAllowed = getAbilityCooldownMs(id, Math.max(1, progress.level));

  return Math.min(diff, maxAllowed);
}

export function getCooldownProgressRatio(
  progress: AbilityProgress,
  id: AbilityId,
  nowMs: number = Date.now()
): number {
  const rem = getRemainingCooldownMs(progress, id, nowMs);
  const tot = getAbilityCooldownMs(id, Math.max(1, progress.level));

  if (tot <= 0 || rem <= 0) return 0;
  return Math.min(1, Math.max(0, rem / tot));
}

export function getCooldownSweepDegrees(
  progress: AbilityProgress,
  id: AbilityId,
  nowMs: number = Date.now()
): number {
  return Math.round(getCooldownProgressRatio(progress, id, nowMs) * 360);
}

export function isAbilityReady(
  progress: AbilityProgress,
  id: AbilityId,
  nowMs: number = Date.now()
): boolean {
  return progress && progress.level >= 1 && getRemainingCooldownMs(progress, id, nowMs) === 0;
}

export function formatCooldownShort(ms: number, lang: 'tr' | 'en'): string {
  if (ms <= 0) return '';

  if (ms >= 3600_000) {
    const h = Math.floor(ms / 3600_000);
    const m = Math.floor((ms % 3600_000) / 60_000);
    return lang === 'tr' ? `${h} sa ${m} dk` : `${h}h ${m}m`;
  }

  if (ms >= 60_000) {
    const m = Math.ceil(ms / 60_000);
    return lang === 'tr' ? `${m} dk` : `${m}m`;
  }

  const s = Math.ceil(ms / 1000);
  return lang === 'tr' ? `${s} sn` : `${s}s`;
}

export function getUpgradeCost(currentLevel: number): UpgradeCost | null {
  if (currentLevel >= 5) return null;
  return ABILITY_UPGRADE_COSTS[currentLevel] || null;
}

export function computeLevelCrystalDelta(
  variant: SudokuVariant,
  level: number,
  earnedInRun: number,
  maxLevelCrystals: number,
  collectedMap: Record<string, number>
): { key: string; delta: number; bestCollected: number } {
  const safeMax = Math.max(0, Math.floor(maxLevelCrystals));
  const safeEarned = Math.max(0, Math.min(safeMax, Math.floor(earnedInRun)));
  const key = `${variant}_${level}`;

  const already = Math.max(0, Math.min(safeMax, Math.floor(collectedMap[key] || 0)));
  const bestCollected = Math.max(already, safeEarned);
  const delta = Math.max(0, bestCollected - already);

  return { key, delta, bestCollected };
}
