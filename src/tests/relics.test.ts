// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { RELICS, getRelicDef, isRelicUnlocked, RelicId } from '../engine/relics';
import { UserManager } from '../store/userState';
import { TRANSLATIONS, setLang, t, applyStaticTranslations } from '../i18n/translations';
import {
  createBoardMechanicsState,
  applyValidMoveMechanics,
  computeFinalRunCrystals
} from '../engine/boardMechanics';
import { UIManager } from '../ui/uiManager';
import {
  openLevelPrepModal,
  closeLevelPrepModal,
  initLevelPrepController
} from '../controllers/levelPrepController';

describe('Faz 2 - Adım 2.1: Pasif Kalıntı (Relic) Mimarisi ve Envanter Sistemi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initLevelPrepController();
  });

  it('1. Kalıntı Tanımları & Seviye Kilit Mantığı', () => {
    expect(RELICS.length).toBe(5);

    // Seviye 1'de yalnızca golden_compass açık olmalı
    expect(isRelicUnlocked('golden_compass', 1)).toBe(true);
    expect(isRelicUnlocked('chrono_hourglass', 1)).toBe(false);
    expect(isRelicUnlocked('mirror_cage', 1)).toBe(false);
    expect(isRelicUnlocked('ancient_rune_stone', 1)).toBe(false);
    expect(isRelicUnlocked('scout_mirror', 1)).toBe(false);

    // Seviye 5'te chrono_hourglass açılmalı
    expect(isRelicUnlocked('chrono_hourglass', 5)).toBe(true);

    // Seviye 50'de tüm kalıntılar açık olmalı
    RELICS.forEach(r => {
      expect(isRelicUnlocked(r.id, 50)).toBe(true);
    });

    const compassDef = getRelicDef('golden_compass');
    expect(compassDef.icon).toBe('🧭');
  });

  it('2. UserManager Kalıntı Envanteri & Kuşanma Durumu', () => {
    // Başlangıçta seviye 1 -> golden_compass kuşanmış olmalı
    expect(UserManager.getEquippedRelic()).toBe('golden_compass');

    // Seviye 10 yap
    localStorage.setItem('sudoku_level', '10');
    expect(UserManager.getUnlockedRelics()).toContain('mirror_cage');

    // Mirror cage kuşan
    UserManager.equipRelic('mirror_cage');
    expect(UserManager.getEquippedRelic()).toBe('mirror_cage');

    // Kalıntıyı çıkar
    UserManager.equipRelic(null);
    expect(UserManager.getEquippedRelic()).toBe('golden_compass'); // Default fallback
  });

  it('3. Golden Compass: Doğru girilen 5 rakamında +2 bonus altın vermeli', () => {
    UserManager.equipRelic('golden_compass');
    const puzzle = Array.from({ length: 9 }, () => new Array(9).fill(0));
    const state = createBoardMechanicsState(puzzle, 1, 'classic', [], UserManager.getAbilitiesState());

    // Rakam 5 yerleştirildiğinde bonus altın 2 olmalı
    const res5 = applyValidMoveMechanics(state, 0, 0, 5, Date.now());
    expect(res5.bonusGold).toBe(2);

    // Rakam 3 yerleştirildiğinde bonus altın 0 olmalı
    const res3 = applyValidMoveMechanics(state, 0, 1, 3, Date.now());
    expect(res3.bonusGold).toBe(0);
  });

  it('4. Chrono Hourglass: Kıvılcım akışında süreyi +5 saniye uzatmalı', () => {
    localStorage.setItem('sudoku_level', '50');
    UserManager.equipRelic('chrono_hourglass');
    const puzzle = Array.from({ length: 9 }, () => new Array(9).fill(0));
    const state = createBoardMechanicsState(puzzle, 1, 'classic', [], UserManager.getAbilitiesState());

    // Kıvılcım hücresi ekle
    state.cells.push({
      r: 2,
      c: 2,
      kind: 'spark',
      state: 'active'
    });

    const now = 100000;
    applyValidMoveMechanics(state, 2, 2, 7, now);

    // Normal spark: 20s. Chrono Hourglass ile: 20s + 5s = 25s (25.000 ms)
    expect(state.sparkFlowEndsAtMs).toBe(now + 25000);
  });

  it('5. Ancient Rune Stone: Zaferde kazanılan rün kristallerine +1 eklemeli', () => {
    localStorage.setItem('sudoku_level', '50');
    const puzzle = Array.from({ length: 9 }, () => new Array(9).fill(0));
    const state = createBoardMechanicsState(puzzle, 1, 'classic', [], UserManager.getAbilitiesState());
    state.crystalsEarnedInRun = 1;

    // Kalıntı yokken (null verilince golden_compass'a döner, o da kristal artırmaz)
    UserManager.equipRelic(null);
    const standardCrystals = computeFinalRunCrystals(state, 0, 30);

    // Ancient rune stone takılıyken
    UserManager.equipRelic('ancient_rune_stone');
    const boostedCrystals = computeFinalRunCrystals(state, 0, 30);

    expect(boostedCrystals).toBe(standardCrystals + 1);
  });

  it('6. Bölüm Hazırlık Paneli (#prep-relics-row) Etkileşimi', () => {
    localStorage.setItem('sudoku_level', '50'); // Tüm kalıntılar açık
    openLevelPrepModal({
      level: 1,
      diff: 'basit',
      variant: 'classic',
      onConfirmStart: () => {}
    });

    const relicsRow = document.getElementById('prep-relics-row');
    const relicStatus = document.getElementById('prep-relic-status');

    expect(relicsRow).not.toBeNull();
    expect(relicsRow?.children.length).toBe(5);
    expect(relicStatus?.innerText).toContain('Altın Pusula');

    // 2. Kalıntıya (Chrono Hourglass) tıkla -> Kuşanılmalı
    const hourglassBtn = relicsRow?.children[1] as HTMLElement;
    hourglassBtn?.click();

    expect(UserManager.getEquippedRelic()).toBe('chrono_hourglass');

    closeLevelPrepModal();
  });

  it('7. Çift Dilli Bütünlük (TR <-> EN): Tüm relic_* anahtarları tam olmalı', () => {
    const keys = [
      'relics_slot_title',
      'relic_golden_compass_name',
      'relic_golden_compass_desc',
      'relic_chrono_hourglass_name',
      'relic_chrono_hourglass_desc',
      'relic_mirror_cage_name',
      'relic_mirror_cage_desc',
      'relic_ancient_rune_stone_name',
      'relic_ancient_rune_stone_desc',
      'relic_scout_mirror_name',
      'relic_scout_mirror_desc',
      'relic_toast_equipped',
      'relic_toast_unequipped',
      'relic_locked_hint'
    ];

    const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;

    keys.forEach(k => {
      const trVal = TRANSLATIONS.tr[k] || '';
      const enVal = TRANSLATIONS.en[k] || '';

      expect(trVal.length).toBeGreaterThan(0);
      expect(enVal.length).toBeGreaterThan(0);
      expect(trCharRegex.test(enVal)).toBe(false);
    });
  });
});
