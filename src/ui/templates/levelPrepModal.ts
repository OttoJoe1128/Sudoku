export const levelPrepModalTemplate = `
<div id="level-prep-modal" class="fixed inset-0 bg-slate-950/85 hidden flex-col items-center justify-center z-[87] p-4 backdrop-blur-md font-sans">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col shadow-2xl relative max-h-[92vh] overflow-y-auto hidden-scrollbar border border-[var(--border-strong)]">
        <button id="btn-close-level-prep" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] p-2 rounded-full text-xs font-bold transition-colors cursor-pointer">✕</button>

        <!-- Modal Üst Başlık -->
        <div class="text-center mb-2">
            <h3 id="prep-level-title" class="text-lg font-black text-[var(--text-primary)] mb-1"></h3>
            <div id="prep-energy-badge" class="inline-flex items-center gap-1.5 bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--accent-gold)] text-xs font-black px-3 py-1 rounded-full shadow-sm mb-1"></div>
            <p id="prep-energy-desc" class="text-xs text-[var(--text-secondary)] font-medium mb-2 leading-snug"></p>

            <!-- Özel Hücre Özeti -->
            <div id="prep-modifiers-summary" class="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-2 rounded-2xl mb-2 text-[10px] font-bold text-[var(--text-primary)] flex justify-around items-center gap-1 shadow-inner"></div>
            <div id="prep-info-popover" class="hidden w-full bg-[var(--bg-elevated)] border border-[var(--accent-gold)]/50 rounded-xl px-3 py-2 text-[11px] text-left text-[var(--text-primary)] font-medium leading-snug mb-2 shadow-sm"></div>

            <!-- Kristal İlerlemesi -->
            <div id="prep-crystal-progress" class="text-xs font-mono font-black text-[var(--accent-cyan)] tracking-wide"></div>
        </div>

        <!-- 2'li Yetenek Donanım Paneli (Loadout) -->
        <div class="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 mb-4 shadow-sm text-left">
            <div class="flex justify-between items-center mb-1">
                <span id="prep-loadout-count" class="text-xs font-black text-[var(--accent-gold)] tracking-wide"></span>
            </div>
            <span class="text-[10px] text-[var(--text-secondary)] font-medium mb-2 block" data-i18n="prep_loadout_hint">
                Hazır yeteneklerinden en fazla 2 tane seçebilir veya yeteneksiz başlayabilirsin.
            </span>

            <!-- 2 Yuva -->
            <div class="grid grid-cols-2 gap-2 mb-3 w-full">
                <div id="prep-slot-0" class="h-12 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-card)] flex items-center justify-center p-2"></div>
                <div id="prep-slot-1" class="h-12 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-card)] flex items-center justify-center p-2"></div>
            </div>

            <!-- 5 Yetenek Izgarası -->
            <div id="prep-abilities-grid" class="grid grid-cols-5 gap-1.5 w-full"></div>
        </div>

        <!-- Alt Düğmeler -->
        <div class="flex gap-2 w-full pt-1 border-t border-[var(--border-subtle)]">
            <button id="btn-prep-open-abilities" class="flex-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-bold py-3 rounded-2xl active:scale-95 transition-all text-xs cursor-pointer">
                <span data-i18n="prep_btn_manage_abilities">⚡ Yetenekleri Yönet</span>
            </button>
            <button id="btn-prep-start-game" class="flex-1 bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs cursor-pointer">
                <span data-i18n="prep_btn_start">Bölüme Gir ➔</span>
            </button>
        </div>
    </div>
</div>
`;
