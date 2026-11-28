export function renderBentoGridModes(): string {
  return `
    <!-- KATMAN 3: TAKTİKSEL MODLAR (Bento Grid — 2x2 Dengeli Matris) -->
    <div class="grid grid-cols-2 gap-1.5 sm:gap-2 w-full flex-1 my-auto max-h-[145px]">
        <!-- 1. ⚔️ Arena Düello Kartı -->
        <button id="btn-open-match" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-sm group min-w-0 relative overflow-hidden btn-3d-card">
            <div class="flex items-center justify-between w-full">
                <span class="text-xs sm:text-sm font-black text-[var(--accent-gold)] flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    <span>ARENA</span>
                </span>
                <span class="text-[8px] sm:text-[8.5px] font-mono font-black bg-[var(--bg-elevated)] text-[var(--accent-gold)] px-1 py-0.2 rounded border border-[var(--border-subtle)]">100 🪙</span>
            </div>
            <div class="mt-0.5">
                <span class="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] block leading-tight truncate" data-i18n="menu_arena_card_sub">Live & Ghost PvP</span>
            </div>
        </button>

        <!-- 2. 🌀 Serbest Mod Kartı -->
        <button id="btn-new-game" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-sm group min-w-0 btn-3d-card">
            <div class="flex items-center justify-between w-full">
                <span class="text-xs sm:text-sm font-black text-[var(--text-primary)] flex items-center gap-1" data-i18n="menu_new_game_title">FREE MODE</span>
                <span class="text-[8px] sm:text-[8.5px] font-mono font-bold bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-1 py-0.2 rounded border border-[var(--border-subtle)]">5 Modes</span>
            </div>
            <div class="mt-0.5">
                <span class="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] block leading-tight truncate" data-i18n="menu_new_game_sub">Classic, Killer, Samurai</span>
            </div>
        </button>

        <!-- 3. 📜 Sudoku Akademisi Kartı -->
        <button id="btn-menu-open-academy" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-sm group min-w-0 btn-3d-card">
            <div class="flex items-center justify-between w-full">
                <span class="text-xs sm:text-sm font-black text-[var(--accent-cyan)] flex items-center gap-1" data-i18n="menu_academy_card_title">ACADEMY</span>
                <span class="text-[8px] sm:text-[8.5px] font-mono font-bold bg-[var(--bg-elevated)] text-[var(--accent-cyan)] px-1 py-0.2 rounded border border-[var(--border-subtle)]">20 Lessons</span>
            </div>
            <div class="mt-0.5">
                <span class="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] block leading-tight truncate" data-i18n="menu_academy_card_sub">Simulator & Techniques</span>
            </div>
        </button>

        <!-- 4. 🎒 Yetenekler & Rün Ağacı Kartı -->
        <button id="btn-menu-open-abilities" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-sm group min-w-0 btn-3d-card">
            <div class="flex items-center justify-between w-full">
                <span class="text-xs sm:text-sm font-black text-purple-600 dark:text-purple-300 flex items-center gap-1" data-i18n="menu_abilities_card_title">ABILITIES</span>
                <span class="text-[8px] sm:text-[8.5px] font-mono font-bold bg-[var(--bg-elevated)] text-purple-600 dark:text-purple-300 px-1 py-0.2 rounded border border-[var(--border-subtle)]">Rune Tree</span>
            </div>
            <div class="mt-0.5">
                <span class="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] block leading-tight truncate" data-i18n="menu_abilities_card_sub">5 Spells & 25 Tiers</span>
            </div>
        </button>
    </div>
  `;
}
