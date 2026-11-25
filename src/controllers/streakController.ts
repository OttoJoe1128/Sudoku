import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { SoundManager } from '../engine/soundManager';
import { AdService } from '../services/adService';
import { t, applyStaticTranslations } from '../i18n/translations';

export function openStreakModal(): void {
  UIManager.toggleModal('streak-modal', true);
  applyStaticTranslations();
  renderStreakModalUI();
}

export function closeStreakModal(): void {
  UIManager.toggleModal('streak-modal', false);
}

export function refreshStreakLanguageUI(): void {
  const modal = document.getElementById('streak-modal');
  if (!modal || modal.classList.contains('hidden')) return;
  applyStaticTranslations();
  renderStreakModalUI();
}

function renderStreakModalUI(): void {
  const streak = UserManager.getDailyStreak();
  const subEl = document.getElementById('streak-modal-subtitle');
  const gridEl = document.getElementById('streak-calendar-grid');

  if (subEl) {
    subEl.innerText = t('streak_sub_active', { count: streak });
  }

  if (gridEl) {
    gridEl.innerHTML = '';
    const dayMod = ((streak - 1) % 7) + 1;

    for (let day = 1; day <= 7; day++) {
      const isPastOrCurrent = day <= dayMod;
      const isCurrentDay = day === dayMod;

      const card = document.createElement('div');
      let classes = 'flex flex-col items-center justify-center p-1.5 rounded-xl border text-[10px] font-black transition-all ';

      if (isCurrentDay) {
        classes += 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-md ring-2 ring-amber-400/40 z-10';
      } else if (isPastOrCurrent) {
        classes += 'bg-[var(--bg-card)] text-[var(--accent-gold)] border-[var(--border-strong)]';
      } else {
        classes += 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] opacity-50';
      }

      card.className = classes;
      card.innerHTML = `
        <span class="text-[8px] font-black opacity-90 whitespace-nowrap leading-none tracking-tighter">${t('streak_day_tag', { day })}</span>
        <span class="text-sm mt-0.5">${isPastOrCurrent ? '🔥' : '🔒'}</span>
      `;
      gridEl.appendChild(card);
    }
  }
}

export function initStreakController(callbacks?: { onUpdateGoldDisplay?: () => void }): void {
  document.getElementById('menu-streak-capsule')?.addEventListener('click', () => {
    SoundManager.playTap();
    openStreakModal();
  });

  document.getElementById('btn-close-streak')?.addEventListener('click', () => {
    closeStreakModal();
  });

  document.getElementById('btn-streak-repair-gold')?.addEventListener('click', async () => {
    SoundManager.playNumber();
    const currentGold = UserManager.getGold();
    const cost = 50;

    if (currentGold >= cost) {
      await UserManager.updateProgress(UserManager.getCurrentLevel(), currentGold - cost);
      const newStreak = UserManager.repairDailyStreak();
      if (callbacks?.onUpdateGoldDisplay) callbacks.onUpdateGoldDisplay();
      UIManager.showToast(t('streak_toast_repaired', { count: newStreak }), 'success');
      renderStreakModalUI();
    } else {
      UIManager.showToast(t('streak_toast_no_gold'), 'error');
    }
  });

  document.getElementById('btn-streak-repair-ad')?.addEventListener('click', async () => {
    const adRes = await AdService.showRewardedReviveAd();
    if (adRes.rewarded) {
      const newStreak = UserManager.repairDailyStreak();
      UIManager.showToast(t('streak_toast_repaired', { count: newStreak }), 'success');
      renderStreakModalUI();
    } else {
      UIManager.showToast(t('toast_ad_failed'), 'error');
    }
  });
}
