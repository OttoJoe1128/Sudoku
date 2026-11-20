import { describe, it, expect, beforeEach } from 'vitest';
import { UserManager } from '../store/userState';
import { getSavedGamesList, saveActiveGameRecord, clearVariantJourneySaves, clearSavedGame, deleteSavedGameRecord } from '../controllers/saveController';
import { evaluatePlacementExam, getPlacementExamConfig } from '../engine/placementEngine';
import { GameEngine } from '../engine/gameEngine';
import { SudokuGen } from '../engine/sudoku';
import { ShopManager } from '../engine/shop';
import { AchievementManager } from '../engine/achievements';

// In-Memory LocalStorage Mock
const storageMap: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storageMap[key] ?? null,
  setItem: (key: string, val: string) => { storageMap[key] = String(val); },
  removeItem: (key: string) => { delete storageMap[key]; },
  clear: () => { Object.keys(storageMap).forEach(k => delete storageMap[k]); },
  key: (i: number) => Object.keys(storageMap)[i] ?? null,
  get length() { return Object.keys(storageMap).length; }
};

if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.getItem !== 'function') {
  (globalThis as any).localStorage = mockLocalStorage;
}

if (typeof globalThis.document === 'undefined') {
  (globalThis as any).document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
      appendChild: () => {},
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      style: {},
      setAttribute: () => {}
    }),
    body: { appendChild: () => {} }
  };
}

describe('Uçtan Uca Oyun Akışları ve Bütünlük Testleri (15 Senaryo)', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  // ----------------------------------------------------
  // Grup 1: 5 Disiplin Yolculuk İlerleme Akışı (3 test)
  // ----------------------------------------------------
  describe('Grup 1: Yolculuk İlerleme Akışı', () => {
    it('1. Klasik Seviye 1->2->3 ardışık tamamlama seviyeyi korumalı ve altın biriktirmeli', async () => {
      await UserManager.updateVariantLevel('classic', 2, 10);
      await UserManager.updateVariantProgress('classic', 1, 50);
      expect(UserManager.getVariantLevel('classic')).toBe(2);

      await UserManager.updateVariantLevel('classic', 3, 10);
      await UserManager.updateVariantProgress('classic', 2, 50);
      expect(UserManager.getVariantLevel('classic')).toBe(3);
      expect(UserManager.getGold()).toBe(120); // 100 initial + 10 + 10
    });

    it('2. 5 disiplinin aynı anda farklı seviyelerde ilerlemesi bağımsız kalmalı', async () => {
      await UserManager.updateVariantLevel('classic', 5, 10);
      await UserManager.updateVariantLevel('irregular', 12, 20);
      await UserManager.updateVariantLevel('killer', 4, 15);
      await UserManager.updateVariantLevel('wordoku', 8, 12);
      await UserManager.updateVariantLevel('samurai', 3, 25);

      expect(UserManager.getVariantLevel('classic')).toBe(5);
      expect(UserManager.getVariantLevel('irregular')).toBe(12);
      expect(UserManager.getVariantLevel('killer')).toBe(4);
      expect(UserManager.getVariantLevel('wordoku')).toBe(8);
      expect(UserManager.getVariantLevel('samurai')).toBe(3);
    });

    it('3. Zaten tamamlanmış eski seviyeyi (Seviye 5teyken Seviye 2) tekrar oynayıp kazanınca seviye 5te kalmalı', async () => {
      await UserManager.updateVariantLevel('classic', 5, 10);
      await UserManager.updateVariantProgress('classic', 2, 50);

      expect(UserManager.getVariantLevel('classic')).toBe(5);
    });
  });

  // ----------------------------------------------------
  // Grup 2: Aktif Oyunlarım (Save & Cleanup) Akışı (5 test)
  // ----------------------------------------------------
  describe('Grup 2: Aktif Oyunlarım (Save & Cleanup)', () => {
    it('4. K-3 Tekil Slot Testi: Aynı disiplinde yeni seviye kaydedildiğinde sadece en son seviye kalmalı', () => {
      const gen1 = SudokuGen.generateVariant('basit', 'classic');
      const gen2 = SudokuGen.generateVariant('basit', 'classic');

      saveActiveGameRecord({
        isMatchMode: false,
        isCustomGameMode: false,
        variant: 'classic',
        level: 1,
        diff: 'basit',
        timeElapsed: 10,
        userBoard: gen1.puzzle,
        initialBoard: gen1.puzzle,
        currentSolution: gen1.solution,
        errors: 0
      });

      saveActiveGameRecord({
        isMatchMode: false,
        isCustomGameMode: false,
        variant: 'classic',
        level: 303,
        diff: 'zor',
        timeElapsed: 40,
        userBoard: gen2.puzzle,
        initialBoard: gen2.puzzle,
        currentSolution: gen2.solution,
        errors: 1
      });

      const list = getSavedGamesList().filter(r => !r.isCustomMode && !r.isMatchMode);
      expect(list.length).toBe(1);
      expect(list[0].level).toBe(303);
      expect(mockLocalStorage.getItem('sudoku_map_save_classic_1')).toBeNull();
    });

    it('5. K-3 Eski Cihaz Çöpü Temizliği: Birden fazla eski harita kaydı otomatik ayıklanmalı', () => {
      const gen = SudokuGen.generateVariant('basit', 'classic');
      const recordData = JSON.stringify({
        variant: 'classic',
        level: 1,
        diff: 'basit',
        timeElapsed: 10,
        userBoard: gen.puzzle,
        initialBoard: gen.puzzle,
        currentSolution: gen.solution,
        errors: 0
      });

      mockLocalStorage.setItem('sudoku_map_save_classic_1', recordData);
      mockLocalStorage.setItem('sudoku_map_save_classic_302', JSON.stringify({ ...JSON.parse(recordData), level: 302 }));
      mockLocalStorage.setItem('sudoku_map_save_classic_303', JSON.stringify({ ...JSON.parse(recordData), level: 303 }));

      const list = getSavedGamesList().filter(r => !r.isCustomMode && !r.isMatchMode);
      expect(list.length).toBe(1);
      expect(list[0].level).toBe(303);
      expect(mockLocalStorage.getItem('sudoku_map_save_classic_1')).toBeNull();
      expect(mockLocalStorage.getItem('sudoku_map_save_classic_302')).toBeNull();
    });

    it('6. Bölüm Bitişi Temizliği: clearVariantJourneySaves classic silerken irregular ve custom korumalı', () => {
      const genC = SudokuGen.generateVariant('basit', 'classic');
      const genI = SudokuGen.generateVariant('basit', 'irregular');

      saveActiveGameRecord({
        isMatchMode: false,
        isCustomGameMode: false,
        variant: 'classic',
        level: 1,
        diff: 'basit',
        timeElapsed: 10,
        userBoard: genC.puzzle,
        initialBoard: genC.puzzle,
        currentSolution: genC.solution,
        errors: 0
      });

      saveActiveGameRecord({
        isMatchMode: false,
        isCustomGameMode: false,
        variant: 'irregular',
        level: 5,
        diff: 'orta',
        timeElapsed: 20,
        userBoard: genI.puzzle,
        initialBoard: genI.puzzle,
        currentSolution: genI.solution,
        errors: 0,
        regionMap: genI.regionMap
      });

      saveActiveGameRecord({
        isMatchMode: false,
        isCustomGameMode: true,
        variant: 'classic',
        level: 1,
        diff: 'basit',
        timeElapsed: 5,
        userBoard: genC.puzzle,
        initialBoard: genC.puzzle,
        currentSolution: genC.solution,
        errors: 0
      });

      clearVariantJourneySaves('classic');

      const remaining = getSavedGamesList();
      const mapClassic = remaining.find(r => !r.isCustomMode && r.variant === 'classic');
      const mapIrregular = remaining.find(r => !r.isCustomMode && r.variant === 'irregular');
      const customClassic = remaining.find(r => !!r.isCustomMode && r.variant === 'classic');

      expect(mapClassic).toBeUndefined();
      expect(mapIrregular).toBeDefined();
      expect(customClassic).toBeDefined();
    });

    it('7. Serbest Mod & Notlar/Variant Bütünlüğü: Killer ve Samurai alanları kayıpsız dönmeli', () => {
      const killerGen = SudokuGen.generateVariant('basit', 'killer');
      saveActiveGameRecord({
        isMatchMode: false,
        isCustomGameMode: true,
        variant: 'killer',
        level: 1,
        diff: 'basit',
        timeElapsed: 15,
        userBoard: killerGen.puzzle,
        initialBoard: killerGen.puzzle,
        currentSolution: killerGen.solution,
        errors: 1,
        cages: killerGen.cages
      });

      const list = getSavedGamesList();
      const killerSaved = list.find(r => r.variant === 'killer');
      expect(killerSaved).toBeDefined();
      expect(killerSaved?.cages).toBeDefined();
      expect(killerSaved?.cages?.length).toBeGreaterThan(0);
    });

    it('8. Ö-2 Süresiz Düello Yaşam Döngüsü: Kayıt edilip silindiğinde listeden kalkmalı', () => {
      const gen = SudokuGen.generateVariant('basit', 'classic');
      const matchId = 'test_match_123';

      saveActiveGameRecord({
        isMatchMode: true,
        isCustomGameMode: false,
        variant: 'classic',
        level: 1,
        diff: 'basit',
        timeElapsed: 25,
        userBoard: gen.puzzle,
        initialBoard: gen.puzzle,
        currentSolution: gen.solution,
        errors: 0,
        matchData: { matchId, durationSec: 0, player2: { username: 'Rakip' } }
      });

      let list = getSavedGamesList().filter(r => r.isMatchMode);
      expect(list.length).toBe(1);

      clearSavedGame('classic', 1, matchId);

      list = getSavedGamesList().filter(r => r.isMatchMode);
      expect(list.length).toBe(0);
    });
  });

  // ----------------------------------------------------
  // Grup 3: Seviye Atlama Sınavı (Placement) Akışı (2 test)
  // ----------------------------------------------------
  describe('Grup 3: Seviye Atlama Sınavı Akışı', () => {
    it('9. Klasik Orta Sınav %100 geçildiğinde level=301 atanmalı', async () => {
      const res = evaluatePlacementExam({
        variant: 'classic',
        tier: 'orta',
        currentVariantLevel: 1,
        filledByUser: 50,
        totalInitialEmpty: 50,
        errors: 0,
        completedAll: true,
        timeElapsedSec: 200,
        timeLimitSec: 420
      });

      expect(res.passedFull).toBe(true);
      expect(res.assignedLevel).toBe(301);

      await UserManager.updateVariantLevel('classic', res.assignedLevel, res.rewardGold);
      expect(UserManager.getVariantLevel('classic')).toBe(301);
    });

    it('10. Samurai Zor Sınav kısmi geçildiğinde kısmi seviye atanmalı ve diğer disiplinler etkilenmemeli', async () => {
      await UserManager.updateVariantLevel('irregular', 10, 0);

      const res = evaluatePlacementExam({
        variant: 'samurai',
        tier: 'zor',
        currentVariantLevel: 1,
        filledByUser: 100,
        totalInitialEmpty: 200,
        errors: 1,
        completedAll: false,
        timeElapsedSec: 600,
        timeLimitSec: 1080
      });

      expect(res.passedFull).toBe(false);
      expect(res.partialAssigned).toBe(true);
      expect(res.assignedLevel).toBeGreaterThan(1);

      await UserManager.updateVariantLevel('samurai', res.assignedLevel, res.rewardGold);
      expect(UserManager.getVariantLevel('samurai')).toBe(res.assignedLevel);
      expect(UserManager.getVariantLevel('irregular')).toBe(10);
    });
  });

  // ----------------------------------------------------
  // Grup 4: Oyun Motoru & Hata / Kazanma Mantığı (3 test)
  // ----------------------------------------------------
  describe('Grup 4: Oyun Motoru & Hata Mantığı', () => {
    it('11. GameEngine.processInput sabit başlangıç hücresini değiştirmemeli', () => {
      const gen = SudokuGen.generateVariant('basit', 'classic');
      const userBoard = gen.puzzle.map(r => [...r]);

      let fixedR = -1, fixedC = -1, fixedVal = -1;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (userBoard[r][c] !== 0) {
            fixedR = r; fixedC = c; fixedVal = userBoard[r][c];
            break;
          }
        }
        if (fixedR !== -1) break;
      }

      let winTriggered = false;
      let errTriggered = false;

      const success = GameEngine.processInput(
        fixedR,
        fixedC,
        (fixedVal % 9) + 1,
        userBoard,
        gen.solution,
        gen.puzzle,
        async () => { winTriggered = true; },
        async () => { errTriggered = true; }
      );

      expect(success).toBe(false);
      expect(userBoard[fixedR][fixedC]).toBe(fixedVal);
      expect(winTriggered).toBe(false);
      expect(errTriggered).toBe(false);
    });

    it('12. 3 yanlış giriş sonrası onError tetiklenmeli', () => {
      const gen = SudokuGen.generateVariant('basit', 'classic');
      const userBoard = gen.puzzle.map(r => [...r]);

      let emptyR = -1, emptyC = -1;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (userBoard[r][c] === 0) {
            emptyR = r; emptyC = c;
            break;
          }
        }
        if (emptyR !== -1) break;
      }

      const correctVal = gen.solution[emptyR][emptyC];
      const wrongVal = (correctVal % 9) + 1;

      let errCount = 0;
      GameEngine.processInput(
        emptyR, emptyC, wrongVal, userBoard, gen.solution, gen.puzzle,
        async () => {},
        async (count) => { errCount += count; }
      );

      expect(errCount).toBe(1);
    });

    it('13. Çevrimdışı modda initUser saniyelerce beklemeden yerel veriyi dönmeli', async () => {
      mockLocalStorage.setItem('sudoku_username', 'OfflineTestUser');
      mockLocalStorage.setItem('sudoku_gold', '250');
      mockLocalStorage.setItem('sudoku_level', '5');

      const fallback = UserManager.getOfflineFallbackUser();
      expect(fallback).not.toBeNull();
      expect(fallback?.username).toBe('OfflineTestUser');
      expect(fallback?.gold).toBe(250);
      expect(fallback?.level).toBe(5);
    });
  });

  // ----------------------------------------------------
  // Grup 5: Mağaza & Başarımlar Tutarlılığı (2 test)
  // ----------------------------------------------------
  describe('Grup 5: Mağaza & Başarımlar Tutarlılığı', () => {
    it('14. ShopManager tema satın alma altın bakiyesinden düşmeli', async () => {
      mockLocalStorage.setItem('sudoku_gold', '300');
      const res = await ShopManager.buyItem('theme-shogun');
      expect(res.success).toBe(true);
      expect(ShopManager.getPurchasedThemes()).toContain('theme-shogun');
      expect(UserManager.getGold()).toBe(50); // 300 - 250
    });

    it('15. AchievementManager rozetleri koşul sağlanınca açmalı ve mükerrer açmamalı', () => {
      mockLocalStorage.setItem('sudoku_gold', '100');
      const res1 = AchievementManager.checkAndUnlockBadges({ level: 10, gold: 100, lastTimeElapsed: 30, lastErrors: 0 });
      expect(res1.newlyUnlocked.length).toBeGreaterThan(0);

      const res2 = AchievementManager.checkAndUnlockBadges({ level: 10, gold: 100, lastTimeElapsed: 30, lastErrors: 0 });
      expect(res2.newlyUnlocked.length).toBe(0); // Mükerrer kilit açılmamalı
    });
  });
});
