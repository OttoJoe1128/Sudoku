export const menuTemplate = `
<div id="view-menu" class="flex-1 flex flex-col items-center p-6 gap-4 pb-10">
    <div class="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center mb-4">
        <div>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Oyuncu</p>
            <p id="menu-player-name" class="font-black text-slate-800 uppercase">Misafir</p>
        </div>
        <div class="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-bold">🪙 <span id="menu-gold">0</span></div>
    </div>
    
    <button id="btn-journey" class="w-full bg-indigo-600 text-white rounded-2xl p-8 shadow-lg text-center active:scale-95 transition-transform">
        <span class="text-2xl font-black block">🗺️ Sudoku Yolculuğu</span>
        <span class="text-indigo-200 text-sm">Başla veya Devam Et</span>
    </button>

    <div class="grid grid-cols-3 gap-3 w-full">
        <button id="btn-leaderboard" class="bg-white p-4 rounded-2xl border border-slate-200 text-center font-bold text-sm">🏆 Sıralama</button>
        <button id="btn-shop" class="bg-white p-4 rounded-2xl border border-slate-200 text-center font-bold text-sm">🛍️ Mağaza</button>
        <button id="btn-achievements" class="bg-white p-4 rounded-2xl border border-slate-200 text-center font-bold text-sm">🎖️ Başarılar</button>
    </div>
</div>
`;
