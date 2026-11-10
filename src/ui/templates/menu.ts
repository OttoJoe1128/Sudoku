export const menuTemplate = `
<div id="view-menu" class="flex-1 overflow-y-auto hidden-scrollbar flex flex-col items-center p-6 gap-4 relative pb-10">
    <div class="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_center,_#334155_2px,_transparent_2px)] bg-[size:24px_24px] pointer-events-none"></div>
    
    <div class="w-full flex justify-between items-center z-10 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-2">
        <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Oyuncu</span>
            <span id="menu-player-name" class="font-black text-slate-800">Misafir</span>
        </div>
        <div class="flex items-center gap-2">
            <div class="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-bold">🪙 <span id="menu-gold">0</span></div>
        </div>
    </div>
    
    <button id="btn-journey" class="z-10 w-full bg-indigo-600 text-white rounded-2xl p-6 shadow-[0_6px_0_#4338ca] active:translate-y-1.5 transition-all text-center">
        <span class="text-2xl font-black block">🗺️ Sudoku Yolculuğu</span>
        <span class="text-indigo-200">Seviyeyi devam ettir</span>
    </button>

    <div class="grid grid-cols-3 gap-3 w-full z-10">
        <button id="btn-leaderboard" class="bg-white p-4 rounded-2xl border border-slate-200 text-center flex flex-col items-center gap-2 hover:border-amber-300">
            <span class="text-2xl">🏆</span>
            <span class="font-bold text-slate-700 text-xs">Sıralama</span>
        </button>
        <button id="btn-shop" class="bg-white p-4 rounded-2xl border border-slate-200 text-center flex flex-col items-center gap-2 hover:border-indigo-300">
            <span class="text-2xl">🛍️</span>
            <span class="font-bold text-slate-700 text-xs">Mağaza</span>
        </button>
        <button id="btn-achievements" class="bg-white p-4 rounded-2xl border border-slate-200 text-center flex flex-col items-center gap-2 hover:border-emerald-300">
            <span class="text-2xl">🎖️</span>
            <span class="font-bold text-slate-700 text-xs">Başarılar</span>
        </button>
    </div>
    
    <button id="btn-daily-reward" class="z-10 w-full bg-blue-50 text-blue-700 rounded-2xl p-4 font-black flex justify-between items-center border-2 border-blue-100">
        <span>🎁 Günlük Ödül</span>
        <span id="reward-status" class="bg-blue-200 px-3 py-1 rounded-full text-xs">Al</span>
    </button>
</div>
`;
