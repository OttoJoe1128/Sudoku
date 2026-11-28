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
import { modalsUI } from './modalsUI';

export const coreUI = {
  mountUI() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div id="container" class="w-full max-w-[480px] h-[100dvh] bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col relative overflow-hidden transition-colors duration-300 font-sans">
        <!-- Sabit Global Üst Kontrol Çubuğu (Tüm Ekranlarda Görünür) -->
        <div id="global-utility-bar" class="w-full bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 py-1.5 flex justify-between items-center z-50 shrink-0 min-h-10 box-border" style="padding-top: max(env(safe-area-inset-top, 0px), 0.375rem);">
            <div class="flex items-center gap-2">
                <!-- Ses Aç / Kapa Düğmesi -->
                <button id="btn-sound-toggle" title="Ses Aç / Kapa" data-i18n-title="tooltip_sound_toggle" class="bg-[var(--bg-elevated)] text-[var(--accent-gold)] px-2.5 py-1 rounded-xl active:scale-95 transition-transform border border-[var(--border-subtle)] flex items-center justify-center text-xs">
                    ${Icons.volumeOn}
                </button>
                <!-- İnteraktif Rehber (?) Düğmesi -->
                <button id="btn-open-help" title="Nasıl Oynanır?" data-i18n-title="tooltip_how_to_play" class="bg-[var(--bg-elevated)] text-[var(--accent-gold)] px-2.5 py-1 rounded-xl active:scale-95 transition-transform border border-[var(--border-subtle)] flex items-center justify-center text-xs font-black">
                    ?
                </button>
            </div>
            <div class="flex items-center gap-2">
                <!-- Dil Seçici (TR | EN) -->
                <button id="btn-lang-toggle" title="Dil / Language" data-i18n-title="tooltip_lang_toggle" class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] px-2 py-1 rounded-xl text-[10px] font-mono font-black tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all">
                    <span id="lang-opt-tr" class="text-[var(--accent-gold)]">TR</span>
                    <span class="text-[var(--text-secondary)] opacity-50">|</span>
                    <span id="lang-opt-en" class="text-[var(--text-secondary)]">EN</span>
                </button>
                <!-- Tema Seçici (Gündüz | Gece) -->
                <button id="btn-theme-toggle" title="Gündüz / Gece Teması" data-i18n-title="tooltip_theme_toggle" class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] px-2.5 py-1 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all text-xs">
                    <span id="theme-opt-day" class="text-[var(--accent-gold)] flex items-center">${Icons.sun}</span>
                    <span class="text-[var(--text-secondary)] opacity-40 text-[9px]">|</span>
                    <span id="theme-opt-night" class="text-[var(--text-secondary)] opacity-50 flex items-center">${Icons.moon}</span>
                </button>
            </div>
        </div>
        ${getAmbientBackgroundHTML()}
        ${menuTemplate}
        ${mapTemplate}
        ${customModeTemplate}
        ${leaderboardTemplate}
        ${shopTemplate}
        ${achievementsTemplate}
        ${placementModalTemplate}
        ${profileModalTemplate}
        ${matchModalTemplate}
        ${inboxModalTemplate}
        ${savedGamesModalTemplate}
        ${usernameModalTemplate}
        ${secondChanceModalTemplate}
        ${onboardingModalTemplate}
        ${academyModalTemplate}
        ${abilitiesModalTemplate}
        ${levelPrepModalTemplate}
        ${crystalRepairModalTemplate}
        ${authModalTemplate}
        ${streakModalTemplate}
        ${abilityDetailModalTemplate}
        ${postcardModalTemplate}
        ${clanModalTemplate}
        ${leagueModalTemplate}


        <div id="game-view" class="hidden flex-col items-center p-3 sm:p-5 w-full h-full relative z-10 justify-between overflow-hidden" style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 1.5rem);">
            <!-- Düello Canlı İlerleme Çubuğu -->
            <div id="match-header-bar" class="hidden w-full bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-strong)] p-3 rounded-2xl mb-3 shadow-lg flex-col gap-2">
                <div class="flex justify-between items-center text-xs font-black">
                    <span id="match-user-name">You (%0)</span>
                    <span class="text-[var(--accent-gold)] font-extrabold text-sm">VS</span>
                    <span id="match-enemy-name">Rival (%0)</span>
                </div>
                <div class="w-full bg-[var(--bg-elevated)] h-2.5 rounded-full overflow-hidden flex border border-[var(--border-subtle)]">
                    <div id="match-user-bar" class="bg-[var(--accent-cyan)] h-full transition-all duration-300" style="width: 0%"></div>
                    <div id="match-enemy-bar" class="bg-rose-500 h-full transition-all duration-300" style="width: 0%"></div>
                </div>
            </div>

            <div class="w-full flex flex-nowrap justify-between items-center gap-1 sm:gap-2 mb-3 min-w-0">
                <button id="btn-back-menu" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl font-bold text-[11px] sm:text-xs text-[var(--text-primary)] transition-colors flex items-center gap-1 whitespace-nowrap shrink-0">
                    <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    <span data-i18n="btn_menu">Menü</span>
                </button>
                <div class="bg-[var(--bg-card)] text-[var(--accent-gold)] px-2 sm:px-3 py-0.5 sm:py-1 rounded-xl font-black text-[11px] sm:text-xs border border-[var(--border-strong)] shadow-sm flex items-center gap-1 whitespace-nowrap shrink-0">
                    ${Icons.coin}
                    <span id="game-gold" class="font-mono font-black text-[var(--text-primary)]">100</span>
                </div>
                <div id="game-errors" class="text-rose-400 font-bold text-[11px] sm:text-sm whitespace-nowrap shrink-0">Errors: 0/3</div>
                <div id="game-timer" class="font-mono font-bold text-xs sm:text-lg text-[var(--text-primary)] whitespace-nowrap shrink-0">00:00</div>
            </div>

            <!-- Disiplin Vektör Amblem Rozeti -->
            <div id="game-variant-badge-box" class="w-full mb-2 flex justify-between items-center bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-black text-[var(--text-primary)]">
                <span id="game-variant-title" class="flex items-center gap-1.5" data-i18n="var_classic_full">Classic Sudoku</span>
                <span id="game-variant-multiplier" class="text-[10px] font-extrabold text-[var(--accent-gold)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded-md border border-[var(--border-strong)]">1.0x Pts</span>
            </div>

            <!-- Tahta İçi Mekanik & Yetenek Çubuğu -->
            <div id="game-mechanics-bar" class="hidden w-full mb-2 justify-between items-center bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-strong)] text-xs font-black text-[var(--text-primary)] shadow-sm">
                <div class="flex items-center gap-1.5 sm:gap-2">
                    <span id="game-energy-pill" class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-lg text-[10px] font-black text-[var(--accent-gold)] flex items-center gap-1 shadow-inner cursor-pointer"></span>
                    <span id="game-relic-pill" class="hidden bg-[var(--bg-elevated)] border border-amber-400/40 px-1.5 py-0.5 rounded-lg text-[10px] font-black text-amber-300 flex items-center gap-1 shadow-inner cursor-pointer hover:brightness-110 active:scale-95 transition-all"></span>
                    <span id="game-crystal-counter" class="text-[10px] font-mono font-black text-[var(--accent-cyan)] flex items-center gap-0.5"></span>
                    <span id="game-momentum-pill" class="hidden bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black animate-pulse"></span>
                </div>
                <div id="game-equipped-abilities" class="flex items-center gap-1.5"></div>
            </div>
            <div id="game-info-popover" class="hidden w-full bg-[var(--bg-card)] border border-[var(--accent-gold)]/50 rounded-xl px-3 py-1.5 mb-2 text-[11px] text-left text-[var(--text-primary)] font-medium leading-snug shadow-sm"></div>

            <!-- Akıllı İpucu Şeridi (İnteraktif Adım Adım Çözücü) -->
            <div id="smart-hint-banner" class="hidden w-full max-w-[380px] bg-[var(--bg-card)] border-2 border-[var(--accent-gold)] text-[var(--text-primary)] rounded-2xl p-3 shadow-xl flex-col gap-1.5 mb-2 relative transition-all z-20">
                <button id="btn-dismiss-smart-hint" class="absolute top-2 right-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold p-1 cursor-pointer">✕</button>
                <div class="flex items-center justify-between pr-6">
                    <div class="flex items-center gap-1.5 text-xs font-black text-[var(--accent-gold)]">
                        <span>💡</span>
                        <span id="smart-hint-tech" data-i18n="hint_banner_title">Akademi İpucu</span>
                    </div>
                    <span id="smart-hint-step-badge" class="hidden text-[9px] font-mono font-bold bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] px-2 py-0.5 rounded-full border border-[var(--accent-gold)]/40"></span>
                </div>
                <p id="smart-hint-text" class="text-xs text-[var(--text-primary)] font-medium leading-relaxed text-left pr-4"></p>
                <div id="smart-hint-actions" class="flex gap-2 w-full mt-1">
                    <button id="btn-step-smart-hint" class="hidden flex-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-strong)] font-black py-2 rounded-xl text-xs shadow active:scale-95 transition-all cursor-pointer">
                        <span id="btn-step-smart-hint-label" data-i18n="hint_btn_next_step">Adımı İncele ➔</span>
                    </button>
                    <button id="btn-apply-smart-hint" class="flex-1 bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-2 rounded-xl text-xs shadow active:scale-95 transition-all cursor-pointer">
                        <span data-i18n="hint_btn_apply">Yerleştir (-10 🪙)</span>
                    </button>
                </div>
            </div>

            <!-- Samurai 5-Grid Mini-Radar Seçici Bar -->
            <div id="samurai-radar-bar" class="hidden w-full grid-cols-5 gap-1 mb-2"></div>

            <!-- Sudoku Grid -->
            <div id="sudoku-grid" class="grid grid-cols-9 grid-rows-9 gap-0 bg-[var(--board-bg)] p-[2px] rounded-2xl shadow-2xl mb-3 border-2 border-[var(--border-strong)] relative overflow-hidden w-full max-w-[380px] aspect-square"></div>

            <!-- Samurai 21x21 Uzay Boşluğu Viewport -->
            <div id="samurai-viewport" class="hidden w-full flex-1 min-h-[320px] max-h-[430px] rounded-2xl bg-[var(--board-bg)] border-2 border-[var(--border-strong)] shadow-2xl mb-3 relative overflow-hidden"></div>

            <!-- Oyun Kontrol Araç Çubuğu -->
            <div class="flex gap-1.5 sm:gap-2 mb-3 w-full max-w-[380px] justify-center min-w-0">
                <button id="btn-hint" class="flex-1 bg-[var(--accent-gold)] text-[var(--text-on-gold)] hover:brightness-110 py-2.5 px-2 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1 min-w-0">
                    ${Icons.hint}
                    <span data-i18n="btn_hint" class="truncate">İpucu (10)</span>
                </button>
                <button id="btn-toggle-notes" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] py-2.5 px-2 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1 shrink-0">
                    ${Icons.pen}
                    <span id="notes-status-text" data-i18n="btn_notes_off">Not: Kapalı</span>
                </button>
                <button id="btn-erase" class="bg-rose-950/60 border border-rose-500/40 text-rose-300 py-2.5 px-2 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1 shrink-0">
                    ${Icons.trash}
                    <span data-i18n="btn_erase">Sil</span>
                </button>
                <button id="btn-undo" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] py-2.5 px-2 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1 shrink-0" title="Geri Al" data-i18n-title="btn_undo">
                    <svg class="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 10h10a5 5 0 015 5v2M3 10l6-6M3 10l6 6"></path></svg>
                    <span data-i18n="btn_undo">Geri Al</span>
                </button>
            </div>

            <!-- Ergonomik Model 1 Numpad (Çift Sıralı: 5 + 4) -->
            <div id="numpad-grid" class="flex flex-col gap-1.5 w-full max-w-[380px]">
                <div id="numpad-row-1" class="grid grid-cols-5 gap-1.5 sm:gap-2 w-full"></div>
                <div id="numpad-row-2" class="grid grid-cols-4 gap-1.5 sm:gap-2 w-[82%] sm:w-[84%] mx-auto"></div>
            </div>
        </div>
      </div>
    `;

    this.applyTheme(ShopManager.getActiveTheme());

    // Yandan Açılır Çekmece Menü ve Navigasyon Olayları
    const drawerMenu = document.getElementById('slide-drawer-menu');
    const drawerOverlay = document.getElementById('drawer-overlay');

    const openDrawer = () => {
      if (drawerMenu && drawerOverlay) {
        drawerMenu.classList.remove('hidden');
        drawerOverlay.classList.remove('hidden');
        void drawerMenu.offsetWidth;
        drawerMenu.classList.remove('-translate-x-full');
        drawerOverlay.classList.remove('opacity-0');
      }
    };

    const closeDrawer = () => {
      if (drawerMenu && drawerOverlay) {
        drawerMenu.classList.add('-translate-x-full');
        drawerOverlay.classList.add('opacity-0');
        setTimeout(() => {
          drawerMenu.classList.add('hidden');
          drawerOverlay.classList.add('hidden');
        }, 300);
      }
    };

    document.getElementById('btn-open-drawer')?.addEventListener('click', openDrawer);
    document.getElementById('btn-close-drawer')?.addEventListener('click', closeDrawer);
    drawerOverlay?.addEventListener('click', closeDrawer);

    // Çekmece İçi Modallara Yönlendirmeler
    const setupDrawerNav = (btnId: string, modalId: string) => {
      document.getElementById(btnId)?.addEventListener('click', () => {
        closeDrawer();
        setTimeout(() => modalsUI.toggleModal(modalId, true), 200);
      });
    };

    setupDrawerNav('btn-leaderboard', 'view-leaderboard');
    setupDrawerNav('btn-achievements', 'view-achievements');
    setupDrawerNav('btn-shop', 'view-shop');
    setupDrawerNav('btn-menu-open-academy', 'academy-modal');
    setupDrawerNav('btn-menu-open-abilities', 'abilities-modal');

    document.getElementById('btn-new-game')?.addEventListener('click', () => this.navigate('custom'));
    document.getElementById('btn-open-map')?.addEventListener('click', () => this.navigate('map'));
  },

  navigate(viewId: 'menu' | 'map' | 'custom' | 'game') {
    SoundManager.setInGame(viewId === 'game');
    const views = {
      menu: document.getElementById('view-menu'),
      map: document.getElementById('view-map'),
      custom: document.getElementById('view-custom'),
      game: document.getElementById('game-view')
    };
    Object.entries(views).forEach(([id, el]) => {
      if (!el) return;
      el.classList.toggle('hidden', id !== viewId);
      el.classList.toggle('flex', id === viewId);
    });

    if (viewId === 'menu' || viewId === 'map' || viewId === 'custom') {
      UserManager.setPresence('available');
    }
  },

  applyTheme(themeId: string) {
    const container = document.getElementById('container');
    if (!container) return;

    container.classList.remove('theme-obsidian', 'theme-ivory', 'theme-shogun', 'theme-cyber', 'theme-jade', 'theme-dark', 'theme-neon', 'theme-emerald');

    const validThemes = ['theme-obsidian', 'theme-ivory', 'theme-shogun', 'theme-cyber', 'theme-jade'];
    const resolvedTheme = validThemes.includes(themeId) ? themeId : 'theme-ivory';

    container.classList.add(resolvedTheme);

    const dayOpt = document.getElementById('theme-opt-day');
    const nightOpt = document.getElementById('theme-opt-night');
    if (dayOpt && nightOpt) {
      if (resolvedTheme === 'theme-ivory') {
        dayOpt.className = 'text-[var(--accent-gold)] flex items-center';
        nightOpt.className = 'text-[var(--text-secondary)] opacity-45 flex items-center';
      } else {
        dayOpt.className = 'text-[var(--text-secondary)] opacity-45 flex items-center';
        nightOpt.className = 'text-[var(--accent-gold)] flex items-center';
      }
    }
  },

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    let bgClass = 'bg-slate-800 text-white';
    if (type === 'success') bgClass = 'bg-emerald-600 text-white';
    if (type === 'error') bgClass = 'bg-rose-600 text-white';

    toast.className = `${bgClass} p-3.5 rounded-2xl shadow-xl border border-white/10 text-xs font-bold flex items-center justify-between pointer-events-auto transition-all transform duration-300 translate-y-[-10px] opacity-0`;
    toast.innerText = message;

    while (container.children.length >= 2) {
      container.firstElementChild?.remove();
    }

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-[-10px]', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-[-10px]');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  showError(r: number, c: number) {
    const boardEl = document.getElementById('sudoku-grid');
    if (!boardEl) return;
    const index = r * 9 + c;
    const cell = boardEl.children[index] as HTMLElement;
    if (cell) {
      cell.classList.add('!bg-rose-600', '!text-white', 'animate-pulse');
      setTimeout(() => {
        cell.classList.remove('!bg-rose-600', '!text-white', 'animate-pulse');
      }, 600);
    }
  },

  updateHeaderGold(gold: number) {
    const goldEl = document.getElementById('menu-gold');
    const gameGoldEl = document.getElementById('game-gold');
    if (goldEl) {
      goldEl.innerText = gold.toString();
    }
    if (gameGoldEl) {
      gameGoldEl.innerText = gold.toString();
    }
  },

  updateInboxBadge(count: number) {
    const badge = document.getElementById('inbox-badge-count');
    if (badge) {
      if (count > 0) {
        badge.innerText = count > 9 ? '9+' : count.toString();
        badge.classList.remove('hidden');
        badge.classList.add('flex');
      } else {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
      }
    }
  },

  toggleGameInfoPopover(energyId: string) {
    const popover = document.getElementById('game-info-popover');
    if (!popover) return;

    if (this.gamePopoverTimer) {
      clearTimeout(this.gamePopoverTimer);
      this.gamePopoverTimer = null;
    }

    if (!popover.classList.contains('hidden') && popover.getAttribute('data-active-energy') === energyId) {
      popover.classList.add('hidden');
      popover.innerText = '';
      popover.removeAttribute('data-active-energy');
    } else {
      let infoKey = 'info_mod_crystal';
      if (energyId === 'spark_flow') infoKey = 'info_mod_spark';
      else if (energyId === 'sealed_path' || energyId === 'double_seal') infoKey = 'info_mod_key_seal';
      else if (energyId === 'mystery_vault') infoKey = 'info_mod_treasure';
      else if (energyId === 'flawless_trial') infoKey = 'info_mod_flawless';
      else if (energyId === 'one_breath') infoKey = 'info_mod_one_breath';
      else if (energyId === 'sprint_rush') infoKey = 'info_mod_sprint';
      else if (energyId === 'milestone_vault') infoKey = 'info_mod_milestone';
      else if (energyId === 'region_guardian') infoKey = 'info_mod_guardian';

      popover.innerText = t(infoKey);
      popover.setAttribute('data-active-energy', energyId);
      popover.classList.remove('hidden');

      this.gamePopoverTimer = setTimeout(() => {
        popover.classList.add('hidden');
        popover.innerText = '';
        popover.removeAttribute('data-active-energy');
        this.gamePopoverTimer = null;
      }, 4000);
    }
  }
};
