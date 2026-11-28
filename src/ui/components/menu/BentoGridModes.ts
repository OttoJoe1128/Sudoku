export function renderBentoGridModes(): string {
  return `
    <!-- KATMAN 4: ASİMETRİK KİNETİK OYUN MODLARI MERKEZİ -->
    <div class="w-full flex flex-col gap-2.5 mt-1 z-10 mb-4">
        <!-- 1. ⚔️ Arena & 🌀 Yeni Oyun (Yan Yana Çift Bento Kartı) -->
        <div class="flex gap-2.5">
            <!-- Arena Kartı -->
            <button id="btn-open-match" class="flex-1 spatial-glass-card border-[var(--border-strong)] hover:border-[var(--accent-gold)] p-3.5 flex items-center justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-xl group min-w-0 relative overflow-hidden rounded-2xl">
                <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/15 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/25 transition-colors"></div>
                <div class="flex items-center gap-2.5 z-10 min-w-0">
                    <div class="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        <svg class="w-4 h-4 text-[var(--accent-gold-bright)] drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <span class="text-sm font-black text-[var(--accent-gold-bright)] tracking-wide drop-shadow-md truncate" data-i18n="menu_arena_card_title">Arena</span>
                </div>
            </button>

            <!-- + Yeni Oyun Kartı -->
            <button id="btn-new-game" class="flex-1 spatial-glass-card border-emerald-500/40 hover:border-emerald-400 p-3.5 flex items-center justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-xl group min-w-0 relative overflow-hidden rounded-2xl">
                <div class="absolute -left-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors"></div>
                <div class="flex items-center gap-2.5 z-10 min-w-0">
                    <div class="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner text-emerald-400 font-black text-sm group-hover:scale-110 transition-transform">
                        +
                    </div>
                    <span class="text-sm font-black text-emerald-400 tracking-wide drop-shadow-md truncate" data-i18n="menu_new_game_title">+ Yeni Oyun</span>
                </div>
            </button>
        </div>

        <!-- 2. ⛩️ Klan Zindanı Kartı -->
        <button id="btn-open-clan" class="w-full spatial-glass-card border-rose-500/40 hover:border-rose-400 p-3.5 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-xl relative overflow-hidden group text-left rounded-2xl">
            <!-- Arka Plan Grafiği -->
            <div class="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity">
                <img src="/assets/clan/clan_boss_shogun.svg" class="absolute -right-8 -top-8 w-36 h-36 opacity-50 blur-sm mix-blend-screen" alt="Boss Background">
            </div>

            <div class="flex items-center gap-3 z-10">
                <div class="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <img src="/assets/clan/clan_boss_shogun.svg" class="w-7 h-7 object-contain drop-shadow" alt="Clan Boss" onerror="this.style.display='none'">
                </div>
                <span id="menu-clan-pill-text" class="text-sm font-black text-rose-400 tracking-wide drop-shadow-md" data-i18n="menu_clan_title">Klan Zindanı</span>
            </div>

            <div class="z-10 bg-[#0E1729]/80 border border-rose-500/40 px-2.5 py-1 rounded-xl text-center shadow-inner">
                <span id="menu-clan-dust-count" class="text-[10px] font-mono font-black text-rose-400 drop-shadow">350/500</span>
            </div>
        </button>

        <!-- 3. 🗺️ Macera Haritası Kartı (En Alt Bento Kartı) -->
        <button id="btn-open-map" class="w-full spatial-glass-card border-amber-500/40 hover:border-amber-400 p-3.5 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-xl relative overflow-hidden group text-left rounded-2xl">
            <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-colors"></div>

            <div class="flex items-center gap-3 z-10">
                <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                    🗺️
                </div>
                <span class="text-sm font-black text-[var(--accent-gold-bright)] tracking-wide drop-shadow-md" data-i18n="menu_map_card_title">Macera Haritası</span>
            </div>

            <div class="z-10 w-8 h-8 rounded-xl bg-[var(--accent-gold)]/20 text-[var(--accent-gold-bright)] flex items-center justify-center text-sm font-black shrink-0 border border-[var(--accent-gold)]/30 group-hover:translate-x-0.5 transition-transform">
                ➔
            </div>
        </button>
    </div>
  `;
}
