import { SudokuVariant } from './sudoku';
import { AbilityId, AbilityProgress } from './abilities';
import {
  LevelModifierProfile,
  SpecialCellDef,
  SpecialCellKind,
  getLevelModifierProfile,
  generateSpecialCellsForBoard
} from './levelModifiers';
import { getCandidates } from './hintSolver';

export type SpecialCellState = 'active' | 'collected' | 'cracked' | 'unlocked';

export interface SpecialCellRuntime extends SpecialCellDef {
  state: SpecialCellState;
}

export interface BoardMechanicsState {
  profile: LevelModifierProfile;
  cells: SpecialCellRuntime[];
  equippedAbilities: AbilityId[];
  abilityLevels: Partial<Record<AbilityId, number>>;
  consumedAbilities: AbilityId[];
  firstMoveMade: boolean;
  shieldChargesLeft: number;
  oracleChargesLeft: number;
  sealBreakerChargesLeft: number;
  sparkFlowEndsAtMs: number;
  sparkCombo: number;
  sparkBonusGold: number;
  crystalsEarnedInRun: number;
  crackedCrystals: { r: number; c: number }[];
  freeHintsGranted: number;
  errorShieldsGranted: number;
}

export function createBoardMechanicsState(
  puzzle: number[][],
  level: number,
  variant: SudokuVariant = 'classic',
  equippedAbilities: AbilityId[] = [],
  abilitiesState?: Record<AbilityId, AbilityProgress>
): BoardMechanicsState {
  const abilityLevels: Partial<Record<AbilityId, number>> = {};
  if (abilitiesState) {
    Object.keys(abilitiesState).forEach(k => {
      const id = k as AbilityId;
      abilityLevels[id] = abilitiesState[id]?.level || 0;
    });
  }

  const runeMagnetLevel = equippedAbilities.includes('rune_magnet') ? (abilityLevels.rune_magnet || 0) : 0;
  const rhythmBenderLevel = equippedAbilities.includes('rhythm_bender') ? (abilityLevels.rhythm_bender || 0) : 0;

  const profile = getLevelModifierProfile(level, variant, { runeMagnetLevel, rhythmBenderLevel });
  const generatedDefs = generateSpecialCellsForBoard(puzzle, level, variant, profile);
  const cells: SpecialCellRuntime[] = generatedDefs.map(c => ({ ...c, state: 'active' }));

  const shieldLvl = equippedAbilities.includes('crystal_shield') ? (abilityLevels.crystal_shield || 0) : 0;
  const shieldChargesLeft = shieldLvl >= 1 ? (shieldLvl >= 3 ? 2 : 1) : 0;

  const oracleLvl = equippedAbilities.includes('oracle_eye') ? (abilityLevels.oracle_eye || 0) : 0;
  const oracleChargesLeft = oracleLvl >= 1 ? (oracleLvl >= 5 ? 3 : oracleLvl >= 3 ? 2 : 1) : 0;

  const sealLvl = equippedAbilities.includes('seal_breaker') ? (abilityLevels.seal_breaker || 0) : 0;
  const sealBreakerChargesLeft = (sealLvl >= 3) ? 1 : 0;

  return {
    profile,
    cells,
    equippedAbilities: [...equippedAbilities],
    abilityLevels,
    consumedAbilities: [],
    firstMoveMade: false,
    shieldChargesLeft,
    oracleChargesLeft,
    sealBreakerChargesLeft,
    sparkFlowEndsAtMs: 0,
    sparkCombo: 0,
    sparkBonusGold: 0,
    crystalsEarnedInRun: 0,
    crackedCrystals: [],
    freeHintsGranted: 0,
    errorShieldsGranted: 0
  };
}

export function getSpecialCellAt(
  state: BoardMechanicsState,
  r: number,
  c: number
): SpecialCellRuntime | undefined {
  if (!state || !state.cells) return undefined;
  return state.cells.find(cell => cell.r === r && cell.c === c);
}

export function isCellSealed(
  state: BoardMechanicsState,
  r: number,
  c: number
): boolean {
  const cell = getSpecialCellAt(state, r, c);
  return !!(cell && cell.kind === 'seal' && cell.state === 'active');
}

export function applyValidMoveMechanics(
  state: BoardMechanicsState,
  r: number,
  c: number,
  nowMs: number = Date.now()
): {
  newlyConsumedAbilities: AbilityId[];
  crystalCollected: boolean;
  unlockedSeal?: { r: number; c: number };
  sparkTriggered: boolean;
  sparkComboGain: number;
  treasureReward?: 'free_hint' | 'error_shield';
  bonusGold: number;
} {
  const newlyConsumedAbilities: AbilityId[] = [];

  if (!state.firstMoveMade) {
    state.firstMoveMade = true;
    if (state.equippedAbilities.includes('rhythm_bender') && !state.consumedAbilities.includes('rhythm_bender')) {
      state.consumedAbilities.push('rhythm_bender');
      newlyConsumedAbilities.push('rhythm_bender');
    }
    if (state.equippedAbilities.includes('rune_magnet') && !state.consumedAbilities.includes('rune_magnet')) {
      state.consumedAbilities.push('rune_magnet');
      newlyConsumedAbilities.push('rune_magnet');
    }
  }

  let sparkComboGain = 0;
  let bonusGold = 0;
  if (nowMs < state.sparkFlowEndsAtMs) {
    state.sparkCombo += 1;
    sparkComboGain = 1;
    bonusGold += 1;
    state.sparkBonusGold += 1;
  }

  let crystalCollected = false;
  let unlockedSeal: { r: number; c: number } | undefined;
  let sparkTriggered = false;
  let treasureReward: 'free_hint' | 'error_shield' | undefined;

  const cell = getSpecialCellAt(state, r, c);
  if (cell && cell.state === 'active') {
    if (cell.kind === 'crystal') {
      cell.state = 'collected';
      state.crystalsEarnedInRun += 1;
      crystalCollected = true;
    } else if (cell.kind === 'key') {
      cell.state = 'collected';
      const seal = state.cells.find(s => s.kind === 'seal' && s.pairId === cell.pairId && s.state === 'active');
      if (seal) {
        seal.state = 'unlocked';
        unlockedSeal = { r: seal.r, c: seal.c };
      }
      if (state.equippedAbilities.includes('seal_breaker') && !state.consumedAbilities.includes('seal_breaker')) {
        state.consumedAbilities.push('seal_breaker');
        newlyConsumedAbilities.push('seal_breaker');
        const sbLvl = state.abilityLevels.seal_breaker || 0;
        if (sbLvl >= 5) {
          bonusGold += 2;
          state.sparkBonusGold += 2;
        }
      }
    } else if (cell.kind === 'spark') {
      cell.state = 'collected';
      sparkTriggered = true;
      const rbLvl = state.equippedAbilities.includes('rhythm_bender') ? (state.abilityLevels.rhythm_bender || 0) : 0;
      const rhythmBonusMs = [0, 5000, 8000, 12000, 16000, 20000][Math.min(5, rbLvl)] || 0;
      state.sparkFlowEndsAtMs = nowMs + 20_000 + rhythmBonusMs;
    } else if (cell.kind === 'treasure') {
      cell.state = 'collected';
      const seed = (state.profile.level + r + c) % 2;
      if (seed === 0) {
        state.freeHintsGranted += 1;
        treasureReward = 'free_hint';
      } else {
        state.errorShieldsGranted += 1;
        treasureReward = 'error_shield';
      }
    }
  }

  return {
    newlyConsumedAbilities,
    crystalCollected,
    unlockedSeal,
    sparkTriggered,
    sparkComboGain,
    treasureReward,
    bonusGold
  };
}

export function applyMistakeMechanics(
  state: BoardMechanicsState,
  r: number,
  c: number
): {
  newlyConsumedAbilities: AbilityId[];
  crystalCracked: boolean;
  crystalProtectedByShield: boolean;
  absorbMistake: boolean;
} {
  const newlyConsumedAbilities: AbilityId[] = [];
  let crystalCracked = false;
  let crystalProtectedByShield = false;
  let absorbMistake = false;

  const cell = getSpecialCellAt(state, r, c);
  if (cell && cell.kind === 'crystal' && cell.state === 'active') {
    if (state.shieldChargesLeft > 0) {
      state.shieldChargesLeft -= 1;
      if (!state.consumedAbilities.includes('crystal_shield')) {
        state.consumedAbilities.push('crystal_shield');
        newlyConsumedAbilities.push('crystal_shield');
      }
      crystalProtectedByShield = true;
      const csLvl = state.abilityLevels.crystal_shield || 0;
      if (csLvl >= 3) absorbMistake = true;
    } else {
      cell.state = 'cracked';
      state.crackedCrystals.push({ r, c });
      crystalCracked = true;
    }
  }

  if (!absorbMistake && state.errorShieldsGranted > 0) {
    state.errorShieldsGranted -= 1;
    absorbMistake = true;
  }

  return {
    newlyConsumedAbilities,
    crystalCracked,
    crystalProtectedByShield,
    absorbMistake
  };
}

export function repairLastCrackedCrystal(
  state: BoardMechanicsState,
  userBoard?: number[][]
): { ok: boolean; repairedCell?: { r: number; c: number } } {
  if (!state || state.crackedCrystals.length === 0) {
    return { ok: false };
  }

  const lastCracked = state.crackedCrystals.pop()!;
  const cell = getSpecialCellAt(state, lastCracked.r, lastCracked.c);
  if (cell) {
    const isAlreadySolved = userBoard && userBoard[cell.r] && userBoard[cell.r][cell.c] !== 0;
    if (isAlreadySolved) {
      cell.state = 'collected';
      state.crystalsEarnedInRun += 1;
    } else {
      cell.state = 'active';
    }
  }

  return { ok: true, repairedCell: lastCracked };
}

export function activateOracleEye(
  state: BoardMechanicsState,
  userBoard: number[][],
  selectedCell: { r: number; c: number } | null,
  regionMap?: number[][]
): {
  ok: boolean;
  newlyConsumed: boolean;
  scannedCells: { r: number; c: number; candidates: number[] }[];
} {
  if (!state || state.oracleChargesLeft <= 0) {
    return { ok: false, newlyConsumed: false, scannedCells: [] };
  }

  let target = selectedCell && userBoard[selectedCell.r] && userBoard[selectedCell.r][selectedCell.c] === 0
    ? selectedCell
    : null;

  if (!target) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (userBoard[r][c] === 0) {
          target = { r, c };
          break;
        }
      }
      if (target) break;
    }
  }

  if (!target) return { ok: false, newlyConsumed: false, scannedCells: [] };

  const lvl = state.abilityLevels.oracle_eye || 0;
  const scannedCells: { r: number; c: number; candidates: number[] }[] = [];

  if (lvl >= 3) {
    if (regionMap && regionMap[target.r]) {
      const reg = regionMap[target.r][target.c];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (regionMap[r][c] === reg && userBoard[r][c] === 0) {
            scannedCells.push({ r, c, candidates: getCandidates(userBoard, r, c, regionMap) });
          }
        }
      }
    } else {
      const boxR = Math.floor(target.r / 3) * 3;
      const boxC = Math.floor(target.c / 3) * 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const row = boxR + r;
          const col = boxC + c;
          if (userBoard[row][col] === 0) {
            scannedCells.push({ r: row, c: col, candidates: getCandidates(userBoard, row, col) });
          }
        }
      }
    }
  } else {
    scannedCells.push({
      r: target.r,
      c: target.c,
      candidates: getCandidates(userBoard, target.r, target.c, regionMap)
    });
  }

  state.oracleChargesLeft -= 1;
  let newlyConsumed = false;
  if (!state.consumedAbilities.includes('oracle_eye')) {
    state.consumedAbilities.push('oracle_eye');
    newlyConsumed = true;
  }

  return { ok: true, newlyConsumed, scannedCells };
}

export function activateSealBreaker(
  state: BoardMechanicsState,
  selectedCell: { r: number; c: number } | null
): {
  ok: boolean;
  newlyConsumed: boolean;
  brokenSeal?: { r: number; c: number };
} {
  if (!state || state.sealBreakerChargesLeft <= 0) {
    return { ok: false, newlyConsumed: false };
  }

  let sealCell: SpecialCellRuntime | undefined;
  if (selectedCell && isCellSealed(state, selectedCell.r, selectedCell.c)) {
    sealCell = getSpecialCellAt(state, selectedCell.r, selectedCell.c);
  } else {
    sealCell = state.cells.find(c => c.kind === 'seal' && c.state === 'active');
  }

  if (!sealCell) {
    return { ok: false, newlyConsumed: false };
  }

  sealCell.state = 'unlocked';
  state.sealBreakerChargesLeft -= 1;

  let newlyConsumed = false;
  if (!state.consumedAbilities.includes('seal_breaker')) {
    state.consumedAbilities.push('seal_breaker');
    newlyConsumed = true;
  }

  return { ok: true, newlyConsumed, brokenSeal: { r: sealCell.r, c: sealCell.c } };
}

export function computeFinalRunCrystals(
  state: BoardMechanicsState,
  errors: number,
  timeElapsedSec: number
): number {
  if (!state) return 0;
  let total = state.crystalsEarnedInRun;

  if (state.profile.hasFlawlessCrystalBonus && errors === 0) {
    total += state.profile.flawlessBonusCrystals;
  }

  if (state.profile.sprintTargetSec > 0 && timeElapsedSec <= state.profile.sprintTargetSec) {
    total += state.profile.sprintBonusCrystals;
  }

  return Math.min(state.profile.maxCollectibleCrystals, total);
}
