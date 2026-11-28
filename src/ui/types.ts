import { SudokuVariant, KillerCage } from '../engine/sudoku';
import { AbilityId } from '../engine/abilities';

export interface SavedGameRecord {
  id: string;
  variant: SudokuVariant;
  level: number;
  diff: 'basit' | 'orta' | 'zor';
  timeElapsed: number;
  userBoard: number[][];
  initialBoard: number[][];
  currentSolution: number[][];
  errors: number;
  notesBoard: number[][][];
  regionMap?: number[][];
  cages?: KillerCage[];
  samuraiBoards?: { userBoard: number[][]; initialBoard: number[][]; solution: number[][]; notesBoard: number[][][] }[];
  activeSamuraiIndex?: number;
  isCustomMode?: boolean;
  isMatchMode?: boolean;
  matchData?: any;
  equippedAbilities?: AbilityId[];
  enemyName?: string;
  updatedAtMs: number;
  mechanicsSnapshot?: {
    oracleChargesLeft: number;
    shieldChargesLeft: number;
    sealBreakerChargesLeft: number;
    consumedAbilities: AbilityId[];
    firstMoveMade: boolean;
    crackedCrystals: { r: number; c: number }[];
    freeHintsGranted: number;
    errorShieldsGranted: number;
  };
}
