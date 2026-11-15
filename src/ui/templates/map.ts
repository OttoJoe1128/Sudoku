export const mapTemplate = `
<div id="view-map" class="hidden flex-col items-center p-5 bg-slate-50 h-[100dvh] overflow-y-auto hidden-scrollbar">
    <div class="flex justify-between items-center w-full mb-3 shrink-0">
        <button id="btn-back-map" class="bg-slate-200 hover:bg-slate-300 px-3.5 py-1.5 rounded-xl font-bold text-xs text-slate-800 transition-colors flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            <span>Menü</span>
        </button>
        <h2 class="text-base font-black text-slate-800">5 Disiplin • Yolculuk Haritası</h2>
        <div class="w-12"></div>
    </div>

    <!-- 5 Sudoku Disiplini Seçici Bar -->
    <div class="grid grid-cols-5 gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl w-full mb-3 shrink-0">
        <button id="map-variant-classic" data-variant="classic" class="map-variant-btn p-2 rounded-xl bg-white text-indigo-600 shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Klasik">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
            <span class="text-[9px] font-black leading-none">Klasik</span>
        </button>
        <button id="map-variant-irregular" data-variant="irregular" class="map-variant-btn p-2 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Parçalı">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4zM10 10h6v6h-6zM14 4h6v6h-6zM4 14h6v6H4z"/></svg>
            <span class="text-[9px] font-bold leading-none">Parçalı</span>
        </button>
        <button id="map-variant-killer" data-variant="killer" class="map-variant-btn p-2 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Hesap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-dasharray="2 2" d="M3 3h18v18H3z"/><path d="M7 7h10L10 12l7 5H7"/></svg>
            <span class="text-[9px] font-bold leading-none">Hesap</span>
        </button>
        <button id="map-variant-wordoku" data-variant="wordoku" class="map-variant-btn p-2 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Harfli">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7l-4 10h8M9 13h6"/></svg>
            <span class="text-[9px] font-bold leading-none">Harfli</span>
        </button>
        <button id="map-variant-samurai" data-variant="samurai" class="map-variant-btn p-2 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Samurai">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="1"/><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/></svg>
            <span class="text-[9px] font-bold leading-none">Samurai</span>
        </button>
    </div>

    <!-- Hızlı Zorluk Atlama Sekmeleri -->
    <div class="flex gap-2 w-full mb-3 shrink-0">
        <button id="btn-map-jump-basit" class="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 py-1.5 px-1 rounded-xl text-[11px] font-black transition-colors">
            1-300 (Basit)
        </button>
        <button id="btn-map-jump-orta" class="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 py-1.5 px-1 rounded-xl text-[11px] font-black transition-colors">
            301-700 (Orta)
        </button>
        <button id="btn-map-jump-zor" class="flex-1 bg-rose-100 hover:bg-rose-200 text-rose-900 py-1.5 px-1 rounded-xl text-[11px] font-black transition-colors">
            701-1000 (Zor)
        </button>
    </div>

    <div id="map-nodes" class="grid grid-cols-4 gap-3.5 w-full pb-24">
        <!-- Seviye butonları buraya gelecek -->
    </div>
</div>
`;
