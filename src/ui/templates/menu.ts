import { Icons, renderAvatarSVG, renderBrandLogoHTML } from '../../design/icons';

export const menuTemplate = `
<div id="view-menu" class="flex-1 flex flex-col p-5 gap-3.5 pb-24 overflow-y-auto hidden-scrollbar relative">
    <!-- Üst Floating Header (Profil, Bildirim Çanı & Altın Kapsülü & Dil / Tema Seçici) -->
    <div class="w-full bg-[var(--bg-card)] p-3 rounded-2xl shadow-md border border-[var(--border-subtle)] flex justify-between items-center transition-all">
        <div id="btn-open-profile" class="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform flex-1 min-w-0 pr-2">
            <div id="menu-avatar-box" class="w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-xl shadow-inner shrink-0">
                ${renderAvatarSVG('av_prism', 24)}
            </div>
            <div class="truncate">
                <p id="menu-player-title" class="text-[10px] text-[var(--accent-gold)] font-bold uppercase tracking-wider block truncate">Çırak</p>
                <p id="menu-player-name" class="font-black text-[var(--text-primary)] text-sm tracking-wide truncate">Misafir</p>
            </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
            <!-- Dil Seçici (TR | EN) & Tema Seçici (Güneş | Ay) Dikey Kapsülü -->
            <div class="flex flex-col gap-1 shrink-0">
                <button id="btn-lang-toggle" title="Dil / Language" class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] px-2 py-1 rounded-lg text-[10px] font-mono font-black tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all">
                    <span id="lang-opt-tr" class="text-[var(--accent-gold)]">TR</span>
                    <span class="text-[var(--text-secondary)] opacity-50">|</span>
                    <span id="lang-opt-en" class="text-[var(--text-secondary)]">EN</span>
                </button>
                <button id="btn-theme-toggle" title="Gündüz / Gece Teması" class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] px-2 py-1 rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                    <span id="theme-opt-day" class="text-[var(--accent-gold)] flex items-center">${Icons.sun}</span>
                    <span class="text-[var(--text-secondary)] opacity-40 text-[9px]">|</span>
                    <span id="theme-opt-night" class="text-[var(--text-secondary)] opacity-50 flex items-center">${Icons.moon}</span>
                </button>
            </div>

            <!-- Ses Aç / Kapa Butonu -->
            <button id="btn-sound-toggle" title="Ses Aç / Kapa" class="bg-[var(--bg-elevated)] text-[var(--accent-gold)] p-2.5 rounded-2xl active:scale-95 transition-transform border border-[var(--border-subtle)] flex items-center justify-center">
                ${Icons.volumeOn}
            </button>

            <!-- Düello Gelen Kutusu (Inbox) Butonu -->
            <button id="btn-open-inbox" title="Düello Gelen Kutusu" class="relative bg-[var(--bg-elevated)] text-[var(--text-primary)] p-2.5 rounded-2xl active:scale-95 transition-transform border border-[var(--border-subtle)] flex items-center justify-center">
                ${Icons.inbox}
                <span id="inbox-badge-count" class="hidden absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow">0</span>
            </button>

            <!-- Altın Kapsülü -->
            <div class="bg-[var(--bg-elevated)] text-[var(--accent-gold)] font-black px-2.5 py-2 rounded-2xl text-xs border border-[var(--border-strong)] shadow-sm flex items-center gap-1 shrink-0">
                ${Icons.coin}
                <span id="menu-gold" class="font-mono font-black text-xs sm:text-sm text-[var(--text-primary)]">100</span>
            </div>
        </div>
    </div>

    <!-- Marka Logos & Amblem -->
    ${renderBrandLogoHTML()}

    <!-- PWA Yükleme Kartı -->
    <button id="btn-install-pwa" class="hidden w-full bg-[var(--bg-card)] text-[var(--text-primary)] p-3 rounded-2xl text-xs font-bold items-center justify-between shadow-sm transition-all border border-[var(--border-subtle)]">
        <div class="flex items-center gap-2">
            <span>${Icons.zap}</span>
            <span class="font-bold" data-i18n="menu_install_pwa">Uygulamayı Cihazına Yükle (PWA)</span>
        </div>
        <span class="bg-[var(--accent-gold)] text-[var(--text-on-gold)] text-[10px] font-black px-2.5 py-1 rounded-lg" data-i18n="menu_install_btn">YÜKLE</span>
    </button>

    <!-- Bento Grid Ana Aksiyonlar -->
    <div class="flex flex-col gap-3 my-auto w-full">
        <!-- Hero Kart: Aktif Oyunlarım Listesi -->
        <button id="btn-open-saved-games" style="background: var(--hero-bg);" class="w-full text-left rounded-3xl p-5 border border-[var(--border-strong)] border-t-2 border-t-[var(--accent-gold)]/70 shadow-lg active:scale-[0.98] transition-all flex justify-between items-center group cursor-pointer relative overflow-hidden">
            <div class="absolute -right-6 -bottom-6 w-28 h-28 bg-[var(--accent-gold)]/10 rounded-full blur-xl pointer-events-none"></div>
            <div class="pr-9 z-10">
                <div class="flex items-center gap-2 mb-1.5">
                    <span class="relative flex h-2.5 w-2.5 shrink-0">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-cyan)] opacity-60"></span>
                        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent-cyan)]"></span>
                    </span>
                    <span class="text-[10px] font-black uppercase tracking-widest text-[var(--accent-gold)]" id="saved-games-tag" data-i18n="menu_active_games_tag">Devam Et</span>
                </div>
                <span class="text-xl font-black block leading-tight text-[var(--hero-text)] tracking-wide" id="saved-games-title" data-i18n="menu_active_games_title">Aktif Oyunlarım</span>
                <span class="text-[var(--hero-subtext)] text-xs mt-1 block font-medium" id="saved-games-count-label">Seviye 1 • 0 Aktif Oyun</span>
            </div>
            <span class="text-2xl group-hover:translate-x-1.5 transition-transform text-[var(--accent-gold)] z-10">➔</span>
        </button>

        <!-- İkili Bento Satırı (PvP & Yeni Oyun) -->
        <div class="grid grid-cols-2 gap-3 w-full">
            <!-- Canlı Düello Kartı -->
            <button id="btn-open-match" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] rounded-3xl p-4 flex flex-col justify-between shadow-md active:scale-[0.97] transition-all border border-[var(--border-strong)] min-h-[120px] text-left group relative overflow-hidden">
                <div class="flex justify-between items-center w-full">
                    <span class="text-lg text-[var(--accent-gold)] group-hover:scale-110 transition-transform">${Icons.sword}</span>
                    <span class="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)] animate-pulse"></span>
                </div>
                <div>
                    <span class="text-[9px] font-black uppercase tracking-wider text-[var(--accent-gold)] block" data-i18n="menu_competition">REKABET</span>
                    <span class="text-sm font-black block leading-snug" data-i18n="menu_duel_arena">Düello Arenası</span>
                </div>
            </button>

            <!-- Yeni Oyun Başlat Kartı -->
            <button id="btn-new-game" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] rounded-3xl p-4 flex flex-col justify-between shadow-md active:scale-[0.97] transition-all border border-[var(--border-subtle)] min-h-[120px] text-left group">
                <div class="flex justify-between items-center w-full">
                    <span class="text-lg text-[var(--accent-cyan)] group-hover:rotate-12 transition-transform">${Icons.target}</span>
                    <span class="text-xs text-[var(--accent-gold)] font-bold" data-i18n="menu_variants_short">Disiplinler</span>
                </div>
                <div>
                    <span class="text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] block" data-i18n="menu_custom_mode_tag">SERBEST MOD</span>
                    <span class="text-sm font-black block leading-snug" data-i18n="menu_custom_mode_title">Klasik & Disiplinler</span>
                </div>
            </button>
        </div>

        <!-- Kompakt Aksiyon Şeritleri -->
        <button id="btn-open-map" class="w-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-2xl p-3.5 flex justify-between items-center shadow-sm text-xs font-black transition-all active:scale-[0.98]">
            <div class="flex items-center gap-2.5">
                <span class="text-base text-[var(--accent-gold)]">${Icons.map}</span>
                <span data-i18n="menu_map_banner">Yolculuk Haritası • 1000 Bölüm</span>
            </div>
            <span class="text-[var(--text-secondary)] font-bold">➔</span>
        </button>
    </div>

    <!-- Floating Bottom Dock (Ekranın En Altındaki Alt Bar) -->
    <div class="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-4 z-40">
        <div class="bg-[var(--bg-elevated)]/90 backdrop-blur-md border border-[var(--border-strong)] p-2 rounded-3xl shadow-2xl grid grid-cols-4 gap-1.5">
            <button id="btn-leaderboard" class="hover:bg-[var(--bg-card-hover)] p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)]">
                <span class="text-base text-[var(--accent-gold)]">${Icons.trophy}</span>
                <span class="text-[10px]" data-i18n="menu_leaderboard">Sıralama</span>
            </button>
            <button id="btn-achievements" class="hover:bg-[var(--bg-card-hover)] p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)] relative">
                <span class="text-base text-[var(--accent-gold)]">${Icons.crown}</span>
                <span class="text-[10px]" data-i18n="menu_badges">Rozetler</span>
                <span id="badge-notify-dot" class="hidden absolute top-2 right-4 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </button>
            <button id="btn-shop" class="hover:bg-[var(--bg-card-hover)] p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform text-[var(--text-primary)]">
                <span class="text-base text-[var(--accent-cyan)]">${Icons.dice}</span>
                <span class="text-[10px]" data-i18n="menu_shop">Mağaza</span>
            </button>
            <button id="btn-daily-reward" class="bg-[var(--accent-gold)] text-[var(--text-on-gold)] p-2.5 rounded-2xl text-center font-bold text-xs flex flex-col items-center gap-0.5 active:scale-95 transition-transform shadow-md">
                <span id="daily-reward-icon" class="text-base">${Icons.zap}</span>
                <span id="daily-reward-text" class="text-[10px] font-black" data-i18n="menu_daily">Günlük</span>
            </button>
        </div>
    </div>
</div>
`;
