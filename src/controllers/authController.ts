import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { sanitizeUsername } from '../utils/sanitize';
import { t, applyStaticTranslations } from '../i18n/translations';
import {
  getAuthAccountInfo,
  registerOrLinkWithEmail,
  loginWithEmail,
  sendPasswordReset,
  logoutAccount,
  deleteAccountPermanently
} from '../services/authService';

let activeAuthMode: 'login' | 'register' = 'login';
let onAuthSyncedCallback: (() => void) | null = null;

export function openAuthModal(mode: 'login' | 'register' = 'login'): void {
  activeAuthMode = mode;
  UIManager.toggleModal('auth-modal', true);
  applyStaticTranslations();
  updateAuthModalUI();
}

export function closeAuthModal(): void {
  UIManager.toggleModal('auth-modal', false);
  if (!UserManager.getUsername()) {
    UIManager.toggleModal('username-modal', true);
  }
}

export function refreshAuthLanguageUI(): void {
  const modal = document.getElementById('auth-modal');
  if (modal && !modal.classList.contains('hidden')) {
    applyStaticTranslations();
    updateAuthModalUI();
  }
  refreshAuthProfileUI();
}

export function refreshAuthProfileUI(): void {
  const info = getAuthAccountInfo();
  const statusEl = document.getElementById('profile-auth-status');
  const openAuthBtn = document.getElementById('btn-profile-open-auth');
  const logoutBtn = document.getElementById('btn-profile-logout');
  const deleteBtn = document.getElementById('btn-profile-delete-account');

  if (statusEl) {
    if (info.isSignedInWithEmail && info.email) {
      statusEl.innerText = t('auth_status_linked', { email: info.email });
    } else {
      statusEl.innerText = t('auth_status_guest');
    }
  }

  if (info.isSignedInWithEmail) {
    openAuthBtn?.classList.add('hidden');
    logoutBtn?.classList.remove('hidden');
    deleteBtn?.classList.remove('hidden');
  } else {
    openAuthBtn?.classList.remove('hidden');
    logoutBtn?.classList.add('hidden');
    deleteBtn?.classList.add('hidden');
  }
}

function updateAuthModalUI(): void {
  const tabLogin = document.getElementById('auth-tab-login');
  const tabRegister = document.getElementById('auth-tab-register');
  const submitBtn = document.getElementById('btn-auth-submit');
  const forgotBtn = document.getElementById('btn-auth-forgot');

  if (activeAuthMode === 'login') {
    if (tabLogin) tabLogin.className = "py-2 rounded-xl font-black text-xs transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] shadow-sm cursor-pointer";
    if (tabRegister) tabRegister.className = "py-2 rounded-xl font-bold text-xs transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer";
    if (submitBtn) submitBtn.innerHTML = `<span data-i18n="auth_btn_submit_login">${t('auth_btn_submit_login')}</span>`;
    forgotBtn?.classList.remove('hidden');
  } else {
    if (tabRegister) tabRegister.className = "py-2 rounded-xl font-black text-xs transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] shadow-sm cursor-pointer";
    if (tabLogin) tabLogin.className = "py-2 rounded-xl font-bold text-xs transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer";
    if (submitBtn) submitBtn.innerHTML = `<span data-i18n="auth_btn_submit_register">${t('auth_btn_submit_register')}</span>`;
    forgotBtn?.classList.add('hidden');
  }
}

export function initAuthController(callbacks?: { onAuthSynced?: () => void }): void {
  if (callbacks?.onAuthSynced) {
    onAuthSyncedCallback = callbacks.onAuthSynced;
  }

  document.getElementById('btn-close-auth')?.addEventListener('click', () => {
    closeAuthModal();
  });

  document.getElementById('auth-tab-login')?.addEventListener('click', () => {
    activeAuthMode = 'login';
    updateAuthModalUI();
  });

  document.getElementById('auth-tab-register')?.addEventListener('click', () => {
    activeAuthMode = 'register';
    updateAuthModalUI();
  });

  document.getElementById('btn-profile-open-auth')?.addEventListener('click', () => {
    openAuthModal('login');
  });

  document.getElementById('btn-welcome-open-auth')?.addEventListener('click', () => {
    UIManager.toggleModal('username-modal', false);
    openAuthModal('login');
  });

  document.getElementById('btn-auth-forgot')?.addEventListener('click', async () => {
    const emailEl = document.getElementById('auth-email-input') as HTMLInputElement;
    const email = emailEl?.value || '';
    const res = await sendPasswordReset(email);
    if (res.ok) {
      UIManager.showToast(t('auth_toast_reset_sent'), 'success');
    } else if (res.code === 'invalid_email') {
      UIManager.showToast(t('auth_err_invalid_email'), 'error');
    } else {
      UIManager.showToast(t('auth_err_generic'), 'error');
    }
  });

  document.getElementById('btn-auth-submit')?.addEventListener('click', async () => {
    const emailEl = document.getElementById('auth-email-input') as HTMLInputElement;
    const passEl = document.getElementById('auth-password-input') as HTMLInputElement;
    const email = emailEl?.value || '';
    const pass = passEl?.value || '';

    if (activeAuthMode === 'login') {
      const res = await loginWithEmail(email, pass);
      if (res.ok) {
        UIManager.showToast(t('auth_toast_login_ok'), 'success');
        if (!UserManager.getUsername()) {
          const defaultName = sanitizeUsername(email.split('@')[0]) || 'Oyuncu';
          await UserManager.saveUser(defaultName);
          UIManager.navigate('menu');
        }
        closeAuthModal();
        refreshAuthProfileUI();
        if (onAuthSyncedCallback) onAuthSyncedCallback();
      } else if (res.code === 'invalid_email') {
        UIManager.showToast(t('auth_err_invalid_email'), 'error');
      } else if (res.code === 'weak_password') {
        UIManager.showToast(t('auth_err_weak_password'), 'error');
      } else {
        UIManager.showToast(t('auth_err_generic'), 'error');
      }
    } else {
      const res = await registerOrLinkWithEmail(email, pass);
      if (res.ok) {
        UIManager.showToast(t('auth_toast_register_ok'), 'success');
        closeAuthModal();
        refreshAuthProfileUI();
        if (onAuthSyncedCallback) onAuthSyncedCallback();
      } else if (res.code === 'invalid_email') {
        UIManager.showToast(t('auth_err_invalid_email'), 'error');
      } else if (res.code === 'weak_password') {
        UIManager.showToast(t('auth_err_weak_password'), 'error');
      } else {
        UIManager.showToast(t('auth_err_generic'), 'error');
      }
    }
  });

  document.getElementById('btn-profile-logout')?.addEventListener('click', async () => {
    const res = await logoutAccount();
    if (res.ok) {
      UIManager.showToast(t('auth_toast_logged_out'), 'info');
      refreshAuthProfileUI();
      if (onAuthSyncedCallback) onAuthSyncedCallback();
    }
  });

  document.getElementById('btn-profile-delete-account')?.addEventListener('click', async () => {
    const confirmed = typeof window !== 'undefined' ? window.confirm(t('auth_delete_confirm')) : true;
    if (!confirmed) return;

    const res = await deleteAccountPermanently();
    if (res.ok) {
      UIManager.showToast(t('auth_toast_deleted'), 'info');
      UIManager.toggleModal('view-profile', false);
      refreshAuthProfileUI();
      if (onAuthSyncedCallback) onAuthSyncedCallback();
      UIManager.toggleModal('username-modal', true);
    } else if (res.code === 'auth/requires-recent-login') {
      UIManager.showToast(t('auth_err_relogin_required'), 'error');
    } else {
      UIManager.showToast(t('auth_err_generic'), 'error');
    }
  });
}
