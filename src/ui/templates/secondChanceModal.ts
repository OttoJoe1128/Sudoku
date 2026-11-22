import { t } from '../../i18n/translations';

export const secondChanceModalTemplate = `
<div id="second-chance-modal" class="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 hidden">
  <div class="bg-[var(--bg-card)] border-2 border-[var(--border-strong)] rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center flex flex-col items-center gap-4 relative">
    <div class="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl text-rose-400 shadow-inner">
      💔
    </div>

    <div>
      <h3 id="sc-modal-title" class="text-xl font-black text-[var(--text-primary)]" data-i18n="sc_title">
        3 Hata Doldu!
      </h3>
      <p id="sc-modal-subtitle" class="text-xs text-[var(--text-secondary)] font-medium mt-1" data-i18n="sc_subtitle">
        İlerlemeni kaybetmeden +1 canla kaldığın yerden devam edebilirsin.
      </p>
    </div>

    <div class="w-full flex flex-col gap-2.5 mt-1">
      <button id="btn-revive-gold" class="w-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border-2 border-[var(--accent-gold)] text-[var(--text-primary)] font-black py-3 px-4 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex flex-col items-center justify-center">
        <span data-i18n="sc_btn_gold">🪙 50 Altın ile Devam Et</span>
        <span id="revive-gold-balance" class="text-[10px] text-[var(--accent-gold)] font-bold mt-0.5 opacity-90">🪙 100</span>
      </button>

      <button id="btn-revive-ad" class="w-full bg-[var(--accent-gold)] hover:brightness-110 text-[var(--text-on-gold)] font-black py-3.5 px-4 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-2">
        <span data-i18n="sc_btn_ad">🎬 Reklam İzle & Devam Et (Ücretsiz)</span>
      </button>

      <button id="btn-revive-giveup" class="w-full bg-transparent hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-bold py-2.5 px-4 rounded-2xl transition-colors text-xs mt-1" data-i18n="sc_btn_giveup">
        Oyunu Bitir
      </button>
    </div>
  </div>
</div>
`;
