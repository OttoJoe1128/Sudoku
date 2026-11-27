import { Icons } from '../../design/icons';

export const leagueModalTemplate = `
<div id="league-modal" class="fixed inset-0 bg-slate-950/85 hidden flex-col items-center justify-center z-[89] p-4 backdrop-blur-md font-sans">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto hidden-scrollbar border border-[var(--border-strong)]">
        <button id="btn-close-league" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] p-2 rounded-full text-xs font-bold transition-colors cursor-pointer z-30">✕</button>

        <!-- Lig Arması -->
        <div class="text-center mb-3">
            <div id="league-modal-icon" class="w-16 h-16 bg-amber-500/20 border-2 border-amber-400 text-amber-300 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-2 shadow-inner animate-pulse">
                🥇
            </div>
            <h3 id="league-modal-name" class="text-xl font-black text-[var(--text-primary)] mb-0.5" data-i18n="league_gold">Gold League</h3>
            <div class="flex items-center justify-center gap-2 mt-0.5">
                <span id="league-modal-rating" class="text-xs font-mono text-[var(--accent-gold)] font-bold">1500 MMR</span>
                <span class="text-slate-500">•</span>
                <span id="league-season-days-label" class="text-[10px] text-amber-300 font-bold">6 Days Left</span>
            </div>
        </div>

        <!-- İlerleme Çubuğu -->
        <div class="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3.5 text-center my-2 shadow-sm">
            <div class="flex justify-between items-center mb-1">
                <span class="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider" data-i18n="league_next_tier_title">Next Tier</span>
                <span id="league-next-name-label" class="text-[10px] font-bold text-cyan-400">Platinum</span>
            </div>
            <div class="w-full bg-[#070D19]/30 h-2.5 rounded-full overflow-hidden flex border border-[var(--border-subtle)]">
                <div id="league-progress-bar" class="bg-gradient-to-r from-amber-400 to-cyan-400 h-full transition-all duration-300 rounded-full" style="width: 50%"></div>
            </div>
            <p id="league-mmr-remaining-label" class="text-[10px] font-mono text-[var(--text-secondary)] font-medium mt-1.5">
                300 MMR remaining
            </p>
        </div>

        <!-- Sezon Sonu Sandık Ödülü -->
        <div class="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 text-center my-2 shadow-sm">
            <span class="text-[10px] font-black uppercase text-[var(--accent-gold)] tracking-wider block mb-1" data-i18n="league_chest_title">End of Season Tier Chest</span>
            <div class="flex items-center justify-center gap-4 text-xs font-mono font-bold text-[var(--text-primary)]">
                <span id="league-reward-gold" class="flex items-center gap-1 text-[var(--accent-gold)]">${Icons.coin} +200 🪙</span>
                <span id="league-reward-crystals" class="flex items-center gap-1 text-[var(--accent-cyan)]">💎 +20</span>
            </div>
        </div>

        <!-- Ödül Alma Butonu -->
        <button id="btn-claim-league-reward" class="w-full bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1">
            <span>🏆</span>
            <span data-i18n="league_chest_btn">Open League Chest</span>
        </button>
    </div>
</div>
`;
