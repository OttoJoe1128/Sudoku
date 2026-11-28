// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  SEASONS,
  getCurrentSeason,
  getRemainingSeasonDays,
  SeasonalEventManager
} from '../engine/seasonalEvents';
import {
  createInitialPaceMetrics,
  recordMoveInMetrics,
  evaluateDDA
} from '../engine/adaptiveDifficulty';
import { ShopManager } from '../engine/shop';
import { UserManager } from '../store/userState';
import { TRANSLATIONS, setLang } from '../i18n/translations';

describe('Faz 3: Canlı Operasyonlar (Live-Ops), Tematik Pul Koleksiyonu & DDA', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
  });

  describe('1. 14 Günlük Sezonluk Rotasyon Motoru', () => {
    it('Sezonlar 14 günlük periyotlarla deterministik olarak dönmeli', () => {
      expect(SEASONS.length).toBe(5);

      const day1 = 1000 * 86400 * 1000; // Rastgele bir epoch
      const season1 = getCurrentSeason(day1);
      expect(season1).toBeDefined();
      expect(season1.totalStamps).toBe(9);

      // 14 gün sonrası -> Bir sonraki sezona geçmeli
      const day15 = day1 + (14 * 86400 * 1000);
      const season2 = getCurrentSeason(day15);
      expect(season2.index).toBe((season1.index + 1) % SEASONS.length);

      // Kalan gün sayısı 1 ile 14 arasında olmalı
      const remDays = getRemainingSeasonDays(day1);
      expect(remDays).toBeGreaterThanOrEqual(1);
      expect(remDays).toBeLessThanOrEqual(14);
    });
  });

  describe('2. Tematik Pul Toplama & Kartpostal Birleştirme', () => {
    it('9 pul toplandığında kartpostal tamamlanmalı ve tema ödülü verilmeli', async () => {
      const seasonId = 'ancient_egypt';
      expect(SeasonalEventManager.getCollectedStamps(seasonId)).toEqual([]);
      expect(SeasonalEventManager.isPostcardCompleted(seasonId)).toBe(false);

      // 8 pul topla
      for (let i = 0; i < 8; i++) {
        const res = SeasonalEventManager.awardRandomStamp(seasonId);
        expect(res.newStampIndex).toBeGreaterThanOrEqual(0);
        expect(res.isCompleted).toBe(false);
      }
      expect(SeasonalEventManager.getCollectedStamps(seasonId).length).toBe(8);

      // 9. pulu topla -> Tamamlanmalı!
      const finalRes = SeasonalEventManager.awardRandomStamp(seasonId);
      expect(finalRes.isCompleted).toBe(true);
      expect(SeasonalEventManager.isPostcardCompleted(seasonId)).toBe(true);

      // Ödülü talep et
      const initialGold = UserManager.getGold();
      const initialCrystals = UserManager.getCrystals();

      const claimRes = await SeasonalEventManager.claimSeasonReward(seasonId);
      expect(claimRes.success).toBe(true);
      expect(claimRes.gold).toBe(150);
      expect(claimRes.crystals).toBe(20);

      expect(UserManager.getGold()).toBe(initialGold + 150);
      expect(UserManager.getCrystals()).toBe(initialCrystals + 20);

      // Tematik Mısır temasının kilidi açılmış olmalı
      expect(ShopManager.getPurchasedThemes()).toContain('theme-egypt');

      // İkinci kez ödül talep edilememeli
      const claimAgain = await SeasonalEventManager.claimSeasonReward(seasonId);
      expect(claimAgain.success).toBe(false);
    });
  });

  describe('3. Dinamik Yapay Zekâ Destekli Adaptif Zorluk (DDA)', () => {
    it('Üst üste 2 hata gözcü desteğini (scoutSupportActive) tetiklemeli', () => {
      let metrics = createInitialPaceMetrics(10000);

      metrics = recordMoveInMetrics(metrics, false, 12000);
      let dda = evaluateDDA(metrics, 12000);
      expect(dda.scoutSupportActive).toBe(false);

      metrics = recordMoveInMetrics(metrics, false, 14000);
      dda = evaluateDDA(metrics, 14000);
      expect(dda.scoutSupportActive).toBe(true);
    });

    it('5 hızlı ve hatasız hamle usta akışını (masterFlowActive) ve skor bonusunu tetiklemeli', () => {
      let metrics = createInitialPaceMetrics(10000);

      // 5 ardışık hızlı hamle (her biri 2 saniye)
      for (let i = 1; i <= 5; i++) {
        metrics = recordMoveInMetrics(metrics, true, 10000 + i * 2000);
      }

      const dda = evaluateDDA(metrics, 20000);
      expect(dda.masterFlowActive).toBe(true);
      expect(dda.scoreMultiplier).toBe(1.25);
    });

    it('45 saniye hamlesiz kalındığında kararsızlık (hesitationDetected) saptanmalı', () => {
      let metrics = createInitialPaceMetrics(10000);
      metrics = recordMoveInMetrics(metrics, true, 12000);

      // 10 saniye sonra -> henüz kararsızlık yok
      let dda = evaluateDDA(metrics, 22000);
      expect(dda.hesitationDetected).toBe(false);

      // 50 saniye sonra -> kararsızlık algılandı
      dda = evaluateDDA(metrics, 62000);
      expect(dda.hesitationDetected).toBe(true);
    });
  });

  describe('4. Çift Dilli Bütünlük (TR <-> EN): season_* anahtarları', () => {
    it('Tüm season_* çevirileri iki dilde de eksiksiz olmalı', () => {
      const keys = [
        'season_title',
        'season_stamps_progress',
        'season_btn_claim',
        'season_reward_claimed',
        'season_toast_stamp_found',
        'season_toast_reward_claimed',
        'season_egypt_name',
        'season_egypt_desc',
        'season_cyber_name',
        'season_cyber_desc',
        'season_emerald_name',
        'season_emerald_desc',
        'season_celestial_name',
        'season_celestial_desc'
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
});
