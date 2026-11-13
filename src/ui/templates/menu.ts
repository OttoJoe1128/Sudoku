export const menuTemplate = `
<div id="view-menu" class="flex-1 flex flex-col p-5 gap-3.5 pb-20 overflow-y-auto hidden-scrollbar">
    <!-- Üst Floating Header (Profil, Bildirim Çanı & Altın Kapsülü) -->
    <div class="w-full bg-white hover:bg-slate-50/80 p-3 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center transition-all">
        <div id="btn-open-profile" class="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform flex-1">
            <div id="menu-avatar-box" class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-xl shadow-inner shrink-0">
                🎮
            </div>
            <div>
                <p id="menu-player-title" class="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">Çırak</p>
                <p id="menu-player-name" class="font-black text-slate-800 text-sm tracking-wide">Misafir</p>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <!-- Düello Gelen Kutusu (Inbox) Butonu -->
            <button id="btn-open-inbox" title="Düello Gelen Kutusu" class="relative bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-2xl active:scale-95 transition-transform border border-slate-200 flex items-center justify-center">
                <svg class="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                <span id="inbox-badge-count" class="hidden absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow">0</span>
            </button>

            <!-- Altın Kapsülü -->
            <div class="bg-amber-100 text-amber-950 font-black px-3 py-2 rounded-2xl text-xs border border-amber-200 shadow-sm flex items-center gap-1 shrink-0">
                <span class="text-xs">🪙</span>
                <span id="menu-gold" class="font-mono font-black text-xs sm:text-sm">100</span>
            </div>
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
                    <span class="text-[9px] font-black uppercase tracking-wider text-purple-200 block">REKABET</span>
                    <span class="text-sm font-black block leading-snug">Düello Arenası</span>
                </div>
            </button>

            <!-- Yeni Oyun Başlat Kartı -->
            <button id="btn-new-game" class="bg-white hover:bg-slate-50/90 text-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-sm active:scale-[0.97] transition-all border border-slate-200/80 min-h-[120px] text-left group">
                <div class="flex justify-between items-center w-full">
                    <span class="text-2xl group-hover:rotate-12 transition-transform">🧩</span>
                    <span class="text-xs text-indigo-600 font-bold">Zorluk Seç</span>
                </div>
                <div>
                    <span class="text-[9px] font-black uppercase tracking-wider text-slate-400 block">SERBEST MOD</span>
                    <span class="text-sm font-black block leading-snug">Klasik Sudoku</span>
                </div>
            </button>
        </div>

        <!-- Kompakt Aksiyon Şeritleri -->
        <button id="btn-open-map" class="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-2xl p-3.5 flex justify-between items-center shadow-sm text-xs font-black transition-all active:scale-[0.98]">
            <div class="flex items-center gap-2.5">
                <span class="text-lg">🗺️</span>
                <span>Yolculuk Haritası • 1000 Bölüm</span>
            </div>
            <span class="text-slate-400 font-bold">➔</span>
        </button>
    </div>

    <!-- Floating Bottom Dock (Ekranın En Altındaki Alt Bar) -->
    <div class="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-4 z-40">
        <div class="bg-white/80 backdrop-blur-md border border-slate-200/80 p-2 rounded-3xl shadow-xl grid grid-cols-4 gap-1.5">
            <button id="btn-leaderboard" class="hover:bg-slate-100/80 p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-slate-800 dark:text-slate-100">
                <span class="text-lg">🏆</span>
                <span class="text-[10px]">Sıralama</span>
            </button>
            <button id="btn-achievements" class="hover:bg-slate-100/80 p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-slate-800 dark:text-slate-100 relative">
                <span class="text-lg">🎖️</span>
                <span class="text-[10px]">Rozetler</span>
                <span id="badge-notify-dot" class="hidden absolute top-2 right-4 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </button>
            <button id="btn-shop" class="hover:bg-slate-100/80 p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-slate-800 dark:text-slate-100">
                <span class="text-lg">🛍️</span>
                <span class="text-[10px]">Mağaza</span>
            </button>
            <button id="btn-daily-reward" class="bg-amber-100/90 hover:bg-amber-200/90 border border-amber-300 p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-amber-950 shadow-sm">
                <span id="daily-reward-icon" class="text-lg">🎁</span>
                <span id="daily-reward-text" class="text-[10px] font-black">Günlük</span>
            </button>
        </div>
    </div>
</div>
`;
