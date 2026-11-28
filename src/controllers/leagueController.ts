import { UIManager } from '../ui';
import { SoundManager } from '../engine/soundManager';
import { getLeagueByRating, getLeagueProgress, LeagueManager } from '../engine/leagueSystem';
import { UserManager } from '../store/userState';
import { t, getLang, applyStaticTranslations } from '../i18n/translations';
import { getRemainingSeasonDays } from '../engine/seasonalEvents';

export function openLeagueModal(): void {
  UIManager.toggleModal('league-modal', true);
  applyStaticTranslations();
  renderLeagueModalUI();
}

export function closeLeagueModal(): void {
  SoundManager.playTap();
  UIManager.toggleModal('league-modal', false);
}

export function renderLeagueModalUI(): void {
  const rating = 1200; // Varsayılan ELO rating
  const league = getLeagueByRating(rating);
  const prog = getLeagueProgress(rating);

  const iconEl = document.getElementById('league-modal-icon');
  const nameEl = document.getElementById('league-modal-name');
  const ratingEl = document.getElementById('league-modal-rating');
  const nextNameLabel = document.getElementById('league-next-name-label');
  const progressBar = document.getElementById('league-progress-bar');
  const mmrLabel = document.getElementById('league-mmr-remaining-label');
  const goldEl = document.getElementById('league-reward-gold');
  const crystalsEl = document.getElementById('league-reward-crystals');
  const claimBtn = document.getElementById('btn-claim-league-reward') as HTMLButtonElement | null;

  if (iconEl) iconEl.innerText = league.icon;
  if (nameEl) nameEl.innerText = t(league.nameKey);
  if (ratingEl) ratingEl.innerText = `${rating} MMR`;
  const remDays = getRemainingSeasonDays();
  const daysEl = document.getElementById('league-season-days-label');
  if (daysEl) {
    daysEl.innerText = getLang() === 'en' ? `${remDays} Days Left` : `${remDays} Gün Kaldı`;
  }


  if (nextNameLabel) {
    nextNameLabel.innerText = prog.nextLeague ? t(prog.nextLeague.nameKey) : t('ability_btn_max');
  }
  if (progressBar) progressBar.style.width = `${prog.progressPct}%`;
  if (mmrLabel) {
    mmrLabel.innerText = prog.nextLeague
      ? `${t(prog.nextLeague.nameKey)} için ${prog.mmrToNext} MMR kaldı`
      : 'Zirve Kademe!';
  }

  if (goldEl) goldEl.innerText = `+${league.endOfSeasonRewardGold} 🪙`;
  if (crystalsEl) crystalsEl.innerText = `+${league.endOfSeasonRewardCrystals} 💎`;

  const isClaimed = LeagueManager.isSeasonRewardClaimed('season_current', league.id);
  if (claimBtn) {
    if (isClaimed) {
      claimBtn.setAttribute('disabled', 'true');
      claimBtn.className = 'w-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] opacity-50 border border-[var(--border-subtle)] font-bold py-3 rounded-2xl text-xs cursor-not-allowed';
      claimBtn.innerText = t('season_reward_claimed');
    } else {
      claimBtn.removeAttribute('disabled');
      claimBtn.className = 'w-full bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1';
      claimBtn.innerText = 'Lig Sandığını Aç';
      claimBtn.onclick = async () => {
        SoundManager.playNumber();
        const res = await LeagueManager.claimLeagueSeasonReward('season_current', rating);
        if (res.success) {
          UIManager.showToast(t('league_reward_toast', { league: t(league.nameKey), gold: res.gold, crystals: res.crystals }), 'success');
          renderLeagueModalUI();
        }
      };
    }
  }
}

export function initLeagueController(): void {
  document.getElementById('menu-league-badge')?.addEventListener('click', (e) => {
    e.stopPropagation();
    SoundManager.playTap();
    openLeagueModal();
  });

  document.getElementById('btn-close-league')?.addEventListener('click', () => {
    closeLeagueModal();
  });

  document.getElementById('league-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      closeLeagueModal();
    }
  });
}
