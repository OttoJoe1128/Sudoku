import { renderCustomButton } from '../core/CustomButton';

export function renderHeroAdventureCard(): string {
  const quickPlayBtn = renderCustomButton({
    id: 'btn-quick-play',
    variant: 'gold',
    extraClasses: 'w-full rounded-xl sm:rounded-2xl py-2 px-3 shadow-lg flex items-center justify-between cursor-pointer border border-[var(--border-strong)] mt-0.5',
    content: `
      <div class="flex items-center gap-2 min-w-0 pr-1">
          <span class="w-2 h-2 rounded-full bg-[var(--text-on-gold)] animate-ping shrink-0"></span>
          <span id="menu-journey-btn-label" class="text-xs sm:text-sm font-black tracking-wider uppercase font-sans truncate" data-i18n="menu_journey_continue">CONTINUE JOURNEY</span>
      </div>
      <div class="w-5 h-5 rounded-lg bg-[var(--text-on-gold)]/20 flex items-center justify-center text-xs font-black shrink-0">➔</div>
    `
  });

  return `
    <!-- KATMAN 2: CANLI MACERA VİTRİNİ (Hero Card) -->
    <div class="w-full border border-[var(--border-strong)] rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all rune-glow-card" style="background: var(--hero-bg); color: var(--hero-text);">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-[var(--accent-gold)]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="flex items-center justify-between w-full mb-1">
            <div class="text-left min-w-0 pr-2">
                <span id="quick-play-title" class="text-xs sm:text-sm font-black block leading-tight tracking-wider uppercase text-[var(--accent-gold)] font-mono">CHAPTER 1</span>
                <span id="quick-play-subtitle" class="text-[9.5px] sm:text-[10.5px] font-bold text-[var(--hero-subtext)] block mt-0.5 truncate">Level 1 - Classic</span>
            </div>
            <!-- Aktif Bölüm Enerjisi Rozeti -->
            <div id="hero-energy-badge" class="bg-[var(--bg-elevated)] text-[var(--accent-gold)] border border-[var(--border-strong)] px-2 py-0.5 rounded-full text-[8.5px] font-mono font-black flex items-center gap-1 shadow-sm shrink-0">
                ⚡ <span>Energy</span>
            </div>
        </div>

        <!-- Devasa Çağrı Butonu: YOLCULUĞA DEVAM ET / BAŞLA (Theme-Aware 3D Çağrı Butonu) -->
        ${quickPlayBtn}

        <!-- Canlı İlerleme Çubuğu -->
        <div class="w-full bg-[#070D19]/40 h-1 rounded-full overflow-hidden flex shadow-inner mt-1.5 border border-white/5">
            <div id="quick-play-progress-bar" class="bg-[var(--accent-cyan)] h-full transition-all duration-300 rounded-full" style="width: 10%"></div>
        </div>
    </div>
  `;
}
