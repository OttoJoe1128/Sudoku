import { UIManager } from './ui/uiManager';
import { GameEngine } from './engine/gameEngine';
import { SudokuGen } from './engine/sudoku';
import { UserManager } from './store/userState';
import { Leaderboard, Player, SpeedRecord } from './engine/leaderboard';
import { ShopManager } from './engine/shop';
import { Rewards } from './engine/rewards';
import { AchievementManager } from './engine/achievements';
import { MatchEngine, MatchState, ChallengeRequest } from './engine/matchEngine';
import { App } from '@capacitor/app';

UIManager.mountUI();

let currentSolution: number[][];
let userBoard: number[][];
let initialBoard: number[][];
let notesBoard: Set<number>[][];
let selectedCell: {r: number, c: number} | null = null;
let errors = 0;
let hintsUsed = 0;
let timeElapsed = 0;
let timerInterval: any = null;
let currentDifficulty: 'basit' | 'orta' | 'zor' = 'basit';
let isNotesMode = false;
let currentLevelNumber = 1;

// Maç / Düello Modu Değişkenleri
let activeMatch: MatchState | null = null;
let isMatchMode = false;
let matchUserFilled = 0;
let matchEnemyFilled = 0;
let matchTotalEmpty = 30;
let selectedMatchTimeSec = 180;
let matchTimeRemaining = 180;

const updateGoldDisplay = () => {
  const gold = UserManager.getGold();
  UIManager.updateHeaderGold(gold);
};

// Numpad Kalan Rakam Sayacı Hesaplama
const calculateRemainingCounts = (board: number[][]): Map<number, number> => {
  const counts = new Map<number, number>();
  for (let i = 1; i <= 9; i++) counts.set(i, 9);

  board.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val >= 1 && val <= 9) {
        const prev = counts.get(val) ?? 9;
        counts.set(val, Math.max(0, prev - 1));
      }
    });
  });

  return counts;
};

// Kayıtlı Oyunu Saklama ve Temizleme
const saveActiveGame = () => {
  if (isMatchMode || !userBoard || !initialBoard) return;
  const saveData = {
    level: currentLevelNumber,
    diff: currentDifficulty,
    userBoard,
    initialBoard,
    currentSolution,
    errors,
    timeElapsed,
    notesBoard: notesBoard ? notesBoard.map(row => row.map(s => Array.from(s))) : []
  };
  localStorage.setItem('sudoku_saved_game', JSON.stringify(saveData));
  updateContinueCardUI();
};

const clearSavedGame = () => {
  localStorage.removeItem('sudoku_saved_game');
  updateContinueCardUI();
};

const updateContinueCardUI = () => {
  const saved = localStorage.getItem('sudoku_saved_game');
  const deleteBtn = document.getElementById('btn-delete-saved-game');
  const titleEl = document.getElementById('continue-game-title');
  const subtitleEl = document.getElementById('continue-game-subtitle');
  const tagEl = document.getElementById('continue-tag');

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const m = Math.floor(parsed.timeElapsed / 60).toString().padStart(2, '0');
      const s = (parsed.timeElapsed % 60).toString().padStart(2, '0');

      if (deleteBtn) deleteBtn.classList.remove('hidden');
      if (titleEl) titleEl.innerText = `▶ Devam Et (Seviye ${parsed.level})`;
      if (subtitleEl) subtitleEl.innerText = `Kaldığın yer: ${m}:${s} • ${parsed.diff.toUpperCase()}`;
      if (tagEl) tagEl.innerText = 'Kayıtlı Oyun';
    } catch {
      if (deleteBtn) deleteBtn.classList.add('hidden');
    }
  } else {
    if (deleteBtn) deleteBtn.classList.add('hidden');
    if (titleEl) titleEl.innerText = '▶ Oyuna Başla / Devam Et';
    if (subtitleEl) subtitleEl.innerText = `Sıradaki Seviye: ${UserManager.getCurrentLevel()}`;
    if (tagEl) tagEl.innerText = 'Aktif İlerleme';
  }
};

const startTimer = (limitSeconds: number = 0) => {
    if (timerInterval) clearInterval(timerInterval);
    matchTimeRemaining = limitSeconds;

    timerInterval = setInterval(() => {
        timeElapsed++;

        if (limitSeconds > 0) {
          matchTimeRemaining--;
          const timerEl = document.getElementById('game-timer');
          if (timerEl) {
              const m = Math.floor(Math.max(0, matchTimeRemaining) / 60).toString().padStart(2, '0');
              const s = (Math.max(0, matchTimeRemaining) % 60).toString().padStart(2, '0');
              timerEl.innerText = `⏱️ ${m}:${s}`;
          }

          if (matchTimeRemaining <= 0) {
            clearInterval(timerInterval);
            handleMatchTimeExpired();
          }
        } else {
          const timerEl = document.getElementById('game-timer');
          if (timerEl) {
              const m = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
              const s = (timeElapsed % 60).toString().padStart(2, '0');
              timerEl.innerText = `${m}:${s}`;
          }
        }

        // Periyodik kaydet
        if (!isMatchMode && timeElapsed % 5 === 0) {
          saveActiveGame();
        }
    }, 1000);
};

// Düello Süresi Dolduğunda Kazanan Tespiti
const handleMatchTimeExpired = async () => {
  if (!isMatchMode) return;
  isMatchMode = false;
  MatchEngine.clearActiveMatch();
  UIManager.hideMatchHeader();

  const enemyName = activeMatch?.player2?.username || 'Rakip';

  if (matchUserFilled > matchEnemyFilled) {
    const reward = currentDifficulty === 'basit' ? 50 : currentDifficulty === 'orta' ? 100 : 200;
    const newGold = UserManager.getGold() + reward;
    await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
    await UserManager.recordDuelResult(true);
    updateGoldDisplay();
    showMatchResult(true, reward, enemyName);
  } else if (matchUserFilled < matchEnemyFilled) {
    await UserManager.recordDuelResult(false);
    showMatchResult(false, 0, enemyName);
  } else {
    UIManager.showToast("⏱️ Süre Doldu! Her iki taraf da eşit sayıda hücre çözdü.", "info");
    UIManager.navigate('menu');
  }
};

const startGame = (level: number, diff: 'basit' | 'orta' | 'zor', matchData?: MatchState, restoredState?: any) => {
    errors = restoredState ? restoredState.errors : 0;
    hintsUsed = 0;
    selectedCell = null;
    currentDifficulty = diff;
    currentLevelNumber = level;
    isMatchMode = !!matchData;
    activeMatch = matchData || null;
    isNotesMode = false;

    // Notlar Matrisi
    if (restoredState && restoredState.notesBoard) {
      notesBoard = restoredState.notesBoard.map((row: any) => row.map((arr: any) => new Set<number>(arr)));
    } else {
      notesBoard = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()));
    }

    let data;
    if (restoredState) {
      data = { puzzle: restoredState.initialBoard, solution: restoredState.currentSolution };
      userBoard = restoredState.userBoard.map((row: any) => [...row]);
      initialBoard = restoredState.initialBoard.map((row: any) => [...row]);
      currentSolution = restoredState.currentSolution;
      timeElapsed = restoredState.timeElapsed;
    } else if (matchData) {
      data = { puzzle: matchData.puzzle, solution: matchData.solution };
      currentSolution = data.solution;
      userBoard = data.puzzle.map(row => [...row]);
      initialBoard = data.puzzle.map(row => [...row]);
      timeElapsed = 0;
    } else {
      data = SudokuGen.generate(diff);
      currentSolution = data.solution;
      userBoard = data.puzzle.map(row => [...row]);
      initialBoard = data.puzzle.map(row => [...row]);
      timeElapsed = 0;
      UIManager.hideMatchHeader();
    }

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

      if (activeMatch.player2?.isBot) {
        MatchEngine.startBotAI(diff, async (botProgress) => {
          matchEnemyFilled = botProgress;
          UIManager.renderMatchProgress(matchUserFilled, matchEnemyFilled, enemyName, matchTotalEmpty);

          if (matchEnemyFilled >= matchTotalEmpty && isMatchMode) {
            if (timerInterval) clearInterval(timerInterval);
            isMatchMode = false;
            MatchEngine.clearActiveMatch();
            UIManager.hideMatchHeader();
            await UserManager.recordDuelResult(false);
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
    startTimer(isMatchMode ? selectedMatchTimeSec : 0);

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
            initialBoard,
            notesBoard
        );

        UIManager.renderNumpad((num) => handleNumpadInput(num), calculateRemainingCounts(userBoard));
    };

    const handleNumpadInput = (num: number) => {
      if (!selectedCell) return;
      const { r, c } = selectedCell;

      if (initialBoard[r][c] !== 0) return;

      // Not Modu Açıkken Aday Ekleme/Çıkarma
      if (isNotesMode) {
        if (num >= 1 && num <= 9) {
          if (notesBoard[r][c].has(num)) {
            notesBoard[r][c].delete(num);
          } else {
            notesBoard[r][c].add(num);
          }
          saveActiveGame();
          refresh();
        }
        return;
      }

      // Gerçek Sayı Yazma
      const success = GameEngine.processInput(
          r,
          c,
          num,
          userBoard,
          currentSolution,
          initialBoard,
          async () => {
              if (timerInterval) clearInterval(timerInterval);
              clearSavedGame();

              if (isMatchMode) {
                const reward = diff === 'basit' ? 50 : diff === 'orta' ? 100 : 200;
                const newGold = UserManager.getGold() + reward;
                await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
                await UserManager.recordDuelResult(true);
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

              UIManager.showToast(`🎉 Tebrikler, Seviye ${level} Tamamlandı! +${reward} 🪙`, "success");
              UIManager.navigate('menu');
          },
          async (errCount) => {
              errors += errCount;
              updateErrorUI();
              saveActiveGame();
              if (errors >= 3) {
                  if (timerInterval) clearInterval(timerInterval);
                  clearSavedGame();
                  if (isMatchMode) {
                    isMatchMode = false;
                    MatchEngine.clearActiveMatch();
                    UIManager.hideMatchHeader();
                    await UserManager.recordDuelResult(false);
                    showMatchResult(false, 0, activeMatch?.player2?.username || 'Rakip');
                  } else {
                    UIManager.showToast("❌ Oyun Bitti! 3 Hata Yaptınız.", "error");
                    UIManager.navigate('menu');
                  }
              }
          }
      );

      if (success) {
        // İlgili hücrenin notlarını temizle
        notesBoard[r][c].clear();

        // Aynı satır, sütun ve 3x3 kutudaki aday notlarından num'u kaldır
        const boxR = Math.floor(r / 3) * 3;
        const boxC = Math.floor(c / 3) * 3;
        for (let i = 0; i < 9; i++) {
          notesBoard[r][i].delete(num);
          notesBoard[i][c].delete(num);
        }
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            notesBoard[boxR + i][boxC + j].delete(num);
          }
        }

        if (isMatchMode) {
          matchUserFilled++;
          const enemyName = activeMatch?.player2?.username || 'Rakip';
          UIManager.renderMatchProgress(matchUserFilled, matchEnemyFilled, enemyName, matchTotalEmpty);
        }

        saveActiveGame();
        refresh();
      }
    };

    // Kalem / Not Modu Butonu
    const toggleNotesBtn = document.getElementById('btn-toggle-notes');
    const notesTextEl = document.getElementById('notes-status-text');
    if (toggleNotesBtn) {
      toggleNotesBtn.onclick = () => {
        isNotesMode = !isNotesMode;
        if (notesTextEl) notesTextEl.innerText = isNotesMode ? 'Not: Açık' : 'Not: Kapalı';
        if (isNotesMode) {
          toggleNotesBtn.className = "bg-indigo-600 text-white py-2.5 px-3 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1";
          UIManager.showToast("✏️ Kalem / Not modu aktif!", "info");
        } else {
          toggleNotesBtn.className = "bg-slate-200 hover:bg-slate-300 text-slate-800 py-2.5 px-3 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1";
        }
      };
    }

    // Sil Butonu
    const eraseBtn = document.getElementById('btn-erase');
    if (eraseBtn) {
      eraseBtn.onclick = () => {
        if (!selectedCell) return;
        const { r, c } = selectedCell;
        if (initialBoard[r][c] !== 0) return;
        userBoard[r][c] = 0;
        notesBoard[r][c].clear();
        saveActiveGame();
        refresh();
      };
    }

    // İpucu Butonu
    const hintBtn = document.getElementById('btn-hint');
    if (hintBtn) {
        hintBtn.onclick = async () => {
            if (!selectedCell) return UIManager.showToast("Lütfen önce boş bir hücre seçin!", "info");
            const { r, c } = selectedCell;
            if (initialBoard[r][c] !== 0) return UIManager.showToast("Bu hücre kilitli!", "info");
            if (hintsUsed >= 5) return UIManager.showToast("İpucu sınırı doldu!", "error");

            const currentGold = UserManager.getGold();
            if (currentGold < 10) {
                return UIManager.showToast("Yetersiz altın! İpucu için en az 10 🪙 gerekiyor.", "error");
            }

            const newGold = currentGold - 10;
            await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
            updateGoldDisplay();

            userBoard[r][c] = currentSolution[r][c];
            notesBoard[r][c].clear();
            hintsUsed++;

            if (isMatchMode) {
              matchUserFilled++;
              const enemyName = activeMatch?.player2?.username || 'Rakip';
              UIManager.renderMatchProgress(matchUserFilled, matchEnemyFilled, enemyName, matchTotalEmpty);
            }

            saveActiveGame();
            refresh();
        };
    }

    refresh();
};

// Düello Çıkış Cezası Modalı Mantığı
const handleExitGameRequest = async (): Promise<boolean> => {
  if (isMatchMode) {
    return new Promise((resolve) => {
      UIManager.toggleModal('duel-exit-modal', true);

      const confirmBtn = document.getElementById('btn-confirm-duel-exit');
      const cancelBtn = document.getElementById('btn-cancel-duel-exit');

      const cleanup = () => {
        UIManager.toggleModal('duel-exit-modal', false);
      };

      if (confirmBtn) {
        confirmBtn.onclick = async () => {
          cleanup();
          if (timerInterval) clearInterval(timerInterval);
          const currentGold = UserManager.getGold();
          const newGold = Math.max(0, currentGold - 50);
          await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
          await UserManager.recordDuelResult(false);
          updateGoldDisplay();

          isMatchMode = false;
          MatchEngine.clearActiveMatch();
          UIManager.hideMatchHeader();
          UIManager.navigate('menu');
          UIManager.showToast("Düellodan çekildiniz (-50 🪙)", "error");
          resolve(true);
        };
      }

      if (cancelBtn) {
        cancelBtn.onclick = () => {
          cleanup();
          resolve(false);
        };
      }
    });
  }

  if (timerInterval) clearInterval(timerInterval);
  UIManager.navigate('menu');
  return true;
};

document.getElementById('btn-back-menu')?.addEventListener('click', () => {
  handleExitGameRequest();
});

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

// Canlı Düello Davet Dinleyicisi
const handleIncomingChallenge = (challenge: ChallengeRequest) => {
  UIManager.renderIncomingChallengePopup(
    challenge,
    async () => {
      const match = await MatchEngine.respondToChallenge(challenge.challengeId, true);
      if (match) {
        UIManager.showToast('⚔️ Düello başladı!', 'success');
        startGame(1, challenge.difficulty, match);
      }
    },
    async () => {
      await MatchEngine.respondToChallenge(challenge.challengeId, false);
      UIManager.showToast('Düello daveti reddedildi.', 'info');
    }
  );
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
    if (titleEl) titleEl.innerText = user.title || 'Çaylak Bulmacacı';
    if (avatarBox) avatarBox.innerText = user.avatar || '🎮';

    updateGoldDisplay();
    updateContinueCardUI();
    UIManager.navigate('menu');

    MatchEngine.listenIncomingChallenges((chal) => handleIncomingChallenge(chal));
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
    UIManager.showToast(`Hoş geldin ${user.username}!`, 'success');
  } else {
    UIManager.showToast("Lütfen en az 3 karakterden oluşan bir isim giriniz!", "error");
  }
});

document.getElementById('btn-edit-username')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const input = document.getElementById('username-input') as HTMLInputElement;
  if (input) input.value = UserManager.getUsername() || '';
  UIManager.toggleModal('username-modal', true);
});

document.getElementById('close-username-modal')?.addEventListener('click', () => {
  if (UserManager.getUsername()) {
    UIManager.toggleModal('username-modal', false);
  }
});

// Modal: Profil & Avatar/Unvan Seçimi
let currentlyViewedTargetUid: string | undefined = undefined;

const openPlayerProfile = async (targetData?: any) => {
  UIManager.toggleModal('view-profile', true);

  const isOwn = !targetData || targetData.username === UserManager.getUsername();
  let stats: any;

  if (isOwn) {
    stats = await UserManager.getUserProfileStats();
    currentlyViewedTargetUid = undefined;
  } else {
    currentlyViewedTargetUid = targetData.uid;
    stats = {
      uid: targetData.uid,
      username: targetData.username || 'Oyuncu',
      level: targetData.level || 1,
      gold: targetData.gold || 0,
      avatar: targetData.avatar || '🎮',
      title: targetData.title || 'Usta Oyuncu',
      notificationsEnabled: false,
      totalCompleted: targetData.total_completed || 0,
      duelWins: targetData.duel_wins || 0,
      duelLosses: targetData.duel_losses || 0,
      duelMmr: targetData.duel_mmr || 1000,
      bestBasitFormatted: UserManager.formatTime(targetData.best_basit),
      bestOrtaFormatted: UserManager.formatTime(targetData.best_orta),
      bestZorFormatted: UserManager.formatTime(targetData.best_zor)
    };
  }

  const badges = AchievementManager.getAllBadgesWithStatus(stats.level, stats.gold, stats.totalCompleted);
  UIManager.renderProfileModal(stats, badges, isOwn);
};

document.getElementById('btn-open-profile')?.addEventListener('click', async () => {
  openPlayerProfile();
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

// Bildirim Toggle Dinleyicisi
document.getElementById('toggle-notifications')?.addEventListener('change', async (e) => {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        UserManager.saveNotificationsEnabled(true);
        UIManager.showToast('🔔 Canlı düello bildirimleri açıldı!', 'success');
        MatchEngine.listenIncomingChallenges((chal) => handleIncomingChallenge(chal));
      } else {
        (e.target as HTMLInputElement).checked = false;
        UserManager.saveNotificationsEnabled(false);
        UIManager.showToast('⚠️ Bildirim izni verilmedi.', 'error');
      }
    } else {
      UserManager.saveNotificationsEnabled(true);
      UIManager.showToast('🔔 Düello bildirimleri aktif!', 'success');
    }
  } else {
    UserManager.saveNotificationsEnabled(false);
    UIManager.showToast('🔕 Bildirimler kapatıldı.', 'info');
  }
});

// Başka Bir Oyuncuya Düello İsteği Gönder
document.getElementById('btn-challenge-player')?.addEventListener('click', async () => {
  if (!currentlyViewedTargetUid) return;
  try {
    const targetUsername = document.getElementById('profile-username')?.innerText || 'Oyuncu';
    await MatchEngine.sendDirectChallenge(currentlyViewedTargetUid, targetUsername, 'basit');
    UIManager.showToast(`⚔️ ${targetUsername} adlı oyuncuya düello daveti gönderildi!`, 'success');
    UIManager.toggleModal('view-profile', false);
  } catch (e) {
    UIManager.showToast('Davet gönderilemedi.', 'error');
  }
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

// Düello Süre Seçim Butonları
const setupMatchTimeButtons = () => {
  const btn3m = document.getElementById('btn-match-time-3m');
  const btn7m = document.getElementById('btn-match-time-7m');
  const btnNoLimit = document.getElementById('btn-match-time-no-limit');

  const updateTimeBtns = (activeSec: number) => {
    selectedMatchTimeSec = activeSec;
    [btn3m, btn7m, btnNoLimit].forEach(btn => {
      if (!btn) return;
      const sec = parseInt(btn.getAttribute('data-time') || '0');
      if (sec === activeSec) {
        btn.className = "match-time-btn flex-1 py-1.5 rounded-lg font-black text-[11px] transition-all bg-indigo-600 text-white shadow-sm";
      } else {
        btn.className = "match-time-btn flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all text-slate-600 hover:text-slate-900 bg-transparent";
      }
    });
  };

  btn3m?.addEventListener('click', () => updateTimeBtns(180));
  btn7m?.addEventListener('click', () => updateTimeBtns(420));
  btnNoLimit?.addEventListener('click', () => updateTimeBtns(0));
};
setupMatchTimeButtons();

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

// Ana Menü Buton Bağlantıları & Kayıtlı Oyunu Sürdürme
document.getElementById('btn-continue-game')?.addEventListener('click', () => {
    const saved = localStorage.getItem('sudoku_saved_game');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        startGame(parsed.level, parsed.diff, undefined, parsed);
        UIManager.showToast("▶ Kayıtlı oyuna devam ediliyor!", "success");
        return;
      } catch {
        clearSavedGame();
      }
    }
    const userLvl = UserManager.getCurrentLevel();
    const diff = SudokuGen.getDifficulty(userLvl);
    startGame(userLvl, diff);
});

document.getElementById('btn-delete-saved-game')?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (confirm("Kayıtlı oyununuz silinecek. Emin misiniz?")) {
    clearSavedGame();
    UIManager.showToast("🗑️ Kayıtlı oyun silindi.", "info");
  }
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
    UIManager.showToast(result.message, result.success ? "success" : "info");
    if (result.success) {
        updateGoldDisplay();
        AchievementManager.checkAndUnlockBadges({
            level: UserManager.getCurrentLevel(),
            gold: UserManager.getGold(),
            dailyClaimed: true
        });
    }
});

// Modallar: Liderlik Tablosu & Filtreleme & Oyuncu Profili Açma
let currentLeaderboardType: 'level' | 'gold' | 'speed' = 'level';

const loadLeaderboardData = async () => {
  if (currentLeaderboardType === 'speed') {
    const records = await Leaderboard.fetchFastestRecords('all');
    UIManager.renderLeaderboard(records, 'speed', (p) => openPlayerProfile(p));
  } else {
    const players = await Leaderboard.fetchTopPlayers(currentLeaderboardType);
    UIManager.renderLeaderboard(players, currentLeaderboardType, (p) => openPlayerProfile(p));
  }
};

document.getElementById('btn-leaderboard')?.addEventListener('click', async () => {
  UIManager.toggleModal('view-leaderboard', true);
  loadLeaderboardData();
});

document.getElementById('close-leaderboard')?.addEventListener('click', () => {
  UIManager.toggleModal('view-leaderboard', false);
});

document.getElementById('refresh-leaderboard')?.addEventListener('click', () => {
  loadLeaderboardData();
});

// Sekme Dinleyicileri
document.getElementById('btn-tab-gold')?.addEventListener('click', () => {
  currentLeaderboardType = 'level';
  document.getElementById('general-sort-filters')?.classList.remove('hidden');
  document.getElementById('general-sort-filters')?.classList.add('flex');
  document.getElementById('speed-diff-filters')?.classList.add('hidden');
  document.getElementById('speed-diff-filters')?.classList.remove('flex');

  document.getElementById('btn-tab-gold')?.classList.add('bg-white', 'text-indigo-700', 'shadow-sm');
  document.getElementById('btn-tab-speed')?.classList.remove('bg-white', 'text-indigo-700', 'shadow-sm');
  loadLeaderboardData();
});

document.getElementById('btn-tab-speed')?.addEventListener('click', async () => {
  currentLeaderboardType = 'speed';
  document.getElementById('general-sort-filters')?.classList.add('hidden');
  document.getElementById('general-sort-filters')?.classList.remove('flex');
  document.getElementById('speed-diff-filters')?.classList.remove('hidden');
  document.getElementById('speed-diff-filters')?.classList.add('flex');

  document.getElementById('btn-tab-speed')?.classList.add('bg-white', 'text-indigo-700', 'shadow-sm');
  document.getElementById('btn-tab-gold')?.classList.remove('bg-white', 'text-indigo-700', 'shadow-sm');
  loadLeaderboardData();
});

document.getElementById('btn-sort-level')?.addEventListener('click', () => {
  currentLeaderboardType = 'level';
  document.getElementById('btn-sort-level')?.classList.add('bg-indigo-600', 'text-white');
  document.getElementById('btn-sort-gold')?.classList.remove('bg-indigo-600', 'text-white');
  loadLeaderboardData();
});

document.getElementById('btn-sort-gold')?.addEventListener('click', () => {
  currentLeaderboardType = 'gold';
  document.getElementById('btn-sort-gold')?.classList.add('bg-indigo-600', 'text-white');
  document.getElementById('btn-sort-level')?.classList.remove('bg-indigo-600', 'text-white');
  loadLeaderboardData();
});

document.querySelectorAll('.speed-filter-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const diff = (e.currentTarget as HTMLElement).getAttribute('data-diff') as any;
    const records = await Leaderboard.fetchFastestRecords(diff || 'all');
    UIManager.renderLeaderboard(records, 'speed', (p) => openPlayerProfile(p));
  });
});

// Modallar: Mağaza
const openAndRenderShop = () => {
  UIManager.renderShop(async (itemId) => {
    const result = await ShopManager.buyItem(itemId);
    UIManager.showToast(result.msg, result.success ? "success" : "error");
    if (result.success) {
      updateGoldDisplay();
      UIManager.applyTheme(ShopManager.getActiveTheme());
      openAndRenderShop(); // Sınırsız art arda satın alma ve tema değiştirme düzeltmesi
    }
  });
};

document.getElementById('btn-shop')?.addEventListener('click', () => {
  UIManager.toggleModal('view-shop', true);
  openAndRenderShop();
});

document.getElementById('close-shop')?.addEventListener('click', () => {
  UIManager.toggleModal('view-shop', false);
});

// Modallar: Başarımlar / Rozetler
const updateBadgeNotificationDot = (unclaimedCount: number) => {
  const dot = document.getElementById('badge-notify-dot');
  if (dot) {
    if (unclaimedCount > 0) dot.classList.remove('hidden');
    else dot.classList.add('hidden');
  }
};

const openAndRenderAchievements = () => {
  const badges = AchievementManager.getAllBadgesWithStatus(
    UserManager.getCurrentLevel(),
    UserManager.getGold()
  );

  const unclaimedCount = badges.filter(b => b.isUnlocked && !b.isClaimed).length;
  updateBadgeNotificationDot(unclaimedCount);

  UIManager.renderAchievements(badges, async (badgeId) => {
    const claimResult = AchievementManager.claimBadgeReward(badgeId);
    UIManager.showToast(claimResult.message, claimResult.success ? "success" : "info");
    if (claimResult.success) {
      const newGold = UserManager.getGold() + claimResult.goldAdded;
      await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
      updateGoldDisplay();
      openAndRenderAchievements(); // Sınırsız art arda ödül alma düzeltmesi
    }
  });
};

document.getElementById('btn-achievements')?.addEventListener('click', () => {
  UIManager.toggleModal('view-achievements', true);
  openAndRenderAchievements();
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
App.addListener('backButton', async () => {
    const modals = ['username-modal', 'view-profile', 'view-leaderboard', 'view-shop', 'view-achievements', 'placement-modal', 'placement-result-modal', 'match-search-modal', 'match-result-modal', 'duel-exit-modal'];
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
