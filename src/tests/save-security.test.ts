import { describe, it, expect } from 'vitest';
import { validateSavedGameRecord } from '../engine/saveValidator';

describe('Save Security & Edge-Case Validation Tests', () => {
  it('should reject null, undefined or non-object records', () => {
    expect(validateSavedGameRecord(null)).toBe(false);
    expect(validateSavedGameRecord(undefined)).toBe(false);
    expect(validateSavedGameRecord('string-record')).toBe(false);
    expect(validateSavedGameRecord(12345)).toBe(false);
    expect(validateSavedGameRecord([])).toBe(false);
  });

  it('should reject invalid or unknown variants', () => {
    const record = {
      variant: 'unknown-variant',
      userBoard: Array(9).fill(Array(9).fill(0)),
      initialBoard: Array(9).fill(Array(9).fill(0)),
      currentSolution: Array(9).fill(Array(9).fill(1))
    };
    expect(validateSavedGameRecord(record)).toBe(false);
  });

  it('should reject malformed grid dimensions (not 9x9)', () => {
    const record = {
      variant: 'classic',
      userBoard: Array(5).fill(Array(5).fill(0)), // wrong size
      initialBoard: Array(9).fill(Array(9).fill(0)),
      currentSolution: Array(9).fill(Array(9).fill(1))
    };
    expect(validateSavedGameRecord(record)).toBe(false);
  });

  it('should reject completed games where emptyCount === 0', () => {
    const grid = [
      [1,2,3,4,5,6,7,8,9],
      [4,5,6,7,8,9,1,2,3],
      [7,8,9,1,2,3,4,5,6],
      [2,3,1,5,6,4,8,9,7],
      [5,6,4,8,9,7,2,3,1],
      [8,9,7,2,3,1,5,6,4],
      [3,1,2,6,4,5,9,7,8],
      [6,4,5,9,7,8,3,1,2],
      [9,7,8,3,1,2,6,4,5]
    ];
    const record = {
      variant: 'classic',
      userBoard: grid,
      initialBoard: grid,
      currentSolution: grid
    };
    expect(validateSavedGameRecord(record)).toBe(false);
  });

  it('should reject records with user moves conflicting with the solution', () => {
    const solution = [
      [1,2,3,4,5,6,7,8,9],
      [4,5,6,7,8,9,1,2,3],
      [7,8,9,1,2,3,4,5,6],
      [2,3,1,5,6,4,8,9,7],
      [5,6,4,8,9,7,2,3,1],
      [8,9,7,2,3,1,5,6,4],
      [3,1,2,6,4,5,9,7,8],
      [6,4,5,9,7,8,3,1,2],
      [9,7,8,3,1,2,6,4,5]
    ];
    const userBoard = solution.map(row => [...row]);
    userBoard[0][0] = 9; // Conflict! Solution has 1 at [0][0]

    const record = {
      variant: 'classic',
      userBoard,
      initialBoard: Array(9).fill(Array(9).fill(0)),
      currentSolution: solution
    };
    expect(validateSavedGameRecord(record)).toBe(false);
  });

  it('should reject samurai variant with invalid sub-board count or corrupted overlaps', () => {
    const validSubBoards = Array(5).fill(null).map(() => ({
      userBoard: Array(9).fill(Array(9).fill(0)),
      initialBoard: Array(9).fill(Array(9).fill(0)),
      solution: [
        [1,2,3,4,5,6,7,8,9],
        [4,5,6,7,8,9,1,2,3],
        [7,8,9,1,2,3,4,5,6],
        [2,3,1,5,6,4,8,9,7],
        [5,6,4,8,9,7,2,3,1],
        [8,9,7,2,3,1,5,6,4],
        [3,1,2,6,4,5,9,7,8],
        [6,4,5,9,7,8,3,1,2],
        [9,7,8,3,1,2,6,4,5]
      ]
    }));

    const record = {
      variant: 'samurai',
      samuraiBoards: validSubBoards
    };

    // Should validate successfully when overlaps match and empty count > 0
    expect(validateSavedGameRecord(record)).toBe(true);

    // Corrupt center/top-left overlap
    validSubBoards[1].solution[6][6] = 9; // mismatch with center [0][0] which is 1
    expect(validateSavedGameRecord(record)).toBe(false);
  });
});
