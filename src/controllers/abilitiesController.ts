import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { SoundManager } from '../engine/soundManager';
import { t, getLang, applyStaticTranslations } from '../i18n/translations';
import { AdService } from '../services/adService';
import {
  AbilityId,
  ABILITIES,
  getAbilityDef,
  getRemainingCooldownMs,
  getCooldownSweepDegrees,
  formatCooldownShort,
  getUpgradeCost,
  ECONOMY_CONFIG
} from '../engine/abilities';

let abilitiesInterval: any = null;

export function updateCrystalDisplays(): void {
  const c = UserManager.getCrystals();
  const g = UserManager.getGold();

  const mapC = document.getElementById('map-crystal-balance');
  const modalC = document.getElementById('abilities-crystal-balance');
  const modalG = document.getElementById('abilities-gold-balance');

  if (mapC) mapC.innerText = c.toString();
  if (modalC) modalC.innerText = c.toString();
  if (modalG) modalG.innerText = g.toString();
}

export function closeAbilitiesModal(): void {
  if (abilitiesInterval) {
    clearInterval(abilitiesInterval);
    abilitiesInterval = null;
  }
  UIManager.toggleModal('abilities-modal', false);
}

export function openAbilitiesModal(nowMs: number = Date.now()): void {
  UIManager.toggleModal('abilities-modal', true);
  applyStaticTranslations();
  renderAbilitiesList(nowMs);

  if (abilitiesInterval) clearInterval(abilitiesInterval);
  abilitiesInterval = setInterval(() => {
    renderAbilitiesList(Date.now());
  }, 1000);
}

export function refreshAbilitiesLanguageUI(): void {
  const modal = document.getElementById('abilities-modal');
  if (!modal || modal.classList.contains('hidden')) return;
  applyStaticTranslations();
  renderAbilitiesList(Date.now());
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
        <button data-upgrade-ability="${def.id}" class="bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-2 px-3 rounded-xl text-xs shadow active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer shrink-0">
          <span>${t('ability_btn_unlock')}</span>
          <span class="text-[9px] font-mono font-bold block opacity-90">💎 ${cost?.crystals || 5} • 🪙 ${cost?.gold || 20}</span>
        </button>
      `;
    } else if (prog.level >= def.maxLevel) {
      actionButtonHTML = `
        <div class="flex flex-col items-end gap-1 shrink-0">
          <span class="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-wider block bg-[var(--bg-card)] px-2 py-1 rounded-lg border border-[var(--border-subtle)]">${t('ability_btn_max')}</span>
        </div>
      `;
    } else {
      const cost = getUpgradeCost(prog.level);
      actionButtonHTML = `
        <button data-upgrade-ability="${def.id}" class="bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-2 px-2.5 rounded-xl text-xs shadow active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer shrink-0">
          <span>${t('ability_btn_upgrade')}</span>
          <span class="text-[9px] font-mono font-bold block opacity-90">💎 ${cost?.crystals} • 🪙 ${cost?.gold}</span>
        </button>
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
      <div class="w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-strong)] relative overflow-hidden flex items-center justify-center text-2xl shadow-inner shrink-0">
        <span>${def.icon}</span>
        ${overlayHTML}
      </div>
      <div class="flex-1 text-left min-w-0 pr-1">
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
  container.querySelectorAll('[data-upgrade-ability]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
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
  document.getElementById('btn-open-abilities')?.addEventListener('click', () => {
    SoundManager.playNumber();
    openAbilitiesModal();
  });

  document.getElementById('btn-close-abilities')?.addEventListener('click', () => {
    closeAbilitiesModal();
  });
}
