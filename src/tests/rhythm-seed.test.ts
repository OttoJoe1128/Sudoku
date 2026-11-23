import { describe, it, expect } from 'vitest';
import { hashSeed, createSeededRng, seededShuffle } from '../engine/seededRandom';
import { REGIONS, getRegionForLevel, getLevelConfig } from '../engine/rhythmConfig';
import { SudokuGen, SudokuVariant } from '../engine/sudoku';

describe('Faz 2.5a Deterministik Seed & 1.000 Bölüm Ritim Motoru Test Paketi', () => {
  describe('1. Müfredat & Bölge Bütünlüğü', () => {
    it('REGIONS tam 20 bölge olmalı ve 1..1000 arası kesintisiz örtüşmeli', () => {
      expect(REGIONS.length).toBe(20);

      for (let i = 0; i < REGIONS.length; i++) {
        const current = REGIONS[i];
        expect(current.id).toBe(i + 1);

        if (i === 0) {
          expect(current.startLevel).toBe(1);
        } else {
          const prev = REGIONS[i - 1];
          expect(current.startLevel).toBe(prev.endLevel + 1);
        }
      }

      expect(REGIONS[REGIONS.length - 1].endLevel).toBe(1000);
    });

    it('Kilit seviyeler doğru biyom ve zorlukta dönmeli', () => {
      expect(getRegionForLevel(1).biome).toBe('emerald');
      expect(getRegionForLevel(1).difficulty).toBe('basit');

      expect(getRegionForLevel(300).biome).toBe('emerald');
      expect(getRegionForLevel(300).difficulty).toBe('basit');

      expect(getRegionForLevel(301).biome).toBe('hextech');
      expect(getRegionForLevel(301).difficulty).toBe('orta');

      expect(getRegionForLevel(700).biome).toBe('hextech');
      expect(getRegionForLevel(700).difficulty).toBe('orta');

      expect(getRegionForLevel(701).biome).toBe('crimson');
      expect(getRegionForLevel(701).difficulty).toBe('zor');

      expect(getRegionForLevel(1000).biome).toBe('crimson');
      expect(getRegionForLevel(1000).difficulty).toBe('zor');
    });
  });

  describe('2. 10\'lu Ritim Döngüsü', () => {
    it('Seviye 1..10 ritim fazları ve ipucu/ödül çarpanları doğru tanımlanmalı', () => {
      const c1 = getLevelConfig(1);
      expect(c1.rhythmPhase).toBe('warmup');
      expect(c1.rewardMultiplier).toBe(1.0);

      const c4 = getLevelConfig(4);
      expect(c4.rhythmPhase).toBe('balance');
      expect(c4.rewardMultiplier).toBe(1.0);

      const c7 = getLevelConfig(7);
      expect(c7.rhythmPhase).toBe('tension');
      expect(c7.rewardMultiplier).toBe(1.2);

      const c9 = getLevelConfig(9);
      expect(c9.rhythmPhase).toBe('sprint');
      expect(c9.rewardMultiplier).toBe(1.0);

      const c10 = getLevelConfig(10);
      expect(c10.rhythmPhase).toBe('milestone');
      expect(c10.isMilestone).toBe(true);
      expect(c10.isRegionGuardian).toBe(false);
      expect(c10.rewardMultiplier).toBe(2.0);
    });

    it('Seviye 50, 100 ve 1000 Region Guardian olarak işaretlenmeli ve 2.5x ödül çarpanı almalı', () => {
      const c50 = getLevelConfig(50);
      expect(c50.rhythmPhase).toBe('guardian');
      expect(c50.isRegionGuardian).toBe(true);
      expect(c50.isMilestone).toBe(true);
      expect(c50.rewardMultiplier).toBe(2.5);

      const c100 = getLevelConfig(100);
      expect(c100.rhythmPhase).toBe('guardian');
      expect(c100.isRegionGuardian).toBe(true);

      const c1000 = getLevelConfig(1000);
      expect(c1000.rhythmPhase).toBe('guardian');
      expect(c1000.isRegionGuardian).toBe(true);
      expect(c1000.rewardMultiplier).toBe(2.5);
    });
  });

  describe('3. %100 Determinizm (5 Varyant)', () => {
    it('Her 5 varyant için aynı seviye üretimi iki kez çağrıldığında derinlemesine birebir eşit olmalı', () => {
      const variants: SudokuVariant[] = ['classic', 'wordoku', 'irregular', 'killer', 'samurai'];

      variants.forEach(v => {
        const gen1 = SudokuGen.generateForLevel(47, v);
        const gen2 = SudokuGen.generateForLevel(47, v);

        expect(gen1.puzzle).toEqual(gen2.puzzle);
        expect(gen1.solution).toEqual(gen2.solution);

        if (v === 'irregular') {
          expect(gen1.regionMap).toEqual(gen2.regionMap);
        }
        if (v === 'killer') {
          expect(gen1.cages).toEqual(gen2.cages);
        }
        if (v === 'samurai') {
          expect(gen1.samuraiGrids).toEqual(gen2.samuraiGrids);
        }
      });
    });
  });

  describe('4. Seviye/Varyant Ayrımı', () => {
    it('Seviye 47 ve Seviye 48 üretimi farklı bulmacalar oluşturmalı', () => {
      const gen47 = SudokuGen.generateForLevel(47, 'classic');
      const gen48 = SudokuGen.generateForLevel(48, 'classic');

      expect(gen47.puzzle).not.toEqual(gen48.puzzle);
      expect(gen47.rhythmConfig.seedKey).not.toEqual(gen48.rhythmConfig.seedKey);
    });
  });

  describe('5. Çapraz Seviye Geçerlilik', () => {
    it('Örnek seviyelerde üretilen çözümlerin satır, sütun ve 3x3 kutuları %100 geçerli Sudoku olmalı', () => {
      const sampleLevels = [1, 10, 50, 301, 500, 701, 1000];

      sampleLevels.forEach(lvl => {
        const gen = SudokuGen.generateForLevel(lvl, 'classic');
        const sol = gen.solution;

        // Satır kontrolü
        sol.forEach(row => {
          const set = new Set(row);
          expect(set.size).toBe(9);
          expect(set.has(0)).toBe(false);
        });

        // Sütun kontrolü
        for (let c = 0; c < 9; c++) {
          const col = sol.map(row => row[c]);
          const set = new Set(col);
          expect(set.size).toBe(9);
        }

        // 3x3 Kutu kontrolü
        for (let boxR = 0; boxR < 3; boxR++) {
          for (let boxC = 0; boxC < 3; boxC++) {
            const boxVals: number[] = [];
            for (let r = 0; r < 3; r++) {
              for (let c = 0; c < 3; c++) {
                boxVals.push(sol[boxR * 3 + r][boxC * 3 + c]);
              }
            }
            const set = new Set(boxVals);
            expect(set.size).toBe(9);
          }
        }
      });
    });
  });
});
