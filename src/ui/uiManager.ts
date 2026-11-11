import { menuTemplate } from './templates/menu';
import { mapTemplate } from './templates/map';
import { customModeTemplate } from './templates/custom';
import { leaderboardTemplate } from './templates/leaderboard';
import { shopTemplate } from './templates/shop';
import { usernameModalTemplate } from './templates/usernameModal';
import { Player, SpeedRecord } from '../engine/leaderboard';

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
            <div class="w-full flex justify-between items-center mb-3">
                <button id="btn-back-menu" class="bg-slate-200 px-4 py-2 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-300">⬅ Menü</button>
                <div class="text-center">
                    <h2 id="game-title" class="font-black text-slate-800 text-base leading-tight">Seviye 1</h2>
                    <div id="game-errors" class="text-xs font-bold text-rose-500 flex items-center justify-center gap-1 mt-0.5">
                        <span>❤️</span> Hata: <span id="game-error-count">0</span>/5
                    </div>
                </div>
                <div class="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
                    <span class="text-xs">⏱</span>
                    <div id="game-timer" class="font-mono font-black text-base text-indigo-700">00:00</div>
                </div>
            </div>
            
            <div id="sudoku-grid" class="grid grid-cols-9 gap-[1px] bg-slate-800 p-[1px] rounded-lg shadow-xl mb-3"></div>
            
            <!-- İpucu & Not Alma Kontrolleri -->
            <div class="flex gap-2.5 mb-3 w-full max-w-[340px] justify-between items-center">
                <button id="btn-hint" class="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-900 py-2.5 px-3 rounded-xl font-black text-xs shadow flex items-center justify-center gap-1.5 transition-all active:scale-95">
                    <span>💡</span> İpucu (10🪙)
                </button>
                <button id="btn-toggle-notes" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-3 rounded-xl font-black text-xs shadow flex items-center justify-center gap-1.5 border border-slate-200 transition-all active:scale-95">
                    <span>✏️</span> Not Modu: <span id="notes-status-text" class="text-slate-500">KAPALI</span>
                </button>
            </div>

            <!-- Sayı Pad'i (Kalan Sayı Göstergeli) -->
            <div id="numpad-grid" class="grid grid-cols-5 gap-2 w-full max-w-[320px]"></div>
        </div>

        <!-- 5 Hata Sınırı Modalı (Devam Et veya Baştan Al) -->
        <div id="error-limit-modal" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[85] p-4 backdrop-blur-md">
          <div class="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative">
            <div class="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl mb-3 shadow-inner">💔</div>
            <h3 class="text-2xl font-black text-slate-800 mb-1">5 Hata Sınırına Ulaştınız!</h3>
            <p class="text-xs text-slate-500 mb-5 font-medium">Bu bulmacada 5 hata yaptınız. Nasıl devam etmek istersiniz?</p>

            <div class="flex flex-col gap-3 w-full mb-3">
                <button id="btn-continue-with-gold" class="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-2xl p-4 text-left active:scale-[0.98] transition-all shadow-md group flex justify-between items-center border border-amber-400">
                    <div>
                        <div class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-100 mb-0.5">
                            <span>🪙 50 Altın</span> • <span>3 Can Kazan</span>
                        </div>
                        <span class="text-base font-black block leading-tight">Kaldığın Yerden Devam Et</span>
                        <span class="text-[11px] text-amber-100">Tahtanı ve süreni kaybetmeden oyna</span>
                    </div>
                    <span class="text-2xl group-hover:translate-x-1 transition-transform">➔</span>
                </button>

                <button id="btn-restart-level" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl p-4 text-left active:scale-[0.98] transition-all border border-slate-200 group flex justify-between items-center">
                    <div>
                        <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Ücretsiz</div>
                        <span class="text-base font-black block leading-tight text-slate-800">Oyunu Baştan Başlat</span>
                        <span class="text-[11px] text-slate-500">Tahtayı sıfırlar, hataları 0/5 yapar</span>
                    </div>
                    <span class="text-2xl group-hover:rotate-45 transition-transform text-slate-400">🔄</span>
                </button>
            </div>

            <button id="btn-error-menu" class="w-full text-xs font-bold text-slate-400 hover:text-slate-600 py-2">
                Ana Menüye Dön
            </button>
          </div>
        </div>

        <!-- Zafer Modalı -->
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
                    <p class="text-base font-black text-slate-700" id="victory-errors">0/5</p>
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
            <p class="text-xs font-bold text-rose-500 mb-4">Hata hakkınız doldu.</p>
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

  updateErrorCount(count: number, _maxCount: number = 5) {
    const el = document.getElementById('game-error-count');
    if (el) el.innerText = count.toString();
  },

  updateNotesModeUI(isActive: boolean) {
    const btn = document.getElementById('btn-toggle-notes');
    const text = document.getElementById('notes-status-text');
    if (!btn || !text) return;

    if (isActive) {
      btn.className = "flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3 rounded-xl font-black text-xs shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 border border-indigo-500 transition-all active:scale-95";
      text.innerText = "AÇIK";
      text.className = "text-amber-300 font-black";
    } else {
      btn.className = "flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-3 rounded-xl font-black text-xs shadow flex items-center justify-center gap-1.5 border border-slate-200 transition-all active:scale-95";
      text.innerText = "KAPALI";
      text.className = "text-slate-500 font-black";
    }
  },

  showErrorLimitModal() {
    const modal = document.getElementById('error-limit-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  hideErrorLimitModal() {
    const modal = document.getElementById('error-limit-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
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
    if (errEl) errEl.innerText = `${errorCount}/5`;
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

  showGameOverModal(_errorCount: number) {
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
            <p class="text-[10px] text-slate-400 font-bold">Seviye ${p.level}${typeof p.total_completed === 'number' && p.total_completed > 0 ? ` • ${p.total_completed} Oyun` : ''}</p>
          </div>
        </div>
        <span class="text-xs font-black bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">🪙 ${p.gold}</span>
      </div>
    `).join('');
  },

  renderSpeedLeaderboard(records: SpeedRecord[]) {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;
    if (records.length === 0) {
      listEl.innerHTML = `
        <div class="text-center text-slate-400 py-10 font-bold">
          <p class="text-2xl mb-1">⏱</p>
          Henüz tamamlanmış süre kaydı bulunmuyor.
        </div>
      `;
      return;
    }
    listEl.innerHTML = records.map((r, i) => `
      <div class="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-100 transition-colors">
        <div class="flex items-center gap-2.5">
          <span class="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-400 text-slate-900 shadow-sm' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}">${i + 1}</span>
          <div>
            <p class="font-bold text-slate-800 text-sm leading-tight">${r.username}</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-[10px] font-bold ${r.difficulty === 'zor' ? 'text-rose-500' : r.difficulty === 'orta' ? 'text-amber-600' : 'text-emerald-600'} uppercase">Seviye ${r.level} (${r.difficulty})</span>
              ${r.errors > 0 ? `<span class="text-[9px] text-slate-400 font-bold">• ${r.errors} Hata</span>` : `<span class="text-[9px] text-emerald-600 font-bold">• Kusursuz</span>`}
            </div>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs font-black bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100 inline-block font-mono">⏱ ${r.timeFormatted}</span>
        </div>
      </div>
    `).join('');
  },

  renderBoard(
    board: number[][],
    initialBoard?: number[][],
    notes?: { [key: string]: number[] },
    onCellClick?: (r: number, c: number) => void,
    selectedR: number = -1,
    selectedC: number = -1
  ) {
    const boardEl = document.getElementById('sudoku-grid');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    const selectedVal = (selectedR >= 0 && selectedC >= 0 && board[selectedR]) ? board[selectedR][selectedC] : 0;

    board.forEach((row, r) => {
      row.forEach((val, c) => {
        const cell = document.createElement('div');
        const isOriginal = initialBoard ? initialBoard[r][c] !== 0 : false;
        const isSelected = r === selectedR && c === selectedC;
        const hasValue = val !== 0;
        const isSameValue = (selectedVal !== 0 && val === selectedVal && !isSelected);

        // 3x3 kutu sınırları
        const borderRight = (c === 2 || c === 5) ? 'border-r-2 border-r-slate-800' : '';
        const borderBottom = (r === 2 || r === 5) ? 'border-b-2 border-b-slate-800' : '';

        // Hücre Renk Stilleri:
        let bgTextClass = '';
        if (isSelected) {
          bgTextClass = '!bg-indigo-600 !text-white ring-2 ring-indigo-400 ring-offset-1 z-10';
        } else if (isSameValue) {
          bgTextClass = isOriginal ? 'bg-indigo-100 text-slate-900 font-black' : 'bg-indigo-100 text-indigo-600 font-black';
        } else if (isOriginal) {
          bgTextClass = 'bg-slate-100 text-slate-900 font-black';
        } else if (hasValue) {
          bgTextClass = 'bg-white text-indigo-600 font-black';
        } else {
          bgTextClass = 'bg-white';
        }

        cell.className = `w-9 h-9 border border-slate-200 flex items-center justify-center text-lg select-none cursor-pointer transition-colors relative overflow-hidden ${bgTextClass} ${borderRight} ${borderBottom}`;

        if (hasValue) {
          cell.innerText = val.toString();
        } else {
          // Hücre boş ise ve notlar varsa 3x3 küçük aday matrisi göster
          const key = `${r}-${c}`;
          const cellNotes = (notes && notes[key]) ? notes[key] : [];
          if (cellNotes.length > 0) {
            cell.innerHTML = `
              <div class="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5 pointer-events-none">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `
                  <span class="flex items-center justify-center text-[7.5px] font-black leading-none ${cellNotes.includes(n) ? (isSelected ? 'text-white' : 'text-indigo-600') : 'text-transparent'}">
                    ${cellNotes.includes(n) ? n : ''}
                  </span>
                `).join('')}
              </div>
            `;
          } else {
            cell.innerText = '';
          }
        }

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
      cell.classList.add('!bg-rose-500', '!text-white', 'animate-pulse');
      setTimeout(() => {
        cell.classList.remove('!bg-rose-500', '!text-white', 'animate-pulse');
      }, 500);
    }
  },

  renderNumpad(
    onNumberClick: (num: number) => void,
    counts?: { [num: number]: number }
  ) {
    const grid = document.getElementById('numpad-grid');
    if (!grid) return;
    grid.innerHTML = '';

    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(num => {
        const btn = document.createElement('button');

        if (num === 0) {
          // Sil Butonu
          btn.className = "bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl shadow-sm border border-slate-200 font-black flex flex-col items-center justify-center transition-all active:scale-95";
          btn.innerHTML = `
            <span class="text-base font-black leading-none mb-0.5">Sil</span>
            <span class="text-[9px] font-bold text-slate-400 leading-none">⌫</span>
          `;
        } else {
          const placed = counts ? (counts[num] || 0) : 0;
          const remaining = Math.max(0, 9 - placed);
          const isComplete = remaining === 0;

          if (isComplete) {
            btn.className = "bg-emerald-50 border border-emerald-300 text-emerald-700 p-2 rounded-xl shadow-sm font-black flex flex-col items-center justify-center transition-all opacity-60";
            btn.innerHTML = `
              <span class="text-base font-black leading-none mb-0.5">${num}</span>
              <span class="text-[9px] font-black text-emerald-600 leading-none">✓ Bitti</span>
            `;
          } else {
            btn.className = "bg-white hover:bg-indigo-50 text-slate-800 border border-slate-200 p-2 rounded-xl shadow-sm font-black flex flex-col items-center justify-center transition-all active:scale-95";
            btn.innerHTML = `
              <span class="text-base font-black leading-none mb-0.5">${num}</span>
              <span class="text-[9px] font-bold text-slate-400 leading-none">${remaining} kaldı</span>
            `;
          }
        }

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
