import { menuTemplate } from './templates/menu';
import { mapTemplate } from './templates/map';
import { customModeTemplate } from './templates/custom';
import { leaderboardTemplate } from './templates/leaderboard';
import { shopTemplate } from './templates/shop';
import { usernameModalTemplate } from './templates/usernameModal';
import { Player } from '../engine/leaderboard';

export const UIManager = {
  mountUI() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div id="container" class="w-full max-w-[480px] h-[100dvh] bg-slate-50 flex flex-col relative overflow-hidden">
        ${menuTemplate}
        ${mapTemplate}
        ${customModeTemplate}
        ${leaderboardTemplate}
        ${shopTemplate}
        ${usernameModalTemplate}
        <div id="game-view" class="hidden flex-col items-center p-6 w-full h-full">
            <div class="w-full flex justify-between items-center mb-4">
                <button id="btn-back-menu" class="bg-slate-200 px-4 py-2 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-300">⬅ Menü</button>
                <h2 id="game-title" class="font-black text-slate-800 text-lg">Seviye 1</h2>
                <div id="game-timer" class="font-mono font-bold text-lg text-indigo-700">00:00</div>
            </div>
            <div id="sudoku-grid" class="grid grid-cols-9 gap-[1px] bg-slate-800 p-[1px] rounded-lg shadow-xl mb-4"></div>
            <div class="flex gap-2 mb-4">
                <button id="btn-hint" class="bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-2 rounded-xl font-bold text-sm shadow">💡 İpucu (10🪙)</button>
            </div>
            <div id="numpad-grid" class="grid grid-cols-5 gap-2 w-full max-w-[300px]"></div>
        </div>

        <!-- Zafer Modalı (Alert yerine şık oyun içi kutlama) -->
        <div id="victory-modal" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[80] p-4 backdrop-blur-md">
          <div class="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative">
            <div class="text-6xl mb-2 animate-bounce">🏆</div>
            <h3 class="text-2xl font-black text-slate-800 mb-1">Tebrikler!</h3>
            <p class="text-xs font-bold text-slate-500 mb-4" id="victory-subtitle">Seviye başarıyla tamamlandı!</p>
            
            <div class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-around items-center mb-5">
                <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase">Süre</p>
                    <p class="text-base font-black text-slate-700" id="victory-time">00:00</p>
                </div>
                <div class="w-[1px] h-8 bg-slate-200"></div>
                <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase">Hata</p>
                    <p class="text-base font-black text-slate-700" id="victory-errors">0/3</p>
                </div>
                <div class="w-[1px] h-8 bg-slate-200"></div>
                <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase">Kazanılan</p>
                    <p class="text-base font-black text-amber-600" id="victory-reward">+20 🪙</p>
                </div>
            </div>

            <div class="flex flex-col gap-2.5 w-full">
                <button id="btn-victory-next" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl shadow-lg active:scale-95 transition-all text-sm">
                    Sonraki Seviyeye Geç ➔
                </button>
                <button id="btn-victory-menu" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl active:scale-95 transition-all text-sm">
                    Ana Menüye Dön
                </button>
            </div>
          </div>
        </div>

        <!-- Oyun Bitti Modalı -->
        <div id="gameover-modal" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[80] p-4 backdrop-blur-md">
          <div class="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative">
            <div class="text-6xl mb-2">💥</div>
            <h3 class="text-2xl font-black text-slate-800 mb-1">Oyun Bitti</h3>
            <p class="text-xs font-bold text-rose-500 mb-4">3 hata sınırına ulaştın.</p>
            <div class="flex flex-col gap-2.5 w-full">
                <button id="btn-gameover-retry" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl shadow-lg active:scale-95 transition-all text-sm">
                    Tekrar Dene 🔄
                </button>
                <button id="btn-gameover-menu" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl active:scale-95 transition-all text-sm">
                    Ana Menüye Dön
                </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  updateUI(level: number, gold: number, username: string) {
    const goldEl = document.getElementById('menu-gold');
    if (goldEl) goldEl.innerText = gold.toString();
    const playerEl = document.getElementById('menu-player-name');
    if (playerEl) playerEl.innerText = username;
  },

  showVictoryModal(level: number, diff: string, timeStr: string, errorCount: number, reward: number) {
    const modal = document.getElementById('victory-modal');
    const sub = document.getElementById('victory-subtitle');
    const timeEl = document.getElementById('victory-time');
    const errEl = document.getElementById('victory-errors');
    const rewEl = document.getElementById('victory-reward');
    if (!modal) return;

    if (sub) sub.innerText = `Seviye ${level} (${diff.toUpperCase()}) tamamlandı!`;
    if (timeEl) timeEl.innerText = timeStr;
    if (errEl) errEl.innerText = `${errorCount}/3`;
    if (rewEl) rewEl.innerText = `+${reward} 🪙`;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  hideVictoryModal() {
    const modal = document.getElementById('victory-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  },

  showGameOverModal(errorCount: number) {
    const modal = document.getElementById('gameover-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  hideGameOverModal() {
    const modal = document.getElementById('gameover-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  },

  renderMap(currentLevel: number, startFocusLevel: number) {
    const container = document.getElementById('map-nodes');
    if (!container) return;
    container.innerHTML = '';
    const start = Math.max(1, startFocusLevel - 10);
    const end = Math.min(1000, start + 60);

    for (let level = start; level <= end; level++) {
        const isUnlocked = level <= currentLevel || level === 1 || level === 301 || level === 701;
        const isFocus = level === startFocusLevel;
        const btn = document.createElement('button');
        btn.dataset.level = level.toString();
        btn.innerText = level.toString();
        btn.className = `w-12 h-12 rounded-full font-black transition-all ${isFocus ? 'bg-indigo-600 text-white animate-pulse ring-4 ring-indigo-200' : isUnlocked ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-300 text-slate-500 opacity-50'} ${isUnlocked ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`;
        if (!isUnlocked) btn.disabled = true;
        container.appendChild(btn);
    }
  },

  renderLeaderboard(players: Player[], _filter: 'gold' | 'time') {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;
    if (players.length === 0) {
      listEl.innerHTML = `
        <div class="text-center text-slate-400 py-10 font-bold">Kayıtlı oyuncu bulunamadı.</div>
      `;
      return;
    }
    listEl.innerHTML = players.map((p, i) => `
      <div class="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-100 transition-colors">
        <div class="flex items-center gap-2.5">
          <span class="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-400 text-slate-900 shadow-sm' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}">${i + 1}</span>
          <div>
            <p class="font-bold text-slate-800 text-sm leading-tight">${p.username}</p>
            <p class="text-[10px] text-slate-400 font-bold">Seviye ${p.level}</p>
          </div>
        </div>
        <span class="text-xs font-black bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">🪙 ${p.gold}</span>
      </div>
    `).join('');
  },

  renderBoard(
    board: number[][],
    onCellClick?: (r: number, c: number) => void,
    selectedR: number = -1,
    selectedC: number = -1
  ) {
    const boardEl = document.getElementById('sudoku-grid');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    board.forEach((row, r) => {
      row.forEach((val, c) => {
        const cell = document.createElement('div');
        const isSelected = r === selectedR && c === selectedC;
        const isFixed = val !== 0; 
        const borderRight = (c === 2 || c === 5) ? 'border-r-2 border-r-slate-800' : '';
        const borderBottom = (r === 2 || r === 5) ? 'border-b-2 border-b-slate-800' : '';
        cell.className = `w-9 h-9 border flex items-center justify-center font-bold text-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-300' : 'bg-white'} ${isFixed ? 'text-slate-900 font-black' : 'text-indigo-600'} ${borderRight} ${borderBottom}`;
        cell.innerText = val !== 0 ? val.toString() : '';
        if (onCellClick) {
          cell.onclick = () => onCellClick(r, c);
        }
        boardEl.appendChild(cell);
      });
    });
  },

  showError(r: number, c: number) {
    const boardEl = document.getElementById('sudoku-grid');
    if (!boardEl) return;
    const index = r * 9 + c;
    const cell = boardEl.children[index] as HTMLElement;
    if (cell) {
      cell.classList.add('!bg-red-400', '!text-white');
      setTimeout(() => {
        cell.classList.remove('!bg-red-400', '!text-white');
      }, 400);
    }
  },

  renderNumpad(onNumberClick: (num: number) => void) {
    const grid = document.getElementById('numpad-grid');
    if (!grid) return;
    grid.innerHTML = '';
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(num => {
        const btn = document.createElement('button');
        btn.className = "bg-white p-3 rounded-xl shadow-sm border font-black text-xl hover:bg-indigo-100 transition-colors";
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
