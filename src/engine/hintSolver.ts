import { SudokuVariant } from './sudoku';

export type HintTechnique =
  | 'naked_single'
  | 'hidden_single_row'
  | 'hidden_single_col'
  | 'hidden_single_box'
  | 'pointing_deduction'
  | 'solution_fallback';

export interface SmartHint {
  row: number;
  col: number;
  digit: number;
  technique: HintTechnique;
  unitType: 'cell' | 'row' | 'col' | 'box';
  unitIndex: number;
  relatedCells: { r: number; c: number }[];
}

export function getCandidates(
  board: number[][],
  r: number,
  c: number,
  regionMap?: number[][]
): number[] {
  if (!board || !board[r] || board[r][c] !== 0) return [];

  const used = new Set<number>();

  // Satır & Sütun kontrolü
  for (let i = 0; i < 9; i++) {
    if (board[r][i] > 0) used.add(board[r][i]);
    if (board[i][c] > 0) used.add(board[i][c]);
  }

  // Kutu / Bölge kontrolü
  if (regionMap && regionMap[r]) {
    const targetRegion = regionMap[r][c];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (regionMap[i][j] === targetRegion && board[i][j] > 0) {
          used.add(board[i][j]);
        }
      }
    }
  } else {
    const boxR = Math.floor(r / 3) * 3;
    const boxC = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const val = board[boxR + i][boxC + j];
        if (val > 0) used.add(val);
      }
    }
  }

  const candidates: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (!used.has(num)) candidates.push(num);
  }
  return candidates;
}

function getRelatedCells(r: number, c: number, regionMap?: number[][]): { r: number; c: number }[] {
  const cells: { r: number; c: number }[] = [];
  const setKey = new Set<string>();

  const add = (row: number, col: number) => {
    const key = `${row}_${col}`;
    if (!setKey.has(key)) {
      setKey.add(key);
      cells.push({ r: row, c: col });
    }
  };

  for (let i = 0; i < 9; i++) {
    add(r, i);
    add(i, c);
  }

  if (regionMap && regionMap[r]) {
    const reg = regionMap[r][c];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (regionMap[i][j] === reg) add(i, j);
      }
    }
  } else {
    const boxR = Math.floor(r / 3) * 3;
    const boxC = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        add(boxR + i, boxC + j);
      }
    }
  }

  return cells;
}

export function findSmartHint(
  userBoard: number[][],
  solution: number[][],
  options?: { preferredCell?: { r: number; c: number } | null; regionMap?: number[][]; sealedCells?: { r: number; c: number }[] }
): SmartHint | null {
  if (!userBoard || !solution) return null;

  const regionMap = options?.regionMap;
  const preferred = options?.preferredCell;
  const isSealed = (r: number, c: number) => Boolean(options?.sealedCells?.some(sc => sc.r === r && sc.c === c));

  // 1. Adayları hesapla
  const candidatesGrid: number[][][] = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => [])
  );

  let emptyCount = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (userBoard[r][c] === 0 && !isSealed(r, c)) {
        emptyCount++;
        candidatesGrid[r][c] = getCandidates(userBoard, r, c, regionMap);
      }
    }
  }

  if (emptyCount === 0) return null;

  // 1. NAKED SINGLE (Tek seçeneği kalan hücre)
  // preferredCell uyuyorsa öncelik ver
  if (preferred && userBoard[preferred.r][preferred.c] === 0 && !isSealed(preferred.r, preferred.c)) {
    const cands = candidatesGrid[preferred.r][preferred.c];
    if (cands.length === 1 && cands[0] === solution[preferred.r][preferred.c]) {
      return {
        row: preferred.r,
        col: preferred.c,
        digit: cands[0],
        technique: 'naked_single',
        unitType: 'cell',
        unitIndex: preferred.r * 9 + preferred.c,
        relatedCells: getRelatedCells(preferred.r, preferred.c, regionMap)
      };
    }
  }

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (userBoard[r][c] === 0 && !isSealed(r, c)) {
        const cands = candidatesGrid[r][c];
        if (cands.length === 1 && cands[0] === solution[r][c]) {
          return {
            row: r,
            col: c,
            digit: cands[0],
            technique: 'naked_single',
            unitType: 'cell',
            unitIndex: r * 9 + c,
            relatedCells: getRelatedCells(r, c, regionMap)
          };
        }
      }
    }
  }

  // 2. HIDDEN SINGLE - KUTU / BÖLGE
  for (let b = 0; b < 9; b++) {
    const boxCells: { r: number; c: number }[] = [];
    if (regionMap) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (regionMap[r][c] === b) boxCells.push({ r, c });
        }
      }
    } else {
      const boxR = Math.floor(b / 3) * 3;
      const boxC = (b % 3) * 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          boxCells.push({ r: boxR + r, c: boxC + c });
        }
      }
    }

    for (let digit = 1; digit <= 9; digit++) {
      const matchingCells = boxCells.filter(
        cell => userBoard[cell.r][cell.c] === 0 && !isSealed(cell.r, cell.c) && candidatesGrid[cell.r][cell.c].includes(digit)
      );

      if (matchingCells.length === 1) {
        const target = matchingCells[0];
        if (solution[target.r][target.c] === digit) {
          return {
            row: target.r,
            col: target.c,
            digit,
            technique: 'hidden_single_box',
            unitType: 'box',
            unitIndex: b,
            relatedCells: boxCells
          };
        }
      }
    }
  }

  // 3. HIDDEN SINGLE - SATIR
  for (let r = 0; r < 9; r++) {
    for (let digit = 1; digit <= 9; digit++) {
      const matchingCols: number[] = [];
      for (let c = 0; c < 9; c++) {
        if (userBoard[r][c] === 0 && !isSealed(r, c) && candidatesGrid[r][c].includes(digit)) {
          matchingCols.push(c);
        }
      }
      if (matchingCols.length === 1) {
        const c = matchingCols[0];
        if (solution[r][c] === digit) {
          const rowCells = Array.from({ length: 9 }, (_, colIdx) => ({ r, c: colIdx }));
          return {
            row: r,
            col: c,
            digit,
            technique: 'hidden_single_row',
            unitType: 'row',
            unitIndex: r,
            relatedCells: rowCells
          };
        }
      }
    }
  }

  // 4. HIDDEN SINGLE - SÜTUN
  for (let c = 0; c < 9; c++) {
    for (let digit = 1; digit <= 9; digit++) {
      const matchingRows: number[] = [];
      for (let r = 0; r < 9; r++) {
        if (userBoard[r][c] === 0 && !isSealed(r, c) && candidatesGrid[r][c].includes(digit)) {
          matchingRows.push(r);
        }
      }
      if (matchingRows.length === 1) {
        const r = matchingRows[0];
        if (solution[r][c] === digit) {
          const colCells = Array.from({ length: 9 }, (_, rowIdx) => ({ r: rowIdx, c }));
          return {
            row: r,
            col: c,
            digit,
            technique: 'hidden_single_col',
            unitType: 'col',
            unitIndex: c,
            relatedCells: colCells
          };
        }
      }
    }
  }

  // 5. FALLBACK: solution_fallback (En az adayı olan boş hücreyi seç)
  let bestR = -1;
  let bestC = -1;
  let minCands = 99;

  if (preferred && userBoard[preferred.r][preferred.c] === 0 && !isSealed(preferred.r, preferred.c)) {
    bestR = preferred.r;
    bestC = preferred.c;
  } else {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (userBoard[r][c] === 0 && !isSealed(r, c)) {
          const count = candidatesGrid[r][c].length;
          if (count < minCands) {
            minCands = count;
            bestR = r;
            bestC = c;
          }
        }
      }
    }
  }

  if (bestR !== -1 && bestC !== -1) {
    const digit = solution[bestR][bestC];
    return {
      row: bestR,
      col: bestC,
      digit,
      technique: 'solution_fallback',
      unitType: 'cell',
      unitIndex: bestR * 9 + bestC,
      relatedCells: getRelatedCells(bestR, bestC, regionMap)
    };
  }

  return null;
}

export function formatHintSymbol(digit: number, variant: SudokuVariant = 'classic'): string {
  if (variant === 'wordoku') {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    return letters[Math.max(0, Math.min(8, digit - 1))] || String(digit);
  }
  return String(digit);
}
