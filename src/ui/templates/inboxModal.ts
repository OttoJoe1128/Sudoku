import { Icons } from '../../design/icons';

export const inboxModalTemplate = `
<div id="view-inbox" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[75] p-4 backdrop-blur-md">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col h-[70vh] shadow-2xl relative border border-[var(--border-strong)]">
        <div class="flex justify-between items-center mb-3 pb-2 border-b border-[var(--border-subtle)]">
            <h3 class="text-lg font-black text-[var(--accent-gold)] flex items-center gap-2">
                <span>${Icons.inbox}</span>
                <span>Düello Gelen Kutusu</span>
            </h3>
            <button id="close-inbox" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full p-2 text-xs font-bold transition-colors">
                ✕
            </button>
        </div>

        <div id="inbox-list" class="flex-1 overflow-y-auto space-y-2 pr-1 hidden-scrollbar">
            <div class="text-center text-[var(--text-secondary)] py-10 font-bold">Gelen davet bulunmuyor.</div>
        </div>
    </div>
</div>
`;
