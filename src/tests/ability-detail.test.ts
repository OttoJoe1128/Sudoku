// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui';
import { UserManager } from '../store/userState';
import { SoundManager } from '../engine/soundManager';
import { setLang, TRANSLATIONS } from '../i18n/translations';
import { openAbilitiesModal, openAbilityDetailModal, closeAbilityDetailModal, initAbilitiesController } from '../controllers/abilitiesController';
import { ABILITY_TIER_DEFS, getAbilityTierDefs } from '../engine/abilities';

describe('Faz 12 İnteraktif Yetenek Detay Modalı & 25 Seviyelik Unvan Yol Haritası Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initAbilitiesController();
  });

  it('1. 25 Seviyelik Unvan Yapısı: Tüm 5 yetenek 5er seviye unvan ve açıklama anahtarına sahip olmalı', () => {
    const abilities = ['oracle_eye', 'crystal_shield', 'rhythm_bender', 'seal_breaker', 'rune_magnet'] as const;

    abilities.forEach(id => {
      const tiers = getAbilityTierDefs(id);
      expect(tiers.length).toBe(5);

      tiers.forEach(t => {
        expect(TRANSLATIONS.tr[t.titleKey]).toBeDefined();
        expect(TRANSLATIONS.tr[t.descKey]).toBeDefined();
        expect(TRANSLATIONS.en[t.titleKey]).toBeDefined();
        expect(TRANSLATIONS.en[t.descKey]).toBeDefined();
      });
    });
  });

  it('2. İnteraktif Detay Modalı Render & Sıralı Yükseltme Kuralı: Açık seviyeler aktif, kilitli seviyeler soluk gri olmalı', async () => {
    openAbilitiesModal();
    openAbilityDetailModal('oracle_eye');

    const detailModal = document.getElementById('ability-detail-modal');
    const tiersContainer = document.getElementById('ability-detail-tiers-list');

    expect(detailModal?.classList.contains('hidden')).toBe(false);
    expect(tiersContainer?.children.length).toBe(5);

    // oracle_eye varsayılan Sv 1. Sv 1 açık olmalı (✓ Açıldı)
    const cardSv1 = tiersContainer?.children[0] as HTMLElement;
    expect(cardSv1.textContent).toContain('✓');

    // Sv 2 sıradaki yükseltilebilir seviye olmalı (Yükselt butonu var)
    const cardSv2 = tiersContainer?.children[1] as HTMLElement;
    const upgradeBtn = cardSv2.querySelector('[data-detail-upgrade]');
    expect(upgradeBtn).not.toBeNull();

    // Sv 3 dikeyde kilitli kalmalı (opacity-40 grayscale, buton yok)
    const cardSv3 = tiersContainer?.children[2] as HTMLElement;
    expect(cardSv3.className).toContain('opacity-40');
    expect(cardSv3.className).toContain('grayscale');
    expect(cardSv3.querySelector('[data-detail-upgrade]')).toBeNull();

    closeAbilityDetailModal();
    expect(detailModal?.classList.contains('hidden')).toBe(true);
  });

  it('3. Çift Dilli Sızıntı (TR <-> EN): Tüm 25 seviye unvanında TR özel karakterleri EN tarafına sızmamalı', () => {
    const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;

    Object.values(ABILITY_TIER_DEFS).flat().forEach(tier => {
      const enTitle = TRANSLATIONS.en[tier.titleKey] || '';
      const enDesc = TRANSLATIONS.en[tier.descKey] || '';

      expect(trCharRegex.test(enTitle)).toBe(false);
      expect(trCharRegex.test(enDesc)).toBe(false);
    });
  });
});
