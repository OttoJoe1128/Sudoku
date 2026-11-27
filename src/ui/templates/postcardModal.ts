import { Icons } from '../../design/icons';

export const postcardModalTemplate = `
<div id="postcard-modal" class="fixed inset-0 bg-slate-950/85 hidden flex-col items-center justify-center z-[89] p-4 backdrop-blur-md font-sans">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto hidden-scrollbar border border-[var(--border-strong)]">
        <button id="btn-close-postcard" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] p-2 rounded-full text-xs font-bold transition-colors cursor-pointer z-30">✕</button>

        <!-- Üst Başlık -->
        <div class="text-center mb-3">
            <div class="w-12 h-12 bg-amber-500/20 border border-amber-400/50 text-amber-300 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2 shadow-inner animate-pulse">
                📮
            </div>
            <h3 id="postcard-modal-title" class="text-lg font-black text-[var(--text-primary)] mb-0.5"></h3>
            <p id="postcard-modal-subtitle" class="text-xs text-[var(--text-secondary)] font-medium"></p>
        </div>

        <!-- 3x3 Pul ve Kartpostal Vitrini -->
        <div class="relative w-56 h-56 mx-auto my-2 p-2 bg-[var(--bg-elevated)] border-2 border-[var(--border-strong)] rounded-2xl shadow-inner flex flex-col justify-center items-center">
            <div id="postcard-grid" class="grid grid-cols-3 grid-rows-3 gap-1.5 w-full h-full"></div>
            <div id="postcard-completed-overlay" class="hidden absolute inset-2 rounded-xl bg-amber-500/20 border-2 border-amber-400 flex flex-col items-center justify-center text-center backdrop-blur-xs shadow-lg animate-pulse pointer-events-none">
                <span class="text-3xl mb-1">🎉</span>
                <span class="text-xs font-black text-amber-300 uppercase tracking-widest" data-i18n="season_reward_claimed">Reward Claimed</span>
            </div>
        </div>

        <!-- Durum ve Ödül Çubuğu -->
        <div class="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 text-center my-2 shadow-sm">
            <div class="flex justify-between items-center mb-1">
                <span class="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider" data-i18n="season_progress_title">Progress</span>
                <span id="postcard-stamps-count-label" class="text-[10px] font-mono font-black text-[var(--accent-gold)]"></span>
            </div>
            <div class="w-full bg-[#070D19]/30 h-2 rounded-full overflow-hidden flex border border-[var(--border-subtle)]">
                <div id="postcard-progress-bar" class="bg-[var(--accent-gold)] h-full transition-all duration-300 rounded-full" style="width: 0%"></div>
            </div>
            <p class="text-[10px] text-[var(--text-secondary)] font-medium mt-2" data-i18n="season_modal_info">
                Collect 9 stamps to unlock +150 Gold, +20 Crystals and Exclusive Theme!
            </p>
        </div>

        <!-- Ödül Alma Düğmesi -->
        <button id="btn-claim-postcard-reward" class="w-full bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1">
            <span data-i18n="season_btn_claim">Complete Postcard & Claim Reward</span>
        </button>
    </div>
</div>
`;
