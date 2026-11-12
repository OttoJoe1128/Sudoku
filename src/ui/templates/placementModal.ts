export const placementModalTemplate = `
<div id="placement-modal" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[85] p-4 backdrop-blur-md">
    <div class="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto hidden-scrollbar">
        <button id="close-placement-modal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 text-sm">✕</button>
        
        <div class="text-center mb-4">
            <div class="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2 shadow-inner">
                🎯
            </div>
            <h3 class="text-2xl font-black text-slate-800 mb-1">Seviye Belirleme Sınavı</h3>
            <p class="text-xs text-slate-500 font-medium">Hedef seviyenizi seçin, tek bir test sudokusunu tamamlayarak doğrudan o seviyeden başlayın!</p>
        </div>

        <div class="flex flex-col gap-3 w-full mb-4">
            <!-- 1. Hedef: Basit (Seviye 1) -->
            <button id="btn-placement-basit" class="w-full bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-all group">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-base font-black text-emerald-800 flex items-center gap-1.5">
                        🟢 Hedef: Basit (Seviye 1)
                    </span>
                    <span class="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                        +50 🪙
                    </span>
                </div>
                <p class="text-[11px] text-emerald-700 mb-0.5">Sudokuya yeni başlayanlar için rahat başlangıç.</p>
                <span class="text-[10px] font-bold text-emerald-600">Kriter: 3 hatayı aşmadan tamamla</span>
            </button>

            <!-- 2. Hedef: Orta (Seviye 301) -->
            <button id="btn-placement-orta" class="w-full bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-all group relative overflow-hidden">
                <div class="absolute -right-3 -top-3 w-12 h-12 bg-amber-200/50 rounded-full blur"></div>
                <div class="flex justify-between items-center mb-1">
                    <span class="text-base font-black text-amber-800 flex items-center gap-1.5">
                        🟡 Hedef: Orta (Seviye 301)
                    </span>
                    <span class="bg-amber-300 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        +150 🪙
                    </span>
                </div>
                <p class="text-[11px] text-amber-800 mb-0.5">Kuralları bilenler için doğrudan 301. Seviyeye geçiş!</p>
                <span class="text-[10px] font-bold text-amber-700">Kriter: 3 hatayı aşmadan & 7 dk altında bitir</span>
            </button>

            <!-- 3. Hedef: Zor (Seviye 701) -->
            <button id="btn-placement-zor" class="w-full bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-all group relative overflow-hidden">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-base font-black text-rose-800 flex items-center gap-1.5">
                        🔴 Hedef: Zor (Seviye 701)
                    </span>
                    <span class="bg-rose-300 text-rose-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        +300 🪙
                    </span>
                </div>
                <p class="text-[11px] text-rose-800 mb-0.5">Deneyimli ustalar için doğrudan 701. Seviyeye geçiş!</p>
                <span class="text-[10px] font-bold text-rose-700">Kriter: 3 hatayı aşmadan & 10 dk altında bitir</span>
            </button>
        </div>

        <button id="btn-skip-placement" class="w-full text-xs font-bold text-slate-400 hover:text-slate-600 py-1.5 text-center">
            Sınavı Atla (Seviye 1'den Devam Et)
        </button>
    </div>
</div>

<!-- Seviye Belirleme Sonuç Modalı -->
<div id="placement-result-modal" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[86] p-4 backdrop-blur-md">
    <div class="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative">
        <div id="placement-result-icon" class="text-6xl mb-2 animate-bounce">🎓</div>
        <h3 id="placement-result-title" class="text-2xl font-black text-slate-800 mb-1">Sınavı Geçtiniz!</h3>
        <p id="placement-result-subtitle" class="text-xs font-bold text-slate-500 mb-4">Hedeflediğiniz Seviye 301 başarıyla açıldı!</p>

        <div class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-around items-center mb-4">
            <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Süre</p>
                <p id="placement-result-time" class="text-sm font-black text-slate-700">03:45</p>
            </div>
            <div class="w-[1px] h-8 bg-slate-200"></div>
            <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Hata</p>
                <p id="placement-result-errors" class="text-sm font-black text-slate-700">1 / 3</p>
            </div>
            <div class="w-[1px] h-8 bg-slate-200"></div>
            <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Ödül</p>
                <p id="placement-result-reward" class="text-sm font-black text-amber-600">+150 🪙</p>
            </div>
        </div>

        <div class="flex flex-col gap-2.5 w-full">
            <button id="btn-placement-action-primary" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl shadow-lg active:scale-95 transition-all text-sm">
                Seviyeyi Başlat ➔
            </button>
            <button id="btn-placement-action-secondary" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl active:scale-95 transition-all text-sm">
                Ana Menüye Dön
            </button>
        </div>
    </div>
</div>
`;
