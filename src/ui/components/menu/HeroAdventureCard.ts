import { renderCustomButton } from '../core/CustomButton';

export function renderHeroAdventureCard(): string {
  const quickPlayBtn = renderCustomButton({
    id: 'btn-quick-play',
    variant: 'gold',
    extraClasses: 'w-full rounded-2xl py-3 shadow-2xl flex items-center justify-between cursor-pointer border-2 border-[var(--border-strong)] mt-1.5 polygon-btn-3d group hover:brightness-110 active:scale-95 transition-all',
    content: `
      <div class="flex items-center gap-3 min-w-0 px-4">
          <span class="w-3 h-3 rounded-full bg-[var(--text-on-gold)] animate-ping shrink-0 shadow-lg"></span>
          <span id="menu-journey-btn-label" class="text-sm sm:text-base font-black tracking-widest uppercase font-sans truncate drop-shadow-md" data-i18n="menu_journey_continue">CONTINUE JOURNEY</span>
      </div>
      <div class="w-8 h-8 mr-2 rounded-xl bg-[var(--text-on-gold)]/20 flex items-center justify-center text-sm font-black shrink-0 border border-black/10">➔</div>
    `
  });

  return `
    <!-- KATMAN 2: DEVASE SİNEMATİK MACERA & HARİTA ANITI (Hero Command Center) -->
    <div class="w-full border-2 border-[var(--border-strong)] rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden group transition-all spatial-glass-card mt-1 mb-2 min-h-[160px]" style="background: var(--hero-bg); color: var(--hero-text);">
        <!-- Rotating Rune Ring Backdrop Particles -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-amber-400/20 rounded-full rune-portal-ring pointer-events-none opacity-60"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-400/20 rounded-full rune-portal-ring-reverse pointer-events-none opacity-80"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[var(--accent-gold)]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col items-center justify-center w-full mb-3 z-10 text-center relative mt-2">
            <span id="quick-play-title" class="text-sm sm:text-base font-black block leading-tight tracking-widest uppercase text-[var(--accent-gold-bright)] font-mono drop-shadow-lg mb-1">CHAPTER 1</span>
            <span id="quick-play-subtitle" class="text-xs sm:text-sm font-bold text-[var(--hero-subtext)] block truncate drop-shadow-md bg-[#0E1729]/50 px-3 py-1 rounded-full border border-[var(--border-subtle)]">Level 1 - Classic</span>

            <!-- Aktif Bölüm Enerjisi Rozeti -->
            <div id="hero-energy-badge" class="absolute -top-3 -right-2 bg-[#0E1729]/90 backdrop-blur-md text-[var(--accent-gold)] border border-[var(--border-strong)] px-2.5 py-1 rounded-full text-[9px] font-mono font-black flex items-center gap-1 shadow-lg shrink-0">
                ⚡ <span>Energy</span>
            </div>
        </div>

        <!-- Devasa Poligon Kinetik 3D Çağrı Butonu -->
        <div class="z-10 w-full mt-auto">
            ${quickPlayBtn}
        </div>

        <!-- Canlı İlerleme Çubuğu -->
        <div class="absolute bottom-0 left-0 w-full bg-[#070D19]/80 h-1.5 overflow-hidden flex shadow-inner z-10">
            <div id="quick-play-progress-bar" class="bg-gradient-to-r from-[var(--accent-cyan)] to-emerald-400 h-full transition-all duration-500 shadow-md" style="width: 10%"></div>
        </div>
    </div>
  `;
}
