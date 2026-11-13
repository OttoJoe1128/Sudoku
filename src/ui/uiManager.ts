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
import { Player } from '../engine/leaderboard';
import { ShopItems, ShopManager } from '../engine/shop';
import { BadgeStatus } from '../engine/achievements';
import { ProfileStats } from '../store/userState';

export const UIManager = {
  mountUI() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div id="container" class="w-full max-w-[480px] h-[100dvh] bg-slate-50 flex flex-col relative overflow-hidden transition-colors duration-300">
        ${menuTemplate}
        ${mapTemplate}
        ${customModeTemplate}
        ${leaderboardTemplate}
        ${shopTemplate}
        ${achievementsTemplate}
        ${placementModalTemplate}
        ${profileModalTemplate}
        ${matchModalTemplate}
        ${usernameModalTemplate}
        <div id="game-view" class="hidden flex-col items-center p-6 w-full h-full">
            <!-- Düello Canlı İlerleme Çubuğu -->
            <div id="match-header-bar" class="hidden w-full bg-slate-900 text-white p-3 rounded-2xl mb-4 shadow-lg flex-col gap-2">
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

            <div class="w-full flex justify-between items-center mb-6">
                <button id="btn-back-menu" class="bg-slate-200 px-4 py-2 rounded-xl font-bold text-sm text-slate-800">⬅ Menü</button>
                <div id="game-errors" class="text-rose-600 font-bold text-sm">Hata: 0/3</div>
                <div id="game-timer" class="font-mono font-bold text-lg">00:00</div>
            </div>
            <div id="sudoku-grid" class="grid grid-cols-9 gap-[1px] bg-slate-800 p-[1px] rounded-lg shadow-xl mb-4"></div>
            <div class="flex gap-2 mb-4">
                <button id="btn-hint" class="bg-amber-400 hover:bg-amber-500 text-amber-950 px-6 py-2 rounded-xl font-bold text-sm shadow active:scale-95 transition-all">💡 İpucu (10🪙)</button>
            </div>
            <div id="numpad-grid" class="grid grid-cols-5 gap-2 w-full max-w-[300px]"></div>
        </div>
      </div>
    `;

    this.applyTheme(ShopManager.getActiveTheme());
  },

  applyTheme(themeId: string) {
    const container = document.getElementById('container');
    if (!container) return;

    container.classList.remove('theme-dark', 'theme-neon', 'theme-emerald');
    if (themeId === 'theme-dark') {
      container.classList.add('theme-dark');
      container.style.backgroundColor = '#0f172a';
    } else if (themeId === 'theme-neon') {
      container.classList.add('theme-neon');
      container.style.backgroundColor = '#1e1b4b';
    } else if (themeId === 'theme-emerald') {
      container.classList.add('theme-emerald');
      container.style.backgroundColor = '#064e3b';
    } else {
      container.style.backgroundColor = '#f8fafc';
    }
  },

  updateHeaderGold(gold: number) {
    const goldEl = document.getElementById('menu-gold');
    if (goldEl) {
      goldEl.innerText = gold.toString();
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

  renderProfileModal(stats: ProfileStats, badges: BadgeStatus[]) {
    const nameEl = document.getElementById('profile-username');
    const levelEl = document.getElementById('profile-level-badge');
    const goldEl = document.getElementById('profile-gold-badge');
    const completedEl = document.getElementById('profile-stat-completed');
    const basitEl = document.getElementById('profile-best-basit');
    const ortaEl = document.getElementById('profile-best-orta');
    const zorEl = document.getElementById('profile-best-zor');
    const badgesCountEl = document.getElementById('profile-badges-count');
    const badgesPreviewEl = document.getElementById('profile-badges-preview');

    if (nameEl) nameEl.innerText = stats.username;
    if (levelEl) levelEl.innerText = `🏅 Seviye ${stats.level}`;
    if (goldEl) goldEl.innerText = `🪙 ${stats.gold} Altın`;
    if (completedEl) completedEl.innerText = stats.totalCompleted.toString();
    if (basitEl) basitEl.innerText = stats.bestBasitFormatted;
    if (ortaEl) ortaEl.innerText = stats.bestOrtaFormatted;
    if (zorEl) zorEl.innerText = stats.bestZorFormatted;

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

  renderLeaderboard(players: Player[], filter: 'gold' | 'time') {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;
    if (players.length === 0) {
      listEl.innerHTML = `<div class="text-center text-slate-400 py-10 font-bold">Kayıt bulunamadı.</div>`;
      return;
    }
    listEl.innerHTML = players.map((p, i) => `
      <div class="flex justify-between items-center p-3 bg-white border rounded-xl shadow-sm">
        <span class="font-bold text-slate-800 text-sm">${i+1}. ${p.username}</span>
        <span class="font-black text-amber-600 text-sm">🪙 ${p.gold}</span>
      </div>
    `).join('');
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
            <div class="w-8 h-8 rounded-xl border" style="background-color: ${item.previewColor}"></div>
            <div>
              <p class="font-black text-slate-800 text-sm">${item.name}</p>
              <p class="text-[10px] text-slate-400 font-bold">${isPurchased ? 'Satın Alındı' : 'Mağaza Ürünü'}</p>
            </div>
          </div>
          <button data-shop-id="${item.id}" class="shop-action-btn ${btnClass} px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95">
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
      let statusBtn = `<span class="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">Kilitli</span>`;

      if (b.isClaimed) {
        statusBtn = `<span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">Alındı ✓</span>`;
      } else if (b.isUnlocked) {
        statusBtn = `<button data-badge-id="${b.id}" class="claim-badge-btn bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow active:scale-95 transition-transform animate-pulse">+${b.rewardGold} 🪙 Al</button>`;
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
      cell.classList.add('bg-rose-500', 'text-white', 'animate-pulse');
      setTimeout(() => {
        cell.classList.remove('bg-rose-500', 'text-white', 'animate-pulse');
      }, 600);
    }
  },

  renderBoard(board: number[][], onCellClick: (r: number, c: number) => void, selectedR: number, selectedC: number, initialBoard?: number[][]) {
    const boardEl = document.getElementById('sudoku-grid');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    board.forEach((row, r) => {
      row.forEach((val, c) => {
        const cell = document.createElement('div');
        const isSelected = r === selectedR && c === selectedC;
        const isInitial = initialBoard ? initialBoard[r][c] !== 0 : false;

        let bgClass = 'bg-white';
        let textClass = 'text-indigo-600 font-bold';

        if (isInitial) {
          bgClass = 'bg-slate-200';
          textClass = 'text-slate-900 font-black cursor-not-allowed';
        } else if (isSelected) {
          bgClass = 'bg-indigo-300';
        }

        // 3x3 Blok görsel ayrımları (3. ve 6. sütun sağına, 3. ve 6. satır altına kalın kenarlık)
        const borderRight = (c === 2 || c === 5) ? 'border-r-4 border-r-slate-800' : '';
        const borderBottom = (r === 2 || r === 5) ? 'border-b-4 border-b-slate-800' : '';

        cell.className = `w-9 h-9 sm:w-11 sm:h-11 aspect-square border flex items-center justify-center text-lg select-none cursor-pointer active:scale-95 transition-all ${bgClass} ${textClass} ${borderRight} ${borderBottom}`;
        cell.innerText = val !== 0 ? val.toString() : '';
        cell.onclick = () => onCellClick(r, c);
        boardEl.appendChild(cell);
      });
    });
  },

  renderNumpad(onNumberClick: (num: number) => void) {
    const grid = document.getElementById('numpad-grid');
    if (!grid) return;
    grid.innerHTML = '';
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(num => {
        const btn = document.createElement('button');
        btn.className = "bg-white p-3 rounded-xl shadow-sm border font-black text-xl hover:bg-indigo-100 text-slate-800 active:scale-95 transition-transform";
        btn.innerText = num === 0 ? 'Sil' : num.toString();
        btn.onclick = () => onNumberClick(num);
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
