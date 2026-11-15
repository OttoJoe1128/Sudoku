export type SudokuVariant = 'classic' | 'irregular' | 'killer' | 'wordoku' | 'samurai';

export interface KillerCage {
  sum: number;
  cells: { r: number; c: number }[];
}

export interface GeneratedSudoku {
  puzzle: number[][];
  solution: number[][];
  variant: SudokuVariant;
  regionMap?: number[][];
  cages?: KillerCage[];
  samuraiGrids?: { puzzle: number[][]; solution: number[][] }[];
}

export const PRESET_IRREGULAR_REGIONS: number[][][] = [
  [
    [0,0,0,1,1,1,2,2,2],
    [0,0,0,1,1,1,2,2,2],
    [0,0,0,1,1,1,2,2,2],
    [3,3,3,4,4,4,5,5,5],
    [3,3,3,4,4,4,5,5,5],
    [3,3,3,4,4,4,5,5,5],
    [6,6,6,7,7,7,8,8,8],
    [6,6,6,7,7,7,8,8,8],
    [6,6,6,7,7,7,8,8,8]
  ],
  [
    [0,0,0,0,1,1,1,1,1],
    [0,2,2,2,2,1,3,3,3],
    [0,0,2,4,4,1,3,5,3],
    [6,2,2,4,4,4,3,5,5],
    [6,6,4,4,7,4,4,5,5],
    [6,6,6,7,7,7,8,8,5],
    [6,7,7,7,8,8,8,8,5],
    [6,7,7,7,8,8,8,8,5],
    [6,6,7,7,8,8,8,8,5]
  ],
  [
    [0,0,1,1,1,2,2,2,2],
    [0,0,0,1,1,1,2,2,3],
    [0,0,4,4,1,3,3,3,3],
    [0,4,4,4,4,5,3,3,6],
    [7,7,4,4,5,5,5,6,6],
    [7,7,7,5,5,5,5,6,6],
    [7,7,7,7,8,5,6,6,6],
    [7,8,8,8,8,8,6,6,6],
    [8,8,8,8,8,8,8,6,6]
  ]
];

export class SudokuGen {
  static getStartLevelForDifficulty(diff: 'basit' | 'orta' | 'zor'): number {
    if (diff === 'basit') return 1;
    if (diff === 'orta') return 301;
    return 701;
  }

  static getDifficulty(level: number): 'basit' | 'orta' | 'zor' {
    if (level <= 300) return 'basit';
    if (level <= 700) return 'orta';
    return 'zor';
  }

  static generateVariant(difficulty: string, variant: SudokuVariant = 'classic'): GeneratedSudoku {
    if (variant === 'samurai') {
      const grids = Array.from({ length: 5 }, () => this.generate(difficulty));
      return {
        puzzle: grids[0].puzzle,
        solution: grids[0].solution,
        variant: 'samurai',
        samuraiGrids: grids
      };
    }

    const gen = this.generate(difficulty);
    let regionMap: number[][] | undefined = undefined;
    let cages: KillerCage[] | undefined = undefined;

    if (variant === 'irregular') {
      const idx = Math.floor(Math.random() * PRESET_IRREGULAR_REGIONS.length);
      regionMap = PRESET_IRREGULAR_REGIONS[idx];
    } else if (variant === 'killer') {
      cages = this.generateKillerCages(gen.solution);
    }

    return {
      puzzle: gen.puzzle,
      solution: gen.solution,
      variant,
      regionMap,
      cages
    };
  }

  static generate(difficulty: string): { puzzle: number[][]; solution: number[][] } {
    let board = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.fillDiagonal(board);
    this.solve(board);
    let solution = board.map(row => [...row]);

    let targetRemoves = difficulty === 'basit' ? 30 : difficulty === 'orta' ? 45 : 55;
    let positions: { r: number; c: number }[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push({ r, c });
      }
    }

    let removes = 0;
    while (removes < targetRemoves && positions.length > 0) {
      let idx = Math.floor(Math.random() * positions.length);
      let { r, c } = positions[idx];
      let backup = board[r][c];
      board[r][c] = 0;

      let boardCopy = board.map(row => [...row]);
      if (this.countSolutions(boardCopy) !== 1) {
        board[r][c] = backup;
      } else {
        removes++;
      }
      positions.splice(idx, 1);
    }
    return { puzzle: board, solution: solution };
  }

  private static generateKillerCages(solution: number[][]): KillerCage[] {
    const visited = Array.from({ length: 9 }, () => Array(9).fill(false));
    const cages: KillerCage[] = [];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!visited[r][c]) {
          const cageSize = Math.floor(Math.random() * 2) + 2; // 2 veya 3 hücreli kafesler
          const cells: { r: number; c: number }[] = [{ r, c }];
          visited[r][c] = true;

          const neighbors = [
            { r: r + 1, c },
            { r, c: c + 1 },
            { r: r - 1, c },
            { r, c: c - 1 }
          ].filter(n => n.r >= 0 && n.r < 9 && n.c >= 0 && n.c < 9 && !visited[n.r][n.c]);

          while (cells.length < cageSize && neighbors.length > 0) {
            const nextIdx = Math.floor(Math.random() * neighbors.length);
            const next = neighbors.splice(nextIdx, 1)[0];
            if (!visited[next.r][next.c]) {
              visited[next.r][next.c] = true;
              cells.push(next);
            }
          }

          const sum = cells.reduce((acc, curr) => acc + solution[curr.r][curr.c], 0);
          cages.push({ sum, cells });
        }
      }
    }

    return cages;
  }

  private static countSolutions(board: number[][], count: number = 0): number {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isSafe(board, r, c, num)) {
              board[r][c] = num;
              count = this.countSolutions(board, count);
              board[r][c] = 0;
              if (count > 1) return count;
            }
          }
          return count;
        }
      }
    }
    return count + 1;
  }

  private static fillDiagonal(board: number[][]) {
    for (let i = 0; i < 9; i += 3) this.fillBox(board, i, i);
  }

  private static fillBox(board: number[][], row: number, col: number) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let num;
        do { num = Math.floor(Math.random() * 9) + 1; } while (!this.isSafeInBox(board, row, col, num));
        board[row + i][col + j] = num;
      }
    }
  }

  private static isSafeInBox(board: number[][], row: number, col: number, num: number) {
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (board[row + i][col + j] === num) return false;
    return true;
  }

  private static solve(board: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isSafe(board, r, c, num)) {
              board[r][c] = num;
              if (this.solve(board)) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private static isSafe(board: number[][], row: number, col: number, num: number) {
    for (let i = 0; i < 9; i++) if (board[row][i] === num || board[i][col] === num) return false;
    let br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (board[br + i][bc + j] === num) return false;
    return true;
  }
}
