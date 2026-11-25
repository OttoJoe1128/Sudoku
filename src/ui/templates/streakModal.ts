export const streakModalTemplate = `
<div id="streak-modal" class="fixed inset-0 bg-slate-950/85 hidden flex-col items-center justify-center z-[92] p-4 backdrop-blur-md font-sans">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative border border-[var(--border-strong)]">
        <button id="btn-close-streak" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] p-2 rounded-full text-xs font-bold transition-colors cursor-pointer">✕</button>

        <div class="w-16 h-16 bg-amber-500/20 border border-amber-400/50 rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-3 animate-pulse">
            🔥
        </div>

        <h3 class="text-xl font-black text-[var(--text-primary)] mb-1" data-i18n="streak_modal_title">
            Günlük Seri & Koruma
        </h3>
        <p id="streak-modal-subtitle" class="text-xs text-[var(--text-secondary)] font-medium mb-4 leading-relaxed"></p>

        <!-- 7 Günlük Görsel Takvim -->
        <div id="streak-calendar-grid" class="grid grid-cols-7 gap-1.5 w-full mb-3 bg-[var(--bg-elevated)] p-2 rounded-2xl border border-[var(--border-subtle)]"></div>

        <!-- 7 Günlük Büyük Ödül Rozet Kartı -->
        <div id="streak-reward-banner" class="w-full bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 border border-amber-400/40 p-2.5 rounded-2xl mb-4 text-xs font-bold text-[var(--accent-gold)] flex items-center justify-between shadow-inner">
            <div class="flex items-center gap-2 text-left">
                <span class="text-xl shrink-0">🎁</span>
                <div class="min-w-0">
                    <span class="block text-[11px] font-black text-[var(--text-primary)] truncate" data-i18n="streak_reward_title">7 Günlük Seri Hediyesi</span>
                    <span id="streak-reward-desc" class="block text-[9px] text-[var(--text-secondary)] font-medium truncate" data-i18n="streak_reward_desc">24 Saatlik Geçici Rastgele Yetenek</span>
                </div>
            </div>
            <span id="streak-reward-badge" class="bg-amber-400/20 text-amber-300 border border-amber-400/50 text-[10px] font-black px-2 py-1 rounded-lg shrink-0">🎁 24Sa</span>
        </div>

        <!-- Aksiyon Butonları -->
        <div class="flex flex-col gap-2 w-full">
            <button id="btn-streak-repair-gold" class="w-full bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <span>🪙</span>
                <span data-i18n="streak_btn_repair_gold">Seriyi Koru (-50 Altın)</span>
            </button>

            <button id="btn-streak-repair-ad" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <span>🎬</span>
                <span data-i18n="streak_btn_repair_ad">Reklam İzle & Seriyi Koru</span>
            </button>
        </div>
    </div>
</div>
`;
