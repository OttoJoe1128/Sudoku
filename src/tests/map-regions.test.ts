// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { setLang, getLang, t, applyStaticTranslations, TRANSLATIONS } from '../i18n/translations';
import { getLevelConfig, getRegionForLevel, REGIONS } from '../engine/rhythmConfig';
import { openMapAtLevel, refreshMapLanguageUI } from '../controllers/mapController';

describe('Faz 2.5b Harita Bölge Görünümü, 20 Bölge Başlığı & Kilometre Taşları Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');

    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
  });

  describe('1. Çeviri & Sızıntı Bütünlüğü', () => {
    it('Tüm 20 bölge, 20 teknik ve ritim etiketleri tr ve en sözlüklerinde eksiksiz tanımlı olmalı', () => {
      const keys: string[] = [];

      for (let i = 1; i <= 20; i++) {
        keys.push(`region_${i}`);
      }

      REGIONS.forEach(r => {
        keys.push(`tech_${r.techniqueId}`);
      });

      const rhythmKeys = [
        'rhythm_warmup', 'rhythm_balance', 'rhythm_tension', 'rhythm_sprint', 'rhythm_milestone', 'rhythm_guardian',
        'map_region_label', 'map_region_progress', 'map_region_focus', 'map_milestone_tag', 'map_guardian_tag'
      ];
      keys.push(...rhythmKeys);

      keys.forEach(k => {
        expect(TRANSLATIONS.tr[k]).toBeDefined();
        expect(TRANSLATIONS.en[k]).toBeDefined();
      });
    });

    it('EN sözlüğündeki ritim ve bölge anahtarlarında Türkçe karakter veya yasaklı kelime bulunmamalı', () => {
      const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;
      const forbiddenTrWords = /\b(Bölge|Seviye|Muhafız|Puan|Basit|Orta|Zor)\b/i;

      for (let i = 1; i <= 20; i++) {
        const regEn = TRANSLATIONS.en[`region_${i}`];
        expect(trCharRegex.test(regEn)).toBe(false);
        expect(forbiddenTrWords.test(regEn)).toBe(false);
      }

      REGIONS.forEach(r => {
        const techEn = TRANSLATIONS.en[`tech_${r.techniqueId}`];
        expect(trCharRegex.test(techEn)).toBe(false);
        expect(forbiddenTrWords.test(techEn)).toBe(false);
      });
    });
  });

  describe('2. Bölge Kartı Render Doğrulaması (DOM)', () => {
    it('Seviye 1, 50, 301, 701 ve 1000 için #map-region-banner doğru verileri göstermeli', () => {
      UIManager.navigate('map');

      // Seviye 1 (Bölge 1 - Zümrüt Eşiğinde)
      UIManager.renderMap(1, 1, 6, () => {});
      let bannerTitle = document.getElementById('map-region-title');
      let bannerProgress = document.getElementById('map-region-progress-text');
      expect(bannerTitle?.innerText).toBe(t('region_1'));
      expect(bannerProgress?.innerText).toContain('1 / 50');

      // Seviye 50 (Bölge 1 Muhafızı)
      UIManager.renderMap(50, 45, 52, () => {});
      expect(bannerTitle?.innerText).toBe(t('region_1'));
      expect(bannerProgress?.innerText).toContain('50 / 50');

      // Seviye 301 (Bölge 7 - Hextech Avlusu)
      UIManager.renderMap(301, 301, 306, () => {});
      expect(bannerTitle?.innerText).toBe(t('region_7'));
      expect(bannerProgress?.innerText).toContain('1 / 50');

      // Seviye 701 (Bölge 15 - Kızıl Etekler)
      UIManager.renderMap(701, 701, 706, () => {});
      expect(bannerTitle?.innerText).toBe(t('region_15'));
      expect(bannerProgress?.innerText).toContain('1 / 50');

      // Seviye 1000 (Bölge 20 Muhafızı)
      UIManager.renderMap(1000, 995, 1000, () => {});
      expect(bannerTitle?.innerText).toBe(t('region_20'));
      expect(bannerProgress?.innerText).toContain('50 / 50');
    });
  });

  describe('3. Kilometre Taşı & Muhafız Düğüm Öznitelikleri', () => {
    it('Seviye 10 düğümü milestone, Seviye 50 düğümü guardian data-rhythm özniteliği taşımalı', () => {
      UIManager.navigate('map');
      UIManager.renderMap(50, 1, 52, () => {});

      const node10Btn = document.querySelector('#map-node-10 button');
      const node50Btn = document.querySelector('#map-node-50 button');

      expect(node10Btn?.getAttribute('data-rhythm')).toBe('milestone');
      expect(node50Btn?.getAttribute('data-rhythm')).toBe('guardian');
    });
  });

  describe('4. Canlı Dil Geçişi (TR <-> EN)', () => {
    it('harita açıkken dil EN yapıldığında bölge kartı İngilizceye dönmeli', () => {
      UIManager.navigate('map');
      openMapAtLevel('classic', 1, () => {});

      setLang('en');
      applyStaticTranslations();
      refreshMapLanguageUI();

      const bannerTitle = document.getElementById('map-region-title');
      const bannerBadge = document.getElementById('map-region-badge');
      const text = document.body.textContent || '';

      expect(bannerTitle?.innerText).toBe('Emerald Threshold');
      expect(bannerBadge?.innerText).toContain('Region 1');

      const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;
      expect(trCharRegex.test(bannerTitle?.innerText || '')).toBe(false);
    });
  });

  describe('5. Kayıttan Devam Ödül Çarpanı', () => {
    it('Seviye 10 rewardMultiplier 2.0x, Seviye 50 rewardMultiplier 2.5x olmalı', () => {
      expect(getLevelConfig(10).rewardMultiplier).toBe(2.0);
      expect(getLevelConfig(50).rewardMultiplier).toBe(2.5);
    });
  });
});
