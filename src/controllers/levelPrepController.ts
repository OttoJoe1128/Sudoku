import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { SoundManager } from '../engine/soundManager';
import { t, getLang, applyStaticTranslations } from '../i18n/translations';
import { SudokuVariant } from '../engine/sudoku';
import { openAbilitiesModal } from './abilitiesController';
import {
  AbilityId,
  ABILITIES,
  getAbilityDef,
  getRemainingCooldownMs,
  getCooldownSweepDegrees,
  formatCooldownShort,
  isAbilityReady,
  ECONOMY_CONFIG
} from '../engine/abilities';
import { getLevelModifierProfile, isBranchingLevel, PathBranchChoice } from '../engine/levelModifiers';
import { RELICS, getRelicDef, RelicId } from '../engine/relics';

let selectedLoadout: AbilityId[] = [];
let activePrepInfoKey: string | null = null;
let currentPrepParams: {
  level: number;
  diff: 'basit' | 'orta' | 'zor';
  variant: SudokuVariant;
  onConfirmStart: (selectedAbilities: AbilityId[]) => void;
} | null = null;

export function getSelectedPrepLoadout(): AbilityId[] {
  return [...selectedLoadout];
}

export function closeLevelPrepModal(): void {
  activePrepInfoKey = null;
  const popover = document.getElementById('prep-info-popover');
  if (popover) {
    popover.classList.add('hidden');
    popover.innerText = '';
  }
  UIManager.toggleModal('level-prep-modal', false);
}

export function openLevelPrepModal(params: {
  level: number;
  diff: 'basit' | 'orta' | 'zor';
  variant: SudokuVariant;
  onConfirmStart: (selectedAbilities: AbilityId[]) => void;
  nowMs?: number;
}): void {
  currentPrepParams = params;
  selectedLoadout = [];
  activePrepInfoKey = null;
  const popover = document.getElementById('prep-info-popover');
  if (popover) {
    popover.classList.add('hidden');
    popover.innerText = '';
  }
  UIManager.toggleModal('level-prep-modal', true);
  applyStaticTranslations();
  renderLevelPrepModal(params.nowMs || Date.now());
}

export function reopenCurrentLevelPrepModal(): void {
  if (currentPrepParams) {
    openLevelPrepModal({ ...currentPrepParams, nowMs: Date.now() });
  }
}

export function refreshLevelPrepLanguageUI(): void {
  const modal = document.getElementById('level-prep-modal');
  if (!modal || modal.classList.contains('hidden')) return;
  applyStaticTranslations();
  if (currentPrepParams) {
    renderLevelPrepModal(Date.now());
  }
}

function getEnergyInfoKey(energyId: string): string {
  if (energyId === 'spark_flow') return 'info_mod_spark';
  if (energyId === 'sealed_path' || energyId === 'double_seal') return 'info_mod_key_seal';
  if (energyId === 'mystery_vault') return 'info_mod_treasure';
  if (energyId === 'flawless_trial') return 'info_mod_flawless';
  if (energyId === 'one_breath') return 'info_mod_one_breath';
  if (energyId === 'sprint_rush') return 'info_mod_sprint';
  if (energyId === 'milestone_vault') return 'info_mod_milestone';
  if (energyId === 'region_guardian') return 'info_mod_guardian';
  return 'info_mod_crystal';
}

function togglePrepInfoPopover(key: string): void {
  const popover = document.getElementById('prep-info-popover');
  if (!popover) return;

  if (activePrepInfoKey === key) {
    activePrepInfoKey = null;
    popover.classList.add('hidden');
    popover.innerText = '';
  } else {
    activePrepInfoKey = key;
    popover.innerText = t(key);
    popover.classList.remove('hidden');
  }
}

function renderLevelPrepModal(nowMs: number = Date.now()): void {
  if (!currentPrepParams) return;
  const { level, diff, variant } = currentPrepParams;

  const isBranching = isBranchingLevel(level);
  const currentBranch = isBranching ? UserManager.getLevelBranchChoice(level) : undefined;
  const userAbilities = UserManager.getAbilitiesState();
  const profile = getLevelModifierProfile(level, variant, {
    runeMagnetLevel: selectedLoadout.includes('rune_magnet') ? (userAbilities.rune_magnet?.level || 0) : 0,
    rhythmBenderLevel: selectedLoadout.includes('rhythm_bender') ? (userAbilities.rhythm_bender?.level || 0) : 0,
    branchChoice: currentBranch
  });

  const collected = UserManager.getLevelCollectedCrystals(variant, level);

  const titleEl = document.getElementById('prep-level-title');
  const energyBadgeEl = document.getElementById('prep-energy-badge');
  const energyDescEl = document.getElementById('prep-energy-desc');
  const summaryEl = document.getElementById('prep-modifiers-summary');
  const crystalProgressEl = document.getElementById('prep-crystal-progress');
  const loadoutCountEl = document.getElementById('prep-loadout-count');
  const slot0El = document.getElementById('prep-slot-0');
  const slot1El = document.getElementById('prep-slot-1');
  const gridEl = document.getElementById('prep-abilities-grid');

  const userLvl = UserManager.getVariantLevel(variant);
  const isReplayStage = level < userLvl;
  const replayBanner = document.getElementById('prep-replay-banner');

  if (replayBanner) {
    if (isReplayStage) {
      replayBanner.classList.remove('hidden');
    } else {
      replayBanner.classList.add('hidden');
    }
  }

  if (titleEl) titleEl.innerText = `${t('label_level')} ${level} • ${t('var_' + variant)}`;
  if (energyBadgeEl) {
    energyBadgeEl.className = "inline-flex items-center gap-1.5 bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--accent-gold)] text-xs font-black px-3 py-1 rounded-full shadow-sm mb-1 cursor-pointer hover:brightness-110 active:scale-95 transition-all";
    energyBadgeEl.innerHTML = `${profile.icon} <span>${t('energy_name_' + profile.energyId)}</span> <span class="text-[10px] opacity-80 font-normal">ⓘ</span>`;
    energyBadgeEl.onclick = () => {
      togglePrepInfoPopover(getEnergyInfoKey(profile.energyId));
    };
  }
  if (energyDescEl) energyDescEl.innerText = t('energy_desc_' + profile.energyId);

  if (summaryEl) {
    const summaryItems: { label: string; key: string }[] = [
      { label: `💎 x${profile.crystalCount}`, key: 'crystal' }
    ];
    if (profile.keySealPairs > 0) summaryItems.push({ label: `🗝️ x${profile.keySealPairs}`, key: 'key_seal' });
    if (profile.sparkCount > 0) summaryItems.push({ label: `⚡ x${profile.sparkCount}`, key: 'spark' });
    if (profile.treasureCount > 0) summaryItems.push({ label: `🎁 x${profile.treasureCount}`, key: 'treasure' });
    if (profile.hasFlawlessCrystalBonus) summaryItems.push({ label: `🛡️ +${profile.flawlessBonusCrystals}💎`, key: 'flawless' });
    if (profile.sprintTargetSec > 0) summaryItems.push({ label: `⏱️ ${profile.sprintTargetSec}s`, key: 'sprint' });
    if (profile.maxMistakes < 3) summaryItems.push({ label: `🔥 ${profile.maxMistakes}`, key: 'one_breath' });

    summaryEl.innerHTML = summaryItems.map(item => `
      <button data-prep-info="${item.key}" class="hover:text-[var(--accent-gold)] cursor-pointer active:scale-95 transition-transform flex items-center gap-0.5">
        <span>${item.label}</span>
      </button>
    `).join('<span class="text-[var(--border-subtle)]">•</span>');

    summaryEl.querySelectorAll('[data-prep-info]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const infoKey = (e.currentTarget as HTMLElement).getAttribute('data-prep-info');
        if (infoKey) {
          togglePrepInfoPopover('info_mod_' + infoKey);
        }
      });
    });
  }

  if (crystalProgressEl) {
    crystalProgressEl.innerText = t('prep_crystals_progress', { collected, max: profile.maxCollectibleCrystals });
  }

  if (loadoutCountEl) {
    loadoutCountEl.innerText = t('prep_loadout_title', { count: selectedLoadout.length });
  }

  // 2 Yuva Render
  const renderSlot = (slotIdx: number, container: HTMLElement | null) => {
    if (!container) return;
    const abilityId = selectedLoadout[slotIdx];
    if (abilityId) {
      const def = getAbilityDef(abilityId);
      container.innerHTML = `
        <div class="flex items-center gap-1.5 w-full bg-[var(--bg-elevated)] border border-[var(--accent-gold)] p-1.5 rounded-lg text-xs font-black text-[var(--accent-gold)] cursor-pointer shadow-sm active:scale-95 transition-all" data-remove-slot="${slotIdx}">
          <span>${def.icon}</span>
          <span class="truncate text-[10px] text-[var(--text-primary)]">${t('ability_name_' + abilityId)}</span>
        </div>
      `;
    } else {
      container.innerHTML = `<span class="text-[10px] font-bold text-[var(--text-secondary)] opacity-60">${t('prep_slot_empty')}</span>`;
    }
  };

  renderSlot(0, slot0El);
  renderSlot(1, slot1El);

  // 5 Yetenek Seçim Izgarası
  if (gridEl) {
    gridEl.innerHTML = '';
    ABILITIES.forEach(def => {
      const prog = userAbilities[def.id] || { level: 0, cooldownEndsAtMs: 0 };
      const remMs = getRemainingCooldownMs(prog, def.id, nowMs);
      const deg = getCooldownSweepDegrees(prog, def.id, nowMs);
      const ready = isAbilityReady(prog, def.id, nowMs);
      const selected = selectedLoadout.includes(def.id);

      const cell = document.createElement('div');
      let boxClasses = 'w-11 h-11 rounded-xl relative overflow-hidden flex items-center justify-center text-lg cursor-pointer border shadow-sm transition-all active:scale-95 ';

      if (selected) {
        boxClasses += 'border-2 border-[var(--accent-gold)] bg-[var(--accent-gold)]/20 shadow-md ring-2 ring-[var(--accent-gold)] z-10';
      } else if (ready) {
        boxClasses += 'border-[var(--border-strong)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]';
      } else {
        boxClasses += 'border-[var(--border-subtle)] bg-[var(--bg-card)] opacity-50 cursor-not-allowed';
      }

      cell.className = boxClasses;
      cell.setAttribute('data-select-ability', def.id);

      let cdOverlayHTML = '';
      if (remMs > 0) {
        cdOverlayHTML = `
          <div data-cooldown-overlay="${def.id}" class="absolute inset-0 pointer-events-none transition-all duration-300" style="background: conic-gradient(rgba(15, 23, 42, 0.58) 0deg ${deg}deg, transparent ${deg}deg 360deg);"></div>
          <div data-cooldown-text="${def.id}" class="absolute bottom-0.5 left-0.5 right-0.5 rounded-md bg-slate-950/55 text-[8px] font-mono font-black text-amber-200 text-center leading-none">${formatCooldownShort(remMs, getLang())}</div>
        `;
      }

      cell.innerHTML = `
        <span>${def.icon}</span>
        ${cdOverlayHTML}
      `;

      gridEl.appendChild(cell);
    });
  }
  // Yol Ayrımı Seçimi (Branching Selector) Renderı
  const branchContainer = document.getElementById('prep-branch-container');
  const branchBadge = document.getElementById('prep-branch-badge');
  const btnSpeed = document.getElementById('btn-branch-speed');
  const btnRisk = document.getElementById('btn-branch-risk');

  if (branchContainer) {
    if (isBranching) {
      branchContainer.classList.remove('hidden');
      if (branchBadge) {
        branchBadge.innerText = currentBranch === 'risk' ? t('map_branch_risk_badge') : t('map_branch_speed_badge');
      }
      if (btnSpeed && btnRisk) {
        if (currentBranch === 'speed') {
          btnSpeed.className = 'p-2 rounded-xl border border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/40 text-[11px] font-black flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer shadow-md';
          btnRisk.className = 'p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer opacity-70';
        } else {
          btnRisk.className = 'p-2 rounded-xl border border-rose-400 bg-rose-500/20 text-rose-300 ring-2 ring-rose-400/40 text-[11px] font-black flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer shadow-md';
          btnSpeed.className = 'p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer opacity-70';
        }

        btnSpeed.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          SoundManager.playTap();
          UserManager.setLevelBranchChoice(level, 'speed');
          renderLevelPrepModal(nowMs);
        };

        btnRisk.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          SoundManager.playTap();
          UserManager.setLevelBranchChoice(level, 'risk');
          renderLevelPrepModal(nowMs);
        };
      }
    } else {
      branchContainer.classList.add('hidden');
    }
  }


  // Pasif Kalıntılar (Relics) Satırı Renderı
  const relicsRow = document.getElementById('prep-relics-row');
  const relicStatus = document.getElementById('prep-relic-status');
  const unlockedRelics = UserManager.getUnlockedRelics();
  const equippedRelicId = UserManager.getEquippedRelic();

  if (relicStatus) {
    if (equippedRelicId) {
      const def = getRelicDef(equippedRelicId);
      relicStatus.innerText = `✓ ${t(def.nameKey)}`;
      relicStatus.className = 'text-[9px] font-bold text-[var(--accent-gold)]';
    } else {
      relicStatus.innerText = t('relic_toast_unequipped');
      relicStatus.className = 'text-[9px] font-bold text-[var(--text-secondary)]';
    }
  }

  if (relicsRow) {
    relicsRow.innerHTML = '';
    RELICS.forEach(relic => {
      const isUnlocked = unlockedRelics.includes(relic.id);
      const isEquipped = equippedRelicId === relic.id;
      const relicBtn = document.createElement('button');

      let btnClasses = 'p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative ';
      if (isEquipped) {
        btnClasses += 'bg-[var(--accent-gold)]/20 border-[var(--accent-gold)] ring-2 ring-[var(--accent-gold)]/50 shadow-md scale-105';
      } else if (isUnlocked) {
        btnClasses += 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border-[var(--border-strong)] text-[var(--text-primary)]';
      } else {
        btnClasses += 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] opacity-40 cursor-not-allowed';
      }

      relicBtn.className = btnClasses;
      relicBtn.setAttribute('data-relic-id', relic.id);
      relicBtn.setAttribute('title', `${t(relic.nameKey)} - ${t(relic.descKey)}`);
      relicBtn.innerHTML = `
        <span class="text-base mb-0.5">${relic.icon}</span>
        <span class="text-[8px] font-black truncate max-w-full leading-none">${isUnlocked ? (isEquipped ? '✓' : t(relic.nameKey).slice(0, 5)) : `🔒${relic.unlockLevel}`}</span>
      `;

      if (isUnlocked) {
        relicBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          SoundManager.playTap();
          if (isEquipped) {
            UserManager.equipRelic(null);
            UIManager.showToast(t('relic_toast_unequipped'), 'info');
          } else {
            UserManager.equipRelic(relic.id);
            UIManager.showToast(t('relic_toast_equipped', { name: t(relic.nameKey) }), 'success');
          }
          renderLevelPrepModal(nowMs);
        };
      } else {
        relicBtn.onclick = () => {
          UIManager.showToast(t('relic_locked_hint', { level: relic.unlockLevel }), 'info');
        };
      }

      relicsRow.appendChild(relicBtn);
    });
  }


  // Olay Dinleyicileri
  document.querySelectorAll('[data-remove-slot]').forEach(el => {
    el.addEventListener('click', (e) => {
      const idxStr = (e.currentTarget as HTMLElement).getAttribute('data-remove-slot');
      if (idxStr !== null) {
        const idx = parseInt(idxStr);
        if (!isNaN(idx) && idx >= 0 && idx < selectedLoadout.length) {
          SoundManager.playTap();
          selectedLoadout.splice(idx, 1);
          renderLevelPrepModal(nowMs);
        }
      }
    });
  });

  document.querySelectorAll('[data-select-ability]').forEach(el => {
    el.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-select-ability') as AbilityId;
      if (!id) return;

      const prog = userAbilities[id] || { level: 0, cooldownEndsAtMs: 0 };
      const remMs = getRemainingCooldownMs(prog, id, nowMs);
      const ready = isAbilityReady(prog, id, nowMs);
      const isSelected = selectedLoadout.includes(id);

      if (isSelected) {
        SoundManager.playTap();
        selectedLoadout = selectedLoadout.filter(a => a !== id);
        renderLevelPrepModal(nowMs);
        return;
      }

      if (!ready) {
        if (prog.level < 1) {
          UIManager.showToast(t('prep_locked_toast'), "info");
        } else {
          UIManager.showToast(t('prep_cooldown_toast'), "info");
        }
        return;
      }

      if (selectedLoadout.length >= ECONOMY_CONFIG.maxLoadoutSlots) {
        UIManager.showToast(t('prep_max_two_toast'), "info");
        return;
      }

      SoundManager.playTap();
      selectedLoadout.push(id);
      renderLevelPrepModal(nowMs);
    });
  });
}

export function initLevelPrepController(): void {
  document.getElementById('btn-close-level-prep')?.addEventListener('click', () => {
    closeLevelPrepModal();
  });

  document.getElementById('btn-prep-open-abilities')?.addEventListener('click', () => {
    closeLevelPrepModal();
    openAbilitiesModal(Date.now(), () => reopenCurrentLevelPrepModal());
  });

  document.getElementById('btn-prep-start-game')?.addEventListener('click', () => {
    closeLevelPrepModal();
    if (currentPrepParams) {
      currentPrepParams.onConfirmStart([...selectedLoadout]);
    }
  });
}
