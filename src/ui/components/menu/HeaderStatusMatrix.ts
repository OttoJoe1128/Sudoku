import { Icons, renderAvatarSVG } from '../../../design/icons';
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
    <!-- KATMAN 1: CURVED FLOATING GLASS TOP HUD ARC (Curved Spatial Arc) -->
    <div class="w-full bg-[#0E1729]/80 backdrop-blur-xl p-2 rounded-2xl sm:rounded-3xl shadow-2xl border border-[var(--border-strong)] flex justify-between items-center transition-all shrink-0 relative overflow-hidden">
        <!-- Glow Highlight Arc Beam -->
        <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-10 bg-[var(--accent-gold)]/20 blur-xl pointer-events-none"></div>

        <!-- Oyuncu Profili, Dinamik Lig Çerçevesi & Aktif Kalıntı Yuvası -->
        <div id="btn-open-profile" class="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform flex-1 min-w-0 pr-1 z-10">
            <div id="menu-avatar-box" class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#111C31] border-2 border-[var(--border-strong)] flex items-center justify-center text-lg shadow-2xl shrink-0 ring-2 ring-amber-400/80">
                ${renderAvatarSVG('av_prism', 24)}
                <!-- Dinamik Lig Arması (Rank Crest) -->
                <span id="menu-league-badge" class="absolute -top-1.5 -left-1.5 text-[9.5px] w-4.5 h-4.5 rounded-full bg-[#0E1729] border border-amber-400/80 flex items-center justify-center shadow-lg z-20" title="League Crest" data-i18n-title="league_modal_title">🥉</span>
                <!-- Aktif Kalıntı Yuvası (Relic Trinket) -->
                <div id="menu-relic-trinket" class="absolute -bottom-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-[#0E1729] border border-amber-400/90 flex items-center justify-center text-[9px] shadow-lg z-20" title="Equipped Relic" data-i18n-title="relic_trinket_title">🧭</div>
            </div>
            <div class="truncate flex-1 min-w-0">
                <p id="menu-player-title" class="text-[8.5px] sm:text-[9.5px] text-[var(--accent-gold-bright)] font-black uppercase tracking-wider block truncate max-w-full leading-tight drop-shadow">Apprentice</p>
                <p id="menu-player-name" class="font-black text-[var(--text-primary)] text-xs sm:text-sm tracking-wide truncate max-w-full drop-shadow">Guest</p>
            </div>
        </div>

        <!-- Seri & Çift Para Birimi Kapsülleri -->
        <div class="flex items-center gap-1 sm:gap-1.5 shrink-0 z-10">
            ${streakCapsule}
            ${crystalCapsule}
            ${goldCapsule}

            <!-- Günlük Ödül & Gelen Kutusu -->
            <button id="btn-daily-reward" title="Günlük Ödül" data-i18n-title="menu_daily" class="relative bg-[var(--bg-elevated)]/90 text-[var(--accent-gold)] p-1.5 rounded-xl active:scale-95 transition-all border border-[var(--border-strong)] flex items-center justify-center text-xs shadow-md cursor-pointer">
                <span id="daily-reward-icon">${Icons.zap}</span>
                <span id="daily-reward-dot" class="hidden absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)] animate-pulse shadow"></span>
            </button>
            <button id="btn-open-inbox" title="Düello Gelen Kutusu" data-i18n-title="inbox_title" class="relative bg-[var(--bg-elevated)]/90 text-[var(--text-primary)] p-1.5 rounded-xl active:scale-95 transition-transform border border-[var(--border-subtle)] flex items-center justify-center text-xs cursor-pointer">
                ${Icons.inbox}
                <span id="inbox-badge-count" class="hidden absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center animate-bounce shadow">0</span>
            </button>
        </div>
    </div>
  `;
}
