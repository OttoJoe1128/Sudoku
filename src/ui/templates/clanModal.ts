import { Icons } from '../../design/icons';

export const clanModalTemplate = `
<div id="clan-modal" class="fixed inset-0 bg-slate-950/85 hidden flex-col items-center justify-center z-[89] p-4 backdrop-blur-md font-sans">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto hidden-scrollbar border border-[var(--border-strong)]">
        <button id="btn-close-clan" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] p-2 rounded-full text-xs font-bold transition-colors cursor-pointer z-30">✕</button>

        <!-- Klan Başlığı -->
        <div class="text-center mb-3">
            <div id="clan-modal-icon" class="w-12 h-12 bg-rose-500/20 border border-rose-400/50 text-rose-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2 shadow-inner animate-pulse">
                ⛩️
            </div>
            <h3 id="clan-modal-name" class="text-lg font-black text-[var(--text-primary)] mb-0.5" data-i18n="menu_clan_title">Clan Dungeon</h3>
            <p id="clan-modal-desc" class="text-xs text-[var(--text-secondary)] font-medium" data-i18n="menu_clan_sub">Weekly Samurai Dungeon & Clan Rune Vault</p>
        </div>

        <!-- Haftalık Canavar Durumu -->
        <div class="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3.5 text-center my-2 shadow-sm">
            <div class="flex justify-between items-center mb-1">
                <span class="text-[10px] font-black uppercase text-rose-400 tracking-wider" data-i18n="clan_boss_title">Weekly Dungeon Boss</span>
                <span id="clan-boss-hp-label" class="text-[10px] font-mono font-black text-[var(--accent-gold)]">10000 / 10000 HP</span>
            </div>
            <div class="w-full bg-[#070D19]/30 h-2.5 rounded-full overflow-hidden flex border border-rose-950/40">
                <div id="clan-boss-hp-bar" class="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all duration-300 rounded-full" style="width: 100%"></div>
            </div>
        </div>

        <!-- Rün Tozu Kapısı İlerlemesi -->
        <div class="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3.5 text-center my-2 shadow-sm">
            <div class="flex justify-between items-center mb-1">
                <span class="text-[10px] font-black uppercase text-[var(--accent-cyan)] tracking-wider" data-i18n="clan_gate_title">Dungeon Rune Gate</span>
                <span id="clan-dust-progress-label" class="text-[10px] font-mono font-black text-[var(--accent-cyan)]">350 / 500 ✨</span>
            </div>
            <div class="w-full bg-[#070D19]/30 h-2 rounded-full overflow-hidden flex border border-[var(--border-subtle)]">
                <div id="clan-dust-progress-bar" class="bg-[var(--accent-cyan)] h-full transition-all duration-300 rounded-full" style="width: 70%"></div>
            </div>
            <p class="text-[10px] text-[var(--text-secondary)] font-medium mt-2" data-i18n="clan_gate_info">
                Reach 500 Rune Dust to unlock the 5-Grid Samurai Dungeon!
            </p>
        </div>

        <!-- Bağış Butonu -->
        <button id="btn-clan-donate-dust" class="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:brightness-110 text-white font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2">
            <span>✨</span>
            <span data-i18n="clan_donate_btn">Donate Rune Dust (5 💎 ➔ 50 ✨)</span>
        </button>
    </div>
</div>
`;
