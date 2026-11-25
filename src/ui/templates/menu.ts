import { Icons, renderAvatarSVG, renderBrandLogoHTML } from '../../design/icons';

export const menuTemplate = `
<div id="view-menu" class="flex-1 flex flex-col p-4 gap-3 pb-24 overflow-y-auto hidden-scrollbar relative">
    <!-- Üst Header (Profil, Günlük Ödül, Gelen Kutusu & Altın Kapsülü) -->
    <div class="w-full bg-[var(--bg-card)] p-3 rounded-2xl shadow-sm border border-[var(--border-subtle)] flex justify-between items-center transition-all">
        <div id="btn-open-profile" class="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform flex-1 min-w-0 pr-1 overflow-hidden">
            <div id="menu-avatar-box" class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-xl shadow-inner shrink-0">
                ${renderAvatarSVG('av_prism', 24)}
            </div>
            <div class="truncate flex-1 min-w-0">
                <p id="menu-player-title" class="text-[10px] text-[var(--accent-gold)] font-bold uppercase tracking-wider block truncate max-w-full leading-tight">Apprentice</p>
                <p id="menu-player-name" class="font-black text-[var(--text-primary)] text-xs sm:text-sm tracking-wide truncate max-w-full">Guest</p>
            </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
            <!-- Günlük Seri (Streak) Kapsülü -->
            <div id="menu-streak-capsule" title="Günlük Seri" data-i18n-title="menu_streak_title" class="bg-[var(--bg-elevated)] text-amber-400 font-mono font-black px-2 py-1 rounded-xl text-xs border border-amber-500/40 shadow-sm flex items-center gap-1 shrink-0">
                <span>🔥</span>
                <span id="menu-streak-count">1</span>
            </div>

            <!-- Kompakt Günlük Ödül Butonu -->
            <button id="btn-daily-reward" title="Günlük Ödül" data-i18n-title="menu_daily" class="relative bg-[var(--bg-elevated)] text-[var(--accent-gold)] p-2 rounded-xl active:scale-95 transition-all border border-[var(--border-strong)] flex items-center justify-center text-sm shadow-sm">
                <span id="daily-reward-icon">${Icons.zap}</span>
                <span id="daily-reward-dot" class="hidden absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)] animate-pulse"></span>
            </button>

            <!-- Düello Gelen Kutusu (Inbox) Butonu -->
            <button id="btn-open-inbox" title="Düello Gelen Kutusu" data-i18n-title="inbox_title" class="relative bg-[var(--bg-elevated)] text-[var(--text-primary)] p-2 rounded-xl active:scale-95 transition-transform border border-[var(--border-subtle)] flex items-center justify-center text-sm">
                ${Icons.inbox}
                <span id="inbox-badge-count" class="hidden absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow">0</span>
            </button>

            <!-- Altın Kapsülü -->
            <div id="menu-gold-capsule" class="bg-[var(--bg-elevated)] text-[var(--accent-gold)] font-black px-2.5 py-1.5 rounded-xl text-xs border border-[var(--border-strong)] shadow-sm flex items-center gap-1 shrink-0">
                ${Icons.coin}
                <span id="menu-gold" class="font-mono font-black text-xs sm:text-sm text-[var(--text-primary)]">100</span>
            </div>
        </div>
    </div>

    <!-- Marka Logos & Amblem -->
    ${renderBrandLogoHTML()}

    <!-- Ferah İlerleme Hapı -->
    <button id="btn-menu-progress-pill" class="w-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-full py-1.5 px-4 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm">
        <span class="w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse"></span>
        <span id="menu-progress-pill-text" class="text-xs font-bold tracking-wide">Seviye 1 • Klasik</span>
        <span class="text-[10px] text-[var(--text-secondary)]">➔</span>
    </button>

    <!-- PWA Yükleme Kartı -->
    <button id="btn-install-pwa" class="hidden w-full bg-[var(--bg-card)] text-[var(--text-primary)] p-3 rounded-2xl text-xs font-bold items-center justify-between shadow-sm transition-all border border-[var(--border-subtle)]">
        <div class="flex items-center gap-2">
            <span>${Icons.zap}</span>
            <span class="font-bold" data-i18n="menu_install_pwa">Uygulamayı Cihazına Yükle (PWA)</span>
        </div>
        <span class="bg-[var(--accent-gold)] text-[var(--text-on-gold)] text-[10px] font-black px-2.5 py-1 rounded-lg" data-i18n="menu_install_btn">YÜKLE</span>
    </button>

    <!-- Başparmak Bölgesi Ana Aksiyonlar -->
    <div class="flex flex-col gap-3 w-full mt-1">
        <!-- 1. Birincil Aksiyon: HIZLI OYNA / DEVAM ET (Ekrandaki TEK Dolu Altın Buton) -->
        <button id="btn-quick-play" class="w-full bg-[var(--accent-gold)] text-[var(--text-on-gold)] rounded-3xl px-5 py-4 shadow-lg active:scale-[0.98] transition-all flex flex-col gap-2.5 cursor-pointer group">
            <div class="flex items-center justify-between w-full">
                <div class="text-left">
                    <span id="quick-play-title" class="text-xl font-black block leading-tight tracking-wide uppercase">OYNA</span>
                    <span id="quick-play-subtitle" class="text-xs font-bold block opacity-90 mt-0.5">Seviye 1 • Klasik</span>
                </div>
                <div class="w-10 h-10 rounded-2xl bg-[#070D19]/20 flex items-center justify-center text-lg font-black group-hover:translate-x-1 transition-transform">
                    ➔
                </div>
            </div>
            <!-- Canlı İlerleme Çubuğu -->
            <div class="w-full bg-[#070D19]/25 h-1.5 rounded-full overflow-hidden flex shadow-inner">
                <div id="quick-play-progress-bar" class="bg-[var(--text-on-gold)] h-full transition-all duration-300 rounded-full" style="width: 10%"></div>
            </div>
        </button>

        <!-- 2. İkincil Aksiyon: Yeni Oyun (Çerçeveli Sade Kart) -->
        <button id="btn-new-game" class="w-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] rounded-2xl px-5 py-3.5 border border-[var(--border-strong)] shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group">
            <div class="text-left">
                <span class="text-sm font-black block text-[var(--text-primary)]" data-i18n="menu_new_game_title">+ Yeni Oyun</span>
                <span class="text-[11px] font-medium text-[var(--text-secondary)] block mt-0.5" data-i18n="menu_new_game_sub">Kolay • Orta • Zor • 5 Mod</span>
            </div>
            <span class="text-sm text-[var(--accent-gold)] group-hover:translate-x-1 transition-transform">➔</span>
        </button>

        <!-- 3. Koşullu Kayıtlı Oyunlar Şeridi (Yalnızca Yarım Kalan Oyun Varsa Görünür) -->
        <button id="btn-open-saved-games" class="hidden w-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-2xl p-3.5 justify-between items-center shadow-sm text-xs font-black transition-all active:scale-[0.98]">
            <div class="flex items-center gap-2 shrink-0">
                <span class="text-base text-[var(--accent-gold)] shrink-0">${Icons.target}</span>
                <span id="saved-games-count-label" data-i18n="menu_active_games_title" class="truncate">Aktif Oyunlarım</span>
            </div>
            <span class="text-[var(--text-secondary)] font-bold text-xs shrink-0">➔</span>
        </button>

        <!-- 4. İkiz Kalkanlar Sırası: ARENA (Sol) & HARİTA (Sağ) -->
        <div class="flex items-center justify-center gap-3 sm:gap-4 w-full mt-1">
            <!-- Sol Kalkan: Düello Arenası (ARENA) -->
            <button id="btn-open-match" class="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer active:scale-95 transition-transform drop-shadow-md group">
                <svg viewBox="0 0 100 110" class="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <linearGradient id="arenaShieldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#e2c097"/>
                            <stop offset="60%" stop-color="#be8f5d"/>
                            <stop offset="100%" stop-color="#96693c"/>
                        </linearGradient>
                    </defs>
                    <path d="M50 4 C75 4 92 14 92 24 C92 70 68 96 50 106 C32 96 8 70 8 24 C8 14 25 4 50 4 Z" fill="url(#arenaShieldGrad)" stroke="#f5e2c8" stroke-width="3" stroke-linejoin="round"/>
                    <path d="M50 10 C70 10 85 18 85 27 C85 66 63 89 50 98 C37 89 15 66 15 27 C15 18 30 10 50 10 Z" fill="none" stroke="#faebd7" stroke-opacity="0.4" stroke-width="1.5"/>
                </svg>
                <span class="relative z-10 text-xs sm:text-sm font-black tracking-[0.16em] uppercase text-amber-950 drop-shadow-sm font-mono">ARENA</span>
            </button>

            <!-- Sağ Aksiyon: Yolculuk Haritası (Kıvrımlı 3D Harita Vektörü) -->
            <button id="btn-open-map" class="w-24 h-24 sm:w-28 sm:h-28 relative flex flex-col items-center justify-center bg-transparent border-0 p-0 cursor-pointer active:scale-95 transition-transform drop-shadow-md group">
                <svg viewBox="0 0 100 110" class="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <linearGradient id="mapFoldLeft" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stop-color="#ffffff"/>
                            <stop offset="40%" stop-color="#7dd3fc"/>
                            <stop offset="100%" stop-color="#0284c7"/>
                        </linearGradient>
                        <linearGradient id="mapFoldCenter" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#f0f9ff"/>
                            <stop offset="50%" stop-color="#38bdf8"/>
                            <stop offset="100%" stop-color="#0369a1"/>
                        </linearGradient>
                        <linearGradient id="mapFoldRight" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stop-color="#e0f2fe"/>
                            <stop offset="60%" stop-color="#0284c7"/>
                            <stop offset="100%" stop-color="#075985"/>
                        </linearGradient>
                    </defs>

                    <!-- Dış Gölge Çerçevesi -->
                    <path d="M10 22 L36 10 L64 22 L90 10 L90 88 L64 100 L36 88 L10 100 Z" fill="#0369a1" opacity="0.3"/>

                    <!-- Sol Panel (Kıvrım 1) -->
                    <path d="M10 20 L36 8 L36 86 L10 98 Z" fill="url(#mapFoldLeft)" stroke="#e0f2fe" stroke-width="2" stroke-linejoin="round"/>

                    <!-- Orta Panel (Kıvrım 2 - İçe Bükülme & Beyaz Geçiş) -->
                    <path d="M36 8 L64 20 L64 98 L36 86 Z" fill="url(#mapFoldCenter)" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>

                    <!-- Sağ Panel (Kıvrım 3) -->
                    <path d="M64 20 L90 8 L90 86 L64 98 Z" fill="url(#mapFoldRight)" stroke="#bae6fd" stroke-width="2" stroke-linejoin="round"/>

                    <!-- Beyaz Işık Kat Çizgileri (Fold Crease Highlights) -->
                    <line x1="36" y1="8" x2="36" y2="86" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
                    <line x1="64" y1="20" x2="64" y2="98" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>

                    <!-- Harita İçi Ritim Yolları (Decorative Path Lines) -->
                    <path d="M18 45 Q28 35 36 50 T54 60 T82 40" fill="none" stroke="#ffffff" stroke-opacity="0.85" stroke-width="2.5" stroke-dasharray="3 3" stroke-linecap="round"/>
                    <circle cx="18" cy="45" r="3.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/>
                    <circle cx="82" cy="40" r="4" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
                </svg>
                <span class="relative z-10 text-xs sm:text-sm font-black tracking-[0.16em] uppercase text-sky-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] font-mono mt-1" data-i18n="tag_map">HARİTA</span>
            </button>
        </div>
    </div>

    <!-- Floating Bottom Dock (Ekranın En Altındaki Alt Bar: 3 Eşit Sekme) -->
    <div class="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-4 z-40" style="bottom: max(env(safe-area-inset-bottom, 0px), 0.75rem);">
        <div class="bg-[var(--bg-elevated)]/90 backdrop-blur-md border border-[var(--border-strong)] p-1.5 rounded-3xl shadow-2xl grid grid-cols-3 gap-1.5">
            <button id="btn-leaderboard" class="hover:bg-[var(--bg-card-hover)] p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] min-w-0">
                <span class="text-base text-[var(--accent-gold)] shrink-0">${Icons.trophy}</span>
                <span class="text-[10px] truncate max-w-full" data-i18n="nav_rank">Sıralama</span>
            </button>
            <button id="btn-achievements" class="hover:bg-[var(--bg-card-hover)] p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] relative min-w-0">
                <span class="text-base text-[var(--accent-gold)] shrink-0">${Icons.crown}</span>
                <span class="text-[10px] truncate max-w-full" data-i18n="menu_badges">Rozetler</span>
                <span id="badge-notify-dot" class="hidden absolute top-1.5 right-3 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
            <button id="btn-shop" class="hover:bg-[var(--bg-card-hover)] p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] min-w-0">
                <span class="text-base text-[var(--accent-cyan)] shrink-0">${Icons.dice}</span>
                <span class="text-[10px] truncate max-w-full" data-i18n="menu_shop">Mağaza</span>
            </button>
        </div>
    </div>
</div>
`;
