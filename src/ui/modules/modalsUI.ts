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

export const modalsUI = {
  toggleModal(id: string, show: boolean) {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('hidden', !show);
    el.classList.toggle('flex', show);
  },

  renderProfileModal(stats: ProfileStats, badges: BadgeStatus[], isOwnProfile: boolean = true) {
    const nameEl = document.getElementById('profile-username');
    const editNameBtn = document.getElementById('btn-profile-edit-name');
    const levelEl = document.getElementById('profile-level-badge');
    const goldEl = document.getElementById('profile-gold-badge');
    const avatarEl = document.getElementById('profile-avatar-display');
    const titleEl = document.getElementById('profile-player-title');
    const completedEl = document.getElementById('profile-stat-completed');
    const duelEl = document.getElementById('profile-stat-duel');
    const basitEl = document.getElementById('profile-best-basit');
    const ortaEl = document.getElementById('profile-best-orta');
    const zorEl = document.getElementById('profile-best-zor');
    const badgesCountEl = document.getElementById('profile-badges-count');
    const badgesPreviewEl = document.getElementById('profile-badges-preview');
    const ownControls = document.getElementById('profile-own-controls');
    const otherControls = document.getElementById('profile-other-controls');
    const notifyToggle = document.getElementById('toggle-notifications') as HTMLInputElement;

    const pvpMmrEl = document.getElementById('profile-stat-pvp-mmr');
    const botMmrEl = document.getElementById('profile-stat-bot-mmr');

    if (nameEl) nameEl.innerText = stats.username;
    if (editNameBtn) {
      if (isOwnProfile) editNameBtn.classList.remove('hidden');
      else editNameBtn.classList.add('hidden');
    }
    if (levelEl) levelEl.innerText = `${t('label_level')} ${stats.level}`;
    if (goldEl) goldEl.innerText = `${stats.gold} ${t('label_gold')}`;
    if (avatarEl) avatarEl.innerHTML = renderAvatarSVG(stats.avatar || 'av_prism', 36);
    if (titleEl) titleEl.innerHTML = renderRankBadgeSVG(translateRankName(stats.title || 'Çırak'));
    if (completedEl) completedEl.innerText = stats.totalCompleted.toString();
    if (duelEl) duelEl.innerText = t('duel_wl', { w: stats.duelWins, l: stats.duelLosses });
    if (pvpMmrEl) pvpMmrEl.innerText = `${stats.duelMmr} MMR`;
    if (botMmrEl) botMmrEl.innerText = `${stats.botMmr || 1000} ${t('lb_tab_bot')}`;
    if (basitEl) basitEl.innerText = stats.bestBasitFormatted;
    if (ortaEl) ortaEl.innerText = stats.bestOrtaFormatted;
    if (zorEl) zorEl.innerText = stats.bestZorFormatted;

    if (ownControls && otherControls) {
      if (isOwnProfile) {
        ownControls.classList.remove('hidden');
        otherControls.classList.add('hidden');
        if (notifyToggle) notifyToggle.checked = stats.notificationsEnabled;

        const avatarSelector = document.getElementById('profile-avatar-selector');
        if (avatarSelector) {
          const isEn = getLang() === 'en';
          avatarSelector.innerHTML = AVATAR_LIST.slice(0, 8).map(a => {
            const name = isEn && a.nameEn ? a.nameEn : a.name;
            return `
              <button data-avatar="${a.key}" class="avatar-option-btn p-2 rounded-xl border flex flex-col items-center justify-center active:scale-90 transition-transform ${a.key === stats.avatar ? 'bg-[var(--accent-gold)] text-[var(--text-on-gold)] border-[var(--accent-gold)] shadow-md ring-2 ring-[var(--accent-gold-bright)]' : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)]'}">
                ${renderAvatarSVG(a.key, 32)}
                <span class="text-[8px] font-black mt-1 line-clamp-1">${name}</span>
              </button>
            `;
          }).join('');
        }
      } else {
        ownControls.classList.add('hidden');
        otherControls.classList.remove('hidden');
      }
    }

    const badgesSection = document.getElementById('profile-badges-section');
    if (badgesSection) {
      if (isOwnProfile) {
        badgesSection.classList.remove('hidden');
      } else {
        badgesSection.classList.add('hidden');
      }
    }

    const accountSection = document.getElementById('profile-account-section');
    if (accountSection) {
      if (isOwnProfile) {
        accountSection.classList.remove('hidden');
      } else {
        accountSection.classList.add('hidden');
      }
    }

    const openAchievementsBtn = document.getElementById('btn-profile-open-achievements');
    if (openAchievementsBtn) {
      if (isOwnProfile) {
        openAchievementsBtn.classList.remove('hidden');
      } else {
        openAchievementsBtn.classList.add('hidden');
      }
    }

    const unlockedBadges = badges.filter(b => b.isUnlocked);
    if (badgesCountEl) badgesCountEl.innerText = `${unlockedBadges.length} / ${badges.length} ${t('menu_badges')}`;

    if (badgesPreviewEl) {
      if (unlockedBadges.length === 0) {
        badgesPreviewEl.innerHTML = `<p class="text-xs text-[var(--text-secondary)] font-medium py-1">${t('no_badges_yet')}</p>`;
      } else {
        const isEn = getLang() === 'en';
        badgesPreviewEl.innerHTML = unlockedBadges.slice(0, 4).map(b => {
          const title = isEn && b.titleEn ? b.titleEn : b.title;
          const svgIcon = Icons[b.icon as keyof typeof Icons] || Icons.target;
          return `
            <div class="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-xl shrink-0 text-[var(--accent-gold)]">
              <span>${svgIcon}</span>
              <span class="text-[11px] font-bold text-[var(--text-primary)]">${title}</span>
            </div>
          `;
        }).join('');
      }
    }
  },

  renderAvatarGallery(currentAvatar: string, onSelect: (avatarKey: string) => void) {
    const gridEl = document.getElementById('avatar-gallery-grid');
    if (!gridEl) return;

    const isEn = getLang() === 'en';

    gridEl.innerHTML = AVATAR_LIST.map(a => {
      const isSelected = a.key === currentAvatar;
      const name = isEn && a.nameEn ? a.nameEn : a.name;

      const activeClass = isSelected
        ? 'bg-[var(--bg-card)] border-2 border-[var(--accent-gold)] ring-2 ring-[var(--accent-gold-bright)] shadow-lg'
        : 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)]';

      return `
        <button data-avatar="${a.key}" class="avatar-gallery-item p-3 rounded-2xl ${activeClass} flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform text-center group">
          <div class="mb-1.5">${renderAvatarSVG(a.key, 48)}</div>
          <span class="text-[10px] font-black text-[var(--text-primary)] leading-tight line-clamp-1">${name}</span>
        </button>
      `;
    }).join('');

    gridEl.querySelectorAll('.avatar-gallery-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute('data-avatar');
        if (key) onSelect(key);
      });
    });
  },

  showRulesAndScoringModal(mode: 'arena' | 'custom') {
    const existing = document.getElementById('rules-scoring-modal');
    if (existing) existing.remove();

    const isArena = mode === 'arena';
    const title = isArena ? t('rules_scoring_title_arena') : t('rules_scoring_title_custom');

    const contentHTML = isArena ? `
      <div class="text-left text-xs space-y-3 font-medium text-[var(--text-secondary)] leading-relaxed">
        <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3">
          <p class="font-black text-[var(--accent-gold)] text-sm mb-1">${t('gold_rewards')}</p>
          <p>• <span class="w-2 h-2 rounded-full inline-block bg-emerald-500 mr-1"></span>${t('diff_basit')}: <strong class="text-[var(--text-primary)]">+50 ${t('label_gold')}</strong></p>
          <p>• <span class="w-2 h-2 rounded-full inline-block bg-amber-500 mr-1"></span>${t('diff_orta')}: <strong class="text-[var(--text-primary)]">+100 ${t('label_gold')}</strong></p>
          <p>• <span class="w-2 h-2 rounded-full inline-block bg-rose-500 mr-1"></span>${t('diff_zor')}: <strong class="text-[var(--text-primary)]">+200 ${t('label_gold')}</strong></p>
        </div>

        <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3">
          <p class="font-black text-[var(--accent-gold)] text-sm mb-1">${t('mmr_rank_pts')}</p>
          <p>• PvP: <strong class="text-[var(--accent-cyan)]">+25 MMR</strong> (Flawless: <strong class="text-[var(--accent-cyan)]">+30 MMR</strong>)</p>
          <p>• Bot: <strong class="text-[var(--accent-cyan)]">+15 ${t('lb_tab_bot')} MMR</strong></p>
        </div>

        <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3">
          <p class="font-black text-[var(--accent-gold)] text-sm mb-1">${t('discipline_mults')}</p>
          <p>• ${t('var_classic')}: <strong>1.0x</strong> | ${t('var_wordoku')}: <strong>1.2x</strong> | ${t('var_irregular')}: <strong>1.5x</strong></p>
          <p>• ${t('var_killer')}: <strong>1.8x</strong> | ${t('var_samurai')}: <strong>2.5x</strong></p>
        </div>

        <div class="bg-[var(--bg-elevated)] border border-rose-500/40 rounded-2xl p-3">
          <p class="font-black text-rose-400 text-sm mb-1">${t('forfeit_rule_title')}</p>
          <p>• <strong class="text-rose-300">-50 ${t('label_gold')} & -30 MMR</strong></p>
        </div>
      </div>
    ` : `
      <div class="text-left text-xs space-y-3 font-medium text-[var(--text-secondary)] leading-relaxed">
        <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3">
          <p class="font-black text-[var(--accent-gold)] text-sm mb-1">${t('custom_mode_purpose')}</p>
          <p>${t('custom_mode_purpose_desc')}</p>
        </div>

        <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3">
          <p class="font-black text-[var(--accent-gold)] text-sm mb-1">${t('gold_and_blitz')}</p>
          <p>• <span class="w-2 h-2 rounded-full inline-block bg-emerald-500 mr-1"></span>${t('diff_basit')}: +10 ${t('label_gold')} | <span class="w-2 h-2 rounded-full inline-block bg-amber-500 mr-1"></span>${t('diff_orta')}: +20 ${t('label_gold')} | <span class="w-2 h-2 rounded-full inline-block bg-rose-500 mr-1"></span>${t('diff_zor')}: +35 ${t('label_gold')}</p>
          <p>• <span class="mr-1">${Icons.zap}</span>${t('time_3m')} Blitz: <strong class="text-[var(--accent-cyan)]">+%50 ${t('label_gold')}</strong></p>
        </div>

        <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3">
          <p class="font-black text-[var(--accent-gold)] text-sm mb-1">${t('mastery_and_rp')}</p>
          <p>• ${t('mastery_and_rp_desc')}</p>
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'rules-scoring-modal';
    modal.className = "fixed inset-0 bg-slate-900/80 z-[96] flex items-center justify-center p-4 backdrop-blur-md";

    modal.innerHTML = `
      <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative border border-[var(--border-strong)] max-h-[85vh] flex flex-col">
        <button id="close-rules-scoring-modal" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 text-sm">✕</button>
        <h3 class="text-lg font-black text-[var(--accent-gold)] mb-3 text-left border-b border-[var(--border-subtle)] pb-2.5 shrink-0 flex items-center gap-1.5">
          ${title}
        </h3>
        <div class="flex-1 overflow-y-auto hidden-scrollbar pr-0.5">
          ${contentHTML}
        </div>
        <button id="btn-confirm-rules-modal" class="w-full bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-md active:scale-95 transition-transform text-xs mt-3 shrink-0 hover:brightness-110">
          ${t('btn_got_it')}
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('close-rules-scoring-modal')?.addEventListener('click', () => modal.remove());
    document.getElementById('btn-confirm-rules-modal')?.addEventListener('click', () => modal.remove());
  },

  showVariantSymbolInfo(variant: SudokuVariant) {
    const infoMap: Record<SudokuVariant, { title: string; desc: string; mult: string }> = {
      classic: {
        title: "Klasik Sudoku (3x3 Blok)",
        desc: "Her satır, sütun ve 3x3 kutuda 1-9 arası rakamlar tekrarlanmadan yerleşir.",
        mult: "1.0x Puan Çarpanı"
      },
      irregular: {
        title: "Parçalı (Jigsaw) Sudoku",
        desc: "3x3 kareler yerine asimetrik düzensiz yapboz bölgeleri bulunur. Her bölgede 1-9 tek bir kez yer alır.",
        mult: "1.5x Puan Çarpanı"
      },
      killer: {
        title: "Hesap (Killer) Sudoku",
        desc: "Kafes köşesindeki hedef toplamı veren kombinasyonlar bulunur. Aynı kafeste rakam tekrar etmez.",
        mult: "1.8x Puan Çarpanı"
      },
      wordoku: {
        title: "Harfli (Wordoku) Sudoku",
        desc: "Rakamlar yerine 'A-B-C-D-E-F-G-H-I' harfleri kullanılır. Harf matrisleri çözülür.",
        mult: "1.2x Puan Çarpanı"
      },
      samurai: {
        title: "Samurai (5-Grid) Sudoku",
        desc: "5 adet birbiriyle kenetlenmiş 9x9 matris aynı anda çözülür. Kesişen köşeler ortak kullanılır.",
        mult: "2.5x Puan Çarpanı"
      }
    };

    const info = infoMap[variant] || infoMap.classic;
    this.showToast(`💠 ${info.title}\n${info.desc} (${info.mult})`, "info");
  }
};
