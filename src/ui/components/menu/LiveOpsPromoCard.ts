export function renderLiveOpsPromoCard(): string {
  // 3x3 Mini Pul Matrisi Temsili (Mistik Kyoto Sezonu Visual Teaser)
  const miniStamps = Array.from({ length: 9 }, (_, i) => {
    const isUnlocked = i < 4; // Örnek 4/9 unlocked
    const bgClass = isUnlocked ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] opacity-40';
    const icon = isUnlocked ? '⛩️' : '🔒';
    return `<div class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border ${bgClass} flex items-center justify-center text-[8px] font-bold shrink-0">${icon}</div>`;
  }).join('');

  return `
    <!-- KATMAN 2.5: CANLI ETKİNLİK GÖRSEL PROMOSYON VİTRİNİ (Live-Ops Showcase Promo Card) -->
    <div class="w-full flex gap-1.5 sm:gap-2 shrink-0 my-0.5">
        <!-- Sol: 📮 Sezon Kartpostalı Görsel Promosyon Kartı -->
        <button id="btn-open-postcards" class="flex-1 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-strong)] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm relative overflow-hidden group btn-3d-card text-left">
            <div class="flex items-center justify-between w-full mb-1">
                <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-sm shrink-0">📮</span>
                    <span id="menu-season-pill-text" class="text-[10px] sm:text-xs font-black text-[var(--accent-gold)] truncate uppercase tracking-wider" data-i18n="season_btn_menu">Season</span>
                </div>
                <span id="menu-season-stamps-count" class="text-[8.5px] sm:text-[9px] font-mono font-black bg-[var(--bg-elevated)] text-[var(--accent-gold)] px-1.5 py-0.5 rounded-full border border-[var(--border-subtle)] shrink-0 shadow-inner">4/9</span>
            </div>

            <!-- Görsel 3x3 Pul Matrisi & Ödül Teaser -->
            <div class="flex items-center justify-between my-1 bg-[var(--bg-elevated)]/80 p-1.5 rounded-xl border border-[var(--border-subtle)]">
                <div class="grid grid-cols-3 gap-0.5 shrink-0">
                    ${miniStamps}
                </div>
                <div class="text-right pl-1 min-w-0">
                    <span class="text-[8px] font-mono font-black text-[var(--accent-gold)] block leading-tight">+150 🪙</span>
                    <span class="text-[8px] font-mono font-black text-[var(--accent-cyan)] block leading-tight">+20 💎</span>
                    <span class="text-[7.5px] font-bold text-[var(--text-secondary)] block truncate leading-tight mt-0.5">Special Theme</span>
                </div>
            </div>
        </button>

        <!-- Sağ: ⛩️ Klan Samurai Zindanı Promosyon Kartı -->
        <button id="btn-open-clan" class="flex-1 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-rose-500/40 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm relative overflow-hidden group btn-3d-card text-left">
            <div class="flex items-center justify-between w-full mb-1">
                <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-sm shrink-0">⛩️</span>
                    <span id="menu-clan-pill-text" class="text-[10px] sm:text-xs font-black text-rose-500 dark:text-rose-400 truncate uppercase tracking-wider" data-i18n="menu_clan_title">Clan Dungeon</span>
                </div>
            </div>

            <!-- Klan Boss Amblemi & Toz İlerlemesi -->
            <div class="flex items-center justify-between my-1 bg-rose-950/20 p-1.5 rounded-xl border border-rose-500/30">
                <div class="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-base shrink-0 shadow-inner">
                    👹
                </div>
                <div class="text-right pl-1 min-w-0">
                    <span class="text-[8px] font-mono font-black text-rose-400 block leading-tight">Boss Level 3</span>
                    <span id="menu-clan-dust-count" class="text-[8.5px] font-mono font-bold text-rose-300 block leading-tight mt-0.5">350/500 Dust</span>
                </div>
            </div>
        </button>
    </div>
  `;
}
