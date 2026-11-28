import { menuTemplate } from '../templates/menu';
import { mapTemplate } from '../templates/map';
import { customModeTemplate } from '../templates/custom';
import { leaderboardTemplate } from '../templates/leaderboard';
import { shopTemplate } from '../templates/shop';
import { usernameModalTemplate } from '../templates/usernameModal';
import { achievementsTemplate } from '../templates/achievements';
import { placementModalTemplate } from '../templates/placementModal';
import { profileModalTemplate } from '../templates/profileModal';
import { matchModalTemplate } from '../templates/matchModal';
import { inboxModalTemplate } from '../templates/inboxModal';
import { savedGamesModalTemplate } from '../templates/savedGamesModal';
import { secondChanceModalTemplate } from '../templates/secondChanceModal';
import { onboardingModalTemplate } from '../templates/onboardingModal';
import { academyModalTemplate } from '../templates/academyModal';
import { abilitiesModalTemplate } from '../templates/abilitiesModal';
import { levelPrepModalTemplate } from '../templates/levelPrepModal';
import { crystalRepairModalTemplate } from '../templates/crystalRepairModal';
import { authModalTemplate } from '../templates/authModal';
import { streakModalTemplate } from '../templates/streakModal';
import { abilityDetailModalTemplate } from '../templates/abilityDetailModal';
import { postcardModalTemplate } from '../templates/postcardModal';
import { clanModalTemplate } from '../templates/clanModal';
import { leagueModalTemplate } from '../templates/leagueModal';
import { getLevelModifierProfile, isBranchingLevel } from '../../engine/levelModifiers';
import { getRelicDef } from '../../engine/relics';
import { getMapGateDef } from '../../engine/mapGates';
import { getAmbientBackgroundHTML } from '../../design/backgrounds';
import { Icons, renderAvatarSVG, renderRankBadgeSVG, AVATAR_LIST } from '../../design/icons';
import { t, getLang, translateRankName } from '../../i18n/translations';
import { getLevelConfig, getRegionForLevel } from '../../engine/rhythmConfig';
import { BoardMechanicsState, SpecialCellRuntime } from '../../engine/boardMechanics';
import { getAbilityDef, AbilityId } from '../../engine/abilities';
import { Player, SpeedRecord } from '../../engine/leaderboard';
import { ShopItems, ShopManager } from '../../engine/shop';
import { BadgeStatus } from '../../engine/achievements';
import { ProfileStats, UserManager } from '../../store/userState';
import { ChallengeRequest } from '../../engine/matchEngine';
import { BotCharacter } from '../../engine/botData';
import { SudokuVariant, KillerCage, SudokuGen } from '../../engine/sudoku';
import { SamuraiViewport, renderSamuraiBoard, SamuraiBoardData } from '../samuraiViewport';
import { SoundManager } from '../../engine/soundManager';
import { escapeHTML, formatDisplayName } from '../../utils/sanitize';
import { SavedGameRecord } from '../types';

export const shopUI = {
  renderShop(onBuyOrSelect: (itemId: string) => void) {
    const listEl = document.getElementById('shop-list');
    if (!listEl) return;

    const purchased = ShopManager.getPurchasedThemes();
    const active = ShopManager.getActiveTheme();
    const isEn = getLang() === 'en';

    listEl.innerHTML = ShopItems.map(item => {
      const isPurchased = purchased.includes(item.id);
      const isActive = active === item.id;
      const name = isEn && item.nameEn ? item.nameEn : item.name;

      let btnText = `${item.price} ${t('label_gold')}`;
      let btnClass = "bg-[var(--accent-gold)] text-[var(--text-on-gold)] hover:brightness-110";

      if (isActive) {
        btnText = t('btn_active');
        btnClass = "bg-[var(--accent-cyan)] text-[var(--text-on-gold)] cursor-default";
      } else if (isPurchased) {
        btnText = t('btn_use');
        btnClass = "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)]";
      }

      return `
        <div class="p-3.5 border border-[var(--border-subtle)] rounded-2xl flex justify-between items-center bg-[var(--bg-card)] shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl border border-[var(--border-strong)] flex items-center justify-center p-1 shadow-inner" style="background-color: ${item.previewColor}">
              <div class="w-3.5 h-3.5 rounded-full" style="background-color: ${item.accentColor}"></div>
            </div>
            <div>
              <p class="font-black text-[var(--text-primary)] text-sm">${name}</p>
              <p class="text-[10px] text-[var(--text-secondary)] font-bold">${isPurchased ? t('shop_owned') : t('shop_item')}</p>
            </div>
          </div>
          <button data-shop-id="${item.id}" class="shop-action-btn ${btnClass} px-4 py-2 rounded-xl font-black text-xs shadow-sm transition-all active:scale-95 shrink-0 whitespace-nowrap">
            ${btnText}
          </button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.shop-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-shop-id');
        if (id) onBuyOrSelect(id);
      });
    });
  },

  renderAchievements(badges: BadgeStatus[], onClaim: (badgeId: string) => void) {
    const listEl = document.getElementById('achievements-list');
    const unlockedCountEl = document.getElementById('badges-unlocked-count');
    const progressBarEl = document.getElementById('badges-progress-bar');

    const unlockedCount = badges.filter(b => b.isUnlocked).length;
    if (unlockedCountEl) unlockedCountEl.innerText = `${unlockedCount} / ${badges.length}`;
    if (progressBarEl) progressBarEl.style.width = `${Math.round((unlockedCount / badges.length) * 100)}%`;

    if (!listEl) return;

    const isEn = getLang() === 'en';

    listEl.innerHTML = badges.map(b => {
      const title = isEn && b.titleEn ? b.titleEn : b.title;
      const desc = isEn && b.descEn ? b.descEn : b.desc;
      const svgIcon = Icons[b.icon as keyof typeof Icons] || Icons.target;

      let statusBtn = `<span class="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-xl shrink-0 whitespace-nowrap">${t('label_locked')}</span>`;

      if (b.isClaimed) {
        statusBtn = `<span class="text-xs font-bold text-[var(--accent-cyan)] bg-[var(--bg-elevated)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] shrink-0 whitespace-nowrap">${t('label_claimed')}</span>`;
      } else if (b.isUnlocked) {
        statusBtn = `<button data-badge-id="${b.id}" class="claim-badge-btn bg-[var(--accent-gold)] text-[var(--text-on-gold)] hover:brightness-110 font-black text-xs px-3.5 py-1.5 rounded-xl shadow active:scale-95 transition-transform animate-pulse shrink-0 whitespace-nowrap">+${b.rewardGold} ${t('label_gold')}</button>`;
      }

      const iconContainerClass = b.isUnlocked
        ? "w-11 h-11 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--accent-gold)] text-[var(--accent-gold)] flex items-center justify-center shrink-0 shadow-inner"
        : "w-11 h-11 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center justify-center shrink-0 opacity-60";

      return `
        <div class="p-3 border border-[var(--border-subtle)] rounded-2xl flex justify-between items-center bg-[var(--bg-card)] ${b.isUnlocked ? 'shadow-sm' : 'opacity-60'}">
          <div class="flex items-center gap-3">
            <div class="${iconContainerClass}">${svgIcon}</div>
            <div class="text-left">
              <p class="font-black text-[var(--text-primary)] text-xs">${title}</p>
              <p class="text-[10px] text-[var(--text-secondary)] font-medium">${desc}</p>
            </div>
          </div>
          <div>${statusBtn}</div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.claim-badge-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-badge-id');
        if (id) onClaim(id);
      });
    });
  },

  renderSavedGamesList(
    records: SavedGameRecord[],
    onPlay: (record: SavedGameRecord) => void,
    onDelete: (record: SavedGameRecord) => void,
    emptyText?: string
  ) {
    const listEl = document.getElementById('saved-games-list');
    if (!listEl) return;

    if (records.length === 0) {
      listEl.innerHTML = `
        <div class="flex flex-col items-center justify-center py-10 text-center">
          <svg class="w-10 h-10 text-[var(--text-secondary)] opacity-50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p class="text-xs font-bold text-[var(--text-primary)] mb-0.5">${emptyText || t('no_active_games')}</p>
          <p class="text-[10px] text-[var(--text-secondary)]">${t('no_active_games_desc')}</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = records.map(r => {
      const variant = r.variant || 'classic';
      const emblem = this.getVariantEmblemSVG(variant, 20);
      const level = typeof r.level === 'number' ? r.level : 1;
      const diffStr = r.diff ? t('diff_' + r.diff).toUpperCase() : t('diff_basit').toUpperCase();
      const timeSec = typeof r.timeElapsed === 'number' ? r.timeElapsed : 0;
      const m = Math.floor(timeSec / 60).toString().padStart(2, '0');
      const s = (timeSec % 60).toString().padStart(2, '0');
      const isCustom = !!r.isCustomMode;
      const isMatch = !!r.isMatchMode;

      const deleteBtnHTML = `
        <button data-record-id="${r.id}" class="delete-saved-game-btn bg-rose-950/60 border border-rose-500/40 text-rose-300 font-black text-xs p-1.5 rounded-xl active:scale-90 transition-transform">
          ✕
        </button>
      `;

      let badgeHTML = `<span class="bg-[var(--accent-gold)] text-[var(--text-on-gold)] text-[8px] font-black px-1.5 py-0.5 rounded-md">${t('tag_map')}</span>`;
      let sublineHTML = `${t('label_level')} ${level} • ${diffStr} • ${timeSec > 0 ? `${m}:${s}` : t('label_ready')}`;

      if (isMatch) {
        badgeHTML = `<span class="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">${t('saved_tab_duel')}</span>`;
        sublineHTML = `VS ${escapeHTML(r.enemyName || t('label_rival'))} • ${diffStr} • ${m}:${s}`;
      } else if (isCustom) {
        badgeHTML = `<span class="bg-[var(--accent-cyan)] text-[var(--text-on-gold)] text-[8px] font-black px-1.5 py-0.5 rounded-md">${t('tag_custom')}</span>`;
        sublineHTML = `${diffStr} • ${timeSec > 0 ? `${m}:${s}` : t('label_ready')}`;
      }

      return `
        <div class="p-3 border border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-card)] shadow-sm flex items-center justify-between transition-all">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
              ${emblem}
            </div>
            <div class="text-left">
              <div class="flex items-center gap-1">
                <p class="font-black text-[var(--text-primary)] text-xs">${t('var_' + variant + '_full')}</p>
                ${badgeHTML}
              </div>
              <p class="text-[10px] text-[var(--text-secondary)] font-bold">${sublineHTML}</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button data-record-id="${r.id}" class="play-saved-game-btn bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black text-xs px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center gap-1 hover:brightness-110">
              <span>▶</span><span>${t('btn_continue')}</span>
            </button>
            ${deleteBtnHTML}
          </div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.play-saved-game-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (e.currentTarget as HTMLElement).getAttribute('data-record-id');
        const target = records.find(r => r.id === id);
        if (target) onPlay(target);
      });
    });

    listEl.querySelectorAll('.delete-saved-game-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (e.currentTarget as HTMLElement).getAttribute('data-record-id');
        const target = records.find(r => r.id === id);
        if (target) onDelete(target);
      });
    });
  }
};
