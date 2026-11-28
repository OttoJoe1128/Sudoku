// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui';
import { UserManager } from '../store/userState';
import { setLang, t, applyStaticTranslations } from '../i18n/translations';
import { startGame, getGameRuntimeState, refreshGameLanguageUI, initGameController } from '../controllers/gameController';
import { initAbilitiesController } from '../controllers/abilitiesController';
import { openMapAtLevel, initMapController } from '../controllers/mapController';

describe('UX & Live Feedback Verification Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initAbilitiesController();
    initGameController({
      onUpdateGoldDisplay: () => {
        UIManager.updateHeaderGold(UserManager.getGold());
      },
      onReturnToMap: () => {}
    });
  });

  it('1. Hız Deparı Canlı Geri Sayımı: Seviye 9 başlatıldığında momentumPill geri saymalı, süre dolunca sprint_missed olmalı', () => {
    startGame(9, 'basit', undefined, undefined, 'classic', false);
    const state = getGameRuntimeState().boardMechanics;
    expect(state).not.toBeNull();
    if (!state) return;

    const pill = document.getElementById('game-momentum-pill');
    expect(pill?.classList.contains('hidden')).toBe(false);
    expect(pill?.innerText).toContain('03:00');

    // 65 saniye geçmiş hali
    UIManager.updateMechanicsLiveTimers(state, 65);
    expect(pill?.innerText).toContain('01:55');

    // 200 saniye geçmiş hali (süre aşıldı)
    UIManager.updateMechanicsLiveTimers(state, 200);
    expect(pill?.innerText).toContain(t('sprint_missed'));
  });

  it('2. Kıvılcım Akışı Canlı Kombo Geri Sayımı: sparkFlowEndsAtMs süresince kombo gösterilmeli, bitince gizlenmeli', () => {
    startGame(3, 'basit', undefined, undefined, 'classic', false);
    const state = getGameRuntimeState().boardMechanics;
    expect(state).not.toBeNull();
    if (!state) return;

    const now = Date.now();
    state.sparkFlowEndsAtMs = now + 15000;
    state.sparkCombo = 2;

    const pill = document.getElementById('game-momentum-pill');
    UIManager.updateMechanicsLiveTimers(state, 0, now);
    expect(pill?.classList.contains('hidden')).toBe(false);
    expect(pill?.innerText).toContain('⚡ x2 (15s)');

    // Süre doldu
    UIManager.updateMechanicsLiveTimers(state, 0, now + 20000);
    expect(pill?.classList.contains('hidden')).toBe(true);
  });

  it('3. Hazine Ücretsiz İpucu & Hata Kalkanı HUD Testi: freeHintsGranted ve errorShieldsGranted HUDda yansımalı', async () => {
    localStorage.setItem('sudoku_gold', '100');
    startGame(5, 'basit', undefined, undefined, 'classic', false);
    const state = getGameRuntimeState().boardMechanics;
    expect(state).not.toBeNull();
    if (!state) return;

    state.freeHintsGranted = 1;
    state.errorShieldsGranted = 1;

    refreshGameLanguageUI();

    const hintBtn = document.getElementById('btn-hint');
    expect(hintBtn?.textContent).toContain('Ücretsiz İpucu (1)');

    const shieldBadge = document.querySelector('[data-treasure-shield="true"]');
    expect(shieldBadge).not.toBeNull();
    expect(shieldBadge?.textContent).toContain('🛡️x1');

    // İpucu butonuna tıklayıp akıllı ipucu şeridini aç
    hintBtn?.click();

    const applyBtn = document.getElementById('btn-apply-smart-hint');
    expect(applyBtn?.textContent).toContain('Yerleştir (Ücretsiz)');

    // Yerleştir butonuna tıkla
    await applyBtn?.click();

    expect(UserManager.getGold()).toBe(100); // Altın düşmedi
    expect(state.freeHintsGranted).toBe(0);
    expect(hintBtn?.textContent).toContain('İpucu (10)'); // Normal haline döndü
  });

  it('4. Harita Rün Kapısı Gerçek DOM Tıklaması E2E: Gate butonuna .click() yapılınca altın ve kristal otomatik güncellenmeli', async () => {
    localStorage.setItem('sudoku_crystals', '999');
    localStorage.setItem('sudoku_gold', '100');

    initMapController({
      onStartLevel: () => {},
      onBackToMenu: () => {},
      getRuleDescription: () => ''
    });

    await UserManager.recordLevelCrystals('classic', 1, 20, 20);
    await UserManager.updateVariantLevel('classic', 11, 0);

    openMapAtLevel('classic', 10, () => {});

    const gateBtn = document.querySelector('[data-map-gate="10"]') as HTMLElement;
    expect(gateBtn).not.toBeNull();

    gateBtn?.click();
    await new Promise(r => setTimeout(r, 50));

    const menuGoldEl = document.getElementById('menu-gold');
    const crystalEl = document.getElementById('map-crystal-balance');

    expect(menuGoldEl?.innerText).toBe('125'); // 100 + 25 gold
    expect(crystalEl?.innerText).toBe('1020'); // 999 + 20 + 1 crystal
  });

  it('5. Çift Dilli Sızıntı (TR <-> EN): Yeni çeviri anahtarları EN ve TR modlarında doğru görüntülenebilmeli', () => {
    startGame(9, 'basit', undefined, undefined, 'classic', false);
    const state = getGameRuntimeState().boardMechanics;
    if (state) state.freeHintsGranted = 1;

    setLang('en');
    applyStaticTranslations();
    refreshGameLanguageUI();

    const hintBtn = document.getElementById('btn-hint');
    expect(hintBtn?.textContent).toContain('Free Hint (1)');

    setLang('tr');
    applyStaticTranslations();
    refreshGameLanguageUI();

    expect(hintBtn?.textContent).toContain('Ücretsiz İpucu (1)');
  });
});
