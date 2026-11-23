export const abilitiesModalTemplate = `
<div id="abilities-modal" class="fixed inset-0 bg-slate-950/85 hidden flex-col items-center justify-center z-[89] p-4 backdrop-blur-md font-sans">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto hidden-scrollbar border border-[var(--border-strong)]">
        <button id="btn-close-abilities" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] p-2 rounded-full text-xs font-bold transition-colors cursor-pointer">✕</button>

        <!-- Modal Üst Başlık -->
        <div class="text-center mb-3">
            <div class="w-12 h-12 bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--accent-gold)] rounded-2xl flex items-center justify-center text-xl mx-auto mb-2 shadow-inner">
                ⚡
            </div>
            <h3 id="abilities-modal-title" class="text-xl font-black text-[var(--text-primary)] mb-0.5" data-i18n="abilities_title">Abilities</h3>
            <p id="abilities-modal-subtitle" class="text-xs text-[var(--text-secondary)] font-medium" data-i18n="abilities_subtitle">Enhance with Rune Crystals & Gold</p>
        </div>

        <!-- Çift Bakiye Göstergesi -->
        <div class="flex justify-center items-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-2 rounded-2xl mb-3 shadow-inner">
            <div class="flex items-center gap-1 text-xs font-mono font-black text-[var(--accent-cyan)]">
                <span>💎</span>
                <span id="abilities-crystal-balance">0</span>
            </div>
            <div class="w-px h-3 bg-[var(--border-subtle)]"></div>
            <div class="flex items-center gap-1 text-xs font-mono font-black text-[var(--accent-gold)]">
                <span>🪙</span>
                <span id="abilities-gold-balance">0</span>
            </div>
        </div>

        <!-- 5 Yetenek Listesi -->
        <div id="abilities-list" class="w-full flex flex-col gap-2.5 max-h-[52vh] overflow-y-auto hidden-scrollbar pr-0.5">
            <!-- abilitiesController tarafından doldurulur -->
        </div>
    </div>
</div>
`;
