export const matchModalTemplate = `
<!-- Eşleşme Arama Modalı -->
<div id="match-search-modal" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[80] p-4 backdrop-blur-md">
    <div class="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative">
        <button id="close-match-search" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 text-sm">✕</button>

        <div class="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
            ⚔️
        </div>
        <h3 class="text-2xl font-black text-slate-800 mb-1">Sudoku Düello Modu</h3>
        <p class="text-xs text-slate-500 mb-4 font-medium">Aynı bulmacada rakibinle eşzamanlı yarış! İlk bitiren veya en az hata yapan kazanır.</p>

        <!-- Zorluk Seçimi -->
        <div class="flex flex-col gap-2.5 w-full mb-4">
            <button id="btn-match-basit" class="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-2xl p-3.5 flex justify-between items-center text-left active:scale-[0.98] transition-all">
                <span class="font-black text-emerald-800 text-sm">🟢 Basit Düello</span>
                <span class="bg-emerald-200 text-emerald-900 text-[11px] font-black px-2.5 py-1 rounded-full">+50 🪙</span>
            </button>
            <button id="btn-match-orta" class="w-full bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-2xl p-3.5 flex justify-between items-center text-left active:scale-[0.98] transition-all">
                <span class="font-black text-amber-800 text-sm">🟡 Orta Düello</span>
                <span class="bg-amber-200 text-amber-900 text-[11px] font-black px-2.5 py-1 rounded-full">+100 🪙</span>
            </button>
            <button id="btn-match-zor" class="w-full bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-2xl p-3.5 flex justify-between items-center text-left active:scale-[0.98] transition-all">
                <span class="font-black text-rose-800 text-sm">🔴 Zor Düello</span>
                <span class="bg-rose-200 text-rose-900 text-[11px] font-black px-2.5 py-1 rounded-full">+200 🪙</span>
            </button>
        </div>

        <!-- Arama Durum Göstergesi (Arama Esnasında Görünür) -->
        <div id="match-search-status-box" class="hidden flex-col items-center gap-2 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
            <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p id="match-search-status-text" class="text-xs font-bold text-indigo-700 animate-pulse">Açık maçlar taranıyor...</p>
        </div>
    </div>
</div>

<!-- Düello Sonuç Modalı -->
<div id="match-result-modal" class="absolute inset-0 bg-slate-900/85 hidden flex-col items-center justify-center z-[88] p-4 backdrop-blur-md">
    <div class="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative">
        <div id="match-result-icon" class="text-6xl mb-2 animate-bounce">🏆</div>
        <h3 id="match-result-title" class="text-2xl font-black text-slate-800 mb-1">DÜELLO ZAFERİ!</h3>
        <p id="match-result-subtitle" class="text-xs font-bold text-slate-500 mb-4">Rakibinizi geride bırakarak maçı kazandınız!</p>

        <div class="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex justify-around items-center mb-4 shadow-inner">
            <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Süre</p>
                <p id="match-result-time" class="text-sm font-black text-slate-700">02:30</p>
            </div>
            <div class="w-[1px] h-8 bg-slate-200"></div>
            <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Hata</p>
                <p id="match-result-errors" class="text-sm font-black text-slate-700">0 / 3</p>
            </div>
            <div class="w-[1px] h-8 bg-slate-200"></div>
            <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Ödül</p>
                <p id="match-result-reward" class="text-sm font-black text-amber-600">+50 🪙</p>
            </div>
        </div>

        <button id="btn-close-match-result" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl shadow-lg active:scale-95 transition-all text-sm">
            Ana Menüye Dön ➔
        </button>
    </div>
</div>
`;
