import { SudokuVariant } from './sudoku';
import { getLevelConfig } from './rhythmConfig';
import { createSeededRng, seededShuffle } from './seededRandom';

export type LevelEnergyId =
  | 'rune_harvest'
  | 'spark_flow'
  | 'sealed_path'
  | 'mystery_vault'
  | 'flawless_trial'
  | 'double_seal'
  | 'one_breath'
  | 'sprint_rush'
  | 'milestone_vault'
  | 'region_guardian';

export type SpecialCellKind = 'crystal' | 'key' | 'seal' | 'spark' | 'treasure';

export interface SpecialCellDef {
  r: number;
  c: number;
  kind: SpecialCellKind;
  pairId?: number;
}

export interface LevelModifierProfile {
  level: number;
  variant: SudokuVariant;
  energyId: LevelEnergyId;
  icon: string;
  crystalCount: number;
  keySealPairs: number;
  sparkCount: number;
  treasureCount: number;
  maxMistakes: number;
  hasFlawlessCrystalBonus: boolean;
  flawlessBonusCrystals: number;
  sprintTargetSec: number;
  sprintBonusCrystals: number;
  maxCollectibleCrystals: number;
}

export function getLevelModifierProfile(
  level: number,
  variant: SudokuVariant = 'classic',
  opts?: { runeMagnetLevel?: number; rhythmBenderLevel?: number }
): LevelModifierProfile {
  const clamped = Math.max(1, Math.min(1000, Math.floor(level)));
  const mod10 = clamped % 10;
  const cfg = getLevelConfig(clamped, variant);
  const diff = cfg.region.difficulty;

  let energyId: LevelEnergyId = 'rune_harvest';
  let icon = '💎';
  let crystalCount = 2;
  let keySealPairs = 0;
  let sparkCount = 0;
  let treasureCount = 0;
  let maxMistakes = 3;
  let hasFlawlessCrystalBonus = false;
  let flawlessBonusCrystals = 0;
  let sprintTargetSec = 0;
  let sprintBonusCrystals = 0;

  if (mod10 === 1 || mod10 === 2) {
    energyId = 'rune_harvest';
    icon = '💎';
    crystalCount = 2;
  } else if (mod10 === 3) {
    energyId = 'spark_flow';
    icon = '⚡';
    crystalCount = 2;
    sparkCount = 2;
  } else if (mod10 === 4) {
    energyId = 'sealed_path';
    icon = '🗝️';
    crystalCount = 2;
    keySealPairs = 1;
  } else if (mod10 === 5) {
    energyId = 'mystery_vault';
    icon = '🎁';
    crystalCount = 2;
    treasureCount = 1;
  } else if (mod10 === 6) {
    energyId = 'flawless_trial';
    icon = '🛡️';
    crystalCount = 2;
    hasFlawlessCrystalBonus = true;
    flawlessBonusCrystals = 2;
  } else if (mod10 === 7) {
    energyId = 'double_seal';
    icon = '🗝️';
    crystalCount = 2;
    keySealPairs = 2;
  } else if (mod10 === 8) {
    energyId = 'one_breath';
    icon = '🔥';
    crystalCount = 3;
    maxMistakes = 2;
  } else if (mod10 === 9) {
    energyId = 'sprint_rush';
    icon = '⏱️';
    crystalCount = 2;
    sprintTargetSec = diff === 'basit' ? 180 : diff === 'orta' ? 240 : 300;
    sprintBonusCrystals = 2;
  } else if (mod10 === 0) {
    if (clamped % 50 === 0) {
      energyId = 'region_guardian';
      icon = '👑';
      crystalCount = 4;
      keySealPairs = 1;
      sparkCount = 1;
      treasureCount = 1;
    } else {
      energyId = 'milestone_vault';
      icon = '⭐';
      crystalCount = 3;
      keySealPairs = 1;
      treasureCount = 1;
    }
  }

  // Yetenek Etkileri
  const runeMagnetLevel = Math.max(0, Math.floor(opts?.runeMagnetLevel || 0));
  if (runeMagnetLevel >= 3 && clamped % 5 === 0) {
    crystalCount += 1;
  }

  const rhythmBenderLevel = Math.max(0, Math.floor(opts?.rhythmBenderLevel || 0));
  if (rhythmBenderLevel >= 1 && sprintTargetSec > 0) {
    const bonusMap = [0, 20, 32, 45, 60, 75];
    const bonusSec = bonusMap[Math.min(5, rhythmBenderLevel)] || 0;
    sprintTargetSec += bonusSec;
  }

  const maxCollectibleCrystals =
    crystalCount +
    (hasFlawlessCrystalBonus ? flawlessBonusCrystals : 0) +
    (sprintTargetSec > 0 ? sprintBonusCrystals : 0);

  return {
    level: clamped,
    variant,
    energyId,
    icon,
    crystalCount,
    keySealPairs,
    sparkCount,
    treasureCount,
    maxMistakes,
    hasFlawlessCrystalBonus,
    flawlessBonusCrystals,
    sprintTargetSec,
    sprintBonusCrystals,
    maxCollectibleCrystals
  };
}

export function generateSpecialCellsForBoard(
  puzzle: number[][],
  level: number,
  variant: SudokuVariant = 'classic',
  profile?: LevelModifierProfile
): SpecialCellDef[] {
  const prof = profile || getLevelModifierProfile(level, variant);

  const emptyCells: { r: number; c: number }[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (puzzle[r][c] === 0) {
        emptyCells.push({ r, c });
      }
    }
  }

  if (emptyCells.length === 0) return [];

  const rng = createSeededRng(`sudokumap_mod_v1_${variant}_L${level}`);
  const available = seededShuffle(emptyCells, rng);

  const result: SpecialCellDef[] = [];
  let idx = 0;

  // 1. Kristaller
  for (let i = 0; i < prof.crystalCount && idx < available.length; i++) {
    const pos = available[idx++];
    result.push({ r: pos.r, c: pos.c, kind: 'crystal' });
  }

  // 2. Anahtar - Mühür Çiftleri
  for (let pair = 1; pair <= prof.keySealPairs; pair++) {
    if (idx < available.length) {
      const posKey = available[idx++];
      result.push({ r: posKey.r, c: posKey.c, kind: 'key', pairId: pair });
    }
    if (idx < available.length) {
      const posSeal = available[idx++];
      result.push({ r: posSeal.r, c: posSeal.c, kind: 'seal', pairId: pair });
    }
  }

  // 3. Kıvılcımlar
  for (let i = 0; i < prof.sparkCount && idx < available.length; i++) {
    const pos = available[idx++];
    result.push({ r: pos.r, c: pos.c, kind: 'spark' });
  }

  // 4. Hazineler
  for (let i = 0; i < prof.treasureCount && idx < available.length; i++) {
    const pos = available[idx++];
    result.push({ r: pos.r, c: pos.c, kind: 'treasure' });
  }

  return result;
}
