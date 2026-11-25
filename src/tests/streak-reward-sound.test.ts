// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { SoundManager } from '../engine/soundManager';
import { setLang, TRANSLATIONS } from '../i18n/translations';
import { openStreakModal, closeStreakModal, initStreakController } from '../controllers/streakController';

describe('Faz 11 Organik Kalem/Silgi Sesleri & 24 Sa Süreli Yetenek Ödül Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initStreakController();
  });

  it('1. Organik Kurşun Kalem ve Silgi Ses Motoru: playNumber ve playErase hatasız tetiklenmeli', () => {
    expect(() => SoundManager.playNumber()).not.toThrow();
    expect(() => SoundManager.playErase()).not.toThrow();
  });

  it('2. 24 Saatlik Geçici Yetenek Ödül Motoru: 7 günlük seri tamamlandığında geçici yetenek tanımlanmalı', () => {
    expect(UserManager.getTemporaryAbilityInfo().id).toBeNull();

    // 7 günlük seri verisi oluştur
    localStorage.setItem('sudoku_daily_streak', '7');

    openStreakModal();

    const tempInfo = UserManager.getTemporaryAbilityInfo();
    expect(tempInfo.id).not.toBeNull();
    expect(tempInfo.endsAtMs).toBeGreaterThan(Date.now());

    closeStreakModal();
  });

  it('3. Gerçek Gün İsimleri & Takvim Renderı: Takvimde 7 gün (Pzt..Paz) bulunmalı', () => {
    openStreakModal();

    const grid = document.getElementById('streak-calendar-grid');
    expect(grid?.children.length).toBe(7);

    const firstDaySpan = grid?.children[0].querySelector('span');
    expect(firstDaySpan?.textContent).toBe('Pzt');
  });

  it('4. Çift Dilli Sızıntı (TR <-> EN): Yeni streak_reward_* anahtarları eksiksiz ve sızıntısız olmalı', () => {
    const keys = [
      'streak_reward_title',
      'streak_reward_desc',
      'streak_toast_reward_granted'
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
