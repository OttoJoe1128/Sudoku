import './design/tokens.css';
import { UIManager } from './ui/uiManager';
import { renderAvatarSVG, renderRankBadgeSVG, Icons } from './design/icons';
import { getLang, setLang, t, applyStaticTranslations, translateRankName, initDefaultLang } from './i18n/translations';
import { SudokuGen, SudokuVariant } from './engine/sudoku';
import { UserManager } from './store/userState';
import { ShopManager } from './engine/shop';
import { SoundManager } from './engine/soundManager';
import { MatchEngine } from './engine/matchEngine';
import { sanitizeUsername } from './utils/sanitize';
import { App } from '@capacitor/app';

import { initSaveController, updateSavedGamesCountUI, reconcileLevelsWithSavedGames, getSavedGamesList } from './controllers/saveController';
import { initMapController, getSelectedMapVariant, openMapAtLevel, refreshMapLanguageUI } from './controllers/mapController';
import { initArenaController, getSelectedArenaVariant, handleIncomingChallenge, triggerExpertBotMatch } from './controllers/arenaController';
import { initModalsController, getSelectedCustomVariant, getSelectedCustomTimeSec, openPlayerProfile } from './controllers/modalsController';
import { initGameController, startGame, startPlacementExam, handleBotMatchProgress, handleExitGameRequest, getGameRuntimeState, refreshGameLanguageUI } from './controllers/gameController';
import { AdService } from './services/adService';
import { openOnboardingModal, isOnboardingDone } from './controllers/onboardingController';
import { startAppTour, isAppTourDone } from './controllers/appTourController';
import { initAcademyController, refreshAcademyLanguageUI } from './controllers/academyController';
import { initAbilitiesController, refreshAbilitiesLanguageUI, updateCrystalDisplays, closeAbilitiesModal, closeAbilityDetailModal } from './controllers/abilitiesController';
import { initLevelPrepController, refreshLevelPrepLanguageUI, closeLevelPrepModal } from './controllers/levelPrepController';
import { initAuthController, refreshAuthLanguageUI, refreshAuthProfileUI, closeAuthModal } from './controllers/authController';
import { initStreakController, refreshStreakLanguageUI, closeStreakModal } from './controllers/streakController';
import { initPostcardController, openPostcardModal, closePostcardModal } from './controllers/postcardController';
import { AbilityId } from './engine/abilities';

// UI Binişi & Öz-Teşhis
UIManager.mountUI();
AdService.init();

if (import.meta.env.DEV) {
  SudokuGen.runSelfDiagnostics();
}

// Arka Plan Müzik Kontrolü Dinleyicileri (Native + Web/PWA)
try {
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      SoundManager.resumeFromBackground();
    } else {
      SoundManager.pauseForBackground();
    }
  });
} catch {
  // Capacitor App dinleyicisi web/test ortaminda yutulur
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      SoundManager.pauseForBackground();
    } else {
      SoundManager.resumeFromBackground();
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    SoundManager.pauseForBackground();
  });
}

// Altın Göstergesi Güncelleme
const updateGoldDisplay = () => {
  const gold = UserManager.getGold();
  UIManager.updateHeaderGold(gold);
};

// Profil UI Güncelleme Yardımcısı
const updateProfileUI = (user: { username: string; title?: string; avatar?: string }) => {
  const nameEl = document.getElementById('menu-player-name');
  const titleEl = document.getElementById('menu-player-title');
  const avatarBox = document.getElementById('menu-avatar-box');

  if (nameEl) nameEl.innerText = user.username;
  if (titleEl) titleEl.innerHTML = renderRankBadgeSVG(user.title || 'Çırak');
  if (avatarBox) avatarBox.innerHTML = renderAvatarSVG(user.avatar || 'av_prism', 28);

  updateLanguageUI();
  updateGoldDisplay();
  updateSavedGamesCountUI();
};

// Disiplin Kural Açıklaması Alıcı
const getRuleDescription = (variant: SudokuVariant): string => {
  return t('rule_' + variant);
};

// Canlı Dil Değişimi Arayüz Güncelleme
const updateLanguageUI = () => {
  const currentLang = getLang();
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = currentLang;
  }
  const trOpt = document.getElementById('lang-opt-tr');
  const enOpt = document.getElementById('lang-opt-en');
  if (trOpt && enOpt) {
    if (currentLang === 'tr') {
      trOpt.className = 'text-[var(--accent-gold)]';
      enOpt.className = 'text-[var(--text-secondary)] opacity-50';
    } else {
      trOpt.className = 'text-[var(--text-secondary)] opacity-50';
      enOpt.className = 'text-[var(--accent-gold)]';
    }
  }

  applyStaticTranslations();
  updateSavedGamesCountUI();
  refreshMapLanguageUI();
  refreshAcademyLanguageUI();
  refreshAbilitiesLanguageUI();
  refreshLevelPrepLanguageUI();
  refreshGameLanguageUI();
  refreshAuthLanguageUI();
  refreshStreakLanguageUI();
  updateCrystalDisplays();
  updateWelcomeLangUI();

  const currentTitle = UserManager.getTitle();
  const titleEl = document.getElementById('menu-player-title');
  if (titleEl) titleEl.innerHTML = renderRankBadgeSVG(translateRankName(currentTitle));

  const savedName = UserManager.getUsername();
  const nameEl = document.getElementById('menu-player-name');
  if (nameEl) nameEl.innerText = savedName ? savedName : t('menu_guest');

  const mults: Record<SudokuVariant, string> = { classic: '1.0x', wordoku: '1.2x', irregular: '1.5x', killer: '1.8x', samurai: '2.5x' };

  const customVariant = getSelectedCustomVariant();
  const customTimeSec = getSelectedCustomTimeSec();
  const mapVariant = getSelectedMapVariant();
  const arenaVariant = getSelectedArenaVariant();

  const ruleDescCustom = document.getElementById('custom-variant-rule-desc');
  if (ruleDescCustom) ruleDescCustom.innerText = getRuleDescription(customVariant);
  const customBadge = document.getElementById('custom-variant-multiplier-badge');
  if (customBadge) customBadge.innerText = t('pts_multiplier', { mult: mults[customVariant] || '1.0x' });

  const ruleDescMap = document.getElementById('map-variant-rule-desc');
  if (ruleDescMap) ruleDescMap.innerText = getRuleDescription(mapVariant);

  const ruleDescArena = document.getElementById('arena-variant-rule-desc');
  if (ruleDescArena) ruleDescArena.innerText = getRuleDescription(arenaVariant);
  const arenaBadge = document.getElementById('arena-variant-multiplier-badge');
  if (arenaBadge) arenaBadge.innerText = t('pts_multiplier', { mult: mults[arenaVariant] || '1.0x' });

  const notesTextEl = document.getElementById('notes-status-text');
  if (notesTextEl) {
    const isNotes = getGameRuntimeState().isNotesMode;
    notesTextEl.innerText = isNotes ? t('btn_notes_on') : t('btn_notes_off');
  }

  const mult = customTimeSec === 180 ? 1.5 : 1.0;
  const b1 = document.getElementById('badge-custom-basit-reward');
  const b2 = document.getElementById('badge-custom-orta-reward');
  const b3 = document.getElementById('badge-custom-zor-reward');
  if (b1) b1.innerText = `+${Math.round(10 * mult)} ${t('label_gold')}`;
  if (b2) b2.innerText = `+${Math.round(20 * mult)} ${t('label_gold')}`;
  if (b3) b3.innerText = `+${Math.round(35 * mult)} ${t('label_gold')}`;
};

// ----------------------------------------------------
// 5 CONTROLLER BAŞLATMA VE BAĞLANTI SİSTEMİ
// ----------------------------------------------------

initGameController({
  onUpdateGoldDisplay: updateGoldDisplay,
  onReturnToMap: (variant, unlockedLevel) => openMapAtLevel(variant, unlockedLevel)
});

initSaveController({
  onPlaySavedGame: (record) => {
    startGame(record.level, record.diff, undefined, record, record.variant, !!record.isCustomMode);
    UIManager.showToast(t('toast_switching_saved_game', { variant: record.variant.toUpperCase() }), "success");
  }
});

initMapController({
  onStartLevel: (level: number, diff: 'basit' | 'orta' | 'zor', variant: SudokuVariant, selectedAbilities?: AbilityId[]) => {
    startGame(level, diff, undefined, undefined, variant, false, 0, selectedAbilities || []);
  },
  onBackToMenu: () => {
    updateSavedGamesCountUI();
    UIManager.navigate('menu');
  },
  getRuleDescription
});

initArenaController({
  onStartMatchGame: (level, diff, matchData, variant) => {
    startGame(level, diff, matchData, undefined, variant);
  },
  onBotMatchProgress: handleBotMatchProgress,
  getRuleDescription
});

initModalsController({
  onStartCustomGame: (level, diff, variant, timeLimitSec) => {
    startGame(level, diff, undefined, undefined, variant, true, timeLimitSec);
  },
  onStartPlacementExam: (variant, tier) => {
    startPlacementExam(variant, tier);
  },
  onStartLevelDirect: (level, diff) => {
    startGame(level, diff, undefined, undefined, getSelectedMapVariant(), false);
  },
  onUpdateGoldDisplay: updateGoldDisplay,
  onUpdateSavedGamesUI: updateSavedGamesCountUI,
  onTriggerExpertBotMatch: () => {
    triggerExpertBotMatch(
      (level, diff, matchData, variant) => startGame(level, diff, matchData, undefined, variant),
      handleBotMatchProgress
    );
  },
  getSelectedArenaVariant,
  getSelectedMapVariant,
  getRuleDescription,
  onHandleIncomingChallenge: (chal) => handleIncomingChallenge(chal, (level, diff, matchData, variant) => startGame(level, diff, matchData, undefined, variant))
});

initAcademyController();
initAbilitiesController();
initLevelPrepController();
initStreakController({
  onUpdateGoldDisplay: () => updateGoldDisplay()
});
initPostcardController();
initAuthController({
  onAuthSynced: () => {
    updateGoldDisplay();
    updateSavedGamesCountUI();
    updateCrystalDisplays();
    const user = UserManager.getOfflineFallbackUser();
    if (user) updateProfileUI(user);
  }
});
updateCrystalDisplays();

// ----------------------------------------------------
// DİL DEĞİŞTİRME & KULLANICI GİRİŞ DİNLEYİCİLERİ
// ----------------------------------------------------

const updateWelcomeLangUI = () => {
  const current = getLang();
  const trBtn = document.getElementById('welcome-lang-tr');
  const enBtn = document.getElementById('welcome-lang-en');
  if (trBtn && enBtn) {
    if (current === 'tr') {
      trBtn.className = 'px-3 py-1 rounded-xl transition-all bg-[var(--accent-gold)] text-[var(--text-on-gold)]';
      enBtn.className = 'px-3 py-1 rounded-xl transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]';
    } else {
      enBtn.className = 'px-3 py-1 rounded-xl transition-all bg-[var(--accent-gold)] text-[var(--text-on-gold)]';
      trBtn.className = 'px-3 py-1 rounded-xl transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]';
    }
  }
};

document.getElementById('welcome-lang-tr')?.addEventListener('click', () => {
  setLang('tr');
  updateLanguageUI();
});

document.getElementById('welcome-lang-en')?.addEventListener('click', () => {
  setLang('en');
  updateLanguageUI();
});

document.getElementById('btn-lang-toggle')?.addEventListener('click', () => {
  const nextLang = getLang() === 'tr' ? 'en' : 'tr';
  setLang(nextLang);
  updateLanguageUI();
  UIManager.showToast(nextLang === 'en' ? t('toast_lang_en') : t('toast_lang_tr'), 'info');
});

document.getElementById('btn-quick-play')?.addEventListener('click', () => {
  const savedList = getSavedGamesList();
  if (savedList.length > 0) {
    const sorted = [...savedList].sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
    const latest = sorted[0];
    startGame(latest.level, latest.diff, latest.matchData, latest, latest.variant || 'classic', !!latest.isCustomMode);
  } else {
    const classicLvl = UserManager.getVariantLevel('classic');
    const diff = SudokuGen.getDifficulty(classicLvl);
    startGame(classicLvl, diff, undefined, undefined, 'classic');
  }
});

document.getElementById('btn-menu-progress-pill')?.addEventListener('click', () => {
  openMapAtLevel(getSelectedMapVariant());
});

document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
  const active = ShopManager.getActiveTheme();
  const nextTheme = active === 'theme-ivory' ? 'theme-obsidian' : 'theme-ivory';
  ShopManager.setActiveTheme(nextTheme);
  UIManager.applyTheme(nextTheme);
  const msg = nextTheme === 'theme-ivory' ? t('toast_theme_day') : t('toast_theme_night');
  UIManager.showToast(msg, 'info');
});

const updateSoundButtonUI = () => {
  const btn = document.getElementById('btn-sound-toggle');
  if (btn) {
    if (SoundManager.isEnabled()) {
      btn.innerHTML = Icons.volumeOn;
      btn.className = "bg-[var(--bg-elevated)] text-[var(--accent-gold)] p-2.5 rounded-2xl active:scale-95 transition-transform border border-[var(--border-subtle)] flex items-center justify-center";
    } else {
      btn.innerHTML = Icons.volumeOff;
      btn.className = "bg-[var(--bg-elevated)] text-[var(--text-secondary)] opacity-60 p-2.5 rounded-2xl active:scale-95 transition-transform border border-[var(--border-subtle)] flex items-center justify-center";
    }
  }
};
updateSoundButtonUI();

document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
  const isNowEnabled = SoundManager.toggle();
  updateSoundButtonUI();
  UIManager.showToast(isNowEnabled ? t('toast_sound_on') : t('toast_sound_off'), 'info');
});

document.getElementById('btn-open-help')?.addEventListener('click', () => {
  openOnboardingModal();
});

document.addEventListener('pointerdown', () => {
  SoundManager.startBgm();
}, { once: true });

// Etkileşimli Sembol Bilgi Popover Dinleyicisi
document.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest('[data-variant-info]');
  if (target) {
    const v = target.getAttribute('data-variant-info') as SudokuVariant;
    if (v) UIManager.showVariantSymbolInfo(v);
  }
});

// Canlı Düello Dinleyicilerini Başlatma
let challengeListenersBound = false;

const startChallengeListeners = () => {
  if (challengeListenersBound) return;
  challengeListenersBound = true;

  MatchEngine.listenPendingChallenges((list) => {
    UIManager.updateInboxBadge(list.length);
  });

  MatchEngine.listenOutgoingChallenges((acceptedChal) => {
    if (acceptedChal.matchData) {
      UIManager.showToast(t('toast_challenge_accepted', { username: acceptedChal.targetUsername || 'Rakip' }), 'success');
      startGame(1, acceptedChal.difficulty, acceptedChal.matchData);
    }
  });

  MatchEngine.listenIncomingChallenges((chal) => handleIncomingChallenge(chal, (level, diff, matchData, variant) => startGame(level, diff, matchData, undefined, variant)));
};

// Kullanıcı Profil Giriş Akışı (Optimistic Local Boot)
const checkUser = async () => {
  const existingUsername = UserManager.getUsername();
  if (existingUsername) {
    reconcileLevelsWithSavedGames();
    UserManager.validateAndRepairLocalState();

    const localUser = UserManager.getOfflineFallbackUser();
    if (localUser) {
      updateProfileUI(localUser);
      UIManager.navigate('menu');
    }

    UserManager.initUser().then(syncedUser => {
      if (syncedUser) {
        updateProfileUI(syncedUser);
        startChallengeListeners();
      }
    }).catch(e => {
      console.warn("Bulut senkronizasyonu hatası:", e);
    });

    setTimeout(() => {
      if (!UserManager.getNotificationsEnabled() && localStorage.getItem('sudoku_notify_prompted') !== '1') {
        UIManager.promptNotificationPermission('startup');
      }
    }, 1200);
  } else {
    const user = await UserManager.initUser();
    reconcileLevelsWithSavedGames();
    UserManager.validateAndRepairLocalState();
    if (!user || !UserManager.getUsername()) {
      UIManager.toggleModal('username-modal', true);
    } else {
      updateProfileUI(user);
      UIManager.navigate('menu');

      startChallengeListeners();

      setTimeout(() => {
        if (!UserManager.getNotificationsEnabled() && localStorage.getItem('sudoku_notify_prompted') !== '1') {
          UIManager.promptNotificationPermission('startup');
        }
      }, 1200);
    }
  }
};

document.getElementById('save-username')?.addEventListener('click', async () => {
  const input = document.getElementById('username-input') as HTMLInputElement;
  const newName = sanitizeUsername(input?.value || '');
  if (newName.length >= 3) {
    const user = await UserManager.saveUser(newName);
    const profileNameEl = document.getElementById('profile-username');
    if (profileNameEl) profileNameEl.innerText = user.username;

    updateProfileUI(user);
    startChallengeListeners();

    UIManager.toggleModal('username-modal', false);
    UIManager.showToast(t('toast_username_updated', { username: user.username }), 'success');

    setTimeout(() => {
      if (!isAppTourDone()) {
        startAppTour();
      } else if (!isOnboardingDone()) {
        openOnboardingModal();
      } else if (!UserManager.getNotificationsEnabled() && localStorage.getItem('sudoku_notify_prompted') !== '1') {
        UIManager.promptNotificationPermission('startup');
      }
    }, 1200);
  } else {
    UIManager.showToast(t('toast_username_min_chars'), "error");
  }
});

document.getElementById('close-username-modal')?.addEventListener('click', () => {
  if (UserManager.getUsername()) {
    UIManager.toggleModal('username-modal', false);
  }
});

// Heartbeat Presence Zamanlayıcısı (Her 30 saniyede bir)
setInterval(() => {
  if (UserManager.getUsername()) {
    const isGameVisible = !document.getElementById('game-view')?.classList.contains('hidden');
    UserManager.setPresence(isGameVisible ? (getGameRuntimeState().isMatchMode ? 'in_duel' : 'in_game') : 'available');
  }
}, 30000);

// Başlangıç Kontrolü
initDefaultLang();
updateLanguageUI();
checkUser();

// Android Donanım Geri Tuşu Mantığı (Capacitor)
App.addListener('backButton', async () => {
  const detailModal = document.getElementById('ability-detail-modal');
  if (detailModal && !detailModal.classList.contains('hidden')) {
    closeAbilityDetailModal();
    return;
  }

  const streakModal = document.getElementById('streak-modal');
  if (streakModal && !streakModal.classList.contains('hidden')) {
    closeStreakModal();
    return;
  }

  const authModal = document.getElementById('auth-modal');
  if (authModal && !authModal.classList.contains('hidden')) {
    closeAuthModal();
    return;
  }

  const abilitiesModal = document.getElementById('abilities-modal');
  if (abilitiesModal && !abilitiesModal.classList.contains('hidden')) {
    closeAbilitiesModal();
    return;
  }

  const levelPrepModal = document.getElementById('level-prep-modal');
  if (levelPrepModal && !levelPrepModal.classList.contains('hidden')) {
    closeLevelPrepModal();
    return;
  }

  const modals = [
    'auth-modal',
    'avatar-gallery-modal',
    'username-modal',
    'view-profile',
    'view-inbox',
    'view-saved-games',
    'view-leaderboard',
    'view-shop',
    'view-achievements',
    'placement-modal',
    'placement-result-modal',
    'match-search-modal',
    'match-result-modal',
    'duel-exit-modal',
    'crystal-repair-modal',
    'academy-modal',
    'second-chance-modal',
    'onboarding-modal',
    'postcard-modal'
  ];
  const openModal = modals.find(id => {
    const el = document.getElementById(id);
    return el && !el.classList.contains('hidden');
  });

  if (openModal) {
    UIManager.toggleModal(openModal, false);
    return;
  }

  const gameView = document.getElementById('game-view');
  const mapView = document.getElementById('view-map');
  const customView = document.getElementById('view-custom');

  if (gameView && !gameView.classList.contains('hidden')) {
    const exited = await handleExitGameRequest();
    if (!exited) return;
    return;
  }

  if (mapView && !mapView.classList.contains('hidden')) {
    UIManager.navigate('menu');
    return;
  }

  if (customView && !customView.classList.contains('hidden')) {
    UIManager.navigate('menu');
    return;
  }

  App.exitApp();
});
