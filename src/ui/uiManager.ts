import { menuTemplate } from './templates/menu';
import { mapTemplate } from './templates/map';
import { customModeTemplate } from './templates/custom';
import { leaderboardTemplate } from './templates/leaderboard';
import { shopTemplate } from './templates/shop';
import { usernameModalTemplate } from './templates/usernameModal';
import { achievementsTemplate } from './templates/achievements';
import { placementModalTemplate } from './templates/placementModal';
import { profileModalTemplate } from './templates/profileModal';
import { matchModalTemplate } from './templates/matchModal';
import { inboxModalTemplate } from './templates/inboxModal';
import { savedGamesModalTemplate } from './templates/savedGamesModal';
import { getAmbientBackgroundHTML } from '../design/backgrounds';
import { Icons, renderAvatarSVG, renderRankBadgeSVG, AVATAR_LIST } from '../design/icons';
import { Player, SpeedRecord } from '../engine/leaderboard';
import { ShopItems, ShopManager } from '../engine/shop';
import { BadgeStatus } from '../engine/achievements';
import { ProfileStats, UserManager } from '../store/userState';
import { ChallengeRequest } from '../engine/matchEngine';
import { BotCharacter } from '../engine/botData';
import { SudokuVariant, KillerCage, SudokuGen } from '../engine/sudoku';

export interface SavedGameRecord {
  id: string;
  variant: SudokuVariant;
  level: number;
  diff: 'basit' | 'orta' | 'zor';
  timeElapsed: number;
  userBoard: number[][];
  initialBoard: number[][];
  currentSolution: number[][];
  errors: number;
  notesBoard: number[][][];
  regionMap?: number[][];
  cages?: KillerCage[];
  samuraiBoards?: { userBoard: number[][]; initialBoard: number[][]; solution: number[][]; notesBoard: number[][][] }[];
  activeSamuraiIndex?: number;
  isCustomMode?: boolean;
  updatedAtMs: number;
}

export const UIManager = {
  getVariantEmblemSVG(variant: SudokuVariant = 'classic', size: number = 22): string {
    if (variant === 'irregular') {
      return `<svg class="inline-block" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4zM10 10h6v6h-6zM14 4h6v6h-6zM4 14h6v6H4z"/></svg>`;
    }
    if (variant === 'killer') {
      return `<svg class="inline-block" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-dasharray="2 2" d="M3 3h18v18H3z"/><path d="M7 7h10L10 12l7 5H7"/></svg>`;
    }
    if (variant === 'wordoku') {
      return `<svg class="inline-block" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7l-4 10h8M9 13h6"/></svg>`;
    }
    if (variant === 'samurai') {
      return `<svg class="inline-block" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="1"/><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/></svg>`;
    }
    return `<svg class="inline-block" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`;
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
  },

  showRulesAndScoringModal(mode: 'arena' | 'custom') {
    const existing = document.getElementById('rules-scoring-modal');
    if (existing) existing.remove();

    const isArena = mode === 'arena';
    const title = isArena ? "⚔️ Düello Arenası Kuralları & Puanlama" : "🧩 Serbest Mod Kuralları & Puanlama";

    const contentHTML = isArena ? `
      <div class="text-left text-xs space-y-3 font-medium text-slate-600 leading-relaxed">
        <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-3">
          <p class="font-black text-indigo-900 text-sm mb-1">🪙 Altın Ödülleri</p>
          <p>• 🟢 Basit Düello Zaferi: <strong class="text-indigo-700">+50 🪙 Altın</strong></p>
          <p>• 🟡 Orta Düello Zaferi: <strong class="text-indigo-700">+100 🪙 Altın</strong></p>
          <p>• 🔴 Zor Düello Zaferi: <strong class="text-indigo-700">+200 🪙 Altın</strong></p>
        </div>

        <div class="bg-purple-50 border border-purple-100 rounded-2xl p-3">
          <p class="font-black text-purple-900 text-sm mb-1">⚔️ MMR & Rütbe Puanları</p>
          <p>• Gerçek Oyuncu (PvP) Zaferi: <strong class="text-purple-700">+25 MMR</strong> (0 Hata Flawless: <strong class="text-purple-700">+30 MMR</strong>)</p>
          <p>• PvP Mağlubiyeti: <strong class="text-rose-600">-20 MMR</strong></p>
          <p>• YZ Bot Zaferi: <strong class="text-purple-700">+15 YZ MMR</strong> | Mağlubiyet: <strong class="text-rose-600">-15 YZ MMR</strong></p>
        </div>

        <div class="bg-amber-50 border border-amber-100 rounded-2xl p-3">
          <p class="font-black text-amber-900 text-sm mb-1">💠 Disiplin Çarpanları</p>
          <p>• Klasik: <strong>1.0x</strong> | Harfli: <strong>1.2x</strong> | Parçalı: <strong>1.5x</strong></p>
          <p>• Hesap: <strong>1.8x</strong> | Samurai: <strong>2.5x</strong> Puan Çarpanı</p>
        </div>

        <div class="bg-rose-50 border border-rose-100 rounded-2xl p-3">
          <p class="font-black text-rose-900 text-sm mb-1">⚠️ Terk & Ceza Kuralı</p>
          <p>• Aktif maçtan çekilmek <strong class="text-rose-600">-50 🪙 Altın</strong> ve <strong class="text-rose-600">-30 MMR</strong> cezası düşer.</p>
          <p>• Süreli maçlarda süre dolduğunda en çok doğru hücre çözen kazanır.</p>
        </div>
      </div>
    ` : `
      <div class="text-left text-xs space-y-3 font-medium text-slate-600 leading-relaxed">
        <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
          <p class="font-black text-emerald-900 text-sm mb-1">🎯 Serbest Mod Amacı</p>
          <p>Harita seviyesini ve Düello MMR puanını riske atmadan 5 disiplinde antrenman yapma ve süre rekoru kırma modudur.</p>
        </div>

        <div class="bg-amber-50 border border-amber-100 rounded-2xl p-3">
          <p class="font-black text-amber-900 text-sm mb-1">🪙 Altın Kazanımı & Blitz Bonusu</p>
          <p>• 🟢 Basit: <strong class="text-amber-700">+10 🪙</strong> | 🟡 Orta: <strong class="text-amber-700">+20 🪙</strong> | 🔴 Zor: <strong class="text-amber-700">+35 🪙</strong></p>
          <p>• ⚡ <strong>3 Dakika Blitz Modu:</strong> Tüm altın ödüllerine <strong class="text-amber-700">+%50 Ekstra Altın</strong> kazandırır!</p>
        </div>

        <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-3">
          <p class="font-black text-indigo-900 text-sm mb-1">💠 Ustalık & Rütbe Puanı</p>
          <p>• Tamamlanan her bulmaca Ustalık Puanınızı (Disiplin Çarpanıyla) ve Rütbe Puanınızı (+15 RP) yükseltir.</p>
          <p>• Serbest Modda harita seviyeniz değişmez ve düello MMR puanı etkilenmez.</p>
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'rules-scoring-modal';
    modal.className = "fixed inset-0 bg-slate-900/80 z-[96] flex items-center justify-center p-4 backdrop-blur-md";

    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative border border-slate-100 max-h-[85vh] flex flex-col">
        <button id="close-rules-scoring-modal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 text-sm">✕</button>
        <h3 class="text-lg font-black text-slate-800 mb-3 text-left border-b border-slate-100 pb-2.5 shrink-0 flex items-center gap-1.5">
          ${title}
        </h3>
        <div class="flex-1 overflow-y-auto hidden-scrollbar pr-0.5">
          ${contentHTML}
        </div>
        <button id="btn-confirm-rules-modal" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl shadow-md active:scale-95 transition-transform text-xs mt-3 shrink-0">
          Anladım ➔
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('close-rules-scoring-modal')?.addEventListener('click', () => modal.remove());
    document.getElementById('btn-confirm-rules-modal')?.addEventListener('click', () => modal.remove());
  },

  mountUI() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div id="container" class="w-full max-w-[480px] h-[100dvh] bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col relative overflow-hidden transition-colors duration-300 font-sans">
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
        <div id="game-view" class="hidden flex-col items-center p-6 w-full h-full relative z-10">
            <!-- Düello Canlı İlerleme Çubuğu -->
            <div id="match-header-bar" class="hidden w-full bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-strong)] p-3 rounded-2xl mb-3 shadow-lg flex-col gap-2">
                <div class="flex justify-between items-center text-xs font-black">
                    <span id="match-user-name">Siz (%0)</span>
                    <span class="text-[var(--accent-gold)] font-extrabold text-sm">VS</span>
                    <span id="match-enemy-name">Rakip (%0)</span>
                </div>
                <div class="w-full bg-[var(--bg-elevated)] h-2.5 rounded-full overflow-hidden flex border border-[var(--border-subtle)]">
                    <div id="match-user-bar" class="bg-[var(--accent-cyan)] h-full transition-all duration-300" style="width: 0%"></div>
                    <div id="match-enemy-bar" class="bg-rose-500 h-full transition-all duration-300" style="width: 0%"></div>
                </div>
            </div>

            <div class="w-full flex justify-between items-center mb-3">
                <button id="btn-back-menu" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] px-3.5 py-1.5 rounded-xl font-bold text-xs text-[var(--text-primary)] transition-colors flex items-center gap-1">
                    <svg class="w-4 h-4 text-[var(--accent-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    <span>Menü</span>
                </button>
                <div class="bg-[var(--bg-card)] text-[var(--accent-gold)] px-3 py-1 rounded-xl font-black text-xs border border-[var(--border-strong)] shadow-sm flex items-center gap-1.5">
                    ${Icons.coin}
                    <span id="game-gold" class="font-mono font-black text-[var(--text-primary)]">100</span>
                </div>
                <div id="game-errors" class="text-rose-400 font-bold text-xs sm:text-sm">Hata: 0/3</div>
                <div id="game-timer" class="font-mono font-bold text-base sm:text-lg text-[var(--text-primary)]">00:00</div>
            </div>

            <!-- Disiplin Vektör Amblem Rozeti -->
            <div id="game-variant-badge-box" class="w-full mb-2 flex justify-between items-center bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-black text-[var(--text-primary)]">
                <span id="game-variant-title" class="flex items-center gap-1.5">Klasik Sudoku</span>
                <span id="game-variant-multiplier" class="text-[10px] font-extrabold text-[var(--accent-gold)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded-md border border-[var(--border-strong)]">1.0x Puan</span>
            </div>

            <!-- Samurai 5-Grid Mini-Radar Seçici Bar -->
            <div id="samurai-radar-bar" class="hidden w-full grid-cols-5 gap-1 mb-2"></div>

            <!-- Sudoku Grid -->
            <div id="sudoku-grid" class="grid grid-cols-9 gap-[1px] bg-[var(--board-bg)] p-[2px] rounded-2xl shadow-2xl mb-3 border-2 border-[var(--border-strong)] relative"></div>

            <!-- Oyun Kontrol Araç Çubuğu -->
            <div class="flex gap-2 mb-3 w-full max-w-[380px] justify-center">
                <button id="btn-hint" class="flex-1 bg-[var(--accent-gold)] text-[var(--text-on-gold)] hover:brightness-110 py-2.5 px-2 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1.5">
                    ${Icons.hint}
                    <span>İpucu (10 🪙)</span>
                </button>
                <button id="btn-toggle-notes" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] py-2.5 px-3 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1.5">
                    ${Icons.pen}
                    <span id="notes-status-text">Not: Kapalı</span>
                </button>
                <button id="btn-erase" class="bg-rose-950/60 border border-rose-500/40 text-rose-300 py-2.5 px-3 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1.5">
                    ${Icons.trash}
                    <span>Sil</span>
                </button>
            </div>

            <!-- Ergonomik Numpad -->
            <div id="numpad-grid" class="grid grid-cols-9 gap-1 w-full max-w-[380px]"></div>
        </div>
      </div>
    `;

    this.applyTheme(ShopManager.getActiveTheme());
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

  applyTheme(themeId: string) {
    const container = document.getElementById('container');
    if (!container) return;

    container.classList.remove('theme-obsidian', 'theme-ivory', 'theme-shogun', 'theme-cyber', 'theme-jade', 'theme-dark', 'theme-neon', 'theme-emerald');

    const validThemes = ['theme-obsidian', 'theme-ivory', 'theme-shogun', 'theme-cyber', 'theme-jade'];
    const resolvedTheme = validThemes.includes(themeId) ? themeId : 'theme-obsidian';

    container.classList.add(resolvedTheme);
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
    if (userNameEl) userNameEl.innerText = `Siz (%${userPct})`;
    if (enemyNameEl) enemyNameEl.innerText = `${enemyName} (%${enemyPct})`;
  },

  hideMatchHeader() {
    const barBox = document.getElementById('match-header-bar');
    if (barBox) {
      barBox.classList.add('hidden');
      barBox.classList.remove('flex');
    }
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
    if (levelEl) levelEl.innerText = `Seviye ${stats.level}`;
    if (goldEl) goldEl.innerText = `${stats.gold} Altın`;
    if (avatarEl) avatarEl.innerHTML = renderAvatarSVG(stats.avatar || 'av_prism', 36);
    if (titleEl) titleEl.innerHTML = renderRankBadgeSVG(stats.title || 'Çırak');
    if (completedEl) completedEl.innerText = stats.totalCompleted.toString();
    if (duelEl) duelEl.innerText = `${stats.duelWins} G / ${stats.duelLosses} M`;
    if (pvpMmrEl) pvpMmrEl.innerText = `${stats.duelMmr} MMR`;
    if (botMmrEl) botMmrEl.innerText = `${stats.botMmr || 1000} YZ`;
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
          avatarSelector.innerHTML = AVATAR_LIST.map(a => `
            <button data-avatar="${a.key}" class="avatar-option-btn p-2 rounded-xl border flex flex-col items-center justify-center active:scale-90 transition-transform ${a.key === stats.avatar ? 'bg-[var(--accent-gold)] text-[var(--text-on-gold)] border-[var(--accent-gold)] shadow-md ring-2 ring-[var(--accent-gold-bright)]' : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)]'}">
              ${renderAvatarSVG(a.key, 24)}
              <span class="text-[8px] font-black mt-1">${a.name}</span>
            </button>
          `).join('');
        }
      } else {
        ownControls.classList.add('hidden');
        otherControls.classList.remove('hidden');
      }
    }

    const unlockedBadges = badges.filter(b => b.isUnlocked);
    if (badgesCountEl) badgesCountEl.innerText = `${unlockedBadges.length} / ${badges.length} Rozet`;

    if (badgesPreviewEl) {
      if (unlockedBadges.length === 0) {
        badgesPreviewEl.innerHTML = `<p class="text-xs text-slate-400 font-medium py-1">Henüz rozet kazanılmadı.</p>`;
      } else {
        badgesPreviewEl.innerHTML = unlockedBadges.slice(0, 4).map(b => `
          <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl shrink-0">
            <span class="text-base">${b.icon}</span>
            <span class="text-[11px] font-bold text-slate-700">${b.title}</span>
          </div>
        `).join('');
      }
    }
  },

  renderSavedGamesList(
    records: SavedGameRecord[],
    onPlay: (record: SavedGameRecord) => void,
    onDelete: (record: SavedGameRecord) => void
  ) {
    const listEl = document.getElementById('saved-games-list');
    if (!listEl) return;

    if (records.length === 0) {
      listEl.innerHTML = `
        <div class="flex flex-col items-center justify-center py-10 text-center">
          <svg class="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p class="text-xs font-bold text-slate-500 mb-0.5">Kayıtlı aktif oyununuz yok</p>
          <p class="text-[10px] text-slate-400">Yeni bir oyuna başladığınızda yarım kalan ilerlemeniz otomatik buraya kaydedilir.</p>
        </div>
      `;
      return;
    }

    const titleMap: Record<SudokuVariant, string> = {
      classic: 'Klasik Sudoku',
      irregular: 'Parçalı Sudoku',
      killer: 'Hesap Sudoku',
      wordoku: 'Harfli Sudoku',
      samurai: 'Samurai Sudoku'
    };

    listEl.innerHTML = records.map(r => {
      const variant = r.variant || 'classic';
      const emblem = this.getVariantEmblemSVG(variant, 20);
      const level = typeof r.level === 'number' ? r.level : 1;
      const diffStr = r.diff ? r.diff.toUpperCase() : 'BASİT';
      const timeSec = typeof r.timeElapsed === 'number' ? r.timeElapsed : 0;
      const m = Math.floor(timeSec / 60).toString().padStart(2, '0');
      const s = (timeSec % 60).toString().padStart(2, '0');
      const isCustom = !!r.isCustomMode;

      const deleteBtnHTML = isCustom ? `
        <button data-record-id="${r.id}" class="delete-saved-game-btn bg-rose-950/60 border border-rose-500/40 text-rose-300 font-black text-xs p-1.5 rounded-xl active:scale-90 transition-transform">
          ✕
        </button>
      ` : '';

      return `
        <div class="p-3 border border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-card)] shadow-sm flex items-center justify-between transition-all">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
              ${emblem}
            </div>
            <div class="text-left">
              <div class="flex items-center gap-1">
                <p class="font-black text-[var(--text-primary)] text-xs">${titleMap[variant] || 'Klasik Sudoku'}</p>
                ${!isCustom ? `<span class="bg-[var(--accent-gold)] text-[var(--text-on-gold)] text-[8px] font-black px-1.5 py-0.5 rounded-md">Harita</span>` : `<span class="bg-[var(--accent-cyan)] text-[var(--text-on-gold)] text-[8px] font-black px-1.5 py-0.5 rounded-md">Serbest</span>`}
              </div>
              <p class="text-[10px] text-[var(--text-secondary)] font-bold">Seviye ${level} • ${diffStr} • ${timeSec > 0 ? `${m}:${s}` : 'Hazır'}</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button data-record-id="${r.id}" class="play-saved-game-btn bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black text-xs px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center gap-1 hover:brightness-110">
              <span>▶</span><span>Devam Et</span>
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
          <svg class="w-8 h-8 text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <p class="text-xs font-bold text-slate-500 mb-0.5">Çevrimiçi oyuncu bulunamadı</p>
          <p class="text-[10px] text-slate-400">Rastgele rakip arayabilir veya YZ Botlarla kapışabilirsiniz.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = players.map(p => {
      const status = p.onlineStatus || 'available';
      let statusBadge = `<span class="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">🟢 Müsait</span>`;
      let btnText = `⚔️ Düello Gönder`;
      let btnClass = `bg-indigo-600 hover:bg-indigo-700 text-white`;
      let isDisabled = false;

      if (status === 'in_game') {
        statusBadge = `<span class="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">🟡 Oyunda</span>`;
        btnText = `📩 Davet Gönder`;
        btnClass = `bg-purple-600 hover:bg-purple-700 text-white`;
      } else if (status === 'in_duel') {
        statusBadge = `<span class="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">🔴 Düelloda</span>`;
        btnText = `Maçta`;
        btnClass = `bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed`;
        isDisabled = true;
      }

      const calculatedTitle = UserManager.calculatePlayerTitle(p.level, p.duel_wins || 0, p.duel_mmr || 1000);

      return `
        <div class="p-2.5 border border-slate-200 hover:border-indigo-300 rounded-2xl bg-white shadow-sm flex items-center justify-between transition-all">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
              ${p.avatar || '🎮'}
            </div>
            <div class="text-left">
              <div class="flex items-center gap-1.5">
                <span class="font-black text-slate-800 text-xs">${p.username}</span>
                <span class="text-[9px] font-black text-indigo-600">${calculatedTitle}</span>
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

    listEl.innerHTML = bots.map(bot => `
      <div class="p-3 border border-slate-200 hover:border-indigo-300 rounded-2xl bg-white shadow-sm flex items-center justify-between transition-all">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shrink-0">
            ${bot.avatar}
          </div>
          <div class="text-left">
            <div class="flex items-center gap-1.5">
              <span class="font-black text-slate-800 text-xs">${bot.name}</span>
              <span class="bg-indigo-100 text-indigo-800 text-[9px] font-black px-1.5 py-0.5 rounded-md">Sev. ${bot.level}</span>
            </div>
            <p class="text-[10px] text-slate-500 font-medium line-clamp-1">${bot.desc}</p>
          </div>
        </div>
        <button data-bot-id="${bot.id}" class="select-bot-btn bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-transform shrink-0 whitespace-nowrap">
          ⚔️ Oyna
        </button>
      </div>
    `).join('');

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
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-indigo-200">
          🤖
        </div>
        <h3 class="text-xl font-black text-slate-800 mb-2">SudokuMap Uzmanı ile Düello</h3>
        <p class="text-xs text-slate-500 font-medium mb-5 leading-relaxed">
          Rakip şu an çevrimdışı. Yapay Zekâ <strong>SudokuMap Uzmanı</strong> ile düello oynamak ister misiniz?
        </p>
        <div class="flex flex-col gap-2.5 w-full">
          <button id="btn-accept-bot-prompt" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs tracking-wide">
            ⚔️ Evet, Düelloya Başla
          </button>
          <button id="btn-cancel-bot-prompt" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl active:scale-95 transition-all text-xs">
            İptal (Ana Menüye Dön)
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
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-200">
        <button id="close-duration-modal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 text-sm">✕</button>
        <div class="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
          ⚔️
        </div>
        <h3 class="text-xl font-black text-slate-800 mb-1">Düello Daveti Gönder</h3>
        <p class="text-xs text-slate-500 font-medium mb-4">
          <strong class="text-slate-800 font-black">${targetUsername}</strong> adlı oyuncuya davet göndermeden önce <strong>Süre Modunu</strong> seçin:
        </p>

        <div class="flex flex-col gap-2.5 w-full mb-1">
          <button data-sec="180" class="select-duration-btn w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black py-3 rounded-2xl shadow-sm active:scale-95 transition-transform text-xs flex justify-between items-center px-4">
            <span>⚡ 3 Dakika (Blitz)</span>
            <span class="bg-white/20 px-2 py-0.5 rounded-lg text-[10px]">Hızlı</span>
          </button>
          <button data-sec="420" class="select-duration-btn w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl active:scale-95 transition-transform text-xs flex justify-between items-center px-4">
            <span>⏱️ 7 Dakika (Standard)</span>
            <span class="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-[10px]">Dengeli</span>
          </button>
          <button data-sec="0" class="select-duration-btn w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl active:scale-95 transition-transform text-xs flex justify-between items-center px-4">
            <span>♾️ Süresiz (No Limit)</span>
            <span class="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-[10px]">Serbest</span>
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
          <svg class="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          <p class="text-xs font-bold text-slate-500 mb-0.5">Bekleyen davetiniz yok</p>
          <p class="text-[10px] text-slate-400">Diğer oyuncular size düello isteği gönderdiğinde burada görünecektir.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = challenges.map(c => `
      <div class="p-3 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-lg">⚔️</span>
            <div>
              <p class="font-black text-slate-800 text-xs">${c.fromUsername}</p>
              <p class="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">${c.difficulty.toUpperCase()} DÜELLO</p>
            </div>
          </div>
          <span class="text-[10px] font-mono text-slate-400">Bekliyor</span>
        </div>
        <div class="flex gap-2 mt-1">
          <button data-chal-id="${c.challengeId}" class="inbox-accept-btn flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-2 rounded-xl text-xs active:scale-95 transition-transform shadow-sm">
            ⚔️ Kabul Et & Oyna
          </button>
          <button data-chal-id="${c.challengeId}" class="inbox-decline-btn bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-2 rounded-xl text-xs active:scale-95 transition-transform">
            ✕ Reddet
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
      <p class="text-xs font-medium text-slate-200"><span class="font-black text-white">${challenge.fromUsername}</span> seni <strong>${challenge.difficulty.toUpperCase()}</strong> düelloya davet ediyor!</p>
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
  },

  renderMap(
    currentLevel: number,
    windowStart: number,
    windowEnd: number,
    onNodeClick: (level: number) => void,
    autoScrollToCurrent: boolean = false
  ) {
    const container = document.getElementById('map-path-container');
    const targetLabel = document.getElementById('map-target-label');
    const biomeTitle = document.getElementById('map-biome-title');
    const tierProgress = document.getElementById('map-tier-progress');
    if (!container) return;
    container.innerHTML = '';

    const diff = SudokuGen.getDifficulty(currentLevel);
    if (targetLabel) {
      targetLabel.innerText = `Seviye ${currentLevel} • ${diff.toUpperCase()}`;
    }

    if (biomeTitle) {
      if (currentLevel <= 300) biomeTitle.innerText = "ZÜMRÜT VADİ";
      else if (currentLevel <= 700) biomeTitle.innerText = "HEXTECH KALESİ";
      else biomeTitle.innerText = "KIZIL ZİRVE";
    }

    if (tierProgress) {
      const pct = Math.min(100, Math.max(5, Math.round(((currentLevel % 300) / 300) * 100)));
      tierProgress.style.width = `${pct}%`;
    }

    const startLvl = Math.max(1, windowStart);
    const endLvl = Math.min(1000, Math.max(startLvl + 5, windowEnd));
    const totalLevels = endLvl - startLvl + 1;

    const ROW_H = 104;
    const totalHeight = totalLevels * ROW_H;
    container.style.height = `${totalHeight}px`;

    const avatar = UserManager.getAvatar() || 'av_prism';

    // Exact Numeric SVG Energy Path
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('width', '320');
    svgEl.setAttribute('height', totalHeight.toString());
    svgEl.setAttribute('viewBox', `0 0 320 ${totalHeight}`);
    svgEl.setAttribute('class', 'absolute top-0 left-0 pointer-events-none z-0');
    container.appendChild(svgEl);

    const nodePoints: { lvl: number; cx: number; cy: number }[] = [];

    let index = 0;
    for (let lvl = endLvl; lvl >= startLvl; lvl--) {
      const isCompleted = lvl < currentLevel;
      const isCurrent = lvl === currentLevel;
      const isMilestone = lvl % 10 === 0;

      const offsetX = Math.round(Math.sin(lvl * 0.85) * 76);
      const cx = 160 + offsetX;
      const cy = index * ROW_H + (ROW_H / 2);

      nodePoints.push({ lvl, cx, cy });

      const wrapper = document.createElement('div');
      wrapper.id = `map-node-${lvl}`;
      wrapper.style.position = 'absolute';
      wrapper.style.top = `${index * ROW_H}px`;
      wrapper.style.left = '0px';
      wrapper.style.width = '320px';
      wrapper.style.height = `${ROW_H}px`;
      wrapper.className = 'flex items-center justify-center relative z-10';

      const innerBox = document.createElement('div');
      innerBox.className = 'relative flex flex-col items-center justify-center group';
      innerBox.style.transform = `translateX(${offsetX}px)`;

      const milestoneBadge = isMilestone ? `<span class="absolute -top-3 text-xs z-30 pointer-events-none">${Icons.crown}</span>` : '';

      if (isCurrent) {
        innerBox.innerHTML = `
          ${milestoneBadge}
          <div class="absolute -top-7 bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md border border-[var(--accent-gold-bright)] flex items-center gap-1 z-30">
            <span>${renderAvatarSVG(avatar, 14)}</span>
            <span>SEVİYE ${lvl}</span>
          </div>
          <button data-level="${lvl}" class="w-24 h-24 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-strong)] ring-4 ring-[var(--accent-cyan)]/60 text-[var(--text-primary)] shadow-2xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform">
            <span class="text-xl font-mono font-black leading-none text-[var(--accent-gold)]">${lvl}</span>
            <span class="text-[9px] font-black text-[var(--accent-gold-bright)] tracking-widest mt-1">OYNA</span>
          </button>
        `;
      } else if (isCompleted) {
        innerBox.innerHTML = `
          ${milestoneBadge}
          <button data-level="${lvl}" class="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--accent-cyan)] text-[var(--text-primary)] shadow-md flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform">
            <span class="text-base font-mono font-black leading-none">${lvl}</span>
            <span class="mt-0.5">${Icons.check}</span>
          </button>
        `;
      } else {
        innerBox.innerHTML = `
          ${milestoneBadge}
          <button disabled class="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] text-[var(--text-secondary)] flex flex-col items-center justify-center cursor-not-allowed opacity-60">
            <span class="text-sm font-mono font-black leading-none">${lvl}</span>
            <span class="mt-0.5">${Icons.lock}</span>
          </button>
        `;
      }

      const btn = innerBox.querySelector('button[data-level]');
      if (btn) {
        btn.addEventListener('click', () => onNodeClick(lvl));
      }

      wrapper.appendChild(innerBox);
      container.appendChild(wrapper);
      index++;
    }

    for (let i = 0; i < nodePoints.length - 1; i++) {
      const p1 = nodePoints[i];
      const p2 = nodePoints[i + 1];

      const midY = (p1.cy + p2.cy) / 2;
      const d = `M ${p1.cx} ${p1.cy} C ${p1.cx} ${midY}, ${p2.cx} ${midY}, ${p2.cx} ${p2.cy}`;

      const isCompletedLine = p1.lvl <= currentLevel && p2.lvl <= currentLevel;
      const isActiveLine = p2.lvl === currentLevel;

      if (isCompletedLine) {
        const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glowPath.setAttribute('d', d);
        glowPath.setAttribute('fill', 'none');
        glowPath.setAttribute('stroke', 'var(--accent-cyan)');
        glowPath.setAttribute('stroke-opacity', '0.22');
        glowPath.setAttribute('stroke-width', '10');
        svgEl.appendChild(glowPath);

        const corePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        corePath.setAttribute('d', d);
        corePath.setAttribute('fill', 'none');
        corePath.setAttribute('stroke', 'var(--accent-cyan)');
        corePath.setAttribute('stroke-width', '3.5');
        svgEl.appendChild(corePath);
      } else if (isActiveLine) {
        const activePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        activePath.setAttribute('d', d);
        activePath.setAttribute('fill', 'none');
        activePath.setAttribute('stroke', 'var(--accent-gold)');
        activePath.setAttribute('stroke-width', '3.5');
        svgEl.appendChild(activePath);
      } else {
        const lockedPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        lockedPath.setAttribute('d', d);
        lockedPath.setAttribute('fill', 'none');
        lockedPath.setAttribute('stroke', 'var(--border-subtle)');
        lockedPath.setAttribute('stroke-width', '3');
        lockedPath.setAttribute('stroke-dasharray', '6 6');
        svgEl.appendChild(lockedPath);
      }
    }

    if (autoScrollToCurrent) {
      setTimeout(() => {
        const currentEl = document.getElementById(`map-node-${currentLevel}`);
        if (currentEl) {
          currentEl.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      }, 50);
    }
  },

  renderLeaderboard(
    players: (Player | SpeedRecord)[],
    type: 'level' | 'gold' | 'speed' | 'pvp_mmr' | 'bot_mmr' | 'discipline',
    onPlayerClick?: (playerData: Player | SpeedRecord) => void,
    filterVariant: SudokuVariant = 'classic'
  ) {
    const listEl = document.getElementById('leaderboard-list');
    const headerRight = document.getElementById('lb-header-right');

    if (headerRight) {
      if (type === 'level') headerRight.innerText = '🏅 Seviye';
      else if (type === 'gold') headerRight.innerText = '🪙 Altın';
      else if (type === 'pvp_mmr') headerRight.innerText = '⚔️ PvP MMR';
      else if (type === 'bot_mmr') headerRight.innerText = '🤖 YZ MMR';
      else if (type === 'discipline') headerRight.innerText = '💠 Disiplin';
      else headerRight.innerText = '⚡ Rekor Süre';
    }

    if (!listEl) return;
    if (players.length === 0) {
      if (type === 'speed') {
        listEl.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <svg class="w-12 h-12 text-indigo-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p class="text-xs font-bold text-slate-600 mb-1">Bu zorlukta henüz rekor kırılmadı.</p>
            <p class="text-[11px] text-slate-400">İlk rekoru kıran sen ol!</p>
          </div>
        `;
      } else {
        listEl.innerHTML = `<div class="text-center text-slate-400 py-10 font-bold">Kayıt bulunamadı.</div>`;
      }
      return;
    }

    listEl.innerHTML = players.map((p, i) => {
      let rightVal = '';
      let isSpeed = 'difficulty' in p;
      const playerObj = p as Player;

      const emblem = this.getVariantEmblemSVG(playerObj.dominantVariant || filterVariant, 18);

      if (type === 'level') {
        rightVal = `<span class="flex items-center gap-1">${emblem} 🏅 Sev. ${playerObj.level || 1}</span>`;
      } else if (type === 'gold') {
        rightVal = `<span class="flex items-center gap-1">${emblem} 🪙 ${playerObj.gold || 0}</span>`;
      } else if (type === 'pvp_mmr') {
        rightVal = `⚔️ ${playerObj.duel_mmr || 1000} MMR`;
      } else if (type === 'bot_mmr') {
        rightVal = `🤖 ${playerObj.bot_mmr || 1000} YZ`;
      } else if (type === 'discipline') {
        const score = playerObj.variantScores ? playerObj.variantScores[filterVariant] || 0 : 0;
        rightVal = `<span class="flex items-center gap-1">${this.getVariantEmblemSVG(filterVariant, 18)} ${score} Puan</span>`;
      } else if (isSpeed) {
        const speed = p as SpeedRecord;
        rightVal = `⚡ ${speed.timeFormatted} (${speed.difficulty.toUpperCase()})`;
      }

      const calculatedTitle = playerObj.title || UserManager.calculatePlayerTitle(playerObj.level || 1, playerObj.duel_wins || 0, playerObj.duel_mmr || 1000);

      return `
        <div data-lb-index="${i}" class="leaderboard-row-item flex justify-between items-center p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl shadow-sm cursor-pointer active:scale-[0.98] transition-all">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-600">${i + 1}</span>
            <div>
              <p class="font-bold text-slate-800 text-sm leading-tight">${p.username}</p>
              <p class="text-[9px] font-black text-indigo-600">${calculatedTitle}</p>
            </div>
          </div>
          <span class="font-black text-indigo-600 text-xs">${rightVal}</span>
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

  renderShop(onBuyOrSelect: (itemId: string) => void) {
    const listEl = document.getElementById('shop-list');
    if (!listEl) return;

    const purchased = ShopManager.getPurchasedThemes();
    const active = ShopManager.getActiveTheme();

    listEl.innerHTML = ShopItems.map(item => {
      const isPurchased = purchased.includes(item.id);
      const isActive = active === item.id;

      let btnText = `${item.price} 🪙`;
      let btnClass = "bg-[var(--accent-gold)] text-[var(--text-on-gold)] hover:brightness-110";

      if (isActive) {
        btnText = "Aktif ✓";
        btnClass = "bg-[var(--accent-cyan)] text-[var(--text-on-gold)] cursor-default";
      } else if (isPurchased) {
        btnText = "Kullan";
        btnClass = "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)]";
      }

      return `
        <div class="p-3.5 border border-[var(--border-subtle)] rounded-2xl flex justify-between items-center bg-[var(--bg-card)] shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl border border-[var(--border-strong)] flex items-center justify-center p-1 shadow-inner" style="background-color: ${item.previewColor}">
              <div class="w-3.5 h-3.5 rounded-full" style="background-color: ${item.accentColor}"></div>
            </div>
            <div>
              <p class="font-black text-[var(--text-primary)] text-sm">${item.name}</p>
              <p class="text-[10px] text-[var(--text-secondary)] font-bold">${isPurchased ? 'Satın Alındı' : 'Mağaza Ürünü'}</p>
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

    listEl.innerHTML = badges.map(b => {
      let statusBtn = `<span class="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl shrink-0 whitespace-nowrap">Kilitli</span>`;

      if (b.isClaimed) {
        statusBtn = `<span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0 whitespace-nowrap">Alındı ✓</span>`;
      } else if (b.isUnlocked) {
        statusBtn = `<button data-badge-id="${b.id}" class="claim-badge-btn bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow active:scale-95 transition-transform animate-pulse shrink-0 whitespace-nowrap">+${b.rewardGold} 🪙 Al</button>`;
      }

      return `
        <div class="p-3 border border-slate-200 rounded-2xl flex justify-between items-center ${b.isUnlocked ? 'bg-white shadow-sm' : 'bg-slate-50 opacity-60'}">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${b.icon}</span>
            <div>
              <p class="font-black text-slate-800 text-xs">${b.title}</p>
              <p class="text-[10px] text-slate-500 font-medium">${b.desc}</p>
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

  renderSamuraiRadar(
    activeIndex: number,
    completionStatuses: { completed: boolean; remaining: number }[],
    onSelect: (idx: number) => void
  ) {
    const barEl = document.getElementById('samurai-radar-bar');
    if (!barEl) return;
    barEl.classList.remove('hidden');
    barEl.classList.add('grid');

    const radarItems = [
      { idx: 1, label: '↖ Sol-Üst' },
      { idx: 2, label: '↗ Sağ-Üst' },
      { idx: 0, label: '🎯 Merkez' },
      { idx: 3, label: '↙ Sol-Alt' },
      { idx: 4, label: '↘ Sağ-Alt' }
    ];

    barEl.innerHTML = radarItems.map(item => {
      const isSelected = item.idx === activeIndex;
      const status = completionStatuses[item.idx] || { completed: false, remaining: 0 };

      let btnClass = "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50";
      if (isSelected) {
        btnClass = "bg-rose-600 text-white font-black shadow-sm ring-2 ring-rose-400";
      } else if (status.completed) {
        btnClass = "bg-emerald-500 text-white font-black";
      }

      const badgeText = status.completed ? '✓' : `${status.remaining} Boş`;

      return `
        <button data-samurai-idx="${item.idx}" class="samurai-radar-btn ${btnClass} py-1.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center transition-all active:scale-95 leading-tight">
          <span>${item.label}</span>
          <span class="text-[8px] font-mono opacity-90">${badgeText}</span>
        </button>
      `;
    }).join('');

    barEl.querySelectorAll('.samurai-radar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-samurai-idx') || '0');
        onSelect(idx);
      });
    });
  },

  hideSamuraiRadar() {
    const barEl = document.getElementById('samurai-radar-bar');
    if (barEl) {
      barEl.classList.add('hidden');
      barEl.classList.remove('grid');
    }
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

  renderBoard(
    board: number[][],
    onCellClick: (r: number, c: number) => void,
    selectedR: number,
    selectedC: number,
    initialBoard?: number[][],
    notesBoard?: Set<number>[][],
    variant: SudokuVariant = 'classic',
    regionMap?: number[][],
    cages?: KillerCage[],
    samuraiGridIndex?: number
  ) {
    const boardEl = document.getElementById('sudoku-grid');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    const wordokuLetters = ['A','B','C','D','E','F','G','H','I'];
    const selectedVal = (selectedR >= 0 && selectedC >= 0) ? board[selectedR][selectedC] : 0;
    const selectedBoxR = selectedR >= 0 ? Math.floor(selectedR / 3) : -1;
    const selectedBoxC = selectedC >= 0 ? Math.floor(selectedC / 3) : -1;

    const cageMap = new Map<string, number>();
    if (variant === 'killer' && cages) {
      cages.forEach(cage => {
        if (cage.cells.length > 0) {
          const first = cage.cells[0];
          cageMap.set(`${first.r}_${first.c}`, cage.sum);
        }
      });
    }

    board.forEach((row, r) => {
      row.forEach((val, c) => {
        const cell = document.createElement('div');
        const isSelected = r === selectedR && c === selectedC;
        const isInitial = initialBoard ? initialBoard[r][c] !== 0 : false;

        const isRelatedGroup = selectedR >= 0 && (
          r === selectedR ||
          c === selectedC ||
          (variant === 'irregular' && regionMap ? (regionMap[r][c] === regionMap[selectedR][selectedC]) : (Math.floor(r / 3) === selectedBoxR && Math.floor(c / 3) === selectedBoxC))
        );

        const isMatchingValue = selectedVal !== 0 && val === selectedVal;

        let isSamuraiCorner = false;
        if (variant === 'samurai' && typeof samuraiGridIndex === 'number') {
          if (samuraiGridIndex === 0) isSamuraiCorner = (r < 3 || r >= 6) && (c < 3 || c >= 6);
          else if (samuraiGridIndex === 1) isSamuraiCorner = r >= 6 && c >= 6;
          else if (samuraiGridIndex === 2) isSamuraiCorner = r >= 6 && c < 3;
          else if (samuraiGridIndex === 3) isSamuraiCorner = r < 3 && c >= 6;
          else if (samuraiGridIndex === 4) isSamuraiCorner = r < 3 && c < 3;
        }

        let stateClass = '';

        if (isSelected) {
          stateClass = 'sudoku-cell-selected bg-[var(--cell-selected-bg)] text-[var(--text-on-gold)] font-black shadow-lg ring-2 ring-[var(--accent-gold-bright)] z-10';
        } else if (isMatchingValue) {
          stateClass = 'sudoku-cell-matching bg-[var(--cell-match-bg)] text-[var(--accent-gold-bright)] font-black ring-1 ring-[var(--accent-gold)]/50 z-1';
        } else if (isRelatedGroup) {
          stateClass = 'sudoku-cell-related bg-[var(--cell-related-bg)] text-[var(--text-primary)] font-bold';
        } else if (isSamuraiCorner) {
          stateClass = 'sudoku-cell-samurai bg-[var(--cell-initial-bg)] text-[var(--text-primary)] font-bold ring-1 ring-inset ring-rose-500/50';
        } else if (isInitial) {
          stateClass = 'sudoku-cell-initial bg-[var(--cell-initial-bg)] text-[var(--text-primary)] font-black cursor-pointer';
        } else {
          stateClass = 'sudoku-cell-empty bg-[var(--cell-bg)] text-[var(--accent-cyan)] font-black cursor-pointer';
        }

        let borderRight = '';
        let borderBottom = '';

        if (variant === 'irregular' && regionMap) {
          const currentRegion = regionMap[r][c];
          if (c < 8 && regionMap[r][c + 1] !== currentRegion) {
            borderRight = 'border-r-[3px] border-r-[var(--accent-gold)]';
          }
          if (r < 8 && regionMap[r + 1][c] !== currentRegion) {
            borderBottom = 'border-b-[3px] border-b-[var(--accent-gold)]';
          }
        } else {
          if (c === 2 || c === 5) borderRight = 'border-r-4 border-r-[var(--accent-gold)]';
          if (r === 2 || r === 5) borderBottom = 'border-b-4 border-b-[var(--accent-gold)]';
        }

        cell.className = `w-9 h-9 sm:w-11 sm:h-11 aspect-square border border-[var(--border-subtle)] flex items-center justify-center text-lg select-none cursor-pointer active:scale-95 transition-all relative ${stateClass} ${borderRight} ${borderBottom}`;

        // Killer Sudoku Dış Sınır Kafes Çerçevesi
        if (variant === 'killer' && cages) {
          const myCageIdx = cages.findIndex(cg => cg.cells.some(cell => cell.r === r && cell.c === c));
          if (myCageIdx >= 0) {
            const topCageIdx = r > 0 ? cages.findIndex(cg => cg.cells.some(cell => cell.r === r - 1 && cell.c === c)) : -1;
            const bottomCageIdx = r < 8 ? cages.findIndex(cg => cg.cells.some(cell => cell.r === r + 1 && cell.c === c)) : -1;
            const leftCageIdx = c > 0 ? cages.findIndex(cg => cg.cells.some(cell => cell.r === r && cell.c === c - 1)) : -1;
            const rightCageIdx = c < 8 ? cages.findIndex(cg => cg.cells.some(cell => cell.r === r && cell.c === c + 1)) : -1;

            const cageFrame = document.createElement('div');
            let frameBorders = 'pointer-events-none absolute inset-[2px] z-5 ';

            if (topCageIdx !== myCageIdx) frameBorders += 'border-t border-dashed border-[var(--accent-gold)] ';
            if (bottomCageIdx !== myCageIdx) frameBorders += 'border-b border-dashed border-[var(--accent-gold)] ';
            if (leftCageIdx !== myCageIdx) frameBorders += 'border-l border-dashed border-[var(--accent-gold)] ';
            if (rightCageIdx !== myCageIdx) frameBorders += 'border-r border-dashed border-[var(--accent-gold)] ';

            cageFrame.className = frameBorders;
            cell.appendChild(cageFrame);
          }
        }

        // Killer Sudoku kafes toplamı rozeti (Sol Üst Hücre)
        const cageSum = cageMap.get(`${r}_${c}`);
        if (variant === 'killer' && cageSum !== undefined) {
          const cageBadge = document.createElement('span');
          cageBadge.className = "absolute top-[2px] left-[3px] text-[8px] font-mono font-black text-[var(--accent-gold)] leading-none pointer-events-none z-10";
          cageBadge.innerText = cageSum.toString();
          cell.appendChild(cageBadge);
        }

        const cellNotes = notesBoard ? notesBoard[r][c] : undefined;
        if (val === 0 && cellNotes && cellNotes.size > 0) {
          const notesDiv = document.createElement('div');
          notesDiv.className = "grid grid-cols-3 gap-0 w-full h-full p-0.5 pointer-events-none text-[8px] font-mono leading-none text-[var(--text-secondary)] font-bold items-center justify-center text-center";
          notesDiv.innerHTML = [1,2,3,4,5,6,7,8,9].map(n => `<div>${cellNotes.has(n) ? (variant === 'wordoku' ? wordokuLetters[n - 1] : n) : ''}</div>`).join('');
          cell.appendChild(notesDiv);
        } else if (val !== 0) {
          const textSpan = document.createElement('span');
          if (variant === 'killer' && cageSum !== undefined) {
            textSpan.className = "mt-1.5 text-base";
          }
          textSpan.innerText = variant === 'wordoku' ? wordokuLetters[val - 1] : val.toString();
          cell.appendChild(textSpan);
        }

        cell.onclick = () => onCellClick(r, c);
        boardEl.appendChild(cell);
      });
    });
  },

  renderNumpad(
    onNumberClick: (num: number) => void,
    remainingCounts?: Map<number, number>,
    isWordoku: boolean = false
  ) {
    const grid = document.getElementById('numpad-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const wordokuLetters = ['A','B','C','D','E','F','G','H','I'];

    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(num => {
        const label = isWordoku ? wordokuLetters[num - 1] : num.toString();
        const remaining = remainingCounts ? remainingCounts.get(num) ?? 9 : 9;
        const isCompleted = remaining <= 0;

        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = `bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] p-1.5 sm:p-2 rounded-xl border border-[var(--border-subtle)] font-black text-sm sm:text-base text-[var(--text-primary)] active:scale-95 transition-all flex flex-col items-center justify-center relative shadow-sm ${isCompleted ? 'opacity-40 pointer-events-none bg-[var(--bg-elevated)]' : ''}`;

        btn.innerHTML = `
          <span class="pointer-events-none">${label}</span>
          <span class="text-[9px] font-bold text-[var(--accent-gold)] pointer-events-none">${isCompleted ? '✓' : remaining}</span>
        `;
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          onNumberClick(num);
        };
        grid.appendChild(btn);
    });
  },

  toggleModal(id: string, show: boolean) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('hidden', !show);
    el.classList.toggle('flex', show);
  },

  navigate(viewId: 'menu' | 'map' | 'custom' | 'game') {
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
  }
};
