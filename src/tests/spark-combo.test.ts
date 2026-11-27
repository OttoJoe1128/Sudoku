// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBoardMechanicsState,
  applyValidMoveMechanics,
  applyMistakeMechanics
} from '../engine/boardMechanics';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { TRANSLATIONS, setLang, t } from '../i18n/translations';

describe('Faz 2 - Adım 2.3: Kıvılcım Akışı (Spark Flow) Dinamik Kombo Sistemi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
  });

  it('1. Dinamik Kombo Katlanması & Artan Altın Çarpanı', () => {
    const puzzle = Array.from({ length: 9 }, () => new Array(9).fill(0));
    const state = createBoardMechanicsState(puzzle, 3, 'classic', [], UserManager.getAbilitiesState());

    const now = 100000;
    state.sparkFlowEndsAtMs = now + 20000; // Kıvılcım aktif

    // 1. Doğru hamle
    const move1 = applyValidMoveMechanics(state, 0, 0, 1, now);
    expect(state.sparkCombo).toBe(1);
    expect(move1.bonusGold).toBe(1);

    // 2. Doğru hamle
    const move2 = applyValidMoveMechanics(state, 0, 1, 2, now + 1000);
    expect(state.sparkCombo).toBe(2);
    expect(move2.bonusGold).toBe(2); // 1 + floor(2/2) = 2

    // 3. Doğru hamle
    const move3 = applyValidMoveMechanics(state, 0, 2, 3, now + 2000);
    expect(state.sparkCombo).toBe(3);
    expect(move3.bonusGold).toBe(2); // 1 + floor(3/2) = 2

    // 4. Doğru hamle
    const move4 = applyValidMoveMechanics(state, 0, 3, 4, now + 3000);
    expect(state.sparkCombo).toBe(4);
    expect(move4.bonusGold).toBe(3); // 1 + floor(4/2) = 3
  });

  it('2. Hata Anında Kombo Kırılması (Break Mechanic)', () => {
    const puzzle = Array.from({ length: 9 }, () => new Array(9).fill(0));
    const state = createBoardMechanicsState(puzzle, 3, 'classic', [], UserManager.getAbilitiesState());

    const now = 100000;
    state.sparkFlowEndsAtMs = now + 20000;
    state.sparkCombo = 4;

    // Hata yapıldı
    const mistakeRes = applyMistakeMechanics(state, 5, 5, now);
    expect(mistakeRes.comboBroken).toBe(true);
    expect(state.sparkCombo).toBe(0);
    expect(state.sparkFlowEndsAtMs).toBe(0);

    // Kombo kırıldıktan sonra yapılan ikinci hatada comboBroken false olmalı (zaten 0 dı)
    const mistakeRes2 = applyMistakeMechanics(state, 5, 6, now + 100);
    expect(mistakeRes2.comboBroken).toBe(false);
  });

  it('3. Canlı HUD Göstergesi (#game-momentum-pill)', () => {
    const puzzle = Array.from({ length: 9 }, () => new Array(9).fill(0));
    const state = createBoardMechanicsState(puzzle, 3, 'classic', [], UserManager.getAbilitiesState());

    const now = 100000;
    state.sparkFlowEndsAtMs = now + 12000;
    state.sparkCombo = 3;

    UIManager.updateMechanicsLiveTimers(state, 0, now);
    const pill = document.getElementById('game-momentum-pill');

    expect(pill?.classList.contains('hidden')).toBe(false);
    expect(pill?.innerText).toContain('⚡ x3 (12s)');
  });

  it('4. Çift Dilli Bütünlük (TR <-> EN): spark_combo_* anahtarları', () => {
    const keys = [
      'spark_combo_broken',
      'spark_combo_gold_bonus'
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
