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

export const BASE_IRREGULAR_REGION_MAP: number[][] = [
  [0, 0, 0, 1, 1, 1, 2, 2, 2],
  [0, 0, 0, 1, 1, 1, 2, 2, 2],
  [0, 0, 0, 1, 1, 1, 2, 2, 2],
  [3, 3, 3, 4, 4, 4, 5, 5, 5],
  [3, 3, 3, 4, 4, 4, 5, 5, 5],
  [3, 3, 3, 4, 4, 4, 5, 5, 5],
  [6, 6, 6, 7, 7, 7, 8, 8, 8],
  [6, 6, 6, 7, 7, 7, 8, 8, 8],
  [6, 6, 6, 7, 7, 7, 8, 8, 8]
];

export const BASE_IRREGULAR_SOLUTION: number[][] = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [4, 5, 6, 7, 8, 9, 1, 2, 3],
  [7, 8, 9, 1, 2, 3, 4, 5, 6],
  [2, 3, 1, 5, 6, 4, 8, 9, 7],
  [5, 6, 4, 8, 9, 7, 2, 3, 1],
  [8, 9, 7, 2, 3, 1, 5, 6, 4],
  [3, 1, 2, 6, 4, 5, 9, 7, 8],
  [6, 4, 5, 9, 7, 8, 3, 1, 2],
  [9, 7, 8, 3, 1, 2, 6, 4, 5]
];

const BASE_SUDOKU_SOLUTION: number[][] = [
  [1,2,3, 4,5,6, 7,8,9],
  [4,5,6, 7,8,9, 1,2,3],
  [7,8,9, 1,2,3, 4,5,6],
  [2,3,1, 5,6,4, 8,9,7],
  [5,6,4, 8,9,7, 2,3,1],
  [8,9,7, 2,3,1, 5,6,4],
  [3,1,2, 6,4,5, 9,7,8],
  [6,4,5, 9,7,8, 3,1,2],
  [9,7,8, 3,1,2, 6,4,5]
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

  // 0.01 Saniyede Anında Geçerli Çözüm Üretici (Rakam Permütasyonu)
  static generateSolutionFast(isIrregular: boolean = false): number[][] {
    const perm = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
    const source = isIrregular ? BASE_IRREGULAR_SOLUTION : BASE_SUDOKU_SOLUTION;
    return source.map(row => row.map(num => perm[num - 1]));
  }

  static generateVariant(difficulty: string, variant: SudokuVariant = 'classic'): GeneratedSudoku {
    if (variant === 'samurai') {
      const center = this.generate(difficulty);
      const topLeft = this.generate(difficulty);
      const topRight = this.generate(difficulty);
      const bottomLeft = this.generate(difficulty);
      const bottomRight = this.generate(difficulty);

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          center.solution[r][c] = topLeft.solution[r + 6][c + 6];
          center.puzzle[r][c] = topLeft.puzzle[r + 6][c + 6];

          center.solution[r][c + 6] = topRight.solution[r + 6][c];
          center.puzzle[r][c + 6] = topRight.puzzle[r + 6][c];

          center.solution[r + 6][c] = bottomLeft.solution[r][c + 6];
          center.puzzle[r + 6][c] = bottomLeft.puzzle[r][c + 6];

          center.solution[r + 6][c + 6] = bottomRight.solution[r][c];
          center.puzzle[r + 6][c + 6] = bottomRight.puzzle[r][c];
        }
      }

      const samuraiGrids = [center, topLeft, topRight, bottomLeft, bottomRight];
      return {
        puzzle: center.puzzle,
        solution: center.solution,
        variant: 'samurai',
        samuraiGrids
      };
    }

    const isIrregular = variant === 'irregular';
    const gen = this.generate(difficulty, isIrregular);
    let regionMap: number[][] | undefined = undefined;
    let cages: KillerCage[] | undefined = undefined;

    if (isIrregular) {
      regionMap = BASE_IRREGULAR_REGION_MAP;
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

  static generate(difficulty: string, isIrregular: boolean = false): { puzzle: number[][]; solution: number[][] } {
    const solution = this.generateSolutionFast(isIrregular);
    const puzzle = solution.map(row => [...row]);

    const targetRemoves = difficulty === 'basit' ? 30 : difficulty === 'orta' ? 42 : 52;
    const positions: { r: number; c: number }[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push({ r, c });
      }
    }

    positions.sort(() => Math.random() - 0.5);
    for (let i = 0; i < targetRemoves && i < positions.length; i++) {
      const { r, c } = positions[i];
      puzzle[r][c] = 0;
    }

    return { puzzle, solution };
  }

  private static generateKillerCages(solution: number[][]): KillerCage[] {
    const visited = Array.from({ length: 9 }, () => Array(9).fill(false));
    const cages: KillerCage[] = [];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!visited[r][c]) {
          const cageSize = Math.floor(Math.random() * 2) + 2;
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

  static runSelfDiagnostics(): boolean {
    try {
      const variants: SudokuVariant[] = ['classic', 'irregular', 'killer', 'wordoku', 'samurai'];
      let allPass = true;

      variants.forEach(v => {
        const res = this.generateVariant('basit', v);
        if (!res.puzzle || !res.solution) allPass = false;
        if (v === 'irregular' && (!res.regionMap || res.regionMap.length !== 9)) allPass = false;
        if (v === 'killer' && (!res.cages || res.cages.length === 0)) allPass = false;
        if (v === 'samurai' && (!res.samuraiGrids || res.samuraiGrids.length !== 5)) allPass = false;
      });

      return allPass;
    } catch {
      return false;
    }
  }
}
