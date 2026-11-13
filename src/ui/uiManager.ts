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
import { Player, SpeedRecord } from '../engine/leaderboard';
import { ShopItems, ShopManager } from '../engine/shop';
import { BadgeStatus } from '../engine/achievements';
import { ProfileStats, UserManager } from '../store/userState';
import { ChallengeRequest } from '../engine/matchEngine';

export const UIManager = {
  mountUI() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div id="container" class="w-full max-w-[480px] h-[100dvh] bg-slate-50 flex flex-col relative overflow-hidden transition-colors duration-300 font-sans">
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
        ${usernameModalTemplate}
        <div id="game-view" class="hidden flex-col items-center p-6 w-full h-full">
            <!-- Düello Canlı İlerleme Çubuğu -->
            <div id="match-header-bar" class="hidden w-full bg-slate-900 text-white p-3 rounded-2xl mb-3 shadow-lg flex-col gap-2">
                <div class="flex justify-between items-center text-xs font-black">
                    <span id="match-user-name">Siz (%0)</span>
                    <span class="text-amber-400 font-extrabold text-sm">VS</span>
                    <span id="match-enemy-name">Rakip (%0)</span>
                </div>
                <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    <div id="match-user-bar" class="bg-indigo-500 h-full transition-all duration-300" style="width: 0%"></div>
                    <div id="match-enemy-bar" class="bg-rose-500 h-full transition-all duration-300" style="width: 0%"></div>
                </div>
            </div>

            <div class="w-full flex justify-between items-center mb-4">
                <button id="btn-back-menu" class="bg-slate-200 hover:bg-slate-300 px-3.5 py-1.5 rounded-xl font-bold text-xs text-slate-800 transition-colors flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    <span>Menü</span>
                </button>
                <div class="bg-amber-100 text-amber-950 px-3 py-1 rounded-xl font-black text-xs border border-amber-200 shadow-sm flex items-center gap-1">
                    <span>🪙</span>
                    <span id="game-gold" class="font-mono font-black">100</span>
                </div>
                <div id="game-errors" class="text-rose-600 font-bold text-xs sm:text-sm">Hata: 0/3</div>
                <div id="game-timer" class="font-mono font-bold text-base sm:text-lg text-slate-800">00:00</div>
            </div>

            <!-- Sudoku Grid -->
            <div id="sudoku-grid" class="grid grid-cols-9 gap-[1px] bg-slate-800 p-[1.5px] rounded-2xl shadow-2xl mb-3 border-2 border-slate-800"></div>

            <!-- Oyun Kontrol Araç Çubuğu (İpucu, Kalem/Not Modu, Sil) -->
            <div class="flex gap-2 mb-3 w-full max-w-[380px] justify-center">
                <button id="btn-hint" class="flex-1 bg-amber-400 hover:bg-amber-500 text-amber-950 py-2.5 px-2 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1">
                    <svg class="w-4 h-4 text-amber-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                    <span>İpucu (10🪙)</span>
                </button>
                <button id="btn-toggle-notes" class="bg-slate-200 hover:bg-slate-300 text-slate-800 py-2.5 px-3 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    <span id="notes-status-text">Not: Kapalı</span>
                </button>
                <button id="btn-erase" class="bg-rose-100 hover:bg-rose-200 text-rose-800 py-2.5 px-3 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    <span>Sil</span>
                </button>
            </div>

            <!-- Ergonomik Tek Satır 9'lu Numpad -->
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

    container.classList.remove('theme-dark', 'theme-neon', 'theme-emerald');
    if (themeId === 'theme-dark') {
      container.classList.add('theme-dark');
      container.style.backgroundColor = '#0b0f19';
    } else if (themeId === 'theme-neon') {
      container.classList.add('theme-neon');
      container.style.backgroundColor = '#0d061a';
    } else if (themeId === 'theme-emerald') {
      container.classList.add('theme-emerald');
      container.style.backgroundColor = '#041f1a';
    } else {
      container.style.backgroundColor = '#f3f4f8';
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
    const mmrEl = document.getElementById('profile-stat-mmr');
    const basitEl = document.getElementById('profile-best-basit');
    const ortaEl = document.getElementById('profile-best-orta');
    const zorEl = document.getElementById('profile-best-zor');
    const badgesCountEl = document.getElementById('profile-badges-count');
    const badgesPreviewEl = document.getElementById('profile-badges-preview');
    const ownControls = document.getElementById('profile-own-controls');
    const otherControls = document.getElementById('profile-other-controls');
    const notifyToggle = document.getElementById('toggle-notifications') as HTMLInputElement;

    if (nameEl) nameEl.innerText = stats.username;
    if (editNameBtn) {
      if (isOwnProfile) editNameBtn.classList.remove('hidden');
      else editNameBtn.classList.add('hidden');
    }
    if (levelEl) levelEl.innerText = `🏅 Seviye ${stats.level}`;
    if (goldEl) goldEl.innerText = `🪙 ${stats.gold} Altın`;
    if (avatarEl) avatarEl.innerText = stats.avatar || '🎮';
    if (titleEl) titleEl.innerText = stats.title || 'Çırak';
    if (completedEl) completedEl.innerText = stats.totalCompleted.toString();
    if (duelEl) duelEl.innerText = `${stats.duelWins} G / ${stats.duelLosses} M`;
    if (mmrEl) mmrEl.innerText = `${stats.duelMmr} MMR`;
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
          const avatars = ['🎮', '🐯', '🦊', '🐼', '🤖', '👑', '🦁', '🦉'];
          avatarSelector.innerHTML = avatars.map(a => `
            <button data-avatar="${a}" class="avatar-option-btn w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center text-sm sm:text-base active:scale-90 transition-transform ${a === stats.avatar ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'}">
              ${a}
            </button>
          `).join('');
        }

        const titleSelect = document.getElementById('profile-title-select') as HTMLSelectElement;
        if (titleSelect) {
          const unlockedBadgeTitles = badges.filter(b => b.isUnlocked).map(b => b.title);
          const allTitleOptions = Array.from(new Set(['Çırak', 'Sudoku Ustası', 'Efsanevi Çözücü', ...unlockedBadgeTitles]));

          titleSelect.innerHTML = allTitleOptions.map(t => `
            <option value="${t}" ${t === stats.title ? 'selected' : ''}>${t}</option>
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

  renderMap(currentLevel: number, startFocusLevel: number) {
    const container = document.getElementById('map-nodes');
    if (!container) return;
    container.innerHTML = '';
    Array.from({length: 1000}, (_, i) => i + 1).forEach(level => {
        const isUnlocked = level <= currentLevel || level === 1 || level === 301 || level === 701;
        const isFocus = level === startFocusLevel;
        const btn = document.createElement('button');
        btn.dataset.level = level.toString();
        btn.innerText = level.toString();
        btn.className = `w-12 h-12 rounded-full font-black transition-all ${isFocus ? 'bg-indigo-600 text-white animate-pulse ring-4 ring-indigo-200' : isUnlocked ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-300 text-slate-500 opacity-50'} ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`;
        if (!isUnlocked) btn.disabled = true;
        container.appendChild(btn);
    });
  },

  renderLeaderboard(
    players: (Player | SpeedRecord)[],
    type: 'level' | 'gold' | 'speed',
    onPlayerClick?: (playerData: Player | SpeedRecord) => void
  ) {
    const listEl = document.getElementById('leaderboard-list');
    const headerRight = document.getElementById('lb-header-right');

    if (headerRight) {
      if (type === 'level') headerRight.innerText = '🏅 Seviye';
      else if (type === 'gold') headerRight.innerText = '🪙 Altın';
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

      if (type === 'level') {
        const level = 'level' in p ? p.level : 1;
        rightVal = `🏅 Sev. ${level}`;
      } else if (type === 'gold') {
        const gold = 'gold' in p ? p.gold : 0;
        rightVal = `🪙 ${gold}`;
      } else if (isSpeed) {
        const speed = p as SpeedRecord;
        rightVal = `⚡ ${speed.timeFormatted} (${speed.difficulty.toUpperCase()})`;
      }

      return `
        <div data-lb-index="${i}" class="leaderboard-row-item flex justify-between items-center p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl shadow-sm cursor-pointer active:scale-[0.98] transition-all">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-600">${i + 1}</span>
            <span class="font-bold text-slate-800 text-sm">${p.username}</span>
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
      let btnClass = "bg-indigo-600 hover:bg-indigo-700 text-white";

      if (isActive) {
        btnText = "Aktif";
        btnClass = "bg-emerald-600 text-white cursor-default";
      } else if (isPurchased) {
        btnText = "Kullan";
        btnClass = "bg-slate-800 hover:bg-slate-700 text-white";
      }

      return `
        <div class="p-3.5 border border-slate-200 rounded-2xl flex justify-between items-center bg-white shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl border flex items-center justify-center p-1 shadow-inner" style="background-color: ${item.previewColor}">
              <div class="w-3.5 h-3.5 rounded-full" style="background-color: ${item.accentColor}"></div>
            </div>
            <div>
              <p class="font-black text-slate-800 text-sm">${item.name}</p>
              <p class="text-[10px] text-slate-400 font-bold">${isPurchased ? 'Satın Alındı' : 'Mağaza Ürünü'}</p>
            </div>
          </div>
          <button data-shop-id="${item.id}" class="shop-action-btn ${btnClass} px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 shrink-0 whitespace-nowrap">
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
    notesBoard?: Set<number>[][]
  ) {
    const boardEl = document.getElementById('sudoku-grid');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    const selectedVal = (selectedR >= 0 && selectedC >= 0) ? board[selectedR][selectedC] : 0;
    const selectedBoxR = selectedR >= 0 ? Math.floor(selectedR / 3) : -1;
    const selectedBoxC = selectedC >= 0 ? Math.floor(selectedC / 3) : -1;

    board.forEach((row, r) => {
      row.forEach((val, c) => {
        const cell = document.createElement('div');
        const isSelected = r === selectedR && c === selectedC;
        const isInitial = initialBoard ? initialBoard[r][c] !== 0 : false;

        const isRelatedGroup = selectedR >= 0 && (
          r === selectedR ||
          c === selectedC ||
          (Math.floor(r / 3) === selectedBoxR && Math.floor(c / 3) === selectedBoxC)
        );

        const isMatchingValue = selectedVal !== 0 && val === selectedVal;

        let stateClass = '';

        if (isSelected) {
          stateClass = 'sudoku-cell-selected bg-indigo-600 text-white font-black shadow-lg ring-2 ring-indigo-500 z-10';
        } else if (isMatchingValue) {
          stateClass = 'sudoku-cell-matching bg-indigo-200 text-indigo-950 font-black ring-2 ring-indigo-400 z-1';
        } else if (isRelatedGroup) {
          stateClass = 'sudoku-cell-related bg-indigo-50/90 text-indigo-900 font-bold';
        } else if (isInitial) {
          stateClass = 'sudoku-cell-initial bg-slate-200 text-slate-900 font-black cursor-pointer';
        } else {
          stateClass = 'sudoku-cell-empty bg-white text-indigo-600 font-bold cursor-pointer';
        }

        const borderRight = (c === 2 || c === 5) ? 'border-r-4 border-r-slate-800' : '';
        const borderBottom = (r === 2 || r === 5) ? 'border-b-4 border-b-slate-800' : '';

        cell.className = `w-9 h-9 sm:w-11 sm:h-11 aspect-square border border-slate-300/80 flex items-center justify-center text-lg select-none cursor-pointer active:scale-95 transition-all relative ${stateClass} ${borderRight} ${borderBottom}`;

        const cellNotes = notesBoard ? notesBoard[r][c] : undefined;
        if (val === 0 && cellNotes && cellNotes.size > 0) {
          cell.innerHTML = `
            <div class="grid grid-cols-3 gap-0 w-full h-full p-0.5 pointer-events-none text-[8px] font-mono leading-none text-slate-500 font-bold items-center justify-center text-center">
              ${[1,2,3,4,5,6,7,8,9].map(n => `<div>${cellNotes.has(n) ? n : ''}</div>`).join('')}
            </div>
          `;
        } else {
          cell.innerText = val !== 0 ? val.toString() : '';
        }

        cell.onclick = () => onCellClick(r, c);
        boardEl.appendChild(cell);
      });
    });
  },

  renderNumpad(
    onNumberClick: (num: number) => void,
    remainingCounts?: Map<number, number>
  ) {
    const grid = document.getElementById('numpad-grid');
    if (!grid) return;
    grid.innerHTML = '';

    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(num => {
        const remaining = remainingCounts ? remainingCounts.get(num) ?? 9 : 9;
        const isCompleted = remaining <= 0;

        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = `bg-white p-1.5 sm:p-2 rounded-xl border border-slate-200 font-black text-sm sm:text-base hover:bg-indigo-50 text-slate-800 active:scale-95 transition-all flex flex-col items-center justify-center relative shadow-sm ${isCompleted ? 'opacity-40 pointer-events-none bg-slate-100' : ''}`;

        btn.innerHTML = `
          <span class="pointer-events-none">${num}</span>
          <span class="text-[9px] font-bold text-indigo-600 pointer-events-none">${isCompleted ? '✓' : remaining}</span>
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
  }
};
