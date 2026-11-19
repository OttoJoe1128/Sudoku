import { Icons } from '../../design/icons';

export const customModeTemplate = `
<div id="view-custom" class="hidden flex-1 flex flex-col p-6 gap-3.5 relative bg-[var(--bg-app)] text-[var(--text-primary)] h-[100dvh] overflow-y-auto hidden-scrollbar">
    <!-- Üst Başlık ve Geri Butonu + Bilgilendirme (i) -->
    <div class="flex justify-between items-center w-full mb-1 shrink-0">
        <button id="btn-back-custom" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] px-4 py-2 rounded-xl font-bold text-xs text-[var(--text-primary)] transition-colors flex items-center gap-1 shadow">
            <svg class="w-4 h-4 text-[var(--accent-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            <span data-i18n="btn_menu">Menü</span>
        </button>
        <div class="flex items-center gap-1.5">
            <h2 class="text-base font-black text-[var(--text-primary)]" data-i18n="menu_custom_mode_tag">Serbest Mod</h2>
            <button id="btn-custom-info" title="Puan & Ödül Bilgisi" class="text-[var(--accent-gold)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] p-1.5 rounded-xl border border-[var(--border-strong)] text-xs font-black transition-colors">
                ${Icons.info}
            </button>
        </div>
        <div class="w-12"></div>
    </div>

    <!-- 5 Sudoku Disiplini Stil Seçici Bar -->
    <div class="w-full">
        <p class="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider text-left mb-1.5 flex justify-between items-center">
            <span data-i18n="select_discipline">Oyun Disiplini Seç</span>
            <span id="custom-variant-multiplier-badge" class="text-[var(--accent-gold)] font-bold">1.0x Puan</span>
        </p>
        <div class="grid grid-cols-5 gap-1.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1.5 rounded-2xl mb-2 shadow-inner">
            <button id="btn-variant-classic" data-variant="classic" class="custom-variant-btn p-2 rounded-xl bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Klasik Sudoku">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
                <span class="text-[9px] font-black leading-none" data-i18n="var_classic">Klasik</span>
            </button>
            <button id="btn-variant-irregular" data-variant="irregular" class="custom-variant-btn p-2 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Parçalı Sudoku">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4zM10 10h6v6h-6zM14 4h6v6H4z"/></svg>
                <span class="text-[9px] font-bold leading-none" data-i18n="var_irregular">Parçalı</span>
            </button>
            <button id="btn-variant-killer" data-variant="killer" class="custom-variant-btn p-2 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Hesap Sudoku">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-dasharray="2 2" d="M3 3h18v18H3z"/><path d="M7 7h10L10 12l7 5H7"/></svg>
                <span class="text-[9px] font-bold leading-none" data-i18n="var_killer">Hesap</span>
            </button>
            <button id="btn-variant-wordoku" data-variant="wordoku" class="custom-variant-btn p-2 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Harfli Sudoku">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7l-4 10h8M9 13h6"/></svg>
                <span class="text-[9px] font-bold leading-none" data-i18n="var_wordoku">Harfli</span>
            </button>
            <button id="btn-variant-samurai" data-variant="samurai" class="custom-variant-btn p-2 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Samurai 5-Grid">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="1"/><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/></svg>
                <span class="text-[9px] font-bold leading-none" data-i18n="var_samurai">Samurai</span>
            </button>
        </div>
        <!-- Sade Kural Açıklama Kutusu -->
        <div id="custom-variant-rule-desc" class="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-2.5 text-left text-[11px] font-medium text-[var(--text-primary)] leading-snug">
            Her satır, sütun ve 3x3 karede 1-9 rakamları birer kez yer almalıdır.
        </div>
    </div>

    <!-- Süre Modu Seçici Bar -->
    <div class="w-full">
        <p class="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider text-left mb-1" data-i18n="select_time_mode">Süre Modu Seç</p>
        <div class="flex gap-1 p-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl">
            <button id="btn-custom-time-no-limit" data-time="0" class="custom-time-btn flex-1 py-1.5 rounded-xl font-black text-[10px] transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex items-center justify-center gap-1">
                <span>${Icons.infinity}</span>
                <span data-i18n="time_unlimited">Süresiz</span>
            </button>
            <button id="btn-custom-time-7m" data-time="420" class="custom-time-btn flex-1 py-1.5 rounded-xl font-bold text-[10px] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1">
                <span>${Icons.timer}</span>
                <span data-i18n="time_7m">7 Dk</span>
            </button>
            <button id="btn-custom-time-3m" data-time="180" class="custom-time-btn flex-1 py-1.5 rounded-xl font-bold text-[10px] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1">
                <span>${Icons.zap}</span>
                <span data-i18n="time_3m_bonus">3 Dk (+%50)</span>
            </button>
        </div>
    </div>

    <!-- Zorluk Kartları -->
    <div class="flex flex-col gap-3 w-full">
        <!-- Basit -->
        <button id="btn-custom-basit" class="w-full bg-[var(--diff-easy-bg)] border border-[var(--diff-easy-border)] rounded-3xl p-4 text-left active:scale-[0.98] transition-all shadow-sm group">
            <div class="flex justify-between items-center mb-1">
                <span class="text-base font-black text-[var(--diff-easy-text)] flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm inline-block"></span>
                    <span data-i18n="diff_basit">Basit</span>
                </span>
                <span id="badge-custom-basit-reward" class="bg-[var(--bg-card)] text-[var(--diff-easy-text)] border border-[var(--diff-easy-border)] text-xs font-black px-2.5 py-0.5 rounded-full">
                    +10 Altın
                </span>
            </div>
            <p class="text-xs text-[var(--diff-easy-sub)] font-medium mb-1" data-i18n="diff_basit_desc">Yeni başlayanlar için rahat ve dinlendirici bir bulmaca.</p>
        </button>

        <!-- Orta -->
        <button id="btn-custom-orta" class="w-full bg-[var(--diff-med-bg)] border border-[var(--diff-med-border)] rounded-3xl p-4 text-left active:scale-[0.98] transition-all shadow-sm group">
            <div class="flex justify-between items-center mb-1">
                <span class="text-base font-black text-[var(--diff-med-text)] flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm inline-block"></span>
                    <span data-i18n="diff_orta">Orta</span>
                </span>
                <span id="badge-custom-orta-reward" class="bg-[var(--bg-card)] text-[var(--diff-med-text)] border border-[var(--diff-med-border)] text-xs font-black px-2.5 py-0.5 rounded-full">
                    +20 Altın
                </span>
            </div>
            <p class="text-xs text-[var(--diff-med-sub)] font-medium mb-1" data-i18n="diff_orta_desc">Biraz dikkat ve mantık yürütme gerektiren dengeli bir zorluk.</p>
        </button>

        <!-- Zor -->
        <button id="btn-custom-zor" class="w-full bg-[var(--diff-hard-bg)] border border-[var(--diff-hard-border)] rounded-3xl p-4 text-left active:scale-[0.98] transition-all shadow-sm group">
            <div class="flex justify-between items-center mb-1">
                <span class="text-base font-black text-[var(--diff-hard-text)] flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm inline-block"></span>
                    <span data-i18n="diff_zor">Zor</span>
                </span>
                <span id="badge-custom-zor-reward" class="bg-[var(--bg-card)] text-[var(--diff-hard-text)] border border-[var(--diff-hard-border)] text-xs font-black px-2.5 py-0.5 rounded-full">
                    +35 Altın
                </span>
            </div>
            <p class="text-xs text-[var(--diff-hard-sub)] font-medium mb-1" data-i18n="diff_zor_desc">Sudoku ustaları için derin eleme ve kombinasyon mücadelesi.</p>
        </button>
    </div>
</div>
`;
