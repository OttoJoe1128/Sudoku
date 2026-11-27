import { describe, it, expect } from 'vitest';
import { SudokuBitmaskBoard } from '../engine/bitmaskEngine';
import {
  findNakedPair,
  findHiddenPair,
  findXWing,
  findSwordfish,
  findXYWing,
  findAdvancedTechnique
} from '../engine/advancedTechniques';

describe('Faz 1 - Adım 1.2: İleri Seviye Mantık Algoritmaları (Advanced Logic Algorithms)', () => {
  it('1. Naked Pair (Çıplak İkili) Tespiti & Eleme', () => {
    const board = Array.from({ length: 9 }, () => new Array(9).fill(0));

    // Satır 0'ın diğer hücrelerine [1, 2, 4, 5, 6, 8] değerlerini yerleştir
    board[0][2] = 1;
    board[0][3] = 2;
    board[0][4] = 4;
    board[0][5] = 5;
    board[0][6] = 6;
    board[0][7] = 8;
    // Sütun 0 ve Sütun 1'e 9 koy -> (0,0) ve (0,1)'de 9 elenir ve yalnızca {3, 7} kalır
    board[2][0] = 9;
    board[2][1] = 9;

    const bitmaskBoard = new SudokuBitmaskBoard();
    bitmaskBoard.load(board);

    const deduction = findNakedPair(bitmaskBoard);
    expect(deduction).not.toBeNull();
    expect(deduction?.technique).toBe('naked_pair');
    expect(deduction?.digits.sort()).toEqual([3, 7]);
    expect(deduction?.primaryCells).toEqual([
      { r: 0, c: 0 },
      { r: 0, c: 1 }
    ]);
    const elim = deduction?.targetEliminations.find(e => e.r === 0 && e.c === 8);
    expect(elim).toBeDefined();
    expect(elim?.eliminatedDigits.sort()).toEqual([3, 7]);
  });

  it('2. Hidden Pair (Gizli İkili) Tespiti & Eleme', () => {
    const board = Array.from({ length: 9 }, () => new Array(9).fill(0));
    // Satır 1'de yalnızca (1, 3) ve (1, 7) hücrelerinde {2, 6} adayları bulunsun.
    for (let c = 0; c < 9; c++) {
      if (c !== 3 && c !== 7) {
        board[3][c] = 2;
        board[4][c] = 6;
      }
    }

    const bitmaskBoard = new SudokuBitmaskBoard();
    bitmaskBoard.load(board);

    const deduction = findHiddenPair(bitmaskBoard);
    expect(deduction).not.toBeNull();
    expect(deduction?.technique).toBe('hidden_pair');
    expect(deduction?.digits.sort()).toEqual([2, 6]);
    expect(deduction?.primaryCells.length).toBe(2);
    expect(deduction?.primaryCells.map(p => p.c).sort()).toEqual([3, 7]);
  });

  it('3. X-Wing (X-Kanadı) Tespiti & Dikey/Yatay Eleme', () => {
    const board = Array.from({ length: 9 }, () => new Array(9).fill(0));
    const targetDigit = 7;

    for (let c = 0; c < 9; c++) {
      if (c !== 2 && c !== 5) {
        board[8][c] = targetDigit;
      }
    }

    const bitmaskBoard = new SudokuBitmaskBoard();
    bitmaskBoard.load(board);

    const deduction = findXWing(bitmaskBoard);
    expect(deduction).not.toBeNull();
    expect(deduction?.technique).toBe('x_wing');
    expect(deduction?.digits).toEqual([targetDigit]);
    expect(deduction?.targetEliminations.length).toBeGreaterThan(0);
    expect(deduction?.primaryCells.length).toBe(4);
  });

  it('4. Swordfish (Kılıçbalığı) 3x3 Matris Tespiti', () => {
    const board = Array.from({ length: 9 }, () => new Array(9).fill(0));
    const targetDigit = 4;

    for (let c = 0; c < 9; c++) {
      if (c !== 1 && c !== 3 && c !== 6) {
        board[8][c] = targetDigit;
      }
    }

    const bitmaskBoard = new SudokuBitmaskBoard();
    bitmaskBoard.load(board);

    const deduction = findSwordfish(bitmaskBoard);
    expect(deduction).not.toBeNull();
    expect(deduction?.technique).toBe('swordfish');
    expect(deduction?.digits).toEqual([targetDigit]);
    expect(deduction?.targetEliminations.length).toBeGreaterThan(0);
  });

  it('5. XY-Wing (Y-Wing / Bivalue Zinciri) Tespiti', () => {
    const board = Array.from({ length: 9 }, () => new Array(9).fill(0));
    const bitmaskBoard = new SudokuBitmaskBoard();
    bitmaskBoard.load(board);

    // P=(0,0) -> {1, 2}
    bitmaskBoard.candidateMasks[0 * 9 + 0] = (1 << 0) | (1 << 1);
    // A=(0,5) -> {1, 3} (Pivot ile aynı satırda)
    bitmaskBoard.candidateMasks[0 * 9 + 5] = (1 << 0) | (1 << 2);
    // B=(5,0) -> {2, 3} (Pivot ile aynı sütunda)
    bitmaskBoard.candidateMasks[5 * 9 + 0] = (1 << 1) | (1 << 2);
    // C=(5,5) -> {3, 8} (A ve B'nin her ikisini de görür)
    bitmaskBoard.candidateMasks[5 * 9 + 5] = (1 << 2) | (1 << 7);

    const deduction = findXYWing(bitmaskBoard);
    expect(deduction).not.toBeNull();
    expect(deduction?.technique).toBe('xy_wing');
    expect(deduction?.digits.sort()).toEqual([1, 2, 3]);

    const targetElim = deduction?.targetEliminations.find(e => e.r === 5 && e.c === 5);
    expect(targetElim).toBeDefined();
    expect(targetElim?.eliminatedDigits).toEqual([3]);
  });

  it('6. findAdvancedTechnique Öncelik Sıralaması', () => {
    const emptyBoard = Array.from({ length: 9 }, () => new Array(9).fill(0));
    const result = findAdvancedTechnique(emptyBoard);
    expect(result).toBeNull();
  });
});
