// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { setLang, t, applyStaticTranslations, TRANSLATIONS } from '../i18n/translations';
import {
  getLevelModifierProfile,
  generateSpecialCellsForBoard
} from '../engine/levelModifiers';
import {
  initLevelPrepController,
  openLevelPrepModal,
  closeLevelPrepModal,
  getSelectedPrepLoadout,
  refreshLevelPrepLanguageUI
} from '../controllers/levelPrepController';
import { initAbilitiesController } from '../controllers/abilitiesController';

describe('Faz 3b 10\'lu Bölüm Enerjileri, Özel Hücre Motoru & 2\'li Hazırlık Paneli Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');

    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initAbilitiesController();
    initLevelPrepController();
  });

  describe('1. 10\'lu Bölüm Enerjileri & Yetenek Çarpanları', () => {
    it('Seviye 1..10 ve 50 için doğru modatör profili üretilmeli', () => {
      const p1 = getLevelModifierProfile(1, 'classic');
      expect(p1.energyId).toBe('rune_harvest');
      expect(p1.maxMistakes).toBe(3);

      const p3 = getLevelModifierProfile(3, 'classic');
      expect(p3.energyId).toBe('spark_flow');
      expect(p3.sparkCount).toBe(2);

      const p4 = getLevelModifierProfile(4, 'classic');
      expect(p4.energyId).toBe('sealed_path');
      expect(p4.keySealPairs).toBe(1);

      const p5 = getLevelModifierProfile(5, 'classic');
      expect(p5.energyId).toBe('mystery_vault');
      expect(p5.treasureCount).toBe(1);

      const p6 = getLevelModifierProfile(6, 'classic');
      expect(p6.energyId).toBe('flawless_trial');
      expect(p6.hasFlawlessCrystalBonus).toBe(true);
      expect(p6.flawlessBonusCrystals).toBe(2);

      const p7 = getLevelModifierProfile(7, 'classic');
      expect(p7.energyId).toBe('double_seal');
      expect(p7.keySealPairs).toBe(2);

      const p8 = getLevelModifierProfile(8, 'classic');
      expect(p8.energyId).toBe('one_breath');
      expect(p8.maxMistakes).toBe(2);

      const p9 = getLevelModifierProfile(9, 'classic');
      expect(p9.energyId).toBe('sprint_rush');
      expect(p9.sprintTargetSec).toBe(180); // basit diff

      const p10 = getLevelModifierProfile(10, 'classic');
      expect(p10.energyId).toBe('milestone_vault');
      expect(p10.crystalCount).toBe(3);

      const p50 = getLevelModifierProfile(50, 'classic');
      expect(p50.energyId).toBe('region_guardian');
      expect(p50.crystalCount).toBe(4);
      expect(p50.keySealPairs).toBe(1);
    });

    it('Rün Mıknatısı ve Ritim Bükücü yetenek seviyeleri modifiye parametrelerini artırmalı', () => {
      // Rune Magnet Sv.3 Seviye 5 (5'in katı) için crystalCount +1 artmalı
      const pNormal = getLevelModifierProfile(5, 'classic', { runeMagnetLevel: 0 });
      const pMagnet = getLevelModifierProfile(5, 'classic', { runeMagnetLevel: 3 });
      expect(pMagnet.crystalCount).toBe(pNormal.crystalCount + 1);

      // Rhythm Bender Sv.1 ve Sv.5 Seviye 9 Depar süresini artırmalı
      const pSprintBase = getLevelModifierProfile(9, 'classic', { rhythmBenderLevel: 0 });
      const pSprintLv1 = getLevelModifierProfile(9, 'classic', { rhythmBenderLevel: 1 });
      const pSprintLv5 = getLevelModifierProfile(9, 'classic', { rhythmBenderLevel: 5 });

      expect(pSprintLv1.sprintTargetSec).toBe(pSprintBase.sprintTargetSec + 20);
      expect(pSprintLv5.sprintTargetSec).toBe(pSprintBase.sprintTargetSec + 75);
    });
  });

  describe('2. Deterministik Özel Hücre Yerleşimi & Sıfır Çakışma', () => {
    it('Aynı (level, variant) için generateSpecialCellsForBoard deterministik ve çakışmasız sonuç üretmeli', () => {
      const puzzle = [
        [0, 0, 0, 0, 0, 6, 7, 8, 9],
        [0, 0, 0, 0, 0, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 1, 5, 6, 4, 8, 9, 7],
        [5, 6, 4, 8, 9, 7, 2, 3, 1],
        [8, 9, 7, 2, 3, 1, 5, 6, 4],
        [3, 1, 2, 6, 4, 5, 9, 7, 8],
        [6, 4, 5, 9, 7, 8, 3, 1, 2],
        [9, 7, 8, 3, 1, 2, 6, 4, 5]
      ];

      const res1 = generateSpecialCellsForBoard(puzzle, 4, 'classic');
      const res2 = generateSpecialCellsForBoard(puzzle, 4, 'classic');

      expect(res1).toEqual(res2);

      // Hiçbir özel hücre dolu hücreye atanamaz
      res1.forEach(c => {
        expect(puzzle[c.r][c.c]).toBe(0);
      });

      // Koordinat benzersizliği
      const posSet = new Set(res1.map(c => `${c.r}_${c.c}`));
      expect(posSet.size).toBe(res1.length);

      // Seviye 4 için 1 key - 1 seal çifti
      const keys = res1.filter(c => c.kind === 'key');
      const seals = res1.filter(c => c.kind === 'seal');
      expect(keys.length).toBe(1);
      expect(seals.length).toBe(1);
      expect(keys[0].pairId).toBe(seals[0].pairId);
    });
  });

  describe('3. 2\'li Yetenek Seçimi (Loadout) Sınır & Durum Testleri (DOM)', () => {
    it('Hazır yeteneklerden en fazla 2 tane seçilebilmeli, seçili olan çıkarılabilmeli', async () => {
      // 3 yetenek hazır yap (oracle_eye varsayılan Sv.1)
      localStorage.setItem('sudoku_crystals', '999');
      localStorage.setItem('sudoku_gold', '9999');
      await UserManager.upgradeAbility('crystal_shield'); // Sv.1
      await UserManager.upgradeAbility('rhythm_bender');  // Sv.1

      openLevelPrepModal({
        level: 1,
        diff: 'basit',
        variant: 'classic',
        onConfirmStart: () => {}
      });

      // 1. Yetenek Seç (oracle_eye)
      const elOracle = document.querySelector('[data-select-ability="oracle_eye"]') as HTMLElement;
      elOracle?.click();
      expect(getSelectedPrepLoadout()).toContain('oracle_eye');
      expect(getSelectedPrepLoadout().length).toBe(1);

      // 2. Yetenek Seç (crystal_shield)
      const elShield = document.querySelector('[data-select-ability="crystal_shield"]') as HTMLElement;
      elShield?.click();
      expect(getSelectedPrepLoadout()).toContain('crystal_shield');
      expect(getSelectedPrepLoadout().length).toBe(2);

      // 3. Yetenek Seçme Denemesi (rhythm_bender) -> Sınır 2 olduğu için reddedilmeli
      const elBender = document.querySelector('[data-select-ability="rhythm_bender"]') as HTMLElement;
      elBender?.click();
      expect(getSelectedPrepLoadout().length).toBe(2);

      // Seçili oracle_eye çıkar
      elOracle?.click();
      expect(getSelectedPrepLoadout()).not.toContain('oracle_eye');
      expect(getSelectedPrepLoadout().length).toBe(1);

      closeLevelPrepModal();
    });

    it('0 yetenek seçimiyle bölüme başlama onaylanabilmeli', () => {
      let startedAbilities: any = null;
      openLevelPrepModal({
        level: 1,
        diff: 'basit',
        variant: 'classic',
        onConfirmStart: (abilities) => {
          startedAbilities = abilities;
        }
      });

      const startBtn = document.getElementById('btn-prep-start-game');
      startBtn?.click();

      expect(startedAbilities).toEqual([]);
    });
  });

  describe('4. Geri Dönüş Kristal Göstergesi & Harita Enerji Özniteliği (DOM)', () => {
    it('Seviye 1 de 1 kristal toplanmışken hazırlık modalında 1 / 2 görünmeli', async () => {
      await UserManager.recordLevelCrystals('classic', 1, 1, 3);

      openLevelPrepModal({
        level: 1,
        diff: 'basit',
        variant: 'classic',
        onConfirmStart: () => {}
      });

      const progressEl = document.getElementById('prep-crystal-progress');
      expect(progressEl?.innerText).toContain('1 / 2');

      closeLevelPrepModal();
    });

    it('Harita düğümleri doğru data-energy özniteliği taşımalı', () => {
      UIManager.navigate('map');
      UIManager.renderMap(50, 1, 50, () => {}, false, 'classic');

      const node3Btn = document.querySelector('#map-node-3 button');
      const node4Btn = document.querySelector('#map-node-4 button');
      const node8Btn = document.querySelector('#map-node-8 button');
      const node50Btn = document.querySelector('#map-node-50 button');

      expect(node3Btn?.getAttribute('data-energy')).toBe('spark_flow');
      expect(node4Btn?.getAttribute('data-energy')).toBe('sealed_path');
      expect(node8Btn?.getAttribute('data-energy')).toBe('one_breath');
      expect(node50Btn?.getAttribute('data-energy')).toBe('region_guardian');
    });
  });

  describe('5. Çift Dilli Sızıntı & Canlı Dil Değişimi (TR <-> EN)', () => {
    it('EN modunda #level-prep-modal içinde Türkçe karakter veya kelime bulunmamalı', () => {
      setLang('en');
      applyStaticTranslations();

      openLevelPrepModal({
        level: 1,
        diff: 'basit',
        variant: 'classic',
        onConfirmStart: () => {}
      });

      const modal = document.getElementById('level-prep-modal');
      const text = modal?.textContent || '';
      const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;

      expect(trCharRegex.test(text)).toBe(false);

      closeLevelPrepModal();
    });

    it('TR modunda #level-prep-modal içinde yasaklı İngilizce kelime bulunmamalı', () => {
      setLang('tr');
      applyStaticTranslations();

      openLevelPrepModal({
        level: 1,
        diff: 'basit',
        variant: 'classic',
        onConfirmStart: () => {}
      });

      const modal = document.getElementById('level-prep-modal');
      const text = modal?.textContent || '';
      const forbiddenEnWords = /\b(Level|Loadout|Slot|Energy|Cooldown|Ready|Locked|Play|Next|Score|Region|Sprint|Vault|Shield|Spark|Seal|Crystal|Gold)\b/i;

      expect(forbiddenEnWords.test(text)).toBe(false);

      closeLevelPrepModal();
    });

    it('Canlı dil değişiminde hazırlık modalı anında yenilenmeli', () => {
      openLevelPrepModal({
        level: 1,
        diff: 'basit',
        variant: 'classic',
        onConfirmStart: () => {}
      });

      const badge = document.getElementById('prep-energy-badge');
      expect(badge?.innerText).toContain('Rün Hasadı');

      setLang('en');
      applyStaticTranslations();
      refreshLevelPrepLanguageUI();

      expect(badge?.innerText).toContain('Rune Harvest');

      closeLevelPrepModal();
    });
  });
});
