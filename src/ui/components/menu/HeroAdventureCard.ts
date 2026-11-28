import { renderCustomButton } from '../core/CustomButton';

export function renderHeroAdventureCard(): string {
  const quickPlayBtn = renderCustomButton({
    id: 'btn-quick-play',
    variant: 'gold',
    extraClasses: 'w-full rounded-xl sm:rounded-2xl py-2 px-3 sm:py-2.5 shadow-2xl flex items-center justify-between cursor-pointer border-2 border-[var(--border-strong)] mt-1.5 polygon-btn-3d group hover:brightness-110 active:scale-95 transition-all',
    content: `
      <div class="flex items-center gap-2 min-w-0 pr-1">
          <span class="w-2.5 h-2.5 rounded-full bg-[var(--text-on-gold)] animate-ping shrink-0 shadow"></span>
          <span id="menu-journey-btn-label" class="text-xs sm:text-sm font-black tracking-widest uppercase font-sans truncate drop-shadow" data-i18n="menu_journey_continue">CONTINUE JOURNEY</span>
      </div>
      <div class="w-6 h-6 rounded-lg bg-[var(--text-on-gold)]/20 flex items-center justify-center text-xs font-black shrink-0 border border-black/10">➔</div>
    `
  });

  return `
    <!-- KATMAN 2: CENTRAL HOLOGRAPHIC RUNE PORTAL & STAGE (Hero Command Center) -->
    <div class="w-full border-2 border-[var(--border-strong)] rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-2xl flex flex-col justify-between relative overflow-hidden group transition-all spatial-glass-card" style="background: var(--hero-bg); color: var(--hero-text);">
        <!-- Rotating Rune Ring Backdrop Particles -->
        <div class="absolute -right-12 -top-12 w-40 h-40 border border-amber-400/20 rounded-full rune-portal-ring pointer-events-none"></div>
        <div class="absolute -right-8 -top-8 w-32 h-32 border border-cyan-400/20 rounded-full rune-portal-ring-reverse pointer-events-none"></div>
        <div class="absolute -right-16 -top-16 w-48 h-48 bg-[var(--accent-gold)]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex items-center justify-between w-full mb-1 z-10">
            <div class="text-left min-w-0 pr-2">
                <span id="quick-play-title" class="text-xs sm:text-sm font-black block leading-tight tracking-widest uppercase text-[var(--accent-gold-bright)] font-mono drop-shadow">CHAPTER 1</span>
                <span id="quick-play-subtitle" class="text-[9.5px] sm:text-[10.5px] font-bold text-[var(--hero-subtext)] block mt-0.5 truncate drop-shadow">Level 1 - Classic</span>
            </div>
            <!-- Aktif Bölüm Enerjisi Rozeti -->
            <div id="hero-energy-badge" class="bg-[#0E1729]/90 backdrop-blur-md text-[var(--accent-gold)] border border-[var(--border-strong)] px-2.5 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-mono font-black flex items-center gap-1 shadow-lg shrink-0">
                ⚡ <span>Energy</span>
            </div>
        </div>

        <!-- Devasa Poligon Kinetik 3D Çağrı Butonu -->
        <div class="z-10 w-full">
            ${quickPlayBtn}
        </div>

        <!-- Canlı İlerleme Çubuğu -->
        <div class="w-full bg-[#070D19]/60 h-1.5 rounded-full overflow-hidden flex shadow-inner mt-2 border border-white/10 z-10">
            <div id="quick-play-progress-bar" class="bg-gradient-to-r from-[var(--accent-cyan)] to-emerald-400 h-full transition-all duration-500 rounded-full shadow-md" style="width: 10%"></div>
        </div>
    </div>
  `;
}
