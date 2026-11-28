import { Icons } from '../../../design/icons';
import { renderBadgeCapsule } from '../core/BadgeCapsule';

export function renderHeaderStatusMatrix(): string {
  const streakCapsule = renderBadgeCapsule({
    id: 'menu-streak-capsule',
    icon: '🔥',
    valueId: 'menu-streak-count',
    initialValue: '1',
    textColorClass: 'text-amber-400',
    borderColorClass: 'border-amber-500/50',
    title: 'Daily Streak',
    i18nTitleKey: 'menu_streak_title',
  });

  const crystalCapsule = renderBadgeCapsule({
    id: 'menu-crystal-capsule',
    icon: '💎',
    valueId: 'menu-crystal-count',
    initialValue: '0',
    textColorClass: 'text-[var(--accent-cyan)]',
    borderColorClass: 'border-cyan-400/50',
    title: 'Rune Crystals',
    i18nTitleKey: 'abilities_title',
    isButton: true,
  });

  const goldCapsule = renderBadgeCapsule({
    id: 'menu-gold-capsule',
    icon: Icons.coin,
    valueId: 'menu-gold',
    initialValue: '150',
    textColorClass: 'text-[var(--accent-gold)]',
    borderColorClass: 'border-[var(--border-strong)]',
  });

  return `
    <!-- KATMAN 1: CURVED FLOATING GLASS TOP HUD ARC (Logo + Hamburger Menu) -->
    <div class="w-full bg-[#0E1729]/80 backdrop-blur-xl p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-2xl border border-[var(--border-strong)] flex justify-between items-center transition-all shrink-0 relative overflow-hidden z-20">
        <!-- Glow Highlight Arc Beam -->
        <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-10 bg-[var(--accent-gold)]/20 blur-xl pointer-events-none"></div>

        <!-- Sol Taraf: Hamburger Menü & Logo -->
        <div class="flex items-center gap-2 sm:gap-3 z-10">
            <button id="btn-open-drawer" class="text-[var(--text-primary)] hover:text-[var(--accent-gold)] p-1.5 rounded-lg hover:bg-[var(--bg-card)] active:scale-95 transition-all cursor-pointer">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div id="btn-open-profile" class="flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform">
                <img src="/logo.png" alt="SudokuMap" class="w-7 h-7 sm:w-8 sm:h-8 rounded-md shadow-sm" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'28\\' height=\\'28\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'#C89B3C\\'/><text x=\\'50%\\' y=\\'50%\\' font-size=\\'14\\' text-anchor=\\'middle\\' dy=\\'.3em\\'>S</text></svg>'">
                <div class="hidden sm:flex flex-col justify-center min-w-0">
                    <p id="menu-player-title" class="text-[8px] sm:text-[9px] text-[var(--accent-gold-bright)] font-black uppercase tracking-wider block truncate max-w-full leading-none drop-shadow">Apprentice</p>
                    <p id="menu-player-name" class="font-black text-[var(--text-primary)] text-[10px] sm:text-[11px] tracking-wide truncate max-w-full drop-shadow leading-none mt-0.5">Guest</p>
                </div>
            </div>
        </div>

        <!-- Sağ Taraf: İksir Tüpü Formatında Ekonomi Kapsülleri -->
        <div class="flex items-center gap-1 sm:gap-1.5 shrink-0 z-10">
            ${streakCapsule}
            ${crystalCapsule}
            ${goldCapsule}

            <!-- Bildirim Gelen Kutusu -->
            <button id="btn-open-inbox" title="Düello Gelen Kutusu" data-i18n-title="inbox_title" class="relative bg-[var(--bg-elevated)]/90 text-[var(--text-primary)] p-1.5 rounded-xl active:scale-95 transition-transform border border-[var(--border-subtle)] flex items-center justify-center text-xs cursor-pointer shadow-md">
                ${Icons.inbox}
                <span id="inbox-badge-count" class="hidden absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center animate-bounce shadow">0</span>
            </button>
        </div>
    </div>
  `;
}
