import { Icons } from '../../design/icons';

export const savedGamesModalTemplate = `
<div id="view-saved-games" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[75] p-4 backdrop-blur-md">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col max-h-[75vh] shadow-2xl relative border border-[var(--border-strong)]">
        <div class="flex justify-between items-center mb-3 pb-2 border-b border-[var(--border-subtle)] shrink-0">
            <h3 class="text-lg font-black text-[var(--accent-gold)] flex items-center gap-2">
                <span>${Icons.target}</span>
                <span data-i18n="saved_games_modal_title">Aktif Oyunlarım</span>
            </h3>
            <button id="close-saved-games" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full p-2 text-xs font-bold transition-colors">
                ✕
            </button>
        </div>

        <!-- 3'lü Kategori Sekme Barı: Yolculuk, Serbest Mod, Düello -->
        <div class="grid grid-cols-3 gap-1 p-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl mb-3 shrink-0">
            <button id="tab-saved-journey" data-saved-tab="journey" class="saved-tab-btn py-1.5 rounded-xl font-black text-[11px] bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm transition-all" data-i18n="saved_tab_journey">Yolculuk</button>
            <button id="tab-saved-custom" data-saved-tab="custom" class="saved-tab-btn py-1.5 rounded-xl font-bold text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent transition-all" data-i18n="saved_tab_custom">Serbest Mod</button>
            <button id="tab-saved-duel" data-saved-tab="duel" class="saved-tab-btn py-1.5 rounded-xl font-bold text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent transition-all" data-i18n="saved_tab_duel">Düello</button>
        </div>

        <div id="saved-games-list" class="flex-1 overflow-y-auto space-y-2 pr-0.5 hidden-scrollbar">
            <div class="text-center text-[var(--text-secondary)] py-10 font-bold" data-i18n="no_active_games">Kayıtlı aktif oyununuz yok.</div>
        </div>
    </div>
</div>
`;
