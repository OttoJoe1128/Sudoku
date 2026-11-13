export const customModeTemplate = `
<div id="view-custom" class="hidden flex-1 flex flex-col p-6 gap-4 relative bg-slate-50 h-[100dvh] overflow-y-auto hidden-scrollbar">
    <!-- Üst Başlık ve Geri Butonu -->
    <div class="flex justify-between items-center w-full mb-2 shrink-0">
        <button id="btn-back-custom" class="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-xl font-bold text-xs text-slate-800 transition-colors flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            <span>Menü</span>
        </button>
        <h2 class="text-base font-black text-slate-800">Serbest Oyun Seçimi</h2>
        <div class="w-16"></div>
    </div>

    <div class="text-center mb-2">
        <h3 class="text-2xl font-black text-slate-800 mb-1">Zorluk Seviyesi Seç</h3>
        <p class="text-xs text-slate-500 font-medium">İstediğin zorlukta özel bir Sudoku bulmacası oluştur</p>
    </div>

    <!-- Zorluk Kartları -->
    <div class="flex flex-col gap-3.5 w-full">
        <!-- Basit -->
        <button id="btn-start-basit" class="w-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-3xl p-5 text-left active:scale-[0.98] transition-all shadow-sm group">
            <div class="flex justify-between items-center mb-1.5">
                <span class="text-lg font-black text-emerald-900 flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-emerald-500 shadow-sm inline-block"></span>
                    Basit
                </span>
                <span class="bg-emerald-200 text-emerald-900 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
                    +10 Altın
                </span>
            </div>
            <p class="text-xs text-emerald-800 font-medium mb-1">Yeni başlayanlar için rahat ve keyifli bir Sudoku bulmacası.</p>
            <span class="text-[11px] font-bold text-emerald-700 block">30 boş hücre • Dinlendirici mod</span>
        </button>

        <!-- Orta -->
        <button id="btn-start-orta" class="w-full bg-amber-50 hover:bg-amber-100/80 border border-amber-300 rounded-3xl p-5 text-left active:scale-[0.98] transition-all shadow-sm group">
            <div class="flex justify-between items-center mb-1.5">
                <span class="text-lg font-black text-amber-900 flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-amber-500 shadow-sm inline-block"></span>
                    Orta
                </span>
                <span class="bg-amber-200 text-amber-900 text-xs font-black px-3 py-1 rounded-full border border-amber-300">
                    +20 Altın
                </span>
            </div>
            <p class="text-xs text-amber-800 font-medium mb-1">Biraz dikkat ve mantık yürütme gerektiren dengeli bir zorluk.</p>
            <span class="text-[11px] font-bold text-amber-700 block">45 boş hücre • Odaklanma gerektirir</span>
        </button>

        <!-- Zor -->
        <button id="btn-start-zor" class="w-full bg-rose-50 hover:bg-rose-100/80 border border-rose-300 rounded-3xl p-5 text-left active:scale-[0.98] transition-all shadow-sm group">
            <div class="flex justify-between items-center mb-1.5">
                <span class="text-lg font-black text-rose-900 flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-rose-500 shadow-sm inline-block"></span>
                    Zor
                </span>
                <span class="bg-rose-200 text-rose-900 text-xs font-black px-3 py-1 rounded-full border border-rose-300">
                    +35 Altın
                </span>
            </div>
            <p class="text-xs text-rose-800 font-medium mb-1">Sudoku ustaları için derin eleme ve kombinasyon mücadelesi.</p>
            <span class="text-[11px] font-bold text-rose-700 block">55 boş hücre • Gerçek meydan okuma</span>
        </button>

        <!-- Seviye Atlama Sınavı Banner'ı -->
        <button id="btn-open-placement-test" class="w-full bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-3xl p-4 text-left active:scale-[0.98] transition-all shadow-sm flex items-center justify-between group mt-1">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl shrink-0">🎯</div>
                <div>
                    <span class="text-sm font-black text-indigo-900 block leading-tight">Seviye Atlama Sınavı</span>
                    <span class="text-[11px] font-bold text-indigo-600 block mt-0.5">Üst bölümlerin kilidini doğrudan aç</span>
                </div>
            </div>
            <span class="text-lg text-indigo-500 group-hover:translate-x-1 transition-transform">➔</span>
        </button>
    </div>
</div>
`;
