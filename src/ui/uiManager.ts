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
            <div class="w-full flex justify-between items-center mb-6">
                <button id="btn-back-menu" class="bg-slate-200 px-4 py-2 rounded-xl font-bold text-sm">⬅ Menü</button>
                <div id="game-timer" class="font-mono font-bold text-lg">00:00</div>
            </div>
            <h2 id="game-title" class="text-2xl font-black mb-4 text-slate-800">Seviye</h2>
            <div id="sudoku-grid" class="grid grid-cols-9 gap-[1px] bg-slate-800 p-[1px] rounded-lg shadow-xl mb-6"></div>
            <div id="numpad-grid" class="grid grid-cols-5 gap-2 w-full max-w-[320px]"></div>
        </div>
      </div>
    `;
  },

  renderMap(currentLevel: number, startFocusLevel: number) {
    const container = document.getElementById('map-nodes');
    if (!container) return;
    
    container.innerHTML = '';
    Array.from({length: 1000}, (_, i) => i + 1).forEach(level => {
        // MANTIK: Kullanıcının geldiği seviye VEYA her zorluk paketinin ilk seviyesi (1, 301, 701) her zaman açıktır.
        const isUnlocked = level <= currentLevel || level === 1 || level === 301 || level === 701;
        const isFocus = level === startFocusLevel;
        
        const btn = document.createElement('button');
        btn.dataset.level = level.toString();
        btn.innerText = level.toString();
        
        if (!isUnlocked) {
            btn.disabled = true;
            btn.className = "w-12 h-12 rounded-full font-black bg-slate-200 text-slate-400 cursor-not-allowed opacity-50";
        } else {
            btn.className = `w-12 h-12 rounded-full font-black transition-all shadow-sm ${isFocus ? 'bg-indigo-600 text-white animate-pulse ring-4 ring-indigo-200' : 'bg-emerald-500 text-white hover:scale-110'}`;
        }
        container.appendChild(btn);
    });
    
    // Gecikmeli kaydırma (DOM'un yerleşmesi için)
    setTimeout(() => {
        const active = container.querySelector('.animate-pulse');
        if (active) active.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
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
        cell.className = `w-9 h-9 border flex items-center justify-center font-bold text-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-300' : 'bg-white'} ${isFixed ? 'text-slate-900 font-black' : 'text-indigo-600'}`;
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
        btn.className = "bg-white p-3 rounded-xl shadow-sm border border-slate-200 font-black text-xl hover:bg-indigo-100 transition-colors";
        btn.innerText = num === 0 ? 'Sil' : num.toString();
        btn.onclick = () => onNumberClick(num);
        grid.appendChild(btn);
    });
  },

  showError(r: number, c: number) {
    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`) as HTMLElement;
    if (cell) {
        cell.classList.add('bg-red-500', 'text-white', 'animate-pulse');
        setTimeout(() => cell.classList.remove('bg-red-500', 'text-white', 'animate-pulse'), 1000);
    }
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
