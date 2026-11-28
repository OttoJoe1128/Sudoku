export function renderLiveOpsCapsules(): string {
  return `
    <!-- İkili Canlı-Ops Hapları (Live-Ops Split Capsules) -->
    <div class="w-full flex gap-1.5 mt-1.5">
        <!-- Sol: 📮 Sezonluk Kartpostal -->
        <button id="btn-open-postcards" class="flex-1 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-strong)] rounded-full py-1 px-2.5 sm:px-3 flex items-center justify-between active:scale-95 transition-all cursor-pointer shadow-sm">
            <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-xs shrink-0">📮</span>
                <span id="menu-season-pill-text" class="text-[9.5px] sm:text-[10.5px] font-black text-[var(--accent-gold)] truncate" data-i18n="season_btn_menu">Season</span>
            </div>
            <span id="menu-season-stamps-count" class="text-[8.5px] font-mono font-bold bg-[var(--bg-elevated)] text-[var(--accent-gold)] px-1.5 py-0.5 rounded-full border border-[var(--border-subtle)] shrink-0">0/9</span>
        </button>

        <!-- Sağ: 👹 Klan Samurai Zindanı -->
        <button id="btn-open-clan" class="flex-1 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-rose-500/40 rounded-full py-1 px-2.5 sm:px-3 flex items-center justify-between active:scale-95 transition-all cursor-pointer shadow-sm">
            <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-xs shrink-0">⛩️</span>
                <span id="menu-clan-pill-text" class="text-[9.5px] sm:text-[10.5px] font-black text-rose-500 dark:text-rose-400 truncate" data-i18n="menu_clan_title">Clan Dungeon</span>
            </div>
            <span id="menu-clan-dust-count" class="text-[8.5px] font-mono font-bold bg-rose-500/20 text-rose-500 dark:text-rose-300 px-1.5 py-0.5 rounded-full border border-rose-500/30 shrink-0">350/500</span>
        </button>
    </div>
  `;
}
