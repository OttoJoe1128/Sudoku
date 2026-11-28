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

export const socialUI = {
  renderLeaderboard(
    players: (Player | SpeedRecord)[],
    type: 'level' | 'gold' | 'speed' | 'pvp_mmr' | 'bot_mmr' | 'discipline',
    onPlayerClick?: (playerData: Player | SpeedRecord) => void,
    filterVariant: SudokuVariant = 'classic'
  ) {
    const listEl = document.getElementById('leaderboard-list');
    const headerRight = document.getElementById('lb-header-right');

    if (headerRight) {
      if (type === 'level') headerRight.innerText = t('lb_tab_level');
      else if (type === 'gold') headerRight.innerText = t('lb_tab_gold');
      else if (type === 'pvp_mmr') headerRight.innerText = t('lb_tab_pvp');
      else if (type === 'bot_mmr') headerRight.innerText = t('lb_tab_bot');
      else if (type === 'discipline') headerRight.innerText = t('lb_tab_discipline');
      else headerRight.innerText = t('tab_fastest_time');
    }

    if (!listEl) return;
    if (players.length === 0) {
      if (type === 'speed') {
        listEl.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <svg class="w-12 h-12 text-[var(--text-secondary)] opacity-50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p class="text-xs font-bold text-[var(--text-primary)] mb-1">${t('lb_no_speed_title')}</p>
            <p class="text-[11px] text-[var(--text-secondary)]">${t('lb_no_speed_sub')}</p>
          </div>
        `;
      } else {
        listEl.innerHTML = `<div class="text-center text-[var(--text-secondary)] py-10 font-bold">${t('lb_no_records')}</div>`;
      }
      return;
    }

    listEl.innerHTML = players.map((p, i) => {
      let rightVal = '';
      let isSpeed = 'difficulty' in p;
      const playerObj = p as Player;

      const emblem = this.getVariantEmblemSVG(playerObj.dominantVariant || filterVariant, 18);

      if (type === 'level') {
        rightVal = `<span class="flex items-center gap-1">${emblem} ${t('label_level')} ${playerObj.level || 1}</span>`;
      } else if (type === 'gold') {
        rightVal = `<span class="flex items-center gap-1">${emblem} ${playerObj.gold || 0} ${t('label_gold')}</span>`;
      } else if (type === 'pvp_mmr') {
        rightVal = `${playerObj.duel_mmr || 1000} MMR`;
      } else if (type === 'bot_mmr') {
        rightVal = `${playerObj.bot_mmr || 1000} ${t('lb_tab_bot')}`;
      } else if (type === 'discipline') {
        const score = playerObj.variantScores ? playerObj.variantScores[filterVariant] || 0 : 0;
        rightVal = `<span class="flex items-center gap-1">${this.getVariantEmblemSVG(filterVariant, 18)} ${score} ${t('label_pts')}</span>`;
      } else if (isSpeed) {
        const speed = p as SpeedRecord;
        const localizedDiff = t('diff_' + speed.difficulty).toUpperCase();
        rightVal = `${speed.timeFormatted} (${localizedDiff})`;
      }

      const calculatedTitle = playerObj.title || UserManager.calculatePlayerTitle(playerObj.level || 1, playerObj.duel_wins || 0, playerObj.duel_mmr || 1000);

      let rankBadgeClass = "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]";
      let rowBorderClass = "border-[var(--border-subtle)] hover:border-[var(--border-strong)]";

      if (i === 0) {
        rankBadgeClass = "bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 ring-2 ring-amber-400/60 shadow-md";
        rowBorderClass = "border-amber-500/50";
      } else if (i === 1) {
        rankBadgeClass = "bg-gradient-to-b from-slate-200 to-slate-400 text-slate-950 ring-2 ring-slate-300/50";
        rowBorderClass = "border-slate-400/40";
      } else if (i === 2) {
        rankBadgeClass = "bg-gradient-to-b from-amber-600 to-amber-800 text-amber-50 ring-2 ring-amber-700/50";
        rowBorderClass = "border-amber-700/40";
      }

      const displayName = formatDisplayName(p.username, p.uid);

      return `
        <div data-lb-index="${i}" class="leaderboard-row-item flex justify-between items-center p-3 bg-[var(--bg-card)] border ${rowBorderClass} rounded-xl shadow-sm cursor-pointer active:scale-[0.98] transition-all gap-2 min-w-0">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <span class="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${rankBadgeClass}">${i + 1}</span>
            <div class="min-w-0 flex-1">
              <p class="font-bold text-[var(--text-primary)] text-sm leading-tight truncate">${escapeHTML(displayName)}</p>
              <p class="text-[9px] font-black text-[var(--accent-gold)] truncate">${renderRankBadgeSVG(calculatedTitle)}</p>
            </div>
          </div>
          <span class="font-black text-[var(--accent-gold)] text-xs shrink-0 whitespace-nowrap ml-2">${rightVal}</span>
        </div>
      `;
    }).join('');

    if (onPlayerClick) {
      listEl.querySelectorAll('.leaderboard-row-item').forEach(el => {
        el.addEventListener('click', (e) => {
          const index = parseInt((e.currentTarget as HTMLElement).getAttribute('data-lb-index') || '0');
          const targetPlayer = players[index];
          if (targetPlayer) onPlayerClick(targetPlayer);
        });
      });
    }
  },

  renderMatchProgress(userFilled: number, enemyFilled: number, enemyName: string, totalEmpty: number) {
    const barBox = document.getElementById('match-header-bar');
    const userBar = document.getElementById('match-user-bar');
    const enemyBar = document.getElementById('match-enemy-bar');
    const userNameEl = document.getElementById('match-user-name');
    const enemyNameEl = document.getElementById('match-enemy-name');

    if (barBox) {
      barBox.classList.remove('hidden');
      barBox.classList.add('flex');
    }

    const userPct = totalEmpty > 0 ? Math.round((userFilled / totalEmpty) * 100) : 0;
    const enemyPct = totalEmpty > 0 ? Math.round((enemyFilled / totalEmpty) * 100) : 0;

    if (userBar) userBar.style.width = `${userPct}%`;
    if (enemyBar) enemyBar.style.width = `${enemyPct}%`;
    if (userNameEl) userNameEl.innerText = `${t('label_you')} (%${userPct})`;
    if (enemyNameEl) enemyNameEl.innerText = `${enemyName} (%${enemyPct})`;
  },

  hideMatchHeader() {
    const barBox = document.getElementById('match-header-bar');
    if (barBox) {
      barBox.classList.add('hidden');
      barBox.classList.remove('flex');
    }
  },

  renderLobbyPlayers(
    players: Player[],
    onInviteClick: (player: Player) => void
  ) {
    const listEl = document.getElementById('lobby-players-list');
    if (!listEl) return;

    if (players.length === 0) {
      listEl.innerHTML = `
        <div class="flex flex-col items-center justify-center py-8 text-center">
          <svg class="w-8 h-8 text-[var(--text-secondary)] opacity-50 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <p class="text-xs font-bold text-[var(--text-primary)] mb-0.5" data-i18n="lobby_empty_title">${t('lobby_empty_title')}</p>
          <p class="text-[10px] text-[var(--text-secondary)]" data-i18n="lobby_empty_desc">${t('lobby_empty_desc')}</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = players.map(p => {
      const status = p.onlineStatus || 'available';
      let statusBadge = `<span class="text-[9px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 rounded-md">${t('status_available')}</span>`;
      let btnText = `${Icons.sword} ${t('btn_send_duel')}`;
      let btnClass = `bg-[var(--accent-gold)] text-[var(--text-on-gold)] hover:brightness-110`;
      let isDisabled = false;

      if (status === 'in_game') {
        statusBadge = `<span class="text-[9px] font-black text-amber-400 bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.5 rounded-md">${t('status_in_game')}</span>`;
        btnText = `${Icons.inbox} ${t('btn_send_invite')}`;
        btnClass = `bg-[var(--accent-cyan)] text-[var(--text-on-gold)] hover:brightness-110`;
      } else if (status === 'in_duel') {
        statusBadge = `<span class="text-[9px] font-black text-rose-400 bg-rose-950/60 border border-rose-500/40 px-1.5 py-0.5 rounded-md">${t('status_in_duel')}</span>`;
        btnText = t('btn_in_match');
        btnClass = `bg-[var(--bg-elevated)] text-[var(--text-secondary)] opacity-60 cursor-not-allowed`;
        isDisabled = true;
      }

      const calculatedTitle = UserManager.calculatePlayerTitle(p.level, p.duel_wins || 0, p.duel_mmr || 1000);

      return `
        <div class="p-2.5 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-2xl bg-[var(--bg-card)] shadow-sm flex items-center justify-between transition-all">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-lg shrink-0">
              ${renderAvatarSVG(p.avatar || 'av_prism', 24)}
            </div>
            <div class="text-left">
              <div class="flex items-center gap-1.5">
                <span class="font-black text-[var(--text-primary)] text-xs">${escapeHTML(p.username)}</span>
                <span class="text-[9px] font-black text-[var(--accent-gold)]">${renderRankBadgeSVG(calculatedTitle)}</span>
              </div>
              <div class="mt-0.5">${statusBadge}</div>
            </div>
          </div>
          <button data-player-uid="${p.uid || p.username}" class="lobby-invite-btn ${btnClass} font-black text-[11px] px-2.5 py-1.5 rounded-xl shadow-sm active:scale-95 transition-transform shrink-0 whitespace-nowrap ${isDisabled ? 'pointer-events-none' : ''}">
            ${btnText}
          </button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.lobby-invite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const uid = (e.currentTarget as HTMLElement).getAttribute('data-player-uid');
        const selected = players.find(p => (p.uid || p.username) === uid);
        if (selected) onInviteClick(selected);
      });
    });
  },

  renderBotCharacters(
    bots: BotCharacter[],
    onSelectBot: (bot: BotCharacter) => void
  ) {
    const listEl = document.getElementById('bot-characters-list');
    if (!listEl) return;

    const isEn = getLang() === 'en';

    listEl.innerHTML = bots.map(bot => {
      const desc = isEn && bot.descEn ? bot.descEn : bot.desc;
      return `
        <div class="p-3 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-2xl bg-[var(--bg-card)] shadow-sm flex items-center justify-between transition-all">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-xl shrink-0">
              ${renderAvatarSVG(bot.avatar || 'av_prism', 26)}
            </div>
            <div class="text-left">
              <div class="flex items-center gap-1.5">
                <span class="font-black text-[var(--text-primary)] text-xs">${bot.name}</span>
                <span class="bg-[var(--accent-gold)] text-[var(--text-on-gold)] text-[9px] font-black px-1.5 py-0.5 rounded-md">${t('label_level')} ${bot.level}</span>
              </div>
              <p class="text-[10px] text-[var(--text-secondary)] font-medium line-clamp-1">${desc}</p>
            </div>
          </div>
          <button data-bot-id="${bot.id}" class="select-bot-btn bg-[var(--accent-gold)] text-[var(--text-on-gold)] hover:brightness-110 font-black text-xs px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-transform shrink-0 whitespace-nowrap flex items-center gap-1">
            <span>${Icons.sword}</span>
            <span>${t('btn_play')}</span>
          </button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.select-bot-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-bot-id');
        const selected = bots.find(b => b.id === id);
        if (selected) onSelectBot(selected);
      });
    });
  },

  renderBotFallbackPromptModal(onAccept: () => void, onCancel: () => void) {
    const existing = document.getElementById('bot-prompt-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'bot-prompt-modal';
    modal.className = "fixed inset-0 bg-slate-900/80 z-[95] flex items-center justify-center p-4 backdrop-blur-md";

    modal.innerHTML = `
      <div class="bg-[var(--bg-card)] rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative border border-[var(--border-strong)]">
        <div class="w-16 h-16 bg-[var(--bg-elevated)] text-[var(--accent-gold)] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 border border-[var(--border-subtle)] shadow-inner">
          🤖
        </div>
        <h3 class="text-xl font-black text-[var(--text-primary)] mb-2">${t('bot_prompt_title')}</h3>
        <p class="text-xs text-[var(--text-secondary)] font-medium mb-5 leading-relaxed">
          ${t('bot_prompt_desc')}
        </p>
        <div class="flex flex-col gap-2.5 w-full">
          <button id="btn-accept-bot-prompt" class="w-full bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs tracking-wide hover:brightness-110">
            ${t('btn_accept_bot_prompt')}
          </button>
          <button id="btn-cancel-bot-prompt" class="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-bold py-3 rounded-2xl active:scale-95 transition-all text-xs hover:bg-[var(--bg-card-hover)]">
            ${t('btn_cancel_bot_prompt')}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btn-accept-bot-prompt')?.addEventListener('click', () => {
      modal.remove();
      onAccept();
    });

    document.getElementById('btn-cancel-bot-prompt')?.addEventListener('click', () => {
      modal.remove();
      onCancel();
    });
  },

  renderChallengeDurationSelectModal(targetUsername: string, onSelectDuration: (durationSec: number) => void) {
    const existing = document.getElementById('challenge-duration-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'challenge-duration-modal';
    modal.className = "fixed inset-0 bg-slate-900/80 z-[95] flex items-center justify-center p-4 backdrop-blur-md";

    modal.innerHTML = `
      <div class="bg-[var(--bg-card)] rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative border border-[var(--border-strong)]">
        <button id="close-duration-modal" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 text-sm">✕</button>
        <div class="w-14 h-14 bg-[var(--bg-elevated)] text-[var(--accent-gold)] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner border border-[var(--border-subtle)]">
          ⚔️
        </div>
        <h3 class="text-xl font-black text-[var(--text-primary)] mb-1">${t('challenge_modal_title')}</h3>
        <p class="text-xs text-[var(--text-secondary)] font-medium mb-4">
          ${t('challenge_modal_desc', { username: escapeHTML(targetUsername) })}
        </p>

        <div class="flex flex-col gap-2.5 w-full mb-1">
          <button data-sec="180" class="select-duration-btn w-full bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-sm active:scale-95 transition-transform text-xs flex justify-between items-center px-4 hover:brightness-110">
            <span>⚡ ${t('time_3m_short')}</span>
            <span class="bg-[var(--bg-app)]/30 text-[var(--text-on-gold)] px-2 py-0.5 rounded-lg text-[10px] font-bold">${t('tag_fast')}</span>
          </button>
          <button data-sec="420" class="select-duration-btn w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-bold py-3 rounded-2xl active:scale-95 transition-transform text-xs flex justify-between items-center px-4 hover:bg-[var(--bg-card-hover)]">
            <span>⏱️ ${t('time_7m_short')}</span>
            <span class="bg-[var(--bg-card)] text-[var(--accent-gold)] px-2 py-0.5 rounded-lg text-[10px] font-bold">${t('tag_balanced')}</span>
          </button>
          <button data-sec="0" class="select-duration-btn w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-bold py-3 rounded-2xl active:scale-95 transition-transform text-xs flex justify-between items-center px-4 hover:bg-[var(--bg-card-hover)]">
            <span>♾️ ${t('time_unlimited')}</span>
            <span class="bg-[var(--bg-card)] text-[var(--accent-cyan)] px-2 py-0.5 rounded-lg text-[10px] font-bold">${t('tag_free')}</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('close-duration-modal')?.addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelectorAll('.select-duration-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sec = parseInt((e.currentTarget as HTMLElement).getAttribute('data-sec') || '180');
        modal.remove();
        onSelectDuration(sec);
      });
    });
  },

  renderInbox(
    challenges: ChallengeRequest[],
    onAccept: (c: ChallengeRequest) => void,
    onDecline: (c: ChallengeRequest) => void
  ) {
    const listEl = document.getElementById('inbox-list');
    if (!listEl) return;

    this.updateInboxBadge(challenges.length);

    if (challenges.length === 0) {
      listEl.innerHTML = `
        <div class="flex flex-col items-center justify-center py-10 text-center">
          <svg class="w-10 h-10 text-[var(--text-secondary)] opacity-50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          <p class="text-xs font-bold text-[var(--text-primary)] mb-0.5">${t('inbox_empty')}</p>
          <p class="text-[10px] text-[var(--text-secondary)]">${t('inbox_empty_desc')}</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = challenges.map(c => `
      <div class="p-3 border border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-card)] shadow-sm flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-base text-[var(--accent-gold)]">${Icons.sword}</span>
            <div class="text-left">
              <p class="font-black text-[var(--text-primary)] text-xs">${escapeHTML(c.fromUsername)}</p>
              <p class="text-[10px] text-[var(--accent-gold)] font-bold uppercase tracking-wider">${t('diff_' + c.difficulty).toUpperCase()} DÜELLO</p>
            </div>
          </div>
          <span class="text-[10px] font-mono text-[var(--text-secondary)]">Bekliyor</span>
        </div>
        <div class="flex gap-2 mt-1">
          <button data-chal-id="${c.challengeId}" class="inbox-accept-btn flex-1 bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black py-2 rounded-xl text-xs active:scale-95 transition-transform shadow-sm hover:brightness-110 flex items-center justify-center gap-1.5">
            <span>${Icons.sword}</span>
            <span>${t('btn_accept_play')}</span>
          </button>
          <button data-chal-id="${c.challengeId}" class="inbox-decline-btn bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold px-3 py-2 rounded-xl text-xs active:scale-95 transition-transform">
            ✕ ${t('btn_decline')}
          </button>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('.inbox-accept-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-chal-id');
        const target = challenges.find(c => c.challengeId === id);
        if (target) onAccept(target);
      });
    });

    listEl.querySelectorAll('.inbox-decline-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-chal-id');
        const target = challenges.find(c => c.challengeId === id);
        if (target) onDecline(target);
      });
    });
  },

  renderIncomingChallengePopup(challenge: ChallengeRequest, onAccept: () => void, onDecline: () => void) {
    const existing = document.getElementById('challenge-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'challenge-popup';
    popup.className = "fixed bottom-5 right-5 z-[95] bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-indigo-500/50 flex flex-col gap-2 w-72 animate-bounce";

    popup.innerHTML = `
      <div class="flex justify-between items-center">
        <span class="text-xs font-black text-amber-400 uppercase tracking-wider">⚔️ Canlı Düello İsteği!</span>
        <span id="challenge-popup-timer" class="text-xs font-mono font-bold bg-slate-800 px-2 py-0.5 rounded-lg text-rose-400">15s</span>
      </div>
      <p class="text-xs font-medium text-slate-200"><span class="font-black text-white">${escapeHTML(challenge.fromUsername)}</span> seni <strong>${challenge.difficulty.toUpperCase()}</strong> düelloya davet ediyor!</p>
      <div class="flex gap-2 mt-1">
        <button id="btn-accept-challenge" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-xl text-xs active:scale-95 transition-transform">Kabul Et</button>
        <button id="btn-decline-challenge" class="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 rounded-xl text-xs active:scale-95 transition-transform">Reddet</button>
      </div>
    `;

    document.body.appendChild(popup);

    let timeLeft = 15;
    const timer = setInterval(() => {
      timeLeft--;
      const timerEl = document.getElementById('challenge-popup-timer');
      if (timerEl) timerEl.innerText = `${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        popup.remove();
        onDecline();
      }
    }, 1000);

    document.getElementById('btn-accept-challenge')?.addEventListener('click', () => {
      clearInterval(timer);
      popup.remove();
      onAccept();
    });

    document.getElementById('btn-decline-challenge')?.addEventListener('click', () => {
      clearInterval(timer);
      popup.remove();
      onDecline();
    });
  }
};
