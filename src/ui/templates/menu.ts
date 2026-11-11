export const menuTemplate = `
<div id="view-menu" class="flex-1 flex flex-col items-center p-6 gap-3 pb-8 overflow-y-auto hidden-scrollbar">
    <!-- Üst Profil Kartı -->
    <div class="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl">
                🎮
            </div>
            <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Oyuncu Profili</p>
                <div class="flex items-center gap-1.5">
                    <p id="menu-player-name" class="font-black text-slate-800 uppercase text-sm">Misafir</p>
                    <button id="btn-edit-username" title="İsmi Değiştir" class="text-slate-400 hover:text-indigo-600 text-xs p-1">✏️</button>
                </div>
            </div>
        </div>
        <div class="bg-amber-100 text-amber-800 px-3.5 py-1.5 rounded-full font-black text-sm shadow-inner flex items-center gap-1.5 border border-amber-200">
            <span>🪙</span>
            <span id="menu-gold">100</span>
        </div>
    </div>

    <!-- Devam Et Kartı (Kayıtlı oyun varsa aktifleşir) -->
    <div id="continue-card" class="w-full hidden">
        <button id="btn-continue-game" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-5 shadow-lg text-left active:scale-[0.98] transition-all border border-emerald-500 flex justify-between items-center group">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                    <span class="text-xs font-bold uppercase tracking-wider text-emerald-200">Yarım Kalan Oyun Bulundu</span>
                </div>
                <span class="text-xl font-black block" id="continue-game-title">▶ Kayıtlı Oyundan Devam Et</span>
                <span class="text-emerald-100 text-xs font-medium" id="continue-game-subtitle">Kaldığın yerden sürmeye hazır</span>
            </div>
            <span class="text-2xl group-hover:translate-x-1 transition-transform">➔</span>
        </button>
    </div>

    <!-- Yeni Oyun / Zorluk Seç Butonu -->
    <button id="btn-new-game" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-6 shadow-lg text-left active:scale-[0.98] transition-all flex justify-between items-center group border border-indigo-500">
        <div>
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-200 block mb-1">Hemen Başla</span>
            <span class="text-2xl font-black block">✨ Yeni Oyun Başlat</span>
            <span class="text-indigo-200 text-xs">Basit, Orta veya Zor seviyeni seç</span>
        </div>
        <span class="text-3xl group-hover:rotate-12 transition-transform">🧩</span>
    </button>

    <!-- Sudoku Yolculuğu (Harita) Butonu -->
    <button id="btn-journey" class="w-full bg-white hover:bg-slate-50 text-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 text-left active:scale-[0.98] transition-all flex justify-between items-center group">
        <div>
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">1000 Seviye</span>
            <span class="text-lg font-black block">🗺️ Sudoku Yolculuğu Haritası</span>
            <span class="text-slate-400 text-xs">Açılan tüm bölümleri keşfet</span>
        </div>
        <span class="text-2xl group-hover:translate-x-1 transition-transform text-indigo-500">➔</span>
    </button>

    <!-- İkincil Menü Butonları -->
    <div class="grid grid-cols-3 gap-2.5 w-full mt-1">
        <button id="btn-leaderboard" class="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center font-bold text-xs shadow-sm flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
            <span class="text-2xl">🏆</span>
            <span class="text-slate-700">Sıralama</span>
        </button>
        <button id="btn-shop" class="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center font-bold text-xs shadow-sm flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
            <span class="text-2xl">🛍️</span>
            <span class="text-slate-700">Mağaza</span>
        </button>
        <button id="btn-daily-reward" class="bg-amber-50 hover:bg-amber-100 border border-amber-200 p-4 rounded-2xl text-center font-bold text-xs shadow-sm flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
            <span class="text-2xl animate-bounce">🎁</span>
            <span class="text-amber-800">Günlük Ödül</span>
        </button>
    </div>
</div>
`;
