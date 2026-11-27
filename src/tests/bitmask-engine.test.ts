import { describe, it, expect } from 'vitest';
import {
  ALL_CANDIDATES_MASK,
  countBits,
  digitToBit,
  bitToDigit,
  maskToDigits,
  digitsToMask,
  SudokuBitmaskBoard,
  getCandidatesBitmask
} from '../engine/bitmaskEngine';
import { getCandidates } from '../engine/hintSolver';

describe('Faz 1 - Adım 1.1: Bitmask Tabanlı Veri Odaklı Aday Hesaplayıcı (DOD Bitmask Candidate Engine)', () => {
  it('1. Temel Bit İşlemleri & Lookup Tabloları Doğrulaması', () => {
    expect(ALL_CANDIDATES_MASK).toBe(511);

    // 1..9 Rakamları bit karşılıkları
    for (let d = 1; d <= 9; d++) {
      const bit = digitToBit(d);
      expect(bit).toBe(1 << (d - 1));
      expect(bitToDigit(bit)).toBe(d);
    }

    // Geçersiz değerler
    expect(digitToBit(0)).toBe(0);
    expect(digitToBit(10)).toBe(0);
    expect(bitToDigit(0)).toBe(0);
    expect(bitToDigit(1024)).toBe(0);

    // Hamming Weight / Popcount Testleri
    expect(countBits(0)).toBe(0);
    expect(countBits(1)).toBe(1);
    expect(countBits(0b101)).toBe(2); // 1 ve 3 -> 2 bit
    expect(countBits(0b111111111)).toBe(9); // 511 -> 9 bit
  });

  it('2. Dizi <-> Maske Dönüşüm Bütünlüğü', () => {
    const originalDigits = [1, 4, 7, 9];
    const mask = digitsToMask(originalDigits);
    expect(countBits(mask)).toBe(4);

    const convertedDigits = maskToDigits(mask);
    expect(convertedDigits).toEqual(originalDigits);

    // Boş dizi
    expect(digitsToMask([])).toBe(0);
    expect(maskToDigits(0)).toEqual([]);

    // Tüm rakamlar (1..9)
    const allDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(digitsToMask(allDigits)).toBe(ALL_CANDIDATES_MASK);
    expect(maskToDigits(ALL_CANDIDATES_MASK)).toEqual(allDigits);
  });

  it('3. SudokuBitmaskBoard Tek Geçişli Yükleme & O(1) Aday Sorgulama', () => {
    const board = Array.from({ length: 9 }, () => new Array(9).fill(0));
    // 0. satıra 1..8 yerleştir -> (0, 8) hücresinde yalnızca 9 kalmalı
    for (let c = 0; c < 8; c++) {
      board[0][c] = c + 1;
    }

    const bitmaskBoard = new SudokuBitmaskBoard();
    bitmaskBoard.load(board);

    // (0, 8) hücresi tek aday (9) barındırmalı
    expect(bitmaskBoard.getCandidateCount(0, 8)).toBe(1);
    expect(bitmaskBoard.getCandidateMask(0, 8)).toBe(1 << 8); // 256
    expect(bitmaskBoard.getCandidates(0, 8)).toEqual([9]);

    // Dolu bir hücrenin aday sayısı 0 olmalı
    expect(bitmaskBoard.getCandidateCount(0, 0)).toBe(0);
    expect(bitmaskBoard.getCandidates(0, 0)).toEqual([]);

    // Boş bir tahtada hücrenin 9 adayı olmalı
    const emptyBoard = Array.from({ length: 9 }, () => new Array(9).fill(0));
    bitmaskBoard.load(emptyBoard);
    expect(bitmaskBoard.getCandidateCount(4, 4)).toBe(9);
    expect(bitmaskBoard.getCandidateMask(4, 4)).toBe(ALL_CANDIDATES_MASK);
    expect(bitmaskBoard.getCandidates(4, 4)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('4. Parçalı (Irregular) Sudoku ve Mühürlü Hücre Entegrasyonu', () => {
    const board = Array.from({ length: 9 }, () => new Array(9).fill(0));

    // Özel bölge haritası (tüm 0. sütun aynı bölge olsun: Bölge 0)
    const regionMap = Array.from({ length: 9 }, () => new Array(9).fill(1));
    for (let r = 0; r < 9; r++) {
      regionMap[r][0] = 0;
    }

    // (1, 0) hücresine 5 yerleştir
    board[1][0] = 5;

    const bitmaskBoard = new SudokuBitmaskBoard();
    bitmaskBoard.load(board, regionMap, [{ r: 8, c: 0 }]); // (8, 0) mühürlü

    // Bölge 0'daki (7, 0) hücresinde 5 adayı elenmiş olmalı
    const cands = bitmaskBoard.getCandidates(7, 0);
    expect(cands.includes(5)).toBe(false);

    // Mühürlü hücrenin adayı 0 olmalı
    expect(bitmaskBoard.getCandidateCount(8, 0)).toBe(0);
    expect(bitmaskBoard.getCandidates(8, 0)).toEqual([]);
  });

  it('5. hintSolver.getCandidates Geriye Dönük Birebir Uyumluluk', () => {
    const board = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    // (0, 2) hücresi için getCandidates ve getCandidatesBitmask aynı adayları vermeli
    const candsA = getCandidates(board, 0, 2);
    const candsB = getCandidatesBitmask(board, 0, 2);

    expect(candsA).toEqual(candsB);
    // (0, 2) hücresinde satırda [5,3,7], sütunda [8], kutuda [5,3,6,9,8] var. Kalanlar: 1, 2, 4
    expect(candsA).toEqual([1, 2, 4]);
  });

  it('6. Yüksek Performanslı İşlem Hızı Testi (10.000 Aday Sorgulama)', () => {
    const board = [
      [0, 2, 0, 6, 0, 8, 0, 0, 0],
      [5, 8, 0, 0, 0, 9, 7, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [3, 7, 0, 0, 0, 0, 5, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 0, 4],
      [0, 0, 8, 0, 0, 0, 0, 1, 3],
      [0, 0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 9, 8, 0, 0, 0, 3, 6],
      [0, 0, 0, 3, 0, 6, 0, 9, 0]
    ];

    const bitmaskBoard = new SudokuBitmaskBoard();
    bitmaskBoard.load(board);

    const start = performance.now();
    let totalMaskSum = 0;

    for (let iter = 0; iter < 10000; iter++) {
      const r = iter % 9;
      const c = (iter * 3) % 9;
      totalMaskSum += bitmaskBoard.getCandidateMask(r, c);
    }

    const elapsedMs = performance.now() - start;

    expect(totalMaskSum).toBeGreaterThan(0);
    // 10.000 O(1) bitmask sorgulaması 50ms'nin (genellikle <5ms) çok altında tamamlanmalıdır
    expect(elapsedMs).toBeLessThan(50);
  });
});
