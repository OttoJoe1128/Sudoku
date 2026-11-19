import './design/tokens.css';
import { UIManager, SavedGameRecord } from './ui/uiManager';
import { renderAvatarSVG, renderRankBadgeSVG } from './design/icons';
import { getLang, setLang, t, applyStaticTranslations } from './i18n/translations';
import { validateSavedGameRecord } from './engine/saveValidator';
import { saveActiveGameRecord, clearSavedGame, updateSavedGamesCountUI, initSaveController, ActiveGameSnapshot } from './controllers/saveController';
import { initMapController, getSelectedMapVariant } from './controllers/mapController';
import { initArenaController, getSelectedArenaVariant, getSelectedMatchTimeSec, handleIncomingChallenge, triggerExpertBotMatch } from './controllers/arenaController';
import { initModalsController, getSelectedCustomVariant, getSelectedCustomTimeSec, openPlayerProfile, updateBadgeNotificationDot } from './controllers/modalsController';
import { GameEngine } from './engine/gameEngine';
import { SudokuGen, SudokuVariant, GeneratedSudoku, IRREGULAR_TEMPLATES, KillerCage } from './engine/sudoku';
import { UserManager } from './store/userState';
import { Leaderboard, Player, SpeedRecord, SIMULATED_LOBBY_PLAYERS } from './engine/leaderboard';
import { ShopManager } from './engine/shop';
import { Rewards } from './engine/rewards';
import { AchievementManager } from './engine/achievements';
import { MatchEngine, MatchState, ChallengeRequest, calculateEloChange } from './engine/matchEngine';
import { BotCharacters, BotCharacter } from './engine/botData';
import { App } from '@capacitor/app';
import { doc, onSnapshot, query, collection, limit } from 'firebase/firestore';
import { auth, db } from './api/firebase';

UIManager.mountUI();
SudokuGen.runSelfDiagnostics();

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
let currentVariant: SudokuVariant = 'classic';
let activeGeneratedSudoku: GeneratedSudoku | null = null;
let isNotesMode = false;
let currentLevelNumber = 1;
let isCustomGameMode = false;
let currentTimeLimitSec = 0;
let currentRegionMap: number[][] | undefined = undefined;
let currentCages: KillerCage[] | undefined = undefined;

let samuraiBoards: { userBoard: number[][]; initialBoard: number[][]; solution: number[][]; notesBoard: Set<number>[][] }[] = [];
let activeSamuraiIndex = 0;
let activeRefreshFn: any = null;

const getSamuraiCompletionStatuses = () => {
  return samuraiBoards.map(b => {
    let remaining = 0;
    b.userBoard.forEach(row => row.forEach(val => { if (val === 0) remaining++; }));
    const completed = remaining === 0 && b.userBoard.every((row, ri) => row.every((val, ci) => val === b.solution[ri][ci]));
    return { completed, remaining };
  });
};

const syncSamuraiCell = (gridIdx: number, r: number, c: number, val: number) => {
  if (currentVariant !== 'samurai' || samuraiBoards.length < 5) return;

  const targetMapping: { targetGrid: number; targetR: number; targetC: number }[] = [];

  if (gridIdx === 0) {
    if (r < 3 && c < 3) targetMapping.push({ targetGrid: 1, targetR: r + 6, targetC: c + 6 });
    if (r < 3 && c >= 6) targetMapping.push({ targetGrid: 2, targetR: r + 6, targetC: c - 6 });
    if (r >= 6 && c < 3) targetMapping.push({ targetGrid: 3, targetR: r - 6, targetC: c + 6 });
    if (r >= 6 && c >= 6) targetMapping.push({ targetGrid: 4, targetR: r - 6, targetC: c - 6 });
  } else if (gridIdx === 1 && r >= 6 && c >= 6) {
    targetMapping.push({ targetGrid: 0, targetR: r - 6, targetC: c - 6 });
  } else if (gridIdx === 2 && r >= 6 && c < 3) {
    targetMapping.push({ targetGrid: 0, targetR: r - 6, targetC: c + 6 });
  } else if (gridIdx === 3 && r < 3 && c >= 6) {
    targetMapping.push({ targetGrid: 0, targetR: r + 6, targetC: c - 6 });
  } else if (gridIdx === 4 && r < 3 && c < 3) {
    targetMapping.push({ targetGrid: 0, targetR: r + 6, targetC: c + 6 });
  }

  targetMapping.forEach(target => {
    const tBoard = samuraiBoards[target.targetGrid];
    if (tBoard) {
      tBoard.userBoard[target.targetR][target.targetC] = val;
      tBoard.notesBoard[target.targetR][target.targetC].clear();

      if (val > 0) {
        const boxR = Math.floor(target.targetR / 3) * 3;
        const boxC = Math.floor(target.targetC / 3) * 3;
        for (let i = 0; i < 9; i++) {
          tBoard.notesBoard[target.targetR][i].delete(val);
          tBoard.notesBoard[i][target.targetC].delete(val);
        }
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            tBoard.notesBoard[boxR + i][boxC + j].delete(val);
          }
        }
      }
    }
  });
};

const switchSamuraiGrid = (idx: number) => {
  if (currentVariant !== 'samurai' || !samuraiBoards[idx]) return;
  activeSamuraiIndex = idx;
  const target = samuraiBoards[idx];
  userBoard = target.userBoard;
  initialBoard = target.initialBoard;
  currentSolution = target.solution;
  notesBoard = target.notesBoard;
  selectedCell = null;
  if (activeRefreshFn) activeRefreshFn();
};

// Maç / Düello Modu Değişkenleri
let activeMatch: MatchState | null = null;
let isMatchMode = false;
let matchUserFilled = 0;
let matchEnemyFilled = 0;
let matchTotalEmpty = 30;
let selectedMatchTimeSec = 180;
let matchTimeRemaining = 180;

const getRuleDescription = (variant: SudokuVariant): string => {
  return t('rule_' + variant);
};

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

const persistCurrentGame = () => {
  saveActiveGameRecord({
    isMatchMode,
    isCustomGameMode,
    variant: currentVariant,
    level: currentLevelNumber,
    diff: currentDifficulty,
    timeElapsed,
    userBoard,
    initialBoard,
    currentSolution,
    errors,
    notesBoard,
    regionMap: currentRegionMap,
    cages: currentCages,
    samuraiBoards: samuraiBoards.length === 5 ? samuraiBoards : undefined,
    activeSamuraiIndex: currentVariant === 'samurai' ? activeSamuraiIndex : undefined
  });
};

const clearCurrentSavedGame = () => {
  clearSavedGame(currentVariant, currentLevelNumber);
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
          persistCurrentGame();
        }
    }, 1000);
};

// Düello veya Serbest Mod Süresi Dolduğunda Kazanan / Sonuç Tespiti
const handleMatchTimeExpired = async () => {
  if (isMatchMode) {
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
  } else if (isCustomGameMode) {
    if (timerInterval) clearInterval(timerInterval);
    clearCurrentSavedGame();
    UIManager.showToast(t('time_expired_custom_toast'), "error");
    UIManager.navigate('menu');
  }
};

const startGame = (
  level: number,
  diff: 'basit' | 'orta' | 'zor',
  matchData?: MatchState,
  restoredState?: any,
  variant: SudokuVariant = 'classic',
  isCustom: boolean = false,
  customTimeLimitSec: number = 0
) => {
    errors = restoredState && typeof restoredState.errors === 'number' ? restoredState.errors : 0;
    hintsUsed = 0;
    selectedCell = null;
    currentDifficulty = diff;
    currentLevelNumber = level;
    currentVariant = restoredState?.variant || matchData?.variant || variant;
    isCustomGameMode = restoredState?.isCustomMode ?? isCustom;
    currentTimeLimitSec = restoredState?.timeLimitSec ?? (matchData ? (matchData.durationSec || 0) : customTimeLimitSec);
    isMatchMode = !!matchData;
    activeMatch = matchData || null;
    isNotesMode = false;

    // Presence takibi
    if (isMatchMode) {
      UserManager.setPresence('in_duel');
    } else {
      UserManager.setPresence('in_game');
    }

    // Geçerli Kayıt Doğrulaması
    const isValidRestored = restoredState &&
      Array.isArray(restoredState.currentSolution) && restoredState.currentSolution.length === 9 &&
      Array.isArray(restoredState.userBoard) && restoredState.userBoard.length === 9 &&
      Array.isArray(restoredState.initialBoard) && restoredState.initialBoard.length === 9;

    // Notlar Matrisi
    if (isValidRestored && restoredState.notesBoard) {
      notesBoard = restoredState.notesBoard.map((row: any) => row.map((arr: any) => new Set<number>(arr)));
    } else {
      notesBoard = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()));
    }

    if (isValidRestored) {
      userBoard = restoredState.userBoard.map((row: any) => [...row]);
      initialBoard = restoredState.initialBoard.map((row: any) => [...row]);
      currentSolution = restoredState.currentSolution;
      timeElapsed = typeof restoredState.timeElapsed === 'number' ? restoredState.timeElapsed : 0;
      currentRegionMap = restoredState.regionMap;
      currentCages = restoredState.cages;
    } else if (matchData) {
      if (restoredState) clearCurrentSavedGame();
      currentSolution = matchData.solution;
      userBoard = matchData.puzzle.map(row => [...row]);
      initialBoard = matchData.puzzle.map(row => [...row]);
      timeElapsed = 0;
      currentRegionMap = matchData.regionMap || IRREGULAR_TEMPLATES[0].regionMap;
      currentCages = matchData.cages;
    } else {
      if (restoredState) clearCurrentSavedGame();
      activeGeneratedSudoku = SudokuGen.generateVariant(diff, currentVariant);
      currentSolution = activeGeneratedSudoku.solution;
      userBoard = activeGeneratedSudoku.puzzle.map(row => [...row]);
      initialBoard = activeGeneratedSudoku.puzzle.map(row => [...row]);
      timeElapsed = 0;
      currentRegionMap = activeGeneratedSudoku.regionMap;
      currentCages = activeGeneratedSudoku.cages;
      UIManager.hideMatchHeader();
    }

    if (currentVariant !== 'irregular') {
      currentRegionMap = undefined;
    }
    if (currentVariant !== 'killer') {
      currentCages = undefined;
    }

    if (currentVariant === 'samurai') {
      if (isValidRestored && restoredState.samuraiBoards && restoredState.samuraiBoards.length === 5) {
        samuraiBoards = restoredState.samuraiBoards.map((b: any) => ({
          userBoard: b.userBoard.map((r: any) => [...r]),
          initialBoard: b.initialBoard.map((r: any) => [...r]),
          solution: b.solution.map((r: any) => [...r]),
          notesBoard: b.notesBoard.map((r: any) => r.map((arr: any) => new Set<number>(arr)))
        }));
        activeSamuraiIndex = typeof restoredState.activeSamuraiIndex === 'number' ? restoredState.activeSamuraiIndex : 0;
      } else {
        const genSamurai = activeGeneratedSudoku?.samuraiGrids || (SudokuGen.generateVariant(diff, 'samurai')).samuraiGrids!;
        samuraiBoards = genSamurai.map(g => ({
          userBoard: g.puzzle.map(r => [...r]),
          initialBoard: g.puzzle.map(r => [...r]),
          solution: g.solution.map(r => [...r]),
          notesBoard: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()))
        }));
        activeSamuraiIndex = 0;
      }

      const active = samuraiBoards[activeSamuraiIndex];
      userBoard = active.userBoard;
      initialBoard = active.initialBoard;
      currentSolution = active.solution;
      notesBoard = active.notesBoard;
    } else {
      samuraiBoards = [];
      UIManager.hideSamuraiRadar();
    }

    if (!isMatchMode) {
      persistCurrentGame();
    }

    // Disiplin Rozeti ve Çarpan Bilgisi Güncelleme
    const variantTitleEl = document.getElementById('game-variant-title');
    const variantMultEl = document.getElementById('game-variant-multiplier');
    if (variantTitleEl) {
      const emblemSVG = UIManager.getVariantEmblemSVG(currentVariant, 18);
      variantTitleEl.innerHTML = `${emblemSVG} <span>${t('var_' + currentVariant + '_full')}</span>`;
    }
    if (variantMultEl) {
      const mults: Record<SudokuVariant, string> = {
        classic: '1.0x',
        wordoku: '1.2x',
        irregular: '1.5x',
        killer: '1.8x',
        samurai: '2.5x'
      };
      variantMultEl.innerText = t('pts_multiplier', { mult: mults[currentVariant] || '1.0x' });
    }

    // Düello Modu İlerleme Hesaplama & Canlı Dinleyici
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
            await UserManager.recordDuelResult(false, true, -15, 0);
            showMatchResult(false, 0, enemyName);
          }
        });
      } else {
        // Gerçek Oyuncu Canlı Hamle Dinleyicisi
        const isP1 = activeMatch.player1.uid === (auth.currentUser ? auth.currentUser.uid : '');
        const myUid = isP1 ? activeMatch.player1.uid : (activeMatch.player2?.uid || '');

        MatchEngine.listenMatchUpdates(activeMatch.matchId, async (updatedMatch) => {
          // Rakip Çekildi / Terk Etti Kontrolü
          if (updatedMatch.status === 'completed' && updatedMatch.forfeitBy && isMatchMode) {
            if (updatedMatch.winnerUid === myUid) {
              if (timerInterval) clearInterval(timerInterval);
              isMatchMode = false;
              MatchEngine.clearActiveMatch();
              UIManager.hideMatchHeader();

              const rewardGold = 50;
              const gainedMmr = 30;
              await UserManager.recordDuelResult(true, false, gainedMmr, rewardGold);
              updateGoldDisplay();
              UIManager.showToast(`🏆 Rakip oyunu terk etti! Zafer sizin! (+${rewardGold} 🪙 & +30 MMR)`, "success");
              showMatchResult(true, rewardGold, updatedMatch.player1.uid === myUid ? (updatedMatch.player2?.username || 'Rakip') : updatedMatch.player1.username);
              return;
            }
          }

          const opp = isP1 ? updatedMatch.player2 : updatedMatch.player1;
          if (opp) {
            matchEnemyFilled = opp.progress;
            UIManager.renderMatchProgress(matchUserFilled, matchEnemyFilled, opp.username || enemyName, matchTotalEmpty);

            if (matchEnemyFilled >= matchTotalEmpty && isMatchMode) {
              if (timerInterval) clearInterval(timerInterval);
              isMatchMode = false;
              MatchEngine.clearActiveMatch();
              UIManager.hideMatchHeader();
              await UserManager.recordDuelResult(false, false, -20, 0);
              showMatchResult(false, 0, opp.username || enemyName);
            }
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
        if (errorEl) errorEl.innerText = t('game_errors', { count: errors });
    };
    updateErrorUI();

    UIManager.navigate('game');
    startTimer(currentTimeLimitSec);

    const refresh = () => {
        UIManager.renderBoard(
            userBoard,
            (r, c) => {
                selectedCell = { r, c };
                refresh();
            },
            selectedCell?.r ?? -1,
            selectedCell?.c ?? -1,
            initialBoard,
            notesBoard,
            currentVariant,
            currentRegionMap,
            currentCages,
            currentVariant === 'samurai' ? activeSamuraiIndex : undefined
        );

        if (currentVariant === 'samurai') {
          UIManager.renderSamuraiRadar(activeSamuraiIndex, getSamuraiCompletionStatuses(), (idx) => switchSamuraiGrid(idx));
        } else {
          UIManager.hideSamuraiRadar();
        }

        UIManager.renderNumpad(
          (num) => handleNumpadInput(num),
          calculateRemainingCounts(userBoard),
          currentVariant === 'wordoku'
        );
    };
    activeRefreshFn = refresh;

    const handleNumpadInput = (num: number) => {
      if (!selectedCell) return;
      const { r, c } = selectedCell;

      if (userBoard[r][c] !== 0) {
        UIManager.showToast(t('cell_locked_toast'), "info");
        return;
      }

      // Not Modu
      if (isNotesMode) {
        if (num >= 1 && num <= 9) {
          if (notesBoard[r][c].has(num)) {
            notesBoard[r][c].delete(num);
          } else {
            notesBoard[r][c].add(num);
          }
          persistCurrentGame();
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
              if (currentVariant === 'samurai') {
                const currentDone = userBoard.every((row, ri) => row.every((val, ci) => val === currentSolution[ri][ci]));
                const allDone = samuraiBoards.every(b => b.userBoard.every((row, ri) => row.every((val, ci) => val === b.solution[ri][ci])));

                if (!allDone) {
                  if (currentDone) {
                    UIManager.showToast(t('samurai_board_done_toast'), "success");
                  }
                  persistCurrentGame();
                  refresh();
                  return;
                }
              }

              if (timerInterval) clearInterval(timerInterval);
              clearCurrentSavedGame();

              if (isMatchMode) {
                const isBot = !!activeMatch?.player2?.isBot;
                let reward = diff === 'basit' ? 50 : diff === 'orta' ? 100 : 200;
                let gainedMmr = 25;

                if (!isBot && activeMatch?.player2) {
                  const eloRes = calculateEloChange(1000, 1000, true, diff, errors, timeElapsed);
                  gainedMmr = eloRes.mmrChangeA;
                } else {
                  reward = diff === 'basit' ? 25 : diff === 'orta' ? 50 : 100;
                  gainedMmr = diff === 'basit' ? 15 : diff === 'orta' ? 25 : 35;
                }

                await UserManager.recordDuelResult(true, isBot, gainedMmr, reward);
                updateGoldDisplay();

                isMatchMode = false;
                MatchEngine.clearActiveMatch();
                UIManager.hideMatchHeader();
                showMatchResult(true, reward, activeMatch?.player2?.username || 'Rakip');
                return;
              }

              // Serbest Mod veya Yolculuk Haritası Bölüm Zaferi
              if (isCustomGameMode) {
                let baseReward = diff === 'basit' ? 10 : diff === 'orta' ? 20 : 35;
                if (selectedMatchTimeSec === 180) {
                  baseReward = Math.round(baseReward * 1.5);
                }
                const newGold = UserManager.getGold() + baseReward;

                await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
                await UserManager.recordGameCompletion({
                    level,
                    difficulty: diff,
                    variant: currentVariant,
                    timeElapsed,
                    timeFormatted: `${Math.floor(timeElapsed / 60).toString().padStart(2, '0')}:${(timeElapsed % 60).toString().padStart(2, '0')}`,
                    errors,
                    hintsUsed
                });

                updateGoldDisplay();
                UIManager.showToast(`🎉 Tebrikler, SERBEST MOD (${currentVariant.toUpperCase()}) Tamamlandı! +${baseReward} 🪙`, "success");
                UIManager.navigate('menu');
                return;
              }

              // Yolculuk Haritası Zaferi (Seviye Atlama)
              const reward = diff === 'basit' ? 10 : diff === 'orta' ? 20 : 35;
              const userLvl = UserManager.getVariantLevel(currentVariant);
              const nextLevel = level === userLvl ? userLvl + 1 : userLvl;
              const newGold = UserManager.getGold() + reward;

              await UserManager.updateProgress(nextLevel, newGold);
              await UserManager.recordGameCompletion({
                  level,
                  difficulty: diff,
                  variant: currentVariant,
                  timeElapsed,
                  timeFormatted: `${Math.floor(timeElapsed / 60).toString().padStart(2, '0')}:${(timeElapsed % 60).toString().padStart(2, '0')}`,
                  errors,
                  hintsUsed
              });

              updateGoldDisplay();

              AchievementManager.checkAndUnlockBadges({
                  level: nextLevel,
                  gold: newGold,
                  lastTimeElapsed: timeElapsed,
                  lastErrors: errors
              });

              UIManager.showToast(`🎉 Tebrikler, ${currentVariant.toUpperCase()} Seviye ${level} Tamamlandı! +${reward} 🪙`, "success");
              UIManager.navigate('menu');
          },
          async (errCount) => {
              errors += errCount;
              updateErrorUI();
              persistCurrentGame();
              if (errors >= 3) {
                  if (timerInterval) clearInterval(timerInterval);
                  clearCurrentSavedGame();
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
        notesBoard[r][c].clear();

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

        if (currentVariant === 'samurai') {
          syncSamuraiCell(activeSamuraiIndex, r, c, num);
        }

        if (isMatchMode && activeMatch) {
          matchUserFilled++;
          const isP1 = activeMatch.player1.uid === (auth.currentUser ? auth.currentUser.uid : '');
          MatchEngine.updateProgress(activeMatch.matchId, isP1, matchUserFilled, errors);
          const enemyName = activeMatch?.player2?.username || 'Rakip';
          UIManager.renderMatchProgress(matchUserFilled, matchEnemyFilled, enemyName, matchTotalEmpty);
        }

        persistCurrentGame();
        refresh();
      }
    };

    // Kalem / Not Modu Butonu
    const toggleNotesBtn = document.getElementById('btn-toggle-notes');
    const notesTextEl = document.getElementById('notes-status-text');
    if (toggleNotesBtn) {
      toggleNotesBtn.onclick = () => {
        isNotesMode = !isNotesMode;
        if (notesTextEl) notesTextEl.innerText = isNotesMode ? t('btn_notes_on') : t('btn_notes_off');
        if (isNotesMode) {
          toggleNotesBtn.className = "bg-[var(--accent-gold)] text-[var(--text-on-gold)] border border-[var(--accent-gold-bright)] py-2.5 px-3 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1.5";
          UIManager.showToast(t('notes_active_toast'), "info");
        } else {
          toggleNotesBtn.className = "bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] py-2.5 px-3 rounded-2xl font-black text-xs shadow active:scale-95 transition-all flex items-center justify-center gap-1.5";
        }
      };
    }

    // Sil Butonu
    const eraseBtn = document.getElementById('btn-erase');
    if (eraseBtn) {
      eraseBtn.onclick = () => {
        if (!selectedCell) return;
        const { r, c } = selectedCell;
        if (userBoard[r][c] !== 0) {
          UIManager.showToast(t('cell_locked_erase_toast'), "info");
          return;
        }
        notesBoard[r][c].clear();
        persistCurrentGame();
        refresh();
      };
    }

    // Akıllı İpucu Butonu
    const hintBtn = document.getElementById('btn-hint');
    if (hintBtn) {
        hintBtn.onclick = async () => {
            const currentGold = UserManager.getGold();
            if (currentGold < 10) {
                return UIManager.showToast("Yetersiz altın! İpucu için en az 10 🪙 gerekiyor.", "error");
            }
            if (hintsUsed >= 5) {
                return UIManager.showToast("İpucu sınırı doldu (Max 5/oyun)!", "error");
            }

            let targetR = -1;
            let targetC = -1;

            if (selectedCell && userBoard[selectedCell.r][selectedCell.c] === 0) {
              targetR = selectedCell.r;
              targetC = selectedCell.c;
            } else {
              for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                  if (userBoard[r][c] === 0) {
                    targetR = r;
                    targetC = c;
                    break;
                  }
                }
                if (targetR !== -1) break;
              }
            }

            if (targetR === -1 || targetC === -1) {
              return UIManager.showToast("Tahtada doldurulacak boş hücre kalmadı!", "info");
            }

            const newGold = currentGold - 10;
            await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
            updateGoldDisplay();

            const correctNum = currentSolution[targetR][targetC];
            userBoard[targetR][targetC] = correctNum;
            selectedCell = { r: targetR, c: targetC };
            hintsUsed++;

            notesBoard[targetR][targetC].clear();
            const boxR = Math.floor(targetR / 3) * 3;
            const boxC = Math.floor(targetC / 3) * 3;
            for (let i = 0; i < 9; i++) {
              notesBoard[targetR][i].delete(correctNum);
              notesBoard[i][targetC].delete(correctNum);
            }
            for (let i = 0; i < 3; i++) {
              for (let j = 0; j < 3; j++) {
                notesBoard[boxR + i][boxC + j].delete(correctNum);
              }
            }

            if (currentVariant === 'samurai') {
              syncSamuraiCell(activeSamuraiIndex, targetR, targetC, correctNum);
            }

            if (isMatchMode && activeMatch) {
              matchUserFilled++;
              const isP1 = activeMatch.player1.uid === (auth.currentUser ? auth.currentUser.uid : '');
              MatchEngine.updateProgress(activeMatch.matchId, isP1, matchUserFilled, errors);
              const enemyName = activeMatch?.player2?.username || 'Rakip';
              UIManager.renderMatchProgress(matchUserFilled, matchEnemyFilled, enemyName, matchTotalEmpty);
            }

            persistCurrentGame();
            refresh();

            // Zafer Kontrolü
            let isWin = false;
            if (currentVariant === 'samurai') {
              const currentDone = userBoard.every((row, ri) => row.every((val, ci) => val === currentSolution[ri][ci]));
              const allDone = samuraiBoards.every(b => b.userBoard.every((row, ri) => row.every((val, ci) => val === b.solution[ri][ci])));

              if (!allDone) {
                if (currentDone) {
                  UIManager.showToast(t('samurai_board_done_toast'), "success");
                }
                persistCurrentGame();
                refresh();
                return;
              }
              isWin = true;
            } else {
              isWin = userBoard.every((row, ri) => row.every((val, ci) => val === currentSolution[ri][ci]));
            }

            if (isWin) {
              if (timerInterval) clearInterval(timerInterval);
              clearCurrentSavedGame();

              if (isMatchMode) {
                const reward = currentDifficulty === 'basit' ? 50 : currentDifficulty === 'orta' ? 100 : 200;
                const finalGold = UserManager.getGold() + reward;
                await UserManager.updateProgress(UserManager.getCurrentLevel(), finalGold);
                await UserManager.recordDuelResult(true);
                updateGoldDisplay();

                isMatchMode = false;
                MatchEngine.clearActiveMatch();
                UIManager.hideMatchHeader();
                showMatchResult(true, reward, activeMatch?.player2?.username || 'Rakip');
              } else {
                const reward = currentDifficulty === 'basit' ? 10 : currentDifficulty === 'orta' ? 20 : 35;
                const userLvl = UserManager.getVariantLevel(currentVariant);
                const nextLevel = currentLevelNumber === userLvl ? userLvl + 1 : userLvl;
                const finalGold = UserManager.getGold() + reward;

                await UserManager.updateProgress(nextLevel, finalGold);
                updateGoldDisplay();

                const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
                const seconds = (timeElapsed % 60).toString().padStart(2, '0');
                await UserManager.recordGameCompletion({
                    level: currentLevelNumber,
                    difficulty: currentDifficulty,
                    variant: currentVariant,
                    timeElapsed,
                    timeFormatted: `${minutes}:${seconds}`,
                    errors,
                    hintsUsed
                });

                AchievementManager.checkAndUnlockBadges({
                    level: nextLevel,
                    gold: finalGold,
                    lastTimeElapsed: timeElapsed,
                    lastErrors: errors
                });

                UIManager.showToast(`🎉 Tebrikler, Seviye ${currentLevelNumber} Tamamlandı! +${reward} 🪙`, "success");
                UIManager.navigate('menu');
              }
            } else {
              UIManager.showToast("💡 İpucu yerleştirildi! (-10 🪙)", "success");
            }
        };
    }

    refresh();
};

// Düello Çıkış Cezası Modalı Mantığı
const handleExitGameRequest = async (): Promise<boolean> => {
  if (isMatchMode && activeMatch) {
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

          const myUid = auth.currentUser ? auth.currentUser.uid : '';
          const isP1 = activeMatch?.player1.uid === myUid;
          const enemyUid = isP1 ? (activeMatch?.player2?.uid || '') : (activeMatch?.player1.uid || '');

          if (!activeMatch?.player2?.isBot && activeMatch?.matchId) {
            await MatchEngine.notifyMatchForfeit(activeMatch.matchId, myUid, enemyUid);
          }

          await UserManager.recordDuelResult(false, !!activeMatch?.player2?.isBot, -30, -50);
          updateGoldDisplay();

          isMatchMode = false;
          MatchEngine.clearActiveMatch();
          UIManager.hideMatchHeader();
          UIManager.navigate('menu');
          UIManager.showToast("Düellodan çekildiniz (-50 🪙 & -30 MMR)", "error");
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

  if (!isMatchMode) {
    persistCurrentGame();
  }

  activeRefreshFn = null;
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

// Etkileşimli Sembol Bilgi Popover Dinleyicisi
document.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest('[data-variant-info]');
  if (target) {
    const v = target.getAttribute('data-variant-info') as SudokuVariant;
    if (v) UIManager.showVariantSymbolInfo(v);
  }
});

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
  if (notesTextEl) notesTextEl.innerText = isNotesMode ? t('btn_notes_on') : t('btn_notes_off');

  const mult = customTimeSec === 180 ? 1.5 : 1.0;
  const b1 = document.getElementById('badge-custom-basit-reward');
  const b2 = document.getElementById('badge-custom-orta-reward');
  const b3 = document.getElementById('badge-custom-zor-reward');
  if (b1) b1.innerText = `+${Math.round(10 * mult)} ${t('label_gold')}`;
  if (b2) b2.innerText = `+${Math.round(20 * mult)} ${t('label_gold')}`;
  if (b3) b3.innerText = `+${Math.round(35 * mult)} ${t('label_gold')}`;
};

document.getElementById('btn-lang-toggle')?.addEventListener('click', () => {
  const nextLang = getLang() === 'tr' ? 'en' : 'tr';
  setLang(nextLang);
  updateLanguageUI();
  UIManager.showToast(nextLang === 'en' ? 'Language switched to English' : 'Dil Türkçe olarak ayarlandı', 'info');
});

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
  }
};

document.getElementById('save-username')?.addEventListener('click', async () => {
  const input = document.getElementById('username-input') as HTMLInputElement;
  const newName = input?.value?.trim();
  if (newName && newName.length >= 3) {
    const user = await UserManager.saveUser(newName);
    const nameEl = document.getElementById('menu-player-name');
    const profileNameEl = document.getElementById('profile-username');
    if (nameEl) nameEl.innerText = user.username;
    if (profileNameEl) profileNameEl.innerText = user.username;

    updateGoldDisplay();
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

// Controller Bağlantıları (Arena & Modals Controllers)
initArenaController({
  onStartMatchGame: (level, diff, matchData, variant) => {
    startGame(level, diff, matchData, undefined, variant);
  },
  onBotMatchProgress: async (botProgress, enemyName) => {
    matchEnemyFilled = botProgress;
    UIManager.renderMatchProgress(matchUserFilled, matchEnemyFilled, enemyName, matchTotalEmpty);

    if (matchEnemyFilled >= matchTotalEmpty && isMatchMode) {
      if (timerInterval) clearInterval(timerInterval);
      isMatchMode = false;
      MatchEngine.clearActiveMatch();
      UIManager.hideMatchHeader();
      await UserManager.recordDuelResult(false, true, -15, 0);
      showMatchResult(false, 0, enemyName);
    }
  },
  getRuleDescription
});

initModalsController({
  onStartCustomGame: (level, diff, variant, timeLimitSec) => {
    startGame(level, diff, undefined, undefined, variant, true, timeLimitSec);
  },
  onStartPlacementExam: (diff) => {
    let targetLevel = diff === 'basit' ? 1 : diff === 'orta' ? 301 : 701;
    startGame(targetLevel, diff, undefined, undefined, 'classic', false);
  },
  onStartLevelDirect: (level, diff) => {
    startGame(level, diff, undefined, undefined, 'classic', false);
  },
  onUpdateGoldDisplay: () => {
    updateGoldDisplay();
  },
  onUpdateSavedGamesUI: () => {
    updateSavedGamesCountUI();
  },
  onTriggerExpertBotMatch: () => {
    triggerExpertBotMatch(
      (level, diff, matchData, variant) => startGame(level, diff, matchData, undefined, variant),
      async (botProgress, enemyName) => {
        matchEnemyFilled = botProgress;
        UIManager.renderMatchProgress(matchUserFilled, matchEnemyFilled, enemyName, matchTotalEmpty);

        if (matchEnemyFilled >= matchTotalEmpty && isMatchMode) {
          if (timerInterval) clearInterval(timerInterval);
          isMatchMode = false;
          MatchEngine.clearActiveMatch();
          UIManager.hideMatchHeader();
          await UserManager.recordDuelResult(false, true, -15, 0);
          showMatchResult(false, 0, enemyName);
        }
      }
    );
  },
  getSelectedArenaVariant,
  getRuleDescription,
  onHandleIncomingChallenge: (chal) => handleIncomingChallenge(chal, (level, diff, matchData, variant) => startGame(level, diff, matchData, undefined, variant))
});

// Heartbeat Presence Zamanlayıcısı (Her 30 saniyede bir)
setInterval(() => {
  if (UserManager.getUsername()) {
    const isGameVisible = !document.getElementById('game-view')?.classList.contains('hidden');
    UserManager.setPresence(isGameVisible ? (isMatchMode ? 'in_duel' : 'in_game') : 'available');
  }
}, 30000);

// Başlangıç Kontrolü
checkUser();

// Android Donanım Geri Tuşu Mantığı (Capacitor)
App.addListener('backButton', async () => {
    const modals = ['username-modal', 'view-profile', 'view-inbox', 'view-saved-games', 'view-leaderboard', 'view-shop', 'view-achievements', 'placement-modal', 'placement-result-modal', 'match-search-modal', 'match-result-modal', 'duel-exit-modal'];
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
