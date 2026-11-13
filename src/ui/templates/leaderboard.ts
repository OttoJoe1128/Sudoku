export const leaderboardTemplate = `
<div id="view-leaderboard" class="absolute inset-0 bg-slate-900/60 hidden flex-col items-center justify-center z-[60] p-4 backdrop-blur-sm">
    <div class="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col h-[82vh] shadow-2xl relative border border-slate-100">
        <div class="flex justify-between items-center mb-3">
            <div>
                <h3 class="text-xl font-black text-slate-800 flex items-center gap-2">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                    Sıralama
                </h3>
                <p class="text-[11px] text-slate-400 font-bold mt-0.5">
                    Küresel Oyuncu Sıralaması
                </p>
            </div>
            <div class="flex items-center gap-1.5">
                <button id="refresh-leaderboard" title="Yenile" class="text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full p-2 text-xs font-bold transition-colors">
                    🔄
                </button>
                <button id="close-leaderboard" class="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
                    ✕
                </button>
            </div>
        </div>

        <!-- Sekmeler: Genel Sıralama / En Hızlı Çözenler -->
        <div class="flex gap-1.5 p-1 bg-slate-100 rounded-xl mb-2.5">
            <button id="btn-tab-gold" class="flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition-all bg-white text-indigo-700 shadow-sm">
                Genel Sıralama
            </button>
            <button id="btn-tab-speed" class="flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all text-slate-500 hover:text-slate-800">
                En Hızlılar
            </button>
        </div>

        <!-- Genel Sıralama Filtreleri: Seviyeye Göre vs Altına Göre -->
        <div id="general-sort-filters" class="flex gap-2 mb-2.5">
            <button id="btn-sort-level" class="flex-1 py-1.5 text-xs font-black rounded-xl bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-1">
                <span>🏅</span> Seviyeye Göre
            </button>
            <button id="btn-sort-gold" class="flex-1 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center gap-1">
                <span>🪙</span> Altına Göre
            </button>
        </div>

        <!-- En Hızlılar İçin Zorluk Filtresi -->
        <div id="speed-diff-filters" class="hidden gap-1.5 mb-2.5">
            <button data-diff="all" class="speed-filter-btn flex-1 py-1 text-[11px] font-black rounded-lg bg-indigo-600 text-white shadow-sm">Tümü</button>
            <button data-diff="basit" class="speed-filter-btn flex-1 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">Basit</button>
            <button data-diff="orta" class="speed-filter-btn flex-1 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">Orta</button>
            <button data-diff="zor" class="speed-filter-btn flex-1 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">Zor</button>
        </div>

        <div id="leaderboard-header-bar" class="text-slate-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border-b border-slate-100 mb-2 flex justify-between items-center">
            <span id="lb-header-left">Sıra & Oyuncu</span>
            <span id="lb-header-right">🏅 Seviye</span>
        </div>
        <div id="leaderboard-list" class="flex-1 overflow-y-auto space-y-2 pr-1 hidden-scrollbar">
            <div class="text-center text-slate-400 py-10 font-bold animate-pulse">Liderler yükleniyor...</div>
        </div>
    </div>
</div>
`;
