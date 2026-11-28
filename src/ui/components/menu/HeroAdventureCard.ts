import { renderCustomButton } from '../core/CustomButton';

export function renderHeroAdventureCard(): string {
  const quickPlayBtn = renderCustomButton({
    id: 'btn-quick-play',
    variant: 'gold',
    extraClasses: 'w-full rounded-2xl py-3 shadow-xl flex items-center justify-between cursor-pointer border-2 border-[var(--accent-gold)]/60 bg-gradient-to-r from-amber-950/80 via-[#161208]/90 to-amber-950/80 hover:brightness-125 active:scale-95 transition-all text-[var(--accent-gold-bright)] mt-1',
    content: `
      <div class="flex items-center gap-3 min-w-0 px-4">
          <span class="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)] animate-ping shrink-0 shadow-lg"></span>
          <span id="menu-journey-btn-label" class="text-sm sm:text-base font-black tracking-widest uppercase font-sans truncate drop-shadow-md text-[var(--accent-gold-bright)]" data-i18n="menu_journey_continue">CONTINUE JOURNEY</span>
      </div>
      <div class="w-8 h-8 mr-2 rounded-xl bg-[var(--accent-gold)]/20 text-[var(--accent-gold-bright)] flex items-center justify-center text-sm font-black shrink-0 border border-[var(--accent-gold)]/30">➔</div>
    `
  });

  return `
    <!-- KATMAN 2: DEVASE SİNEMATİK MACERA & HARİTA ANITI (Hero Command Center - Bento Dark Harmony) -->
    <div class="w-full border-2 border-[var(--border-strong)] rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden group transition-all spatial-glass-card mt-1 mb-2 min-h-[160px] bg-[#0E1729]/90 text-[var(--text-primary)]">
        <!-- Ambient Glow & Subtle Particles -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-amber-400/10 rounded-full rune-portal-ring pointer-events-none opacity-40"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-400/10 rounded-full rune-portal-ring-reverse pointer-events-none opacity-50"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[var(--accent-gold)]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col items-center justify-center w-full mb-3 z-10 text-center relative mt-2">
            <span id="quick-play-title" class="text-sm sm:text-base font-black block leading-tight tracking-widest uppercase text-[var(--accent-gold-bright)] font-mono drop-shadow-lg mb-1">CHAPTER 1</span>
            <span id="quick-play-subtitle" class="text-xs sm:text-sm font-bold text-[var(--text-secondary)] block truncate drop-shadow-md bg-[#070D19]/80 px-3 py-1 rounded-full border border-[var(--border-subtle)]">Level 1 - Classic</span>

            <!-- Aktif Bölüm Enerjisi Rozeti -->
            <div id="hero-energy-badge" class="absolute -top-3 -right-2 bg-[#070D19]/90 backdrop-blur-md text-[var(--accent-gold)] border border-[var(--border-strong)] px-2.5 py-1 rounded-full text-[9px] font-mono font-black flex items-center gap-1 shadow-lg shrink-0">
                ⚡ <span>Energy</span>
            </div>
        </div>

        <!-- Bento Uyumlu Poligon Kinetik 3D Çağrı Butonu -->
        <div class="z-10 w-full mt-auto">
            ${quickPlayBtn}
        </div>

        <!-- Canlı İlerleme Çubuğu -->
        <div class="absolute bottom-0 left-0 w-full bg-[#070D19]/90 h-1.5 overflow-hidden flex shadow-inner z-10 border-t border-[var(--border-subtle)]">
            <div id="quick-play-progress-bar" class="bg-gradient-to-r from-[var(--accent-cyan)] to-emerald-400 h-full transition-all duration-500 shadow-md" style="width: 10%"></div>
        </div>
    </div>
  `;
}
