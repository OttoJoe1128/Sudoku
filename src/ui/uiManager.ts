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
                <button id="btn-back-menu" class="bg-slate-200 px-4 py-2 rounded-xl font-bold text-sm">⬅ Menü</button>
                <h2 id="game-title" class="font-black text-slate-800 text-lg">Seviye 1</h2>
                <div id="game-timer" class="font-mono font-bold text-lg">00:00</div>
            </div>
            <div id="sudoku-grid" class="grid grid-cols-9 gap-[1px] bg-slate-800 p-[1px] rounded-lg shadow-xl mb-4"></div>
            <div class="flex gap-2 mb-4">
                <button id="btn-hint" class="bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-2 rounded-xl font-bold text-sm shadow">💡 İpucu (10🪙)</button>
            </div>
            <div id="numpad-grid" class="grid grid-cols-5 gap-2 w-full max-w-[300px]"></div>
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
