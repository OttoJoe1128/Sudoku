export const mapTemplate = `
<div id="view-map" class="hidden flex-col items-center p-4 bg-slate-50 h-[100dvh] overflow-y-auto hidden-scrollbar relative">
    <!-- Üst Bar -->
    <div class="flex justify-between items-center w-full mb-2 shrink-0">
        <button id="btn-back-map" class="bg-slate-200 hover:bg-slate-300 px-3.5 py-1.5 rounded-xl font-bold text-xs text-slate-800 transition-colors flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            <span>Menü</span>
        </button>
        <h2 class="text-sm font-black text-slate-800">5 Disiplin • Yolculuk Haritası</h2>
        <div class="w-12"></div>
    </div>

    <!-- 5 Sudoku Disiplini Seçici Bar -->
    <div class="w-full mb-2 shrink-0">
        <div class="grid grid-cols-5 gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl mb-1.5">
            <button id="map-variant-classic" data-variant="classic" class="map-variant-btn p-1.5 rounded-xl bg-white text-indigo-600 shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Klasik">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
                <span class="text-[9px] font-black leading-none">Klasik</span>
            </button>
            <button id="map-variant-irregular" data-variant="irregular" class="map-variant-btn p-1.5 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Parçalı">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4zM10 10h6v6h-6zM14 4h6v6H4z"/></svg>
                <span class="text-[9px] font-bold leading-none">Parçalı</span>
            </button>
            <button id="map-variant-killer" data-variant="killer" class="map-variant-btn p-1.5 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Hesap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-dasharray="2 2" d="M3 3h18v18H3z"/><path d="M7 7h10L10 12l7 5H7"/></svg>
                <span class="text-[9px] font-bold leading-none">Hesap</span>
            </button>
            <button id="map-variant-wordoku" data-variant="wordoku" class="map-variant-btn p-1.5 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Harfli">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7l-4 10h8M9 13h6"/></svg>
                <span class="text-[9px] font-bold leading-none">Harfli</span>
            </button>
            <button id="map-variant-samurai" data-variant="samurai" class="map-variant-btn p-1.5 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Samurai">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="1"/><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/></svg>
                <span class="text-[9px] font-bold leading-none">Samurai</span>
            </button>
        </div>
        <div id="map-variant-rule-desc" class="bg-indigo-50/90 border border-indigo-100 rounded-xl p-2 text-left text-[10px] font-medium text-indigo-900 leading-snug">
            Her satır, sütun ve 3x3 karede 1-9 rakamları birer kez yer almalıdır.
        </div>
    </div>

    <!-- Sabit Hedef Kartı -->
    <div id="map-target-card" class="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl p-3 shadow-md flex justify-between items-center mb-3 shrink-0">
        <div>
            <span class="text-[10px] font-black uppercase text-indigo-200 tracking-wider block">GÜNCEL HEDEF</span>
            <span id="map-target-label" class="text-sm font-black block">Seviye 1 • Basit</span>
        </div>
        <button id="btn-map-start-current" class="bg-amber-400 hover:bg-amber-500 text-amber-950 font-black px-3.5 py-1.5 rounded-xl text-xs shadow active:scale-95 transition-transform flex items-center gap-1">
            <span>▶ Hemen Oyna</span>
        </button>
    </div>

    <!-- Navigasyon Butonu (Üst Seviyeler) -->
    <button id="btn-map-page-up" class="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 rounded-xl text-[11px] mb-4 shrink-0 active:scale-95 transition-transform">
        ▲ Sonraki Seviyeler (+20)
    </button>

    <!-- Dikey Kıvrımlı Patika (Duolingo/Candy Crush Stili) -->
    <div id="map-path-container" class="w-full flex flex-col items-center gap-6 py-4 pb-28 min-h-[400px]">
        <!-- Dikey Kıvrımlı Taşlar Render Edilecek -->
    </div>

    <!-- Navigasyon Butonu (Alt Seviyeler) -->
    <button id="btn-map-page-down" class="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 rounded-xl text-[11px] mb-20 shrink-0 active:scale-95 transition-transform">
        ▼ Önceki Seviyeler (-20)
    </button>
</div>
`;
