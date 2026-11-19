import { Icons } from '../../design/icons';

export const achievementsTemplate = `
<div id="view-achievements" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[60] p-4 backdrop-blur-md">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col h-[82vh] shadow-2xl relative border border-[var(--border-strong)]">
        <div class="flex justify-between items-center mb-3">
            <div>
                <h3 class="text-xl font-black text-[var(--accent-gold)] flex items-center gap-2">
                    <span>${Icons.crown}</span>
                    <span data-i18n="achievements_modal_title">Başarımlar & Rozetler</span>
                </h3>
                <p class="text-xs text-[var(--accent-cyan)] font-semibold flex items-center gap-1 mt-0.5" data-i18n="achievements_sub">
                    Özel rozetleri aç, ekstra altın kazan!
                </p>
            </div>
            <button id="close-achievements" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full p-2 transition-colors text-xs">
                ✕
            </button>
        </div>

        <!-- Rozet İlerleme Özeti -->
        <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3.5 mb-3 flex items-center justify-between">
            <div>
                <span class="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block" data-i18n="menu_badges">Kazanılan Rozetler</span>
                <span id="badges-unlocked-count" class="text-lg font-black text-[var(--accent-gold)]">0 / 10</span>
            </div>
            <div class="w-32 bg-[var(--bg-card)] h-2.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div id="badges-progress-bar" class="bg-[var(--accent-gold)] h-full rounded-full transition-all duration-500" style="width: 0%"></div>
            </div>
        </div>

        <div id="achievements-list" class="flex-1 overflow-y-auto space-y-2.5 pr-1 hidden-scrollbar">
            <!-- Rozet kartları dinamik olarak render edilecek -->
        </div>
    </div>
</div>
`;
