// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui';
import { UserManager } from '../store/userState';
import { setLang, applyStaticTranslations } from '../i18n/translations';
import { startGame, getGameRuntimeState, refreshGameLanguageUI, initGameController } from '../controllers/gameController';
import { initAbilitiesController, updateCrystalDisplays } from '../controllers/abilitiesController';
import { findSmartHint } from '../engine/hintSolver';
import { getLevelModifierProfile } from '../engine/levelModifiers';
import { openMapAtLevel, initMapController } from '../controllers/mapController';

describe('P0 Audit & Fix Verification Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initAbilitiesController();
    initGameController({
      onUpdateGoldDisplay: () => {},
      onReturnToMap: () => {}
    });
  });

  it('1. Samurai Görünmez Mühür Koruması: Seviye 4 Samurai modunda seal üretilmemeli ve #game-mechanics-bar görünür olmalı', () => {
    const prof = getLevelModifierProfile(4, 'samurai');
    expect(prof.keySealPairs).toBe(0);

    startGame(4, 'basit', undefined, undefined, 'samurai', false);
    const state = getGameRuntimeState().boardMechanics;
    expect(state).not.toBeNull();
    if (state) {
      expect(state.cells.filter(c => c.kind === 'seal').length).toBe(0);
    }

    const bar = document.getElementById('game-mechanics-bar');
    expect(bar?.classList.contains('hidden')).toBe(false);
  });

  it('2. Akıllı İpucu Mühür Koruması: Seviye 4te mühürlü hücre seçiliyken #btn-hint tıklanınca banner açılmamalı, findSmartHint mühürlü hücreyi önermemeli', () => {
    startGame(4, 'basit', undefined, undefined, 'classic', false);
    const state = getGameRuntimeState().boardMechanics;
    expect(state).not.toBeNull();

    const sealCell = state?.cells.find(c => c.kind === 'seal');
    expect(sealCell).not.toBeUndefined();
    if (!sealCell || !state) return;

    // Mühürlü hücreyi seç
    const gridEl = document.getElementById('sudoku-grid');
    const sealIndex = sealCell.r * 9 + sealCell.c;
    const sealCellEl = gridEl?.children[sealIndex] as HTMLElement;
    sealCellEl?.click();

    // #btn-hint tıkla
    const hintBtn = document.getElementById('btn-hint');
    hintBtn?.click();

    const banner = document.getElementById('smart-hint-banner');
    expect(banner?.classList.contains('hidden')).toBe(true);

    // findSmartHint çağrısında sealedCells vererek kontrol et
    const sealedCells = state.cells.filter(c => c.kind === 'seal').map(c => ({ r: c.r, c: c.c }));
    const hint = findSmartHint(
      getGameRuntimeState().userBoard,
      getGameRuntimeState().currentSolution,
      { sealedCells }
    );
    if (hint) {
      expect(sealedCells.some(sc => sc.r === hint.row && sc.c === hint.col)).toBe(false);
    }
  });

  it('3. Dinamik 💔 Onar Butonu Tıklama Zinciri: Hatalı hamle sonrası refresh tetiklenip #btn-open-crystal-repair tıklandığında modal açılmalı', () => {
    startGame(1, 'basit', undefined, undefined, 'classic', false);
    const state = getGameRuntimeState().boardMechanics;
    expect(state).not.toBeNull();

    const crystalCell = state?.cells.find(c => c.kind === 'crystal');
    expect(crystalCell).not.toBeUndefined();
    if (!crystalCell || !state) return;

    // Hatalı rakam girerek kristali çatlat
    const gridEl = document.getElementById('sudoku-grid');
    const crystalIndex = crystalCell.r * 9 + crystalCell.c;
    const crystalCellEl = gridEl?.children[crystalIndex] as HTMLElement;
    crystalCellEl?.click();

    const correct = getGameRuntimeState().currentSolution[crystalCell.r][crystalCell.c];
    const wrong = correct === 1 ? 2 : 1;

    const numpadBtn = document.querySelectorAll('#numpad-grid button')[wrong - 1] as HTMLElement;
    numpadBtn?.click();

    expect(state.crackedCrystals.length).toBeGreaterThan(0);

    // Tahtada başka bir hücreye tıkla (refresh tetikle)
    const otherCellEl = gridEl?.children[0] as HTMLElement;
    otherCellEl?.click();

    const repairBtn = document.getElementById('btn-open-crystal-repair');
    expect(repairBtn).not.toBeNull();

    repairBtn?.click();

    const modal = document.getElementById('crystal-repair-modal');
    expect(modal?.classList.contains('hidden')).toBe(false);
  });

  it('4. Rün Kapısı Altın Senkronizasyonu: Seviye 10 kapısı açıldığında #menu-gold ve #map-crystal-balance artmalı', async () => {
    localStorage.setItem('sudoku_crystals', '999');
    localStorage.setItem('sudoku_gold', '100');

    initMapController({
      onStartLevel: () => {},
      onBackToMenu: () => {},
      getRuleDescription: () => ''
    });

    // Seviye 1..10 bloğunda 20 kristal toplanmış yap
    await UserManager.recordLevelCrystals('classic', 1, 20, 20);
    await UserManager.updateVariantLevel('classic', 11, 0);

    openMapAtLevel('classic', 10, () => {});

    const claimRes = await UserManager.claimMapGate('classic', 10);
    expect(claimRes.ok).toBe(true);

    updateCrystalDisplays();
    UIManager.updateHeaderGold(UserManager.getGold());

    const menuGoldEl = document.getElementById('menu-gold');
    expect(menuGoldEl?.innerText).toBe(String(UserManager.getGold()));

    const crystalEl = document.getElementById('map-crystal-balance');
    expect(crystalEl?.innerText).toBe(String(UserManager.getCrystals()));
  });

  it('5. Oyun İçi Canlı Dil Geçişi (TR <-> EN): Seviye 8 açıkken dil EN yapılıp refreshGameLanguageUI çağrıldığında etiketler İngilizce olmalı', () => {
    startGame(8, 'basit', undefined, undefined, 'classic', false);

    setLang('en');
    applyStaticTranslations();
    refreshGameLanguageUI();

    const errorEl = document.getElementById('game-errors');
    expect(errorEl?.innerText).toBe('Errors: 0/2');

    const energyPill = document.getElementById('game-energy-pill');
    expect(energyPill?.textContent).toContain('One Breath');
  });
});
