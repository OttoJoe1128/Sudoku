import { Icons } from '../../design/icons';

export const placementModalTemplate = `
<div id="placement-modal" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[85] p-4 backdrop-blur-md">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto hidden-scrollbar border border-[var(--border-strong)]">
        <button id="close-placement-modal" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 text-sm">✕</button>

        <div class="text-center mb-4">
            <div class="w-12 h-12 bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--accent-gold)] rounded-2xl flex items-center justify-center text-xl mx-auto mb-2 shadow-inner">
                ${Icons.target}
            </div>
            <h3 class="text-2xl font-black text-[var(--text-primary)] mb-1" data-i18n="placement_exam_title">Seviye Atlama Sınavı</h3>
            <p class="text-xs text-[var(--text-secondary)] font-medium leading-relaxed" data-i18n="placement_exam_modal_desc">Hedef zorluğunu seç, tek bir sınav bulmacasını çözerek üst seviyeleri doğrudan aç!</p>
        </div>

        <div class="flex flex-col gap-3 w-full mb-4">
            <!-- 1. Hedef: Basit -->
            <button id="btn-placement-basit" class="w-full bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-all">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-black text-emerald-300 flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
                        Hedef: Basit (Seviye 1)
                    </span>
                    <span class="bg-emerald-900/60 text-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/50">
                        +50 🪙
                    </span>
                </div>
                <p class="text-[11px] text-emerald-400 mb-0.5" data-i18n="diff_basit_desc">Sudokuya yeni başlayanlar için rahat başlangıç.</p>
                <span class="text-[10px] font-bold text-emerald-300 block" data-i18n="placement_kriter_basit">Kriter: Max 3 hatayla bitir</span>
            </button>

            <!-- 2. Hedef: Orta -->
            <button id="btn-placement-orta" class="w-full bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-all">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-black text-amber-300 flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm"></span>
                        Hedef: Orta (Seviye 301)
                    </span>
                    <span class="bg-amber-900/60 text-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/50">
                        +150 🪙
                    </span>
                </div>
                <p class="text-[11px] text-amber-400 mb-0.5" data-i18n="diff_orta_desc">Kuralları bilenler için doğrudan 301. Seviyeye geçiş!</p>
                <span class="text-[10px] font-bold text-amber-300 block" data-i18n="placement_kriter_orta">Kriter: Max 3 hata & 7 dk altı süre</span>
            </button>

            <!-- 3. Hedef: Zor -->
            <button id="btn-placement-zor" class="w-full bg-rose-950/40 border border-rose-500/40 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-all">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-black text-rose-300 flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm"></span>
                        Hedef: Zor (Seviye 701)
                    </span>
                    <span class="bg-rose-900/60 text-rose-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-500/50">
                        +300 🪙
                    </span>
                </div>
                <p class="text-[11px] text-rose-400 mb-0.5" data-i18n="diff_zor_desc">Deneyimli ustalar için doğrudan 701. Seviyeye geçiş!</p>
                <span class="text-[10px] font-bold text-rose-300 block" data-i18n="placement_kriter_zor">Kriter: Max 3 hata & 10 dk altı süre</span>
            </button>
        </div>

        <button id="btn-skip-placement" class="w-full text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-1.5 text-center" data-i18n="btn_skip_exam">
            Sınavı Atla (Seviye 1'den Başla)
        </button>
    </div>
</div>

<!-- Seviye Belirleme Sonuç Modalı -->
<div id="placement-result-modal" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[86] p-4 backdrop-blur-md">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative border border-[var(--border-strong)]">
        <div id="placement-result-icon" class="text-4xl mb-2 text-[var(--accent-gold)]">${Icons.crown}</div>
        <h3 id="placement-result-title" class="text-2xl font-black text-[var(--text-primary)] mb-1" data-i18n="exam_success_title">Sınav Başarılı!</h3>
        <p id="placement-result-subtitle" class="text-xs font-bold text-[var(--text-secondary)] mb-4">Hedeflenen Seviye 301 başarıyla açıldı!</p>

        <div class="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 flex justify-around items-center mb-4">
            <div>
                <p class="text-[10px] text-[var(--text-secondary)] font-bold uppercase" data-i18n="time_unlimited">Süre</p>
                <p id="placement-result-time" class="text-sm font-black text-[var(--text-primary)]">03:45</p>
            </div>
            <div class="w-[1px] h-8 bg-[var(--border-subtle)]"></div>
            <div>
                <p class="text-[10px] text-[var(--text-secondary)] font-bold uppercase" data-i18n="game_errors">Hata</p>
                <p id="placement-result-errors" class="text-sm font-black text-[var(--text-primary)]">1 / 3</p>
            </div>
            <div class="w-[1px] h-8 bg-[var(--border-subtle)]"></div>
            <div>
                <p class="text-[10px] text-[var(--text-secondary)] font-bold uppercase" data-i18n="gold_rewards">Ödül</p>
                <p id="placement-result-reward" class="text-sm font-black text-[var(--accent-gold)]">+150 🪙</p>
            </div>
        </div>

        <div class="flex flex-col gap-2.5 w-full">
            <button id="btn-placement-action-primary" class="w-full bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black py-3.5 rounded-xl shadow-lg active:scale-95 transition-all text-sm hover:brightness-110">
                Seviyeyi Başlat ➔
            </button>
            <button id="btn-placement-action-secondary" class="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold py-3 rounded-xl active:scale-95 transition-all text-sm" data-i18n="btn_back_main_menu">
                Ana Menüye Dön
            </button>
        </div>
    </div>
</div>
`;
