/**
 * SudokuMap - İleri Seviye Mantık Algoritmaları Motoru
 * Naked Pair, Hidden Pair, X-Wing, Swordfish ve XY-Wing tekniklerini
 * bitmask tabanlı veri düzeni üzerinden O(1) hızında tespit eder.
 */

import {
  SudokuBitmaskBoard,
  ALL_CANDIDATES_MASK,
  countBits,
  digitToBit,
  bitToDigit,
  maskToDigits
} from './bitmaskEngine';

export type AdvancedTechniqueType =
  | 'naked_pair'
  | 'hidden_pair'
  | 'x_wing'
  | 'swordfish'
  | 'xy_wing';

export interface AdvancedDeduction {
  technique: AdvancedTechniqueType;
  digits: number[];
  primaryCells: { r: number; c: number }[];
  targetEliminations: { r: number; c: number; eliminatedDigits: number[] }[];
  unitType?: 'row' | 'col' | 'box';
  unitIndices?: number[];
  explanation: {
    tr: string;
    en: string;
  };
}

/**
 * İki hücrenin birbirini görüp görmediğini (aynı satır, sütun veya kutuda olup olmadığını) kontrol eder.
 */
function cellsSeeEachOther(r1: number, c1: number, r2: number, c2: number): boolean {
  if (r1 === r2 && c1 === c2) return false;
  if (r1 === r2 || c1 === c2) return true;
  return Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);
}

/**
 * Naked Pair (Çıplak İkili):
 * Bir ünitede (satır, sütun, kutu) tam olarak aynı 2 adaya sahip 2 hücre varsa,
 * bu 2 aday o ünitedeki diğer tüm hücrelerden elenebilir.
 */
export function findNakedPair(board: SudokuBitmaskBoard): AdvancedDeduction | null {
  const checkUnit = (cells: { r: number; c: number }[], unitType: 'row' | 'col' | 'box', unitIdx: number): AdvancedDeduction | null => {
    // 2 adayı olan hücreleri topla
    const pairCandidates: { r: number; c: number; mask: number }[] = [];
    for (const cell of cells) {
      if (board.getCandidateCount(cell.r, cell.c) === 2) {
        pairCandidates.push({ r: cell.r, c: cell.c, mask: board.getCandidateMask(cell.r, cell.c) });
      }
    }

    for (let i = 0; i < pairCandidates.length; i++) {
      for (let j = i + 1; j < pairCandidates.length; j++) {
        const c1 = pairCandidates[i];
        const c2 = pairCandidates[j];

        if (c1.mask === c2.mask) {
          const digits = maskToDigits(c1.mask);
          const eliminations: { r: number; c: number; eliminatedDigits: number[] }[] = [];

          for (const other of cells) {
            if ((other.r === c1.r && other.c === c1.c) || (other.r === c2.r && other.c === c2.c)) continue;
            const otherMask = board.getCandidateMask(other.r, other.c);
            const common = otherMask & c1.mask;
            if (common > 0) {
              eliminations.push({
                r: other.r,
                c: other.c,
                eliminatedDigits: maskToDigits(common)
              });
            }
          }

          if (eliminations.length > 0) {
            return {
              technique: 'naked_pair',
              digits,
              primaryCells: [{ r: c1.r, c: c1.c }, { r: c2.r, c: c2.c }],
              targetEliminations: eliminations,
              unitType,
              unitIndices: [unitIdx],
              explanation: {
                tr: `Hücreler [${c1.r + 1},${c1.c + 1}] ve [${c2.r + 1},${c2.c + 1}] yalnızca {${digits.join(',')}} adaylarını içeriyor. Bu rakamlar aynı gruptaki diğer hücrelerden elenir.`,
                en: `Cells [${c1.r + 1},${c1.c + 1}] and [${c2.r + 1},${c2.c + 1}] exclusively share candidates {${digits.join(',')}}, eliminating them from peers.`
              }
            };
          }
        }
      }
    }
    return null;
  };

  // 1. Satırlar
  for (let r = 0; r < 9; r++) {
    const cells = Array.from({ length: 9 }, (_, c) => ({ r, c }));
    const res = checkUnit(cells, 'row', r);
    if (res) return res;
  }

  // 2. Sütunlar
  for (let c = 0; c < 9; c++) {
    const cells = Array.from({ length: 9 }, (_, r) => ({ r, c }));
    const res = checkUnit(cells, 'col', c);
    if (res) return res;
  }

  // 3. Kutular
  for (let b = 0; b < 9; b++) {
    const cells: { r: number; c: number }[] = [];
    const boxR = Math.floor(b / 3) * 3;
    const boxC = (b % 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        cells.push({ r: boxR + r, c: boxC + c });
      }
    }
    const res = checkUnit(cells, 'box', b);

    if (res) return res;
  }

  return null;
}

/**
 * Hidden Pair (Gizli İkili):
 * Bir ünitede 2 özel rakam sadece ve sadece aynı 2 hücrede yer alıyorsa,
 * o 2 hücredeki diğer tüm adaylar elenebilir.
 */
export function findHiddenPair(board: SudokuBitmaskBoard): AdvancedDeduction | null {
  const checkUnit = (cells: { r: number; c: number }[], unitType: 'row' | 'col' | 'box', unitIdx: number): AdvancedDeduction | null => {
    // 1..9 arasındaki her rakam için hangi hücrelerde bulunduğunu listele
    const digitCells: { [digit: number]: { r: number; c: number }[] } = {};
    for (let d = 1; d <= 9; d++) {
      digitCells[d] = [];
      const bit = digitToBit(d);
      for (const cell of cells) {
        if ((board.getCandidateMask(cell.r, cell.c) & bit) !== 0) {
          digitCells[d].push(cell);
        }
      }
    }

    // Tam olarak 2 hücrede beliren rakamları eşleştir
    for (let d1 = 1; d1 <= 8; d1++) {
      if (digitCells[d1].length !== 2) continue;
      for (let d2 = d1 + 1; d2 <= 9; d2++) {
        if (digitCells[d2].length !== 2) continue;

        const [c1a, c1b] = digitCells[d1];
        const [c2a, c2b] = digitCells[d2];

        if (c1a.r === c2a.r && c1a.c === c2a.c && c1b.r === c2b.r && c1b.c === c2b.c) {
          // Bu iki hücrede d1 ve d2 harici başka aday var mı?
          const keepMask = digitToBit(d1) | digitToBit(d2);
          const elim1 = board.getCandidateMask(c1a.r, c1a.c) & ~keepMask;
          const elim2 = board.getCandidateMask(c1b.r, c1b.c) & ~keepMask;

          if (elim1 > 0 || elim2 > 0) {
            const eliminations: { r: number; c: number; eliminatedDigits: number[] }[] = [];
            if (elim1 > 0) {
              eliminations.push({ r: c1a.r, c: c1a.c, eliminatedDigits: maskToDigits(elim1) });
            }
            if (elim2 > 0) {
              eliminations.push({ r: c1b.r, c: c1b.c, eliminatedDigits: maskToDigits(elim2) });
            }

            return {
              technique: 'hidden_pair',
              digits: [d1, d2],
              primaryCells: [c1a, c1b],
              targetEliminations: eliminations,
              unitType,
              unitIndices: [unitIdx],
              explanation: {
                tr: `{${d1},${d2}} rakamları bu grupta yalnızca [${c1a.r + 1},${c1a.c + 1}] ve [${c1b.r + 1},${c1b.c + 1}] hücrelerinde bulunabilir. Diğer adaylar silinir.`,
                en: `Digits {${d1},${d2}} occur exclusively in cells [${c1a.r + 1},${c1a.c + 1}] and [${c1b.r + 1},${c1b.c + 1}]. Other candidates in these cells are eliminated.`
              }
            };
          }
        }
      }
    }
    return null;
  };

  // 1. Satırlar
  for (let r = 0; r < 9; r++) {
    const res = checkUnit(Array.from({ length: 9 }, (_, c) => ({ r, c })), 'row', r);
    if (res) return res;
  }

  // 2. Sütunlar
  for (let c = 0; c < 9; c++) {
    const res = checkUnit(Array.from({ length: 9 }, (_, r) => ({ r, c })), 'col', c);
    if (res) return res;
  }

  // 3. Kutular
  for (let b = 0; b < 9; b++) {
    const cells: { r: number; c: number }[] = [];
    const boxR = Math.floor(b / 3) * 3;
    const boxC = (b % 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        cells.push({ r: boxR + r, c: boxC + c });
      }
    }
    const res = checkUnit(cells, 'box', b);
    if (res) return res;
  }

  return null;
}

/**
 * X-Wing (X-Kanadı):
 * Belirli bir d rakamı 2 farklı satırda tam olarak aynı 2 sütunda belirirse,
 * bu iki sütundaki diğer tüm satırlardan d rakamı elenir (veya sütundan satıra).
 */
export function findXWing(board: SudokuBitmaskBoard): AdvancedDeduction | null {
  // 1. Satır Odaklı X-Wing
  for (let d = 1; d <= 9; d++) {
    const bit = digitToBit(d);
    const rowCandCols: { r: number; cols: [number, number] }[] = [];

    for (let r = 0; r < 9; r++) {
      const cols: number[] = [];
      for (let c = 0; c < 9; c++) {
        if ((board.getCandidateMask(r, c) & bit) !== 0) {
          cols.push(c);
        }
      }
      if (cols.length === 2) {
        rowCandCols.push({ r, cols: [cols[0], cols[1]] });
      }
    }

    for (let i = 0; i < rowCandCols.length; i++) {
      for (let j = i + 1; j < rowCandCols.length; j++) {
        const r1 = rowCandCols[i];
        const r2 = rowCandCols[j];

        if (r1.cols[0] === r2.cols[0] && r1.cols[1] === r2.cols[1]) {
          const [c1, c2] = r1.cols;
          const eliminations: { r: number; c: number; eliminatedDigits: number[] }[] = [];

          for (let r = 0; r < 9; r++) {
            if (r === r1.r || r === r2.r) continue;
            if ((board.getCandidateMask(r, c1) & bit) !== 0) {
              eliminations.push({ r, c: c1, eliminatedDigits: [d] });
            }
            if ((board.getCandidateMask(r, c2) & bit) !== 0) {
              eliminations.push({ r, c: c2, eliminatedDigits: [d] });
            }
          }

          if (eliminations.length > 0) {
            return {
              technique: 'x_wing',
              digits: [d],
              primaryCells: [
                { r: r1.r, c: c1 }, { r: r1.r, c: c2 },
                { r: r2.r, c: c1 }, { r: r2.r, c: c2 }
              ],
              targetEliminations: eliminations,
              unitType: 'row',
              unitIndices: [r1.r, r2.r],
              explanation: {
                tr: `${d} rakamı [Satır ${r1.r + 1} ve ${r2.r + 1}] üzerinde [Sütun ${c1 + 1} ve ${c2 + 1}] noktalarında X-Wing oluşturuyor. Bu sütunlardaki diğer hücrelerden ${d} elenir.`,
                en: `Digit ${d} forms an X-Wing across rows ${r1.r + 1},${r2.r + 1} and cols ${c1 + 1},${c2 + 1}. Eliminating ${d} from remaining column cells.`
              }
            };
          }
        }
      }
    }
  }

  // 2. Sütun Odaklı X-Wing
  for (let d = 1; d <= 9; d++) {
    const bit = digitToBit(d);
    const colCandRows: { c: number; rows: [number, number] }[] = [];

    for (let c = 0; c < 9; c++) {
      const rows: number[] = [];
      for (let r = 0; r < 9; r++) {
        if ((board.getCandidateMask(r, c) & bit) !== 0) {
          rows.push(r);
        }
      }
      if (rows.length === 2) {
        colCandRows.push({ c, rows: [rows[0], rows[1]] });
      }
    }

    for (let i = 0; i < colCandRows.length; i++) {
      for (let j = i + 1; j < colCandRows.length; j++) {
        const c1 = colCandRows[i];
        const c2 = colCandRows[j];

        if (c1.rows[0] === c2.rows[0] && c1.rows[1] === c2.rows[1]) {
          const [r1, r2] = c1.rows;
          const eliminations: { r: number; c: number; eliminatedDigits: number[] }[] = [];

          for (let c = 0; c < 9; c++) {
            if (c === c1.c || c === c2.c) continue;
            if ((board.getCandidateMask(r1, c) & bit) !== 0) {
              eliminations.push({ r: r1, c, eliminatedDigits: [d] });
            }
            if ((board.getCandidateMask(r2, c) & bit) !== 0) {
              eliminations.push({ r: r2, c, eliminatedDigits: [d] });
            }
          }

          if (eliminations.length > 0) {
            return {
              technique: 'x_wing',
              digits: [d],
              primaryCells: [
                { r: r1, c: c1.c }, { r: r1, c: c2.c },
                { r: r2, c: c1.c }, { r: r2, c: c2.c }
              ],
              targetEliminations: eliminations,
              unitType: 'col',
              unitIndices: [c1.c, c2.c],
              explanation: {
                tr: `${d} rakamı [Sütun ${c1.c + 1} ve ${c2.c + 1}] üzerinde [Satır ${r1 + 1} ve ${r2 + 1}] noktalarında dikey X-Wing oluşturuyor.`,
                en: `Digit ${d} forms a vertical X-Wing in columns ${c1.c + 1},${c2.c + 1} across rows ${r1 + 1},${r2 + 1}.`
              }
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Swordfish (Kılıçbalığı):
 * Bir d rakamı 3 farklı satırda belirdiğinde bu adayların tüm sütunları
 * toplam 3 sütunluk bir küme (c1, c2, c3) oluşturuyorsa, bu 3 sütunun diğer
 * satırlarındaki d adayları elenir (veya sütundan satıra).
 */
export function findSwordfish(board: SudokuBitmaskBoard): AdvancedDeduction | null {
  for (let d = 1; d <= 9; d++) {
    const bit = digitToBit(d);
    const rowCandCols: { r: number; cols: number[]; mask: number }[] = [];

    for (let r = 0; r < 9; r++) {
      const cols: number[] = [];
      let rowMask = 0;
      for (let c = 0; c < 9; c++) {
        if ((board.getCandidateMask(r, c) & bit) !== 0) {
          cols.push(c);
          rowMask |= 1 << c;
        }
      }
      if (cols.length >= 2 && cols.length <= 3) {
        rowCandCols.push({ r, cols, mask: rowMask });
      }
    }

    if (rowCandCols.length < 3) continue;

    for (let i = 0; i < rowCandCols.length - 2; i++) {
      for (let j = i + 1; j < rowCandCols.length - 1; j++) {
        for (let k = j + 1; k < rowCandCols.length; k++) {
          const r1 = rowCandCols[i];
          const r2 = rowCandCols[j];
          const r3 = rowCandCols[k];

          const unionMask = r1.mask | r2.mask | r3.mask;
          if (countBits(unionMask) === 3) {
            const cols = maskToDigits(unionMask).map(digit => digit - 1);
            const eliminations: { r: number; c: number; eliminatedDigits: number[] }[] = [];
            const primaryCells: { r: number; c: number }[] = [];

            [r1, r2, r3].forEach(rowItem => {
              rowItem.cols.forEach(col => primaryCells.push({ r: rowItem.r, c: col }));
            });

            for (let r = 0; r < 9; r++) {
              if (r === r1.r || r === r2.r || r === r3.r) continue;
              cols.forEach(c => {
                if ((board.getCandidateMask(r, c) & bit) !== 0) {
                  eliminations.push({ r, c, eliminatedDigits: [d] });
                }
              });
            }

            if (eliminations.length > 0) {
              return {
                technique: 'swordfish',
                digits: [d],
                primaryCells,
                targetEliminations: eliminations,
                unitType: 'row',
                unitIndices: [r1.r, r2.r, r3.r],
                explanation: {
                  tr: `${d} rakamı [Satır ${r1.r + 1}, ${r2.r + 1}, ${r3.r + 1}] üzerinde [Sütun ${cols.map(c => c + 1).join(',')}] koordinatlarında Swordfish oluşturuyor.`,
                  en: `Digit ${d} forms a Swordfish across rows [${r1.r + 1}, ${r2.r + 1}, ${r3.r + 1}] and cols [${cols.map(c => c + 1).join(',')}].`
                }
              };
            }
          }
        }
      }
    }
  }

  return null;
}

/**
 * XY-Wing (Y-Wing):
 * Bir pivot hücre (X, Y) ve bu pivotu gören iki kanat hücre (X, Z) ve (Y, Z) bulunduğunda;
 * her iki kanat hücresini de ortak gören tüm hücrelerden Z adayı silinir.
 */
export function findXYWing(board: SudokuBitmaskBoard): AdvancedDeduction | null {
  // Tam olarak 2 adayı olan tüm hücreleri listele (bi-value cells)
  const biValueCells: { r: number; c: number; mask: number; d1: number; d2: number }[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board.getCandidateCount(r, c) === 2) {
        const mask = board.getCandidateMask(r, c);
        const digits = maskToDigits(mask);
        biValueCells.push({ r, c, mask, d1: digits[0], d2: digits[1] });
      }
    }
  }

  for (let p = 0; p < biValueCells.length; p++) {
    const pivot = biValueCells[p];
    const x = pivot.d1;
    const y = pivot.d2;

    // Pivotu gören potansiyel kanatları bul
    const wings: { r: number; c: number; mask: number; sharedDigit: number; otherDigit: number }[] = [];
    for (let w = 0; w < biValueCells.length; w++) {
      if (w === p) continue;
      const wing = biValueCells[w];
      if (cellsSeeEachOther(pivot.r, pivot.c, wing.r, wing.c)) {
        if (wing.d1 === x || wing.d2 === x) {
          const other = wing.d1 === x ? wing.d2 : wing.d1;
          if (other !== y) wings.push({ r: wing.r, c: wing.c, mask: wing.mask, sharedDigit: x, otherDigit: other });
        } else if (wing.d1 === y || wing.d2 === y) {
          const other = wing.d1 === y ? wing.d2 : wing.d1;
          if (other !== x) wings.push({ r: wing.r, c: wing.c, mask: wing.mask, sharedDigit: y, otherDigit: other });
        }
      }
    }

    // İki kanat eşleştir (biri X paylaşıp Z içermeli, diğeri Y paylaşıp aynı Z'yi içermeli)
    for (let i = 0; i < wings.length; i++) {
      for (let j = i + 1; j < wings.length; j++) {
        const w1 = wings[i];
        const w2 = wings[j];

        if (w1.sharedDigit !== w2.sharedDigit && w1.otherDigit === w2.otherDigit) {
          const z = w1.otherDigit;
          const zBit = digitToBit(z);
          const eliminations: { r: number; c: number; eliminatedDigits: number[] }[] = [];

          // w1 ve w2'nin her ikisini de gören boş hücreleri tara
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              if ((r === pivot.r && c === pivot.c) || (r === w1.r && c === w1.c) || (r === w2.r && c === w2.c)) continue;
              if (cellsSeeEachOther(r, c, w1.r, w1.c) && cellsSeeEachOther(r, c, w2.r, w2.c)) {
                if ((board.getCandidateMask(r, c) & zBit) !== 0) {
                  eliminations.push({ r, c, eliminatedDigits: [z] });
                }
              }
            }
          }

          if (eliminations.length > 0) {
            return {
              technique: 'xy_wing',
              digits: [x, y, z],
              primaryCells: [
                { r: pivot.r, c: pivot.c },
                { r: w1.r, c: w1.c },
                { r: w2.r, c: w2.c }
              ],
              targetEliminations: eliminations,
              explanation: {
                tr: `Pivot [${pivot.r + 1},${pivot.c + 1}] ve kanatlar [${w1.r + 1},${w1.c + 1}], [${w2.r + 1},${w2.c + 1}] bir XY-Wing oluşturuyor. Ortak kesişimdeki hücrelerden ${z} elenir.`,
                en: `Pivot [${pivot.r + 1},${pivot.c + 1}] with wings [${w1.r + 1},${w1.c + 1}] and [${w2.r + 1},${w2.c + 1}] forms an XY-Wing, eliminating ${z} from shared peers.`
              }
            };
          }
        }
      }
    }
  }

  return null;
}

const ADVANCED_SHARED_BOARD = new SudokuBitmaskBoard();

/**
 * Verilen tahta durumunu analiz ederek mantıksal öncelik sırasına göre
 * ileri düzey bir teknik ve eleme döner.
 */
export function findAdvancedTechnique(
  board: number[][],
  regionMap?: number[][],
  sealedCells?: { r: number; c: number }[]
): AdvancedDeduction | null {
  if (!board) return null;
  ADVANCED_SHARED_BOARD.load(board, regionMap, sealedCells);

  // 1. Naked Pair
  const nakedPair = findNakedPair(ADVANCED_SHARED_BOARD);
  if (nakedPair) return nakedPair;

  // 2. Hidden Pair
  const hiddenPair = findHiddenPair(ADVANCED_SHARED_BOARD);
  if (hiddenPair) return hiddenPair;

  // 3. X-Wing
  const xWing = findXWing(ADVANCED_SHARED_BOARD);
  if (xWing) return xWing;

  // 4. XY-Wing
  const xyWing = findXYWing(ADVANCED_SHARED_BOARD);
  if (xyWing) return xyWing;

  // 5. Swordfish
  const swordfish = findSwordfish(ADVANCED_SHARED_BOARD);
  if (swordfish) return swordfish;

  return null;
}



