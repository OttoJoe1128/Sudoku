export const mapTemplate = `
<div id="view-map" class="hidden flex-col items-center p-4 bg-gradient-to-b from-[#091428] via-[#0A192F] to-[#010A13] text-[#F0E6D2] h-[100dvh] overflow-y-auto hidden-scrollbar relative">
    <!-- Üst Bar -->
    <div class="flex justify-between items-center w-full mb-2 shrink-0">
        <button id="btn-back-map" class="bg-[#0A1428] hover:bg-[#1E2328] border border-[#C89B3C]/50 px-3.5 py-1.5 rounded-xl font-bold text-xs text-[#F0E6D2] transition-colors flex items-center gap-1 shadow">
            <svg class="w-4 h-4 text-[#C8AA6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            <span>Menü</span>
        </button>
        <h2 id="map-biome-title" class="text-sm font-black text-[#C8AA6E] uppercase tracking-wider">🌿 ZÜMRÜT VADİ</h2>
        <div class="w-12"></div>
    </div>

    <!-- 5 Sudoku Disiplini Seçici Bar -->
    <div class="w-full mb-2 shrink-0">
        <div class="grid grid-cols-5 gap-1.5 bg-[#010A13]/90 border border-[#C89B3C]/30 p-1.5 rounded-2xl mb-1.5 shadow-inner">
            <button id="map-variant-classic" data-variant="classic" class="map-variant-btn p-1.5 rounded-xl bg-[#091428] border border-[#C8AA6E] text-[#F0E6D2] shadow flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Klasik">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8AA6E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
                <span class="text-[9px] font-black leading-none">Klasik</span>
            </button>
            <button id="map-variant-irregular" data-variant="irregular" class="map-variant-btn p-1.5 rounded-xl bg-transparent text-slate-400 hover:bg-[#0A1428] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Parçalı">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4zM10 10h6v6h-6zM14 4h6v6H4z"/></svg>
                <span class="text-[9px] font-bold leading-none">Parçalı</span>
            </button>
            <button id="map-variant-killer" data-variant="killer" class="map-variant-btn p-1.5 rounded-xl bg-transparent text-slate-400 hover:bg-[#0A1428] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Hesap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-dasharray="2 2" d="M3 3h18v18H3z"/><path d="M7 7h10L10 12l7 5H7"/></svg>
                <span class="text-[9px] font-bold leading-none">Hesap</span>
            </button>
            <button id="map-variant-wordoku" data-variant="wordoku" class="map-variant-btn p-1.5 rounded-xl bg-transparent text-slate-400 hover:bg-[#0A1428] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Harfli">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7l-4 10h8M9 13h6"/></svg>
                <span class="text-[9px] font-bold leading-none">Harfli</span>
            </button>
            <button id="map-variant-samurai" data-variant="samurai" class="map-variant-btn p-1.5 rounded-xl bg-transparent text-slate-400 hover:bg-[#0A1428] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Samurai">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="1"/><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/></svg>
                <span class="text-[9px] font-bold leading-none">Samurai</span>
            </button>
        </div>
        <div id="map-variant-rule-desc" class="bg-[#0A1428] border border-[#C89B3C]/30 rounded-xl p-2 text-left text-[10px] font-medium text-[#F0E6D2] leading-snug">
            Her satır, sütun ve 3x3 karede 1-9 rakamları birer kez yer almalıdır.
        </div>
    </div>

    <!-- LoL Ranked HUD Hedef Kartı -->
    <div id="map-target-card" class="w-full border-2 border-[#C89B3C]/70 bg-gradient-to-r from-[#091428] via-[#0F2442] to-[#091428] text-white rounded-2xl p-3 shadow-xl flex justify-between items-center mb-3 shrink-0 relative overflow-hidden">
        <div id="map-tier-progress" class="absolute bottom-0 left-0 h-1 bg-[#0AC8B9] transition-all" style="width: 10%"></div>
        <div>
            <span class="text-[10px] font-black uppercase text-[#C8AA6E] tracking-wider block">GÜNCEL SİHİRDAR HEDEFİ</span>
            <span id="map-target-label" class="text-sm font-black text-[#F0E6D2] block">Seviye 1 • Basit</span>
        </div>
        <button id="btn-map-start-current" class="bg-gradient-to-b from-[#C8AA6E] to-[#785A28] hover:from-[#F0E6D2] hover:to-[#C8AA6E] text-[#010A13] font-black px-4 py-1.5 rounded-xl text-xs shadow-md active:scale-95 transition-transform flex items-center gap-1 border border-[#C8AA6E]">
            <span>⚔️ OYNA</span>
        </button>
    </div>

    <!-- Navigasyon Butonu (Üst Seviyeler) -->
    <button id="btn-map-page-up" class="w-full bg-[#0A1428] hover:bg-[#1E2328] border border-[#C89B3C]/40 text-[#C8AA6E] font-bold py-1.5 rounded-xl text-[11px] mb-3 shrink-0 active:scale-95 transition-transform">
        ▲ Önceki Seviyeler (-20)
    </button>

    <!-- Dikey Kıvrımlı LoL/Hextech Patika -->
    <div id="map-path-container" class="w-full flex flex-col items-center gap-6 py-4 pb-28 min-h-[420px] relative">
        <!-- SVG Bağlantı Çizgileri & Taşlar Render Edilecek -->
    </div>

    <!-- Navigasyon Butonu (Alt Seviyeler) -->
    <button id="btn-map-page-down" class="w-full bg-[#0A1428] hover:bg-[#1E2328] border border-[#C89B3C]/40 text-[#C8AA6E] font-bold py-1.5 rounded-xl text-[11px] mb-20 shrink-0 active:scale-95 transition-transform">
        ▼ Sonraki Seviyeler (+20)
    </button>
</div>
`;
