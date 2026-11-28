export function renderBentoGridModes(): string {
  return `
    <!-- KATMAN 3: TAKTİKSEL OYUN MODLARI (Diagonal Kinetic Glass Pods — 2x2 Matris) -->
    <div class="grid grid-cols-2 gap-1.5 sm:gap-2 w-full flex-1 my-auto max-h-[145px]">
        <!-- 1. ⚔️ Arena Düello Podu -->
        <button id="btn-open-match" class="polygon-pod-left spatial-glass-card border-[var(--border-strong)] p-2 sm:p-2.5 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-xl group min-w-0 relative overflow-hidden">
            <div class="flex items-center justify-between w-full z-10">
                <span class="text-xs sm:text-sm font-black text-[var(--accent-gold-bright)] flex items-center gap-1 drop-shadow">
                    <svg class="w-3.5 h-3.5 text-[var(--accent-gold-bright)] shrink-0 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    <span>ARENA</span>
                </span>
                <span class="text-[8px] sm:text-[8.5px] font-mono font-black bg-[#0E1729] text-[var(--accent-gold)] px-1 py-0.2 rounded border border-[var(--border-subtle)] shadow">100 🪙</span>
            </div>
            <div class="mt-0.5 z-10">
                <span class="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] block leading-tight truncate" data-i18n="menu_arena_card_sub">Live & Ghost PvP</span>
            </div>
        </button>

        <!-- 2. 🌀 Serbest Mod Podu -->
        <button id="btn-new-game" class="polygon-pod-right spatial-glass-card border-[var(--border-strong)] p-2 sm:p-2.5 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-xl group min-w-0">
            <div class="flex items-center justify-between w-full z-10">
                <span class="text-xs sm:text-sm font-black text-[var(--text-primary)] flex items-center gap-1 drop-shadow" data-i18n="menu_new_game_title">FREE MODE</span>
                <span class="text-[8px] sm:text-[8.5px] font-mono font-bold bg-[#0E1729] text-[var(--text-secondary)] px-1 py-0.2 rounded border border-[var(--border-subtle)] shadow">5 Modes</span>
            </div>
            <div class="mt-0.5 z-10">
                <span class="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] block leading-tight truncate" data-i18n="menu_new_game_sub">Classic, Killer, Samurai</span>
            </div>
        </button>

        <!-- 3. 📜 Sudoku Akademisi Podu -->
        <button id="btn-menu-open-academy" class="polygon-pod-left spatial-glass-card border-cyan-500/40 p-2 sm:p-2.5 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-xl group min-w-0">
            <div class="flex items-center justify-between w-full z-10">
                <span class="text-xs sm:text-sm font-black text-[var(--accent-cyan)] flex items-center gap-1 drop-shadow" data-i18n="menu_academy_card_title">ACADEMY</span>
                <span class="text-[8px] sm:text-[8.5px] font-mono font-bold bg-[#0E1729] text-[var(--accent-cyan)] px-1 py-0.2 rounded border border-cyan-500/30 shadow">20 Lessons</span>
            </div>
            <div class="mt-0.5 z-10">
                <span class="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] block leading-tight truncate" data-i18n="menu_academy_card_sub">Simulator & Techniques</span>
            </div>
        </button>

        <!-- 4. 🎒 Yetenekler & Rün Ağacı Podu -->
        <button id="btn-menu-open-abilities" class="polygon-pod-right spatial-glass-card border-purple-500/40 p-2 sm:p-2.5 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-xl group min-w-0">
            <div class="flex items-center justify-between w-full z-10">
                <span class="text-xs sm:text-sm font-black text-purple-400 flex items-center gap-1 drop-shadow" data-i18n="menu_abilities_card_title">ABILITIES</span>
                <span class="text-[8px] sm:text-[8.5px] font-mono font-bold bg-[#0E1729] text-purple-300 px-1 py-0.2 rounded border border-purple-500/30 shadow">Rune Tree</span>
            </div>
            <div class="mt-0.5 z-10">
                <span class="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] block leading-tight truncate" data-i18n="menu_abilities_card_sub">5 Spells & 25 Tiers</span>
            </div>
        </button>
    </div>
  `;
}
