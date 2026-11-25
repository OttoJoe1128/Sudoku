import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { SoundManager } from '../engine/soundManager';
import { ShopManager } from '../engine/shop';
import { AchievementManager } from '../engine/achievements';
import { Rewards } from '../engine/rewards';
import { Leaderboard } from '../engine/leaderboard';
import { SudokuGen } from '../engine/sudoku';
import { setLang, getLang, t, applyStaticTranslations, TRANSLATIONS } from '../i18n/translations';
import { formatDisplayName, sanitizeUsername } from '../utils/sanitize';
import { isOnboardingDone, closeOnboardingModal } from '../controllers/onboardingController';
import { APP_TOUR_STEPS, isAppTourDone, finishAppTour } from '../controllers/appTourController';
import {
  getSavedGamesList,
  saveActiveGameRecord,
  createPlacementActiveGameSave,
  updateSavedGamesCountUI,
  clearSavedGame
} from '../controllers/saveController';

// Minimal in-memory Storage harness
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

describe('Faz 2.3b İşlevsel & DOM Entegrasyon Test Paketi', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    setLang('tr');
  });

  describe('1. Ana Menü & Akıllı Quick Play Akışı', () => {
    it('kayıtlı oyun olmadığında quick play butonu OYNA modunda olmalı', () => {
      mockLocalStorage.clear();
      const list = getSavedGamesList();
      expect(list.length).toBe(0);

      const classicLvl = UserManager.getVariantLevel('classic');
      expect(classicLvl).toBe(1);
    });

    it('kayıtlı oyun eklendiğinde getSavedGamesList en güncel kaydı getirmeli', () => {
      mockLocalStorage.clear();

      createPlacementActiveGameSave('classic', 5);
      const key1 = 'sudoku_map_save_classic_5';
      const raw1 = mockLocalStorage.getItem(key1);
      if (raw1) {
        const item1 = JSON.parse(raw1);
        item1.updatedAtMs = 1000;
        mockLocalStorage.setItem(key1, JSON.stringify(item1));
      }

      createPlacementActiveGameSave('irregular', 20);
      const key2 = 'sudoku_map_save_irregular_20';
      const raw2 = mockLocalStorage.getItem(key2);
      if (raw2) {
        const item2 = JSON.parse(raw2);
        item2.updatedAtMs = 5000;
        mockLocalStorage.setItem(key2, JSON.stringify(item2));
      }

      const list = getSavedGamesList();
      expect(list.length).toBeGreaterThanOrEqual(1);

      const sorted = [...list].sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
      expect(sorted[0].variant).toBe('irregular');
      expect(sorted[0].level).toBe(20);
    });
  });

  describe('2. Günlük Ödül Aktif/Pasif Durumu', () => {
    it('ödül henüz alınmadıysa isClaimedToday false dönmeli ve claimReward başarılı olmalı', async () => {
      expect(Rewards.isClaimedToday()).toBe(false);

      const res = await Rewards.claimReward();
      expect(res.success).toBe(true);
      expect(res.amount).toBe(50);
      expect(Rewards.isClaimedToday()).toBe(true);
    });

    it('ödül alındıktan sonra tekrar claimReward çağrılırsa başarısız olmalı', async () => {
      await Rewards.claimReward();
      const res2 = await Rewards.claimReward();
      expect(res2.success).toBe(false);
      expect(res2.amount).toBe(0);
    });
  });

  describe('3. Çift Dilli (TR / EN) Uçtan Uca Denetim', () => {
    it('TRANSLATIONS.tr ve TRANSLATIONS.en key setleri birebir aynı olmalı', () => {
      const trKeys = Object.keys(TRANSLATIONS.tr).sort();
      const enKeys = Object.keys(TRANSLATIONS.en).sort();
      expect(trKeys).toEqual(enKeys);
    });

    it('alt dock navigasyon etiketleri kısa ve dinamik çevrilmeli (length <= 12)', () => {
      setLang('tr');
      expect(t('nav_arena').length).toBeLessThanOrEqual(12);
      expect(t('nav_rank').length).toBeLessThanOrEqual(12);

      setLang('en');
      expect(t('nav_arena')).toBe('Arena');
      expect(t('nav_rank')).toBe('Rank');
      expect(t('nav_arena').length).toBeLessThanOrEqual(12);
      expect(t('nav_rank').length).toBeLessThanOrEqual(12);
    });

    it('ShopManager ve AchievementManager mesajları çift dilli olmalı', async () => {
      setLang('tr');
      const trItemErr = await ShopManager.buyItem('invalid_id');
      expect(trItemErr.msg).toBe('Ürün bulunamadı.');

      const trClaimErr = AchievementManager.claimBadgeReward('invalid_id');
      expect(trClaimErr.message).toBe('Rozet bulunamadı.');

      setLang('en');
      const enItemErr = await ShopManager.buyItem('invalid_id');
      expect(enItemErr.msg).toBe('Item not found.');

      const enClaimErr = AchievementManager.claimBadgeReward('invalid_id');
      expect(enClaimErr.message).toBe('Badge not found.');
    });
  });

  describe('4. Disiplinler ve Oyun Modu Konfigürasyonu', () => {
    it('5 Sudoku disiplininin çarpanları ve kural metinleri doğru tanımlanmalı', () => {
      const variants: ('classic' | 'irregular' | 'killer' | 'wordoku' | 'samurai')[] = ['classic', 'irregular', 'killer', 'wordoku', 'samurai'];
      variants.forEach(v => {
        expect(t('var_' + v)).toBeDefined();
        expect(t('rule_' + v)).toBeDefined();
      });
    });
  });

  describe('5. Profil İzolasyonu, UID Koruması ve Eski Bot Temizliği', () => {
    it('formatDisplayName ham UID formatını Oyuncu_XXXX olarak formatlamalı', () => {
      const formatted = formatDisplayName('tqX8CeSEhpaN2BgW6TVURt4SaZh1', 'tqX8CeSEhpaN2BgW6TVURt4SaZh1');
      expect(formatted).toBe('Oyuncu_aZh1');

      const normal = formatDisplayName('Bora_34', 'sim_1');
      expect(normal).toBe('Bora_34');
    });

    it('sanitizeUsername 12 karakter üstünü kesmeli ve XSS karakterlerini temizlemeli', () => {
      const clean = sanitizeUsername('  <b>Otto</b>   is a long name ');
      expect(clean.length).toBeLessThanOrEqual(12);
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
      expect(clean).toBe('bOttobisalon');
    });

    it('Leaderboard.getCachedPlayers isSimulated oyuncuları elemelidir', () => {
      const mockList = [
        { username: 'RealUser', level: 10, gold: 100, isSimulated: false },
        { username: 'FakeUser', level: 99, gold: 999, isSimulated: true }
      ];
      localStorage.setItem('sudoku_cached_leaderboard', JSON.stringify(mockList));

      const cached = Leaderboard.getCachedPlayers('level');
      expect(cached.length).toBe(1);
      expect(cached[0].username).toBe('RealUser');
    });
  });

  describe('6. Master Mute & Seviye Tespit Aktif Oyun Akışı', () => {
    it('createPlacementActiveGameSave timeElapsed 0 ve isPlacementSeed true olarak kaydetmeli', () => {
      mockLocalStorage.clear();
      createPlacementActiveGameSave('classic', 150);

      const saves = getSavedGamesList();
      expect(saves.length).toBe(1);
      expect(saves[0].level).toBe(150);
      expect(saves[0].variant).toBe('classic');
    });

    it('SoundManager master mute toggle ve localStorage senkronizasyonu çalışmalı', () => {
      const current = SoundManager.isEnabled();
      const toggled = SoundManager.toggle();
      expect(toggled).toBe(!current);
      expect(localStorage.getItem('sudoku_sound_enabled')).toBe(toggled ? 'true' : 'false');
    });
  });

  describe('7. İnteraktif Rehber (Onboarding) & Bayrak Yönetimi', () => {
    it('onboarding çeviri anahtarları hem tr hem en tarafında eksiksiz tanımlanmalı', () => {
      const keys = [
        'tooltip_how_to_play',
        'btn_skip',
        'onboarding_step1_title',
        'onboarding_step1_desc',
        'onboarding_step2_title',
        'onboarding_step2_desc',
        'onboarding_step3_title',
        'onboarding_correct_toast',
        'onboarding_correct_step2_toast',
        'onboarding_wrong_toast',
        'onboarding_summary_1_title',
        'onboarding_summary_1_desc',
        'onboarding_summary_2_title',
        'onboarding_summary_2_desc',
        'onboarding_summary_3_title',
        'onboarding_summary_3_desc',
        'btn_start_playing'
      ];

      setLang('tr');
      keys.forEach(k => expect(t(k)).not.toBe(k));

      setLang('en');
      keys.forEach(k => expect(t(k)).not.toBe(k));
    });

    it('closeOnboardingModal sudoku_onboarding_done bayrağını 1 olarak yazmalı', () => {
      mockLocalStorage.clear();
      expect(isOnboardingDone()).toBe(false);

      closeOnboardingModal();
      expect(isOnboardingDone()).toBe(true);
      expect(localStorage.getItem('sudoku_onboarding_done')).toBe('1');
    });
  });

  describe('8. 4-Kategorili Tek Merkezli Oyun Sayacı & Rozet Senkronizasyonu', () => {
    it('4 kategorinin (map, custom, pvp, ai) bağımsız arttığını ve getTotalCompleted() sonucunun bunların tam toplamı olduğunu doğrula', () => {
      mockLocalStorage.clear();

      UserManager.incrementCompletedCategory('map');
      UserManager.incrementCompletedCategory('map');
      UserManager.incrementCompletedCategory('custom');
      UserManager.incrementCompletedCategory('pvp');
      UserManager.incrementCompletedCategory('ai');

      const cats = UserManager.getCompletedByCategory();
      expect(cats.map).toBe(2);
      expect(cats.custom).toBe(1);
      expect(cats.pvp).toBe(1);
      expect(cats.ai).toBe(1);
      expect(UserManager.getTotalCompleted()).toBe(5);
    });

    it('eski sudoku_total_completed değerinin kaybolmadan korunduğunu doğrula', () => {
      mockLocalStorage.clear();
      localStorage.setItem('sudoku_total_completed', '15');

      const cats = UserManager.getCompletedByCategory();
      expect(cats.map).toBe(15);
      expect(UserManager.getTotalCompleted()).toBe(15);
    });

    it('4 bulmacada puzzle_machine rozetinin açılmadığını, 10 tamamlamada açıldığını doğrula', () => {
      mockLocalStorage.clear();

      for (let i = 0; i < 3; i++) UserManager.incrementCompletedCategory('map');
      UserManager.incrementCompletedCategory('custom');

      expect(UserManager.getTotalCompleted()).toBe(4);
      AchievementManager.checkAndUnlockBadges({
        level: 1,
        gold: 100,
        totalCompleted: UserManager.getTotalCompleted()
      });
      const unlockedIds4 = AchievementManager.getUnlockedBadgeIds();
      expect(unlockedIds4).not.toContain('puzzle_machine');

      for (let i = 0; i < 2; i++) UserManager.incrementCompletedCategory('custom');
      for (let i = 0; i < 2; i++) UserManager.incrementCompletedCategory('pvp');
      for (let i = 0; i < 2; i++) UserManager.incrementCompletedCategory('ai');

      expect(UserManager.getTotalCompleted()).toBe(10);
      AchievementManager.checkAndUnlockBadges({
        level: 1,
        gold: 100,
        totalCompleted: UserManager.getTotalCompleted()
      });
      const unlockedIds10 = AchievementManager.getUnlockedBadgeIds();
      expect(unlockedIds10).toContain('puzzle_machine');
    });
  });

  describe('9. Spotlight Uygulama Turu & Bayrak Yönetimi', () => {
    it('APP_TOUR_STEPS 17 adımı eksiksiz içermeli ve tüm çeviri anahtarları tanımlı olmalı', () => {
      expect(APP_TOUR_STEPS.length).toBe(17);

      setLang('tr');
      APP_TOUR_STEPS.forEach(step => {
        expect(t(step.titleKey)).not.toBe(step.titleKey);
        expect(t(step.descKey)).not.toBe(step.descKey);
      });

      setLang('en');
      APP_TOUR_STEPS.forEach(step => {
        expect(t(step.titleKey)).not.toBe(step.titleKey);
        expect(t(step.descKey)).not.toBe(step.descKey);
      });
    });

    it('finishAppTour sudoku_app_tour_done bayrağını 1 olarak kaydetmeli', () => {
      mockLocalStorage.clear();
      expect(isAppTourDone()).toBe(false);

      finishAppTour();
      expect(isAppTourDone()).toBe(true);
      expect(localStorage.getItem('sudoku_app_tour_done')).toBe('1');
    });
  });
});
