import { Icons } from '../../../design/icons';

export function renderSlideDrawerMenu(): string {
  return `
    <!-- YANDAN AÇILIR ÇEKMECE MENÜ (Slide Drawer Menu) -->
    <div id="slide-drawer-menu" class="fixed inset-y-0 left-0 w-64 bg-[#0E1729]/95 backdrop-blur-2xl border-r border-[var(--border-strong)] shadow-2xl z-50 transform -translate-x-full transition-transform duration-300 ease-out flex flex-col hidden">
        <!-- Çekmece Üst Başlık (Header) -->
        <div class="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <div class="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" class="w-8 h-8 rounded-lg shadow-sm" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'#C89B3C\\'/><text x=\\'50%\\' y=\\'50%\\' font-size=\\'16\\' text-anchor=\\'middle\\' dy=\\'.3em\\'>S</text></svg>'">
                <span class="font-black text-lg text-[var(--accent-gold-bright)] tracking-wider drop-shadow-md">SudokuMap</span>
            </div>
            <button id="btn-close-drawer" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 text-xl cursor-pointer">✕</button>
        </div>

        <!-- Çekmece Navigasyon Öğeleri (Yüksek Kontrast & SudokuMap Gold Teması) -->
        <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
            <button id="btn-leaderboard" class="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#131F37]/90 hover:bg-[#1C2C4E] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/60 active:scale-[0.98] transition-all cursor-pointer group text-left shadow-md">
                <span class="text-xl text-[var(--accent-gold-bright)] group-hover:scale-110 transition-transform">${Icons.trophy}</span>
                <span class="font-black text-sm text-[var(--accent-gold-bright)] tracking-wide" data-i18n="nav_rank">Sıralama</span>
            </button>
            <button id="btn-achievements" class="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#131F37]/90 hover:bg-[#1C2C4E] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/60 active:scale-[0.98] transition-all cursor-pointer group text-left relative shadow-md">
                <span class="text-xl text-[var(--accent-gold-bright)] group-hover:scale-110 transition-transform">${Icons.crown}</span>
                <span class="font-black text-sm text-[var(--accent-gold-bright)] tracking-wide" data-i18n="menu_badges">Rozetler</span>
                <span id="badge-notify-dot" class="hidden absolute top-3.5 right-4 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-md border border-white/20"></span>
            </button>
            <button id="btn-menu-open-academy" class="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#131F37]/90 hover:bg-[#1C2C4E] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/60 active:scale-[0.98] transition-all cursor-pointer group text-left shadow-md">
                <span class="text-xl text-[var(--accent-cyan)] group-hover:scale-110 transition-transform">🎓</span>
                <span class="font-black text-sm text-[var(--accent-gold-bright)] tracking-wide" data-i18n="menu_academy_card_title">Akademi</span>
            </button>
            <button id="btn-menu-open-abilities" class="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#131F37]/90 hover:bg-[#1C2C4E] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/60 active:scale-[0.98] transition-all cursor-pointer group text-left shadow-md">
                <span class="text-xl text-purple-400 group-hover:scale-110 transition-transform">🎒</span>
                <span class="font-black text-sm text-[var(--accent-gold-bright)] tracking-wide" data-i18n="menu_abilities_card_title">Yetenekler</span>
            </button>
            <button id="btn-shop" class="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#131F37]/90 hover:bg-[#1C2C4E] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/60 active:scale-[0.98] transition-all cursor-pointer group text-left shadow-md">
                <span class="text-xl text-[var(--accent-cyan)] group-hover:scale-110 transition-transform">${Icons.dice}</span>
                <span class="font-black text-sm text-[var(--accent-gold-bright)] tracking-wide" data-i18n="menu_shop">Mağaza & Temalar</span>
            </button>

            <div class="h-px w-full bg-[var(--border-subtle)]/80 my-1"></div>

            <button id="btn-open-saved-games" class="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#131F37]/90 hover:bg-[#1C2C4E] border border-rose-500/40 hover:border-rose-400 active:scale-[0.98] transition-all cursor-pointer group text-left shadow-md hidden">
                <span class="text-xl text-rose-400 group-hover:scale-110 transition-transform">${Icons.target}</span>
                <span id="saved-games-count-label" class="font-black text-sm text-rose-300 tracking-wide" data-i18n="menu_active_games_title">Kayıtlı Oyunlarım</span>
            </button>

            <!-- Hızlı Ayarlar (Dil, Ses ve Gece/Gündüz Tema Seçimi) -->
            <div class="mt-auto flex gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <!-- Dil Seçici -->
                <button id="btn-drawer-lang-toggle" title="Dil / Language" data-i18n-title="tooltip_lang_toggle" class="flex-1 bg-[#131F37] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] p-2.5 rounded-xl text-xs font-mono font-black flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm cursor-pointer">
                    <span id="drawer-lang-opt-tr" class="text-[var(--accent-gold-bright)]">TR</span>
                    <span class="text-[var(--text-secondary)] opacity-50">|</span>
                    <span id="drawer-lang-opt-en" class="text-[var(--text-secondary)] opacity-50">EN</span>
                </button>
                <!-- Ses Aç / Kapa -->
                <button id="btn-drawer-sound-toggle" title="Ses Aç/Kapat" class="bg-[#131F37] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] p-2.5 rounded-xl flex items-center justify-center active:scale-95 transition-all text-[var(--accent-gold)] shadow-sm cursor-pointer w-11">
                    <span id="drawer-sound-icon">${Icons.volumeOn}</span>
                </button>
                <!-- Gece / Gündüz Tema Seçici -->
                <button id="btn-drawer-theme-toggle" title="Gündüz / Gece Teması" data-i18n-title="tooltip_theme_toggle" class="bg-[#131F37] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] px-2.5 py-2 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all text-xs shadow-sm cursor-pointer">
                    <span id="drawer-theme-opt-day" class="text-[var(--accent-gold)] flex items-center">${Icons.sun}</span>
                    <span class="text-[var(--text-secondary)] opacity-40 text-[9px]">|</span>
                    <span id="drawer-theme-opt-night" class="text-[var(--text-secondary)] opacity-50 flex items-center">${Icons.moon}</span>
                </button>
            </div>
        </div>
    </div>
    <!-- Çekmece Arkaplan Karartması (Overlay) -->
    <div id="drawer-overlay" class="fixed inset-0 bg-black/60 z-40 hidden backdrop-blur-sm transition-opacity opacity-0"></div>
  `;
}
