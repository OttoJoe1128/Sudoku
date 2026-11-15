export const customModeTemplate = `
<div id="view-custom" class="hidden flex-1 flex flex-col p-6 gap-3.5 relative bg-slate-50 h-[100dvh] overflow-y-auto hidden-scrollbar">
    <!-- Üst Başlık ve Geri Butonu -->
    <div class="flex justify-between items-center w-full mb-1 shrink-0">
        <button id="btn-back-custom" class="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-xl font-bold text-xs text-slate-800 transition-colors flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            <span>Menü</span>
        </button>
        <h2 class="text-base font-black text-slate-800">Serbest Mod (Klasik & Disiplinler)</h2>
        <div class="w-16"></div>
    </div>

    <!-- 5 Sudoku Disiplini Stil Seçici Bar -->
    <div class="w-full">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider text-left mb-1.5 flex justify-between items-center">
            <span>💠 Oyun Disiplini Seç</span>
            <span id="custom-variant-multiplier-badge" class="text-indigo-600 font-bold">1.0x Puan</span>
        </p>
        <div class="grid grid-cols-5 gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl">
            <button id="btn-variant-classic" data-variant="classic" class="custom-variant-btn p-2 rounded-xl bg-white text-indigo-600 shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Klasik Sudoku">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
                <span class="text-[9px] font-black leading-none">Klasik</span>
            </button>
            <button id="btn-variant-irregular" data-variant="irregular" class="custom-variant-btn p-2 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Parçalı Sudoku">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4zM10 10h6v6h-6zM14 4h6v6h-6zM4 14h6v6H4z"/></svg>
                <span class="text-[9px] font-bold leading-none">Parçalı</span>
            </button>
            <button id="btn-variant-killer" data-variant="killer" class="custom-variant-btn p-2 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Hesap Sudoku">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-dasharray="2 2" d="M3 3h18v18H3z"/><path d="M7 7h10L10 12l7 5H7"/></svg>
                <span class="text-[9px] font-bold leading-none">Hesap</span>
            </button>
            <button id="btn-variant-wordoku" data-variant="wordoku" class="custom-variant-btn p-2 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Harfli Sudoku">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7l-4 10h8M9 13h6"/></svg>
                <span class="text-[9px] font-bold leading-none">Harfli</span>
            </button>
            <button id="btn-variant-samurai" data-variant="samurai" class="custom-variant-btn p-2 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Samurai 5-Grid">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="1"/><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/></svg>
                <span class="text-[9px] font-bold leading-none">Samurai</span>
            </button>
        </div>
    </div>

    <!-- Zorluk Kartları -->
    <div class="flex flex-col gap-3 w-full">
        <!-- Basit -->
        <button id="btn-start-basit" class="w-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-3xl p-4 text-left active:scale-[0.98] transition-all shadow-sm group">
            <div class="flex justify-between items-center mb-1">
                <span class="text-base font-black text-emerald-900 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm inline-block"></span>
                    Basit
                </span>
                <span class="bg-emerald-200 text-emerald-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                    +10 Altın
                </span>
            </div>
            <p class="text-xs text-emerald-800 font-medium mb-1">Yeni başlayanlar için rahat ve dinlendirici bir bulmaca.</p>
        </button>

        <!-- Orta -->
        <button id="btn-start-orta" class="w-full bg-amber-50 hover:bg-amber-100/80 border border-amber-300 rounded-3xl p-4 text-left active:scale-[0.98] transition-all shadow-sm group">
            <div class="flex justify-between items-center mb-1">
                <span class="text-base font-black text-amber-900 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm inline-block"></span>
                    Orta
                </span>
                <span class="bg-amber-200 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                    +20 Altın
                </span>
            </div>
            <p class="text-xs text-amber-800 font-medium mb-1">Biraz dikkat ve mantık yürütme gerektiren dengeli bir zorluk.</p>
        </button>

        <!-- Zor -->
        <button id="btn-start-zor" class="w-full bg-rose-50 hover:bg-rose-100/80 border border-rose-300 rounded-3xl p-4 text-left active:scale-[0.98] transition-all shadow-sm group">
            <div class="flex justify-between items-center mb-1">
                <span class="text-base font-black text-rose-900 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm inline-block"></span>
                    Zor
                </span>
                <span class="bg-rose-200 text-rose-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-rose-300">
                    +35 Altın
                </span>
            </div>
            <p class="text-xs text-rose-800 font-medium mb-1">Sudoku ustaları için derin eleme ve kombinasyon mücadelesi.</p>
        </button>

        <!-- Seviye Atlama Sınavı Banner'ı -->
        <button id="btn-open-placement-test" class="w-full bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-3xl p-3.5 text-left active:scale-[0.98] transition-all shadow-sm flex items-center justify-between group mt-1">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg shrink-0">🎯</div>
                <div>
                    <span class="text-xs font-black text-indigo-900 block leading-tight">Seviye Atlama Sınavı</span>
                    <span class="text-[10px] font-bold text-indigo-600 block mt-0.5">Üst bölümlerin kilidini doğrudan aç</span>
                </div>
            </div>
            <span class="text-base text-indigo-500 group-hover:translate-x-1 transition-transform">➔</span>
        </button>
    </div>
</div>
`;
