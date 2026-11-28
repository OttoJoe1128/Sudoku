import { Icons } from '../../../design/icons';

export function renderSlideDrawerMenu(): string {
  return `
    <!-- YANDAN AÇILIR ÇEKMECE MENÜ (Slide Drawer Menu) -->
    <div id="slide-drawer-menu" class="fixed inset-y-0 left-0 w-64 bg-[#0E1729]/95 backdrop-blur-2xl border-r border-[var(--border-strong)] shadow-2xl z-50 transform -translate-x-full transition-transform duration-300 ease-out flex flex-col hidden">
        <!-- Çekmece Üst Başlık (Header) -->
        <div class="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <div class="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" class="w-8 h-8 rounded-lg shadow-sm" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'#C89B3C\\'/><text x=\\'50%\\' y=\\'50%\\' font-size=\\'16\\' text-anchor=\\'middle\\' dy=\\'.3em\\'>S</text></svg>'">
                <span class="font-black text-lg text-[var(--accent-gold)] tracking-wider">SudokuMap</span>
            </div>
            <button id="btn-close-drawer" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 text-xl cursor-pointer">✕</button>
        </div>

        <!-- Çekmece Navigasyon Öğeleri -->
        <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            <button id="btn-leaderboard" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#172540] active:scale-[0.98] transition-all cursor-pointer border border-transparent hover:border-[var(--border-subtle)] group text-left">
                <span class="text-xl text-[var(--accent-gold)] group-hover:scale-110 transition-transform">${Icons.trophy}</span>
                <span class="font-bold text-sm text-[var(--text-primary)]" data-i18n="nav_rank">Sıralama</span>
            </button>
            <button id="btn-achievements" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#172540] active:scale-[0.98] transition-all cursor-pointer border border-transparent hover:border-[var(--border-subtle)] group text-left relative">
                <span class="text-xl text-[var(--accent-gold)] group-hover:scale-110 transition-transform">${Icons.crown}</span>
                <span class="font-bold text-sm text-[var(--text-primary)]" data-i18n="menu_badges">Rozetler</span>
                <span id="badge-notify-dot" class="hidden absolute top-3 right-4 w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow"></span>
            </button>
            <button id="btn-menu-open-academy" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#172540] active:scale-[0.98] transition-all cursor-pointer border border-transparent hover:border-[var(--border-subtle)] group text-left">
                <span class="text-xl text-[var(--accent-cyan)] group-hover:scale-110 transition-transform">🎓</span>
                <span class="font-bold text-sm text-[var(--text-primary)]" data-i18n="menu_academy_card_title">Akademi</span>
            </button>
            <button id="btn-menu-open-abilities" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#172540] active:scale-[0.98] transition-all cursor-pointer border border-transparent hover:border-[var(--border-subtle)] group text-left">
                <span class="text-xl text-purple-400 group-hover:scale-110 transition-transform">🎒</span>
                <span class="font-bold text-sm text-[var(--text-primary)]" data-i18n="menu_abilities_card_title">Yetenekler</span>
            </button>
            <button id="btn-shop" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#172540] active:scale-[0.98] transition-all cursor-pointer border border-transparent hover:border-[var(--border-subtle)] group text-left">
                <span class="text-xl text-[var(--accent-cyan)] group-hover:scale-110 transition-transform">${Icons.dice}</span>
                <span class="font-bold text-sm text-[var(--text-primary)]" data-i18n="menu_shop">Mağaza & Temalar</span>
            </button>

            <div class="h-px w-full bg-[var(--border-subtle)] my-2"></div>

            <button id="btn-open-saved-games" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#172540] active:scale-[0.98] transition-all cursor-pointer border border-transparent hover:border-[var(--border-subtle)] group text-left hidden">
                <span class="text-xl text-rose-400 group-hover:scale-110 transition-transform">${Icons.target}</span>
                <span id="saved-games-count-label" class="font-bold text-sm text-[var(--text-primary)]" data-i18n="menu_active_games_title">Kayıtlı Oyunlarım</span>
            </button>

            <!-- Hızlı Ayarlar (Dil ve Ses) -->
            <div class="mt-auto flex gap-2 pt-4">
                <button id="btn-lang-toggle" title="Dil / Language" data-i18n-title="tooltip_lang_toggle" class="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] p-2 rounded-xl text-xs font-mono font-black flex items-center justify-center gap-1 active:scale-95 transition-all">
                    <span id="lang-opt-tr" class="text-[var(--accent-gold)]">TR</span>
                    <span class="text-[var(--text-secondary)] opacity-50">|</span>
                    <span id="lang-opt-en" class="text-[var(--text-secondary)] opacity-50">EN</span>
                </button>
                <button id="btn-sound-toggle" title="Ses Aç/Kapat" class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] p-2 rounded-xl flex items-center justify-center active:scale-95 transition-all w-12 text-[var(--accent-gold)]">
                    ${Icons.volumeOn}
                </button>
            </div>
        </div>
    </div>
    <!-- Çekmece Arkaplan Karartması (Overlay) -->
    <div id="drawer-overlay" class="fixed inset-0 bg-black/60 z-40 hidden backdrop-blur-sm transition-opacity opacity-0"></div>
  `;
}
