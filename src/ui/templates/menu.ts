import { Icons, renderAvatarSVG } from '../../design/icons';

export const menuTemplate = `
<div id="view-menu" class="flex-1 flex flex-col p-2.5 sm:p-3.5 gap-2 pb-16 sm:pb-20 overflow-hidden relative justify-between h-full font-sans select-none">
    <!-- KATMAN 1: STATÜ VE EKONOMİ BARI (Status & Currency Matrix) -->
    <div class="w-full bg-[var(--bg-card)] p-2 rounded-2xl shadow-sm border border-[var(--border-subtle)] flex justify-between items-center transition-all shrink-0">
        <!-- Oyuncu Profili, Dinamik Lig Çerçevesi & Aktif Kalıntı Yuvası -->
        <div id="btn-open-profile" class="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform flex-1 min-w-0 pr-1">
            <div id="menu-avatar-box" class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-lg shadow-inner shrink-0 ring-2 ring-amber-400/80">
                ${renderAvatarSVG('av_prism', 24)}
                <!-- Dinamik Lig Arması (Rank Crest) -->
                <span id="menu-league-badge" class="absolute -top-1 -left-1 text-[9px] w-4 h-4 rounded-full bg-[var(--bg-card)] border border-amber-400/60 flex items-center justify-center shadow z-10" title="League Crest" data-i18n-title="league_modal_title">🥉</span>
                <!-- Aktif Kalıntı Yuvası (Relic Trinket) -->
                <div id="menu-relic-trinket" class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-elevated)] border border-amber-400/70 flex items-center justify-center text-[8.5px] shadow-sm z-10" title="Equipped Relic" data-i18n-title="relic_trinket_title">🧭</div>
            </div>
            <div class="truncate flex-1 min-w-0">
                <p id="menu-player-title" class="text-[8.5px] sm:text-[9.5px] text-[var(--accent-gold)] font-black uppercase tracking-wider block truncate max-w-full leading-tight">Apprentice</p>
                <p id="menu-player-name" class="font-black text-[var(--text-primary)] text-xs sm:text-sm tracking-wide truncate max-w-full">Guest</p>
            </div>
        </div>

        <!-- Seri & Çift Para Birimi Kapsülleri -->
        <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <!-- Günlük Seri Kapsülü (Kırılma uyarısı dinamik) -->
            <div id="menu-streak-capsule" title="Daily Streak" data-i18n-title="menu_streak_title" class="bg-[var(--bg-elevated)] text-amber-400 font-mono font-black px-1.5 py-1 rounded-xl text-xs border border-amber-500/40 shadow-sm flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-transform">
                <span>🔥</span>
                <span id="menu-streak-count">1</span>
            </div>

            <!-- Rün Kristali Kapsülü -->
            <button id="menu-crystal-capsule" title="Rune Crystals" data-i18n-title="abilities_title" class="bg-[var(--bg-elevated)] text-[var(--accent-cyan)] font-mono font-black px-1.5 py-1 rounded-xl text-xs border border-cyan-500/40 shadow-sm flex items-center gap-0.5 shrink-0 cursor-pointer active:scale-95 transition-transform">
                <span class="text-[11px]">💎</span>
                <span id="menu-crystal-count" class="text-xs text-cyan-300">0</span>
            </button>

            <!-- Altın Kapsülü -->
            <div id="menu-gold-capsule" class="bg-[var(--bg-elevated)] text-[var(--accent-gold)] font-black px-2 py-1 rounded-xl text-xs border border-[var(--border-strong)] shadow-sm flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-transform">
                ${Icons.coin}
                <span id="menu-gold" class="font-mono font-black text-xs text-[var(--text-primary)]">150</span>
            </div>

            <!-- Günlük Ödül & Gelen Kutusu -->
            <button id="btn-daily-reward" title="Günlük Ödül" data-i18n-title="menu_daily" class="relative bg-[var(--bg-elevated)] text-[var(--accent-gold)] p-1.5 rounded-xl active:scale-95 transition-all border border-[var(--border-strong)] flex items-center justify-center text-xs shadow-sm cursor-pointer">
                <span id="daily-reward-icon">${Icons.zap}</span>
                <span id="daily-reward-dot" class="hidden absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse"></span>
            </button>
            <button id="btn-open-inbox" title="Düello Gelen Kutusu" data-i18n-title="inbox_title" class="relative bg-[var(--bg-elevated)] text-[var(--text-primary)] p-1.5 rounded-xl active:scale-95 transition-transform border border-[var(--border-subtle)] flex items-center justify-center text-xs cursor-pointer">
                ${Icons.inbox}
                <span id="inbox-badge-count" class="hidden absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center animate-bounce shadow">0</span>
            </button>
        </div>
    </div>

    <!-- PWA Yükleme Kartı (Yalnızca masaüstü/web tarayıcısında koşullu) -->
    <button id="btn-install-pwa" class="hidden w-full bg-[var(--bg-card)] text-[var(--text-primary)] p-2 rounded-2xl text-xs font-bold items-center justify-between shadow-sm transition-all border border-[var(--border-subtle)] shrink-0">
        <div class="flex items-center gap-2">
            <span>${Icons.zap}</span>
            <span class="font-bold" data-i18n="menu_install_pwa">Uygulamayı Cihazına Yükle (PWA)</span>
        </div>
        <span class="bg-[var(--accent-gold)] text-[var(--text-on-gold)] text-[10px] font-black px-2 py-0.5 rounded-lg" data-i18n="menu_install_btn">YÜKLE</span>
    </button>

    <!-- KATMAN 2: CANLI MACERA VİTRİNİ (Hero Card) & CANLI ETKİNLİKLER -->
    <div class="w-full flex flex-col gap-2 shrink-0">
        <!-- Macera Kartı (Primary Hero Card) -->
        <div class="w-full border border-[var(--border-strong)] rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all" style="background: var(--hero-bg); color: var(--hero-text);">
            <div class="absolute -right-8 -top-8 w-32 h-32 bg-[var(--accent-gold)]/10 rounded-full blur-2xl pointer-events-none"></div>

            <div class="flex items-center justify-between w-full mb-1">
                <div class="text-left min-w-0 pr-2">
                    <span id="quick-play-title" class="text-xs sm:text-sm font-black block leading-tight tracking-wider uppercase text-[var(--accent-gold)] font-mono">CHAPTER 1</span>
                    <span id="quick-play-subtitle" class="text-[9.5px] sm:text-[10.5px] font-bold text-[var(--hero-subtext)] block mt-0.5 truncate">Level 1 - Classic</span>
                </div>
                <!-- Aktif Bölüm Enerjisi Rozeti -->
                <div id="hero-energy-badge" class="bg-[var(--bg-elevated)] text-[var(--accent-gold)] border border-[var(--border-strong)] px-2 py-0.5 rounded-full text-[8.5px] font-mono font-black flex items-center gap-1 shadow-sm shrink-0">
                    ⚡ <span>Energy</span>
                </div>
            </div>

            <!-- Devasa Çağrı Butonu: YOLCULUĞA DEVAM ET (Theme-Aware 3D Çağrı Butonu) -->
            <button id="btn-quick-play" class="w-full bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black rounded-xl sm:rounded-2xl py-2 px-3 shadow-lg active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer border border-[var(--border-strong)] mt-0.5">
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-[var(--text-on-gold)] animate-ping"></span>
                    <span class="text-xs sm:text-sm font-black tracking-wider uppercase font-sans" data-i18n="menu_journey_continue">CONTINUE JOURNEY</span>
                </div>
                <div class="w-5 h-5 rounded-lg bg-[var(--text-on-gold)]/20 flex items-center justify-center text-xs font-black">➔</div>
            </button>

            <!-- Canlı İlerleme Çubuğu -->
            <div class="w-full bg-[#070D19]/40 h-1 rounded-full overflow-hidden flex shadow-inner mt-1.5 border border-white/5">
                <div id="quick-play-progress-bar" class="bg-[var(--accent-cyan)] h-full transition-all duration-300 rounded-full" style="width: 10%"></div>
            </div>
        </div>

        <!-- İkili Canlı-Ops Hapları (Live-Ops Split Capsules) -->
        <div class="w-full flex gap-1.5">
            <!-- Sol: 📮 Sezonluk Kartpostal -->
            <button id="btn-open-postcards" class="flex-1 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-strong)] rounded-full py-1 px-2.5 sm:px-3 flex items-center justify-between active:scale-95 transition-all cursor-pointer shadow-sm">
                <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-xs shrink-0">📮</span>
                    <span id="menu-season-pill-text" class="text-[9.5px] sm:text-[10.5px] font-black text-[var(--accent-gold)] truncate" data-i18n="season_btn_menu">Season</span>
                </div>
                <span id="menu-season-stamps-count" class="text-[8.5px] font-mono font-bold bg-[var(--bg-elevated)] text-[var(--accent-gold)] px-1.5 py-0.5 rounded-full border border-[var(--border-subtle)] shrink-0">0/9</span>
            </button>

            <!-- Sağ: 👹 Klan Samurai Zindanı -->
            <button id="btn-open-clan" class="flex-1 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-rose-500/40 rounded-full py-1 px-2.5 sm:px-3 flex items-center justify-between active:scale-95 transition-all cursor-pointer shadow-sm">
                <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-xs shrink-0">⛩️</span>
                    <span id="menu-clan-pill-text" class="text-[9.5px] sm:text-[10.5px] font-black text-rose-500 dark:text-rose-400 truncate" data-i18n="menu_clan_title">Clan Dungeon</span>
                </div>
                <span id="menu-clan-dust-count" class="text-[8.5px] font-mono font-bold bg-rose-500/20 text-rose-500 dark:text-rose-300 px-1.5 py-0.5 rounded-full border border-rose-500/30 shrink-0">350/500</span>
            </button>
        </div>
    </div>

    <!-- Koşullu Kayıtlı Oyunlar Şeridi (Yarım kalan oyun varsa görünür) -->
    <button id="btn-open-saved-games" class="hidden w-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl p-2 justify-between items-center shadow-sm text-xs font-black transition-all active:scale-[0.98] shrink-0">
        <div class="flex items-center gap-2 shrink-0">
            <span class="text-sm text-[var(--accent-gold)] shrink-0">${Icons.target}</span>
            <span id="saved-games-count-label" data-i18n="menu_active_games_title" class="truncate">Aktif Oyunlarım</span>
        </div>
        <span class="text-[var(--text-secondary)] font-bold text-xs shrink-0">➔</span>
    </button>

    <!-- KATMAN 3: TAKTİKSEL MODLAR (Bento Grid — 2x2 Dengeli Matris) -->
    <div class="grid grid-cols-2 gap-1.5 sm:gap-2 w-full flex-1 my-auto max-h-[145px]">
        <!-- 1. ⚔️ Arena Düello Kartı -->
        <button id="btn-open-match" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-sm group min-w-0 relative overflow-hidden">
            <div class="flex items-center justify-between w-full">
                <span class="text-xs sm:text-sm font-black text-[var(--accent-gold)] flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    <span>ARENA</span>
                </span>
                <span class="text-[8px] sm:text-[8.5px] font-mono font-black bg-[var(--bg-elevated)] text-[var(--accent-gold)] px-1 py-0.2 rounded border border-[var(--border-subtle)]">100 🪙</span>
            </div>
            <div class="mt-0.5">
                <span class="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] block leading-tight truncate" data-i18n="menu_arena_card_sub">Live & Ghost PvP</span>
            </div>
        </button>

        <!-- 2. 🌀 Serbest Mod Kartı -->
        <button id="btn-new-game" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-sm group min-w-0">
            <div class="flex items-center justify-between w-full">
                <span class="text-xs sm:text-sm font-black text-[var(--text-primary)] flex items-center gap-1" data-i18n="menu_new_game_title">FREE MODE</span>
                <span class="text-[8px] sm:text-[8.5px] font-mono font-bold bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-1 py-0.2 rounded border border-[var(--border-subtle)]">5 Modes</span>
            </div>
            <div class="mt-0.5">
                <span class="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] block leading-tight truncate" data-i18n="menu_new_game_sub">Classic, Killer, Samurai</span>
            </div>
        </button>

        <!-- 3. 📜 Sudoku Akademisi Kartı -->
        <button id="btn-menu-open-academy" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-sm group min-w-0">
            <div class="flex items-center justify-between w-full">
                <span class="text-xs sm:text-sm font-black text-[var(--accent-cyan)] flex items-center gap-1" data-i18n="menu_academy_card_title">ACADEMY</span>
                <span class="text-[8px] sm:text-[8.5px] font-mono font-bold bg-[var(--bg-elevated)] text-[var(--accent-cyan)] px-1 py-0.2 rounded border border-[var(--border-subtle)]">20 Lessons</span>
            </div>
            <div class="mt-0.5">
                <span class="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] block leading-tight truncate" data-i18n="menu_academy_card_sub">Simulator & Techniques</span>
            </div>
        </button>

        <!-- 4. 🎒 Yetenekler & Rün Ağacı Kartı -->
        <button id="btn-menu-open-abilities" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between text-left active:scale-[0.97] transition-all cursor-pointer shadow-sm group min-w-0">
            <div class="flex items-center justify-between w-full">
                <span class="text-xs sm:text-sm font-black text-purple-600 dark:text-purple-300 flex items-center gap-1" data-i18n="menu_abilities_card_title">ABILITIES</span>
                <span class="text-[8px] sm:text-[8.5px] font-mono font-bold bg-[var(--bg-elevated)] text-purple-600 dark:text-purple-300 px-1 py-0.2 rounded border border-[var(--border-subtle)]">Rune Tree</span>
            </div>
            <div class="mt-0.5">
                <span class="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] block leading-tight truncate" data-i18n="menu_abilities_card_sub">5 Spells & 25 Tiers</span>
            </div>
        </button>
    </div>

    <!-- Hızlı Harita Erişimi & İlerleme Şeridi (Zero-Scroll Harita Bağlantısı) -->
    <div class="w-full flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl py-1 px-3 text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] shrink-0">
        <button id="btn-menu-progress-pill" class="flex items-center gap-1.5 hover:text-[var(--text-primary)] cursor-pointer active:scale-95 transition-transform">
            <span class="w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse"></span>
            <span id="menu-progress-pill-text">Level 1 - Classic</span>
        </button>
        <button id="btn-open-map" class="text-[var(--accent-gold)] font-black hover:underline cursor-pointer active:scale-95 transition-transform flex items-center gap-1">
            <span>🗺️</span>
            <span data-i18n="tag_map">MAP</span>
            <span>➔</span>
        </button>
    </div>

    <!-- Floating Bottom Dock (Ekranın En Altındaki Alt Bar: 3 Eşit Sekme) -->
    <div class="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-3 sm:px-4 z-40" style="bottom: max(env(safe-area-inset-bottom, 0px), 0.75rem);">
        <div class="bg-[var(--bg-elevated)]/90 backdrop-blur-md border border-[var(--border-strong)] p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl shadow-2xl grid grid-cols-3 gap-1 sm:gap-1.5">
            <button id="btn-leaderboard" class="hover:bg-[var(--bg-card-hover)] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] min-w-0">
                <span class="text-sm sm:text-base text-[var(--accent-gold)] shrink-0">${Icons.trophy}</span>
                <span class="text-[9px] sm:text-[10px] truncate max-w-full" data-i18n="nav_rank">Sıralama</span>
            </button>
            <button id="btn-achievements" class="hover:bg-[var(--bg-card-hover)] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] relative min-w-0">
                <span class="text-sm sm:text-base text-[var(--accent-gold)] shrink-0">${Icons.crown}</span>
                <span class="text-[9px] sm:text-[10px] truncate max-w-full" data-i18n="menu_badges">Rozetler</span>
                <span id="badge-notify-dot" class="hidden absolute top-1.5 right-3 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
            <button id="btn-shop" class="hover:bg-[var(--bg-card-hover)] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] min-w-0">
                <span class="text-sm sm:text-base text-[var(--accent-cyan)] shrink-0">${Icons.dice}</span>
                <span class="text-[9px] sm:text-[10px] truncate max-w-full" data-i18n="menu_shop">Mağaza</span>
            </button>
        </div>
    </div>
</div>
`;
