export const authModalTemplate = `
<div id="auth-modal" class="fixed inset-0 bg-slate-950/85 hidden flex-col items-center justify-center z-[92] p-4 backdrop-blur-md font-sans">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl relative border border-[var(--border-strong)]">
        <button id="btn-close-auth" class="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] p-2 rounded-full text-xs font-bold transition-colors cursor-pointer">✕</button>

        <h3 id="auth-modal-title" class="text-xl font-black text-[var(--accent-gold)] mb-4 text-center border-b border-[var(--border-subtle)] pb-2" data-i18n="auth_modal_title">
            Hesap İşlemleri
        </h3>

        <!-- Sekme Geçişi -->
        <div class="grid grid-cols-2 gap-1 bg-[var(--bg-elevated)] p-1 rounded-2xl mb-4 border border-[var(--border-subtle)]">
            <button id="auth-tab-login" class="py-2 rounded-xl font-black text-xs transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] shadow-sm cursor-pointer" data-i18n="auth_tab_login">Giriş Yap</button>
            <button id="auth-tab-register" class="py-2 rounded-xl font-bold text-xs transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer" data-i18n="auth_tab_register">Kayıt Ol</button>
        </div>

        <!-- Form İncil / Inputlar -->
        <div class="flex flex-col gap-3 mb-4">
            <input type="email" id="auth-email-input" class="w-full bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-2xl px-3.5 py-3 text-xs font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-gold)] transition-all shadow-inner" placeholder="E-posta adresin" data-i18n-ph="auth_email_placeholder">
            <input type="password" id="auth-password-input" class="w-full bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-2xl px-3.5 py-3 text-xs font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-gold)] transition-all shadow-inner" placeholder="Şifre (en az 6 karakter)" data-i18n-ph="auth_password_placeholder">
        </div>

        <button id="btn-auth-submit" class="w-full bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-lg active:scale-95 transition-all text-xs tracking-wide hover:brightness-110 mb-2 cursor-pointer">
            <span data-i18n="auth_btn_submit_login">Giriş Yap</span>
        </button>

        <button id="btn-auth-forgot" class="text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent-gold)] underline transition-colors cursor-pointer text-center">
            <span data-i18n="auth_btn_forgot">Şifremi Unuttum</span>
        </button>
    </div>
</div>
`;
