/**
 * SudokuMap - Veri Odaklı (DOD) Bitmask Aday Hesaplayıcı ve Kural Çekirdeği
 * 9-bit tamsayı bitmaskleri kullanarak O(1) karmaşıklığında sıfır tahsisli (zero-allocation) aday hesaplar.
 */

export const ALL_CANDIDATES_MASK = 0x1ff; // 0b111111111 (1-9 arasındaki tüm adaylar)

// 0..511 arasındaki tüm bit kombinasyonları için önceden hesaplanmış bit sayısı tablosu (Hamming weight)
const POPCOUNT_TABLE: Uint8Array = new Uint8Array(512);
for (let i = 0; i < 512; i++) {
  let count = 0;
  let temp = i;
  while (temp > 0) {
    count += temp & 1;
    temp >>= 1;
  }
  POPCOUNT_TABLE[i] = count;
}

// 1..9 arasındaki rakamları bit değerine çeviren hızlı lookup
const DIGIT_TO_BIT_TABLE: Uint16Array = new Uint16Array([
  0,
  1 << 0, // 1 -> 1
  1 << 1, // 2 -> 2
  1 << 2, // 3 -> 4
  1 << 3, // 4 -> 8
  1 << 4, // 5 -> 16
  1 << 5, // 6 -> 32
  1 << 6, // 7 -> 64
  1 << 7, // 8 -> 128
  1 << 8  // 9 -> 256
]);

/**
 * 1..9 rakamını bit karşılığına çevirir (Örn: 1 -> 1, 2 -> 2, 9 -> 256)
 */
export function digitToBit(digit: number): number {
  if (digit >= 1 && digit <= 9) return DIGIT_TO_BIT_TABLE[digit];
  return 0;
}

/**
 * Tek bir biti rakama çevirir (Örn: 1 -> 1, 2 -> 2, 4 -> 3, ..., 256 -> 9)
 */
export function bitToDigit(bit: number): number {
  switch (bit) {
    case 1: return 1;
    case 2: return 2;
    case 4: return 3;
    case 8: return 4;
    case 16: return 5;
    case 32: return 6;
    case 64: return 7;
    case 128: return 8;
    case 256: return 9;
    default: return 0;
  }
}

/**
 * Bir bitmask içindeki 1 olan bit sayısını O(1) sürede döner.
 */
export function countBits(mask: number): number {
  return POPCOUNT_TABLE[mask & ALL_CANDIDATES_MASK];
}

/**
 * Bitmask'i diziye çevirir (Örn: 0b000000101 -> [1, 3])
 */
export function maskToDigits(mask: number): number[] {
  const digits: number[] = [];
  let m = mask & ALL_CANDIDATES_MASK;
  while (m > 0) {
    const lowestBit = m & -m;
    digits.push(bitToDigit(lowestBit));
    m ^= lowestBit;
  }
  return digits;
}

/**
 * Rakam dizisini tek bir bitmask değerine birleştirir
 */
export function digitsToMask(digits: number[]): number {
  let mask = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = digits[i];
    if (d >= 1 && d <= 9) {
      mask |= DIGIT_TO_BIT_TABLE[d];
    }
  }
  return mask;
}

/**
 * Sudoku tahtasının 81 hücresini ve ünitelerini (satır, sütun, bölge)
 * sıfır-tahsisli TypeArray yapısında tutan yüksek performanslı DOD durum yöneticisi.
 */
export class SudokuBitmaskBoard {
  // Ünite maskeleri: o ünitede halihazırda kullanılmış olan rakamların bitleri 1'dir.
  public readonly rowUsedMask: Uint16Array = new Uint16Array(9);
  public readonly colUsedMask: Uint16Array = new Uint16Array(9);
  public readonly boxUsedMask: Uint16Array = new Uint16Array(9);

  // 81 hücrelik durumlar (index = r * 9 + c)
  public readonly cellValues: Uint8Array = new Uint8Array(81);
  public readonly candidateMasks: Uint16Array = new Uint16Array(81);
  public readonly regionIndices: Uint8Array = new Uint8Array(81);
  public readonly sealedFlags: Uint8Array = new Uint8Array(81);

  constructor() {
    // Varsayılan standart 3x3 kutu bölgelerini başlat
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.regionIndices[r * 9 + c] = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      }
    }
  }

  /**
   * Tahtayı tek geçişte (single-pass) parse eder ve bitmaskleri inşa eder.
   */
  public load(
    board: number[][],
    regionMap?: number[][],
    sealedCells?: { r: number; c: number }[]
  ): void {
    this.rowUsedMask.fill(0);
    this.colUsedMask.fill(0);
    this.boxUsedMask.fill(0);
    this.cellValues.fill(0);
    this.candidateMasks.fill(0);
    this.sealedFlags.fill(0);

    // Mühürlü hücreleri işaretle
    if (sealedCells && sealedCells.length > 0) {
      for (let i = 0; i < sealedCells.length; i++) {
        const sc = sealedCells[i];
        if (sc.r >= 0 && sc.r < 9 && sc.c >= 0 && sc.c < 9) {
          this.sealedFlags[sc.r * 9 + sc.c] = 1;
        }
      }
    }

    // Özel bölge haritası (Irregular vb.) varsa aktar
    if (regionMap && regionMap.length === 9) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          this.regionIndices[r * 9 + c] = regionMap[r][c];
        }
      }
    } else {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          this.regionIndices[r * 9 + c] = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        }
      }
    }

    // 1. Geçiş: Dolu hücreleri oku ve satır/sütun/bölge maskelerine ekle
    for (let r = 0; r < 9; r++) {
      const row = board[r];
      if (!row) continue;
      for (let c = 0; c < 9; c++) {
        const val = row[c];
        const idx = r * 9 + c;
        if (val >= 1 && val <= 9) {
          this.cellValues[idx] = val;
          const bit = DIGIT_TO_BIT_TABLE[val];
          this.rowUsedMask[r] |= bit;
          this.colUsedMask[c] |= bit;
          this.boxUsedMask[this.regionIndices[idx]] |= bit;
        }
      }
    }

    // 2. Geçiş: Boş hücrelerin aday maskelerini O(1) bitwise işlemlerle hesapla
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const idx = r * 9 + c;
        if (this.cellValues[idx] === 0 && this.sealedFlags[idx] === 0) {
          const used = this.rowUsedMask[r] | this.colUsedMask[c] | this.boxUsedMask[this.regionIndices[idx]];
          this.candidateMasks[idx] = ALL_CANDIDATES_MASK & ~used;
        }
      }
    }
  }

  /**
   * r, c hücresinin aday maskesini O(1) döner.
   */
  public getCandidateMask(r: number, c: number): number {
    return this.candidateMasks[r * 9 + c];
  }

  /**
   * r, c hücresinin kalan aday sayısını O(1) döner.
   */
  public getCandidateCount(r: number, c: number): number {
    return POPCOUNT_TABLE[this.candidateMasks[r * 9 + c]];
  }

  /**
   * r, c hücresinin aday listesini dizi olarak döner.
   */
  public getCandidates(r: number, c: number): number[] {
    const idx = r * 9 + c;
    if (this.cellValues[idx] !== 0 || this.sealedFlags[idx] !== 0) {
      return [];
    }
    return maskToDigits(this.candidateMasks[idx]);
  }
}

// Global yeniden kullanılabilir bitmask nesnesi (Zero GC pressure)
const SHARED_BITMASK_BOARD = new SudokuBitmaskBoard();

/**
 * Verilen tahta için tek bir hücrenin adaylarını bitmask motoruyla hesaplar.
 * hintSolver ve boardMechanics ile %100 geriye dönük uyumludur.
 */
export function getCandidatesBitmask(
  board: number[][],
  r: number,
  c: number,
  regionMap?: number[][],
  sealedCells?: { r: number; c: number }[]
): number[] {
  if (!board || !board[r] || board[r][c] !== 0) return [];
  SHARED_BITMASK_BOARD.load(board, regionMap, sealedCells);
  return SHARED_BITMASK_BOARD.getCandidates(r, c);
}
