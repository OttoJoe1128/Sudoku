export const customModeTemplate = `
<div id="view-custom" class="hidden flex-1 flex flex-col p-6 gap-4 relative bg-slate-50 h-[100dvh] overflow-y-auto hidden-scrollbar">
    <!-- Üst Başlık ve Geri Butonu -->
    <div class="flex justify-between items-center w-full mb-2 shrink-0">
        <button id="btn-back-custom" class="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-xl font-bold text-sm text-slate-700 transition-colors">⬅ Menü</button>
        <h2 class="text-lg font-black text-slate-800">Yeni Oyun Başlat</h2>
        <div class="w-16"></div>
    </div>

    <div class="text-center mb-2">
        <h3 class="text-2xl font-black text-slate-800 mb-1">Zorluk Seviyesi Seç</h3>
        <p class="text-xs text-slate-500 font-medium">Yeni bir Sudoku tablosu oluşturulacak</p>
    </div>

    <!-- Zorluk Kartları -->
    <div class="flex flex-col gap-3.5 w-full">
        <!-- Basit -->
        <button id="btn-start-basit" class="w-full bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 rounded-2xl p-5 text-left active:scale-[0.98] transition-all shadow-sm group">
            <div class="flex justify-between items-center mb-1.5">
                <span class="text-xl font-black text-emerald-800 flex items-center gap-2">
                    🟢 Basit
                </span>
                <span class="bg-emerald-200 text-emerald-900 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-300">
                    🪙 +10 Altın
                </span>
            </div>
            <p class="text-xs text-emerald-700 font-medium mb-1">Yeni başlayanlar için rahat ve keyifli bir Sudoku bulmacası.</p>
            <span class="text-[11px] font-bold text-emerald-600 block">30 boş kutu • Standart ipuçları</span>
        </button>

        <!-- Orta -->
        <button id="btn-start-orta" class="w-full bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-2xl p-5 text-left active:scale-[0.98] transition-all shadow-sm group">
            <div class="flex justify-between items-center mb-1.5">
                <span class="text-xl font-black text-amber-800 flex items-center gap-2">
                    🟡 Orta
                </span>
                <span class="bg-amber-200 text-amber-900 text-xs font-black px-2.5 py-1 rounded-full border border-amber-300">
                    🪙 +20 Altın
                </span>
            </div>
            <p class="text-xs text-amber-700 font-medium mb-1">Biraz dikkat ve mantık yürütme gerektiren dengeli bir zorluk.</p>
            <span class="text-[11px] font-bold text-amber-600 block">45 boş kutu • Odaklanma gerektirir</span>
        </button>

        <!-- Zor -->
        <button id="btn-start-zor" class="w-full bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 rounded-2xl p-5 text-left active:scale-[0.98] transition-all shadow-sm group">
            <div class="flex justify-between items-center mb-1.5">
                <span class="text-xl font-black text-rose-800 flex items-center gap-2">
                    🔴 Zor
                </span>
                <span class="bg-rose-200 text-rose-900 text-xs font-black px-2.5 py-1 rounded-full border border-rose-300">
                    🪙 +35 Altın
                </span>
            </div>
            <p class="text-xs text-rose-700 font-medium mb-1">Sudoku ustaları için derin eleme ve kombinasyon mücadelesi.</p>
            <span class="text-[11px] font-bold text-rose-600 block">55 boş kutu • Gerçek meydan okuma</span>
        </button>
    </div>
</div>
`;
