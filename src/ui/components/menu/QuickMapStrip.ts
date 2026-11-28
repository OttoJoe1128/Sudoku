export function renderQuickMapStrip(): string {
  return `
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
  `;
}
