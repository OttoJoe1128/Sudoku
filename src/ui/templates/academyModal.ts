import { Icons } from '../../design/icons';

export const academyModalTemplate = `
<div id="academy-modal" class="fixed inset-0 bg-slate-950/85 hidden flex-col items-center justify-center z-[88] p-4 backdrop-blur-md font-sans">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto hidden-scrollbar border border-[var(--border-strong)]">
        <button id="btn-close-academy" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] p-2 rounded-full text-xs font-bold transition-colors cursor-pointer">✕</button>

        <!-- Modal Üst Başlık -->
        <div class="text-center mb-4">
            <div class="w-12 h-12 bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--accent-gold)] rounded-2xl flex items-center justify-center text-xl mx-auto mb-2 shadow-inner">
                📖
            </div>
            <h3 id="academy-modal-title" class="text-xl font-black text-[var(--text-primary)] mb-0.5" data-i18n="academy_title">Sudoku Academy</h3>
            <p id="academy-modal-subtitle" class="text-xs text-[var(--text-secondary)] font-medium" data-i18n="academy_subtitle">20 Regions · 20 Mastery Techniques</p>
        </div>

        <!-- 1. GÖRÜNÜM: TÜM TEKNİKLER KİTAPÇIK LİSTESİ -->
        <div id="academy-list-view" class="w-full flex flex-col items-center">
            <div id="academy-unlocked-summary" class="w-full text-center text-xs font-black text-[var(--accent-gold)] mb-3 tracking-wide">
                <!-- modalsController / academyController doldurur -->
            </div>
            <div id="academy-lessons-list" class="w-full flex flex-col gap-2 max-h-[52vh] overflow-y-auto hidden-scrollbar pr-0.5">
                <!-- 20 Bölge Dersi Render Edilir -->
            </div>
        </div>

        <!-- 2. GÖRÜNÜM: TEKİL DERS KART VE DİYAGRAM DETAYI -->
        <div id="academy-detail-view" class="w-full hidden flex-col items-center text-center">
            <span id="academy-new-badge" class="bg-rose-600 text-white font-black text-[9px] tracking-wider px-2.5 py-0.5 rounded-full mb-2 hidden uppercase shadow" data-i18n="academy_new_region_badge">NEW REGION LESSON</span>
            <span id="academy-lesson-region" class="text-[10px] font-black uppercase tracking-wider text-[var(--accent-gold)] mb-0.5 block"></span>
            <h4 id="academy-lesson-title" class="text-base font-black text-[var(--text-primary)] mb-2"></h4>

            <!-- 3x3 Mini Görsel Diyagram -->
            <div id="academy-lesson-diagram" class="grid grid-cols-3 gap-1.5 w-44 h-44 mx-auto my-2 p-2 bg-[var(--bg-elevated)] border-2 border-[var(--border-strong)] rounded-2xl shadow-inner">
                <!-- 9 Hücre academyController tarafından doldurulur -->
            </div>

            <!-- İnteraktif Adım Simülatörü Butonu -->
            <button id="btn-academy-simulate-step" class="hidden bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-strong)] text-[var(--accent-gold)] font-black py-1.5 px-3 rounded-xl text-[11px] mb-2 items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer">
                <span>⚡</span>
                <span id="academy-simulate-step-label" data-i18n="academy_btn_simulate">Eleme Adımını Simüle Et ➔</span>
            </button>

            <!-- Özet Açıklama -->
            <p id="academy-lesson-summary" class="text-xs text-[var(--text-secondary)] font-medium leading-relaxed mb-3"></p>

            <!-- Nasıl Görülür Kutusu -->
            <div id="academy-lesson-tip-box" class="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 text-left mb-4 shadow-sm">
                <p class="text-[10px] font-black uppercase tracking-wider text-[var(--accent-gold)] mb-1 flex items-center gap-1">
                    <span>💡</span>
                    <span data-i18n="academy_how_to_spot">How to Spot</span>
                </p>
                <p id="academy-lesson-tip" class="text-xs text-[var(--text-primary)] font-bold leading-snug"></p>
            </div>

            <!-- Alt Düğmeler -->
            <div class="flex gap-2 w-full pt-1 border-t border-[var(--border-subtle)]">
                <button id="btn-academy-back-list" class="flex-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-bold py-3 rounded-2xl active:scale-95 transition-all text-xs cursor-pointer">
                    <span data-i18n="academy_back_list">← All Techniques</span>
                </button>
                <button id="btn-academy-got-it" class="flex-1 bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs cursor-pointer">
                    <span data-i18n="academy_got_it">Got It, Continue</span>
                </button>
            </div>
        </div>
    </div>
</div>
`;
