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
                <div id="game-timer" class="font-mono font-bold">00:00</div>
            </div>
            <div id="sudoku-grid" class="grid grid-cols-9 gap-[1px] bg-slate-800 p-[1px] rounded-lg shadow-xl"></div>
            <div id="numpad-grid" class="grid grid-cols-5 gap-2 mt-6 w-full max-w-[300px]"></div>
        </div>
      </div>
    `;
  },

  renderMap(currentLevel: number) {
    const container = document.getElementById('map-nodes');
    if (!container) return;
    container.innerHTML = Array.from({length: 1000}, (_, i) => i + 1).map(level => {
        const isUnlocked = level <= currentLevel;
        const isCurrent = level === currentLevel;
        const onClick = isUnlocked ? `onclick="window.startJourney(${level})"` : 'disabled';
        return `
            <button ${onClick} class="w-12 h-12 rounded-full font-black transition-all ${isCurrent ? 'bg-indigo-600 text-white animate-pulse' : isUnlocked ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'} ${isUnlocked ? '' : 'cursor-not-allowed'}">
                ${level}
            </button>
        `;
    }).join('');
    setTimeout(() => {
        document.querySelector('.animate-pulse')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  },

  renderLeaderboard(players: Player[], filter: 'gold' | 'time') {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;
    let sorted = [...players];
    if (filter === 'gold') sorted.sort((a,b) => b.gold - a.gold);
    listEl.innerHTML = sorted.map((p, i) => `
      <div class="flex justify-between p-3 bg-white border rounded-xl shadow-sm">
        <span class="font-bold">${i+1}. ${p.username}</span>
        <span>🪙 ${p.gold}</span>
      </div>
    `).join('');
  },

  renderBoard(board: number[][], onCellClick: (r: number, c: number) => void, selectedR: number, selectedC: number) {
    const boardEl = document.getElementById('sudoku-grid');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    board.forEach((row, r) => {
      row.forEach((val, c) => {
        const cell = document.createElement('div');
        const isSelected = r === selectedR && c === selectedC;
        const isFixed = val !== 0; 
        cell.className = `w-9 h-9 border flex items-center justify-center font-bold text-lg cursor-pointer transition-colors
          ${isSelected ? 'bg-indigo-300' : 'bg-white'} 
          ${isFixed ? 'text-slate-900 font-black' : 'text-indigo-600'}`;
        cell.innerText = val !== 0 ? val.toString() : '';
        cell.onclick = () => onCellClick(r, c);
        boardEl.appendChild(cell);
      });
    });
  },

  renderNumpad(onNumberClick: (num: number) => void) {
    const gameView = document.getElementById('game-view');
    let numpadEl = document.getElementById('numpad-grid');
    if (!numpadEl) {
        numpadEl = document.createElement('div');
        numpadEl.id = 'numpad-grid';
        numpadEl.className = 'grid grid-cols-5 gap-2 mt-6 w-full max-w-[300px]';
        gameView?.appendChild(numpadEl);
    }
    numpadEl.innerHTML = '';
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(num => {
        const btn = document.createElement('button');
        btn.className = 'bg-white p-3 rounded-xl shadow border font-black text-xl hover:bg-indigo-100 transition-colors';
        btn.innerText = num === 0 ? 'Sil' : num.toString();
        btn.onclick = () => onNumberClick(num);
        numpadEl.appendChild(btn);
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
