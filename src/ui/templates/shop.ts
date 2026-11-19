import { Icons } from '../../design/icons';

export const shopTemplate = `
<div id="view-shop" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[60] p-4 backdrop-blur-md">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col h-[80vh] shadow-2xl relative border border-[var(--border-strong)]">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-black text-[var(--accent-gold)] flex items-center gap-2">
                <span>${Icons.dice}</span>
                <span>Mağaza & Temalar</span>
            </h3>
            <button id="close-shop" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full p-2 text-xs">✕</button>
        </div>
        <div id="shop-list" class="flex-1 overflow-y-auto space-y-3 hidden-scrollbar pr-0.5">
            <!-- Temalar Render Edilecek -->
        </div>
    </div>
</div>
`;
