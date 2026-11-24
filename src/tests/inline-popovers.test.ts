// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { setLang, applyStaticTranslations, TRANSLATIONS } from '../i18n/translations';
import { openLevelPrepModal, closeLevelPrepModal, initLevelPrepController } from '../controllers/levelPrepController';
import { openAbilitiesModal, closeAbilitiesModal, initAbilitiesController } from '../controllers/abilitiesController';
import { startGame, initGameController } from '../controllers/gameController';

describe('Faz 3f + UX Flow + Inline Popover Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initAbilitiesController();
    initLevelPrepController();
    initGameController({
      onUpdateGoldDisplay: () => {},
      onReturnToMap: () => {}
    });
  });

  it('1. Hazırlık Paneli Inline Balon Aç/Kapa: Seviye 148 ve 146 özet butonları tıklanınca popover açılıp kapanmalı', () => {
    // Seviye 148 (one_breath)
    openLevelPrepModal({
      level: 148,
      diff: 'basit',
      variant: 'classic',
      onConfirmStart: () => {}
    });

    const popover = document.getElementById('prep-info-popover');
    expect(popover?.classList.contains('hidden')).toBe(true);

    const btnOneBreath = document.querySelector('[data-prep-info="one_breath"]') as HTMLElement;
    expect(btnOneBreath).not.toBeNull();

    btnOneBreath?.click();
    expect(popover?.classList.contains('hidden')).toBe(false);
    expect(popover?.textContent).toContain('2 hata');

    // Tekrar tıkla -> gizlenmeli
    btnOneBreath?.click();
    expect(popover?.classList.contains('hidden')).toBe(true);

    closeLevelPrepModal();

    // Seviye 146 (flawless_trial)
    openLevelPrepModal({
      level: 146,
      diff: 'basit',
      variant: 'classic',
      onConfirmStart: () => {}
    });

    const btnFlawless = document.querySelector('[data-prep-info="flawless"]') as HTMLElement;
    expect(btnFlawless).not.toBeNull();

    btnFlawless?.click();
    expect(popover?.classList.contains('hidden')).toBe(false);
    expect(popover?.textContent).toContain('+2 Bonus Kristal');

    closeLevelPrepModal();
  });

  it('2. Oyun İçi Enerji Rozeti Inline Balonu: Seviye 144 (sealed_path) #game-energy-pill tıklandığında popover açılıp kapanmalı', () => {
    startGame(144, 'basit', undefined, undefined, 'classic', false);

    const energyPill = document.getElementById('game-energy-pill');
    const popover = document.getElementById('game-info-popover');

    expect(energyPill).not.toBeNull();
    expect(popover?.classList.contains('hidden')).toBe(true);

    energyPill?.click();
    expect(popover?.classList.contains('hidden')).toBe(false);
    expect(popover?.textContent).toContain('Anahtar & Mühür');

    // Tekrar tıkla -> kapanmalı
    energyPill?.click();
    expect(popover?.classList.contains('hidden')).toBe(true);
  });

  it('3. Hazırlık -> Yetenekler -> Hazırlık Geri Dönüş Akışı: #btn-prep-open-abilities ve #btn-close-abilities modal akışı doğru olmalı', () => {
    openLevelPrepModal({
      level: 10,
      diff: 'basit',
      variant: 'classic',
      onConfirmStart: () => {}
    });

    const prepModal = document.getElementById('level-prep-modal');
    const abilitiesModal = document.getElementById('abilities-modal');

    expect(prepModal?.classList.contains('hidden')).toBe(false);
    expect(abilitiesModal?.classList.contains('hidden')).toBe(true);

    // Hazırlıktan yetenekler modalını aç
    const openAbilitiesBtn = document.getElementById('btn-prep-open-abilities');
    openAbilitiesBtn?.click();

    expect(prepModal?.classList.contains('hidden')).toBe(true);
    expect(abilitiesModal?.classList.contains('hidden')).toBe(false);

    // Yetenekleri kapat -> Hazırlık modalı tekrar açılmalı
    closeAbilitiesModal();

    expect(abilitiesModal?.classList.contains('hidden')).toBe(true);
    expect(prepModal?.classList.contains('hidden')).toBe(false);

    closeLevelPrepModal();
  });

  it('4. Çift Dilli Sızıntı (TR <-> EN): Tüm info_mod_* çevirileri EN modunda Türkçe karakter, TR modunda İngilizce kelime içermemeli', () => {
    const infoKeys = [
      'info_mod_crystal',
      'info_mod_key_seal',
      'info_mod_spark',
      'info_mod_treasure',
      'info_mod_one_breath',
      'info_mod_flawless',
      'info_mod_sprint',
      'info_mod_milestone',
      'info_mod_guardian'
    ];

    const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;
    const forbiddenEnWords = /\b(Solve|Mistake|Locked|Stage|Target|Reward|Vault)\b/i;

    infoKeys.forEach(k => {
      const trVal = TRANSLATIONS.tr[k] || '';
      const enVal = TRANSLATIONS.en[k] || '';

      expect(trVal.length).toBeGreaterThan(0);
      expect(enVal.length).toBeGreaterThan(0);

      // EN metninde Türkçe özel karakter olmamalı
      expect(trCharRegex.test(enVal)).toBe(false);

      // TR metninde yasaklı İngilizce kelimeler sızmamalı
      expect(forbiddenEnWords.test(trVal)).toBe(false);
    });
  });
});
