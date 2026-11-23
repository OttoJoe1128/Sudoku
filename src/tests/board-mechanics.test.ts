// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { setLang, t, applyStaticTranslations } from '../i18n/translations';
import {
  createBoardMechanicsState,
  isCellSealed,
  applyValidMoveMechanics,
  applyMistakeMechanics,
  activateOracleEye,
  activateSealBreaker,
  computeFinalRunCrystals
} from '../engine/boardMechanics';
import {
  initLevelPrepController,
  openLevelPrepModal,
  closeLevelPrepModal
} from '../controllers/levelPrepController';
import { initAbilitiesController } from '../controllers/abilitiesController';
import { initGameController, startGame, getGameRuntimeState, handleExitGameRequest } from '../controllers/gameController';

describe('Faz 3c Tahta İçi Özel Hücreler & 5 Yeteneğin Gerçek Oyun İçi Etkileri Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');

    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initAbilitiesController();
    initLevelPrepController();
    initGameController();
  });

  describe('1. Mühür & Anahtar Zinciri (DOM & State)', () => {
    it('Seviye 4 (sealed_path) başlatıldığında mühürlü hücre kilitli olmalı, anahtar çözülünce açılmalı', () => {
      startGame(4, 'basit', undefined, undefined, 'classic', false);
      const state = getGameRuntimeState().boardMechanics;
      expect(state).not.toBeNull();

      if (!state) return;

      const keyCell = state.cells.find(c => c.kind === 'key');
      const sealCell = state.cells.find(c => c.kind === 'seal');

      expect(keyCell).not.toBeUndefined();
      expect(sealCell).not.toBeUndefined();

      if (keyCell && sealCell) {
        expect(isCellSealed(state, sealCell.r, sealCell.c)).toBe(true);

        // DOM Üzerinden Mühürlü Hücreye Tıkla ve Numpad Bas -> Rakam girilmemeli
        const sealIndex = sealCell.r * 9 + sealCell.c;
        const gridEl = document.getElementById('sudoku-grid');
        const sealCellEl = gridEl?.children[sealIndex] as HTMLElement;
        sealCellEl?.click();

        const numpadBtn1 = document.querySelectorAll('#numpad-grid button')[0] as HTMLElement;
        numpadBtn1?.click();

        expect(getGameRuntimeState().userBoard[sealCell.r][sealCell.c]).toBe(0);

        // Anahtar hücresini çöz
        const keyIndex = keyCell.r * 9 + keyCell.c;
        const keyCellEl = gridEl?.children[keyIndex] as HTMLElement;
        keyCellEl?.click();

        const keySol = getGameRuntimeState().currentSolution[keyCell.r][keyCell.c];
        const numpadKeyBtn = document.querySelectorAll('#numpad-grid button')[keySol - 1] as HTMLElement;
        numpadKeyBtn?.click();

        expect(isCellSealed(state, sealCell.r, sealCell.c)).toBe(false);

        // Şimdi mühürlü hücreye tıkla ve doğru rakamı bas -> Rakam girmeli
        sealCellEl?.click();
        const sealSol = getGameRuntimeState().currentSolution[sealCell.r][sealCell.c];
        const numpadSealBtn = document.querySelectorAll('#numpad-grid button')[sealSol - 1] as HTMLElement;
        numpadSealBtn?.click();

        expect(getGameRuntimeState().userBoard[sealCell.r][sealCell.c]).toBe(sealSol);
      }
    });
  });

  describe('2. Kristal Toplama, Çatlama & Kalkan Koruması', () => {
    it('Kalkan yokken hatalı hamlede kristal çatlamalı, crystal_shield takılıysa rünü korumalı', async () => {
      const puzzle = [
        [0, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 1, 5, 6, 4, 8, 9, 7],
        [5, 6, 4, 8, 9, 7, 2, 3, 1],
        [8, 9, 7, 2, 3, 1, 5, 6, 4],
        [3, 1, 2, 6, 4, 5, 9, 7, 8],
        [6, 4, 5, 9, 7, 8, 3, 1, 2],
        [9, 7, 8, 3, 1, 2, 6, 4, 5]
      ];

      // Kalkan yokken
      const stateNoShield = createBoardMechanicsState(puzzle, 1, 'classic', []);
      const crystalCell = stateNoShield.cells.find(c => c.kind === 'crystal') || stateNoShield.cells[0];
      const mistRes1 = applyMistakeMechanics(stateNoShield, crystalCell.r, crystalCell.c);

      expect(mistRes1.crystalCracked).toBe(true);
      expect(mistRes1.crystalProtectedByShield).toBe(false);

      // Kalkan Sv.1 takılıyken
      localStorage.setItem('sudoku_crystals', '999');
      localStorage.setItem('sudoku_gold', '9999');
      await UserManager.upgradeAbility('crystal_shield'); // Sv.1

      const stateWithShield = createBoardMechanicsState(puzzle, 1, 'classic', ['crystal_shield'], UserManager.getAbilitiesState());
      const crystalCell2 = stateWithShield.cells.find(c => c.kind === 'crystal') || stateWithShield.cells[0];
      const mistRes2 = applyMistakeMechanics(stateWithShield, crystalCell2.r, crystalCell2.c);

      expect(mistRes2.crystalProtectedByShield).toBe(true);
      expect(mistRes2.crystalCracked).toBe(false);
      expect(mistRes2.newlyConsumedAbilities).toContain('crystal_shield');

      // Ardından doğru hamle yapılınca kristal toplanmalı
      const validRes = applyValidMoveMechanics(stateWithShield, crystalCell2.r, crystalCell2.c);
      expect(validRes.crystalCollected).toBe(true);
      expect(stateWithShield.crystalsEarnedInRun).toBe(1);
    });
  });

  describe('3. Sıfır İsraf Cooldown Kuralı (Hamlesiz Çıkış vs 1. Hamle)', () => {
    it('Hamle yapılmadan oyundan çıkılırsa pasif yetenekler cooldowna girmemeli', async () => {
      localStorage.setItem('sudoku_crystals', '999');
      localStorage.setItem('sudoku_gold', '9999');
      await UserManager.upgradeAbility('rhythm_bender');

      startGame(9, 'basit', undefined, undefined, 'classic', false, 0, ['rhythm_bender']);

      // Hiç hamle yapmadan çık
      await handleExitGameRequest();

      const prog = UserManager.getAbilityProgress('rhythm_bender');
      expect(prog.cooldownEndsAtMs).toBe(0);
    });

    it('1 geçerli hamle yapıldığında takılı pasif yetenekler cooldowna girmeli', async () => {
      localStorage.setItem('sudoku_crystals', '999');
      localStorage.setItem('sudoku_gold', '9999');
      await UserManager.upgradeAbility('rhythm_bender');

      const now = Date.now();
      startGame(9, 'basit', undefined, undefined, 'classic', false, 0, ['rhythm_bender']);

      const state = getGameRuntimeState().boardMechanics;
      expect(state).not.toBeNull();

      if (state) {
        const res = applyValidMoveMechanics(state, 0, 0, now);
        expect(res.newlyConsumedAbilities).toContain('rhythm_bender');
      }
    });
  });

  describe('4. Kâhin Gözü (oracle_eye) & Mühür Kırıcı (seal_breaker) Aktif Kullanımı', () => {
    it('oracle_eye çalıştırıldığında aday notlarını taramalı ve cooldowna girmeli', async () => {
      const puzzle = [
        [0, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 1, 5, 6, 4, 8, 9, 7],
        [5, 6, 4, 8, 9, 7, 2, 3, 1],
        [8, 9, 7, 2, 3, 1, 5, 6, 4],
        [3, 1, 2, 6, 4, 5, 9, 7, 8],
        [6, 4, 5, 9, 7, 8, 3, 1, 2],
        [9, 7, 8, 3, 1, 2, 6, 4, 5]
      ];
      const state = createBoardMechanicsState(puzzle, 1, 'classic', ['oracle_eye'], { oracle_eye: { level: 1, cooldownEndsAtMs: 0 } } as any);

      const res = activateOracleEye(state, puzzle, { r: 0, c: 0 });
      expect(res.ok).toBe(true);
      expect(res.newlyConsumed).toBe(true);
      expect(res.scannedCells.length).toBeGreaterThan(0);
      expect(res.scannedCells[0].candidates).toEqual([1]);
    });

    it('seal_breaker Sv.3 mühürü kırmalı ve cooldowna girmeli', () => {
      const puzzle = Array.from({ length: 9 }, () => Array(9).fill(0));
      const state = createBoardMechanicsState(puzzle, 4, 'classic', ['seal_breaker'], { seal_breaker: { level: 3, cooldownEndsAtMs: 0 } } as any);

      const sealCell = state.cells.find(c => c.kind === 'seal');
      expect(sealCell).not.toBeUndefined();

      const res = activateSealBreaker(state, sealCell ? { r: sealCell.r, c: sealCell.c } : null);
      expect(res.ok).toBe(true);
      expect(res.newlyConsumed).toBe(true);
      expect(sealCell?.state).toBe('unlocked');
    });
  });

  describe('5. Seviye 8 (one_breath — 2 Hata Hakkı & Canlanma)', () => {
    it('Seviye 8 modifiye profili maxMistakes = 2 vermeli ve DOM göstergesi 0/2 olmalı', () => {
      startGame(8, 'basit', undefined, undefined, 'classic', false);
      const state = getGameRuntimeState().boardMechanics;
      expect(state?.profile.maxMistakes).toBe(2);

      const errorEl = document.getElementById('game-errors');
      expect(errorEl?.innerText).toContain('0/2');
    });
  });

  describe('6. Geri Dönüş & Anti-Farm Tam Zafer Döngüsü (Uçtan Uca)', () => {
    it('Bölüm sonu kristal hesaplaması kusursuz bonusu ve depar bonusunu tavan sınırı içinde vermeli', () => {
      const puzzle = Array.from({ length: 9 }, () => Array(9).fill(0));

      const stateFlawless = createBoardMechanicsState(puzzle, 6, 'classic', []);
      stateFlawless.crystalsEarnedInRun = 2;

      const totalCrystals0Errors = computeFinalRunCrystals(stateFlawless, 0, 100);
      expect(totalCrystals0Errors).toBe(4);

      const totalCrystals1Error = computeFinalRunCrystals(stateFlawless, 1, 100);
      expect(totalCrystals1Error).toBe(2);
    });

    it('Harita zaferinde Seviye 1 (basit) için +5 altın verilmeli (100 -> 105)', async () => {
      localStorage.setItem('sudoku_gold', '100');
      startGame(1, 'basit', undefined, undefined, 'classic', false);

      const state = getGameRuntimeState();
      const solution = state.currentSolution;
      const uBoard = state.userBoard;
      const iBoard = state.initialBoard;

      let emptyCells: { r: number; c: number }[] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (iBoard[r][c] === 0) {
            emptyCells.push({ r, c });
          }
        }
      }

      // Son hücre hariç tümünü doldur
      const last = emptyCells.pop()!;
      emptyCells.forEach(cell => {
        uBoard[cell.r][cell.c] = solution[cell.r][cell.c];
      });

      // Son boş hücreyi çöz
      const gridEl = document.getElementById('sudoku-grid');
      const lastCellEl = gridEl?.children[last.r * 9 + last.c] as HTMLElement;
      lastCellEl?.click();

      const lastSol = solution[last.r][last.c];
      const numpadBtn = document.querySelectorAll('#numpad-grid button')[lastSol - 1] as HTMLElement;
      numpadBtn?.click();

      await new Promise(r => setTimeout(r, 100));

      expect(UserManager.getGold()).toBe(105); // 100 + 5 (basit map base reward)
    });
  });

  describe('7. Çift Dilli Sızıntı & Hazırlık Paneli Canlı Etkisi', () => {
    it('Hazırlık panelinde rhythm_bender seçildiğinde depar süresi canlı uzamalı', async () => {
      localStorage.setItem('sudoku_crystals', '999');
      localStorage.setItem('sudoku_gold', '9999');
      await UserManager.upgradeAbility('rhythm_bender');

      openLevelPrepModal({
        level: 9,
        diff: 'basit',
        variant: 'classic',
        onConfirmStart: () => {}
      });

      const summaryEl = document.getElementById('prep-modifiers-summary');
      expect(summaryEl?.innerText).toContain('180s');

      // rhythm_bender yeteneğini seç
      const btnBender = document.querySelector('[data-select-ability="rhythm_bender"]') as HTMLElement;
      btnBender?.click();

      expect(summaryEl?.innerText).toContain('200s');

      closeLevelPrepModal();
    });

    it('#game-mechanics-bar EN modunda Türkçe karakter, TR modunda yasaklı İngilizce kelime içermemeli', () => {
      setLang('en');
      applyStaticTranslations();

      startGame(1, 'basit', undefined, undefined, 'classic', false);

      const bar = document.getElementById('game-mechanics-bar');
      const textEn = bar?.textContent || '';
      const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;
      expect(trCharRegex.test(textEn)).toBe(false);

      setLang('tr');
      applyStaticTranslations();

      startGame(1, 'basit', undefined, undefined, 'classic', false);
      const textTr = bar?.textContent || '';
      const forbiddenEnWords = /\b(Sealed|Cracked|Combo|Spark|Shield|Oracle|Crystal|Gold|Energy|Level|Locked|Ready|Mistake)\b/i;
      expect(forbiddenEnWords.test(textTr)).toBe(false);
    });
  });
});
