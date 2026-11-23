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
import { getLevelModifierProfile } from '../engine/levelModifiers';

let selectedLoadout: AbilityId[] = [];
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
  UIManager.toggleModal('level-prep-modal', true);
  applyStaticTranslations();
  renderLevelPrepModal(params.nowMs || Date.now());
}

export function refreshLevelPrepLanguageUI(): void {
  const modal = document.getElementById('level-prep-modal');
  if (!modal || modal.classList.contains('hidden')) return;
  applyStaticTranslations();
  if (currentPrepParams) {
    renderLevelPrepModal(Date.now());
  }
}

function renderLevelPrepModal(nowMs: number = Date.now()): void {
  if (!currentPrepParams) return;
  const { level, diff, variant } = currentPrepParams;

  const userAbilities = UserManager.getAbilitiesState();
  const profile = getLevelModifierProfile(level, variant, {
    runeMagnetLevel: selectedLoadout.includes('rune_magnet') ? (userAbilities.rune_magnet?.level || 0) : 0,
    rhythmBenderLevel: selectedLoadout.includes('rhythm_bender') ? (userAbilities.rhythm_bender?.level || 0) : 0
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

  if (titleEl) titleEl.innerText = `${t('label_level')} ${level} • ${t('var_' + variant)}`;
  if (energyBadgeEl) energyBadgeEl.innerText = `${profile.icon} ${t('energy_name_' + profile.energyId)}`;
  if (energyDescEl) energyDescEl.innerText = t('energy_desc_' + profile.energyId);

  if (summaryEl) {
    const parts: string[] = [`💎 x${profile.crystalCount}`];
    if (profile.keySealPairs > 0) parts.push(`🗝️ x${profile.keySealPairs}`);
    if (profile.sparkCount > 0) parts.push(`⚡ x${profile.sparkCount}`);
    if (profile.treasureCount > 0) parts.push(`🎁 x${profile.treasureCount}`);
    if (profile.sprintTargetSec > 0) parts.push(`⏱️ ${profile.sprintTargetSec}s`);
    if (profile.maxMistakes < 3) parts.push(`🔥 ${profile.maxMistakes}`);
    summaryEl.innerHTML = parts.map(p => `<span>${p}</span>`).join('<span class="text-[var(--border-subtle)]">•</span>');
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
    openAbilitiesModal();
  });

  document.getElementById('btn-prep-start-game')?.addEventListener('click', () => {
    closeLevelPrepModal();
    if (currentPrepParams) {
      currentPrepParams.onConfirmStart([...selectedLoadout]);
    }
  });
}
