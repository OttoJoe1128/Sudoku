import { Icons } from '../../design/icons';

export const usernameModalTemplate = `
<div id="username-modal" class="absolute inset-0 bg-slate-950/85 hidden flex-col items-center justify-center z-[90] p-4 backdrop-blur-md">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative border border-[var(--border-strong)]">
        <button id="close-username-modal" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] p-2 rounded-full text-xs font-bold hidden transition-colors">✕</button>

        <div class="w-16 h-16 bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--accent-gold)] rounded-2xl p-2.5 mx-auto mb-4 shadow-lg flex items-center justify-center text-2xl">
            ${Icons.target}
        </div>

        <h3 class="text-2xl font-black text-[var(--text-primary)] mb-1" data-i18n="welcome_title">SudokuMap'e Hoş Geldin!</h3>
        <p class="text-xs text-[var(--text-secondary)] mb-5 font-medium leading-relaxed" data-i18n="welcome_desc">Oyuncu profilini oluştur veya eski kullanıcı adını girerek tüm ilerlemeni anında geri getir.</p>

        <div class="relative w-full mb-4">
            <input type="text" id="username-input" class="w-full bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] rounded-2xl px-4 py-4 text-center text-lg font-black text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-gold)] transition-all shadow-inner" placeholder="Kullanıcı adını yaz..." data-i18n-ph="ph_enter_username" maxlength="12">
        </div>

        <button id="save-username" class="w-full bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-sm tracking-wide hover:brightness-110">
            <span data-i18n="btn_save_start">Kaydet ve Maceraya Başla ➔</span>
        </button>
    </div>
</div>
`;
