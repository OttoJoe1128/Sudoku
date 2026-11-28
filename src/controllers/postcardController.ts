import { UIManager } from '../ui';
import { SoundManager } from '../engine/soundManager';
import { t, applyStaticTranslations } from '../i18n/translations';
import {
  getCurrentSeason,
  getRemainingSeasonDays,
  SeasonalEventManager,
  SeasonDef
} from '../engine/seasonalEvents';
import { UserManager } from '../store/userState';

export function openPostcardModal(): void {
  UIManager.toggleModal('postcard-modal', true);
  applyStaticTranslations();
  renderPostcardModalUI();
}

export function closePostcardModal(): void {
  SoundManager.playTap();
  UIManager.toggleModal('postcard-modal', false);
}

export function renderPostcardModalUI(): void {
  const currentSeason = getCurrentSeason();
  const collected = SeasonalEventManager.getCollectedStamps(currentSeason.id);
  const isCompleted = SeasonalEventManager.isPostcardCompleted(currentSeason.id);
  const isClaimed = SeasonalEventManager.isRewardClaimed(currentSeason.id);
  const remDays = getRemainingSeasonDays();

  const titleEl = document.getElementById('postcard-modal-title');
  const subEl = document.getElementById('postcard-modal-subtitle');
  const gridEl = document.getElementById('postcard-grid');
  const countLabel = document.getElementById('postcard-stamps-count-label');
  const progressBar = document.getElementById('postcard-progress-bar');
  const claimBtn = document.getElementById('btn-claim-postcard-reward') as HTMLButtonElement | null;
  const overlay = document.getElementById('postcard-completed-overlay');

  if (titleEl) titleEl.innerText = t(currentSeason.nameKey);
  if (subEl) subEl.innerText = `${remDays} Gün Kaldı • ${t(currentSeason.descKey)}`;

  if (countLabel) countLabel.innerText = `${collected.length} / 9`;
  if (progressBar) progressBar.style.width = `${Math.min(100, Math.round((collected.length / 9) * 100))}%`;

  if (gridEl) {
    gridEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const tile = document.createElement('div');
      const hasStamp = collected.includes(i);

      if (hasStamp) {
        tile.className = 'rounded-xl flex items-center justify-center font-mono font-black text-xs text-white shadow-md border border-amber-300 select-none animate-pulse';
        tile.style.backgroundColor = currentSeason.artworkColors[i] || '#D97706';
        tile.innerHTML = `<span>#${i + 1}</span>`;
      } else {
        tile.className = 'rounded-xl flex items-center justify-center font-mono font-bold text-xs bg-[var(--bg-card)] border border-dashed border-[var(--border-strong)] text-[var(--text-secondary)] opacity-50 select-none';
        tile.innerHTML = `<span>🔒</span>`;
      }
      gridEl.appendChild(tile);
    }
  }

  if (overlay) {
    overlay.classList.toggle('hidden', !isClaimed);
  }

  if (claimBtn) {
    if (isClaimed) {
      claimBtn.setAttribute('disabled', 'true');
      claimBtn.className = 'w-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] opacity-50 border border-[var(--border-subtle)] font-bold py-3 rounded-2xl text-xs cursor-not-allowed';
      claimBtn.innerText = t('season_reward_claimed');
    } else if (isCompleted) {
      claimBtn.removeAttribute('disabled');
      claimBtn.className = 'w-full bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer animate-pulse';
      claimBtn.innerText = t('season_btn_claim');
      claimBtn.onclick = async () => {
        SoundManager.playNumber();
        const res = await SeasonalEventManager.claimSeasonReward(currentSeason.id);
        if (res.success) {
          UIManager.showToast(t('season_toast_reward_claimed', { gold: res.gold, crystals: res.crystals }), 'success');
          renderPostcardModalUI();
        }
      };
    } else {
      claimBtn.setAttribute('disabled', 'true');
      claimBtn.className = 'w-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] opacity-50 border border-[var(--border-subtle)] font-bold py-3 rounded-2xl text-xs cursor-not-allowed';
      claimBtn.innerText = `${t('season_stamps_progress', { current: collected.length })}`;
    }
  }
}

export function initPostcardController(): void {
  document.getElementById('btn-open-postcards')?.addEventListener('click', () => {
    SoundManager.playTap();
    openPostcardModal();
  });
  document.getElementById('postcard-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      closePostcardModal();
    }
  });


  document.getElementById('btn-close-postcard')?.addEventListener('click', () => {
    closePostcardModal();
  });
}
