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

// 3 Adet %100 Doğrulanmış Gerçek Düzensiz (Jigsaw) Şablon
export const IRREGULAR_TEMPLATES: { regionMap: number[][]; solution: number[][] }[] = [
  {
    regionMap: [
      [0, 0, 0, 0, 1, 2, 2, 2, 2],
      [0, 0, 1, 0, 1, 1, 1, 2, 2],
      [3, 0, 1, 1, 1, 1, 5, 2, 2],
      [3, 0, 4, 4, 4, 5, 5, 5, 2],
      [3, 3, 3, 4, 4, 5, 5, 5, 5],
      [3, 3, 3, 3, 4, 4, 4, 4, 5],
      [6, 6, 6, 6, 7, 7, 7, 8, 8],
      [6, 6, 7, 6, 7, 8, 7, 8, 8],
      [6, 6, 7, 7, 7, 8, 8, 8, 8]
    ],
    solution: [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [9, 7, 6, 5, 3, 8, 2, 1, 4],
      [6, 8, 9, 1, 7, 4, 3, 5, 2],
      [7, 6, 8, 2, 1, 5, 4, 9, 3],
      [4, 5, 1, 3, 9, 2, 8, 7, 6],
      [3, 9, 2, 8, 4, 7, 5, 6, 1],
      [5, 4, 7, 9, 6, 3, 1, 2, 8],
      [2, 3, 5, 6, 8, 1, 9, 4, 7],
      [8, 1, 4, 7, 2, 9, 6, 3, 5]
    ]
  },
  {
    regionMap: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 4, 2, 2, 2],
      [3, 3, 0, 1, 1, 4, 2, 5, 5],
      [3, 3, 0, 1, 1, 4, 2, 5, 5],
      [3, 6, 0, 4, 4, 4, 2, 5, 5],
      [3, 6, 6, 4, 4, 4, 5, 5, 5],
      [3, 6, 6, 7, 7, 8, 8, 8, 8],
      [3, 3, 6, 7, 7, 8, 8, 8, 8],
      [6, 6, 6, 7, 7, 7, 7, 7, 8]
    ],
    solution: [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [6, 7, 9, 1, 2, 8, 3, 4, 5],
      [7, 4, 8, 9, 3, 5, 6, 2, 1],
      [5, 6, 4, 8, 7, 1, 2, 9, 3],
      [8, 3, 5, 2, 9, 4, 1, 6, 7],
      [2, 9, 1, 3, 6, 7, 4, 5, 8],
      [9, 5, 6, 7, 4, 3, 8, 1, 2],
      [3, 1, 2, 6, 8, 9, 5, 7, 4],
      [4, 8, 7, 5, 1, 2, 9, 3, 6]
    ]
  },
  {
    regionMap: [
      [0, 0, 0, 0, 1, 1, 2, 2, 2],
      [0, 0, 1, 1, 1, 1, 2, 2, 2],
      [0, 0, 3, 1, 1, 1, 5, 5, 2],
      [0, 3, 3, 3, 4, 4, 4, 5, 2],
      [3, 3, 3, 4, 4, 5, 5, 5, 2],
      [3, 3, 4, 4, 4, 4, 5, 8, 8],
      [7, 7, 7, 7, 7, 7, 5, 5, 8],
      [6, 7, 6, 7, 6, 7, 8, 8, 8],
      [6, 6, 6, 6, 6, 6, 8, 8, 8]
    ],
    solution: [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [5, 6, 9, 1, 8, 7, 3, 2, 4],
      [9, 7, 6, 3, 4, 2, 8, 5, 1],
      [8, 3, 1, 2, 6, 4, 9, 7, 5],
      [4, 8, 5, 7, 3, 9, 2, 1, 6],
      [7, 9, 8, 5, 2, 1, 6, 4, 3],
      [2, 1, 7, 6, 9, 5, 4, 3, 8],
      [6, 4, 2, 8, 1, 3, 5, 9, 7],
      [3, 5, 4, 9, 7, 8, 1, 6, 2]
    ]
  }
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

  // 90 Derece Saat Yönünde Matris Döndürücü
  static rotate90(grid: number[][]): number[][] {
    const N = grid.length;
    const res = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        res[c][N - 1 - r] = grid[r][c];
      }
    }
    return res;
  }

  // 0.01 Saniyede Anında Geçerli Çözüm Üretici (Rakam Permütasyonu)
  static generateSolutionFast(): number[][] {
    const perm = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
    return BASE_SUDOKU_SOLUTION.map(row => row.map(num => perm[num - 1]));
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

    if (variant === 'irregular') {
      const template = IRREGULAR_TEMPLATES[Math.floor(Math.random() * IRREGULAR_TEMPLATES.length)];
      let regionMap = template.regionMap.map(r => [...r]);
      let baseSolution = template.solution.map(r => [...r]);

      const rotations = Math.floor(Math.random() * 4);
      for (let i = 0; i < rotations; i++) {
        regionMap = this.rotate90(regionMap);
        baseSolution = this.rotate90(baseSolution);
      }

      const perm = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
      const solution = baseSolution.map(row => row.map(num => perm[num - 1]));
      const puzzle = solution.map(row => [...row]);

      const targetRemoves = difficulty === 'basit' ? 32 : difficulty === 'orta' ? 44 : 54;
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

      return {
        puzzle,
        solution,
        variant: 'irregular',
        regionMap
      };
    }

    const gen = this.generate(difficulty);
    let cages: KillerCage[] | undefined = undefined;

    if (variant === 'killer') {
      cages = this.generateKillerCages(gen.solution);
    }

    return {
      puzzle: gen.puzzle,
      solution: gen.solution,
      variant,
      cages
    };
  }

  static generate(difficulty: string): { puzzle: number[][]; solution: number[][] } {
    const solution = this.generateSolutionFast();
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
