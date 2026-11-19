import { describe, it, expect } from 'vitest';
import { SudokuGen } from '../engine/sudoku';
import { calculateEloChange, serializePuzzle, deserializePuzzle } from '../engine/matchEngine';
import { UserManager } from '../store/userState';

describe('Sudoku Engine & 5 Variants', () => {
  it('should generate valid Classic 9x9 Sudoku puzzle and solution', () => {
    const res = SudokuGen.generateVariant('basit', 'classic');
    expect(res.variant).toBe('classic');
    expect(res.puzzle).toHaveLength(9);
    expect(res.solution).toHaveLength(9);
    expect(res.puzzle[0]).toHaveLength(9);
  });

  it('should generate Irregular (Jigsaw) Sudoku with regionMap', () => {
    const res = SudokuGen.generateVariant('basit', 'irregular');
    expect(res.variant).toBe('irregular');
    expect(res.regionMap).toBeDefined();
    expect(res.regionMap).toHaveLength(9);
  });

  it('should verify Irregular Sudoku solution contains unique digits 1-9 in every row, col, AND irregular region', () => {
    const res = SudokuGen.generateVariant('basit', 'irregular');
    const solution = res.solution;
    const regionMap = res.regionMap!;

    // 0. Verify regionMap is NOT a standard 3x3 layout
    const isStandard3x3 = regionMap.every((row, r) => row.every((val, c) => val === Math.floor(r / 3) * 3 + Math.floor(c / 3)));
    expect(isStandard3x3).toBe(false);

    // 1. Row uniqueness
    for (let r = 0; r < 9; r++) {
      const rowDigits = new Set(solution[r]);
      expect(rowDigits.size).toBe(9);
      expect(rowDigits.has(0)).toBe(false);
    }

    // 2. Col uniqueness
    for (let c = 0; c < 9; c++) {
      const colDigits = new Set();
      for (let r = 0; r < 9; r++) colDigits.add(solution[r][c]);
      expect(colDigits.size).toBe(9);
      expect(colDigits.has(0)).toBe(false);
    }

    // 3. Irregular Region uniqueness
    const regionBuckets: Map<number, Set<number>> = new Map();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const regionId = regionMap[r][c];
        if (!regionBuckets.has(regionId)) regionBuckets.set(regionId, new Set());
        regionBuckets.get(regionId)!.add(solution[r][c]);
      }
    }

    expect(regionBuckets.size).toBe(9);
    regionBuckets.forEach((digitSet) => {
      expect(digitSet.size).toBe(9);
      expect(digitSet.has(0)).toBe(false);
    });
  });

  it('should generate Killer Sudoku with cages and verify sums and no duplicate digits in cages', () => {
    const res = SudokuGen.generateVariant('basit', 'killer');
    const solution = res.solution;
    const cages = res.cages!;

    expect(cages.length).toBeGreaterThan(0);

    const coveredCells = new Set<string>();
    cages.forEach(cage => {
      expect(cage.cells.length).toBeGreaterThanOrEqual(1);

      // Check sum accuracy
      const actualSum = cage.cells.reduce((acc, cell) => acc + solution[cell.r][cell.c], 0);
      expect(actualSum).toBe(cage.sum);

      // Check no duplicate digits in cage
      const cageDigits = cage.cells.map(cell => solution[cell.r][cell.c]);
      expect(new Set(cageDigits).size).toBe(cageDigits.length);

      // Track cell coverage
      cage.cells.forEach(cell => {
        const key = `${cell.r}_${cell.c}`;
        expect(coveredCells.has(key)).toBe(false);
        coveredCells.add(key);
      });
    });

    expect(coveredCells.size).toBe(81);
  });

  it('should generate Wordoku Sudoku', () => {
    const res = SudokuGen.generateVariant('basit', 'wordoku');
    expect(res.variant).toBe('wordoku');
    expect(res.puzzle).toHaveLength(9);
  });

  it('should generate Samurai 5-grid Sudoku and verify 5 valid grids and matching overlapping 3x3 corners', () => {
    const res = SudokuGen.generateVariant('basit', 'samurai');
    expect(res.variant).toBe('samurai');
    expect(res.samuraiGrids).toBeDefined();
    expect(res.samuraiGrids).toHaveLength(5);

    // 1. Verify all 5 grids are valid 9x9 Sudoku solutions
    res.samuraiGrids!.forEach(gridObj => {
      const solution = gridObj.solution;
      for (let r = 0; r < 9; r++) {
        expect(new Set(solution[r]).size).toBe(9);
      }
      for (let c = 0; c < 9; c++) {
        const colDigits = new Set();
        for (let r = 0; r < 9; r++) colDigits.add(solution[r][c]);
        expect(colDigits.size).toBe(9);
      }
    });

    // 2. Verify overlapping 3x3 corners match between Center (0) and 4 outer grids
    const center = res.samuraiGrids![0];
    const topLeft = res.samuraiGrids![1];
    const topRight = res.samuraiGrids![2];
    const bottomLeft = res.samuraiGrids![3];
    const bottomRight = res.samuraiGrids![4];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        // Top-Left corner
        expect(center.solution[r][c]).toBe(topLeft.solution[r + 6][c + 6]);
        expect(center.puzzle[r][c]).toBe(topLeft.puzzle[r + 6][c + 6]);

        // Top-Right corner
        expect(center.solution[r][c + 6]).toBe(topRight.solution[r + 6][c]);
        expect(center.puzzle[r][c + 6]).toBe(topRight.puzzle[r + 6][c]);

        // Bottom-Left corner
        expect(center.solution[r + 6][c]).toBe(bottomLeft.solution[r][c + 6]);
        expect(center.puzzle[r + 6][c]).toBe(bottomLeft.puzzle[r][c + 6]);

        // Bottom-Right corner
        expect(center.solution[r + 6][c + 6]).toBe(bottomRight.solution[r][c]);
        expect(center.puzzle[r + 6][c + 6]).toBe(bottomRight.puzzle[r][c]);
      }
    }
  });
});

describe('MatchEngine - ELO Rating & Serialization', () => {
  it('should correctly calculate ELO change for win and loss', () => {
    const winRes = calculateEloChange(1000, 1000, true, 'basit', 0, 0);
    expect(winRes.mmrChangeA).toBeGreaterThan(0);

    const lossRes = calculateEloChange(1000, 1000, false, 'basit', 0, 0);
    expect(lossRes.mmrChangeA).toBeLessThan(0);
  });

  it('should apply Flawless bonus for 0 error wins', () => {
    const regularWin = calculateEloChange(1000, 1000, true, 'basit', 2, 0);
    const flawlessWin = calculateEloChange(1000, 1000, true, 'basit', 0, 0);
    expect(flawlessWin.mmrChangeA).toBeGreaterThan(regularWin.mmrChangeA);
  });

  it('should serialize 2D 9x9 grid to 1D 81 flat array and deserialize back', () => {
    const originalGrid = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => r * 9 + c + 1));
    const serialized = serializePuzzle(originalGrid);
    expect(serialized).toHaveLength(81);
    expect(typeof serialized[0]).toBe('number');

    const deserialized = deserializePuzzle(serialized);
    expect(deserialized).toHaveLength(9);
    expect(deserialized[0]).toHaveLength(9);
    expect(deserialized[0][0]).toBe(originalGrid[0][0]);
  });
});

describe('UserManager - Fair Automatic Rank & Title Calculation', () => {
  it('should assign Çırak title for beginners who skipped to level 301 with 0 completions/wins', () => {
    const title = UserManager.calculatePlayerTitle(301, 0, 1000, 0);
    expect(title).toBe('🥉 Çırak');
  });

  it('should assign Kaşif title for rankScore >= 100', () => {
    const title = UserManager.calculatePlayerTitle(10, 2, 1020, 2);
    expect(title).toBe('🥈 Kaşif');
  });

  it('should assign Zihin Ustası title for rankScore >= 300', () => {
    const title = UserManager.calculatePlayerTitle(15, 5, 1050, 10);
    expect(title).toBe('🥇 Zihin Ustası');
  });

  it('should assign Üstat title for rankScore >= 700', () => {
    const title = UserManager.calculatePlayerTitle(30, 10, 1150, 25);
    expect(title).toBe('💎 Üstat');
  });

  it('should assign Büyükusta title for rankScore >= 1500', () => {
    const title = UserManager.calculatePlayerTitle(100, 25, 1300, 60);
    expect(title).toBe('🔥 Büyükusta');
  });
});
