export function renderBentoGridModes(): string {
  return `
    <!-- KATMAN 4: ASİMETRİK KİNETİK OYUN MODLARI MERKEZİ -->
    <div class="w-full flex flex-col gap-2 mt-1 z-10 mb-4">
        <!-- 1. ⚔️ Arena Düello Portalı (Yarım Genişlikli / Çapraz Kesim) -->
        <div class="flex gap-2">
            <button id="btn-open-match" class="flex-1 polygon-pod-left spatial-glass-card border-[var(--border-strong)] p-3 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-xl group min-w-0 relative overflow-hidden">
                <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/20 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/30 transition-colors"></div>
                <div class="flex items-center justify-between w-full z-10 mb-2">
                    <span class="text-sm font-black text-[var(--accent-gold-bright)] flex items-center gap-1.5 drop-shadow-md">
                        <svg class="w-4 h-4 text-[var(--accent-gold-bright)] shrink-0 inline-block drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        <span>ARENA</span>
                    </span>
                </div>
                <div class="z-10 bg-[#0E1729]/80 border border-[var(--border-subtle)] px-2 py-1 rounded-lg inline-flex flex-col items-start shadow-inner">
                    <span class="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-0.5" data-i18n="menu_arena_card_sub">Live & Ghost PvP</span>
                    <span class="text-[10px] font-mono font-black text-[var(--accent-gold)]">100 🪙 Giriş</span>
                </div>
            </button>

            <!-- 2. 🌀 Serbest Oyun Modları Portalı -->
            <button id="btn-new-game" class="flex-1 polygon-pod-right spatial-glass-card border-emerald-500/40 p-3 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-xl group min-w-0 relative overflow-hidden">
                <div class="absolute -left-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors"></div>
                <div class="flex items-center justify-between w-full z-10 mb-2">
                    <span class="text-sm font-black text-emerald-400 flex items-center gap-1.5 drop-shadow-md" data-i18n="menu_new_game_title">FREE MODE</span>
                </div>
                <div class="z-10 bg-[#0E1729]/80 border border-emerald-500/30 px-2 py-1 rounded-lg inline-flex flex-col items-start shadow-inner">
                    <span class="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-0.5" data-i18n="menu_new_game_sub">Classic, Killer, Samurai</span>
                    <span class="text-[10px] font-mono font-black text-emerald-300">5 Mod Çarkı</span>
                </div>
            </button>
        </div>

        <!-- 3. ⛩️ Klan Zindanı & Boss Kartı (Arena'nın hemen altında tam genişlik) -->
        <button id="btn-open-clan" class="w-full spatial-glass-card border-rose-500/50 p-3 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-xl relative overflow-hidden group text-left rounded-2xl">
            <!-- Arka Plan Grafiği -->
            <div class="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                <img src="/assets/clan/clan_boss_shogun.svg" class="absolute -right-8 -top-8 w-40 h-40 opacity-50 blur-sm mix-blend-screen" alt="Boss Background">
            </div>

            <div class="flex items-center gap-3 z-10">
                <div class="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shadow-inner">
                    <img src="/assets/clan/clan_boss_shogun.svg" class="w-8 h-8 object-contain drop-shadow" alt="Clan Boss" onerror="this.style.display='none'">
                </div>
                <div class="flex flex-col">
                    <span id="menu-clan-pill-text" class="text-xs font-black text-rose-400 uppercase tracking-widest drop-shadow-md" data-i18n="menu_clan_title">Clan Dungeon</span>
                    <span class="text-[9px] font-bold text-rose-200 mt-0.5">Boss Level 3 Aktif</span>
                </div>
            </div>

            <div class="z-10 bg-[#0E1729]/80 border border-rose-500/40 px-2 py-1 rounded-lg text-center shadow-inner">
                <span class="text-[8px] font-bold text-rose-300 uppercase block mb-0.5">Toplanan Toz</span>
                <span id="menu-clan-dust-count" class="text-[10px] font-mono font-black text-rose-400 drop-shadow">350/500</span>
            </div>
        </button>
    </div>
  `;
}
