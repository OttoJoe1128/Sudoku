// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui';
import { UserManager } from '../store/userState';
import { setLang, applyStaticTranslations, TRANSLATIONS } from '../i18n/translations';
import { startGame, initGameController } from '../controllers/gameController';
import { updateSavedGamesCountUI } from '../controllers/saveController';

describe('Faz 5 UX, Numpad Ergonomisi & Retention Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initGameController({
      onUpdateGoldDisplay: () => {},
      onReturnToMap: () => {}
    });
  });

  it('1. Numpad Ergonomisi & Odaklanma: Butonlar min 48px yüksekliğe sahip olmalı, 9/9 tamamlanan rakam pasifleşmeli', () => {
    startGame(1, 'basit', undefined, undefined, 'classic', false);

    const numpadGrid = document.getElementById('numpad-grid');
    const row1 = document.getElementById('numpad-row-1');
    const row2 = document.getElementById('numpad-row-2');
    expect(row1).not.toBeNull();
    expect(row2).not.toBeNull();

    const btn1 = row1?.children[0] as HTMLElement;
    expect(btn1).not.toBeNull();
    expect(btn1.className).toContain('min-h-[48px]');

    // Sayı sayımı map'i ile render testi
    const remainingCounts = new Map<number, number>([
      [1, 0], // 1 rakamı 9/9 tamamlandı
      [2, 5]
    ]);

    UIManager.renderNumpad(() => {}, remainingCounts, false, 2);

    const btnCompleted1 = row1?.children[0] as HTMLElement;
    const btnSelected2 = row1?.children[1] as HTMLElement;

    // Rakam 1 tamamlandı -> pasifleşmeli
    expect(btnCompleted1.className).toContain('opacity-30');
    expect(btnCompleted1.className).toContain('pointer-events-none');
    expect(btnCompleted1.textContent).toContain('✓');

    // Rakam 2 seçili -> altın halka ile vurgulanmalı
    expect(btnSelected2.className).toContain('border-2');
    expect(btnSelected2.className).toContain('border-[var(--accent-gold)]');
  });

  it('2. Kullanıcı Tutundurma (Daily Streak & Progress Bar): Seri sayacı hesaplanmalı ve DOM da yansımalı', () => {
    expect(UserManager.getDailyStreak()).toBe(1);

    const streak1 = UserManager.updateDailyStreak();
    expect(streak1).toBe(1);

    updateSavedGamesCountUI();

    const streakEl = document.getElementById('menu-streak-count');
    const progressBar = document.getElementById('quick-play-progress-bar');

    expect(streakEl?.innerText).toBe('1');
    expect(progressBar).not.toBeNull();
  });

  it('3. Çift Dilli Sızıntı (TR <-> EN): Yeni çeviri anahtarları TR/EN modlarında eksiksiz olmalı', () => {
    const keys = [
      'menu_streak_title',
      'menu_streak_days'
    ];

    const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;

    keys.forEach(k => {
      const trVal = TRANSLATIONS.tr[k] || '';
      const enVal = TRANSLATIONS.en[k] || '';

      expect(trVal.length).toBeGreaterThan(0);
      expect(enVal.length).toBeGreaterThan(0);

      // EN metninde Türkçe özel karakter olmamalı
      expect(trCharRegex.test(enVal)).toBe(false);
    });
  });
});
