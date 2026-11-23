// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { setLang, getLang, t, applyStaticTranslations, TRANSLATIONS } from '../i18n/translations';
import {
  AbilityId,
  ABILITIES,
  createDefaultAbilitiesState,
  getAbilityCooldownMs,
  getRemainingCooldownMs,
  getCooldownProgressRatio,
  getCooldownSweepDegrees,
  computeLevelCrystalDelta,
  formatCooldownShort
} from '../engine/abilities';
import {
  initAbilitiesController,
  openAbilitiesModal,
  closeAbilitiesModal,
  refreshAbilitiesLanguageUI,
  updateCrystalDisplays
} from '../controllers/abilitiesController';

describe('Faz 3a Çift Ekonomi (Altın + Rün Kristali) & 5 Yetenek Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');

    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initAbilitiesController();
  });

  describe('1. Geri Dönüp Kristal Toplama & Anti-Farm Sınır Testleri (6 Senaryo)', () => {
    it('Senaryo 1-4: Seviye 1 üstünden kademeli toplama, anti-farm kilidi ve tavan tamamlama', async () => {
      // 1. Oynayış: 1 kristal toplandı (maks 3)
      let res1 = await UserManager.recordLevelCrystals('classic', 1, 1, 3);
      expect(res1.delta).toBe(1);
      expect(res1.bestCollected).toBe(1);
      expect(res1.totalCrystals).toBe(1);

      // 2. Oynayış: Aynı seviye tekrar oynandı, yine 1 kristal toplandı -> delta = 0 (Anti-Farm!)
      let res2 = await UserManager.recordLevelCrystals('classic', 1, 1, 3);
      expect(res2.delta).toBe(0);
      expect(res2.bestCollected).toBe(1);
      expect(res2.totalCrystals).toBe(1);

      // 3. Oynayış: Aynı seviye 3 kristal kusursuz tamamlandı -> Yalnızca kaçırılan 2 kristal eklenir
      let res3 = await UserManager.recordLevelCrystals('classic', 1, 3, 3);
      expect(res3.delta).toBe(2);
      expect(res3.bestCollected).toBe(3);
      expect(res3.totalCrystals).toBe(3);

      // 4. Oynayış: 4. kez tekrar oynandı ve 3 kristal toplandı -> tavan dolu olduğu için delta = 0
      let res4 = await UserManager.recordLevelCrystals('classic', 1, 3, 3);
      expect(res4.delta).toBe(0);
      expect(res4.bestCollected).toBe(3);
      expect(res4.totalCrystals).toBe(3);
    });

    it('Senaryo 5: Hatalı yüksek giriş tavan sınırına kırpılmalı', async () => {
      let res = await UserManager.recordLevelCrystals('classic', 1, 99, 3);
      expect(res.bestCollected).toBe(3);
      expect(res.delta).toBe(3);
      expect(res.totalCrystals).toBe(3);

      // İkinci kez 99 girilirse 0 delta olmalı
      let res2 = await UserManager.recordLevelCrystals('classic', 1, 99, 3);
      expect(res2.delta).toBe(0);
      expect(res2.totalCrystals).toBe(3);
    });

    it('Senaryo 6: Farklı Sudoku disiplinleri bağımsız kristal kaydı tutmalı', async () => {
      await UserManager.recordLevelCrystals('classic', 1, 3, 3);
      expect(UserManager.getCrystals()).toBe(3);

      // Killer disiplini Seviye 1 için 2 kristal
      let resKiller = await UserManager.recordLevelCrystals('killer', 1, 2, 3);
      expect(resKiller.delta).toBe(2);
      expect(resKiller.bestCollected).toBe(2);
      expect(resKiller.totalCrystals).toBe(5);
    });
  });

  describe('2. Çift Para Birimli Yetenek Yükseltme & Atomiklik Testi', () => {
    it('Başlangıçta oracle_eye Sv.1, diğer 4 yetenek Sv.0 olmalı', () => {
      const state = UserManager.getAbilitiesState();
      expect(state.oracle_eye.level).toBe(1);
      expect(state.crystal_shield.level).toBe(0);
      expect(state.rhythm_bender.level).toBe(0);
      expect(state.seal_breaker.level).toBe(0);
      expect(state.rune_magnet.level).toBe(0);
    });

    it('Kristal yetersizken yükseltme reddedilmeli ve Altına dokunulmamalı', async () => {
      localStorage.setItem('sudoku_crystals', '0');
      localStorage.setItem('sudoku_gold', '100');

      const res = await UserManager.upgradeAbility('crystal_shield');
      expect(res.ok).toBe(false);
      expect(res.reason).toBe('insufficient_crystals');
      expect(UserManager.getGold()).toBe(100);
      expect(UserManager.getCrystals()).toBe(0);
    });

    it('Kristal yeterli ama Altın yetersizken yükseltme reddedilmeli ve Kristale dokunulmamalı', async () => {
      localStorage.setItem('sudoku_crystals', '10');
      localStorage.setItem('sudoku_gold', '5'); // Sv 0->1 için 20 altın gerekli

      const res = await UserManager.upgradeAbility('crystal_shield');
      expect(res.ok).toBe(false);
      expect(res.reason).toBe('insufficient_gold');
      expect(UserManager.getCrystals()).toBe(10);
      expect(UserManager.getGold()).toBe(5);
    });

    it('İkisi de yeterliyken atomik düşüş yapılmalı ve seviye yükselmeli', async () => {
      localStorage.setItem('sudoku_crystals', '5');
      localStorage.setItem('sudoku_gold', '20');

      const res = await UserManager.upgradeAbility('crystal_shield');
      expect(res.ok).toBe(true);
      expect(res.newLevel).toBe(1);
      expect(UserManager.getCrystals()).toBe(0);
      expect(UserManager.getGold()).toBe(0);
    });

    it('Sv.1 - Sv.5 arası cooldown süreleri kısalmalı, Sv.5 üstü max_level hatası vermeli', async () => {
      const cd1 = getAbilityCooldownMs('oracle_eye', 1);
      const cd2 = getAbilityCooldownMs('oracle_eye', 2);
      const cd3 = getAbilityCooldownMs('oracle_eye', 3);
      const cd4 = getAbilityCooldownMs('oracle_eye', 4);
      const cd5 = getAbilityCooldownMs('oracle_eye', 5);

      expect(cd1).toBeGreaterThan(cd2);
      expect(cd2).toBeGreaterThan(cd3);
      expect(cd3).toBeGreaterThan(cd4);
      expect(cd4).toBeGreaterThan(cd5);

      // Max Seviyeye yükselt
      localStorage.setItem('sudoku_crystals', '999');
      localStorage.setItem('sudoku_gold', '9999');

      for (let i = 1; i < 5; i++) {
        await UserManager.upgradeAbility('oracle_eye');
      }

      const prog = UserManager.getAbilityProgress('oracle_eye');
      expect(prog.level).toBe(5);

      const maxRes = await UserManager.upgradeAbility('oracle_eye');
      expect(maxRes.ok).toBe(false);
      expect(maxRes.reason).toBe('max_level');
    });
  });

  describe('3. Cooldown, Saat Manipülasyonu Koruması & Yarı Saydam Pasta Dilimi DOM Testi', () => {
    it('cooldown progress oranları, derece ve formatlamaları doğru hesaplanmalı', () => {
      const now = 1000000;
      const cdMs = getAbilityCooldownMs('oracle_eye', 1); // 2 saat = 7200000 ms

      // Tüketildiği an (tam dolu cooldown)
      const progFresh = { level: 1, cooldownEndsAtMs: now + cdMs };
      expect(getRemainingCooldownMs(progFresh, 'oracle_eye', now)).toBe(cdMs);
      expect(getCooldownProgressRatio(progFresh, 'oracle_eye', now)).toBe(1.0);
      expect(getCooldownSweepDegrees(progFresh, 'oracle_eye', now)).toBe(360);

      // Yarı sürede
      const progHalf = { level: 1, cooldownEndsAtMs: now + (cdMs / 2) };
      expect(getRemainingCooldownMs(progHalf, 'oracle_eye', now)).toBe(cdMs / 2);
      expect(getCooldownProgressRatio(progHalf, 'oracle_eye', now)).toBe(0.5);
      expect(getCooldownSweepDegrees(progHalf, 'oracle_eye', now)).toBe(180);

      // Süre bittiğinde
      const progReady = { level: 1, cooldownEndsAtMs: now - 100 };
      expect(getRemainingCooldownMs(progReady, 'oracle_eye', now)).toBe(0);
      expect(getCooldownProgressRatio(progReady, 'oracle_eye', now)).toBe(0);
      expect(getCooldownSweepDegrees(progReady, 'oracle_eye', now)).toBe(0);
    });

    it('Cihaz saati 10 saat geri alındığında kalan süre maksimum cooldown sınırına clamp edilmeli', () => {
      const now = 1000000;
      const cdMs = getAbilityCooldownMs('oracle_eye', 1); // 7200000 ms
      const manipulatedProgress = { level: 1, cooldownEndsAtMs: now + cdMs };

      // Cihaz saati 10 saat geri alındı (now - 36,000,000)
      const manipulatedNow = now - 36_000_000;
      const rem = getRemainingCooldownMs(manipulatedProgress, 'oracle_eye', manipulatedNow);

      expect(rem).toBe(cdMs); // Maksimum 2 saat sınırını aşamaz!
    });

    it('Yarı sürede modal açıldığında DOM [data-cooldown-overlay] içinde conic-gradient ve 180deg olmalı', () => {
      const now = Date.now();
      const cdMs = getAbilityCooldownMs('oracle_eye', 1);

      // Cooldown yarı sürede ayarla
      UserManager.triggerAbilityCooldown('oracle_eye', now - (cdMs / 2));

      openAbilitiesModal(now);

      const overlay = document.querySelector('[data-cooldown-overlay="oracle_eye"]') as HTMLElement;
      expect(overlay).not.toBeNull();
      expect(overlay?.getAttribute('style')).toContain('conic-gradient');
      expect(overlay?.getAttribute('style')).toContain('180deg');

      closeAbilitiesModal();
    });
  });

  describe('4. Altın & Reklamla Hızlı Şarj Testi', () => {
    it('Altın yetersizken hızlı şarj reddedilmeli, yeterliyken -15 altın düşüp cooldown sıfırlanmalı', async () => {
      const now = Date.now();
      UserManager.triggerAbilityCooldown('oracle_eye', now);

      localStorage.setItem('sudoku_gold', '5');
      const failRes = await UserManager.rechargeAbilityWithGold('oracle_eye', now);
      expect(failRes.ok).toBe(false);
      expect(failRes.reason).toBe('insufficient_gold');

      localStorage.setItem('sudoku_gold', '20');
      const okRes = await UserManager.rechargeAbilityWithGold('oracle_eye', now);
      expect(okRes.ok).toBe(true);
      expect(UserManager.getGold()).toBe(5);

      const prog = UserManager.getAbilityProgress('oracle_eye');
      expect(getRemainingCooldownMs(prog, 'oracle_eye', now)).toBe(0);
    });

    it('Hazır yeteneğe şarj denemesi not_on_cooldown dönmeli', async () => {
      localStorage.setItem('sudoku_gold', '100');
      const res = await UserManager.rechargeAbilityWithGold('oracle_eye', Date.now());
      expect(res.ok).toBe(false);
      expect(res.reason).toBe('not_on_cooldown');
      expect(UserManager.getGold()).toBe(100);
    });

    it('Reklamla şarj altın düşmeden cooldown sıfırlamalı', async () => {
      const now = Date.now();
      UserManager.triggerAbilityCooldown('oracle_eye', now);
      localStorage.setItem('sudoku_gold', '100');

      const res = await UserManager.rechargeAbilityWithAd('oracle_eye', now);
      expect(res.ok).toBe(true);
      expect(UserManager.getGold()).toBe(100);

      const prog = UserManager.getAbilityProgress('oracle_eye');
      expect(getRemainingCooldownMs(prog, 'oracle_eye', now)).toBe(0);
    });
  });

  describe('5. Çift Dilli Sızıntı & Canlı Dil Değişimi DOM Testi (TR <-> EN)', () => {
    it('EN modunda #abilities-modal içinde Türkçe karakter veya kelime bulunmamalı', () => {
      setLang('en');
      applyStaticTranslations();

      openAbilitiesModal();

      const modal = document.getElementById('abilities-modal');
      const text = modal?.textContent || '';
      const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;

      expect(trCharRegex.test(text)).toBe(false);

      closeAbilitiesModal();
    });

    it('TR modunda #abilities-modal içinde yasaklı İngilizce kelime bulunmamalı', () => {
      setLang('tr');
      applyStaticTranslations();

      openAbilitiesModal();

      const modal = document.getElementById('abilities-modal');
      const text = modal?.textContent || '';
      const forbiddenEnWords = /\b(Level|Cooldown|Ready|Upgrade|Unlock|Gold|Crystal|Recharge|Max|Shield|Magnet|Oracle|Play|Next|Score|Region)\b/i;

      expect(forbiddenEnWords.test(text)).toBe(false);

      closeAbilitiesModal();
    });

    it('Canlı dil değişiminde 5 yetenek kartı anında yenilenmeli', () => {
      openAbilitiesModal();

      let title = document.getElementById('abilities-modal-title');
      expect(title?.innerText).toBe('Yetenekler');

      setLang('en');
      applyStaticTranslations();
      refreshAbilitiesLanguageUI();

      expect(title?.innerText).toBe('Abilities');

      closeAbilitiesModal();
    });
  });
});
