export const leaderboardTemplate = `
<div id="view-leaderboard" class="absolute inset-0 bg-slate-900/60 hidden flex-col items-center justify-center z-[60] p-4 backdrop-blur-sm">
    <div class="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col h-[82vh] shadow-2xl relative">
        <div class="flex justify-between items-center mb-3">
            <div>
                <h3 class="text-2xl font-black text-slate-800 flex items-center gap-2">
                    🏆 Sıralama
                </h3>
                <p class="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Canlı Firebase Liderlik Tablosu
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
        <div class="bg-amber-50 text-amber-800 text-[11px] font-bold px-3 py-1.5 rounded-xl mb-3 flex justify-between items-center">
            <span>Sıra & Oyuncu</span>
            <span>🪙 Toplam Altın</span>
        </div>
        <div id="leaderboard-list" class="flex-1 overflow-y-auto space-y-2 pr-1">
            <div class="text-center text-slate-400 py-10 font-bold animate-pulse">Liderler yükleniyor...</div>
        </div>
    </div>
</div>
`;
