// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { SoundManager } from '../engine/soundManager';
import { ShopManager, ShopItems } from '../engine/shop';
import { AchievementManager } from '../engine/achievements';
import { Rewards } from '../engine/rewards';
import { Leaderboard } from '../engine/leaderboard';
import { SudokuGen, SudokuVariant } from '../engine/sudoku';
import { GameEngine } from '../engine/gameEngine';
import { setLang, getLang, t, applyStaticTranslations, translateRankName, TRANSLATIONS } from '../i18n/translations';
import { renderRankBadgeSVG } from '../design/icons';
import { formatDisplayName, sanitizeUsername } from '../utils/sanitize';
import { openOnboardingModal, renderOnboardingStep, closeOnboardingModal } from '../controllers/onboardingController';
import { APP_TOUR_STEPS, renderTourStep, finishAppTour, isAppTourDone, startAppTour } from '../controllers/appTourController';
import { openMapAtLevel, getSelectedMapVariant, refreshMapLanguageUI, initMapController } from '../controllers/mapController';
import { initGameController, startGame, startPlacementExam, handleExitGameRequest, getGameRuntimeState } from '../controllers/gameController';
import { initSaveController, openSavedGamesModal, getSavedGamesList, saveActiveGameRecord, createPlacementActiveGameSave, updateSavedGamesCountUI } from '../controllers/saveController';
import { initArenaController, getSelectedArenaVariant } from '../controllers/arenaController';
import { initModalsController, getSelectedCustomVariant, getSelectedCustomTimeSec } from '../controllers/modalsController';
import { auth } from '../api/firebase';

describe('Faz 2.4-QA2 Tam Uygulama İnteraktif E2E Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');

    if (auth) {
      (auth as any).currentUser = {
        uid: 'test_user_uid',
        getIdToken: () => Promise.resolve('mock_token'),
        stsTokenManager: { accessToken: 'mock_token' }
      };
    }

    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();

    initGameController({
      onUpdateGoldDisplay: () => {
        const goldEl = document.getElementById('menu-gold');
        if (goldEl) goldEl.innerText = UserManager.getGold().toString();
      }
    });

    initSaveController({
      onPlaySavedGame: () => {}
    });

    initMapController({
      onStartLevel: () => {},
      onBackToMenu: () => UIManager.navigate('menu'),
      getRuleDescription: (v) => t('rule_' + v)
    });

    initArenaController({
      onStartMatchGame: () => {},
      onBotMatchProgress: () => Promise.resolve(),
      getRuleDescription: (v) => t('rule_' + v)
    });

    initModalsController({
      onStartCustomGame: () => {},
      onStartPlacementExam: (variant, tier) => startPlacementExam(variant, tier),
      onStartLevelDirect: () => {},
      onUpdateGoldDisplay: () => {},
      onUpdateSavedGamesUI: updateSavedGamesCountUI,
      onTriggerExpertBotMatch: () => {},
      getSelectedArenaVariant,
      getSelectedMapVariant,
      getRuleDescription: (v) => t('rule_' + v),
      onHandleIncomingChallenge: () => {}
    });
  });

  describe('1. Çift Yönlü Tam Dil Denetimi (Text + title + placeholder)', () => {
    it('EN Modunda hiçbir elemanda Türkçe karakter, Türkçe kelime veya Puan sızmamalı', async () => {
      setLang('en');
      applyStaticTranslations();
      updateSavedGamesCountUI();

      UIManager.renderMap(150, 140, 160, () => {}, false);

      const ownStats = await UserManager.getUserProfileStats();
      const badgesStatus = AchievementManager.getAllBadgesWithStatus(ownStats.level, ownStats.gold, ownStats.totalCompleted);
      UIManager.renderProfileModal(ownStats, badgesStatus, true);

      UIManager.renderSavedGamesList([], () => {}, () => {});
      createPlacementActiveGameSave('classic', 10);
      UIManager.renderSavedGamesList(getSavedGamesList(), () => {}, () => {});

      UIManager.renderAchievements(badgesStatus, () => {});
      UIManager.renderShop(() => {});

      UIManager.showRulesAndScoringModal('arena');
      UIManager.showRulesAndScoringModal('custom');
      UIManager.renderBotFallbackPromptModal(() => {}, () => {});
      UIManager.renderChallengeDurationSelectModal('TestUser', () => {});
      UIManager.promptNotificationPermission('duel');

      openOnboardingModal();
      renderOnboardingStep(1);
      renderOnboardingStep(2);
      renderOnboardingStep(3);
      closeOnboardingModal();

      for (let i = 0; i < APP_TOUR_STEPS.length; i++) {
        renderTourStep(i);
      }
      finishAppTour();

      const text = document.body.textContent || '';
      const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;
      expect(trCharRegex.test(text)).toBe(false);

      const forbiddenTrWords = /\b(Seviye|Oyna|Basit|Orta|Zor|Çırak|Misafir|Rakip|Altın|Hata|Düello|Sıralama|Rozetler|Mağaza|Harita|Menü|Atla|Geç|İleri|Geri|Bitir|Tümünü|Klasik|Parçalı|Hesap|Harfli|Puan)\b/i;
      expect(forbiddenTrWords.test(text)).toBe(false);

      // Raw placeholder check
      const rawPlaceholderRegex = /\{(gold|level|count|enemy)\}/;
      expect(rawPlaceholderRegex.test(text)).toBe(false);

      // Check all title attributes
      const titledEls = document.querySelectorAll('[title]');
      titledEls.forEach(el => {
        const title = el.getAttribute('title') || '';
        if (title !== 'Dil / Language') {
          expect(trCharRegex.test(title)).toBe(false);
          expect(forbiddenTrWords.test(title)).toBe(false);
        }
      });

      // Check all placeholder attributes
      const placeholderEls = document.querySelectorAll('[placeholder]');
      placeholderEls.forEach(el => {
        const ph = el.getAttribute('placeholder') || '';
        expect(trCharRegex.test(ph)).toBe(false);
        expect(forbiddenTrWords.test(ph)).toBe(false);
      });
    });

    it('TR Modunda hiçbir elemanda İngilizce arayüz kelimeleri sızmamalı', async () => {
      setLang('tr');
      applyStaticTranslations();
      updateSavedGamesCountUI();

      const titleEl = document.getElementById('menu-player-title');
      if (titleEl) titleEl.innerHTML = renderRankBadgeSVG(translateRankName(UserManager.getTitle()));

      UIManager.renderMap(150, 140, 160, () => {}, false);
      const ownStats = await UserManager.getUserProfileStats();
      const badgesStatus = AchievementManager.getAllBadgesWithStatus(ownStats.level, ownStats.gold, ownStats.totalCompleted);
      UIManager.renderProfileModal(ownStats, badgesStatus, true);

      UIManager.renderSavedGamesList([], () => {}, () => {});
      UIManager.renderAchievements(badgesStatus, () => {});
      UIManager.renderShop(() => {});
      openOnboardingModal();
      renderOnboardingStep(1);
      closeOnboardingModal();

      const text = document.body.textContent || '';
      const forbiddenEnWords = /\b(Current Gold|Errors:|Classic Sudoku|Target: Easy|Searching open matches|Apprentice|Badge not found|Item not found)\b/i;
      expect(forbiddenEnWords.test(text)).toBe(false);
    });
  });

  describe('2. Tam Oyun İçi İnteraktif Döngü (startGame -> Tahta -> Notlar -> Sil -> İpucu -> 3 Hata -> İkinci Şans -> Zafer)', () => {
    it('not modu, silme, ipucu altın düşüşü, 3 hatada ikinci şans ve gerçek kazanma tetiklenmeli', async () => {
      localStorage.setItem('sudoku_gold', '100');
      startGame(1, 'basit', undefined, undefined, 'classic', false);

      const notesBtn = document.getElementById('btn-toggle-notes');
      expect(notesBtn).not.toBeNull();

      // Not modunu aç
      notesBtn?.click();
      let state = getGameRuntimeState();
      expect(state.isNotesMode).toBe(true);

      const getCellEl = (r: number, c: number) => document.querySelectorAll('#sudoku-grid > div')[r * 9 + c] as HTMLElement;

      // Boş bir hücre seçip not ekle
      const cell00 = getCellEl(0, 0);
      if (cell00) cell00.click();

      let numpadGrid = document.getElementById('numpad-grid');
      let numBtns = numpadGrid?.querySelectorAll('button');
      if (numBtns && numBtns.length >= 5) {
        (numBtns[4] as HTMLElement).click();
      }

      // Not sil
      const eraseBtn = document.getElementById('btn-erase');
      eraseBtn?.click();

      // Not modunu kapat
      notesBtn?.click();
      state = getGameRuntimeState();
      expect(state.isNotesMode).toBe(false);

      // İpucu al -> altın 100 den 90 a inmeli
      const hintBtn = document.getElementById('btn-hint');
      hintBtn?.click();
      expect(UserManager.getGold()).toBe(90);

      // Altını 5 e düşür ve ipucu almayı dene -> reddedilmeli, altın 5 kalmalı
      localStorage.setItem('sudoku_gold', '5');
      hintBtn?.click();
      expect(UserManager.getGold()).toBe(5);

      // Altını 100 yap
      localStorage.setItem('sudoku_gold', '100');

      // 3 hata yap -> second-chance-modal açılmalı
      state = getGameRuntimeState();
      const solution = state.currentSolution;
      const initialBoard = state.initialBoard;

      // Bulmaca üzerindeki ilk boş hücreyi bul
      let emptyR = -1;
      let emptyC = -1;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (initialBoard[r][c] === 0 && getGameRuntimeState().userBoard[r][c] === 0) {
            emptyR = r;
            emptyC = c;
            break;
          }
        }
        if (emptyR !== -1) break;
      }

      expect(emptyR).not.toBe(-1);
      const targetSolVal = solution[emptyR][emptyC];
      const wrongVal = targetSolVal === 1 ? 2 : 1;

      const emptyCellEl = getCellEl(emptyR, emptyC);
      emptyCellEl?.click();

      numpadGrid = document.getElementById('numpad-grid');
      numBtns = numpadGrid?.querySelectorAll('button');
      const wrongBtn = numBtns ? (numBtns[wrongVal - 1] as HTMLElement) : null;

      // 1. Hata
      wrongBtn?.click();
      let errorsEl = document.getElementById('game-errors');
      expect(errorsEl?.innerText).toContain('1');

      // 2. Hata
      wrongBtn?.click();
      expect(errorsEl?.innerText).toContain('2');

      // 3. Hata -> İkinci şans modalı açılmalı
      wrongBtn?.click();
      const secondChanceModal = document.getElementById('second-chance-modal');
      expect(secondChanceModal?.classList.contains('hidden')).toBe(false);

      // 50 Altın ile Canlan (async handler)
      const reviveBtn = document.getElementById('btn-revive-gold');
      if (reviveBtn && reviveBtn.onclick) {
        await (reviveBtn.onclick as any)();
      } else {
        reviveBtn?.click();
      }

      expect(secondChanceModal?.classList.contains('hidden')).toBe(true);
      expect(UserManager.getGold()).toBe(50);

      // Şimdi tüm boş hücreleri doğru doldurarak GERÇEK ZAFER akışını tetikle
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const curState = getGameRuntimeState();
          if (curState.initialBoard[r][c] === 0 && curState.userBoard[r][c] === 0) {
            const cellEl = getCellEl(r, c);
            cellEl?.click();
            const currentNumBtns = document.querySelectorAll('#numpad-grid button');
            const correctBtn = currentNumBtns ? (currentNumBtns[curState.currentSolution[r][c] - 1] as HTMLElement) : null;
            correctBtn?.click();
          }
        }
      }

      await new Promise(r => setTimeout(r, 250));

      // Zafer Sonuçları Doğrulaması
      expect(UserManager.getVariantLevel('classic')).toBe(2);
      expect(UserManager.getCompletedByCategory().map).toBeGreaterThanOrEqual(1);
      expect(AchievementManager.getUnlockedBadgeIds()).toContain('first_win');
    });
  });

  describe('3. Serbest Mod & Arena İnteraktif Tıklama Zinciri', () => {
    it('Serbest Mod varyant butonları kural ve çarpanları doğru güncellemeli', () => {
      UIManager.navigate('custom');

      const variants: ('classic' | 'irregular' | 'killer' | 'wordoku' | 'samurai')[] = ['classic', 'irregular', 'killer', 'wordoku', 'samurai'];
      const mults: Record<string, string> = { classic: '1.0x', wordoku: '1.2x', irregular: '1.5x', killer: '1.8x', samurai: '2.5x' };

      variants.forEach(v => {
        const btn = document.getElementById(`btn-variant-${v}`);
        btn?.click();

        const desc = document.getElementById('custom-variant-rule-desc');
        const badge = document.getElementById('custom-variant-multiplier-badge');

        expect(desc?.innerText).toBe(t('rule_' + v));
        expect(badge?.innerText).toContain(mults[v]);
      });
    });

    it('Blitz 3m seçildiğinde custom mod ödülleri %50 artmalı (+15, +30, +53)', () => {
      UIManager.navigate('custom');

      const time3mBtn = document.getElementById('btn-custom-time-3m');
      time3mBtn?.click();

      const b1 = document.getElementById('badge-custom-basit-reward');
      const b2 = document.getElementById('badge-custom-orta-reward');
      const b3 = document.getElementById('badge-custom-zor-reward');

      expect(b1?.innerText).toContain('+15');
      expect(b2?.innerText).toContain('+30');
      expect(b3?.innerText).toContain('+53');
    });

    it('Arena modalında botlar ve lobi sekmeleri aktif görünümü değiştirmeli', () => {
      UIManager.toggleModal('match-modal', true);

      const tabBots = document.getElementById('tab-arena-bots');
      const tabLobby = document.getElementById('tab-arena-lobby');
      const secBots = document.getElementById('section-arena-bots');
      const secLobby = document.getElementById('section-arena-lobby');

      tabBots?.click();
      expect(secBots?.classList.contains('hidden')).toBe(false);
      expect(secLobby?.classList.contains('hidden')).toBe(true);

      tabLobby?.click();
      expect(secLobby?.classList.contains('hidden')).toBe(false);
      expect(secBots?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('4. Mağaza, Tema Değişimi & Rozet Ödül Toplama Döngüsü', () => {
    it('yetersiz altınla tema alınamamalı, yeterli altınla alınıp tema uygulanmalı', async () => {
      localStorage.setItem('sudoku_gold', '50');

      const failRes = await ShopManager.buyItem('theme-shogun');
      expect(failRes.success).toBe(false);
      expect(ShopManager.getActiveTheme()).not.toBe('theme-shogun');

      localStorage.setItem('sudoku_gold', '500');
      const winRes = await ShopManager.buyItem('theme-shogun');
      expect(winRes.success).toBe(true);
      expect(ShopManager.getActiveTheme()).toBe('theme-shogun');
      expect(UserManager.getGold()).toBe(250);
    });

    it('rozet ödülü bir kez toplanabilmeli, ikinci talep reddedilmeli', () => {
      localStorage.setItem('sudoku_unlocked_badges', JSON.stringify(['first_win']));
      localStorage.setItem('sudoku_claimed_badges', JSON.stringify([]));

      const claim1 = AchievementManager.claimBadgeReward('first_win');
      expect(claim1.success).toBe(true);
      expect(claim1.goldAdded).toBe(20);

      const claim2 = AchievementManager.claimBadgeReward('first_win');
      expect(claim2.success).toBe(false);
    });
  });

  describe('5. Kayıtlı Oyunlar Sekmeleri, Silme & Sıralama Sekmeleri', () => {
    it('kayıtlı oyunlar sekme geçişi ve silme işlemi çalışmalı', () => {
      localStorage.clear();
      createPlacementActiveGameSave('classic', 10);
      updateSavedGamesCountUI();

      openSavedGamesModal(() => {});

      const tabCustom = document.getElementById('tab-saved-custom');
      const tabJourney = document.getElementById('tab-saved-journey');
      const listContainer = document.getElementById('saved-games-list');

      tabCustom?.click();
      expect(listContainer?.innerText).toContain(t('no_custom_games'));

      tabJourney?.click();
      expect(listContainer?.querySelector('.delete-saved-game-btn')).not.toBeNull();

      const deleteBtn = listContainer?.querySelector('.delete-saved-game-btn') as HTMLElement;
      deleteBtn?.click();

      expect(getSavedGamesList().length).toBe(0);
      const savedGamesBtn = document.getElementById('btn-open-saved-games');
      expect(savedGamesBtn?.classList.contains('hidden')).toBe(true);
    });

    it('sıralama modalında hız ve genel sekmeleri doğru filtreleri göstermeli', () => {
      UIManager.toggleModal('view-leaderboard', true);

      const tabSpeed = document.getElementById('btn-tab-speed');
      const tabGold = document.getElementById('btn-tab-gold');
      const speedFilters = document.getElementById('speed-diff-filters');
      const generalFilters = document.getElementById('general-sort-filters');

      tabSpeed?.click();
      expect(speedFilters?.classList.contains('hidden')).toBe(false);
      expect(generalFilters?.classList.contains('hidden')).toBe(true);

      tabGold?.click();
      expect(generalFilters?.classList.contains('hidden')).toBe(false);
      expect(speedFilters?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('6. Samurai 5-Grid Ortak 3x3 Köşe Senkronizasyonu & Seviye Atlama Sınavı Akışı', () => {
    it('Samurai 5 tahtanın 4 ortak 3x3 köşesi puzzle ve solution olarak birebir eşit olmalı', () => {
      const generated = SudokuGen.generateVariant('basit', 'samurai');
      expect(generated.samuraiGrids).toBeDefined();
      expect(generated.samuraiGrids?.length).toBe(5);

      const grids = generated.samuraiGrids!;
      const center = grids[0];
      const topLeft = grids[1];
      const topRight = grids[2];
      const bottomLeft = grids[3];
      const bottomRight = grids[4];

      // Sol-Üst ortak 3x3 köşe (Center: 0..2,0..2 === TopLeft: 6..8,6..8)
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          expect(center.solution[r][c]).toBe(topLeft.solution[r + 6][c + 6]);
          expect(center.puzzle[r][c]).toBe(topLeft.puzzle[r + 6][c + 6]);
        }
      }

      // Sağ-Üst ortak 3x3 köşe (Center: 0..2,6..8 === TopRight: 6..8,0..2)
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          expect(center.solution[r][c + 6]).toBe(topRight.solution[r + 6][c]);
          expect(center.puzzle[r][c + 6]).toBe(topRight.puzzle[r + 6][c]);
        }
      }

      // Sol-Alt ortak 3x3 köşe (Center: 6..8,0..2 === BottomLeft: 0..2,6..8)
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          expect(center.solution[r + 6][c]).toBe(bottomLeft.solution[r][c + 6]);
          expect(center.puzzle[r + 6][c]).toBe(bottomLeft.puzzle[r][c + 6]);
        }
      }

      // Sağ-Alt ortak 3x3 köşe (Center: 6..8,6..8 === BottomRight: 0..2,0..2)
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          expect(center.solution[r + 6][c + 6]).toBe(bottomRight.solution[r][c]);
          expect(center.puzzle[r + 6][c + 6]).toBe(bottomRight.puzzle[r][c]);
        }
      }
    });

    it('Seviye Atlama Sınavında #btn-hint gizli olmalı ve 3 hatada ikinci şans modalı açılmamalı', async () => {
      startPlacementExam('classic', 'basit');

      const hintBtn = document.getElementById('btn-hint');
      expect(hintBtn?.classList.contains('hidden')).toBe(true);

      const state = getGameRuntimeState();
      const solution = state.currentSolution;
      const initialBoard = state.initialBoard;

      let emptyR = -1;
      let emptyC = -1;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (initialBoard[r][c] === 0) {
            emptyR = r;
            emptyC = c;
            break;
          }
        }
        if (emptyR !== -1) break;
      }

      expect(emptyR).not.toBe(-1);
      const targetSolVal = solution[emptyR][emptyC];
      const wrongVal = targetSolVal === 1 ? 2 : 1;

      const emptyCellEl = document.querySelectorAll('#sudoku-grid > div')[emptyR * 9 + emptyC] as HTMLElement;
      emptyCellEl?.click();

      const numpadGrid = document.getElementById('numpad-grid');
      const numBtns = numpadGrid?.querySelectorAll('button');
      const wrongBtn = numBtns ? (numBtns[wrongVal - 1] as HTMLElement) : null;

      wrongBtn?.click();
      wrongBtn?.click();
      wrongBtn?.click();

      await new Promise(r => setTimeout(r, 60));

      const secondChanceModal = document.getElementById('second-chance-modal');
      expect(secondChanceModal?.classList.contains('hidden')).toBe(true);

      const resultModal = document.getElementById('placement-result-modal');
      expect(resultModal?.classList.contains('hidden')).toBe(false);
    });
  });

  describe('7. Giriş Yapmış Kullanıcı Adı Koruması (Otto vs Misafir)', () => {
    it('giriş yapılmış kullanıcı adı dil değişiminde Misafir veya Guest olarak ezilmemeli', () => {
      localStorage.setItem('sudoku_username', 'Otto');

      const savedName = UserManager.getUsername();
      const nameEl = document.getElementById('menu-player-name');
      if (nameEl) nameEl.innerText = savedName ? savedName : t('menu_guest');

      expect(nameEl?.innerText).toBe('Otto');

      setLang('en');
      applyStaticTranslations();
      const nameEn = UserManager.getUsername();
      if (nameEl) nameEl.innerText = nameEn ? nameEn : t('menu_guest');

      expect(nameEl?.innerText).toBe('Otto');

      setLang('tr');
      applyStaticTranslations();
      const nameTr = UserManager.getUsername();
      if (nameEl) nameEl.innerText = nameTr ? nameTr : t('menu_guest');

      expect(nameEl?.innerText).toBe('Otto');
    });
  });

  describe('8. İlk Giriş Dil Seçimi & Seçilen Dilde Otomatik Spotlight Turu', () => {
    it('#username-modal içinde #welcome-lang-tr ve #welcome-lang-en butonları bulunmalı ve EN seçilince tur İngilizce başlamalı', () => {
      localStorage.clear();
      document.body.innerHTML = '<div id="app"></div>';
      UIManager.mountUI();

      const trBtn = document.getElementById('welcome-lang-tr');
      const enBtn = document.getElementById('welcome-lang-en');

      expect(trBtn).not.toBeNull();
      expect(enBtn).not.toBeNull();

      setLang('en');
      applyStaticTranslations();

      const titleEl = document.querySelector('[data-i18n="welcome_title"]');
      const phEl = document.querySelector('[data-i18n-ph="ph_enter_username"]');

      expect(titleEl?.textContent).toBe('Welcome to SudokuMap!');
      expect(phEl?.getAttribute('placeholder')).toBe('Enter username...');

      startAppTour();

      const tourTitle = document.getElementById('tour-step-title');
      const tourSkip = document.getElementById('btn-tour-skip');

      expect(tourTitle?.innerText).toBe('Sound Toggle');
      expect(tourSkip?.innerText).toBe('Skip ✕');
      finishAppTour();
    });
  });

  describe('9. Eski Bozuk Profil & Yeni Profil puzzle_machine Tutarlılığı', () => {
    it('eski bozuk profilde 4 bulmacada unlock görünen puzzle_machine otomatik onarılıp kilitlenmeli', () => {
      localStorage.clear();
      localStorage.setItem('sudoku_total_completed', '4');
      localStorage.setItem('sudoku_unlocked_badges', JSON.stringify(['puzzle_machine']));
      localStorage.setItem('sudoku_claimed_badges', JSON.stringify([]));

      const badges = AchievementManager.getAllBadgesWithStatus(150, 125, 4);
      const pmBadge = badges.find(b => b.id === 'puzzle_machine');

      expect(pmBadge?.isUnlocked).toBe(false);
      expect(AchievementManager.getUnlockedBadgeIds()).not.toContain('puzzle_machine');
    });

    it('0 dan başlayıp 4 bulmaca bitirildiğinde puzzle_machine kilitli, 10. bulmacada açık olmalı', () => {
      localStorage.clear();

      for (let i = 0; i < 3; i++) UserManager.incrementCompletedCategory('map');
      UserManager.incrementCompletedCategory('custom');

      expect(UserManager.getTotalCompleted()).toBe(4);
      let badges = AchievementManager.getAllBadgesWithStatus(1, 100, UserManager.getTotalCompleted());
      let pmBadge = badges.find(b => b.id === 'puzzle_machine');
      expect(pmBadge?.isUnlocked).toBe(false);

      for (let i = 0; i < 6; i++) UserManager.incrementCompletedCategory('custom');
      expect(UserManager.getTotalCompleted()).toBe(10);

      badges = AchievementManager.getAllBadgesWithStatus(1, 100, UserManager.getTotalCompleted());
      pmBadge = badges.find(b => b.id === 'puzzle_machine');
      expect(pmBadge?.isUnlocked).toBe(true);
    });
  });
});
