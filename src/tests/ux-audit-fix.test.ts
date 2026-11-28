// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui';
import { UserManager } from '../store/userState';
import { SoundManager } from '../engine/soundManager';
import { setLang, t, applyStaticTranslations, TRANSLATIONS } from '../i18n/translations';
import { openStreakModal, initStreakController } from '../controllers/streakController';
import { openLevelPrepModal } from '../controllers/levelPrepController';
import { renderRankBadgeSVG } from '../design/icons';

describe('Faz 7 Tam Kapsamlı Arayüz & Sistem İyileştirme Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initStreakController();
  });

  it('1. Anti-Farm Geçmiş Bölüm Kristal Engeli: Geçmiş seviyelerde (level < userLvl) 0 yeni kristal verilmeli', async () => {
    // Seviyeyi 100 yap
    await UserManager.updateVariantLevel('classic', 100, 500);
    const userLvl = UserManager.getVariantLevel('classic');
    expect(userLvl).toBe(100);

    // Seviye 1 (geçmiş seviye) için kristal kaydetme denemesi
    const res = await UserManager.recordLevelCrystals('classic', 1, 3, 3);
    expect(res.delta).toBe(0); // Anti-farm kuralı: 0 yeni kristal!

    // Geçmiş seviye hazırlık modalı ikaz kartı testi
    openLevelPrepModal({
      level: 1,
      diff: 'basit',
      variant: 'classic',
      onConfirmStart: () => {}
    });

    const replayBanner = document.getElementById('prep-replay-banner');
    expect(replayBanner?.classList.contains('hidden')).toBe(false);
  });

  it('2. Organik Kalem Sesi & Haptik Entegrasyonu: SoundManager.playNumber ve vibrate hatasız çalışmalı', () => {
    expect(() => SoundManager.playNumber()).not.toThrow();
    expect(() => SoundManager.vibrate(10)).not.toThrow();
  });

  it('3. Günlük Seri Modalı 4. Gün Satır Kayması Koruması: 4.Gün (Per) yazısı whitespace-nowrap taşımalı', () => {
    openStreakModal();
    const calendar = document.getElementById('streak-calendar-grid');
    expect(calendar?.children.length).toBe(7);

    const day4Card = calendar?.children[3] as HTMLElement;
    const tagSpan = day4Card?.querySelector('span');

    expect(tagSpan?.className).toContain('whitespace-nowrap');
    expect(tagSpan?.textContent).toBe('Per');
  });

  it('4. Oyuncu Ünvanı EN Dilinde Sığma & Truncate Koruması: Long rank titles should fit without breaking layout', () => {
    setLang('en');
    const badgeHTML = renderRankBadgeSVG('🥇 Zihin Ustası');

    expect(badgeHTML).toContain('truncate');

    const titleEl = document.getElementById('menu-player-title');
    if (titleEl) {
      titleEl.innerHTML = badgeHTML;
      expect(titleEl.className).toContain('truncate');
    }
  });

  it('5. Çift Dilli Bütünlük: Tüm prep_replay_* ve streak_* anahtarları eksiksiz ve sızıntısız olmalı', () => {
    const keys = [
      'prep_replay_title',
      'prep_replay_desc',
      'streak_modal_title',
      'streak_sub_active',
      'streak_day_tag'
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
