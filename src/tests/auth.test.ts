// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { setLang, t, applyStaticTranslations, TRANSLATIONS } from '../i18n/translations';
import { validateAuthInput, getAuthAccountInfo } from '../services/authService';
import { openAuthModal, closeAuthModal, initAuthController, refreshAuthProfileUI } from '../controllers/authController';

describe('Faz 4a Evrensel Hesap & Bulut Yedekleme Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initAuthController();
  });

  it('1. validateAuthInput: Geçersiz e-posta, kısa şifre ve geçerli girdiler doğru ayrıştırılmalı', () => {
    expect(validateAuthInput('abc', '123456').ok).toBe(false);
    expect(validateAuthInput('abc', '123456').reason).toBe('invalid_email');

    expect(validateAuthInput('a@b', '123456').ok).toBe(false);
    expect(validateAuthInput('a@b', '123456').reason).toBe('invalid_email');

    expect(validateAuthInput('test@example.com', '12345').ok).toBe(false);
    expect(validateAuthInput('test@example.com', '12345').reason).toBe('weak_password');

    expect(validateAuthInput('otto@example.com', '123456').ok).toBe(true);
  });

  it('2. Sıfır Duvar (Misafir Erişimi) & Profil İzolasyonu: Misafir girişi engellenmemeli, başkasının profilinde hesap bölümü gizlenmeli', () => {
    const welcomeModal = document.getElementById('username-modal');
    const welcomeAuthBtn = document.getElementById('btn-welcome-open-auth');
    const saveUsernameBtn = document.getElementById('save-username');

    expect(welcomeAuthBtn).not.toBeNull();
    expect(saveUsernameBtn).not.toBeNull();

    // Başkasının profili render edildiğinde #profile-account-section gizlenmeli
    const mockStats: any = {
      username: 'RakipPlayer',
      level: 10,
      gold: 500,
      avatar: 'av_prism',
      title: 'Çırak',
      totalCompleted: 5,
      duelWins: 2,
      duelLosses: 1,
      duelMmr: 1050,
      botMmr: 1000,
      bestBasitFormatted: '--:--',
      bestOrtaFormatted: '--:--',
      bestZorFormatted: '--:--',
      variantScores: { classic: 100, irregular: 0, killer: 0, wordoku: 0, samurai: 0 },
      variantLevels: { classic: 10, irregular: 1, killer: 1, wordoku: 1, samurai: 1 },
      dominantVariant: 'classic'
    };

    UIManager.renderProfileModal(mockStats, [], false);

    const accountSection = document.getElementById('profile-account-section');
    expect(accountSection?.classList.contains('hidden')).toBe(true);

    // Kendi profilimiz render edildiğinde #profile-account-section görünür olmalı
    UIManager.renderProfileModal(mockStats, [], true);
    expect(accountSection?.classList.contains('hidden')).toBe(false);
  });

  it('3. Modal Sekme Geçişi & Hata Doğrulaması (DOM): Login/Register sekmeleri buton metnini değiştirmeli, geçersiz girdi reddedilmeli', async () => {
    openAuthModal('login');

    const authModal = document.getElementById('auth-modal');
    expect(authModal?.classList.contains('hidden')).toBe(false);

    const submitBtn = document.getElementById('btn-auth-submit');
    const forgotBtn = document.getElementById('btn-auth-forgot');
    const tabRegister = document.getElementById('auth-tab-register');
    const tabLogin = document.getElementById('auth-tab-login');

    expect(submitBtn?.textContent).toContain('Giriş Yap');
    expect(forgotBtn?.classList.contains('hidden')).toBe(false);

    // Kayıt sekmesine tıkla
    tabRegister?.click();

    expect(submitBtn?.textContent).toContain('Hesabı Oluştur & Yedekle');
    expect(forgotBtn?.classList.contains('hidden')).toBe(true);

    // Tekrar Giriş sekmesine tıkla
    tabLogin?.click();
    expect(submitBtn?.textContent).toContain('Giriş Yap');

    // Geçersiz e-posta girip tıkla
    const emailInput = document.getElementById('auth-email-input') as HTMLInputElement;
    const passInput = document.getElementById('auth-password-input') as HTMLInputElement;

    if (emailInput && passInput) {
      emailInput.value = 'invalidemail';
      passInput.value = '123456';
    }

    submitBtn?.click();
    // Modal kapanmamalı (geçersiz e-posta engeli)
    expect(authModal?.classList.contains('hidden')).toBe(false);

    closeAuthModal();
    expect(authModal?.classList.contains('hidden')).toBe(true);
  });

  it('4. Çift Dilli Sızıntı (TR <-> EN): Tüm auth_* anahtarları ve modal metinleri EN modunda Türkçe karakter, TR modunda yasaklı kelime içermemeli', () => {
    const authKeys = [
      'auth_section_title',
      'auth_status_guest',
      'auth_modal_title',
      'auth_tab_login',
      'auth_tab_register',
      'auth_email_placeholder',
      'auth_password_placeholder',
      'auth_btn_submit_login',
      'auth_btn_submit_register',
      'auth_btn_forgot',
      'auth_btn_logout',
      'auth_btn_delete',
      'auth_err_invalid_email',
      'auth_err_weak_password'
    ];

    const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;
    const forbiddenEnWords = /\b(Sign In|Sign Up|Password|Delete Account|Guest Mode|Cloud Sync)\b/i;

    authKeys.forEach(k => {
      const trVal = TRANSLATIONS.tr[k] || '';
      const enVal = TRANSLATIONS.en[k] || '';

      expect(trVal.length).toBeGreaterThan(0);
      expect(enVal.length).toBeGreaterThan(0);

      // EN metninde Türkçe karakter olmamalı
      expect(trCharRegex.test(enVal)).toBe(false);

      // TR metninde yasaklı İngilizce kelime kalmamalı
      expect(forbiddenEnWords.test(trVal)).toBe(false);
    });
  });

  it('5. Boş Ekran Koruması: #btn-welcome-open-auth tıklandığında #username-modal kapanmalı, #btn-close-auth tıklandığında #username-modal tekrar açılmalı', () => {
    expect(UserManager.getUsername()).toBeNull();

    const usernameModal = document.getElementById('username-modal');
    const authModal = document.getElementById('auth-modal');
    const welcomeAuthBtn = document.getElementById('btn-welcome-open-auth');
    const closeAuthBtn = document.getElementById('btn-close-auth');

    // Başlangıçta username-modal görünür olmalı
    UIManager.toggleModal('username-modal', true);
    expect(usernameModal?.classList.contains('hidden')).toBe(false);

    // E-posta butonuna bas
    welcomeAuthBtn?.click();
    expect(usernameModal?.classList.contains('hidden')).toBe(true);
    expect(authModal?.classList.contains('hidden')).toBe(false);

    // Kapat butonuna bas -> kullanıcı adı henüz olmadığı için #username-modal otomatik geri açılmalı
    closeAuthBtn?.click();
    expect(authModal?.classList.contains('hidden')).toBe(true);
    expect(usernameModal?.classList.contains('hidden')).toBe(false);
  });

  it('6. syncFullEconomyToCloud: Tanımlı olmalı ve test ortamında ağ hatası vermeden tamamlanmalı', async () => {
    expect(typeof UserManager.syncFullEconomyToCloud).toBe('function');
    await expect(UserManager.syncFullEconomyToCloud()).resolves.not.toThrow();
  });
});
