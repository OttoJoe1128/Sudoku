import { SudokuVariant } from './sudoku';
import { mapGlobalToSamuraiCell } from '../ui/samuraiViewport';

export type ExamTier = 'basit' | 'orta' | 'zor';

export interface PlacementExamConfig {
  variant: SudokuVariant;
  tier: ExamTier;
  targetLevel: number;
  timeLimitSec: number;
  maxErrors: number;
  rewardGold: number;
}

export interface PlacementExamInput {
  variant: SudokuVariant;
  tier: ExamTier;
  currentVariantLevel: number;
  filledByUser: number;
  totalInitialEmpty: number;
  errors: number;
  completedAll: boolean;
  timeElapsedSec: number;
  timeLimitSec: number;
}

export interface PlacementExamResult {
  passedFull: boolean;
  partialAssigned: boolean;
  completionPercent: number;
  assignedLevel: number;
  previousLevel: number;
  levelsGained: number;
  rewardGold: number;
  errorFactor: number;
}

export function getPlacementExamConfig(
  variant: SudokuVariant,
  tier: ExamTier
): PlacementExamConfig {
  let targetLevel = 150;
  let baseMin = 5;
  let rewardGold = 50;

  if (tier === 'orta') {
    targetLevel = 301;
    baseMin = 7;
    rewardGold = 150;
  } else if (tier === 'zor') {
    targetLevel = 701;
    baseMin = 10;
    rewardGold = 300;
  }

  const variantMults: Record<SudokuVariant, number> = {
    classic: 1.0,
    wordoku: 1.15,
    irregular: 1.25,
    killer: 1.4,
    samurai: 2.5
  };

  const mult = variantMults[variant] || 1.0;
  const timeLimitSec = Math.round(baseMin * mult) * 60;

  return {
    variant,
    tier,
    targetLevel,
    timeLimitSec,
    maxErrors: 3,
    rewardGold
  };
}

export function evaluatePlacementExam(input: PlacementExamInput): PlacementExamResult {
  const config = getPlacementExamConfig(input.variant, input.tier);

  const rawRatio = input.totalInitialEmpty > 0
    ? Math.max(0, Math.min(1, input.filledByUser / input.totalInitialEmpty))
    : 0;

  const completionPercent = Math.round(rawRatio * 100);
  const previousLevel = input.currentVariantLevel;

  // Full Pass condition
  if (input.completedAll && input.errors < config.maxErrors && input.timeElapsedSec <= input.timeLimitSec) {
    const assignedLevel = Math.max(previousLevel, config.targetLevel);
    const levelsGained = Math.max(0, assignedLevel - previousLevel);
    const rewardGold = levelsGained > 0 ? config.rewardGold : Math.round(config.rewardGold * 0.2);

    return {
      passedFull: true,
      partialAssigned: false,
      completionPercent,
      assignedLevel,
      previousLevel,
      levelsGained,
      rewardGold,
      errorFactor: 1.0
    };
  }

  // Partial Evaluation
  let errorFactor = 1.0;
  if (input.errors === 1) errorFactor = 0.90;
  else if (input.errors === 2) errorFactor = 0.78;
  else if (input.errors >= 3) errorFactor = 0.62;

  if (rawRatio < 0.15) {
    return {
      passedFull: false,
      partialAssigned: false,
      completionPercent,
      assignedLevel: previousLevel,
      previousLevel,
      levelsGained: 0,
      rewardGold: 0,
      errorFactor
    };
  }

  const effectiveScore = Math.min(0.95, rawRatio * errorFactor);
  const computedLevel = Math.max(1, Math.min(config.targetLevel - 1, Math.round(1 + effectiveScore * (config.targetLevel - 1))));
  const assignedLevel = Math.max(previousLevel, computedLevel);
  const levelsGained = Math.max(0, assignedLevel - previousLevel);
  const partialAssigned = levelsGained > 0;
  const rewardGold = partialAssigned ? Math.max(10, Math.round(config.rewardGold * effectiveScore * 0.5)) : 0;

  return {
    passedFull: false,
    partialAssigned,
    completionPercent,
    assignedLevel,
    previousLevel,
    levelsGained,
    rewardGold,
    errorFactor
  };
}

export function calculateExamProgress(
  variant: SudokuVariant,
  userBoard: number[][],
  initialBoard: number[][],
  samuraiBoards?: { userBoard: number[][]; initialBoard: number[][] }[]
): { filledByUser: number; totalInitialEmpty: number } {
  let filledByUser = 0;
  let totalInitialEmpty = 0;

  if (variant === 'samurai' && samuraiBoards && samuraiBoards.length === 5) {
    const countedCells = new Set<string>();

    for (let gr = 0; gr < 21; gr++) {
      for (let gc = 0; gc < 21; gc++) {
        const cellRef = mapGlobalToSamuraiCell(gr, gc, 0);
        if (!cellRef) continue;

        const key = `${gr}_${gc}`;
        if (countedCells.has(key)) continue;
        countedCells.add(key);

        const bData = samuraiBoards[cellRef.gridIdx];
        if (!bData) continue;

        const initVal = bData.initialBoard[cellRef.r]?.[cellRef.c] || 0;
        const userVal = bData.userBoard[cellRef.r]?.[cellRef.c] || 0;

        if (initVal === 0) {
          totalInitialEmpty++;
          if (userVal > 0) {
            filledByUser++;
          }
        }
      }
    }
  } else {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const initVal = initialBoard[r]?.[c] || 0;
        const userVal = userBoard[r]?.[c] || 0;

        if (initVal === 0) {
          totalInitialEmpty++;
          if (userVal > 0) {
            filledByUser++;
          }
        }
      }
    }
  }

  return { filledByUser, totalInitialEmpty };
}
