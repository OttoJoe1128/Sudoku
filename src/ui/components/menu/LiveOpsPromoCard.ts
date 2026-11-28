import { SeasonalEventManager, getCurrentSeason, SeasonId } from '../../../engine/seasonalEvents';
import { t } from '../../../i18n/translations';

export function renderMiniStampsGridHTML(seasonId: SeasonId): string {
  const collectedStamps = SeasonalEventManager.getCollectedStamps(seasonId);
  return Array.from({ length: 9 }, (_, i) => {
    const isUnlocked = collectedStamps.includes(i);
    const src = `/assets/season/stamps/stamp_${i + 1}.svg`;
    const bgClass = isUnlocked
      ? 'bg-amber-500/20 border-amber-400/80 shadow-md text-amber-300'
      : 'bg-[#0E1729]/80 border-[var(--border-subtle)] opacity-40 text-slate-500';
    return `
      <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-md border ${bgClass} flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden relative">
        ${isUnlocked ? `<img src="${src}" alt="Stamp ${i + 1}" class="w-full h-full object-cover" onerror="this.outerHTML='<span class=\\'text-amber-400 font-mono text-[9px] font-black\\'>${i + 1}</span>'">` : '🔒'}
      </div>
    `;
  }).join('');
}

export function renderLiveOpsPromoCard(): string {
  const currentSeason = getCurrentSeason();
  const collectedStamps = SeasonalEventManager.getCollectedStamps(currentSeason.id);
  const miniStamps = renderMiniStampsGridHTML(currentSeason.id);

  return `
    <!-- KATMAN 3: SİNEMATİK TAM GENİŞLİK CANLI ETKİNLİK AFİŞ VİTRİNİ -->
    <div class="w-full flex flex-col gap-2 shrink-0 my-1">

        <!-- 📮 Sezon Kartpostalı Holografik Afişi (Edge-to-Edge Style) -->
        <button id="btn-open-postcards" class="w-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border-y-2 sm:border-2 border-[var(--border-strong)] sm:rounded-2xl p-3 flex justify-between items-center active:scale-[0.99] transition-all cursor-pointer shadow-xl relative overflow-hidden group text-left -mx-2.5 sm:mx-0 px-5 sm:px-4" style="width: calc(100% + 1.25rem); max-width: none;">
            <!-- Afiş Arka Planı (Kyoto/Season Background) -->
            <img src="/assets/season/season_kyoto_bg.svg" alt="Season" class="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity">
            <div class="absolute inset-0 bg-gradient-to-r from-[#070D19] via-[#070D19]/85 to-transparent"></div>

            <div class="flex flex-col justify-center z-10 w-1/2 pr-2">
                <div class="flex items-center gap-1.5 min-w-0 mb-1">
                    <img src="/logo.png" alt="Logo" class="w-4 h-4 rounded-sm shadow-sm" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'16\\' height=\\'16\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'#C89B3C\\'/></svg>'">
                    <span id="menu-season-pill-text" class="text-[10px] sm:text-xs font-black text-[var(--accent-gold-bright)] truncate uppercase tracking-widest drop-shadow-md" data-i18n="${currentSeason.nameKey}">${t(currentSeason.nameKey)}</span>
                </div>

                <span id="menu-season-stamps-count" class="text-[9px] font-bold text-[var(--text-secondary)] mb-1">${t('season_stamps_progress', { current: collectedStamps.length })}</span>

                <div class="flex flex-wrap gap-1 mt-1">
                    <span class="text-[9px] font-mono font-black bg-[#0E1729]/80 text-[var(--accent-gold)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] drop-shadow">+${currentSeason.rewardGold} 🪙</span>
                    <span class="text-[9px] font-mono font-black bg-[#0E1729]/80 text-[var(--accent-cyan)] px-1.5 py-0.5 rounded border border-cyan-500/30 drop-shadow">+${currentSeason.rewardCrystals} 💎</span>
                </div>
            </div>

            <!-- Görsel 3x3 Dinamik Pul Matrisi (Afişin Sağında) -->
            <div class="z-10 bg-[#070D19]/70 p-1.5 rounded-xl border border-[var(--border-strong)] backdrop-blur-sm shadow-lg transform rotate-2 group-hover:rotate-0 transition-transform">
                <div id="menu-season-stamps-grid" class="grid grid-cols-3 gap-1 shrink-0">
                    ${miniStamps}
                </div>
            </div>
        </button>

    </div>
  `;
}
