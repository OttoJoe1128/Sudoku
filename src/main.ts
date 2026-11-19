import './design/tokens.css';
import { UIManager, SavedGameRecord } from './ui/uiManager';
import { renderAvatarSVG, renderRankBadgeSVG } from './design/icons';
import { getLang, setLang, t, applyStaticTranslations } from './i18n/translations';
import { validateSavedGameRecord } from './engine/saveValidator';
import { saveActiveGameRecord, clearSavedGame, updateSavedGamesCountUI, initSaveController, ActiveGameSnapshot } from './controllers/saveController';
import { initMapController, getSelectedMapVariant } from './controllers/mapController';
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

document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-level]');
    if (target) {
        const level = parseInt(target.getAttribute('data-level')!);
        const diff = SudokuGen.getDifficulty(level);
        startGame(level, diff, undefined, undefined, getSelectedMapVariant());
    }
});

// Etkileşimli Sembol Bilgi Popover Dinleyicisi
document.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest('[data-variant-info]');
  if (target) {
    const v = target.getAttribute('data-variant-info') as SudokuVariant;
    if (v) UIManager.showVariantSymbolInfo(v);
  }
});

// Canlı Düello Davet Dinleyicisi
const handleIncomingChallenge = (challenge: ChallengeRequest) => {
  UIManager.renderIncomingChallengePopup(
    challenge,
    async () => {
      const match = await MatchEngine.respondToChallenge(challenge.challengeId, true, challenge);
      if (match) {
        UIManager.showToast('⚔️ Düello başladı!', 'success');
        startGame(1, challenge.difficulty, match);
      }
    },
    async () => {
      await MatchEngine.respondToChallenge(challenge.challengeId, false, challenge);
      UIManager.showToast('Düello daveti reddedildi.', 'info');
    }
  );
};

// Gelen Kutusu (Inbox) Yükleme ve İşleme
const loadInboxData = async () => {
  const challenges = await MatchEngine.fetchPendingChallenges();
  UIManager.renderInbox(
    challenges,
    async (challenge) => {
      const match = await MatchEngine.respondToChallenge(challenge.challengeId, true, challenge);
      if (match) {
        UIManager.toggleModal('view-inbox', false);
        UIManager.showToast(`⚔️ ${challenge.fromUsername} ile düello başladı!`, 'success');
        startGame(1, challenge.difficulty, match);
      }
    },
    async (challenge) => {
      await MatchEngine.respondToChallenge(challenge.challengeId, false, challenge);
      UIManager.showToast('Düello daveti reddedildi.', 'info');
      loadInboxData();
    }
  );
};

document.getElementById('btn-open-inbox')?.addEventListener('click', () => {
  UIManager.toggleModal('view-inbox', true);
  loadInboxData();
});

document.getElementById('close-inbox')?.addEventListener('click', () => {
  UIManager.toggleModal('view-inbox', false);
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

  const ruleDescCustom = document.getElementById('custom-variant-rule-desc');
  if (ruleDescCustom) ruleDescCustom.innerText = getRuleDescription(selectedCustomVariant);
  const customBadge = document.getElementById('custom-variant-multiplier-badge');
  if (customBadge) customBadge.innerText = t('pts_multiplier', { mult: mults[selectedCustomVariant] || '1.0x' });

  const mapVariant = getSelectedMapVariant();
  const ruleDescMap = document.getElementById('map-variant-rule-desc');
  if (ruleDescMap) ruleDescMap.innerText = getRuleDescription(mapVariant);

  const ruleDescArena = document.getElementById('arena-variant-rule-desc');
  if (ruleDescArena) ruleDescArena.innerText = getRuleDescription(selectedArenaVariant);
  const arenaBadge = document.getElementById('arena-variant-multiplier-badge');
  if (arenaBadge) arenaBadge.innerText = t('pts_multiplier', { mult: mults[selectedArenaVariant] || '1.0x' });

  const notesTextEl = document.getElementById('notes-status-text');
  if (notesTextEl) notesTextEl.innerText = isNotesMode ? t('btn_notes_on') : t('btn_notes_off');

  const mult = selectedCustomTimeSec === 180 ? 1.5 : 1.0;
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
    MatchEngine.listenIncomingChallenges((chal) => handleIncomingChallenge(chal));
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

// Modal: Profil & Avatar Seçimi
let currentlyViewedTargetUid: string | undefined = undefined;
let currentlyViewedTargetUsername: string | undefined = undefined;

const openPlayerProfile = async (targetData?: any) => {
  UIManager.toggleModal('view-profile', true);

  const currentUsername = UserManager.getUsername();
  const isOwn = !targetData || targetData.username === currentUsername;
  let stats: any;

  if (isOwn) {
    stats = await UserManager.getUserProfileStats();
    currentlyViewedTargetUid = undefined;
    currentlyViewedTargetUsername = undefined;
  } else {
    currentlyViewedTargetUid = targetData.uid || targetData.username || 'target';
    currentlyViewedTargetUsername = targetData.username || 'Oyuncu';
    stats = await UserManager.getUserProfileStats(currentlyViewedTargetUid);
    stats.username = currentlyViewedTargetUsername;
    stats.avatar = targetData.avatar || stats.avatar || '🎮';
  }

  const badges = AchievementManager.getAllBadgesWithStatus(stats.level, stats.gold, stats.totalCompleted);
  UIManager.renderProfileModal(stats, badges, isOwn);

  if (isOwn) {
    // Avatar Butonları Dinleyicisi
    document.querySelectorAll('.avatar-option-btn').forEach(btn => {
      (btn as HTMLElement).onclick = async (e: Event) => {
        const newAvatar = (e.currentTarget as HTMLElement).getAttribute('data-avatar');
        if (newAvatar) {
          await UserManager.updateProfileCustomization(newAvatar, UserManager.getTitle());
          const avatarBox = document.getElementById('menu-avatar-box');
          if (avatarBox) avatarBox.innerHTML = renderAvatarSVG(newAvatar, 28);
          UIManager.showToast("Avatar güncellendi!", "success");
          openPlayerProfile();
        }
      };
    });
  }
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
  const closeBtn = document.getElementById('close-username-modal');
  if (input) input.value = UserManager.getUsername() || '';
  if (closeBtn) closeBtn.classList.remove('hidden');
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

// Başka Bir Oyuncuya Çift Taraflı Düello İsteği Gönder (Önce Süre Modu Seçilir)
document.getElementById('btn-challenge-player')?.addEventListener('click', () => {
  const targetUsername = currentlyViewedTargetUsername || document.getElementById('profile-username')?.innerText || 'Oyuncu';
  const targetUid = currentlyViewedTargetUid || targetUsername;

  if (!targetUid || targetUsername === UserManager.getUsername()) {
    return UIManager.showToast("Kendi profilinize davet gönderemezsiniz.", "info");
  }

  UIManager.renderChallengeDurationSelectModal(targetUsername, async (durationSec) => {
    try {
      await MatchEngine.sendDirectChallenge(targetUid, targetUsername, 'basit', durationSec, selectedArenaVariant);
      const modeText = durationSec > 0 ? `${Math.floor(durationSec / 60)} Dk` : 'Süresiz';
      UIManager.showToast(`⚔️ Düello daveti (${modeText}) ${targetUsername} adlı oyuncunun gelen kutusuna gönderildi!`, 'success');
      UIManager.toggleModal('view-profile', false);
    } catch (e: any) {
      console.warn("Düello davet gönderme yetki hatası:", e);
      UIManager.toggleModal('view-profile', false);

      UIManager.renderBotFallbackPromptModal(
        () => {
          const expertBot = BotCharacters.find(b => b.level === 300) || BotCharacters[0];
          startBotMatch(expertBot);
        },
        () => {
          UIManager.navigate('menu');
        }
      );
    }
  });
});

// Serbest Mod Disiplin ve Süre Seçiciler & Başlat Butonları
let selectedCustomVariant: SudokuVariant = 'classic';
let selectedCustomTimeSec: number = 0;

(['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(v => {
  document.getElementById(`btn-variant-${v}`)?.addEventListener('click', () => {
    selectedCustomVariant = v;
    (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(other => {
      const btn = document.getElementById(`btn-variant-${other}`);
      if (btn) {
        if (other === v) {
          btn.className = "custom-variant-btn p-2 rounded-xl bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";
        } else {
          btn.className = "custom-variant-btn p-2 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";
        }
      }
    });

    const badge = document.getElementById('custom-variant-multiplier-badge');
    const descEl = document.getElementById('custom-variant-rule-desc');
    const mults: Record<SudokuVariant, string> = { classic: '1.0x', wordoku: '1.2x', irregular: '1.5x', killer: '1.8x', samurai: '2.5x' };
    if (badge) badge.innerText = t('pts_multiplier', { mult: mults[v] || '1.0x' });
    if (descEl) descEl.innerText = getRuleDescription(v);
  });
});

// Serbest Mod Süre Seçici Dinleyicileri
const setupCustomTimeButtons = () => {
  const btnNoLimit = document.getElementById('btn-custom-time-no-limit');
  const btn7m = document.getElementById('btn-custom-time-7m');
  const btn3m = document.getElementById('btn-custom-time-3m');

  const updateBtns = (sec: number) => {
    selectedCustomTimeSec = sec;
    [btnNoLimit, btn7m, btn3m].forEach(b => {
      if (!b) return;
      const bSec = parseInt(b.getAttribute('data-time') || '0');
      if (bSec === sec) {
        b.className = "custom-time-btn flex-1 py-1.5 rounded-xl font-black text-[10px] transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex items-center justify-center gap-1";
      } else {
        b.className = "custom-time-btn flex-1 py-1.5 rounded-xl font-bold text-[10px] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent flex items-center justify-center gap-1";
      }
    });

    const mult = sec === 180 ? 1.5 : 1.0;
    const b1 = document.getElementById('badge-custom-basit-reward');
    const b2 = document.getElementById('badge-custom-orta-reward');
    const b3 = document.getElementById('badge-custom-zor-reward');
    if (b1) b1.innerText = `+${Math.round(10 * mult)} ${t('label_gold')}`;
    if (b2) b2.innerText = `+${Math.round(20 * mult)} ${t('label_gold')}`;
    if (b3) b3.innerText = `+${Math.round(35 * mult)} ${t('label_gold')}`;
  };

  btnNoLimit?.addEventListener('click', () => updateBtns(0));
  btn7m?.addEventListener('click', () => updateBtns(420));
  btn3m?.addEventListener('click', () => updateBtns(180));
};
setupCustomTimeButtons();

// Serbest Mod Zorluk Kartları Tıklama Dinleyicileri (#btn-custom-basit, #btn-custom-orta, #btn-custom-zor)
document.getElementById('btn-custom-basit')?.addEventListener('click', () => {
  const userLvl = UserManager.getVariantLevel(selectedCustomVariant);
  startGame(userLvl, 'basit', undefined, undefined, selectedCustomVariant, true, selectedCustomTimeSec);
});

document.getElementById('btn-custom-orta')?.addEventListener('click', () => {
  const userLvl = Math.max(301, UserManager.getVariantLevel(selectedCustomVariant));
  startGame(userLvl, 'orta', undefined, undefined, selectedCustomVariant, true, selectedCustomTimeSec);
});

document.getElementById('btn-custom-zor')?.addEventListener('click', () => {
  const userLvl = Math.max(701, UserManager.getVariantLevel(selectedCustomVariant));
  startGame(userLvl, 'zor', undefined, undefined, selectedCustomVariant, true, selectedCustomTimeSec);
});

// Bilgilendirme Modalı (ℹ️) Dinleyicileri
document.getElementById('btn-custom-info')?.addEventListener('click', () => {
  UIManager.showRulesAndScoringModal('custom');
});

document.getElementById('btn-arena-info')?.addEventListener('click', () => {
  UIManager.showRulesAndScoringModal('arena');
});

// Düello Arenası Disiplin Seçici Dinleyicileri
let selectedArenaVariant: SudokuVariant = 'classic';

(['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(v => {
  document.getElementById(`arena-variant-${v}`)?.addEventListener('click', () => {
    selectedArenaVariant = v;
    (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(other => {
      const btn = document.getElementById(`arena-variant-${other}`);
      if (btn) {
        if (other === v) {
          btn.className = "arena-variant-btn p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";
        } else {
          btn.className = "arena-variant-btn p-1.5 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";
        }
      }
    });

    const badge = document.getElementById('arena-variant-multiplier-badge');
    const descEl = document.getElementById('arena-variant-rule-desc');
    const mults: Record<SudokuVariant, string> = { classic: '1.0x', wordoku: '1.2x', irregular: '1.5x', killer: '1.8x', samurai: '2.5x' };
    if (badge) badge.innerText = t('pts_multiplier', { mult: mults[v] || '1.0x' });
    if (descEl) descEl.innerText = getRuleDescription(v);
  });
});

// AI Bot Karakterleri & Eşleşme Mantığı
let currentArenaDiff: 'basit' | 'orta' | 'zor' = 'basit';
let arenaUnsubLobby: (() => void) | null = null;

const startBotMatch = (bot: BotCharacter) => {
  UIManager.toggleModal('match-search-modal', false);

  const currentUsername = UserManager.getUsername() || 'Oyuncu';
  const currentUid = auth.currentUser ? auth.currentUser.uid : `user_${Date.now()}`;
  const generated = SudokuGen.generateVariant(bot.difficulty, selectedArenaVariant);

  const matchData: MatchState = {
    matchId: `match_${Date.now()}`,
    difficulty: bot.difficulty,
    variant: selectedArenaVariant,
    durationSec: selectedMatchTimeSec,
    puzzle: generated.puzzle,
    solution: generated.solution,
    status: 'in_progress',
    player1: {
      uid: currentUid,
      username: currentUsername,
      isBot: false,
      progress: 0,
      errors: 0
    },
    player2: {
      uid: bot.id,
      username: `${bot.avatar} ${bot.name} (${bot.title})`,
      isBot: true,
      progress: 0,
      errors: 0
    }
  };

  startGame(bot.level, bot.difficulty, matchData, undefined, selectedArenaVariant);

  const enemyName = `${bot.avatar} ${bot.name}`;
  MatchEngine.startBotAI(bot.difficulty, async (botProgress) => {
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
  }, bot.speedMs);
};

const startSimulatedMatch = (targetPlayer: Player) => {
  UIManager.toggleModal('match-search-modal', false);

  const currentUsername = UserManager.getUsername() || 'Oyuncu';
  const currentUid = auth.currentUser ? auth.currentUser.uid : `user_${Date.now()}`;
  const generated = SudokuGen.generateVariant(currentArenaDiff, selectedArenaVariant);

  const matchData: MatchState = {
    matchId: `match_${Date.now()}`,
    difficulty: currentArenaDiff,
    variant: selectedArenaVariant,
    durationSec: selectedMatchTimeSec,
    puzzle: generated.puzzle,
    solution: generated.solution,
    status: 'in_progress',
    player1: {
      uid: currentUid,
      username: currentUsername,
      isBot: false,
      progress: 0,
      errors: 0
    },
    player2: {
      uid: targetPlayer.uid || `sim_${targetPlayer.username}`,
      username: `${targetPlayer.avatar || '🎮'} ${targetPlayer.username} (${targetPlayer.title || 'Çırak'})`,
      isBot: true,
      progress: 0,
      errors: 0
    }
  };

  startGame(targetPlayer.level || 1, currentArenaDiff, matchData, undefined, selectedArenaVariant);

  const enemyName = `${targetPlayer.avatar || '🎮'} ${targetPlayer.username}`;
  const simSpeed = currentArenaDiff === 'basit' ? 3200 : currentArenaDiff === 'orta' ? 2400 : 1800;

  MatchEngine.startBotAI(currentArenaDiff, async (botProgress) => {
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
  }, simSpeed);
};

const loadArenaLobbyPlayers = () => {
  if (arenaUnsubLobby) arenaUnsubLobby();

  try {
    const q = query(
      collection(db, 'leaderboard'),
      limit(30)
    );
    arenaUnsubLobby = onSnapshot(q, (snap) => {
      const list: Player[] = [];
      const myUsername = UserManager.getUsername();
      snap.docs.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.username !== myUsername) {
          const level = typeof d.level === 'number' ? d.level : 1;
          const wins = typeof d.duel_wins === 'number' ? d.duel_wins : 0;
          const mmr = typeof d.duel_mmr === 'number' ? d.duel_mmr : 1000;
          const completed = typeof d.total_completed === 'number' ? d.total_completed : 0;
          const title = UserManager.calculatePlayerTitle(level, wins, mmr, completed);

          list.push({
            uid: d.uid || docSnap.id,
            username: d.username || 'Oyuncu',
            gold: d.gold || 100,
            level,
            avatar: d.avatar || '🎮',
            title,
            duel_wins: wins,
            duel_mmr: mmr,
            total_completed: completed,
            onlineStatus: d.onlineStatus || 'available',
            lastSeenMs: d.lastSeenMs
          } as any);
        }
      });

      // Simüle canlı lobi oyuncularını ekle
      SIMULATED_LOBBY_PLAYERS.forEach(sim => {
        if (!list.some(p => p.username === sim.username)) {
          const title = UserManager.calculatePlayerTitle(sim.level, sim.duel_wins || 0, sim.duel_mmr || 1000, sim.total_completed || 0);
          list.push({ ...sim, title });
        }
      });

      UIManager.renderLobbyPlayers(list, async (targetPlayer) => {
        const modeText = selectedMatchTimeSec > 0 ? `${Math.floor(selectedMatchTimeSec / 60)} Dk` : 'Süresiz';
        UIManager.showToast(`📩 ${targetPlayer.username} davetini inceliyor (${modeText})...`, 'info');

        setTimeout(() => {
          UIManager.showToast(`⚔️ ${targetPlayer.username} davetini kabul etti! Düello başlıyor...`, 'success');
          startSimulatedMatch(targetPlayer);
        }, 1800);
      });
    });
  } catch (e) {
    console.warn("Lobi oyuncuları dinlenemedi:", e);
  }
};

const loadBotCharactersUI = (diff: 'basit' | 'orta' | 'zor') => {
  currentArenaDiff = diff;
  const filtered = BotCharacters.filter(b => b.difficulty === diff);

  ['basit', 'orta', 'zor'].forEach(d => {
    const btn = document.getElementById(`btn-diff-${d}`);
    if (btn) {
      if (d === diff) {
        let bgClass = "bg-emerald-600";
        if (d === 'orta') bgClass = "bg-amber-600";
        if (d === 'zor') bgClass = "bg-rose-600";
        btn.className = `arena-diff-btn flex-1 py-1 rounded-lg font-black text-[10px] transition-all ${bgClass} text-white shadow-sm`;
      } else {
        btn.className = "arena-diff-btn flex-1 py-1 rounded-lg font-bold text-[10px] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent bg-transparent";
      }
    }
  });

  UIManager.renderBotCharacters(filtered, (selectedBot) => startBotMatch(selectedBot));
};

// Arena Sekme Değişim Dinleyicileri
document.getElementById('tab-arena-lobby')?.addEventListener('click', () => {
  document.getElementById('section-arena-lobby')?.classList.remove('hidden');
  document.getElementById('section-arena-lobby')?.classList.add('flex');
  document.getElementById('section-arena-bots')?.classList.add('hidden');
  document.getElementById('section-arena-bots')?.classList.remove('flex');

  const tabLobby = document.getElementById('tab-arena-lobby');
  const tabBots = document.getElementById('tab-arena-bots');
  if (tabLobby) tabLobby.className = "flex-1 py-2 rounded-xl font-black text-xs transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex items-center justify-center gap-1.5";
  if (tabBots) tabBots.className = "flex-1 py-2 rounded-xl font-bold text-xs transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent flex items-center justify-center gap-1.5";
  loadArenaLobbyPlayers();
});

document.getElementById('tab-arena-bots')?.addEventListener('click', () => {
  document.getElementById('section-arena-bots')?.classList.remove('hidden');
  document.getElementById('section-arena-bots')?.classList.add('flex');
  document.getElementById('section-arena-lobby')?.classList.add('hidden');
  document.getElementById('section-arena-lobby')?.classList.remove('flex');

  const tabLobby = document.getElementById('tab-arena-lobby');
  const tabBots = document.getElementById('tab-arena-bots');
  if (tabBots) tabBots.className = "flex-1 py-2 rounded-xl font-black text-xs transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex items-center justify-center gap-1.5";
  if (tabLobby) tabLobby.className = "flex-1 py-2 rounded-xl font-bold text-xs transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent flex items-center justify-center gap-1.5";
  loadBotCharactersUI(currentArenaDiff);
});

document.getElementById('btn-diff-basit')?.addEventListener('click', () => loadBotCharactersUI('basit'));
document.getElementById('btn-diff-orta')?.addEventListener('click', () => loadBotCharactersUI('orta'));
document.getElementById('btn-diff-zor')?.addEventListener('click', () => loadBotCharactersUI('zor'));

// Modal: Düello / Maç Açılışı
document.getElementById('btn-open-match')?.addEventListener('click', () => {
  UIManager.toggleModal('match-search-modal', true);
  loadArenaLobbyPlayers();
  loadBotCharactersUI(currentArenaDiff);
});

document.getElementById('close-match-search')?.addEventListener('click', () => {
  if (arenaUnsubLobby) {
    arenaUnsubLobby();
    arenaUnsubLobby = null;
  }
  MatchEngine.clearActiveMatch();
  const box = document.getElementById('match-search-status-box');
  if (box) box.classList.add('hidden');
  UIManager.toggleModal('match-search-modal', false);
});

document.getElementById('btn-quick-online-match')?.addEventListener('click', () => {
  startMatchWithDiff(currentArenaDiff);
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
        btn.className = "match-time-btn flex-1 py-1 rounded-lg font-black text-[10px] transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex items-center justify-center gap-1";
      } else {
        btn.className = "match-time-btn flex-1 py-1 rounded-lg font-bold text-[10px] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent bg-transparent flex items-center justify-center gap-1";
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
      startGame(1, diff, match, undefined, selectedArenaVariant);
    },
    (statusText) => {
      if (textEl) textEl.innerText = statusText;
    },
    selectedArenaVariant
  );
};

// Ana Menü Buton Bağlantıları & Kayıtlı Oyunu Sürdürme
document.getElementById('btn-continue-game')?.addEventListener('click', () => {
    const saved = localStorage.getItem('sudoku_saved_game');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        startGame(parsed.level, parsed.diff, undefined, parsed, parsed.variant || 'classic');
        UIManager.showToast("▶ Kayıtlı oyuna devam ediliyor!", "success");
        return;
      } catch {
        clearCurrentSavedGame();
      }
    }
    const userLvl = UserManager.getCurrentLevel();
    const diff = SudokuGen.getDifficulty(userLvl);
    startGame(userLvl, diff, undefined, undefined, 'classic');
});

document.getElementById('btn-delete-saved-game')?.addEventListener('click', (e) => {
  e.stopPropagation();
  clearCurrentSavedGame();
  UIManager.showToast("🗑️ Kayıtlı oyun sıfırlandı.", "info");
});

document.getElementById('btn-new-game')?.addEventListener('click', () => {
    UIManager.navigate('custom');
});

// Controller Bağlantıları (Save & Map Controllers)
initSaveController({
  onPlaySavedGame: (record) => {
    startGame(record.level, record.diff, undefined, record, record.variant);
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

// Özel Zorluk Seçim Ekranı Butonları
document.getElementById('btn-back-custom')?.addEventListener('click', () => {
    updateSavedGamesCountUI();
    UIManager.navigate('menu');
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
let currentLeaderboardType: 'level' | 'gold' | 'pvp_mmr' | 'bot_mmr' | 'speed' | 'discipline' = 'level';
let currentLeaderboardVariant: SudokuVariant = 'classic';

const loadLeaderboardData = async () => {
  if (currentLeaderboardType === 'speed') {
    const records = await Leaderboard.fetchFastestRecords('all');
    UIManager.renderLeaderboard(records, 'speed', (p) => openPlayerProfile(p), currentLeaderboardVariant);
  } else if (currentLeaderboardType === 'discipline') {
    const players = await Leaderboard.fetchTopPlayers('level');
    players.sort((a, b) => {
      const scoreA = a.variantScores ? a.variantScores[currentLeaderboardVariant] || 0 : 0;
      const scoreB = b.variantScores ? b.variantScores[currentLeaderboardVariant] || 0 : 0;
      return scoreB - scoreA;
    });
    UIManager.renderLeaderboard(players, 'discipline', (p) => openPlayerProfile(p), currentLeaderboardVariant);
  } else {
    const players = await Leaderboard.fetchTopPlayers(currentLeaderboardType);
    UIManager.renderLeaderboard(players, currentLeaderboardType, (p) => openPlayerProfile(p), currentLeaderboardVariant);
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
  document.getElementById('general-sort-filters')?.classList.add('grid');
  document.getElementById('speed-diff-filters')?.classList.add('hidden');
  document.getElementById('speed-diff-filters')?.classList.remove('flex');

  const tabGold = document.getElementById('btn-tab-gold');
  const tabSpeed = document.getElementById('btn-tab-speed');
  if (tabGold) tabGold.className = "flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm";
  if (tabSpeed) tabSpeed.className = "flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent bg-transparent";
  loadLeaderboardData();
});

document.getElementById('btn-tab-speed')?.addEventListener('click', async () => {
  currentLeaderboardType = 'speed';
  document.getElementById('general-sort-filters')?.classList.add('hidden');
  document.getElementById('general-sort-filters')?.classList.remove('grid');
  document.getElementById('speed-diff-filters')?.classList.remove('hidden');
  document.getElementById('speed-diff-filters')?.classList.add('flex');

  const tabGold = document.getElementById('btn-tab-gold');
  const tabSpeed = document.getElementById('btn-tab-speed');
  if (tabSpeed) tabSpeed.className = "flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm";
  if (tabGold) tabGold.className = "flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent bg-transparent";
  loadLeaderboardData();
});

const updateSortFilterBtns = (activeSort: 'level' | 'gold' | 'pvp_mmr' | 'bot_mmr') => {
  currentLeaderboardType = activeSort;
  const sortBtns = {
    level: document.getElementById('btn-sort-level'),
    gold: document.getElementById('btn-sort-gold'),
    pvp_mmr: document.getElementById('btn-sort-pvp-mmr'),
    bot_mmr: document.getElementById('btn-sort-bot-mmr')
  };

  Object.entries(sortBtns).forEach(([key, btn]) => {
    if (!btn) return;
    if (key === activeSort) {
      btn.className = "py-1.5 text-[10px] font-black rounded-xl bg-[var(--accent-gold)] text-[var(--text-on-gold)] shadow-sm flex items-center justify-center gap-1";
    } else {
      btn.className = "py-1.5 text-[10px] font-bold rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center gap-1";
    }
  });

  loadLeaderboardData();
};

document.getElementById('btn-sort-level')?.addEventListener('click', () => updateSortFilterBtns('level'));
document.getElementById('btn-sort-gold')?.addEventListener('click', () => updateSortFilterBtns('gold'));
document.getElementById('btn-sort-pvp-mmr')?.addEventListener('click', () => updateSortFilterBtns('pvp_mmr'));
document.getElementById('btn-sort-bot-mmr')?.addEventListener('click', () => updateSortFilterBtns('bot_mmr'));

document.querySelectorAll('.speed-filter-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const target = e.currentTarget as HTMLElement;
    const diff = target.getAttribute('data-diff') as any;

    document.querySelectorAll('.speed-filter-btn').forEach(other => {
      if (other === target) {
        other.className = "speed-filter-btn flex-1 py-1 text-[11px] font-black rounded-lg bg-[var(--accent-gold)] text-[var(--text-on-gold)] shadow-sm";
      } else {
        other.className = "speed-filter-btn flex-1 py-1 text-[11px] font-bold rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]";
      }
    });

    const records = await Leaderboard.fetchFastestRecords(diff || 'all');
    UIManager.renderLeaderboard(records, 'speed', (p) => openPlayerProfile(p), currentLeaderboardVariant);
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
      openAndRenderShop();
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
      openAndRenderAchievements();
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
