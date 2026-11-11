export const menuTemplate = `
<div id="view-menu" class="flex-1 flex flex-col p-6 gap-3.5 pb-8 overflow-y-auto hidden-scrollbar">
    <!-- Profil & Altın Barı -->
    <div class="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl">
                🎮
            </div>
            <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Oyuncu</p>
                <div class="flex items-center gap-1.5">
                    <p id="menu-player-name" class="font-black text-slate-800 text-sm tracking-wide">Misafir</p>
                    <button id="btn-edit-username" title="İsmi Değiştir" class="text-slate-400 hover:text-indigo-600 text-xs p-0.5">✏️</button>
                </div>
            </div>
        </div>
        <div class="bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full font-black text-sm border border-amber-200 shadow-inner flex items-center gap-1.5">
            <span>🪙</span>
            <span id="menu-gold">100</span>
        </div>
    </div>

    <!-- PWA Yükleme Kartı (Sadece tarayıcı desteklediğinde görünür) -->
    <button id="btn-install-pwa" class="hidden w-full bg-slate-800 hover:bg-slate-700 text-white p-3.5 rounded-2xl text-xs font-bold items-center justify-between shadow-sm transition-all border border-slate-700">
        <div class="flex items-center gap-2">
            <span class="text-lg">📲</span>
            <span class="font-bold">Uygulamayı Cihazına Yükle (PWA)</span>
        </div>
        <span class="bg-indigo-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">YÜKLE</span>
    </button>

    <!-- Ana Oyun Aksiyonları (Sadece 2 Ana Seçenek) -->
    <div class="flex flex-col gap-3 my-auto w-full">
        <!-- 1. Kayıtlı Oyundan Devam Et -->
        <button id="btn-continue-game" class="w-full text-left rounded-2xl p-5 shadow-md active:scale-[0.98] transition-all border flex justify-between items-center group bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span id="continue-dot" class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-100" id="continue-tag">Aktif Oyun</span>
                </div>
                <span class="text-xl font-black block" id="continue-game-title">▶ Kayıtlı Oyundan Devam Et</span>
                <span class="text-emerald-100 text-xs" id="continue-game-subtitle">Kaldığın yerden hemen sürdür</span>
            </div>
            <span class="text-2xl group-hover:translate-x-1 transition-transform">➔</span>
        </button>

        <!-- 2. Yeni Oyun Başlat -->
        <button id="btn-new-game" class="w-full text-left rounded-2xl p-5 shadow-md active:scale-[0.98] transition-all border flex justify-between items-center group bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500">
            <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block mb-1">Sıfırdan Başla</span>
                <span class="text-xl font-black block">✨ Yeni Oyun Başlat</span>
                <span class="text-indigo-200 text-xs">Basit, Orta veya Zor seç</span>
            </div>
            <span class="text-3xl group-hover:rotate-12 transition-transform">🧩</span>
        </button>
    </div>

    <!-- İkincil Araçlar (Sıralama, Mağaza, Günlük Ödül) -->
    <div class="grid grid-cols-3 gap-2.5 w-full mt-auto">
        <button id="btn-leaderboard" class="bg-white hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center font-bold text-xs shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <span class="text-xl">🏆</span>
            <span class="text-slate-700">Sıralama</span>
        </button>
        <button id="btn-shop" class="bg-white hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center font-bold text-xs shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <span class="text-xl">🛍️</span>
            <span class="text-slate-700">Mağaza</span>
        </button>
        <button id="btn-daily-reward" class="bg-amber-50 hover:bg-amber-100 border border-amber-200 p-3.5 rounded-2xl text-center font-bold text-xs shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <span id="daily-reward-icon" class="text-xl">🎁</span>
            <span id="daily-reward-text" class="text-amber-800">Günlük Ödül</span>
        </button>
    </div>
</div>
`;
