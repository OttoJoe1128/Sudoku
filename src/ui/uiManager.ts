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
      <div id="container" class="w-full max-w-[480px] h-[100dvh] bg-slate-50 flex flex-col relative">
        ${menuTemplate}
        ${mapTemplate}
        ${customModeTemplate}
        ${leaderboardTemplate}
        ${shopTemplate}
        ${usernameModalTemplate}
        <div id="game-view" class="hidden flex-col items-center p-6">
            <h2 id="game-title" class="text-2xl font-black mb-4">Seviye 1</h2>
            <div id="sudoku-grid" class="grid grid-cols-9 gap-1 bg-slate-800 p-1 rounded-lg"></div>
        </div>
      </div>
    `;
  },

  toggleModal(id: string, show: boolean) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('hidden', !show);
    el.classList.toggle('flex', show);
  },

  renderLeaderboard(players: Player[]) {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;
    listEl.innerHTML = players.map((player, index) => `
      <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
        <span class="font-black text-slate-400">${index + 1}.</span>
        <span class="font-bold text-slate-700">${player.username}</span>
        <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-indigo-400">Lv ${player.level}</span>
            <span class="font-black text-amber-600">🪙 ${player.gold}</span>
        </div>
      </div>
    `).join('');
  },

  renderBoard(board: number[][], onCellClick: (r: number, c: number) => void) {
    const boardEl = document.getElementById('sudoku-grid');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    board.forEach((row, r) => {
      row.forEach((val, c) => {
        const cell = document.createElement('div');
        cell.className = 'w-10 h-10 border border-slate-300 flex items-center justify-center font-bold text-slate-700 cursor-pointer bg-white hover:bg-indigo-100';
        cell.dataset.row = r.toString();
        cell.dataset.col = c.toString();
        cell.innerText = val !== 0 ? val.toString() : '';
        cell.onclick = () => onCellClick(r, c);
        boardEl.appendChild(cell);
      });
    });
  },

  showError(r: number, c: number) {
    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`) as HTMLElement;
    if (cell) {
        cell.classList.add('bg-red-500', 'text-white', 'animate-pulse');
        setTimeout(() => cell.classList.remove('bg-red-500', 'text-white', 'animate-pulse'), 1000);
    }
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
