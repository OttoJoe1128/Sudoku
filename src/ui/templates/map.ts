export const mapTemplate = `
<div id="view-map" class="hidden flex-col items-center p-6 bg-slate-50 h-[100dvh] overflow-y-auto hidden-scrollbar">
    <div class="flex justify-between items-center w-full mb-4 shrink-0">
        <button id="btn-back-map" class="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-xl font-bold text-xs text-slate-800 transition-colors flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            <span>Menü</span>
        </button>
        <h2 class="text-base font-black text-slate-800">Yolculuk Haritası • 1000 Bölüm</h2>
        <div class="w-12"></div>
    </div>

    <!-- Hızlı Zorluk Atlama Sekmeleri -->
    <div class="flex gap-2 w-full mb-4 shrink-0">
        <button id="btn-map-jump-basit" class="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 py-2 px-1 rounded-xl text-[11px] font-black transition-colors">
            1-300 (Basit)
        </button>
        <button id="btn-map-jump-orta" class="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 py-2 px-1 rounded-xl text-[11px] font-black transition-colors">
            301-700 (Orta)
        </button>
        <button id="btn-map-jump-zor" class="flex-1 bg-rose-100 hover:bg-rose-200 text-rose-900 py-2 px-1 rounded-xl text-[11px] font-black transition-colors">
            701-1000 (Zor)
        </button>
    </div>

    <div id="map-nodes" class="grid grid-cols-4 gap-4 w-full pb-24">
        <!-- Seviye butonları buraya gelecek -->
    </div>
</div>
`;
