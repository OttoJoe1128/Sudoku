import { UIManager } from './ui/uiManager';
import { GameEngine } from './engine/gameEngine';
import { SudokuGen } from './engine/sudoku';
import { UserManager } from './store/userState';
import { Leaderboard } from './engine/leaderboard';
import { ShopManager } from './engine/shop';
import { Rewards } from './engine/rewards';
import { AchievementManager } from './engine/achievements';
import { MatchEngine, MatchState } from './engine/matchEngine';
import { App } from '@capacitor/app';

UIManager.mountUI();

let currentSolution: number[][];
let userBoard: number[][];
let initialBoard: number[][];
let selectedCell: {r: number, c: number} | null = null;
let errors = 0;
let hintsUsed = 0;
let timeElapsed = 0;
let timerInterval: any = null;
let currentDifficulty: 'basit' | 'orta' | 'zor' = 'basit';

// Maç / Düello Modu Değişkenleri
let activeMatch: MatchState | null = null;
let isMatchMode = false;
let matchUserFilled = 0;
let matchEnemyFilled = 0;
let matchTotalEmpty = 30;

const updateGoldDisplay = () => {
  const gold = UserManager.getGold();
  UIManager.updateHeaderGold(gold);
};

const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    timeElapsed = 0;
    timerInterval = setInterval(() => {
        timeElapsed++;
        const timerEl = document.getElementById('game-timer');
        if (timerEl) {
            const m = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
            const s = (timeElapsed % 60).toString().padStart(2, '0');
            timerEl.innerText = `${m}:${s}`;
        }
    }, 1000);
};

const startGame = (level: number, diff: 'basit' | 'orta' | 'zor', matchData?: MatchState) => {
    errors = 0;
    hintsUsed = 0;
    selectedCell = null;
    currentDifficulty = diff;
    isMatchMode = !!matchData;
    activeMatch = matchData || null;

    let data;
    if (matchData) {
      data = { puzzle: matchData.puzzle, solution: matchData.solution };
    } else {
      data = SudokuGen.generate(diff);
      UIManager.hideMatchHeader();
    }

    currentSolution = data.solution;
    userBoard = data.puzzle.map(row => [...row]);
    initialBoard = data.puzzle.map(row => [...row]);

    // Düello Modu İlerleme Hesaplama
    if (isMatchMode && activeMatch) {
      matchUserFilled = 0;
      matchEnemyFilled = 0;
      matchTotalEmpty = 0;
      initialBoard.forEach(row => {
        row.forEach(val => {
          if (val === 0) matchTotalEmpty++;
        });
      });

      const enemyName = activeMatch.player2?.username || 'Rakip';
      UIManager.renderMatchProgress(0, 0, enemyName, matchTotalEmpty);

      // Eğer rakip bir Bot (AI) ise bot simülasyonunu başlat
      if (activeMatch.player2?.isBot) {
        MatchEngine.startBotAI(diff, (botProgress) => {
          matchEnemyFilled = botProgress;
          UIManager.renderMatchProgress(matchUserFilled, matchEnemyFilled, enemyName, matchTotalEmpty);

          // Bot maçı bitirdiyse mağlubiyet
          if (matchEnemyFilled >= matchTotalEmpty && isMatchMode) {
            if (timerInterval) clearInterval(timerInterval);
            isMatchMode = false;
            MatchEngine.clearActiveMatch();
            UIManager.hideMatchHeader();
            showMatchResult(false, 0, enemyName);
          }
        });
      }
    } else {
      UIManager.hideMatchHeader();
    }

    const title = document.getElementById('game-title');
    if (title) title.innerText = isMatchMode ? `⚔️ Düello (${diff.toUpperCase()})` : `Seviye ${level}`;

    const updateErrorUI = () => {
        const errorEl = document.getElementById('game-errors');
        if (errorEl) errorEl.innerText = `Hata: ${errors}/3`;
    };
    updateErrorUI();

    UIManager.navigate('game');
    startTimer();

    const refresh = () => {
        UIManager.renderBoard(
            userBoard,
            (r, c) => {
                if (initialBoard[r][c] !== 0) {
                    selectedCell = null;
                } else {
                    selectedCell = {r, c};
                }
                refresh();
            },
            selectedCell?.r ?? -1,
            selectedCell?.c ?? -1,
            initialBoard
        );
    };

    refresh();

    // Ekrandaki İpucu Butonu Dinleyicisi
    const hintBtn = document.getElementById('btn-hint');
    if (hintBtn) {
        hintBtn.onclick = async () => {
            if (!selectedCell) return alert("Lütfen önce boş bir hücre seçin!");
            if (initialBoard[selectedCell.r][selectedCell.c] !== 0) return alert("Bu hücre kilitli!");
            if (hintsUsed >= 5) return alert("İpucu sınırı doldu!");

            const currentGold = UserManager.getGold();
            if (currentGold < 10) {
                return alert("Yetersiz altın! İpucu için en az 10 🪙 gerekiyor.");
            }

            const newGold = currentGold - 10;
            await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
            updateGoldDisplay();

            userBoard[selectedCell.r][selectedCell.c] = currentSolution[selectedCell.r][selectedCell.c];
            hintsUsed++;

            if (isMatchMode) {
              matchUserFilled++;
              const enemyName = activeMatch?.player2?.username || 'Rakip';
              UIManager.renderMatchProgress(matchUserFilled, matchEnemyFilled, enemyName, matchTotalEmpty);
            }

            refresh();
        };
    }

    UIManager.renderNumpad((num) => {
        if (!selectedCell) return;

        if (num === -1) {
            hintBtn?.click();
            return;
        }

        const success = GameEngine.processInput(
            selectedCell.r,
            selectedCell.c,
            num,
            userBoard,
            currentSolution,
            initialBoard,
            async () => {
                if (timerInterval) clearInterval(timerInterval);

                if (isMatchMode) {
                  // Düello Zaferi!
                  const reward = diff === 'basit' ? 50 : diff === 'orta' ? 100 : 200;
                  const newGold = UserManager.getGold() + reward;
                  await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
                  updateGoldDisplay();

                  isMatchMode = false;
                  MatchEngine.clearActiveMatch();
                  UIManager.hideMatchHeader();
                  showMatchResult(true, reward, activeMatch?.player2?.username || 'Rakip');
                  return;
                }

                // Normal Bölüm Zaferi
                const reward = diff === 'basit' ? 10 : diff === 'orta' ? 20 : 35;
                const userLvl = UserManager.getCurrentLevel();
                const nextLevel = level === userLvl ? userLvl + 1 : userLvl;
                const newGold = UserManager.getGold() + reward;

                await UserManager.updateProgress(nextLevel, newGold);
                updateGoldDisplay();

                const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
                const seconds = (timeElapsed % 60).toString().padStart(2, '0');
                await UserManager.recordGameCompletion({
                    level,
                    difficulty: diff,
                    timeElapsed,
                    timeFormatted: `${minutes}:${seconds}`,
                    errors,
                    hintsUsed
                });

                AchievementManager.checkAndUnlockBadges({
                    level: nextLevel,
                    gold: newGold,
                    lastTimeElapsed: timeElapsed,
                    lastErrors: errors
                });

                alert(`🎉 Tebrikler, Seviye ${level} Tamamlandı!\nKazanılan Ödül: +${reward} 🪙`);
                UIManager.navigate('menu');
            },
            (errCount) => {
                errors += errCount;
                updateErrorUI();
                if (errors >= 3) {
                    if (timerInterval) clearInterval(timerInterval);
                    if (isMatchMode) {
                      isMatchMode = false;
                      MatchEngine.clearActiveMatch();
                      UIManager.hideMatchHeader();
                      showMatchResult(false, 0, activeMatch?.player2?.username || 'Rakip');
                    } else {
                      alert("❌ Oyun Bitti! 3 Hata Yaptınız.");
                      UIManager.navigate('menu');
                    }
                }
            }
        );

        if (success && isMatchMode) {
          matchUserFilled++;
          const enemyName = activeMatch?.player2?.username || 'Rakip';
          UIManager.renderMatchProgress(matchUserFilled, matchEnemyFilled, enemyName, matchTotalEmpty);
        }

        if (success) refresh();
    });
};

const showMatchResult = (isWin: boolean, rewardGold: number, enemyName: string) => {
  const modal = document.getElementById('match-result-modal');
  const iconEl = document.getElementById('match-result-icon');
  const titleEl = document.getElementById('match-result-title');
  const subtitleEl = document.getElementById('match-result-subtitle');
  const timeEl = document.getElementById('match-result-time');
  const errorsEl = document.getElementById('match-result-errors');
  const rewardEl = document.getElementById('match-result-reward');

  const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
  const seconds = (timeElapsed % 60).toString().padStart(2, '0');

  if (iconEl) iconEl.innerText = isWin ? "🏆" : "💔";
  if (titleEl) titleEl.innerText = isWin ? "DÜELLO ZAFERİ!" : "MAĞLUBİYET";
  if (subtitleEl) subtitleEl.innerText = isWin ? `${enemyName} rakibinizi geride bırakarak maçı kazandınız!` : `${enemyName} rakibiniz maçı sizden önce tamamladı.`;
  if (timeEl) timeEl.innerText = `${minutes}:${seconds}`;
  if (errorsEl) errorsEl.innerText = `${errors} / 3`;
  if (rewardEl) rewardEl.innerText = isWin ? `+${rewardGold} 🪙` : "0 🪙";

  UIManager.toggleModal('match-result-modal', true);
};

document.getElementById('btn-close-match-result')?.addEventListener('click', () => {
  UIManager.toggleModal('match-result-modal', false);
  UIManager.navigate('menu');
});

document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-level]');
    if (target) {
        const level = parseInt(target.getAttribute('data-level')!);
        const diff = SudokuGen.getDifficulty(level);
        startGame(level, diff);
    }
});

// Kullanıcı Profil Giriş Akışı
const checkUser = async () => {
  const user = await UserManager.initUser();
  if (!user || !UserManager.getUsername()) {
    UIManager.toggleModal('username-modal', true);
  } else {
    const nameEl = document.getElementById('menu-player-name');
    if (nameEl) nameEl.innerText = user.username;
    updateGoldDisplay();
    UIManager.navigate('menu');
  }
};

document.getElementById('save-username')?.addEventListener('click', async () => {
  const input = document.getElementById('username-input') as HTMLInputElement;
  if (input?.value && input.value.trim().length >= 3) {
    const user = await UserManager.saveUser(input.value.trim());
    const nameEl = document.getElementById('menu-player-name');
    if (nameEl) nameEl.innerText = user.username;
    updateGoldDisplay();
    UIManager.toggleModal('username-modal', false);
    checkUser();
  } else {
    alert("Lütfen en az 3 karakterden oluşan geçerli bir isim giriniz!");
  }
});

document.getElementById('btn-edit-username')?.addEventListener('click', () => {
  const input = document.getElementById('username-input') as HTMLInputElement;
  if (input) input.value = UserManager.getUsername() || '';
  UIManager.toggleModal('username-modal', true);
});

document.getElementById('close-username-modal')?.addEventListener('click', () => {
  if (UserManager.getUsername()) {
    UIManager.toggleModal('username-modal', false);
  }
});

// Modal: Profil
document.getElementById('btn-open-profile')?.addEventListener('click', async () => {
  UIManager.toggleModal('view-profile', true);
  const stats = await UserManager.getUserProfileStats();
  const badges = AchievementManager.getAllBadgesWithStatus(stats.level, stats.gold, stats.totalCompleted);
  UIManager.renderProfileModal(stats, badges);
});

document.getElementById('close-profile')?.addEventListener('click', () => {
  UIManager.toggleModal('view-profile', false);
});

document.getElementById('btn-profile-edit-name')?.addEventListener('click', () => {
  UIManager.toggleModal('view-profile', false);
  const input = document.getElementById('username-input') as HTMLInputElement;
  if (input) input.value = UserManager.getUsername() || '';
  UIManager.toggleModal('username-modal', true);
});

document.getElementById('btn-profile-open-achievements')?.addEventListener('click', () => {
  UIManager.toggleModal('view-profile', false);
  document.getElementById('btn-achievements')?.click();
});

// Modal: Düello / Maç
document.getElementById('btn-open-match')?.addEventListener('click', () => {
  UIManager.toggleModal('match-search-modal', true);
});

document.getElementById('close-match-search')?.addEventListener('click', () => {
  MatchEngine.clearActiveMatch();
  const box = document.getElementById('match-search-status-box');
  if (box) box.classList.add('hidden');
  UIManager.toggleModal('match-search-modal', false);
});

const startMatchWithDiff = (diff: 'basit' | 'orta' | 'zor') => {
  const box = document.getElementById('match-search-status-box');
  const textEl = document.getElementById('match-search-status-text');

  if (box) box.classList.remove('hidden');

  MatchEngine.startMatchSearch(
    diff,
    (match) => {
      UIManager.toggleModal('match-search-modal', false);
      if (box) box.classList.add('hidden');
      startGame(1, diff, match);
    },
    (statusText) => {
      if (textEl) textEl.innerText = statusText;
    }
  );
};

document.getElementById('btn-match-basit')?.addEventListener('click', () => startMatchWithDiff('basit'));
document.getElementById('btn-match-orta')?.addEventListener('click', () => startMatchWithDiff('orta'));
document.getElementById('btn-match-zor')?.addEventListener('click', () => startMatchWithDiff('zor'));

// Ana Menü Buton Bağlantıları
document.getElementById('btn-continue-game')?.addEventListener('click', () => {
    const userLvl = UserManager.getCurrentLevel();
    const diff = SudokuGen.getDifficulty(userLvl);
    startGame(userLvl, diff);
});

document.getElementById('btn-new-game')?.addEventListener('click', () => {
    UIManager.navigate('custom');
});

document.getElementById('btn-open-map')?.addEventListener('click', () => {
    const userLvl = UserManager.getCurrentLevel();
    const diff = SudokuGen.getDifficulty(userLvl);
    const startLvl = SudokuGen.getStartLevelForDifficulty(diff);
    UIManager.navigate('map');
    UIManager.renderMap(userLvl, startLvl);
});

// Özel Zorluk Seçim Ekranı Butonları
document.getElementById('btn-back-custom')?.addEventListener('click', () => {
    UIManager.navigate('menu');
});

document.getElementById('btn-start-basit')?.addEventListener('click', () => {
    const userLvl = UserManager.getCurrentLevel();
    startGame(userLvl, 'basit');
});

document.getElementById('btn-start-orta')?.addEventListener('click', () => {
    const userLvl = Math.max(301, UserManager.getCurrentLevel());
    startGame(userLvl, 'orta');
});

document.getElementById('btn-start-zor')?.addEventListener('click', () => {
    const userLvl = Math.max(701, UserManager.getCurrentLevel());
    startGame(userLvl, 'zor');
});

// Harita Ekranı Bağlantıları
document.getElementById('btn-back-map')?.addEventListener('click', () => {
    UIManager.navigate('menu');
});

document.getElementById('btn-map-jump-basit')?.addEventListener('click', () => {
    UIManager.renderMap(UserManager.getCurrentLevel(), 1);
});

document.getElementById('btn-map-jump-orta')?.addEventListener('click', () => {
    UIManager.renderMap(UserManager.getCurrentLevel(), 301);
});

document.getElementById('btn-map-jump-zor')?.addEventListener('click', () => {
    UIManager.renderMap(UserManager.getCurrentLevel(), 701);
});

// Günlük Ödül
document.getElementById('btn-daily-reward')?.addEventListener('click', async () => {
    const result = await Rewards.claimReward();
    alert(result.message);
    if (result.success) {
        updateGoldDisplay();
        AchievementManager.checkAndUnlockBadges({
            level: UserManager.getCurrentLevel(),
            gold: UserManager.getGold(),
            dailyClaimed: true
        });
    }
});

// Modallar: Liderlik Tablosu
document.getElementById('btn-leaderboard')?.addEventListener('click', async () => {
  UIManager.toggleModal('view-leaderboard', true);
  const players = await Leaderboard.fetchTopPlayers();
  UIManager.renderLeaderboard(players, 'gold');
});

document.getElementById('close-leaderboard')?.addEventListener('click', () => {
  UIManager.toggleModal('view-leaderboard', false);
});

document.getElementById('refresh-leaderboard')?.addEventListener('click', async () => {
  const players = await Leaderboard.fetchTopPlayers();
  UIManager.renderLeaderboard(players, 'gold');
});

// Modallar: Mağaza
document.getElementById('btn-shop')?.addEventListener('click', () => {
  UIManager.toggleModal('view-shop', true);
  UIManager.renderShop(async (itemId) => {
    const result = await ShopManager.buyItem(itemId);
    alert(result.msg);
    if (result.success) {
      updateGoldDisplay();
      UIManager.applyTheme(ShopManager.getActiveTheme());
      UIManager.renderShop((id) => ShopManager.buyItem(id));
    }
  });
});

document.getElementById('close-shop')?.addEventListener('click', () => {
  UIManager.toggleModal('view-shop', false);
});

// Modallar: Başarımlar / Rozetler
document.getElementById('btn-achievements')?.addEventListener('click', () => {
  UIManager.toggleModal('view-achievements', true);
  const badges = AchievementManager.getAllBadgesWithStatus(
    UserManager.getCurrentLevel(),
    UserManager.getGold()
  );
  UIManager.renderAchievements(badges, async (badgeId) => {
    const claimResult = AchievementManager.claimBadgeReward(badgeId);
    alert(claimResult.message);
    if (claimResult.success) {
      const newGold = UserManager.getGold() + claimResult.goldAdded;
      await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
      updateGoldDisplay();
      const updatedBadges = AchievementManager.getAllBadgesWithStatus(
        UserManager.getCurrentLevel(),
        newGold
      );
      UIManager.renderAchievements(updatedBadges, (id) => {
        // re-claim
      });
    }
  });
});

document.getElementById('close-achievements')?.addEventListener('click', () => {
  UIManager.toggleModal('view-achievements', false);
});

// Seviye Belirleme Sınavı Modalı
const openPlacementModal = () => {
  UIManager.toggleModal('placement-modal', true);
};

document.getElementById('btn-menu-placement-test')?.addEventListener('click', openPlacementModal);
document.getElementById('btn-open-placement-test')?.addEventListener('click', openPlacementModal);
document.getElementById('close-placement-modal')?.addEventListener('click', () => {
  UIManager.toggleModal('placement-modal', false);
});
document.getElementById('btn-skip-placement')?.addEventListener('click', () => {
  UIManager.toggleModal('placement-modal', false);
});

document.getElementById('btn-placement-basit')?.addEventListener('click', () => {
  UIManager.toggleModal('placement-modal', false);
  startGame(1, 'basit');
});

document.getElementById('btn-placement-orta')?.addEventListener('click', () => {
  UIManager.toggleModal('placement-modal', false);
  startGame(301, 'orta');
});

document.getElementById('btn-placement-zor')?.addEventListener('click', () => {
  UIManager.toggleModal('placement-modal', false);
  startGame(701, 'zor');
});

// Başlangıç Kontrolü
checkUser();

// Android Donanım Geri Tuşu Mantığı (Capacitor)
App.addListener('backButton', () => {
    const modals = ['username-modal', 'view-profile', 'view-leaderboard', 'view-shop', 'view-achievements', 'placement-modal', 'placement-result-modal', 'match-search-modal', 'match-result-modal'];
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
        if (timerInterval) clearInterval(timerInterval);
        if (isMatchMode) {
          isMatchMode = false;
          MatchEngine.clearActiveMatch();
          UIManager.hideMatchHeader();
        }
        UIManager.navigate('menu');
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
