import { UIManager } from '../ui';
import { UserManager } from '../store/userState';
import { SoundManager } from '../engine/soundManager';
import { t, getLang, applyStaticTranslations } from '../i18n/translations';
import { AdService } from '../services/adService';
import {
  AbilityId,
  ABILITIES,
  getAbilityDef,
  getAbilityTierDefs,
  getRemainingCooldownMs,
  getCooldownSweepDegrees,
  formatCooldownShort,
  getUpgradeCost,
  ECONOMY_CONFIG
} from '../engine/abilities';

let abilitiesInterval: any = null;
let onAbilitiesCloseReturnCallback: (() => void) | null = null;
let currentDetailAbilityId: AbilityId | null = null;

export function updateCrystalDisplays(): void {
  const c = UserManager.getCrystals();
  const g = UserManager.getGold();

  const mapC = document.getElementById('map-crystal-balance');
  const modalC = document.getElementById('abilities-crystal-balance');
  const modalG = document.getElementById('abilities-gold-balance');
  const detailC = document.getElementById('ability-detail-crystal-balance');
  const detailG = document.getElementById('ability-detail-gold-balance');

  if (mapC) mapC.innerText = c.toString();
  if (modalC) modalC.innerText = c.toString();
  if (modalG) modalG.innerText = g.toString();
  if (detailC) detailC.innerText = c.toString();
  if (detailG) detailG.innerText = g.toString();
}

export function closeAbilityDetailModal(): void {
  currentDetailAbilityId = null;
  UIManager.toggleModal('ability-detail-modal', false);
}

export function openAbilityDetailModal(id: AbilityId): void {
  currentDetailAbilityId = id;
  UIManager.toggleModal('ability-detail-modal', true);
  applyStaticTranslations();
  renderAbilityDetailModal(id);
}

export function closeAbilitiesModal(): void {
  closeAbilityDetailModal();
  if (abilitiesInterval) {
    clearInterval(abilitiesInterval);
    abilitiesInterval = null;
  }
  UIManager.toggleModal('abilities-modal', false);
  if (onAbilitiesCloseReturnCallback) {
    const cb = onAbilitiesCloseReturnCallback;
    onAbilitiesCloseReturnCallback = null;
    cb();
  }
}

export function openAbilitiesModal(nowMs: number = Date.now(), onCloseReturn?: () => void): void {
  onAbilitiesCloseReturnCallback = onCloseReturn || null;
  UIManager.toggleModal('abilities-modal', true);
  applyStaticTranslations();
  renderAbilitiesList(nowMs);

  if (abilitiesInterval) clearInterval(abilitiesInterval);
  abilitiesInterval = setInterval(() => {
    renderAbilitiesList(Date.now());
    if (currentDetailAbilityId) {
      renderAbilityDetailModal(currentDetailAbilityId);
    }
  }, 1000);
}

export function refreshAbilitiesLanguageUI(): void {
  const modal = document.getElementById('abilities-modal');
  if (modal && !modal.classList.contains('hidden')) {
    applyStaticTranslations();
    renderAbilitiesList(Date.now());
  }
  const detailModal = document.getElementById('ability-detail-modal');
  if (detailModal && !detailModal.classList.contains('hidden') && currentDetailAbilityId) {
    applyStaticTranslations();
    renderAbilityDetailModal(currentDetailAbilityId);
  }
}

function renderAbilityDetailModal(id: AbilityId): void {
  updateCrystalDisplays();
  const def = getAbilityDef(id);
  const prog = UserManager.getAbilityProgress(id);
  const tiers = getAbilityTierDefs(id);

  const iconBox = document.getElementById('ability-detail-icon-box');
  const nameEl = document.getElementById('ability-detail-name');
  const descEl = document.getElementById('ability-detail-desc');
  const tiersContainer = document.getElementById('ability-detail-tiers-list');

  if (iconBox) iconBox.innerHTML = def.icon;
  if (nameEl) nameEl.innerText = t('ability_name_' + id);
  if (descEl) descEl.innerText = t('ability_desc_' + id);

  if (!tiersContainer) return;
  tiersContainer.innerHTML = '';

  tiers.forEach(tierDef => {
    const targetLvl = tierDef.level;
    const isUnlocked = prog.level >= targetLvl;
    const isNextUpgrade = targetLvl === prog.level + 1;
    const isLockedFuture = targetLvl > prog.level + 1;

    const card = document.createElement('div');
    let classes = 'w-full rounded-2xl p-3 flex justify-between items-center gap-2.5 shadow-sm border text-left transition-all relative ';

    let emblemClass = 'w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] flex items-center justify-center text-lg font-black shrink-0 ';
    let rightHTML = '';

    if (isUnlocked) {
      classes += 'bg-[var(--bg-elevated)] border-[var(--accent-gold)]/60 shadow-md';
      emblemClass += 'text-[var(--accent-gold)] shadow-inner';
      rightHTML = `
        <span class="bg-amber-400/20 text-amber-300 border border-amber-400/50 text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0">✓ ${t('ability_status_unlocked')}</span>
      `;
    } else if (isNextUpgrade) {
      const cost = getUpgradeCost(prog.level);
      classes += 'bg-amber-500/10 border-amber-400/80 ring-2 ring-amber-400/40 z-10';
      emblemClass += 'text-amber-400';
      rightHTML = `
        <button data-detail-upgrade="${id}" class="bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-2 px-3 rounded-xl text-xs shadow active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer shrink-0">
          <span>${prog.level === 0 ? t('ability_btn_unlock') : t('ability_btn_upgrade')}</span>
          <span class="text-[9px] font-mono font-bold block opacity-90">💎 ${cost?.crystals} • 🪙 ${cost?.gold}</span>
        </button>
      `;
    } else {
      classes += 'bg-[var(--bg-elevated)]/50 border-[var(--border-subtle)] opacity-40 grayscale pointer-events-none';
      emblemClass += 'text-[var(--text-secondary)]';
      rightHTML = `
        <span class="text-[10px] font-bold text-[var(--text-secondary)] shrink-0">🔒 ${t('ability_requires_level', { lvl: targetLvl - 1 })}</span>
      `;
    }

    card.className = classes;
    card.innerHTML = `
      <div class="${emblemClass}">
        <span>${targetLvl}</span>
      </div>
      <div class="flex-1 min-w-0 pr-1">
        <div class="flex items-center gap-1.5 mb-0.5">
          <h4 class="text-xs font-black text-[var(--text-primary)] truncate">${t(tierDef.titleKey)}</h4>
          <span class="text-[9px] font-mono font-bold text-[var(--accent-gold)] shrink-0">Sv ${targetLvl}</span>
        </div>
        <p class="text-[10px] text-[var(--text-secondary)] font-medium leading-snug">${t(tierDef.descKey)}</p>
      </div>
      ${rightHTML}
    `;

    tiersContainer.appendChild(card);
  });

  // Upgrade button listener in Detail Modal
  tiersContainer.querySelector('[data-detail-upgrade]')?.addEventListener('click', async () => {
    SoundManager.playNumber();
    const res = await UserManager.upgradeAbility(id);
    if (res.ok) {
      UIManager.showToast(t('ability_toast_upgraded', { name: t('ability_name_' + id) }), "success");
      renderAbilityDetailModal(id);
      renderAbilitiesList(Date.now());
    } else if (res.reason === 'insufficient_crystals') {
      UIManager.showToast(t('ability_toast_no_crystals'), "error");
    } else if (res.reason === 'insufficient_gold') {
      UIManager.showToast(t('ability_toast_no_gold'), "error");
    }
  });
}

function renderAbilitiesList(nowMs: number = Date.now()): void {
  updateCrystalDisplays();

  const container = document.getElementById('abilities-list');
  if (!container) return;

  container.innerHTML = '';

  ABILITIES.forEach(def => {
    const prog = UserManager.getAbilityProgress(def.id);
    const remMs = getRemainingCooldownMs(prog, def.id, nowMs);
    const deg = getCooldownSweepDegrees(prog, def.id, nowMs);
    const onCd = remMs > 0;
    const isUnlocked = prog.level >= 1;

    const card = document.createElement('div');
    card.className = 'w-full bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-2xl p-3 flex justify-between items-center gap-2.5 shadow-sm relative overflow-hidden';
    card.setAttribute('data-ability-card', def.id);

    let overlayHTML = '';
    if (onCd) {
      overlayHTML = `
        <div data-cooldown-overlay="${def.id}" class="absolute inset-0 pointer-events-none transition-all duration-300" style="background: conic-gradient(rgba(15, 23, 42, 0.58) 0deg ${deg}deg, transparent ${deg}deg 360deg);"></div>
        <div data-cooldown-text="${def.id}" class="absolute bottom-0.5 left-0.5 right-0.5 rounded-md bg-slate-950/55 text-[9px] font-mono font-black text-amber-200 text-center leading-tight drop-shadow">${formatCooldownShort(remMs, getLang())}</div>
      `;
    }

    let actionButtonHTML = '';
    if (!isUnlocked) {
      const cost = getUpgradeCost(0);
      actionButtonHTML = `
        <div class="flex flex-col items-end gap-1.5 shrink-0">
          <button data-open-detail="${def.id}" class="text-[9px] font-bold text-[var(--accent-gold)] hover:underline cursor-pointer flex items-center gap-0.5">
            <span>ⓘ ${t('ability_btn_details')}</span>
          </button>
          <button data-upgrade-ability="${def.id}" class="bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-1.5 px-2.5 rounded-xl text-[11px] shadow active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer">
            <span>${t('ability_btn_unlock')}</span>
            <span class="text-[9px] font-mono font-bold block opacity-90">💎 ${cost?.crystals || 5} • 🪙 ${cost?.gold || 20}</span>
          </button>
        </div>
      `;
    } else if (prog.level >= def.maxLevel) {
      actionButtonHTML = `
        <div class="flex flex-col items-end gap-1.5 shrink-0">
          <button data-open-detail="${def.id}" class="text-[9px] font-bold text-[var(--accent-gold)] hover:underline cursor-pointer flex items-center gap-0.5">
            <span>ⓘ ${t('ability_btn_details')}</span>
          </button>
          <span class="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-wider block bg-[var(--bg-card)] px-2 py-1 rounded-lg border border-[var(--border-subtle)]">${t('ability_btn_max')}</span>
        </div>
      `;
    } else {
      const cost = getUpgradeCost(prog.level);
      actionButtonHTML = `
        <div class="flex flex-col items-end gap-1.5 shrink-0">
          <button data-open-detail="${def.id}" class="text-[9px] font-bold text-[var(--accent-gold)] hover:underline cursor-pointer flex items-center gap-0.5">
            <span>ⓘ ${t('ability_btn_details')}</span>
          </button>
          <button data-upgrade-ability="${def.id}" class="bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-1.5 px-2.5 rounded-xl text-[11px] shadow active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer">
            <span>${t('ability_btn_upgrade')}</span>
            <span class="text-[9px] font-mono font-bold block opacity-90">💎 ${cost?.crystals} • 🪙 ${cost?.gold}</span>
          </button>
        </div>
      `;
    }

    let rechargeButtonsHTML = '';
    if (onCd) {
      rechargeButtonsHTML = `
        <div class="flex gap-1.5 mt-1 shrink-0">
          <button data-recharge-gold="${def.id}" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--accent-gold)] border border-[var(--border-strong)] font-black text-[9px] px-2 py-1 rounded-xl shadow active:scale-95 transition-all cursor-pointer">
            ${t('ability_btn_recharge_gold')}
          </button>
          <button data-recharge-ad="${def.id}" class="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] px-2 py-1 rounded-xl shadow active:scale-95 transition-all cursor-pointer">
            ${t('ability_btn_recharge_ad')}
          </button>
        </div>
      `;
    }

    const levelText = isUnlocked
      ? t('ability_level_tag', { lvl: prog.level })
      : t('ability_status_locked');

    card.innerHTML = `
      <div data-open-detail="${def.id}" class="w-13 h-13 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-strong)] relative overflow-hidden flex items-center justify-center text-2xl shadow-inner shrink-0 cursor-pointer">
        <span>${def.icon}</span>
        ${overlayHTML}
      </div>
      <div data-open-detail="${def.id}" class="flex-1 text-left min-w-0 pr-1 cursor-pointer">
        <div class="flex items-center gap-1.5 mb-0.5">
          <h4 class="text-xs font-black text-[var(--text-primary)] truncate">${t('ability_name_' + def.id)}</h4>
          <span class="text-[9px] font-black uppercase text-[var(--accent-gold)] shrink-0">${levelText}</span>
        </div>
        <p class="text-[10px] text-[var(--text-secondary)] font-medium leading-snug line-clamp-2">${t('ability_desc_' + def.id)}</p>
        ${rechargeButtonsHTML}
      </div>
      ${actionButtonHTML}
    `;

    container.appendChild(card);
  });

  // Olay Dinleyicileri
  container.querySelectorAll('[data-open-detail]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (e.currentTarget as HTMLElement).getAttribute('data-open-detail') as AbilityId;
      if (!id) return;
      SoundManager.playNumber();
      openAbilityDetailModal(id);
    });
  });

  container.querySelectorAll('[data-upgrade-ability]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = (e.currentTarget as HTMLElement).getAttribute('data-upgrade-ability') as AbilityId;
      if (!id) return;
      SoundManager.playNumber();

      const res = await UserManager.upgradeAbility(id);
      if (res.ok) {
        UIManager.showToast(t('ability_toast_upgraded', { name: t('ability_name_' + id) }), "success");
        renderAbilitiesList(Date.now());
      } else if (res.reason === 'insufficient_crystals') {
        UIManager.showToast(t('ability_toast_no_crystals'), "error");
      } else if (res.reason === 'insufficient_gold') {
        UIManager.showToast(t('ability_toast_no_gold'), "error");
      }
    });
  });

  container.querySelectorAll('[data-recharge-gold]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = (e.currentTarget as HTMLElement).getAttribute('data-recharge-gold') as AbilityId;
      if (!id) return;
      SoundManager.playNumber();

      const res = await UserManager.rechargeAbilityWithGold(id);
      if (res.ok) {
        UIManager.showToast(t('ability_toast_recharged', { name: t('ability_name_' + id) }), "success");
        renderAbilitiesList(Date.now());
      } else if (res.reason === 'insufficient_gold') {
        UIManager.showToast(t('ability_toast_no_gold'), "error");
      }
    });
  });

  container.querySelectorAll('[data-recharge-ad]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = (e.currentTarget as HTMLElement).getAttribute('data-recharge-ad') as AbilityId;
      if (!id) return;

      const adRes = await AdService.showRewardedReviveAd();
      if (adRes.rewarded) {
        const res = await UserManager.rechargeAbilityWithAd(id);
        if (res.ok) {
          UIManager.showToast(t('ability_toast_recharged', { name: t('ability_name_' + id) }), "success");
          renderAbilitiesList(Date.now());
        }
      } else {
        UIManager.showToast(t('toast_ad_failed'), "error");
      }
    });
  });
}

export function initAbilitiesController(): void {
  const openHandler = () => {
    SoundManager.playNumber();
    openAbilitiesModal();
  };

  document.getElementById('btn-open-abilities')?.addEventListener('click', openHandler);
  document.getElementById('btn-menu-open-abilities')?.addEventListener('click', openHandler);
  document.getElementById('menu-crystal-capsule')?.addEventListener('click', openHandler);

  document.getElementById('btn-close-abilities')?.addEventListener('click', () => {
    closeAbilitiesModal();
  });

  document.getElementById('btn-close-ability-detail')?.addEventListener('click', () => {
    closeAbilityDetailModal();
  });
}

