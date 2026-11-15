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

  it('should generate Killer Sudoku with cages', () => {
    const res = SudokuGen.generateVariant('basit', 'killer');
    expect(res.variant).toBe('killer');
    expect(res.cages).toBeDefined();
    expect(res.cages!.length).toBeGreaterThan(0);
    expect(res.cages![0].sum).toBeGreaterThan(0);
  });

  it('should generate Wordoku Sudoku', () => {
    const res = SudokuGen.generateVariant('basit', 'wordoku');
    expect(res.variant).toBe('wordoku');
    expect(res.puzzle).toHaveLength(9);
  });

  it('should generate Samurai 5-grid Sudoku', () => {
    const res = SudokuGen.generateVariant('basit', 'samurai');
    expect(res.variant).toBe('samurai');
    expect(res.samuraiGrids).toBeDefined();
    expect(res.samuraiGrids).toHaveLength(5);
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
    expect(deserialized[0][0]).toBeOriginal = originalGrid[0][0];
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
