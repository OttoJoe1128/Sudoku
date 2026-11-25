import { SudokuVariant, SudokuGen, GeneratedSudoku, KillerCage } from '../engine/sudoku';
import { UIManager } from '../ui/uiManager';
import { GameEngine } from '../engine/gameEngine';
import { UserManager, computeNextJourneyLevel } from '../store/userState';
import { MatchEngine, MatchState, calculateEloChange } from '../engine/matchEngine';
import { AchievementManager } from '../engine/achievements';
import { saveActiveGameRecord, clearSavedGame, updateSavedGamesCountUI, clearVariantJourneySaves, clearDuelSavedGame, createPlacementActiveGameSave } from './saveController';
import { validateSavedGameRecord } from '../engine/saveValidator';
import { t, getLang } from '../i18n/translations';
import { auth } from '../api/firebase';
import { ExamTier, PlacementExamConfig, getPlacementExamConfig, evaluatePlacementExam, calculateExamProgress } from '../engine/placementEngine';
import { getLevelConfig } from '../engine/rhythmConfig';
import { SoundManager } from '../engine/soundManager';
import { canOfferSecondChance, tryGoldRevive, AdService } from '../services/adService';
import { maybeShowRegionIntroLesson } from './academyController';
import { findSmartHint, SmartHint, formatHintSymbol } from '../engine/hintSolver';
import { AbilityId, ECONOMY_CONFIG, isAbilityReady } from '../engine/abilities';
import {
  BoardMechanicsState,
  createBoardMechanicsState,
  isCellSealed,
  applyValidMoveMechanics,
  applyMistakeMechanics,
  activateOracleEye,
  activateSealBreaker,
  computeFinalRunCrystals,
  repairLastCrackedCrystal
} from '../engine/boardMechanics';
import { updateCrystalDisplays } from './abilitiesController';

let pendingSmartHint: SmartHint | null = null;
let activeBoardMechanics: BoardMechanicsState | null = null;

let currentSolution: number[][];
let userBoard: number[][];
let initialBoard: number[][];
let notesBoard: Set<number>[][];
let selectedCell: { r: number; c: number } | null = null;
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

let noteUndoStack: { r: number; c: number; prevNotes: number[]; gridIdx?: number }[][] = [];

function pushNoteUndoStep(snapshots: { r: number; c: number; prevNotes: number[]; gridIdx?: number }[]): void {
  if (!snapshots || snapshots.length === 0) return;
  noteUndoStack.push(snapshots);
  if (noteUndoStack.length > 30) {
    noteUndoStack.shift();
  }
}

let isMatchMode = false;
let activeMatch: MatchState | null = null;
let matchUserFilled = 0;
let matchEnemyFilled = 0;
let matchTotalEmpty = 30;
let matchTimeRemaining = 180;

let onUpdateGoldDisplayCallback: (() => void) | null = null;
let onReturnToMapCallback: ((variant: SudokuVariant, unlockedLevel?: number) => void) | null = null;

let activeEquippedAbilities: AbilityId[] = [];

export function getGameRuntimeState(): {
  isMatchMode: boolean;
  isNotesMode: boolean;
  currentSolution: number[][];
  initialBoard: number[][];
  userBoard: number[][];
  notesBoard: Set<number>[][];
  equippedAbilities: AbilityId[];
  boardMechanics: BoardMechanicsState | null;
} {
  return { isMatchMode, isNotesMode, currentSolution, initialBoard, userBoard, notesBoard, equippedAbilities: activeEquippedAbilities, boardMechanics: activeBoardMechanics };
}

const getSamuraiCompletionStatuses = () => {
  return samuraiBoards.map(b => {
    let remaining = 0;
    b.userBoard.forEach(row => row.forEach(val => { if (val === 0) remaining++; }));
    const completed = remaining === 0 && b.userBoard.every((row, ri) => row.every((val, ci) => val === b.solution[ri][ci]));
    return { completed, remaining };
  });
};

const applyPendingSmartHint = async (hint: SmartHint) => {
  if (activeBoardMechanics && isCellSealed(activeBoardMechanics, hint.row, hint.col)) {
    UIManager.showToast(t('toast_cell_sealed'), "info");
    pendingSmartHint = null;
    UIManager.hideSmartHintBanner();
    return;
  }

  const isFreeHintFromTreasure = activeBoardMechanics && activeBoardMechanics.freeHintsGranted > 0;
  if (isFreeHintFromTreasure && activeBoardMechanics) {
    activeBoardMechanics.freeHintsGranted -= 1;
  } else {
    const currentGold = UserManager.getGold();
    if (currentGold < 10) {
      return UIManager.showToast(t('toast_insufficient_gold_hint'), "error");
    }

    const newGold = currentGold - 10;
    await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
    if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();
  }

  const targetR = hint.row;
  const targetC = hint.col;
  const correctNum = hint.digit;

  userBoard[targetR][targetC] = correctNum;
  selectedCell = { r: targetR, c: targetC };
  hintsUsed++;

  notesBoard[targetR][targetC].clear();

  if (activeBoardMechanics) {
    const mechRes = applyValidMoveMechanics(activeBoardMechanics, targetR, targetC);
    for (const abId of mechRes.newlyConsumedAbilities) {
      await UserManager.triggerAbilityCooldown(abId);
    }
  }

  if (currentVariant === 'irregular' && currentRegionMap) {
    const currentRegionId = currentRegionMap[targetR][targetC];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (i === targetR || j === targetC || currentRegionMap[i][j] === currentRegionId) {
          notesBoard[i][j].delete(correctNum);
        }
      }
    }
  } else {
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

  pendingSmartHint = null;
  UIManager.hideSmartHintBanner();

  persistCurrentGame();
  if (activeRefreshFn) activeRefreshFn();

  let isWin = false;
  if (currentVariant === 'samurai') {
    const currentDone = userBoard.every((row, ri) => row.every((val, ci) => val === currentSolution[ri][ci]));
    const allDone = samuraiBoards.every(b => b.userBoard.every((row, ri) => row.every((val, ci) => val === b.solution[ri][ci])));

    if (!allDone) {
      if (currentDone) {
        UIManager.showToast(t('samurai_board_done_toast'), "success");
      }
      persistCurrentGame();
      if (activeRefreshFn) activeRefreshFn();
      return;
    }
    isWin = true;
  } else {
    isWin = userBoard.every((row, ri) => row.every((val, ci) => val === currentSolution[ri][ci]));
  }

  if (!isWin) {
    UIManager.showToast(t('toast_hint_placed'), "success");
  } else {
    if (timerInterval) clearInterval(timerInterval);
    clearCurrentSavedGame();

    if (isMatchMode) {
      const reward = currentDifficulty === 'basit' ? 50 : currentDifficulty === 'orta' ? 100 : 200;
      const finalGold = UserManager.getGold() + reward;
      await UserManager.updateProgress(UserManager.getCurrentLevel(), finalGold);
      await UserManager.recordDuelResult(true, !!activeMatch?.player2?.isBot, 25, reward);
      if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();

      AchievementManager.checkAndUnlockBadges({
        level: UserManager.getCurrentLevel(),
        gold: finalGold,
        totalCompleted: UserManager.getTotalCompleted(),
        lastTimeElapsed: timeElapsed,
        lastErrors: errors
      });

      isMatchMode = false;
      MatchEngine.clearActiveMatch();
      UIManager.hideMatchHeader();
      showMatchResult(true, reward, activeMatch?.player2?.username || 'Rakip');
    } else if (isCustomGameMode) {
      let baseReward = currentDifficulty === 'basit' ? 10 : currentDifficulty === 'orta' ? 20 : 35;
      if (currentTimeLimitSec === 180) {
        baseReward = Math.round(baseReward * 1.5);
      }
      const newGold = UserManager.getGold() + baseReward;

      await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
      await UserManager.recordGameCompletion({
        level: currentLevelNumber,
        difficulty: currentDifficulty,
        variant: currentVariant,
        category: 'custom',
        timeElapsed,
        timeFormatted: `${Math.floor(timeElapsed / 60).toString().padStart(2, '0')}:${(timeElapsed % 60).toString().padStart(2, '0')}`,
        errors,
        hintsUsed
      });

      AchievementManager.checkAndUnlockBadges({
        level: UserManager.getCurrentLevel(),
        gold: newGold,
        totalCompleted: UserManager.getTotalCompleted(),
        lastTimeElapsed: timeElapsed,
        lastErrors: errors
      });

      if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();
      UIManager.showToast(t('toast_custom_complete', { variant: currentVariant.toUpperCase(), reward: baseReward }), "success");
      UIManager.navigate('menu');
    } else {
      let baseReward = ECONOMY_CONFIG.mapBaseReward[currentDifficulty];
      const mult = getLevelConfig(currentLevelNumber, currentVariant).rewardMultiplier;
      let reward = Math.round(baseReward * mult);

      let crystalDelta = 0;
      if (activeBoardMechanics) {
        const finalCrystals = computeFinalRunCrystals(activeBoardMechanics, errors, timeElapsed);
        const crystalRes = await UserManager.recordLevelCrystals(currentVariant, currentLevelNumber, finalCrystals, activeBoardMechanics.profile.maxCollectibleCrystals);
        if (crystalRes && crystalRes.delta > 0) {
          crystalDelta = crystalRes.delta;
        }
        if (activeBoardMechanics.sparkBonusGold > 0) {
          reward += activeBoardMechanics.sparkBonusGold;
        }
        updateCrystalDisplays();
      }

      const userLvl = UserManager.getVariantLevel(currentVariant);
      const nextLevel = computeNextJourneyLevel(currentLevelNumber, userLvl);

      await UserManager.updateVariantLevel(currentVariant, nextLevel, reward);
      clearVariantJourneySaves(currentVariant, nextLevel - 1);
      const finalGold = UserManager.getGold();

      if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();

      const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
      const seconds = (timeElapsed % 60).toString().padStart(2, '0');
      await UserManager.recordGameCompletion({
        level: currentLevelNumber,
        difficulty: currentDifficulty,
        variant: currentVariant,
        category: 'map',
        timeElapsed,
        timeFormatted: `${minutes}:${seconds}`,
        errors,
        hintsUsed
      });

      AchievementManager.checkAndUnlockBadges({
        level: nextLevel,
        gold: finalGold,
        totalCompleted: UserManager.getTotalCompleted(),
        lastTimeElapsed: timeElapsed,
        lastErrors: errors
      });

      const crystalSuffix = crystalDelta > 0 ? ` • +${crystalDelta} 💎` : '';
      const isEn = getLang() === 'en';
      const toastMsg = isEn
        ? `🎉 Level ${currentLevelNumber} Completed! Level ${nextLevel} Unlocked! +${reward} 🪙${crystalSuffix}`
        : `🎉 Seviye ${currentLevelNumber} Tamamlandı! Seviye ${nextLevel} Açıldı! +${reward} 🪙${crystalSuffix}`;

      UIManager.showToast(toastMsg, "success");

      if (onReturnToMapCallback) {
        onReturnToMapCallback(currentVariant, nextLevel);
      } else {
        UIManager.navigate('map');
      }
    }
  }
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

const switchSamuraiGrid = (idx: number, shouldFocusCamera: boolean = true) => {
  if (currentVariant !== 'samurai' || !samuraiBoards[idx]) return;

  activeSamuraiIndex = idx;
  const target = samuraiBoards[idx];
  userBoard = target.userBoard;
  initialBoard = target.initialBoard;
  currentSolution = target.solution;
  notesBoard = target.notesBoard;
  selectedCell = null;
  noteUndoStack = [];

  if (shouldFocusCamera) {
    UIManager.focusSamuraiGrid(idx);
  }

  if (activeRefreshFn) activeRefreshFn();
};

const calculateRemainingCounts = (board: number[][]): Map<number, number> => {
  const counts = new Map<number, number>();
  for (let i = 1; i <= 9; i++) counts.set(i, 9);

  board.forEach((row) => {
    row.forEach((val) => {
      if (val >= 1 && val <= 9) {
        const prev = counts.get(val) ?? 9;
        counts.set(val, Math.max(0, prev - 1));
      }
    });
  });

  return counts;
};

let activePlacementExam: PlacementExamConfig | null = null;

export function startPlacementExam(variant: SudokuVariant, tier: ExamTier): void {
  const config = getPlacementExamConfig(variant, tier);
  activePlacementExam = config;
  startGame(config.targetLevel, tier, undefined, undefined, variant, true, config.timeLimitSec);
}

async function finishPlacementExam(completedAll: boolean): Promise<void> {
  if (!activePlacementExam) return;

  const config = activePlacementExam;
  activePlacementExam = null;

  if (timerInterval) clearInterval(timerInterval);

  const { filledByUser, totalInitialEmpty } = calculateExamProgress(config.variant, userBoard, initialBoard, samuraiBoards);
  const currentLvl = UserManager.getVariantLevel(config.variant);

  const res = evaluatePlacementExam({
    variant: config.variant,
    tier: config.tier,
    currentVariantLevel: currentLvl,
    filledByUser,
    totalInitialEmpty,
    errors,
    completedAll,
    timeElapsedSec: timeElapsed,
    timeLimitSec: config.timeLimitSec
  });

  if (res.levelsGained > 0 || res.rewardGold > 0) {
    await UserManager.updateVariantLevel(config.variant, res.assignedLevel, res.rewardGold);
    if (res.levelsGained > 0) {
      clearVariantJourneySaves(config.variant, res.assignedLevel - 1);
      if (res.assignedLevel > 0) {
        createPlacementActiveGameSave(config.variant, res.assignedLevel);
      }
    }
    if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();
  }

  if (completedAll) {
    UserManager.incrementCompletedCategory('map');
    AchievementManager.checkAndUnlockBadges({
      level: res.assignedLevel,
      gold: UserManager.getGold(),
      totalCompleted: UserManager.getTotalCompleted(),
      lastTimeElapsed: timeElapsed,
      lastErrors: errors
    });
  }

  const iconEl = document.getElementById('placement-result-icon');
  const titleEl = document.getElementById('placement-result-title');
  const subtitleEl = document.getElementById('placement-result-subtitle');
  const timeEl = document.getElementById('placement-result-time');
  const errorsEl = document.getElementById('placement-result-errors');
  const rewardEl = document.getElementById('placement-result-reward');

  const isEn = getLang() === 'en';
  let titleText = isEn ? 'Exam Finished' : 'Sınav Tamamlandı';
  if (res.passedFull) titleText = isEn ? 'Exam Passed!' : 'Sınav Başarılı!';
  else if (res.partialAssigned) titleText = isEn ? 'Partial Level Assigned!' : 'Kısmi Seviye Atandı!';

  let subText = isEn
    ? `Completed ${res.completionPercent}% • Level ${res.assignedLevel}`
    : `Tamamlanma: %${res.completionPercent} • Seviye ${res.assignedLevel}`;

  const m = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
  const s = (timeElapsed % 60).toString().padStart(2, '0');

  if (iconEl) iconEl.innerText = res.passedFull ? "🏆" : (res.partialAssigned ? "⭐" : "📊");
  if (titleEl) titleEl.innerText = titleText;
  if (subtitleEl) subtitleEl.innerText = subText;
  if (timeEl) timeEl.innerText = `%${res.completionPercent} (${m}:${s})`;
  if (errorsEl) errorsEl.innerText = `${errors} / 3`;
  if (rewardEl) rewardEl.innerText = `+${res.rewardGold} ${t('label_gold')}`;

  UIManager.toggleModal('placement-result-modal', true);

  const primaryBtn = document.getElementById('btn-placement-action-primary');
  const secondaryBtn = document.getElementById('btn-placement-action-secondary');

  if (primaryBtn) {
    primaryBtn.onclick = () => {
      UIManager.toggleModal('placement-result-modal', false);
      if (onReturnToMapCallback) {
        onReturnToMapCallback(config.variant, res.assignedLevel);
      } else {
        UIManager.navigate('map');
      }
    };
  }

  if (secondaryBtn) {
    secondaryBtn.onclick = () => {
      UIManager.toggleModal('placement-result-modal', false);
      UIManager.navigate('menu');
    };
  }
}

const persistCurrentGame = () => {
  if (activePlacementExam) return;
  const mechanicsSnapshot = activeBoardMechanics ? {
    oracleChargesLeft: activeBoardMechanics.oracleChargesLeft,
    shieldChargesLeft: activeBoardMechanics.shieldChargesLeft,
    sealBreakerChargesLeft: activeBoardMechanics.sealBreakerChargesLeft,
    consumedAbilities: [...activeBoardMechanics.consumedAbilities],
    firstMoveMade: activeBoardMechanics.firstMoveMade,
    crackedCrystals: activeBoardMechanics.crackedCrystals ? activeBoardMechanics.crackedCrystals.map(c => ({ r: c.r, c: c.c })) : [],
    freeHintsGranted: activeBoardMechanics.freeHintsGranted,
    errorShieldsGranted: activeBoardMechanics.errorShieldsGranted
  } : undefined;

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
    activeSamuraiIndex: currentVariant === 'samurai' ? activeSamuraiIndex : undefined,
    equippedAbilities: activeEquippedAbilities,
    mechanicsSnapshot,
    matchData: activeMatch,
    enemyName: activeMatch?.player2?.username
  });
};

const clearCurrentSavedGame = () => {
  clearSavedGame(currentVariant, currentLevelNumber, activeMatch?.matchId);
  updateSavedGamesCountUI();
};

const startTimer = (limitSeconds: number = 0) => {
  if (timerInterval) clearInterval(timerInterval);
  matchTimeRemaining = limitSeconds;

  timerInterval = setInterval(() => {
    timeElapsed++;

    if (activeBoardMechanics) {
      UIManager.updateMechanicsLiveTimers(activeBoardMechanics, timeElapsed);
    }

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

    if (!isMatchMode && timeElapsed % 5 === 0) {
      persistCurrentGame();
    }
  }, 1000);
};

const showMatchResult = (isWin: boolean, rewardGold: number, enemyName: string) => {
  const iconEl = document.getElementById('match-result-icon');
  const titleEl = document.getElementById('match-result-title');
  const subtitleEl = document.getElementById('match-result-subtitle');
  const timeEl = document.getElementById('match-result-time');
  const errorsEl = document.getElementById('match-result-errors');
  const rewardEl = document.getElementById('match-result-reward');

  const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
  const seconds = (timeElapsed % 60).toString().padStart(2, '0');

  if (iconEl) iconEl.innerText = isWin ? "🏆" : "💔";
  if (titleEl) titleEl.innerText = isWin ? t('match_result_win') : t('match_result_loss');
  if (subtitleEl) subtitleEl.innerText = isWin ? `${enemyName} ${t('match_result_sub')}` : t('match_result_loss_sub', { enemy: enemyName });
  if (timeEl) timeEl.innerText = `${minutes}:${seconds}`;
  if (errorsEl) errorsEl.innerText = `${errors} / 3`;
  if (rewardEl) rewardEl.innerText = isWin ? `+${rewardGold} 🪙` : "0 🪙";

  UIManager.toggleModal('match-result-modal', true);
};

const handleMatchTimeExpired = async () => {
  if (activePlacementExam) {
    await finishPlacementExam(false);
    return;
  }

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
      if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();
      showMatchResult(true, reward, enemyName);
    } else if (matchUserFilled < matchEnemyFilled) {
      await UserManager.recordDuelResult(false);
      showMatchResult(false, 0, enemyName);
    } else {
      UIManager.showToast(t('toast_tie_time'), "info");
      UIManager.navigate('menu');
    }
  } else if (isCustomGameMode) {
    if (timerInterval) clearInterval(timerInterval);
    clearCurrentSavedGame();
    UIManager.showToast(t('time_expired_custom_toast'), "error");
    UIManager.navigate('menu');
  }
};

export async function handleBotMatchProgress(botProgress: number, enemyName: string): Promise<void> {
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

export async function handleExitGameRequest(): Promise<boolean> {
  pendingSmartHint = null;
  noteUndoStack = [];
  UIManager.hideSmartHintBanner();

  if (activePlacementExam) {
    await finishPlacementExam(false);
    UIManager.hideSamuraiSpace();
    activeRefreshFn = null;
    return true;
  }

  if (isMatchMode && activeMatch && activeMatch.durationSec === 0) {
    persistCurrentGame();
    isMatchMode = false;
    MatchEngine.clearActiveMatch();
    UIManager.hideMatchHeader();
    activeRefreshFn = null;
    if (timerInterval) clearInterval(timerInterval);
    UIManager.hideSamuraiSpace();
    UIManager.navigate('menu');
    UIManager.showToast(t('toast_exit_unlimited_duel'), "info");
    return true;
  }

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
          if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();

          isMatchMode = false;
          MatchEngine.clearActiveMatch();
          UIManager.hideMatchHeader();
          UIManager.navigate('menu');
          UIManager.showToast(t('toast_forfeit_duel'), "error");
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
  activeBoardMechanics = null;
  UIManager.updateHintButtonLabel(0);
  UIManager.renderGameMechanicsBar(null, { onUseOracle: () => {}, onUseSealBreaker: () => {} });
  if (timerInterval) clearInterval(timerInterval);
  UIManager.hideSamuraiSpace();
  UIManager.navigate('menu');
  return true;
}

export function startGame(
  level: number,
  diff: 'basit' | 'orta' | 'zor',
  matchData?: MatchState,
  restoredState?: any,
  variant: SudokuVariant = 'classic',
  isCustom: boolean = false,
  customTimeLimitSec: number = 0,
  equippedAbilities: AbilityId[] = []
) {
  activeEquippedAbilities = equippedAbilities;
  if (timerInterval) clearInterval(timerInterval);
  UIManager.hideSamuraiSpace();

  pendingSmartHint = null;
  UIManager.hideSmartHintBanner();

  isMatchMode = !!matchData;
  activeMatch = matchData || null;

  let resolvedRestoredState = restoredState;
  if (!resolvedRestoredState && !matchData && !isCustom) {
    try {
      const saveKey = `sudoku_map_save_${variant}_${level}`;
      const rawSave = localStorage.getItem(saveKey);
      if (rawSave) {
        const parsed = JSON.parse(rawSave);
        if (validateSavedGameRecord(parsed)) {
          resolvedRestoredState = parsed;
        } else {
          localStorage.removeItem(saveKey);
        }
      }
    } catch {
      // ignore
    }
  }

  if (resolvedRestoredState && resolvedRestoredState.isMatchMode && resolvedRestoredState.matchData) {
    isMatchMode = true;
    activeMatch = resolvedRestoredState.matchData;
  }

  currentDifficulty = diff;
  currentVariant = variant;
  currentLevelNumber = level;
  isCustomGameMode = isCustom;
  currentTimeLimitSec = resolvedRestoredState?.timeLimitSec ?? (matchData ? (matchData.durationSec || 0) : customTimeLimitSec);
  noteUndoStack = [];

  UserManager.setPresence(isMatchMode ? 'in_duel' : 'in_game');

  const isValidRestored = !!(
    resolvedRestoredState &&
    Array.isArray(resolvedRestoredState.userBoard) && resolvedRestoredState.userBoard.length === 9 &&
    Array.isArray(resolvedRestoredState.initialBoard) && resolvedRestoredState.initialBoard.length === 9 &&
    Array.isArray(resolvedRestoredState.currentSolution) && resolvedRestoredState.currentSolution.length === 9
  );

  if (isValidRestored) {
    if (Array.isArray(resolvedRestoredState.equippedAbilities) && resolvedRestoredState.equippedAbilities.length > 0) {
      equippedAbilities = resolvedRestoredState.equippedAbilities;
      activeEquippedAbilities = equippedAbilities;
    }
    currentVariant = resolvedRestoredState.variant || variant;
    currentLevelNumber = resolvedRestoredState.level || level;
    currentDifficulty = resolvedRestoredState.diff || diff;
    userBoard = resolvedRestoredState.userBoard.map((row: number[]) => [...row]);
    initialBoard = resolvedRestoredState.initialBoard.map((row: number[]) => [...row]);
    currentSolution = resolvedRestoredState.currentSolution.map((row: number[]) => [...row]);
    errors = typeof resolvedRestoredState.errors === 'number' ? resolvedRestoredState.errors : 0;
    timeElapsed = typeof resolvedRestoredState.timeElapsed === 'number' ? resolvedRestoredState.timeElapsed : 0;
    hintsUsed = 0;
    selectedCell = null;
    isNotesMode = false;
    currentRegionMap = resolvedRestoredState.regionMap;
    currentCages = resolvedRestoredState.cages;

    notesBoard = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => {
        const raw = resolvedRestoredState.notesBoard && resolvedRestoredState.notesBoard[r] && resolvedRestoredState.notesBoard[r][c];
        return new Set<number>(Array.isArray(raw) ? raw : []);
      })
    );

    if (currentVariant === 'samurai' && resolvedRestoredState.samuraiBoards) {
      activeSamuraiIndex = resolvedRestoredState.activeSamuraiIndex || 0;
      samuraiBoards = resolvedRestoredState.samuraiBoards.map((b: any) => ({
        userBoard: b.userBoard,
        initialBoard: b.initialBoard,
        solution: b.solution,
        notesBoard: Array.from({ length: 9 }, (_, r) =>
          Array.from({ length: 9 }, (_, c) => {
            const raw = b.notesBoard && b.notesBoard[r] && b.notesBoard[r][c];
            return new Set<number>(Array.isArray(raw) ? raw : []);
          })
        )
      }));
      const activeBoard = samuraiBoards[activeSamuraiIndex];
      userBoard = activeBoard.userBoard;
      initialBoard = activeBoard.initialBoard;
      currentSolution = activeBoard.solution;
      notesBoard = activeBoard.notesBoard;
    } else {
      samuraiBoards = [];
    }
  } else {
    errors = 0;
    hintsUsed = 0;
    timeElapsed = 0;
    selectedCell = null;
    isNotesMode = false;

    if (isMatchMode && matchData) {
      currentVariant = matchData.variant || variant;
      currentDifficulty = matchData.difficulty || diff;
      currentRegionMap = matchData.regionMap;
      currentCages = matchData.cages;
      userBoard = matchData.puzzle.map(row => [...row]);
      initialBoard = matchData.puzzle.map(row => [...row]);
      currentSolution = matchData.solution.map(row => [...row]);
      activeGeneratedSudoku = null;
      samuraiBoards = [];
    } else {
      const isJourneyMode = !isMatchMode && !isCustomGameMode && !activePlacementExam;
      const generated = isJourneyMode
        ? SudokuGen.generateForLevel(currentLevelNumber, currentVariant)
        : SudokuGen.generateVariant(diff, currentVariant);

      activeGeneratedSudoku = generated;
      currentRegionMap = generated.regionMap;
      currentCages = generated.cages;

      if (currentVariant === 'samurai' && generated.samuraiGrids) {
        activeSamuraiIndex = 0;
        samuraiBoards = generated.samuraiGrids.map(gridObj => ({
          userBoard: gridObj.puzzle.map(row => [...row]),
          initialBoard: gridObj.puzzle,
          solution: gridObj.solution,
          notesBoard: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()))
        }));

        const activeBoard = samuraiBoards[0];
        userBoard = activeBoard.userBoard;
        initialBoard = activeBoard.initialBoard;
        currentSolution = activeBoard.solution;
        notesBoard = activeBoard.notesBoard;
      } else {
        userBoard = generated.puzzle.map(row => [...row]);
        initialBoard = generated.puzzle;
        currentSolution = generated.solution;
        samuraiBoards = [];
      }
    }

    if (currentVariant !== 'samurai') {
      notesBoard = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => new Set<number>())
      );
    }
  }

  if (!isMatchMode && !isCustomGameMode && !activePlacementExam) {
    activeBoardMechanics = createBoardMechanicsState(
      initialBoard || [],
      currentLevelNumber,
      currentVariant,
      equippedAbilities,
      UserManager.getAbilitiesState()
    );

    if (isValidRestored && activeBoardMechanics) {
      activeBoardMechanics.cells.forEach(cell => {
        if (userBoard && userBoard[cell.r] && userBoard[cell.r][cell.c] !== 0) {
          if (cell.kind === 'crystal' && cell.state === 'active') {
            cell.state = 'collected';
            activeBoardMechanics!.crystalsEarnedInRun += 1;
          } else if (cell.kind === 'key' && cell.state === 'active') {
            cell.state = 'collected';
            const seal = activeBoardMechanics!.cells.find(s => s.kind === 'seal' && s.pairId === cell.pairId && s.state === 'active');
            if (seal) {
              seal.state = 'unlocked';
            }
          } else if ((cell.kind === 'spark' || cell.kind === 'treasure') && cell.state === 'active') {
            cell.state = 'collected';
          }
        }
      });
    }

    if (activeBoardMechanics) {
      // Adım A (Kayıtlı snapshot geri yükleme)
      if (isValidRestored && resolvedRestoredState && resolvedRestoredState.mechanicsSnapshot) {
        const ms = resolvedRestoredState.mechanicsSnapshot;
        if (typeof ms.oracleChargesLeft === 'number') activeBoardMechanics.oracleChargesLeft = ms.oracleChargesLeft;
        if (typeof ms.shieldChargesLeft === 'number') activeBoardMechanics.shieldChargesLeft = ms.shieldChargesLeft;
        if (typeof ms.sealBreakerChargesLeft === 'number') activeBoardMechanics.sealBreakerChargesLeft = ms.sealBreakerChargesLeft;
        if (Array.isArray(ms.consumedAbilities)) activeBoardMechanics.consumedAbilities = [...ms.consumedAbilities];
        if (typeof ms.firstMoveMade === 'boolean') activeBoardMechanics.firstMoveMade = ms.firstMoveMade;
        if (typeof ms.freeHintsGranted === 'number') activeBoardMechanics.freeHintsGranted = ms.freeHintsGranted;
        if (typeof ms.errorShieldsGranted === 'number') activeBoardMechanics.errorShieldsGranted = ms.errorShieldsGranted;
        if (Array.isArray(ms.crackedCrystals)) {
          activeBoardMechanics.crackedCrystals = ms.crackedCrystals.map((c: { r: number; c: number }) => ({ r: c.r, c: c.c }));
          activeBoardMechanics.crackedCrystals.forEach(cc => {
            const cell = activeBoardMechanics!.cells.find(c => c.r === cc.r && c.c === cc.c);
            if (cell) {
              cell.state = 'cracked';
            }
          });
        }
      }

      // Adım B (MUTLAK KÜRESEL COOLDOWN KİLİDİ — Her oyun ve her kayıt için her zaman çalışır!)
      const globalAbilities = UserManager.getAbilitiesState();
      activeBoardMechanics.equippedAbilities.forEach(id => {
        const prog = globalAbilities[id];
        if (!isAbilityReady(prog, id)) {
          if (id === 'oracle_eye') activeBoardMechanics!.oracleChargesLeft = 0;
          if (id === 'crystal_shield') activeBoardMechanics!.shieldChargesLeft = 0;
          if (id === 'seal_breaker') activeBoardMechanics!.sealBreakerChargesLeft = 0;
          if (!activeBoardMechanics!.consumedAbilities.includes(id)) {
            activeBoardMechanics!.consumedAbilities.push(id);
          }
        }
      });
    }
  } else {
    activeBoardMechanics = null;
  }

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

    if (!activeMatch.player2?.isBot) {
      const isP1 = activeMatch.player1.uid === (auth.currentUser ? auth.currentUser.uid : '');
      const myUid = isP1 ? activeMatch.player1.uid : (activeMatch.player2?.uid || '');

      MatchEngine.listenMatchUpdates(activeMatch.matchId, async (updatedMatch) => {
        if (updatedMatch.status === 'completed' && updatedMatch.forfeitBy && isMatchMode) {
          if (updatedMatch.winnerUid === myUid) {
            if (timerInterval) clearInterval(timerInterval);
            isMatchMode = false;
            MatchEngine.clearActiveMatch();
            UIManager.hideMatchHeader();

            const rewardGold = 50;
            const gainedMmr = 30;
            await UserManager.recordDuelResult(true, false, gainedMmr, rewardGold);
            if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();
            UIManager.showToast(t('toast_enemy_forfeit', { gold: rewardGold }), "success");
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

  const hintBtnEl = document.getElementById('btn-hint');
  if (hintBtnEl) {
    if (activePlacementExam) {
      hintBtnEl.classList.add('hidden');
    } else {
      hintBtnEl.classList.remove('hidden');
    }
  }

  const title = document.getElementById('game-title');
  if (title) {
    if (isMatchMode) {
      title.innerText = t('duel_diff_title', { diff: t('diff_' + diff).toUpperCase() });
    } else if (isCustomGameMode) {
      title.innerText = t('diff_' + diff);
    } else {
      title.innerText = `${t('label_level')} ${level}`;
    }
  }

  const updateErrorUI = () => {
    const errorEl = document.getElementById('game-errors');
    const maxMistakes = activeBoardMechanics ? activeBoardMechanics.profile.maxMistakes : 3;
    if (errorEl) errorEl.innerText = t('game_errors_dynamic', { count: errors, max: maxMistakes });
  };
  updateErrorUI();

  UIManager.navigate('game');
  startTimer(currentTimeLimitSec);

  const refresh = () => {
    if (currentVariant === 'samurai' && samuraiBoards.length === 5) {
      UIManager.renderSamuraiSpace(
        samuraiBoards,
        activeSamuraiIndex,
        selectedCell?.r ?? -1,
        selectedCell?.c ?? -1,
        (clickedGridIdx, r, c) => {
          SoundManager.playTap();
          if (clickedGridIdx !== activeSamuraiIndex) {
            switchSamuraiGrid(clickedGridIdx, false);
          }
          selectedCell = { r, c };
          refresh();
        }
      );
      UIManager.renderSamuraiRadar(activeSamuraiIndex, getSamuraiCompletionStatuses(), (idx) => switchSamuraiGrid(idx, true));
    } else {
      UIManager.hideSamuraiSpace();
      UIManager.renderBoard(
        userBoard,
        (r, c) => {
          SoundManager.playTap();
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
        undefined,
        pendingSmartHint,
        activeBoardMechanics?.cells
      );
      UIManager.hideSamuraiRadar();
    }

    UIManager.renderGameMechanicsBar(activeBoardMechanics, {
      onUseOracle: async () => {
        if (!activeBoardMechanics) return;
        const oracleProg = UserManager.getAbilityProgress('oracle_eye');
        const ready = isAbilityReady(oracleProg, 'oracle_eye');
        const isSameRunSecondaryUse = activeBoardMechanics.consumedAbilities.includes('oracle_eye') && activeBoardMechanics.oracleChargesLeft > 0;
        if (!ready && !isSameRunSecondaryUse) {
          UIManager.showToast(t('toast_ability_no_charges'), "info");
          return;
        }
        const res = activateOracleEye(activeBoardMechanics, userBoard, selectedCell, currentRegionMap);
        if (!res.ok) {
          UIManager.showToast(t('toast_ability_no_charges'), "info");
          return;
        }
        if (res.newlyConsumed) {
          UserManager.triggerAbilityCooldown('oracle_eye');
        }
        const oracleSnapshots: { r: number; c: number; prevNotes: number[]; gridIdx?: number }[] = [];
        res.scannedCells.forEach(sc => {
          const prev = Array.from(notesBoard[sc.r][sc.c]);
          oracleSnapshots.push({ r: sc.r, c: sc.c, prevNotes: prev, gridIdx: currentVariant === 'samurai' ? activeSamuraiIndex : undefined });
          notesBoard[sc.r][sc.c] = new Set(sc.candidates);
        });
        if (oracleSnapshots.length > 0) {
          pushNoteUndoStep(oracleSnapshots);
        }
        UIManager.showToast(t('toast_oracle_scanned'), "success");
        persistCurrentGame();
        refresh();
      },
      onUseSealBreaker: async () => {
        if (!activeBoardMechanics) return;
        const sealProg = UserManager.getAbilityProgress('seal_breaker');
        const ready = isAbilityReady(sealProg, 'seal_breaker');
        const isSameRunSecondaryUse = activeBoardMechanics.consumedAbilities.includes('seal_breaker') && activeBoardMechanics.sealBreakerChargesLeft > 0;
        if (!ready && !isSameRunSecondaryUse) {
          UIManager.showToast(t('toast_no_seal_to_break'), "info");
          return;
        }
        const res = activateSealBreaker(activeBoardMechanics, selectedCell);
        if (!res.ok) {
          UIManager.showToast(t('toast_no_seal_to_break'), "info");
          return;
        }
        if (res.newlyConsumed) {
          UserManager.triggerAbilityCooldown('seal_breaker');
        }
        UIManager.showToast(t('toast_seal_unlocked'), "success");
        persistCurrentGame();
        refresh();
      },
      onOpenRepair: () => {
        UIManager.toggleModal('crystal-repair-modal', true);
      }
    }, timeElapsed);

    UIManager.updateHintButtonLabel(activeBoardMechanics ? activeBoardMechanics.freeHintsGranted : 0);

    UIManager.renderNumpad(
      (num) => handleNumpadInput(num),
      calculateRemainingCounts(userBoard),
      currentVariant === 'wordoku'
    );
  };
  activeRefreshFn = refresh;

  const handleNumpadInput = async (num: number) => {
    if (!selectedCell) return;
    pendingSmartHint = null;
    UIManager.hideSmartHintBanner();
    const { r, c } = selectedCell;

    if (activeBoardMechanics && isCellSealed(activeBoardMechanics, r, c)) {
      UIManager.showToast(t('toast_cell_sealed'), "info");
      return;
    }

    if (userBoard[r][c] !== 0) {
      UIManager.showToast(t('cell_locked_toast'), "info");
      return;
    }

    if (isNotesMode) {
      if (num >= 1 && num <= 9) {
        const prev = Array.from(notesBoard[r][c]);
        pushNoteUndoStep([{ r, c, prevNotes: prev, gridIdx: currentVariant === 'samurai' ? activeSamuraiIndex : undefined }]);
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

    if (activeBoardMechanics && num === currentSolution[r][c]) {
      const mechRes = applyValidMoveMechanics(activeBoardMechanics, r, c);
      for (const abId of mechRes.newlyConsumedAbilities) {
        await UserManager.triggerAbilityCooldown(abId);
      }
      if (mechRes.crystalCollected || mechRes.unlockedSeal || mechRes.treasureReward) {
        SoundManager.vibrate(20);
      }
      if (mechRes.crystalCollected) UIManager.showToast(t('toast_crystal_collected'), "success");
      if (mechRes.unlockedSeal) UIManager.showToast(t('toast_seal_unlocked'), "success");
      if (mechRes.sparkTriggered) UIManager.showToast(t('toast_spark_flow_active'), "info");
      if (mechRes.treasureReward === 'free_hint') UIManager.showToast(t('toast_treasure_free_hint'), "success");
      if (mechRes.treasureReward === 'error_shield') UIManager.showToast(t('toast_treasure_error_shield'), "success");
    }

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

        if (activePlacementExam) {
          await finishPlacementExam(true);
          return;
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
          const finalGold = UserManager.getGold();
          if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();

          AchievementManager.checkAndUnlockBadges({
            level: UserManager.getCurrentLevel(),
            gold: finalGold,
            totalCompleted: UserManager.getTotalCompleted(),
            lastTimeElapsed: timeElapsed,
            lastErrors: errors
          });

          isMatchMode = false;
          MatchEngine.clearActiveMatch();
          UIManager.hideMatchHeader();
          showMatchResult(true, reward, activeMatch?.player2?.username || 'Rakip');
          return;
        }

        if (isCustomGameMode) {
          let baseReward = diff === 'basit' ? 10 : diff === 'orta' ? 20 : 35;
          if (currentTimeLimitSec === 180) {
            baseReward = Math.round(baseReward * 1.5);
          }
          const newGold = UserManager.getGold() + baseReward;

          await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
          await UserManager.recordGameCompletion({
            level,
            difficulty: diff,
            variant: currentVariant,
            category: 'custom',
            timeElapsed,
            timeFormatted: `${Math.floor(timeElapsed / 60).toString().padStart(2, '0')}:${(timeElapsed % 60).toString().padStart(2, '0')}`,
            errors,
            hintsUsed
          });

          AchievementManager.checkAndUnlockBadges({
            level: UserManager.getCurrentLevel(),
            gold: newGold,
            totalCompleted: UserManager.getTotalCompleted(),
            lastTimeElapsed: timeElapsed,
            lastErrors: errors
          });

          if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();
          UIManager.showToast(t('toast_custom_complete', { variant: currentVariant.toUpperCase(), reward: baseReward }), "success");
          UIManager.navigate('menu');
          return;
        }

        let baseReward = ECONOMY_CONFIG.mapBaseReward[diff];
        const mult = getLevelConfig(level, currentVariant).rewardMultiplier;
        let reward = Math.round(baseReward * mult);

        let crystalDelta = 0;
        if (activeBoardMechanics) {
          const finalCrystals = computeFinalRunCrystals(activeBoardMechanics, errors, timeElapsed);
          const crystalRes = await UserManager.recordLevelCrystals(currentVariant, currentLevelNumber, finalCrystals, activeBoardMechanics.profile.maxCollectibleCrystals);
          if (crystalRes && crystalRes.delta > 0) {
            crystalDelta = crystalRes.delta;
          }
          if (activeBoardMechanics.sparkBonusGold > 0) {
            reward += activeBoardMechanics.sparkBonusGold;
          }
          updateCrystalDisplays();
        }

        const userLvl = UserManager.getVariantLevel(currentVariant);
        const nextLevel = computeNextJourneyLevel(level, userLvl);

        await UserManager.updateVariantLevel(currentVariant, nextLevel, reward);
        clearVariantJourneySaves(currentVariant, nextLevel - 1);
        const newGold = UserManager.getGold();

        await UserManager.recordGameCompletion({
          level,
          difficulty: diff,
          variant: currentVariant,
          category: 'map',
          timeElapsed,
          timeFormatted: `${Math.floor(timeElapsed / 60).toString().padStart(2, '0')}:${(timeElapsed % 60).toString().padStart(2, '0')}`,
          errors,
          hintsUsed
        });

        if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();

        AchievementManager.checkAndUnlockBadges({
          level: nextLevel,
          gold: newGold,
          totalCompleted: UserManager.getTotalCompleted(),
          lastTimeElapsed: timeElapsed,
          lastErrors: errors
        });

        const crystalSuffix = crystalDelta > 0 ? ` • +${crystalDelta} 💎` : '';
        const isEn = getLang() === 'en';
        const toastMsg = isEn
          ? `🎉 Level ${level} Completed! Level ${nextLevel} Unlocked! +${reward} 🪙${crystalSuffix}`
          : `🎉 Seviye ${level} Tamamlandı! Seviye ${nextLevel} Açıldı! +${reward} 🪙${crystalSuffix}`;

        UIManager.showToast(toastMsg, "success");

        if (onReturnToMapCallback) {
          onReturnToMapCallback(currentVariant, nextLevel);
        } else {
          UIManager.navigate('map');
        }
      },
      async (errCount) => {
        if (activeBoardMechanics) {
          const mistakeRes = applyMistakeMechanics(activeBoardMechanics, r, c);
          for (const abId of mistakeRes.newlyConsumedAbilities) {
            await UserManager.triggerAbilityCooldown(abId);
          }
          if (mistakeRes.crystalProtectedByShield) {
            UIManager.showToast(t('toast_crystal_shield_saved'), "info");
          } else if (mistakeRes.crystalCracked) {
            UIManager.showToast(t('toast_crystal_cracked'), "error");
          }

          if (mistakeRes.absorbMistake) {
            persistCurrentGame();
            refresh();
            return;
          }
        }

        errors += errCount;
        updateErrorUI();
        persistCurrentGame();
        const maxMistakes = activeBoardMechanics ? activeBoardMechanics.profile.maxMistakes : 3;
        if (errors >= maxMistakes) {
          if (!canOfferSecondChance({ isMatchMode, isPlacementExam: !!activePlacementExam })) {
            if (activePlacementExam) {
              await finishPlacementExam(false);
              return;
            }
            if (timerInterval) clearInterval(timerInterval);
            clearCurrentSavedGame();
            if (isMatchMode) {
              isMatchMode = false;
              MatchEngine.clearActiveMatch();
              UIManager.hideMatchHeader();
              await UserManager.recordDuelResult(false);
              showMatchResult(false, 0, activeMatch?.player2?.username || 'Rakip');
            } else {
              UIManager.showToast(t('toast_game_over'), "error");
              UIManager.navigate('menu');
            }
            return;
          }

          // Journey Map or Custom Mode: Second Chance Flow
          if (timerInterval) clearInterval(timerInterval);

          const promptSecondChance = () => {
            const currentGold = UserManager.getGold();
            const goldBalEl = document.getElementById('revive-gold-balance');
            if (goldBalEl) {
              goldBalEl.innerText = t('sc_gold_balance', { gold: currentGold });
            }

            const btnGold = document.getElementById('btn-revive-gold');
            const btnAd = document.getElementById('btn-revive-ad');
            const btnGiveUp = document.getElementById('btn-revive-giveup');

            if (btnGold) {
              btnGold.onclick = async () => {
                const res = tryGoldRevive(UserManager.getGold());
                if (!res.success) {
                  UIManager.showToast(t('sc_toast_gold_insufficient'), "error");
                  return;
                }

                await UserManager.updateProgress(UserManager.getCurrentLevel(), res.newGold);
                if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();

                const maxMistakes = activeBoardMechanics ? activeBoardMechanics.profile.maxMistakes : 3;
                errors = Math.max(0, maxMistakes - 1);
                updateErrorUI();
                UIManager.toggleModal('second-chance-modal', false);
                persistCurrentGame();
                startTimer(currentTimeLimitSec);
                UIManager.showToast(t('sc_toast_gold_success'), "success");
              };
            }

            if (btnAd) {
              btnAd.onclick = async () => {
                const originalText = btnAd.innerHTML;
                btnAd.innerHTML = `<span class="animate-pulse">${t('sc_ad_loading')}</span>`;
                (btnAd as HTMLButtonElement).disabled = true;

                const res = await AdService.showRewardedReviveAd();

                btnAd.innerHTML = originalText;
                (btnAd as HTMLButtonElement).disabled = false;

                if (res.rewarded) {
                  const maxMistakes = activeBoardMechanics ? activeBoardMechanics.profile.maxMistakes : 3;
                  errors = Math.max(0, maxMistakes - 1);
                  updateErrorUI();
                  UIManager.toggleModal('second-chance-modal', false);
                  persistCurrentGame();
                  startTimer(currentTimeLimitSec);
                  UIManager.showToast(t('sc_toast_ad_success'), "success");
                } else {
                  let msg = t('sc_toast_ad_failed');
                  if (res.reason === 'offline') msg = t('sc_toast_ad_offline');
                  else if (res.reason === 'dismissed') msg = t('sc_toast_ad_dismissed');

                  UIManager.showToast(msg, "error");
                }
              };
            }

            if (btnGiveUp) {
              btnGiveUp.onclick = () => {
                UIManager.toggleModal('second-chance-modal', false);
                clearCurrentSavedGame();
                UIManager.showToast(t('toast_game_over'), "error");
                if (onReturnToMapCallback) {
                  onReturnToMapCallback(currentVariant);
                } else {
                  UIManager.navigate('menu');
                }
              };
            }

            UIManager.toggleModal('second-chance-modal', true);
          };

          promptSecondChance();
        }
      }
    );

    if (success) {
      notesBoard[r][c].clear();

      if (currentVariant === 'irregular' && currentRegionMap) {
        const currentRegionId = currentRegionMap[r][c];
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            if (i === r || j === c || currentRegionMap[i][j] === currentRegionId) {
              notesBoard[i][j].delete(num);
            }
          }
        }
      } else {
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

  const eraseBtn = document.getElementById('btn-erase');
  if (eraseBtn) {
    eraseBtn.onclick = () => {
      if (!selectedCell) return;
      const { r, c } = selectedCell;
      if (userBoard[r][c] !== 0) {
        UIManager.showToast(t('cell_locked_erase_toast'), "info");
        return;
      }
      if (notesBoard[r][c].size > 0) {
        const prev = Array.from(notesBoard[r][c]);
        pushNoteUndoStep([{ r, c, prevNotes: prev, gridIdx: currentVariant === 'samurai' ? activeSamuraiIndex : undefined }]);
        notesBoard[r][c].clear();
        persistCurrentGame();
        refresh();
      }
    };
  }

  const undoBtn = document.getElementById('btn-undo');
  if (undoBtn) {
    undoBtn.onclick = () => {
      if (!noteUndoStack || noteUndoStack.length === 0) {
        UIManager.showToast(t('toast_undo_empty'), "info");
        return;
      }
      const lastStep = noteUndoStack.pop()!;
      lastStep.forEach(item => {
        let targetNotesBoard = notesBoard;
        if (currentVariant === 'samurai' && typeof item.gridIdx === 'number' && samuraiBoards[item.gridIdx]) {
          targetNotesBoard = samuraiBoards[item.gridIdx].notesBoard;
        }
        if (targetNotesBoard && targetNotesBoard[item.r] && targetNotesBoard[item.r][item.c]) {
          targetNotesBoard[item.r][item.c] = new Set(item.prevNotes);
        }
      });
      SoundManager.playTap();
      persistCurrentGame();
      refresh();
    };
  }

  const hintBtn = document.getElementById('btn-hint');
  if (hintBtn) {
    if (activePlacementExam) {
      hintBtn.classList.add('hidden');
    } else {
      hintBtn.classList.remove('hidden');
    }

    hintBtn.onclick = async () => {
      if (pendingSmartHint) {
        await applyPendingSmartHint(pendingSmartHint);
        return;
      }

      if (selectedCell && activeBoardMechanics && isCellSealed(activeBoardMechanics, selectedCell.r, selectedCell.c)) {
        UIManager.showToast(t('toast_cell_sealed'), "info");
        return;
      }

      if (hintsUsed >= 5) {
        return UIManager.showToast(t('toast_hint_limit_reached'), "error");
      }

      const sealedCells = activeBoardMechanics
        ? activeBoardMechanics.cells.filter(c => isCellSealed(activeBoardMechanics!, c.r, c.c)).map(c => ({ r: c.r, c: c.c }))
        : [];

      const hint = findSmartHint(userBoard, currentSolution, {
        preferredCell: selectedCell,
        regionMap: currentRegionMap,
        sealedCells
      });

      if (!hint) {
        return UIManager.showToast(t('toast_no_empty_cells'), "info");
      }

      pendingSmartHint = hint;
      selectedCell = { r: hint.row, c: hint.col };

      let techKey = 'academy_title';
      if (hint.technique === 'naked_single') techKey = 'tech_naked_single';
      else if (hint.technique === 'hidden_single_row') techKey = 'tech_hidden_single';
      else if (hint.technique === 'hidden_single_col') techKey = 'tech_hidden_single';
      else if (hint.technique === 'hidden_single_box') techKey = 'tech_hidden_single';
      else if (hint.technique === 'pointing_deduction') techKey = 'tech_pointing_pairs';
      else techKey = 'tech_crosshatching';

      const techLabel = t(techKey);
      const symbol = formatHintSymbol(hint.digit, currentVariant);
      let reasonText = '';

      if (hint.technique === 'naked_single') {
        reasonText = t('hint_explain_naked_single', { row: hint.row + 1, col: hint.col + 1, val: symbol });
      } else if (hint.technique === 'hidden_single_row') {
        reasonText = t('hint_explain_hidden_single_row', { row: hint.row + 1, val: symbol });
      } else if (hint.technique === 'hidden_single_col') {
        reasonText = t('hint_explain_hidden_single_col', { col: hint.col + 1, val: symbol });
      } else if (hint.technique === 'hidden_single_box') {
        reasonText = t('hint_explain_hidden_single_box', { box: hint.unitIndex + 1, val: symbol });
      } else {
        reasonText = t('hint_explain_fallback', { val: symbol });
      }

      UIManager.showSmartHintBanner(techLabel, reasonText);
      UIManager.showToast(t('hint_step1_toast'), "info");
      refresh();
    };
  }

  refresh();

  if (!isValidRestored && !isMatchMode && !isCustomGameMode && !activePlacementExam) {
    maybeShowRegionIntroLesson(currentLevelNumber);
  }
}

export async function repairActiveCrystalWithGold(): Promise<boolean> {
  if (!activeBoardMechanics || activeBoardMechanics.crackedCrystals.length === 0) return false;
  const currentGold = UserManager.getGold();
  if (currentGold < 15) {
    UIManager.showToast(t('repair_toast_no_gold'), "error");
    return false;
  }
  const newGold = currentGold - 15;
  await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
  if (onUpdateGoldDisplayCallback) onUpdateGoldDisplayCallback();
  repairLastCrackedCrystal(activeBoardMechanics, userBoard);
  UIManager.showToast(t('repair_toast_success'), "success");
  return true;
}

export function repairActiveCrystalWithAd(): boolean {
  if (!activeBoardMechanics || activeBoardMechanics.crackedCrystals.length === 0) return false;
  repairLastCrackedCrystal(activeBoardMechanics, userBoard);
  UIManager.showToast(t('repair_toast_success'), "success");
  return true;
}

export function initGameController(callbacks?: {
  onUpdateGoldDisplay?: () => void;
  onReturnToMap?: (variant: SudokuVariant, unlockedLevel?: number) => void;
}): void {
  if (callbacks?.onUpdateGoldDisplay) {
    onUpdateGoldDisplayCallback = callbacks.onUpdateGoldDisplay;
  }
  if (callbacks?.onReturnToMap) {
    onReturnToMapCallback = callbacks.onReturnToMap;
  }

  document.getElementById('btn-back-menu')?.addEventListener('click', () => {
    handleExitGameRequest();
  });

  document.getElementById('btn-close-match-result')?.addEventListener('click', () => {
    UIManager.toggleModal('match-result-modal', false);
    UIManager.navigate('menu');
  });

  document.getElementById('btn-apply-smart-hint')?.addEventListener('click', async () => {
    if (pendingSmartHint) {
      await applyPendingSmartHint(pendingSmartHint);
    }
  });

  document.getElementById('btn-dismiss-smart-hint')?.addEventListener('click', () => {
    pendingSmartHint = null;
    UIManager.hideSmartHintBanner();
    if (activeRefreshFn) activeRefreshFn();
  });

  document.getElementById('btn-close-crystal-repair')?.addEventListener('click', () => {
    UIManager.toggleModal('crystal-repair-modal', false);
  });

  document.getElementById('btn-repair-crystal-gold')?.addEventListener('click', async () => {
    const ok = await repairActiveCrystalWithGold();
    if (ok) {
      UIManager.toggleModal('crystal-repair-modal', false);
      if (activeRefreshFn) activeRefreshFn();
    }
  });

  document.getElementById('btn-repair-crystal-ad')?.addEventListener('click', async () => {
    const res = await AdService.showRewardedReviveAd();
    if (res.rewarded) {
      repairActiveCrystalWithAd();
      UIManager.toggleModal('crystal-repair-modal', false);
      if (activeRefreshFn) activeRefreshFn();
    } else {
      UIManager.showToast(t('toast_ad_failed'), "error");
    }
  });
}

export function refreshGameLanguageUI(): void {
  const errorEl = document.getElementById('game-errors');
  const maxMistakes = activeBoardMechanics ? activeBoardMechanics.profile.maxMistakes : 3;
  if (errorEl) errorEl.innerText = t('game_errors_dynamic', { count: errors, max: maxMistakes });

  if (activeRefreshFn) {
    activeRefreshFn();
  }
}
