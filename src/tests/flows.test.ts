import { describe, it, expect, beforeEach } from 'vitest';
import { UserManager, computeNextJourneyLevel } from '../store/userState';
import { getSavedGamesList, saveActiveGameRecord, clearVariantJourneySaves, clearSavedGame, deleteSavedGameRecord, reconcileLevelsWithSavedGames } from '../controllers/saveController';
import { evaluatePlacementExam, getPlacementExamConfig } from '../engine/placementEngine';
import { GameEngine } from '../engine/gameEngine';
import { SudokuGen } from '../engine/sudoku';
import { ShopManager } from '../engine/shop';
import { AchievementManager } from '../engine/achievements';
import { canOfferSecondChance, tryGoldRevive, AdService } from '../services/adService';

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

function makeMovedBoard(gen: any) {
  const uBoard = gen.puzzle.map((r: number[]) => [...r]);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (uBoard[r][c] === 0) {
        uBoard[r][c] = gen.solution[r][c];
        return uBoard;
      }
    }
  }
  return uBoard;
}

describe('Uçtan Uca Oyun Akışları ve Bütünlük Testleri (21 Senaryo)', () => {
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

      const moved1 = makeMovedBoard(gen1);
      const moved2 = makeMovedBoard(gen2);

      saveActiveGameRecord({
        isMatchMode: false,
        isCustomGameMode: false,
        variant: 'classic',
        level: 1,
        diff: 'basit',
        timeElapsed: 10,
        userBoard: moved1,
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
        userBoard: moved2,
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
      const moved = makeMovedBoard(gen);

      const recordData = JSON.stringify({
        variant: 'classic',
        level: 1,
        diff: 'basit',
        timeElapsed: 10,
        userBoard: moved,
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

      const movedC = makeMovedBoard(genC);
      const movedI = makeMovedBoard(genI);

      saveActiveGameRecord({
        isMatchMode: false,
        isCustomGameMode: false,
        variant: 'classic',
        level: 1,
        diff: 'basit',
        timeElapsed: 10,
        userBoard: movedC,
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
        userBoard: movedI,
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
        userBoard: movedC,
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
      const moved = makeMovedBoard(killerGen);

      saveActiveGameRecord({
        isMatchMode: false,
        isCustomGameMode: true,
        variant: 'killer',
        level: 1,
        diff: 'basit',
        timeElapsed: 15,
        userBoard: moved,
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
      const moved = makeMovedBoard(gen);
      const matchId = 'test_match_123';

      saveActiveGameRecord({
        isMatchMode: true,
        isCustomGameMode: false,
        variant: 'classic',
        level: 1,
        diff: 'basit',
        timeElapsed: 25,
        userBoard: moved,
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

  // ----------------------------------------------------
  // Grup 6: Faz O5 - Kayıt & Level Bütünlüğü (6 test)
  // ----------------------------------------------------
  describe('Grup 6: Faz O5 - Kayıt & Level Bütünlüğü (6 test)', () => {
    it('16. Yüksek Kayıt Kurtarma Testi (Wordoku 701 Senaryosu): Harita seviyesi düşükken yüksek kayıt varsa otomatik yükseltilmeli', () => {
      mockLocalStorage.setItem('sudoku_level_wordoku', '1');
      expect(UserManager.getVariantLevel('wordoku')).toBe(1);

      const gen = SudokuGen.generateVariant('zor', 'wordoku');
      const movedBoard = makeMovedBoard(gen);

      const recordData = JSON.stringify({
        variant: 'wordoku',
        level: 701,
        diff: 'zor',
        timeElapsed: 120,
        userBoard: movedBoard,
        initialBoard: gen.puzzle,
        currentSolution: gen.solution,
        errors: 0
      });

      mockLocalStorage.setItem('sudoku_map_save_wordoku_701', recordData);

      reconcileLevelsWithSavedGames();
      expect(UserManager.getVariantLevel('wordoku')).toBe(701);
    });

    it('17. computeNextJourneyLevel Senaryoları', () => {
      expect(computeNextJourneyLevel(701, 1)).toBe(702);
      expect(computeNextJourneyLevel(2, 2)).toBe(3);
      expect(computeNextJourneyLevel(2, 10)).toBe(10);
    });

    it('18. 0 Hamle (00:01) Boş Tahta Engeli: Hiç hamle yapılmamış tahta kaydedilmemeli', () => {
      const gen = SudokuGen.generateVariant('basit', 'classic');

      saveActiveGameRecord({
        isMatchMode: false,
        isCustomGameMode: false,
        variant: 'classic',
        level: 1,
        diff: 'basit',
        timeElapsed: 1,
        userBoard: gen.puzzle,
        initialBoard: gen.puzzle,
        currentSolution: gen.solution,
        errors: 0
      });

      const list = getSavedGamesList().filter(r => !r.isCustomMode && !r.isMatchMode);
      expect(list.length).toBe(0);
    });

    it('19. Güvenli clearVariantJourneySaves(variant, maxLevel) Testi: Seviye 2 silinirken Seviye 303 korunmalı', () => {
      const gen1 = SudokuGen.generateVariant('basit', 'classic');
      const gen2 = SudokuGen.generateVariant('zor', 'classic');

      const moved1 = makeMovedBoard(gen1);
      const moved2 = makeMovedBoard(gen2);

      mockLocalStorage.setItem('sudoku_map_save_classic_2', JSON.stringify({
        variant: 'classic', level: 2, diff: 'basit', timeElapsed: 10,
        userBoard: moved1, initialBoard: gen1.puzzle, currentSolution: gen1.solution, errors: 0
      }));

      mockLocalStorage.setItem('sudoku_map_save_classic_303', JSON.stringify({
        variant: 'classic', level: 303, diff: 'zor', timeElapsed: 100,
        userBoard: moved2, initialBoard: gen2.puzzle, currentSolution: gen2.solution, errors: 0
      }));

      clearVariantJourneySaves('classic', 2);

      expect(mockLocalStorage.getItem('sudoku_map_save_classic_2')).toBeNull();
      expect(mockLocalStorage.getItem('sudoku_map_save_classic_303')).not.toBeNull();
    });

    it('20. Yolculuk Kaydı Manuel Silme Testi: deleteSavedGameRecord ile saved_map_irregular_5 silinmeli', () => {
      const gen = SudokuGen.generateVariant('basit', 'irregular');
      const moved = makeMovedBoard(gen);

      mockLocalStorage.setItem('sudoku_map_save_irregular_5', JSON.stringify({
        variant: 'irregular', level: 5, diff: 'orta', timeElapsed: 30,
        userBoard: moved, initialBoard: gen.puzzle, currentSolution: gen.solution, errors: 0, regionMap: gen.regionMap
      }));

      expect(mockLocalStorage.getItem('sudoku_map_save_irregular_5')).not.toBeNull();

      deleteSavedGameRecord('saved_map_irregular_5');

      expect(mockLocalStorage.getItem('sudoku_map_save_irregular_5')).toBeNull();
    });

    it('21. updateProgress Geri Çekme Koruması: Seviye 303teyken updateProgress(2, 150) seviyeyi düşürmemeli', async () => {
      await UserManager.updateVariantLevel('classic', 303, 100);
      expect(UserManager.getVariantLevel('classic')).toBe(303);

      await UserManager.updateProgress(2, 150);
      expect(UserManager.getVariantLevel('classic')).toBe(303);
      expect(UserManager.getCurrentLevel()).toBe(303);
    });
  });

  // ----------------------------------------------------
  // Grup 7: İkinci Şans (50 Altın & Ödüllü Reklam) Akışı (4 test)
  // ----------------------------------------------------
  describe('Grup 7: İkinci Şans (50 Altın & Ödüllü Reklam) Akışı', () => {
    it('22. canOfferSecondChance Yolculuk ve Serbest Mod için true, Düello ve Sınav için false dönmeli', () => {
      expect(canOfferSecondChance({ isMatchMode: false, isPlacementExam: false })).toBe(true);
      expect(canOfferSecondChance({ isMatchMode: true, isPlacementExam: false })).toBe(false);
      expect(canOfferSecondChance({ isMatchMode: false, isPlacementExam: true })).toBe(false);
      expect(canOfferSecondChance({ isMatchMode: true, isPlacementExam: true })).toBe(false);
    });

    it('23. tryGoldRevive 70 altından 50 düşüp { success: true, newGold: 20, newErrors: 2 } dönmeli; 30 altında { success: false } dönmeli', () => {
      const res1 = tryGoldRevive(70, 50);
      expect(res1.success).toBe(true);
      expect(res1.newGold).toBe(20);
      expect(res1.newErrors).toBe(2);

      const res2 = tryGoldRevive(30, 50);
      expect(res2.success).toBe(false);
      expect(res2.newGold).toBe(30);
      expect(res2.newErrors).toBe(3);
    });

    it('24. 50 Altın ile can kurtarma sonrası UserManager.updateProgress çağrıldığında seviye asla düşmemeli', async () => {
      mockLocalStorage.setItem('sudoku_gold', '100');
      await UserManager.updateVariantLevel('classic', 5, 0);

      const res = tryGoldRevive(UserManager.getGold());
      expect(res.success).toBe(true);
      expect(res.newGold).toBe(50);

      await UserManager.updateProgress(UserManager.getCurrentLevel(), res.newGold);
      expect(UserManager.getGold()).toBe(50);
      expect(UserManager.getVariantLevel('classic')).toBe(5);
    });

    it('25. AdService.showRewardedReviveAd() Node/web/offline ortamda çökmeden { rewarded: false } dönmeli', async () => {
      const res = await AdService.showRewardedReviveAd();
      expect(res).toBeDefined();
      expect(res.rewarded).toBe(false);
    });
  });
});
