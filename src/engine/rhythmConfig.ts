import { SudokuVariant } from './sudoku';

export type BiomeId = 'emerald' | 'hextech' | 'crimson';

export type RhythmPhase = 'warmup' | 'balance' | 'tension' | 'sprint' | 'milestone' | 'guardian';

export interface RegionDef {
  id: number;
  key: string;
  biome: BiomeId;
  difficulty: 'basit' | 'orta' | 'zor';
  startLevel: number;
  endLevel: number;
  baseClues: number;
  techniqueId: string;
}

export interface LevelRhythmConfig {
  level: number;
  variant: SudokuVariant;
  seedKey: string;
  region: RegionDef;
  levelInRegion: number;
  rhythmPhase: RhythmPhase;
  isMilestone: boolean;
  isRegionGuardian: boolean;
  targetClues: number;
  rewardMultiplier: number;
}

export const REGIONS: RegionDef[] = [
  { id: 1, key: 'region_1', biome: 'emerald', difficulty: 'basit', startLevel: 1, endLevel: 50, baseClues: 42, techniqueId: 'row_col_scan' },
  { id: 2, key: 'region_2', biome: 'emerald', difficulty: 'basit', startLevel: 51, endLevel: 100, baseClues: 41, techniqueId: 'box_elimination' },
  { id: 3, key: 'region_3', biome: 'emerald', difficulty: 'basit', startLevel: 101, endLevel: 150, baseClues: 40, techniqueId: 'naked_single' },
  { id: 4, key: 'region_4', biome: 'emerald', difficulty: 'basit', startLevel: 151, endLevel: 200, baseClues: 39, techniqueId: 'hidden_single' },
  { id: 5, key: 'region_5', biome: 'emerald', difficulty: 'basit', startLevel: 201, endLevel: 250, baseClues: 38, techniqueId: 'pencil_marks' },
  { id: 6, key: 'region_6', biome: 'emerald', difficulty: 'basit', startLevel: 251, endLevel: 300, baseClues: 37, techniqueId: 'crosshatching' },

  { id: 7, key: 'region_7', biome: 'hextech', difficulty: 'orta', startLevel: 301, endLevel: 350, baseClues: 35, techniqueId: 'pointing_pairs' },
  { id: 8, key: 'region_8', biome: 'hextech', difficulty: 'orta', startLevel: 351, endLevel: 400, baseClues: 34, techniqueId: 'box_line_reduction' },
  { id: 9, key: 'region_9', biome: 'hextech', difficulty: 'orta', startLevel: 401, endLevel: 450, baseClues: 33, techniqueId: 'naked_pairs' },
  { id: 10, key: 'region_10', biome: 'hextech', difficulty: 'orta', startLevel: 451, endLevel: 500, baseClues: 32, techniqueId: 'hidden_pairs' },
  { id: 11, key: 'region_11', biome: 'hextech', difficulty: 'orta', startLevel: 501, endLevel: 550, baseClues: 31, techniqueId: 'naked_triples' },
  { id: 12, key: 'region_12', biome: 'hextech', difficulty: 'orta', startLevel: 551, endLevel: 600, baseClues: 30, techniqueId: 'hidden_triples' },
  { id: 13, key: 'region_13', biome: 'hextech', difficulty: 'orta', startLevel: 601, endLevel: 650, baseClues: 29, techniqueId: 'locked_candidates' },
  { id: 14, key: 'region_14', biome: 'hextech', difficulty: 'orta', startLevel: 651, endLevel: 700, baseClues: 29, techniqueId: 'skyscraper' },

  { id: 15, key: 'region_15', biome: 'crimson', difficulty: 'zor', startLevel: 701, endLevel: 750, baseClues: 28, techniqueId: 'x_wing' },
  { id: 16, key: 'region_16', biome: 'crimson', difficulty: 'zor', startLevel: 751, endLevel: 800, baseClues: 27, techniqueId: 'y_wing' },
  { id: 17, key: 'region_17', biome: 'crimson', difficulty: 'zor', startLevel: 801, endLevel: 850, baseClues: 26, techniqueId: 'swordfish' },
  { id: 18, key: 'region_18', biome: 'crimson', difficulty: 'zor', startLevel: 851, endLevel: 900, baseClues: 25, techniqueId: 'xy_chain' },
  { id: 19, key: 'region_19', biome: 'crimson', difficulty: 'zor', startLevel: 901, endLevel: 950, baseClues: 24, techniqueId: 'unique_rectangle' },
  { id: 20, key: 'region_20', biome: 'crimson', difficulty: 'zor', startLevel: 951, endLevel: 1000, baseClues: 23, techniqueId: 'grandmaster_synthesis' }
];

export function getRegionForLevel(level: number): RegionDef {
  const clamped = Math.max(1, Math.min(1000, level));
  const found = REGIONS.find(r => clamped >= r.startLevel && clamped <= r.endLevel);
  return found || REGIONS[0];
}

export function getLevelConfig(level: number, variant: SudokuVariant = 'classic'): LevelRhythmConfig {
  const clampedLevel = Math.max(1, Math.min(1000, level));
  const region = getRegionForLevel(clampedLevel);
  const levelInRegion = ((clampedLevel - 1) % 50) + 1;

  const mod10 = clampedLevel % 10;
  let rhythmPhase: RhythmPhase = 'warmup';
  let isMilestone = false;
  let isRegionGuardian = false;
  let clueOffset = 0;
  let rewardMultiplier = 1.0;

  if (mod10 === 1 || mod10 === 2 || mod10 === 3) {
    rhythmPhase = 'warmup';
    clueOffset = 2;
    rewardMultiplier = 1.0;
  } else if (mod10 === 4 || mod10 === 5 || mod10 === 6) {
    rhythmPhase = 'balance';
    clueOffset = 0;
    rewardMultiplier = 1.0;
  } else if (mod10 === 7 || mod10 === 8) {
    rhythmPhase = 'tension';
    clueOffset = -2;
    rewardMultiplier = 1.2;
  } else if (mod10 === 9) {
    rhythmPhase = 'sprint';
    clueOffset = 3;
    rewardMultiplier = 1.0;
  } else if (mod10 === 0) {
    if (clampedLevel % 50 === 0) {
      rhythmPhase = 'guardian';
      isMilestone = true;
      isRegionGuardian = true;
      clueOffset = -2;
      rewardMultiplier = 2.5;
    } else {
      rhythmPhase = 'milestone';
      isMilestone = true;
      isRegionGuardian = false;
      clueOffset = -1;
      rewardMultiplier = 2.0;
    }
  }

  const targetClues = Math.max(22, Math.min(46, region.baseClues + clueOffset));
  const seedKey = `sudokumap_v1_${variant}_L${clampedLevel}`;

  return {
    level: clampedLevel,
    variant,
    seedKey,
    region,
    levelInRegion,
    rhythmPhase,
    isMilestone,
    isRegionGuardian,
    targetClues,
    rewardMultiplier
  };
}
