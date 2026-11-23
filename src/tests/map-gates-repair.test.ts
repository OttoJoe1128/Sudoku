// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { setLang, t, applyStaticTranslations } from '../i18n/translations';
import { getMapGateDef } from '../engine/mapGates';
import { createBoardMechanicsState, applyMistakeMechanics } from '../engine/boardMechanics';
import {
  initGameController,
  startGame,
  getGameRuntimeState,
  repairActiveCrystalWithGold,
  repairActiveCrystalWithAd
} from '../controllers/gameController';
import { initAbilitiesController } from '../controllers/abilitiesController';
import { initLevelPrepController } from '../controllers/levelPrepController';

describe('Faz 3d Harita 10\'lu Rün Kapıları & Çatlak Kristal Onarma Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');

    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initAbilitiesController();
    initLevelPrepController();
    initGameController();
  });

  describe('1. 10\'lu Rün Kapısı (Anti-Duplicate & Eşik)', () => {
    it('Seviye 10 kapısı yetersiz kristalle reddedilmeli, yeterli olunca ödül vermeli ve 2. kez alınamamalı', async () => {
      const gate10 = getMapGateDef(10, 'classic');
      expect(gate10).not.toBeNull();

      if (!gate10) return;

      // 0 kristalle deneme -> insufficient_crystals
      const failRes = await UserManager.claimMapGate('classic', 10);
      expect(failRes.ok).toBe(false);
      expect(failRes.reason).toBe('insufficient_crystals');

      // Seviye 1..10 bloğunda gerekli kristalleri topla
      for (let lvl = 1; lvl <= 10; lvl++) {
        await UserManager.recordLevelCrystals('classic', lvl, 3, 3);
      }

      const initialGold = UserManager.getGold();
      const initialCrystals = UserManager.getCrystals();

      // Hak kazanıldı -> claimMapGate
      const claimRes = await UserManager.claimMapGate('classic', 10);
      expect(claimRes.ok).toBe(true);
      expect(claimRes.rewardGold).toBe(25);
      expect(claimRes.rewardCrystals).toBe(1);
      expect(UserManager.getGold()).toBe(initialGold + 25);
      expect(UserManager.getCrystals()).toBe(initialCrystals + 1);

      // 2. kez claim denemesi -> already_claimed ve bakiye değişmemeli
      const claimRes2 = await UserManager.claimMapGate('classic', 10);
      expect(claimRes2.ok).toBe(false);
      expect(claimRes2.reason).toBe('already_claimed');
      expect(UserManager.getGold()).toBe(initialGold + 25);
    });

    it('Seviye 50 Bölge Kasası +60 Altın ve +3 Kristal vermeli', async () => {
      for (let lvl = 41; lvl <= 50; lvl++) {
        await UserManager.recordLevelCrystals('classic', lvl, 4, 4);
      }

      const claimRes = await UserManager.claimMapGate('classic', 50);
      expect(claimRes.ok).toBe(true);
      expect(claimRes.rewardGold).toBe(60);
      expect(claimRes.rewardCrystals).toBe(3);
    });
  });

  describe('2. Harita DOM Kapı Durumu (locked -> ready -> claimed)', async () => {
    it('Harita renderında kapı durumu DOM üzerinde locked, ready ve claimed olarak güncellenmeli', async () => {
      UIManager.navigate('map');
      UIManager.renderMap(10, 1, 15, () => {}, false, 'classic');

      let gateBtn = document.querySelector('[data-map-gate="10"]') as HTMLElement;
      expect(gateBtn).not.toBeNull();
      expect(gateBtn.getAttribute('data-gate-status')).toBe('locked');

      // Gerekli kristalleri doldur
      for (let lvl = 1; lvl <= 10; lvl++) {
        await UserManager.recordLevelCrystals('classic', lvl, 3, 3);
      }

      UIManager.renderMap(10, 1, 15, () => {}, false, 'classic');
      gateBtn = document.querySelector('[data-map-gate="10"]') as HTMLElement;
      expect(gateBtn.getAttribute('data-gate-status')).toBe('ready');

      // Kapıyı aç
      await UserManager.claimMapGate('classic', 10);

      UIManager.renderMap(10, 1, 15, () => {}, false, 'classic');
      gateBtn = document.querySelector('[data-map-gate="10"]') as HTMLElement;
      expect(gateBtn.getAttribute('data-gate-status')).toBe('claimed');
    });
  });

  describe('3. Çatlak Kristal Onarma (Altın & Reklam)', () => {
    it('Kristal çatladıktan sonra #btn-open-crystal-repair görünmeli, yetersiz altınla reddedilmeli', async () => {
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

      startGame(1, 'basit', undefined, undefined, 'classic', false);

      const state = getGameRuntimeState().boardMechanics;
      expect(state).not.toBeNull();

      if (!state) return;

      const crystalCell = state.cells.find(c => c.kind === 'crystal') || state.cells[0];
      applyMistakeMechanics(state, crystalCell.r, crystalCell.c);

      expect(state.crackedCrystals.length).toBe(1);

      // Yetersiz altınla onarım denemesi (altın = 5)
      localStorage.setItem('sudoku_gold', '5');
      const failRes = await repairActiveCrystalWithGold();
      expect(failRes).toBe(false);
      expect(state.crackedCrystals.length).toBe(1);

      // Yeterli altınla onarım denemesi (altın = 20)
      localStorage.setItem('sudoku_gold', '20');
      const okRes = await repairActiveCrystalWithGold();
      expect(okRes).toBe(true);
      expect(UserManager.getGold()).toBe(5);
      expect(state.crackedCrystals.length).toBe(0);
    });

    it('Reklamla onarım altın düşmeden çatlak kristali aktif duruma getirmeli', () => {
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

      startGame(1, 'basit', undefined, undefined, 'classic', false);
      const state = getGameRuntimeState().boardMechanics;
      if (!state) return;

      const crystalCell = state.cells.find(c => c.kind === 'crystal') || state.cells[0];
      applyMistakeMechanics(state, crystalCell.r, crystalCell.c);

      localStorage.setItem('sudoku_gold', '100');
      const okRes = repairActiveCrystalWithAd();
      expect(okRes).toBe(true);
      expect(UserManager.getGold()).toBe(100);
      expect(state.crackedCrystals.length).toBe(0);
    });
  });

  describe('4. Çift Dilli Sızıntı (TR <-> EN)', () => {
    it('#crystal-repair-modal EN modunda Türkçe karakter veya kelime içermemeli', () => {
      setLang('en');
      applyStaticTranslations();

      UIManager.toggleModal('crystal-repair-modal', true);

      const modal = document.getElementById('crystal-repair-modal');
      const text = modal?.textContent || '';
      const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;

      expect(trCharRegex.test(text)).toBe(false);

      UIManager.toggleModal('crystal-repair-modal', false);
    });

    it('#crystal-repair-modal TR modunda yasaklı İngilizce kelime içermemeli', () => {
      setLang('tr');
      applyStaticTranslations();

      UIManager.toggleModal('crystal-repair-modal', true);

      const modal = document.getElementById('crystal-repair-modal');
      const text = modal?.textContent || '';
      const forbiddenEnWords = /\b(Gate|Vault|Repair|Cracked|Claim|Claimed|Double|Gold|Crystal|Level|Locked|Ready|Mistake)\b/i;

      expect(forbiddenEnWords.test(text)).toBe(false);

      UIManager.toggleModal('crystal-repair-modal', false);
    });
  });
});
