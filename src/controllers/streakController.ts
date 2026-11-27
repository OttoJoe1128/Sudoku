import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { SoundManager } from '../engine/soundManager';
import { AdService } from '../services/adService';
import { t, applyStaticTranslations, getLang } from '../i18n/translations';

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
  const rewardBadgeEl = document.getElementById('streak-reward-badge');

  if (subEl) {
    subEl.innerText = t('streak_sub_active', { count: streak });
  }

  const tempAbility = UserManager.getTemporaryAbilityInfo();
  if (rewardBadgeEl) {
    if (tempAbility.id) {
      rewardBadgeEl.className = "bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] font-black px-2 py-1 rounded-lg shrink-0";
      rewardBadgeEl.innerText = `✅ ${t('ability_' + tempAbility.id)}`;
    } else {
      rewardBadgeEl.className = "bg-amber-400/20 text-amber-300 border border-amber-400/50 text-[10px] font-black px-2 py-1 rounded-lg shrink-0";
      rewardBadgeEl.innerText = `🎁 24Sa`;
    }
  }

  if (gridEl) {
    gridEl.innerHTML = '';

    const now = new Date();
    const jsDay = now.getDay();
    const currentMondayIdx = jsDay === 0 ? 6 : jsDay - 1; // 0=Pzt, 1=Sal, ... 6=Paz

    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() - currentMondayIdx);

    const loggedInDates = UserManager.getDailyStreakDates();
    const dayTagsTr = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const dayTagsEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const targetDate = new Date(mondayDate);
      targetDate.setDate(mondayDate.getDate() + dayIdx);
      const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

      const isPast = dayIdx < currentMondayIdx;
      const isToday = dayIdx === currentMondayIdx;
      const isFuture = dayIdx > currentMondayIdx;
      const hasLoggedIn = loggedInDates.includes(dateStr);

      const card = document.createElement('div');
      let classes = 'flex flex-col items-center justify-center p-1.5 rounded-xl border text-[10px] font-black transition-all ';

      let dayIcon = '🔒';
      if (isToday) {
        classes += 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-md ring-2 ring-amber-400/40 z-10';
        dayIcon = '🔥';
      } else if (hasLoggedIn) {
        classes += 'bg-[var(--bg-card)] text-[var(--accent-gold)] border-[var(--border-strong)]';
        dayIcon = '🔥';
      } else if (isPast) {
        classes += 'bg-rose-500/10 text-rose-300 border-rose-500/30 opacity-70';
        dayIcon = '💔';
      } else {
        classes += 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] opacity-40';
        dayIcon = '🔒';
      }

      const dayLabel = getLang() === 'en' ? dayTagsEn[dayIdx] : dayTagsTr[dayIdx];
      card.className = classes;
      card.innerHTML = `
        <span class="text-[8px] font-black opacity-90 whitespace-nowrap leading-none tracking-tighter">${dayLabel}</span>
        <span class="text-sm mt-0.5">${dayIcon}</span>
      `;
      gridEl.appendChild(card);
    }
  }

  // 7 günlük seri tamamlandığında 24 saatlik geçici yetenek hediyesi kontrolü
  if (streak >= 7 && !tempAbility.id) {
    const granted = UserManager.grantTemporaryAbilityReward();
    UIManager.showToast(t('streak_toast_reward_granted', { ability: t('ability_' + granted.id) }), 'success');
  }

  const isBroken = UserManager.isStreakBroken();
  const btnGold = document.getElementById('btn-streak-repair-gold') as HTMLButtonElement | null;
  const btnAd = document.getElementById('btn-streak-repair-ad') as HTMLButtonElement | null;

  if (btnGold) {
    if (isBroken) {
      btnGold.removeAttribute('disabled');
      btnGold.className = "w-full bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer";
    } else {
      btnGold.setAttribute('disabled', 'true');
      btnGold.className = "w-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] opacity-40 border border-[var(--border-subtle)] font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 pointer-events-none cursor-not-allowed";
    }
  }

  if (btnAd) {
    if (isBroken) {
      btnAd.removeAttribute('disabled');
      btnAd.className = "w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer";
    } else {
      btnAd.setAttribute('disabled', 'true');
      btnAd.className = "w-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] opacity-40 border border-[var(--border-subtle)] font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 pointer-events-none cursor-not-allowed";
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
    if (!UserManager.isStreakBroken()) {
      UIManager.showToast(t('streak_status_perfect'), "info");
      return;
    }
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
    if (!UserManager.isStreakBroken()) {
      UIManager.showToast(t('streak_status_perfect'), "info");
      return;
    }
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
