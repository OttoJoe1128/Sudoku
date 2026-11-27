// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { isBranchingLevel, getLevelModifierProfile } from '../engine/levelModifiers';
import { UserManager } from '../store/userState';
import { TRANSLATIONS, setLang, t } from '../i18n/translations';
import { UIManager } from '../ui/uiManager';
import {
  openLevelPrepModal,
  closeLevelPrepModal,
  initLevelPrepController
} from '../controllers/levelPrepController';

describe('Faz 2 - Adım 2.2: Dallanan Yol Ayrımı ve Dinamik Biyom Kararları', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initLevelPrepController();
  });

  it('1. isBranchingLevel: 4 ve 7 ile biten seviyeler dallanan yol olmalı', () => {
    expect(isBranchingLevel(4)).toBe(true);
    expect(isBranchingLevel(7)).toBe(true);
    expect(isBranchingLevel(14)).toBe(true);
    expect(isBranchingLevel(27)).toBe(true);
    expect(isBranchingLevel(994)).toBe(true);

    expect(isBranchingLevel(1)).toBe(false);
    expect(isBranchingLevel(2)).toBe(false);
    expect(isBranchingLevel(3)).toBe(false);
    expect(isBranchingLevel(5)).toBe(false);
    expect(isBranchingLevel(10)).toBe(false);
  });

  it('2. getLevelModifierProfile: Risk ve Hız rotaları profil parametrelerini farklılaştırmalı', () => {
    // Seviye 4 için temel profil
    const pBase = getLevelModifierProfile(4, 'classic');

    // Risk Rotası: +Kristal & Mühür
    const pRisk = getLevelModifierProfile(4, 'classic', { branchChoice: 'risk' });
    expect(pRisk.crystalCount).toBe(pBase.crystalCount + 1);
    expect(pRisk.keySealPairs).toBeGreaterThanOrEqual(1);

    // Hız Rotası: +Kıvılcım & Depar Süresi
    const pSpeed = getLevelModifierProfile(4, 'classic', { branchChoice: 'speed' });
    expect(pSpeed.sparkCount).toBeGreaterThanOrEqual(2);
    expect(pSpeed.sprintTargetSec).toBeGreaterThanOrEqual(180);
    expect(pSpeed.sprintBonusCrystals).toBeGreaterThanOrEqual(1);
  });

  it('3. UserManager Rota Tercihi Depolama', () => {
    // Varsayılan 'speed'
    expect(UserManager.getLevelBranchChoice(14)).toBe('speed');

    // 'risk' seç
    UserManager.setLevelBranchChoice(14, 'risk');
    expect(UserManager.getLevelBranchChoice(14)).toBe('risk');

    // Tekrar 'speed' seç
    UserManager.setLevelBranchChoice(14, 'speed');
    expect(UserManager.getLevelBranchChoice(14)).toBe('speed');
  });

  it('4. Bölüm Hazırlık Modalı (#prep-branch-container) Rota Seçimi', () => {
    // Seviye 4 (Dallanan seviye)
    openLevelPrepModal({
      level: 4,
      diff: 'basit',
      variant: 'classic',
      onConfirmStart: () => {}
    });

    const branchContainer = document.getElementById('prep-branch-container');
    const branchBadge = document.getElementById('prep-branch-badge');
    const btnSpeed = document.getElementById('btn-branch-speed');
    const btnRisk = document.getElementById('btn-branch-risk');

    expect(branchContainer?.classList.contains('hidden')).toBe(false);
    expect(branchBadge?.innerText).toContain('Altın');

    // Risk rotasına tıkla
    btnRisk?.click();
    expect(UserManager.getLevelBranchChoice(4)).toBe('risk');
    expect(branchBadge?.innerText).toContain('Kristal');

    closeLevelPrepModal();

    // Seviye 3 (Dallanmayan seviye) -> Gizli olmalı
    openLevelPrepModal({
      level: 3,
      diff: 'basit',
      variant: 'classic',
      onConfirmStart: () => {}
    });

    const branchContainerLvl3 = document.getElementById('prep-branch-container');
    expect(branchContainerLvl3?.classList.contains('hidden')).toBe(true);

    closeLevelPrepModal();
  });

  it('5. Harita Düğümü Renderı: Dallanan seviyeler data-branching özniteliği taşımalı', () => {
    UIManager.renderMap(1, 1, 10, () => {}, false, 'classic');

    const node4 = document.querySelector('button[data-level="4"]');
    const node3 = document.querySelector('button[data-level="3"]');

    expect(node4?.getAttribute('data-branching')).toBe('true');
    expect(node3?.getAttribute('data-branching')).toBeNull();
  });

  it('6. Çift Dilli Bütünlük (TR <-> EN): map_branch_* anahtarları eksiksiz olmalı', () => {
    const keys = [
      'map_branch_title',
      'map_branch_risk',
      'map_branch_speed',
      'map_branch_desc',
      'map_branch_risk_badge',
      'map_branch_speed_badge'
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
