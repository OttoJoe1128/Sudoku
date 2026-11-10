export const leaderboardTemplate = `
<div id="view-leaderboard" class="absolute inset-0 bg-slate-900/60 hidden flex-col items-center justify-center z-[60] p-4 backdrop-blur-sm">
    <div class="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col h-[80vh] shadow-2xl relative">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-black text-slate-800">🏆 Sıralama</h3>
            <button id="close-leaderboard" class="text-slate-400 bg-slate-100 rounded-full p-2">✕</button>
        </div>
        <div id="leaderboard-list" class="flex-1 overflow-y-auto space-y-2">
            <div class="text-center text-slate-400 py-10 font-bold animate-pulse">Yükleniyor...</div>
        </div>
    </div>
</div>
`;
