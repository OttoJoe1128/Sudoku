export const menuTemplate = `
<div id="view-menu" class="flex-1 flex flex-col p-5 gap-3.5 pb-20 overflow-y-auto hidden-scrollbar">
    <!-- Üst Floating Header (Profil & Altın Kapsülü) -->
    <div id="btn-open-profile" class="w-full bg-white hover:bg-slate-50/80 p-3.5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-all">
        <div class="flex items-center gap-3">
            <div id="menu-avatar-box" class="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-2xl shadow-inner shrink-0">
                🎮
            </div>
            <div>
                <p id="menu-player-title" class="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">Çaylak Bulmacacı</p>
                <div class="flex items-center gap-1.5">
                    <p id="menu-player-name" class="font-black text-slate-800 text-sm tracking-wide">Misafir</p>
                    <button id="btn-edit-username" title="İsmi Değiştir" class="text-slate-400 hover:text-indigo-600 text-xs p-0.5">✏️</button>
                </div>
            </div>
        </div>
        <div class="bg-gradient-to-r from-amber-50 to-amber-100 text-amber-900 px-3.5 py-2 rounded-2xl font-black text-xs border border-amber-200/80 shadow-sm flex items-center gap-1.5">
            <span class="text-sm">🪙</span>
            <span id="menu-gold">100</span>
        </div>
    </div>

    <!-- PWA Yükleme Kartı -->
    <button id="btn-install-pwa" class="hidden w-full bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-2xl text-xs font-bold items-center justify-between shadow-sm transition-all border border-slate-700">
        <div class="flex items-center gap-2">
            <span class="text-base">📲</span>
            <span class="font-bold">Uygulamayı Cihazına Yükle (PWA)</span>
        </div>
        <span class="bg-indigo-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">YÜKLE</span>
    </button>

    <!-- Bento Grid Ana Aksiyonlar -->
    <div class="flex flex-col gap-3 my-auto w-full">
        <!-- Hero Kart: Devam Et / Oyuna Başla -->
        <div class="relative w-full">
            <button id="btn-continue-game" class="w-full text-left rounded-3xl p-5 shadow-lg active:scale-[0.98] transition-all border flex justify-between items-center group bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white border-indigo-500 cursor-pointer relative overflow-hidden">
                <div class="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <div class="pr-9 z-10">
                    <div class="flex items-center gap-2 mb-1.5">
                        <span id="continue-dot" class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span class="text-[10px] font-black uppercase tracking-widest text-indigo-200" id="continue-tag">Aktif Oyun</span>
                    </div>
                    <span class="text-xl font-black block leading-tight text-white tracking-wide" id="continue-game-title">▶ Kaldığın Yerden Devam Et</span>
                    <span class="text-indigo-200 text-xs mt-1 block font-medium" id="continue-game-subtitle">Seviye ilerlemeni sürdür</span>
                </div>
                <span id="continue-game-arrow" class="text-2xl group-hover:translate-x-1.5 transition-transform text-white/90 z-10">➔</span>
            </button>
            <button id="btn-delete-saved-game" title="Bu Yarım Kalan Oyunu Sil" class="hidden absolute top-4 right-4 bg-black/30 hover:bg-rose-600 text-white w-8 h-8 rounded-xl text-xs font-bold items-center justify-center backdrop-blur-md z-20 active:scale-90 transition-all shadow">
                🗑️
            </button>
        </div>

        <!-- İkili Bento Satırı (PvP & Yeni Oyun) -->
        <div class="grid grid-cols-2 gap-3 w-full">
            <!-- Canlı Düello Kartı -->
            <button id="btn-open-match" class="bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-3xl p-4 flex flex-col justify-between shadow-md active:scale-[0.97] transition-all border border-purple-400/50 min-h-[120px] text-left group relative overflow-hidden">
                <div class="flex justify-between items-center w-full">
                    <span class="text-2xl group-hover:scale-110 transition-transform">⚔️</span>
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div>
                    <span class="text-[9px] font-black uppercase tracking-wider text-purple-200 block">Canlı PvP</span>
                    <span class="text-sm font-black block leading-snug">Sudoku Düello</span>
                </div>
            </button>

            <!-- Yeni Oyun Başlat Kartı -->
            <button id="btn-new-game" class="bg-white hover:bg-slate-50/90 text-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-sm active:scale-[0.97] transition-all border border-slate-200/80 min-h-[120px] text-left group">
                <div class="flex justify-between items-center w-full">
                    <span class="text-2xl group-hover:rotate-12 transition-transform">🧩</span>
                    <span class="text-xs text-indigo-600 font-bold">Zorluk Seç</span>
                </div>
                <div>
                    <span class="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Sıfırdan Başla</span>
                    <span class="text-sm font-black block leading-snug">Yeni Oyun</span>
                </div>
            </button>
        </div>

        <!-- Kompakt Aksiyon Şeritleri -->
        <button id="btn-open-map" class="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-2xl p-3.5 flex justify-between items-center shadow-sm text-xs font-black transition-all active:scale-[0.98]">
            <div class="flex items-center gap-2.5">
                <span class="text-lg">🗺️</span>
                <span>Sudoku Yolculuğu Haritası (1000 Seviye)</span>
            </div>
            <span class="text-slate-400 font-bold">➔</span>
        </button>

        <button id="btn-menu-placement-test" class="w-full bg-gradient-to-r from-indigo-50/80 to-purple-50/80 hover:from-indigo-100 hover:to-purple-100 text-indigo-900 border border-indigo-200/80 rounded-2xl p-3 flex justify-between items-center shadow-sm text-xs font-black transition-all active:scale-[0.98]">
            <div class="flex items-center gap-2.5">
                <span class="text-xl">🎯</span>
                <div class="text-left">
                    <span class="block leading-tight">Seviye Belirleme Sınavı</span>
                    <span class="text-[10px] font-bold text-indigo-600 block mt-0.5">Testi geç, doğrudan 301 veya 701'e atla!</span>
                </div>
            </div>
            <span class="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shrink-0 shadow-sm">SINAVA GİR</span>
        </button>
    </div>

    <!-- Floating Bottom Dock (Ekranın En Altındaki Alt Bar) -->
    <div class="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-4 z-40">
        <div class="bg-white/80 backdrop-blur-md border border-slate-200/80 p-2 rounded-3xl shadow-xl grid grid-cols-4 gap-1.5">
            <button id="btn-leaderboard" class="hover:bg-slate-100/80 p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-slate-700">
                <span class="text-lg">🏆</span>
                <span class="text-[10px]">Sıralama</span>
            </button>
            <button id="btn-achievements" class="hover:bg-slate-100/80 p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-slate-700 relative">
                <span class="text-lg">🎖️</span>
                <span class="text-[10px]">Rozetler</span>
                <span id="badge-notify-dot" class="hidden absolute top-2 right-4 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </button>
            <button id="btn-shop" class="hover:bg-slate-100/80 p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-slate-700">
                <span class="text-lg">🛍️</span>
                <span class="text-[10px]">Mağaza</span>
            </button>
            <button id="btn-daily-reward" class="bg-amber-100/80 hover:bg-amber-200/80 border border-amber-200/80 p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-amber-900 shadow-sm">
                <span id="daily-reward-icon" class="text-lg">🎁</span>
                <span id="daily-reward-text" class="text-[10px] font-black">Günlük</span>
            </button>
        </div>
    </div>
</div>
`;
