import { Icons } from '../../../design/icons';

export function renderFloatingBottomDock(): string {
  return `
    <!-- Floating Bottom Dock (Ekranın En Altındaki Alt Bar: 3 Eşit Sekme) -->
    <div class="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-3 sm:px-4 z-40" style="bottom: max(env(safe-area-inset-bottom, 0px), 0.75rem);">
        <div class="bg-[var(--bg-elevated)]/90 backdrop-blur-md border border-[var(--border-strong)] p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl shadow-2xl grid grid-cols-3 gap-1 sm:gap-1.5">
            <button id="btn-leaderboard" class="hover:bg-[var(--bg-card-hover)] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] min-w-0 cursor-pointer">
                <span class="text-sm sm:text-base text-[var(--accent-gold)] shrink-0">${Icons.trophy}</span>
                <span class="text-[9px] sm:text-[10px] truncate max-w-full" data-i18n="nav_rank">Sıralama</span>
            </button>
            <button id="btn-achievements" class="hover:bg-[var(--bg-card-hover)] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] relative min-w-0 cursor-pointer">
                <span class="text-sm sm:text-base text-[var(--accent-gold)] shrink-0">${Icons.crown}</span>
                <span class="text-[9px] sm:text-[10px] truncate max-w-full" data-i18n="menu_badges">Rozetler</span>
                <span id="badge-notify-dot" class="hidden absolute top-1.5 right-3 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
            <button id="btn-shop" class="hover:bg-[var(--bg-card-hover)] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] min-w-0 cursor-pointer">
                <span class="text-sm sm:text-base text-[var(--accent-cyan)] shrink-0">${Icons.dice}</span>
                <span class="text-[9px] sm:text-[10px] truncate max-w-full" data-i18n="menu_shop">Mağaza</span>
            </button>
        </div>
    </div>
  `;
}
