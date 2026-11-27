import { Icons } from '../../design/icons';

export const mapTemplate = `
<div id="view-map" class="hidden flex-1 flex-col items-center p-3 sm:p-4 bg-[var(--bg-app)] text-[var(--text-primary)] relative overflow-hidden font-sans">
    <!-- Sabit Üst Bölüm -->
    <div class="w-full flex flex-col items-center shrink-0 z-20">
        <!-- Üst Bar -->
        <div class="flex justify-between items-center w-full mb-2 shrink-0">
            <button id="btn-back-map" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] px-3.5 py-1.5 rounded-xl font-bold text-xs text-[var(--text-primary)] transition-colors flex items-center gap-1 shadow">
                <svg class="w-4 h-4 text-[var(--accent-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
                <span data-i18n="btn_menu">Menü</span>
            </button>
            <h2 id="map-biome-title" class="text-sm font-black text-[var(--accent-gold)] uppercase tracking-wider" data-i18n="biome_emerald">ZÜMRÜT VADİ</h2>
            <button id="btn-map-focus-current" title="Güncel Seviyeye Odaklan" data-i18n-title="tooltip_focus_level" class="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-strong)] p-1.5 rounded-xl text-xs text-[var(--accent-gold)] font-black transition-transform active:scale-95 shadow">
                ${Icons.target}
            </button>
        </div>

        <!-- 5 Sudoku Disiplini Seçici Bar -->
        <div class="w-full mb-2 shrink-0">
            <div class="grid grid-cols-5 gap-1.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1.5 rounded-2xl mb-1.5 shadow-inner">
                <button id="map-variant-classic" data-variant="classic" class="map-variant-btn p-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Klasik" data-i18n-title="var_classic">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
                    <span class="text-[9px] font-black leading-none" data-i18n="var_classic">Klasik</span>
                </button>
                <button id="map-variant-irregular" data-variant="irregular" class="map-variant-btn p-1.5 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Parçalı" data-i18n-title="var_irregular">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4zM10 10h6v6h-6zM14 4h6v6H4z"/></svg>
                    <span class="text-[9px] font-bold leading-none" data-i18n="var_irregular">Parçalı</span>
                </button>
                <button id="map-variant-killer" data-variant="killer" class="map-variant-btn p-1.5 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Hesap" data-i18n-title="var_killer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-dasharray="2 2" d="M3 3h18v18H3z"/><path d="M7 7h10L10 12l7 5H7"/></svg>
                    <span class="text-[9px] font-bold leading-none" data-i18n="var_killer">Hesap</span>
                </button>
                <button id="map-variant-wordoku" data-variant="wordoku" class="map-variant-btn p-1.5 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Harfli" data-i18n-title="var_wordoku">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7l-4 10h8M9 13h6"/></svg>
                    <span class="text-[9px] font-bold leading-none" data-i18n="var_wordoku">Harfli</span>
                </button>
                <button id="map-variant-samurai" data-variant="samurai" class="map-variant-btn p-1.5 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Samurai" data-i18n-title="var_samurai">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="1"/><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/></svg>
                    <span class="text-[9px] font-bold leading-none" data-i18n="var_samurai">Samurai</span>
                </button>
            </div>
            <div id="map-variant-rule-desc" class="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-2 text-left text-[10px] font-medium text-[var(--text-primary)] leading-snug" data-i18n="rule_classic">
                Her satır, sütun ve 3x3 karede 1-9 rakamları birer kez yer almalıdır.
            </div>
        </div>

        <!-- LoL Ranked HUD Hedef Kartı -->
        <div id="map-target-card" class="w-full border-2 border-[var(--border-strong)] bg-gradient-to-r from-[var(--bg-app)] via-[var(--bg-card)] to-[var(--bg-app)] text-[var(--text-primary)] rounded-2xl p-3 shadow-xl flex justify-between items-center mb-1 relative overflow-hidden">
            <div id="map-tier-progress" class="absolute bottom-0 left-0 h-1 bg-[var(--accent-cyan)] transition-all" style="width: 10%"></div>
            <div class="text-left">
                <span class="text-[10px] font-black uppercase text-[var(--accent-gold)] tracking-wider block" data-i18n="target_hud">GÜNCEL SİHİRDAR HEDEFİ</span>
                <span id="map-target-label" class="text-sm font-black text-[var(--text-primary)] block">Level 1 • Easy</span>
            </div>
            <button id="btn-map-start-current" class="bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-bright)] text-[var(--text-on-gold)] font-black px-4 py-2 rounded-xl text-xs shadow-md active:scale-95 transition-transform flex items-center gap-1.5 border border-[var(--accent-gold)]">
                <span>${Icons.sword}</span>
                <span data-i18n="btn_play">OYNA</span>
            </button>
        </div>

        <!-- Bölge Bilgi Kartı (20 Bölge × 50 Bölüm) -->
        <div id="map-region-banner" class="w-full border border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-primary)] rounded-2xl p-2.5 shadow-md flex flex-col gap-1 mt-1 mb-1 transition-all relative overflow-hidden shrink-0">
            <div id="map-region-progress-bar" class="absolute bottom-0 left-0 h-1 bg-[var(--accent-gold)] transition-all duration-300" style="width: 0%"></div>
            <div class="flex justify-between items-center text-xs">
                <span id="map-region-badge" class="font-black text-[var(--accent-gold)] tracking-wider text-[10px] uppercase">Region 1 / 20</span>
                <span id="map-region-progress-text" class="font-mono font-bold text-[10px] text-[var(--text-secondary)]">0 / 50 Levels</span>
            </div>
            <div class="flex justify-between items-end">
                <div class="text-left">
                    <h3 id="map-region-title" class="text-xs sm:text-sm font-black text-[var(--text-primary)] leading-tight">Emerald Threshold</h3>
                    <p class="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">
                        <span data-i18n="map_region_focus">Focus Technique</span>: <span id="map-region-tech" class="font-bold text-[var(--text-primary)]">Row-Column Scanning</span>
                    </p>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                    <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-1 rounded-xl text-[10px] font-mono font-black text-[var(--accent-cyan)] flex items-center gap-0.5 shadow-sm">
                        <span>💎</span>
                        <span id="map-crystal-balance">0</span>
                    </div>
                    <button id="btn-open-academy" class="bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--accent-gold)] border border-[var(--border-strong)] px-2.5 py-1 rounded-xl text-[10px] font-black active:scale-95 transition-all flex items-center gap-1 shadow-sm shrink-0">
                        <span>📖</span>
                        <span data-i18n="academy_btn_open">Academy</span>
                    </button>
                    <button id="btn-open-abilities" class="bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] text-[var(--accent-gold)] border border-[var(--border-strong)] px-2 py-1 rounded-xl text-[10px] font-black active:scale-95 transition-all flex items-center gap-1 shadow-sm shrink-0">
                        <span>⚡</span>
                        <span data-i18n="abilities_btn_open">Abilities</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Seviye Atlama Sınavı Şerit Butonu -->
        <button id="btn-map-open-placement" class="w-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-xl px-3 py-2 flex justify-between items-center shadow-sm active:scale-[0.98] transition-all mt-1.5 mb-1">
            <div class="flex items-center gap-2">
                <span class="text-[var(--accent-gold)]">${Icons.target}</span>
                <span class="text-[11px] font-black text-[var(--text-primary)]" data-i18n="placement_exam_title">Seviye Atlama Sınavı</span>
            </div>
            <span class="text-[10px] font-bold text-[var(--accent-gold)]">➔</span>
        </button>
    </div>

    <!-- Kaydırılabilir Sonsuz Patika Alanı & Yumuşak Perde Maskeleri -->
    <div class="relative flex-1 w-full overflow-hidden z-10">
        <div class="pointer-events-none absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[var(--bg-app)] to-transparent z-20"></div>
        <div id="map-scroll-area" class="w-full h-full overflow-y-auto hidden-scrollbar relative z-10 pt-4 pb-28">
            <div id="map-path-container" class="w-[320px] mx-auto relative py-4">
                <!-- SVG Enerji Yolu & Dikey Taşlar Render Edilecek -->
            </div>
        </div>
        <div class="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[var(--bg-app)] to-transparent z-20"></div>
    </div>
</div>
`;
