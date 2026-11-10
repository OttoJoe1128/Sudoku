import { menuTemplate } from './templates/menu';
import { mapTemplate } from './templates/map';
import { customModeTemplate } from './templates/custom';
import { leaderboardTemplate } from './templates/leaderboard';
import { shopTemplate } from './templates/shop';
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
      </div>
    `;
    this.navigate('menu');
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

    if (players.length === 0) {
        listEl.innerHTML = '<div class="text-center text-slate-400 py-10">Henüz kayıt yok.</div>';
        return;
    }

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

  navigate(viewId: 'menu' | 'map' | 'custom') {
    const views = {
      menu: document.getElementById('view-menu'),
      map: document.getElementById('view-map'),
      custom: document.getElementById('view-custom')
    };

    Object.entries(views).forEach(([id, el]) => {
      if (!el) return;
      if (id === viewId) {
        el.classList.remove('hidden');
        el.classList.add('flex');
      } else {
        el.classList.add('hidden');
        el.classList.remove('flex');
      }
    });
  }
};
