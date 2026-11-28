import { Icons } from '../../../design/icons';

export function renderSavedGamesStrip(): string {
  return `
    <!-- Koşullu Kayıtlı Oyunlar Şeridi (Yarım kalan oyun varsa görünür) -->
    <button id="btn-open-saved-games" class="hidden w-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl p-2 justify-between items-center shadow-sm text-xs font-black transition-all active:scale-[0.98] shrink-0">
        <div class="flex items-center gap-2 shrink-0">
            <span class="text-sm text-[var(--accent-gold)] shrink-0">${Icons.target}</span>
            <span id="saved-games-count-label" data-i18n="menu_active_games_title" class="truncate">Aktif Oyunlarım</span>
        </div>
        <span class="text-[var(--text-secondary)] font-bold text-xs shrink-0">➔</span>
    </button>
  `;
}
