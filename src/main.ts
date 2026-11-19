import './design/tokens.css';
import { UIManager } from './ui/uiManager';
import { renderAvatarSVG, renderRankBadgeSVG } from './design/icons';
import { getLang, setLang, t, applyStaticTranslations } from './i18n/translations';
import { SudokuGen, SudokuVariant } from './engine/sudoku';
import { UserManager } from './store/userState';
import { ShopManager } from './engine/shop';
import { MatchEngine } from './engine/matchEngine';
import { App } from '@capacitor/app';

import { initSaveController, updateSavedGamesCountUI } from './controllers/saveController';
import { initMapController, getSelectedMapVariant } from './controllers/mapController';
import { initArenaController, getSelectedArenaVariant, handleIncomingChallenge, triggerExpertBotMatch } from './controllers/arenaController';
import { initModalsController, getSelectedCustomVariant, getSelectedCustomTimeSec, openPlayerProfile } from './controllers/modalsController';
import { initGameController, startGame, startPlacementExam, handleBotMatchProgress, handleExitGameRequest, getGameRuntimeState } from './controllers/gameController';

// UI Binişi & Öz-Teşhis
UIManager.mountUI();
SudokuGen.runSelfDiagnostics();

// Altın Göstergesi Güncelleme
const updateGoldDisplay = () => {
  const gold = UserManager.getGold();
  UIManager.updateHeaderGold(gold);
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

  const currentTitle = UserManager.getTitle();
  const titleEl = document.getElementById('menu-player-title');
  if (titleEl) titleEl.innerHTML = renderRankBadgeSVG(currentTitle);

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
  onUpdateGoldDisplay: updateGoldDisplay
});

initSaveController({
  onPlaySavedGame: (record) => {
    startGame(record.level, record.diff, undefined, record, record.variant, !!record.isCustomMode);
    UIManager.showToast(`▶ Kayıtlı ${record.variant.toUpperCase()} oyununa devam ediliyor!`, "success");
  }
});

initMapController({
  onStartLevel: (level, diff, variant) => {
    startGame(level, diff, undefined, undefined, variant);
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

// ----------------------------------------------------
// DİL DEĞİŞTİRME & KULLANICI GİRİŞ DİNLEYİCİLERİ
// ----------------------------------------------------

document.getElementById('btn-lang-toggle')?.addEventListener('click', () => {
  const nextLang = getLang() === 'tr' ? 'en' : 'tr';
  setLang(nextLang);
  updateLanguageUI();
  UIManager.showToast(nextLang === 'en' ? 'Language switched to English' : 'Dil Türkçe olarak ayarlandı', 'info');
});

document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
  const active = ShopManager.getActiveTheme();
  const nextTheme = active === 'theme-ivory' ? 'theme-obsidian' : 'theme-ivory';
  ShopManager.setActiveTheme(nextTheme);
  UIManager.applyTheme(nextTheme);
  const isEn = getLang() === 'en';
  const msg = nextTheme === 'theme-ivory'
    ? (isEn ? 'Daylight Theme (Ivory & Marble)' : 'Gündüz Teması (Fildişi & Mermer)')
    : (isEn ? 'Night Theme (Obsidian & Gold)' : 'Gece Teması (Obsidyen & Altın)');
  UIManager.showToast(msg, 'info');
});

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
      UIManager.showToast(`⚔️ ${acceptedChal.targetUsername || 'Rakip'} davetinizi kabul etti! Maç başlıyor...`, 'success');
      startGame(1, acceptedChal.difficulty, acceptedChal.matchData);
    }
  });

  MatchEngine.listenIncomingChallenges((chal) => handleIncomingChallenge(chal, (level, diff, matchData, variant) => startGame(level, diff, matchData, undefined, variant)));
};

// Kullanıcı Profil Giriş Akışı
const checkUser = async () => {
  const user = await UserManager.initUser();
  if (!user || !UserManager.getUsername()) {
    UIManager.toggleModal('username-modal', true);
  } else {
    const nameEl = document.getElementById('menu-player-name');
    const titleEl = document.getElementById('menu-player-title');
    const avatarBox = document.getElementById('menu-avatar-box');

    if (nameEl) nameEl.innerText = user.username;
    if (titleEl) titleEl.innerHTML = renderRankBadgeSVG(user.title || 'Çırak');
    if (avatarBox) avatarBox.innerHTML = renderAvatarSVG(user.avatar || 'av_prism', 28);

    updateLanguageUI();
    updateGoldDisplay();
    updateSavedGamesCountUI();
    UIManager.navigate('menu');

    startChallengeListeners();
  }
};

document.getElementById('save-username')?.addEventListener('click', async () => {
  const input = document.getElementById('username-input') as HTMLInputElement;
  const newName = input?.value?.trim();
  if (newName && newName.length >= 3) {
    const user = await UserManager.saveUser(newName);
    const nameEl = document.getElementById('menu-player-name');
    const profileNameEl = document.getElementById('profile-username');
    const titleEl = document.getElementById('menu-player-title');
    const avatarBox = document.getElementById('menu-avatar-box');

    if (nameEl) nameEl.innerText = user.username;
    if (profileNameEl) profileNameEl.innerText = user.username;
    if (titleEl) titleEl.innerHTML = renderRankBadgeSVG(user.title || 'Çırak');
    if (avatarBox) avatarBox.innerHTML = renderAvatarSVG(user.avatar || 'av_prism', 28);

    updateLanguageUI();
    updateGoldDisplay();
    updateSavedGamesCountUI();
    startChallengeListeners();

    UIManager.toggleModal('username-modal', false);
    UIManager.showToast(`Kullanıcı adı güncellendi: ${user.username}`, 'success');
  } else {
    UIManager.showToast("Lütfen en az 3 karakterden oluşan bir isim giriniz!", "error");
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
checkUser();

// Android Donanım Geri Tuşu Mantığı (Capacitor)
App.addListener('backButton', async () => {
  const modals = ['avatar-gallery-modal', 'username-modal', 'view-profile', 'view-inbox', 'view-saved-games', 'view-leaderboard', 'view-shop', 'view-achievements', 'placement-modal', 'placement-result-modal', 'match-search-modal', 'match-result-modal', 'duel-exit-modal'];
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
