import { Icons } from '../../../design/icons';

export function renderFloatingBottomDock(): string {
  return `
    <!-- FLOATING CURVED GLASS ARC DOCK (Ekranın En Altında Süzülen Kavisli Cam Dok) -->
    <div class="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-3 sm:px-4 z-40" style="bottom: max(env(safe-area-inset-bottom, 0px), 0.75rem);">
        <div class="bg-[#0E1729]/85 backdrop-blur-xl border-2 border-[var(--border-strong)] p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden">
            <!-- Glow Beam Track Spotlight -->
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent blur-xs pointer-events-none"></div>

            <div class="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button id="btn-leaderboard" class="hover:bg-[#172540]/60 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-center font-black text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] min-w-0 cursor-pointer border border-transparent hover:border-[var(--border-subtle)]">
                    <span class="text-base sm:text-lg text-[var(--accent-gold)] shrink-0 drop-shadow">${Icons.trophy}</span>
                    <span class="text-[9px] sm:text-[10px] truncate max-w-full drop-shadow" data-i18n="nav_rank">Sıralama</span>
                </button>
                <button id="btn-achievements" class="hover:bg-[#172540]/60 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] relative min-w-0 cursor-pointer border border-transparent hover:border-[var(--border-subtle)]">
                    <span class="text-base sm:text-lg text-[var(--accent-gold)] shrink-0 drop-shadow">${Icons.crown}</span>
                    <span class="text-[9px] sm:text-[10px] truncate max-w-full drop-shadow" data-i18n="menu_badges">Rozetler</span>
                    <span id="badge-notify-dot" class="hidden absolute top-2 right-4 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shadow"></span>
                </button>
                <button id="btn-shop" class="hover:bg-[#172540]/60 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] min-w-0 cursor-pointer border border-transparent hover:border-[var(--border-subtle)]">
                    <span class="text-base sm:text-lg text-[var(--accent-cyan)] shrink-0 drop-shadow">${Icons.dice}</span>
                    <span class="text-[9px] sm:text-[10px] truncate max-w-full drop-shadow" data-i18n="menu_shop">Mağaza</span>
                </button>
            </div>
        </div>
    </div>
  `;
}
