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
        <div id="game-view" class="hidden flex-col items-center p-6 w-full h-full">
            <div class="w-full flex justify-between items-center mb-6">
                <button id="btn-back-menu" class="bg-slate-200 px-4 py-2 rounded-xl font-bold text-sm">⬅ Menü</button>
                <h2 id="game-title" class="text-xl font-black">Sudoku</h2>
            </div>
            <div id="sudoku-grid" class="grid grid-cols-9 gap-[1px] bg-slate-800 p-[1px] rounded-lg shadow-xl"></div>
        </div>
      </div>
    `;
  },

  renderBoard(board: number[][], onCellClick: (r: number, c: number) => void, selectedR: number, selectedC: number) {
    const boardEl = document.getElementById('sudoku-grid');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    board.forEach((row, r) => {
      row.forEach((val, c) => {
        const cell = document.createElement('div');
        const isSelected = r === selectedR && c === selectedC;
        // Sabit sayı mı? (Daha önce 0'dan farklı olduğunu varsayıyoruz)
        const isFixed = val !== 0; 
        
        cell.className = `w-9 h-9 flex items-center justify-center font-bold text-lg cursor-pointer transition-colors
          ${isSelected ? 'bg-indigo-300' : 'bg-white'} 
          ${isFixed ? 'text-slate-900 font-black' : 'text-indigo-600'}`;
          
        cell.innerText = val !== 0 ? val.toString() : '';
        cell.onclick = () => onCellClick(r, c);
        boardEl.appendChild(cell);
      });
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
