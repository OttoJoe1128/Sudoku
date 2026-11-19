import { SudokuVariant } from './sudoku';

export function validateSavedGameRecord(record: any): boolean {
  try {
    if (!record || typeof record !== 'object') return false;

    const validVariants: SudokuVariant[] = ['classic', 'irregular', 'killer', 'wordoku', 'samurai'];
    if (!validVariants.includes(record.variant)) return false;

    const is9x9 = (grid: any) => Array.isArray(grid) && grid.length === 9 && grid.every((r: any) => Array.isArray(r) && r.length === 9);

    if (record.variant === 'samurai') {
      if (!Array.isArray(record.samuraiBoards) || record.samuraiBoards.length !== 5) return false;

      let totalEmpty = 0;
      for (let i = 0; i < 5; i++) {
        const boardObj = record.samuraiBoards[i];
        if (!boardObj || !is9x9(boardObj.userBoard) || !is9x9(boardObj.initialBoard) || !is9x9(boardObj.solution)) return false;

        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            const uVal = boardObj.userBoard[r][c];
            const sVal = boardObj.solution[r][c];
            if (sVal < 1 || sVal > 9) return false;
            if (uVal !== 0 && uVal !== sVal) return false;
            if (uVal === 0) totalEmpty++;
          }
        }
      }

      if (totalEmpty === 0) return false;

      const center = record.samuraiBoards[0];
      const topLeft = record.samuraiBoards[1];
      const topRight = record.samuraiBoards[2];
      const bottomLeft = record.samuraiBoards[3];
      const bottomRight = record.samuraiBoards[4];

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (center.solution[r][c] !== topLeft.solution[r + 6][c + 6]) return false;
          if (center.solution[r][c + 6] !== topRight.solution[r + 6][c]) return false;
          if (center.solution[r + 6][c] !== bottomLeft.solution[r][c + 6]) return false;
          if (center.solution[r + 6][c + 6] !== bottomRight.solution[r][c]) return false;
        }
      }

      return true;
    }

    if (!is9x9(record.userBoard) || !is9x9(record.initialBoard) || !is9x9(record.currentSolution)) return false;

    let emptyCount = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const uVal = record.userBoard[r][c];
        const sVal = record.currentSolution[r][c];
        if (sVal < 1 || sVal > 9) return false;
        if (uVal !== 0 && uVal !== sVal) return false;
        if (uVal === 0) emptyCount++;
      }
    }

    if (emptyCount === 0) return false;

    for (let r = 0; r < 9; r++) {
      if (new Set(record.currentSolution[r]).size !== 9) return false;
    }
    for (let c = 0; c < 9; c++) {
      const colDigits = new Set();
      for (let r = 0; r < 9; r++) colDigits.add(record.currentSolution[r][c]);
      if (colDigits.size !== 9) return false;
    }

    if (record.variant === 'classic' || record.variant === 'wordoku' || record.variant === 'killer') {
      for (let br = 0; br < 9; br += 3) {
        for (let bc = 0; bc < 9; bc += 3) {
          const boxDigits = new Set();
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              boxDigits.add(record.currentSolution[br + r][bc + c]);
            }
          }
          if (boxDigits.size !== 9) return false;
        }
      }
    }

    if (record.variant === 'irregular') {
      if (!is9x9(record.regionMap)) return false;

      const isStandard3x3 = record.regionMap.every((row: any, r: number) => row.every((val: any, c: number) => val === Math.floor(r / 3) * 3 + Math.floor(c / 3)));
      if (isStandard3x3) return false;

      const regionBuckets: Map<number, Set<number>> = new Map();
      const regionCounts: Map<number, number> = new Map();

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const regId = record.regionMap[r][c];
          if (regId < 0 || regId > 8) return false;
          regionCounts.set(regId, (regionCounts.get(regId) || 0) + 1);

          if (!regionBuckets.has(regId)) regionBuckets.set(regId, new Set());
          regionBuckets.get(regId)!.add(record.currentSolution[r][c]);
        }
      }

      if (regionCounts.size !== 9) return false;
      for (let i = 0; i < 9; i++) {
        if (regionCounts.get(i) !== 9) return false;
        if (!regionBuckets.has(i) || regionBuckets.get(i)!.size !== 9) return false;
      }
    }

    if (record.variant === 'killer') {
      if (!Array.isArray(record.cages) || record.cages.length === 0) return false;

      const covered = new Set<string>();
      for (const cage of record.cages) {
        if (!cage || !Array.isArray(cage.cells) || cage.cells.length === 0) return false;

        const digits: number[] = [];
        let actualSum = 0;
        for (const cell of cage.cells) {
          if (typeof cell.r !== 'number' || typeof cell.c !== 'number') return false;
          if (cell.r < 0 || cell.r > 8 || cell.c < 0 || cell.c > 8) return false;

          const key = `${cell.r}_${cell.c}`;
          if (covered.has(key)) return false;
          covered.add(key);

          const val = record.currentSolution[cell.r][cell.c];
          digits.push(val);
          actualSum += val;
        }

        if (actualSum !== cage.sum) return false;
        if (new Set(digits).size !== digits.length) return false;
      }

      if (covered.size !== 81) return false;
    }

    return true;
  } catch {
    return false;
  }
}
