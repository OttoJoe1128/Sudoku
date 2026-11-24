import { Capacitor } from '@capacitor/core';
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
import { SoundManager } from '../engine/soundManager';

export const AD_CONFIG = {
  USE_TEST_ADS: import.meta.env.PROD ? false : true,
  TEST_REWARDED_ANDROID_ID: 'ca-app-pub-3940256099942544/5224354917',
  PROD_REWARDED_ANDROID_ID: 'ca-app-pub-9186685815420341/4830997068',
  REVIVE_GOLD_COST: 50
};

export function canOfferSecondChance(opts: { isMatchMode: boolean; isPlacementExam: boolean }): boolean {
  return !opts.isMatchMode && !opts.isPlacementExam;
}

export function tryGoldRevive(currentGold: number, cost: number = AD_CONFIG.REVIVE_GOLD_COST): { success: boolean; newGold: number; newErrors: number } {
  if (currentGold >= cost) {
    return { success: true, newGold: currentGold - cost, newErrors: 2 };
  }
  return { success: false, newGold: currentGold, newErrors: 3 };
}

let isAdReady = false;
let isPreloading = false;

export const AdService = {
  isAdReady(): boolean {
    return isAdReady;
  },

  async preloadRewardedAd(): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return;
    }
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    if (isAdReady || isPreloading) {
      return;
    }

    isPreloading = true;
    try {
      const adId = AD_CONFIG.USE_TEST_ADS
        ? AD_CONFIG.TEST_REWARDED_ANDROID_ID
        : AD_CONFIG.PROD_REWARDED_ANDROID_ID;

      await AdMob.prepareRewardVideoAd({
        adId,
        isTesting: AD_CONFIG.USE_TEST_ADS
      });
      isAdReady = true;
    } catch (e) {
      isAdReady = false;
      console.warn("Reklam ön-yükleme hatası:", e);
    } finally {
      isPreloading = false;
    }
  },

  async init(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await AdMob.initialize({ initializeForTesting: AD_CONFIG.USE_TEST_ADS });
        await this.preloadRewardedAd();
      }
    } catch (e) {
      console.warn("AdMob init uyarisi:", e);
    }
  },

  async showRewardedReviveAd(): Promise<{ rewarded: boolean; reason?: string }> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { rewarded: false, reason: 'offline' };
    }

    if (!Capacitor.isNativePlatform()) {
      return { rewarded: false, reason: 'web_unsupported' };
    }

    let isRewarded = false;
    let listener: any = null;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      listener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        isRewarded = true;
      });

      if (!isAdReady) {
        const adId = AD_CONFIG.USE_TEST_ADS
          ? AD_CONFIG.TEST_REWARDED_ANDROID_ID
          : AD_CONFIG.PROD_REWARDED_ANDROID_ID;

        // 15 sn timeout SADECE reklam hazirlama/yukleme (prepare) asamasi icin
        const preparePromise = AdMob.prepareRewardVideoAd({
          adId,
          isTesting: AD_CONFIG.USE_TEST_ADS
        });

        const loadTimeoutPromise = new Promise<{ loadFailed: boolean }>((resolve) => {
          timeoutId = setTimeout(() => resolve({ loadFailed: true }), 15000);
        });

        const prepResult = await Promise.race([preparePromise, loadTimeoutPromise]);
        if (prepResult && (prepResult as any).loadFailed) {
          return { rewarded: false, reason: 'timeout' };
        }
        if (timeoutId) clearTimeout(timeoutId);
      }

      // Reklam gosterilmeden hemen once muzigi duraklat
      SoundManager.pauseForBackground();

      // Reklam gosterimi ve show timeout korumasi (45 sn)
      const showPromise = AdMob.showRewardVideoAd();
      const showTimeoutPromise = new Promise<{ showFailed: boolean }>((resolve) => {
        timeoutId = setTimeout(() => resolve({ showFailed: true }), 45000);
      });

      const showResult = await Promise.race([showPromise, showTimeoutPromise]);
      if (showResult && (showResult as any).showFailed) {
        return { rewarded: false, reason: 'show_timeout' };
      }
      if (timeoutId) clearTimeout(timeoutId);

      return { rewarded: isRewarded };
    } catch (e) {
      console.warn("Ödüllü reklam gösterilemedi:", e);
      return { rewarded: false, reason: 'load_failed' };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      if (listener && typeof listener.remove === 'function') {
        try {
          listener.remove();
        } catch {
          // ignore
        }
      }
      isAdReady = false;
      SoundManager.resumeFromBackground();
      setTimeout(() => {
        this.preloadRewardedAd().catch(() => {});
      }, 1000);
    }
  }
};
