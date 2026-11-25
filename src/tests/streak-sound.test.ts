// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { SoundManager } from '../engine/soundManager';
import { setLang, TRANSLATIONS } from '../i18n/translations';
import { openStreakModal, closeStreakModal, initStreakController } from '../controllers/streakController';

describe('Faz 6 Organik Ses & 7 Günlük Seri Koruma Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initStreakController();
  });

  it('1. Organik Kağıt Sesi Sentezleyicisi: playNumber hatasız tetiklenmeli', () => {
    expect(() => SoundManager.playNumber()).not.toThrow();
  });

  it('2. 7 Günlük Seri Koruma Modalı: Modal açılmalı, 7 günlük takvim dolmalı ve kırık seri altınla tamir yapılmalı', async () => {
    // 3 gün önceye ayarla -> isStreakBroken === true
    const past = new Date();
    past.setDate(past.getDate() - 3);
    const pastStr = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
    localStorage.setItem('sudoku_last_streak_date', pastStr);

    openStreakModal();

    const modal = document.getElementById('streak-modal');
    const calendar = document.getElementById('streak-calendar-grid');
    const goldRepairBtn = document.getElementById('btn-streak-repair-gold') as HTMLButtonElement;

    expect(modal?.classList.contains('hidden')).toBe(false);
    expect(calendar?.children.length).toBe(7);
    expect(goldRepairBtn.hasAttribute('disabled')).toBe(false);

    // Altın 100 yap
    await UserManager.updateProgress(1, 100);

    goldRepairBtn?.click();
    await new Promise(r => setTimeout(r, 50));

    // 50 Altın düşmeli, yeni seri 1 olmalı
    expect(UserManager.getGold()).toBe(50);
    expect(UserManager.getDailyStreak()).toBe(1);

    closeStreakModal();
    expect(modal?.classList.contains('hidden')).toBe(true);
  });

  it('3. Çift Dilli Sızıntı (TR <-> EN): Yeni streak_* anahtarları eksiksiz ve sızıntısız olmalı', () => {
    const keys = [
      'streak_modal_title',
      'streak_sub_active',
      'streak_day_tag',
      'streak_btn_repair_gold',
      'streak_btn_repair_ad',
      'streak_toast_repaired',
      'streak_toast_no_gold'
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
