export const crystalRepairModalTemplate = `
<div id="crystal-repair-modal" class="fixed inset-0 bg-slate-950/85 hidden flex-col items-center justify-center z-[89] p-4 backdrop-blur-md font-sans">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col shadow-2xl relative border border-[var(--border-strong)] text-center">
        <button id="btn-close-crystal-repair" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] p-2 rounded-full text-xs font-bold transition-colors cursor-pointer">✕</button>

        <div class="w-12 h-12 bg-rose-950/40 border border-rose-500/40 text-rose-400 rounded-2xl flex items-center justify-center text-xl mx-auto mb-2 shadow-inner">
            💔
        </div>
        <h3 class="text-lg font-black text-[var(--text-primary)] mb-1" data-i18n="repair_modal_title">Repair Cracked Crystal</h3>
        <p class="text-xs text-[var(--text-secondary)] font-medium mb-4 leading-snug" data-i18n="repair_modal_desc">
            Restore the cracked Rune Crystal so you can collect it again.
        </p>

        <div class="flex flex-col gap-2 w-full">
            <button id="btn-repair-crystal-gold" class="w-full bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs cursor-pointer">
                <span data-i18n="repair_btn_gold">Repair (-15 🪙)</span>
            </button>
            <button id="btn-repair-crystal-ad" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs cursor-pointer">
                <span data-i18n="repair_btn_ad">🎬 Ad Repair</span>
            </button>
        </div>
    </div>
</div>
`;
