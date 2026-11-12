import { UIManager } from './ui/uiManager';
import { GameEngine } from './engine/gameEngine';
import { SudokuGen } from './engine/sudoku';
import { UserManager } from './store/userState';
import { Leaderboard } from './engine/leaderboard';
import { ShopManager } from './engine/shop';
import { Rewards } from './engine/rewards';
import { AchievementManager } from './engine/achievements';
import confetti from 'canvas-confetti';
import { registerSW } from 'virtual:pwa-register';

// PWA Service Worker kaydı
registerSW({ immediate: true });

UIManager.mountUI();

interface SavedGameState {
  level: number;
  diff: 'basit' | 'orta' | 'zor';
  userBoard: number[][];
  initialBoard: number[][];
  solution: number[][];
  notes?: { [key: string]: number[] };
  timeElapsed: number;
  errors: number;
  hintsUsed: number;
  savedAt: number;
  isPlacement?: boolean;
  targetLevel?: number;
}

let currentSolution: number[][];
let userBoard: number[][];
let initialBoard: number[][];
let currentLevel = 1;
let currentDiff: 'basit' | 'orta' | 'zor' = 'basit';
let selectedCell: { r: number; c: number } | null = null;
let errors = 0;
let hintsUsed = 0;
let timeElapsed = 0;
let timerInterval: ReturnType<typeof setInterval> | null = null;
let isGameActive = false;
let isNotesMode = false;
let userNotes: { [key: string]: number[] } = {};
let refreshBoard = () => {};

// Seviye Belirleme Sınavı (Placement Test) Durumu
let isPlacementMode = false;
let placementTargetDiff: 'basit' | 'orta' | 'zor' = 'orta';
let placementTargetLevel = 301;
let placementTimeLimit = 420; // Orta için 7 dk (420 sn)

// Liderlik Tablosu Durumu
let currentLeaderboardTab: 'gold' | 'speed' = 'gold';
let currentGeneralSort: 'level' | 'gold' = 'level'; // Varsayılan: Seviyeye göre sıralama
let currentSpeedDiff: 'all' | 'basit' | 'orta' | 'zor' = 'all';

// Tahtada kalan rakam sayılarını (1-9) hesapla
const getNumberCounts = (board: number[][]): { [num: number]: number } => {
  const counts: { [num: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  if (!board) return counts;
  board.forEach(row => {
    row.forEach(val => {
      if (val >= 1 && val <= 9) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
  });
  return counts;
};

// Sayı yerleştirildiğinde aynı satır, sütun ve 3x3 kutudaki aday notları temizle
const pruneCandidateNotes = (row: number, col: number, placedNum: number) => {
  delete userNotes[`${row}-${col}`];

  for (let i = 0; i < 9; i++) {
    const rowKey = `${row}-${i}`;
    if (userNotes[rowKey]) {
      userNotes[rowKey] = userNotes[rowKey].filter(n => n !== placedNum);
      if (userNotes[rowKey].length === 0) delete userNotes[rowKey];
    }

    const colKey = `${i}-${col}`;
    if (userNotes[colKey]) {
      userNotes[colKey] = userNotes[colKey].filter(n => n !== placedNum);
      if (userNotes[colKey].length === 0) delete userNotes[colKey];
    }
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const blockKey = `${startRow + r}-${startCol + c}`;
      if (userNotes[blockKey]) {
        userNotes[blockKey] = userNotes[blockKey].filter(n => n !== placedNum);
        if (userNotes[blockKey].length === 0) delete userNotes[blockKey];
      }
    }
  }
};

// Tahtanın tamamen ve doğru şekilde tamamlanıp tamamlanmadığını kontrol eden yardımcı
const isBoardComplete = (board: number[][], solution: number[][]): boolean => {
  if (!board || !solution) return false;
  return board.every((row, ri) =>
    row.every((val, ci) => val !== 0 && val === solution[ri][ci])
  );
};

// --- GÜVENLİ VE KALICI OYUN KAYIT SİSTEMİ ---
const saveCurrentGameState = () => {
  if (!isGameActive || !userBoard || !currentSolution || !initialBoard) return;

  // Eğer tahta tamamlanmışsa asla yarım kalan oyun olarak kaydetme!
  if (isBoardComplete(userBoard, currentSolution)) {
    clearCurrentGameState();
    return;
  }

  const state: SavedGameState = {
    level: currentLevel,
    diff: currentDiff,
    userBoard: userBoard.map(row => [...row]),
    initialBoard: initialBoard.map(row => [...row]),
    solution: currentSolution.map(row => [...row]),
    notes: { ...userNotes },
    timeElapsed,
    errors,
    hintsUsed,
    savedAt: Date.now(),
    isPlacement: isPlacementMode,
    targetLevel: placementTargetLevel
  };
  localStorage.setItem('sudoku_saved_game', JSON.stringify(state));
};

const clearCurrentGameState = () => {
  localStorage.removeItem('sudoku_saved_game');
};

const getSavedGameState = (): SavedGameState | null => {
  try {
    const raw = localStorage.getItem('sudoku_saved_game');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.userBoard) && Array.isArray(parsed.solution)) {
        if (isBoardComplete(parsed.userBoard, parsed.solution)) {
          clearCurrentGameState();
          return null;
        }
        return parsed;
      }
    }
  } catch {
    clearCurrentGameState();
  }
  return null;
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Ana Menüdeki "Devam Et / Sıradaki Seviyeye Başla" Kartını Güncelle
const updateMenuContinueCard = () => {
  const btn = document.getElementById('btn-continue-game') as HTMLButtonElement;
  const deleteBtn = document.getElementById('btn-delete-saved-game') as HTMLButtonElement;
  const title = document.getElementById('continue-game-title');
  const subtitle = document.getElementById('continue-game-subtitle');
  const tag = document.getElementById('continue-tag');
  const dot = document.getElementById('continue-dot');
  if (!btn) return;

  const saved = getSavedGameState();
  const currentLvl = UserManager.getCurrentLevel();
  const nextDiff = SudokuGen.getDifficulty(currentLvl);

  if (saved) {
    // 1. Yarım kalan bir oyun varsa: "Kaldığın Yerden Devam Et" ve silme butonu açık
    btn.disabled = false;
    btn.className = "w-full text-left rounded-2xl p-5 shadow-md active:scale-[0.98] transition-all border flex justify-between items-center group bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 cursor-pointer";
    
    if (saved.isPlacement) {
      if (title) title.innerText = `▶ Sınava Devam Et: ${saved.diff.toUpperCase()}`;
      if (subtitle) subtitle.innerText = `Hedef: Seviye ${saved.targetLevel || 301} • ⏱ ${formatTime(saved.timeElapsed)} • Hata: ${saved.errors}/3`;
      if (tag) tag.innerText = "Yarım Kalan Sınav";
    } else {
      if (title) title.innerText = `▶ Kaldığın Yerden Devam Et`;
      if (subtitle) subtitle.innerText = `Seviye ${saved.level} (${saved.diff.toUpperCase()}) • ⏱ ${formatTime(saved.timeElapsed)} • Hata: ${saved.errors}/5`;
      if (tag) tag.innerText = "Yarım Kalan Oyun";
    }
    if (dot) dot.classList.remove('hidden');

    if (deleteBtn) {
      deleteBtn.classList.remove('hidden');
      deleteBtn.classList.add('flex');
    }
  } else {
    // 2. Yarım kalan oyun yoksa: ASLA DEVRE DIŞI BIRAKMA! Sıradaki seviyeyi oynat
    btn.disabled = false;
    btn.className = "w-full text-left rounded-2xl p-5 shadow-md active:scale-[0.98] transition-all border flex justify-between items-center group bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 cursor-pointer";
    if (title) title.innerText = `▶ Seviye ${currentLvl}'e Başla`;
    if (subtitle) subtitle.innerText = `Mevcut ilerlemen: Seviye ${currentLvl} (${nextDiff.toUpperCase()}) • Hemen oyna!`;
    if (tag) tag.innerText = "Sıradaki Seviye";
    if (dot) dot.classList.remove('hidden');

    if (deleteBtn) {
      deleteBtn.classList.add('hidden');
      deleteBtn.classList.remove('flex');
    }
  }

  // Rozet bildirimi kontrolü
  const badgeStatus = AchievementManager.getAllBadgesWithStatus(currentLvl, UserManager.getGold());
  const hasUnclaimed = badgeStatus.some(b => b.isUnlocked && !b.isClaimed);
  const notifyDot = document.getElementById('badge-notify-dot');
  if (notifyDot) {
    if (hasUnclaimed) notifyDot.classList.remove('hidden');
    else notifyDot.classList.add('hidden');
  }
};

// Günlük Ödül Durumunu Menüde Göster
const updateDailyRewardUI = () => {
  const icon = document.getElementById('daily-reward-icon');
  const text = document.getElementById('daily-reward-text');
  const btn = document.getElementById('btn-daily-reward') as HTMLButtonElement;
  if (!btn || !text || !icon) return;

  if (Rewards.isClaimedToday()) {
    icon.innerText = "✅";
    text.innerText = "Bugün Alındı";
    btn.classList.remove('bg-amber-50', 'border-amber-200');
    btn.classList.add('bg-slate-100', 'border-slate-200', 'opacity-70');
  } else {
    icon.innerText = "🎁";
    text.innerText = "Günlük Ödül";
    btn.classList.add('bg-amber-50', 'border-amber-200');
    btn.classList.remove('bg-slate-100', 'border-slate-200', 'opacity-70');
  }
};

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  const timerEl = document.getElementById('game-timer');
  if (timerEl) timerEl.innerText = formatTime(timeElapsed);

  timerInterval = setInterval(() => {
    if (!isGameActive) {
      if (timerInterval) clearInterval(timerInterval);
      return;
    }
    timeElapsed++;
    if (timerEl) timerEl.innerText = formatTime(timeElapsed);

    // Sınav modu için süre sınırı kontrolü
    if (isPlacementMode && timeElapsed >= placementTimeLimit) {
      handlePlacementFailed('time');
      return;
    }

    if (timeElapsed % 5 === 0) {
      saveCurrentGameState();
    }
  }, 1000);
};

// --- NORMAL ZAFER VE BÖLÜM BİTİRME MANTIĞI ---
const handleVictory = (level: number, diff: 'basit' | 'orta' | 'zor') => {
  // 1. ANINDA OYUNU DURDUR VE KAYDI SİL
  isGameActive = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  clearCurrentGameState();

  const currentLvl = UserManager.getCurrentLevel();
  const nextLevel = Math.max(currentLvl, level + 1);
  const reward = diff === 'basit' ? 10 : diff === 'orta' ? 20 : 35;
  const nextGold = UserManager.getGold() + reward;

  // 2. KULLANICI ARAYÜZÜNÜ ANINDA GÜNCELLE VE ZAFERİ KUTLA (Firebase beklemeden!)
  const goldEl = document.getElementById('menu-gold');
  if (goldEl) goldEl.innerText = nextGold.toString();

  try {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch {
    // ignore
  }

  UIManager.showVictoryModal(level, diff, formatTime(timeElapsed), errors, reward);
  updateMenuContinueCard();
  updateDailyRewardUI();

  // 3. ARKA PLANDA FIREBASE VE ROZETLERİ GÜNCELLE
  (async () => {
    try {
      await UserManager.updateProgress(nextLevel, nextGold);
      await UserManager.recordGameCompletion({
        level,
        difficulty: diff,
        timeElapsed,
        timeFormatted: formatTime(timeElapsed),
        errors,
        hintsUsed
      });
      AchievementManager.checkAndUnlockBadges({
        level: nextLevel,
        gold: nextGold,
        lastTimeElapsed: timeElapsed,
        lastErrors: errors
      });
      updateMenuContinueCard();
    } catch (err) {
      console.warn("Arka plan Firebase senkronizasyon uyarısı:", err);
    }
  })();
};

// --- SEVİYE BELİRLEME SINAVI ZAFERİ ---
const handlePlacementVictory = () => {
  isGameActive = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  clearCurrentGameState();

  const currentLvl = UserManager.getCurrentLevel();
  const finalLevel = Math.max(currentLvl, placementTargetLevel);
  const bonusReward = placementTargetDiff === 'basit' ? 50 : placementTargetDiff === 'orta' ? 150 : 300;
  const nextGold = UserManager.getGold() + bonusReward;

  const goldEl = document.getElementById('menu-gold');
  if (goldEl) goldEl.innerText = nextGold.toString();

  try {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 }
    });
  } catch {
    // ignore
  }

  UIManager.showPlacementResultModal({
    passed: true,
    targetLevel: placementTargetLevel,
    targetDiff: placementTargetDiff,
    timeStr: formatTime(timeElapsed),
    errorCount: errors,
    reward: bonusReward
  });

  updateMenuContinueCard();

  (async () => {
    try {
      await UserManager.updateProgress(finalLevel, nextGold);
      await UserManager.recordGameCompletion({
        level: placementTargetLevel,
        difficulty: placementTargetDiff,
        timeElapsed,
        timeFormatted: formatTime(timeElapsed),
        errors,
        hintsUsed
      });
      AchievementManager.checkAndUnlockBadges({
        level: finalLevel,
        gold: nextGold,
        lastTimeElapsed: timeElapsed,
        lastErrors: errors
      });
      updateMenuContinueCard();
    } catch (err) {
      console.warn("Sınav sonucu Firebase senkronizasyon uyarısı:", err);
    }
  })();
};

// --- SEVİYE BELİRLEME SINAVI BAŞARISIZ OLDUĞUNDA ---
const handlePlacementFailed = (_reason: 'errors' | 'time') => {
  isGameActive = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  clearCurrentGameState();

  UIManager.showPlacementResultModal({
    passed: false,
    targetLevel: placementTargetLevel,
    targetDiff: placementTargetDiff,
    timeStr: formatTime(timeElapsed),
    errorCount: errors,
    reward: 0
  });

  updateMenuContinueCard();
};

// --- 5 HATA SINIRINA ULAŞILDIĞINDA (DEVAM ET YA DA BAŞTAN AL) ---
const handleFiveErrorsReached = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  saveCurrentGameState();
  UIManager.showErrorLimitModal();
};

// İpucu Kullanımı
const useHint = async () => {
  if (!isGameActive || !selectedCell) {
    alert("Lütfen önce doldurmak istediğin kutucuğu seç!");
    return;
  }
  if (userBoard[selectedCell.r][selectedCell.c] === currentSolution[selectedCell.r][selectedCell.c]) {
    alert("Bu kutucuk zaten doğru doldurulmuş.");
    return;
  }
  if (hintsUsed >= 5) {
    alert("Bu oyundaki 5 ipucu hakkını doldurdun!");
    return;
  }
  const currentGold = UserManager.getGold();
  if (currentGold < 10) {
    alert("İpucu almak için en az 10 🪙 gerekiyor!");
    return;
  }

  const newGold = currentGold - 10;
  await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
  const goldEl = document.getElementById('menu-gold');
  if (goldEl) goldEl.innerText = newGold.toString();

  const correctVal = currentSolution[selectedCell.r][selectedCell.c];
  userBoard[selectedCell.r][selectedCell.c] = correctVal;
  pruneCandidateNotes(selectedCell.r, selectedCell.c, correctVal);
  hintsUsed++;
  refreshBoard();

  if (isBoardComplete(userBoard, currentSolution)) {
    if (isPlacementMode) {
      handlePlacementVictory();
    } else {
      handleVictory(currentLevel, currentDiff);
    }
  } else {
    saveCurrentGameState();
  }
};

// Sınav Başlatıcı
const startPlacementTest = (diff: 'basit' | 'orta' | 'zor', targetLevel: number) => {
  isPlacementMode = true;
  placementTargetDiff = diff;
  placementTargetLevel = targetLevel;
  placementTimeLimit = diff === 'basit' ? 300 : diff === 'orta' ? 420 : 600; // 5 dk, 7 dk, 10 dk

  UIManager.toggleModal('placement-modal', false);
  UIManager.hidePlacementResultModal();

  startGame(targetLevel, diff, undefined, true);
};

// Oyunu Başlat veya Kayıtlı Oyundan Sürdür
const startGame = (
  level: number,
  diff: 'basit' | 'orta' | 'zor',
  resumeState?: SavedGameState,
  asPlacement: boolean = false
) => {
  UIManager.hideVictoryModal();
  UIManager.hideGameOverModal();
  UIManager.hideErrorLimitModal();
  UIManager.hidePlacementResultModal();

  currentLevel = level;
  currentDiff = diff;
  selectedCell = null;
  isNotesMode = false;
  UIManager.updateNotesModeUI(isNotesMode);

  if (resumeState) {
    if (isBoardComplete(resumeState.userBoard, resumeState.solution)) {
      clearCurrentGameState();
      updateMenuContinueCard();
      alert(`Seviye ${resumeState.level} zaten tamamlanmış! Yeni bir oyuna başlayabilirsiniz.`);
      UIManager.navigate('menu');
      return;
    }

    isPlacementMode = !!resumeState.isPlacement;
    if (isPlacementMode) {
      placementTargetLevel = resumeState.targetLevel || level;
      placementTargetDiff = diff;
      placementTimeLimit = diff === 'basit' ? 300 : diff === 'orta' ? 420 : 600;
    }

    currentSolution = resumeState.solution;
    userBoard = resumeState.userBoard;
    initialBoard = resumeState.initialBoard;
    userNotes = resumeState.notes ? { ...resumeState.notes } : {};
    timeElapsed = resumeState.timeElapsed;
    errors = resumeState.errors;
    hintsUsed = resumeState.hintsUsed;
  } else {
    isPlacementMode = asPlacement;
    errors = 0;
    hintsUsed = 0;
    timeElapsed = 0;
    userNotes = {};
    const data = SudokuGen.generate(diff);
    currentSolution = data.solution;
    userBoard = data.puzzle.map(row => [...row]);
    initialBoard = data.puzzle.map(row => [...row]);
  }

  isGameActive = true;
  saveCurrentGameState();

  const title = document.getElementById('game-title');
  if (title) {
    if (isPlacementMode) {
      title.innerText = `🎯 Seviye Sınavı: ${diff.toUpperCase()} (Hedef: ${placementTargetLevel})`;
    } else {
      title.innerText = `Seviye ${level} (${diff.toUpperCase()})`;
    }
  }

  const maxAllowedErrors = isPlacementMode ? 3 : 5;
  UIManager.updateErrorCount(errors, maxAllowedErrors);
  UIManager.navigate('game');
  startTimer();

  const handleNumpadClick = (num: number) => {
    if (!isGameActive || !selectedCell) return;

    if (num === -1) {
      useHint();
      return;
    }

    // Aday Not Alma (Pencil / Notes) Modu
    if (isNotesMode) {
      if (initialBoard && initialBoard[selectedCell.r][selectedCell.c] !== 0) return;
      const key = `${selectedCell.r}-${selectedCell.c}`;

      if (num === 0) {
        delete userNotes[key];
        saveCurrentGameState();
        refreshBoard();
        return;
      }

      if (userBoard[selectedCell.r][selectedCell.c] !== 0) {
        return;
      }

      const list = userNotes[key] ? [...userNotes[key]] : [];
      const idx = list.indexOf(num);
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        list.push(num);
        list.sort((a, b) => a - b);
      }

      if (list.length > 0) {
        userNotes[key] = list;
      } else {
        delete userNotes[key];
      }

      saveCurrentGameState();
      refreshBoard();
      return;
    }

    // Normal Sayı Yerleştirme Modu
    const result = GameEngine.processInput(
      selectedCell.r,
      selectedCell.c,
      num,
      userBoard,
      currentSolution,
      () => {
        if (isPlacementMode) {
          handlePlacementVictory();
        } else {
          handleVictory(level, diff);
        }
      },
      (err: number) => {
        errors += err;
        const limit = isPlacementMode ? 3 : 5;
        UIManager.updateErrorCount(errors, limit);

        if (isPlacementMode) {
          if (errors >= 3) {
            handlePlacementFailed('errors');
          } else {
            saveCurrentGameState();
          }
        } else {
          if (errors >= 5) {
            handleFiveErrorsReached();
          } else {
            saveCurrentGameState();
          }
        }
      }
    );

    if (result.won) {
      return;
    }

    if (result.valid) {
      if (num > 0) {
        pruneCandidateNotes(selectedCell.r, selectedCell.c, num);
      }
      saveCurrentGameState();
      refreshBoard();
    }
  };

  refreshBoard = () => {
    UIManager.renderBoard(
      userBoard,
      initialBoard,
      userNotes,
      (r, c) => {
        if (!isGameActive) return;
        if (initialBoard && initialBoard[r][c] !== 0) {
          selectedCell = null;
          refreshBoard();
          return;
        }
        selectedCell = { r, c };
        refreshBoard();
      },
      selectedCell?.r ?? -1,
      selectedCell?.c ?? -1
    );

    UIManager.renderNumpad(handleNumpadClick, getNumberCounts(userBoard));
  };

  refreshBoard();
};

// Tarayıcı kapanırken durumu sadece aktif ve henüz bitmemiş oyun varsa kaydet
window.addEventListener('beforeunload', () => {
  if (isGameActive && userBoard && currentSolution && !isBoardComplete(userBoard, currentSolution)) {
    saveCurrentGameState();
  }
});

// --- BUTON VE MENÜ DİNLENİCİLERİ ---

// İpucu Butonu
document.getElementById('btn-hint')?.addEventListener('click', () => {
  useHint();
});

// Not Alma Modu Butonu
document.getElementById('btn-toggle-notes')?.addEventListener('click', () => {
  if (!isGameActive) return;
  isNotesMode = !isNotesMode;
  UIManager.updateNotesModeUI(isNotesMode);
});

// 1. Devam Et / Sıradaki Seviyeye Başla Butonu
document.getElementById('btn-continue-game')?.addEventListener('click', () => {
  const saved = getSavedGameState();
  if (saved) {
    startGame(saved.level, saved.diff, saved);
  } else {
    const currentLvl = UserManager.getCurrentLevel();
    const currentDiff = SudokuGen.getDifficulty(currentLvl);
    startGame(currentLvl, currentDiff);
  }
});

// Kayıtlı Oyunu Silme / Sıfırlama Butonu
document.getElementById('btn-delete-saved-game')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const saved = getSavedGameState();
  if (!saved) return;

  const infoText = saved.isPlacement
    ? `Sınav kaydını (${saved.diff.toUpperCase()}) silmek istiyor musunuz?`
    : `Seviye ${saved.level} (${saved.diff.toUpperCase()}) yarım kalan oyun kaydını silmek istiyor musunuz?`;

  const onay = confirm(`${infoText}\n\nİlerlemeniz (Seviye ${UserManager.getCurrentLevel()}) ve altınlarınız korunur.`);
  if (onay) {
    clearCurrentGameState();
    updateMenuContinueCard();
  }
});

// 2. Yeni Oyun Başlat Butonu
document.getElementById('btn-new-game')?.addEventListener('click', () => {
  UIManager.navigate('custom');
});

// Yeni Oyun Başlatma Onayı
const requestStartNewGame = (diff: 'basit' | 'orta' | 'zor') => {
  const saved = getSavedGameState();
  if (saved) {
    const onay = confirm(`Kayıtlı bir oyununuz bulunuyor (${saved.isPlacement ? 'Sınav' : `Seviye ${saved.level}`}).\n\nYeni bir oyun başlatırsanız önceki oyun kaydı silinecektir. Devam etmek istiyor musunuz?`);
    if (!onay) return;
  }
  clearCurrentGameState();

  const userLvl = UserManager.getCurrentLevel();
  let lvl = userLvl;
  if (diff === 'basit') lvl = userLvl <= 300 ? userLvl : 1;
  else if (diff === 'orta') lvl = userLvl > 300 && userLvl <= 700 ? userLvl : 301;
  else if (diff === 'zor') lvl = userLvl > 700 ? userLvl : 701;

  startGame(lvl, diff);
};

// Zorluk Seçim Butonları
document.getElementById('btn-start-basit')?.addEventListener('click', () => requestStartNewGame('basit'));
document.getElementById('btn-start-orta')?.addEventListener('click', () => requestStartNewGame('orta'));
document.getElementById('btn-start-zor')?.addEventListener('click', () => requestStartNewGame('zor'));

document.getElementById('btn-back-custom')?.addEventListener('click', () => {
  updateMenuContinueCard();
  updateDailyRewardUI();
  UIManager.navigate('menu');
});

// Oyundan Menüye Dönüş (Tamamlanmamış oyunu kaydeder ve durdurur)
document.getElementById('btn-back-menu')?.addEventListener('click', () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (isGameActive && !isBoardComplete(userBoard, currentSolution)) {
    saveCurrentGameState();
  }
  updateMenuContinueCard();
  updateDailyRewardUI();
  UIManager.navigate('menu');
});

// --- SEVİYE BELİRLEME SINAVI DİNLENİCİLERİ ---
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
  startPlacementTest('basit', 1);
});
document.getElementById('btn-placement-orta')?.addEventListener('click', () => {
  startPlacementTest('orta', 301);
});
document.getElementById('btn-placement-zor')?.addEventListener('click', () => {
  startPlacementTest('zor', 701);
});

// Sınav Sonuç Modalı Aksiyonları
document.getElementById('btn-placement-action-primary')?.addEventListener('click', () => {
  UIManager.hidePlacementResultModal();
  // Geçildiyse hedef seviyeyi normal oyun olarak başlat, geçilemediyse testi tekrar dene
  const currentLvl = UserManager.getCurrentLevel();
  if (currentLvl >= placementTargetLevel) {
    startGame(placementTargetLevel, placementTargetDiff);
  } else {
    startPlacementTest(placementTargetDiff, placementTargetLevel);
  }
});

document.getElementById('btn-placement-action-secondary')?.addEventListener('click', () => {
  UIManager.hidePlacementResultModal();
  updateMenuContinueCard();
  updateDailyRewardUI();
  UIManager.navigate('menu');
});

// --- SUDOKU YOLCULUĞU HARİTASI ---
const openMapView = (focusLevel?: number) => {
  const currentLvl = UserManager.getCurrentLevel();
  const focus = focusLevel || currentLvl;
  UIManager.renderMap(currentLvl, focus);
  UIManager.navigate('map');

  // Haritadaki seviye butonlarını dinle
  const container = document.getElementById('map-nodes');
  if (container) {
    container.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        const lvl = parseInt(btn.dataset.level || '1');
        const diff = SudokuGen.getDifficulty(lvl);
        startGame(lvl, diff);
      };
    });
  }
};

document.getElementById('btn-open-map')?.addEventListener('click', () => openMapView());
document.getElementById('btn-back-map')?.addEventListener('click', () => {
  updateMenuContinueCard();
  updateDailyRewardUI();
  UIManager.navigate('menu');
});

document.getElementById('btn-map-jump-basit')?.addEventListener('click', () => openMapView(1));
document.getElementById('btn-map-jump-orta')?.addEventListener('click', () => openMapView(301));
document.getElementById('btn-map-jump-zor')?.addEventListener('click', () => openMapView(701));

// --- 5 HATA MODAL BUTONLARI ---
document.getElementById('btn-continue-with-gold')?.addEventListener('click', async () => {
  const currentGold = UserManager.getGold();
  if (currentGold < 50) {
    alert(`Devam etmek için 50 🪙 gerekiyor.\nMevcut altınınız: ${currentGold} 🪙.\n\nOyunu baştan başlatabilir veya günlük ödülünüzü alabilirsiniz.`);
    return;
  }

  const newGold = currentGold - 50;
  await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
  const goldEl = document.getElementById('menu-gold');
  if (goldEl) goldEl.innerText = newGold.toString();

  errors = 2; // 3 can hakkı sağlandı
  UIManager.updateErrorCount(errors, 5);
  UIManager.hideErrorLimitModal();

  isGameActive = true;
  saveCurrentGameState();
  startTimer();
  refreshBoard();
});

document.getElementById('btn-restart-level')?.addEventListener('click', () => {
  UIManager.hideErrorLimitModal();
  userBoard = initialBoard.map(row => [...row]);
  userNotes = {};
  errors = 0;
  timeElapsed = 0;
  hintsUsed = 0;

  UIManager.updateErrorCount(errors, 5);
  isGameActive = true;
  saveCurrentGameState();
  startTimer();
  refreshBoard();
});

document.getElementById('btn-error-menu')?.addEventListener('click', () => {
  UIManager.hideErrorLimitModal();
  updateMenuContinueCard();
  updateDailyRewardUI();
  UIManager.navigate('menu');
});

// --- ZAFER VE OYUN BİTTİ MODAL BUTONLARI ---
document.getElementById('btn-victory-next')?.addEventListener('click', () => {
  UIManager.hideVictoryModal();
  const currentLvl = UserManager.getCurrentLevel();
  const nextDiff = SudokuGen.getDifficulty(currentLvl);
  startGame(currentLvl, nextDiff);
});

document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
  UIManager.hideVictoryModal();
  updateMenuContinueCard();
  updateDailyRewardUI();
  UIManager.navigate('menu');
});

document.getElementById('btn-gameover-retry')?.addEventListener('click', () => {
  UIManager.hideGameOverModal();
  startGame(currentLevel, currentDiff);
});

document.getElementById('btn-gameover-menu')?.addEventListener('click', () => {
  UIManager.hideGameOverModal();
  updateMenuContinueCard();
  updateDailyRewardUI();
  UIManager.navigate('menu');
});

// --- LİDERLİK TABLOSU ---
const updateLeaderboardView = async () => {
  const goldTab = document.getElementById('btn-tab-gold');
  const speedTab = document.getElementById('btn-tab-speed');
  const sortFilters = document.getElementById('general-sort-filters');
  const filterRow = document.getElementById('speed-diff-filters');
  const headerLeft = document.getElementById('lb-header-left');
  const headerRight = document.getElementById('lb-header-right');

  const btnSortLevel = document.getElementById('btn-sort-level');
  const btnSortGold = document.getElementById('btn-sort-gold');

  if (currentLeaderboardTab === 'gold') {
    if (goldTab) {
      goldTab.className = "flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition-all bg-white text-indigo-700 shadow-sm";
    }
    if (speedTab) {
      speedTab.className = "flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all text-slate-500 hover:text-slate-800";
    }
    if (sortFilters) {
      sortFilters.classList.remove('hidden');
      sortFilters.classList.add('flex');
    }
    if (filterRow) {
      filterRow.classList.add('hidden');
      filterRow.classList.remove('flex');
    }

    // Alt sıralama butonlarının stilini güncelle
    if (btnSortLevel && btnSortGold) {
      if (currentGeneralSort === 'level') {
        btnSortLevel.className = "flex-1 py-1.5 text-xs font-black rounded-xl bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-1";
        btnSortGold.className = "flex-1 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center gap-1";
      } else {
        btnSortGold.className = "flex-1 py-1.5 text-xs font-black rounded-xl bg-amber-500 text-white shadow-sm flex items-center justify-center gap-1";
        btnSortLevel.className = "flex-1 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center gap-1";
      }
    }

    if (headerLeft) headerLeft.innerText = "Sıra & Oyuncu";
    if (headerRight) {
      headerRight.innerText = currentGeneralSort === 'level' ? "🏅 Seviye" : "🪙 Toplam Altın";
    }

    const cached = Leaderboard.getCachedPlayers(currentGeneralSort);
    UIManager.renderLeaderboard(cached, currentGeneralSort);

    try {
      const fresh = await Leaderboard.fetchTopPlayers(currentGeneralSort);
      UIManager.renderLeaderboard(fresh, currentGeneralSort);
    } catch (err) {
      console.warn("Liderlik güncellenemedi:", err);
    }
  } else {
    // Speed tab
    if (speedTab) {
      speedTab.className = "flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition-all bg-white text-indigo-700 shadow-sm";
    }
    if (goldTab) {
      goldTab.className = "flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all text-slate-500 hover:text-slate-800";
    }
    if (sortFilters) {
      sortFilters.classList.add('hidden');
      sortFilters.classList.remove('flex');
    }
    if (filterRow) {
      filterRow.classList.remove('hidden');
      filterRow.classList.add('flex');
    }
    if (headerLeft) headerLeft.innerText = "Sıra & Oyuncu (Bölüm)";
    if (headerRight) headerRight.innerText = "⏱ Bitirme Süresi";

    const listEl = document.getElementById('leaderboard-list');
    if (listEl) {
      listEl.innerHTML = `<div class="text-center text-slate-400 py-10 font-bold animate-pulse">Süre rekorları yükleniyor...</div>`;
    }

    try {
      const speedRecords = await Leaderboard.fetchFastestRecords(currentSpeedDiff);
      UIManager.renderSpeedLeaderboard(speedRecords);
    } catch (err) {
      console.warn("Hız rekorları çekilemedi:", err);
    }
  }
};

const openLeaderboard = async () => {
  UIManager.toggleModal('view-leaderboard', true);
  await updateLeaderboardView();
};

document.getElementById('btn-tab-gold')?.addEventListener('click', () => {
  currentLeaderboardTab = 'gold';
  updateLeaderboardView();
});

document.getElementById('btn-tab-speed')?.addEventListener('click', () => {
  currentLeaderboardTab = 'speed';
  updateLeaderboardView();
});

// Seviyeye Göre Sırala Butonu
document.getElementById('btn-sort-level')?.addEventListener('click', () => {
  currentGeneralSort = 'level';
  updateLeaderboardView();
});

// Altına Göre Sırala Butonu
document.getElementById('btn-sort-gold')?.addEventListener('click', () => {
  currentGeneralSort = 'gold';
  updateLeaderboardView();
});

document.querySelectorAll('.speed-filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    const diff = (target.dataset.diff as 'all' | 'basit' | 'orta' | 'zor') || 'all';
    currentSpeedDiff = diff;

    document.querySelectorAll('.speed-filter-btn').forEach(b => {
      b.className = "speed-filter-btn flex-1 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200";
    });
    target.className = "speed-filter-btn flex-1 py-1 text-[11px] font-black rounded-lg bg-indigo-600 text-white shadow-sm";

    updateLeaderboardView();
  });
});

document.getElementById('btn-leaderboard')?.addEventListener('click', openLeaderboard);
document.getElementById('refresh-leaderboard')?.addEventListener('click', updateLeaderboardView);
document.getElementById('close-leaderboard')?.addEventListener('click', () => {
  UIManager.toggleModal('view-leaderboard', false);
});

// --- BAŞARIMLAR & ROZETLER ---
const openAchievementsModal = () => {
  const currentLvl = UserManager.getCurrentLevel();
  const currentGold = UserManager.getGold();
  const badges = AchievementManager.getAllBadgesWithStatus(currentLvl, currentGold);

  UIManager.renderAchievements(badges, async (badgeId) => {
    const res = AchievementManager.claimBadgeReward(badgeId);
    if (res.success) {
      const newGold = UserManager.getGold() + res.goldAdded;
      await UserManager.updateProgress(currentLvl, newGold);
      const goldEl = document.getElementById('menu-gold');
      if (goldEl) goldEl.innerText = newGold.toString();

      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }

      openAchievementsModal();
      updateMenuContinueCard();
    }
  });

  UIManager.toggleModal('view-achievements', true);
};

document.getElementById('btn-achievements')?.addEventListener('click', openAchievementsModal);
document.getElementById('close-achievements')?.addEventListener('click', () => {
  UIManager.toggleModal('view-achievements', false);
});

// --- MAĞAZA ---
document.getElementById('btn-shop')?.addEventListener('click', () => {
  UIManager.toggleModal('view-shop', true);
});
document.getElementById('close-shop')?.addEventListener('click', () => {
  UIManager.toggleModal('view-shop', false);
});

document.getElementById('shop-list')?.addEventListener('click', async (e) => {
  const btn = (e.target as HTMLElement).closest('button');
  if (btn) {
    const res = ShopManager.buyItem('theme-dark');
    alert(res.msg);
    if (res.success) {
      await UserManager.updateProgress(UserManager.getCurrentLevel(), UserManager.getGold() - 200);
      const goldEl = document.getElementById('menu-gold');
      if (goldEl) {
        goldEl.innerText = UserManager.getGold().toString();
      }
    }
  }
});

// --- GÜNLÜK ÖDÜL ---
document.getElementById('btn-daily-reward')?.addEventListener('click', async () => {
  const res = await Rewards.claimReward();
  alert(res.message);
  const goldEl = document.getElementById('menu-gold');
  if (goldEl) {
    goldEl.innerText = UserManager.getGold().toString();
  }
  updateDailyRewardUI();
});

// --- KULLANICI PROFİLİ VE MODAL AKIŞI ---
const checkUser = async () => {
  const currentUsername = UserManager.getUsername();
  const currentGold = UserManager.getGold();

  const goldEl = document.getElementById('menu-gold');
  if (goldEl) goldEl.innerText = currentGold.toString();

  updateMenuContinueCard();
  updateDailyRewardUI();

  if (!currentUsername) {
    const closeBtn = document.getElementById('close-username-modal');
    if (closeBtn) closeBtn.classList.add('hidden');
    UIManager.toggleModal('username-modal', true);
  } else {
    const nameEl = document.getElementById('menu-player-name');
    if (nameEl) nameEl.innerText = currentUsername;
    UIManager.navigate('menu');

    UserManager.initUser().then((synced) => {
      if (synced) {
        if (nameEl) nameEl.innerText = synced.username;
        if (goldEl) goldEl.innerText = synced.gold.toString();
        updateMenuContinueCard();
        updateDailyRewardUI();
      }
    });
  }
};

document.getElementById('btn-edit-username')?.addEventListener('click', () => {
  const input = document.getElementById('username-input') as HTMLInputElement;
  const current = UserManager.getUsername();
  if (input && current) input.value = current;

  const closeBtn = document.getElementById('close-username-modal');
  if (closeBtn) closeBtn.classList.remove('hidden');

  UIManager.toggleModal('username-modal', true);
});

document.getElementById('close-username-modal')?.addEventListener('click', () => {
  UIManager.toggleModal('username-modal', false);
});

document.getElementById('save-username')?.addEventListener('click', async () => {
  const input = document.getElementById('username-input') as HTMLInputElement;
  if (input?.value && input.value.trim().length >= 3) {
    const name = input.value.trim();
    const btn = document.getElementById('save-username') as HTMLButtonElement;
    if (btn) btn.innerText = "Bağlanıyor...";

    await UserManager.saveUser(name);

    if (btn) btn.innerText = "Kaydet ve Başla!";
    UIManager.toggleModal('username-modal', false);
    await checkUser();
  } else {
    alert("Lütfen en az 3 karakterli bir kullanıcı adı girin.");
  }
});

// --- PWA KURULUM VE ÇEVRİMDIŞI (OFFLINE) DESTEĞİ ---
let deferredPrompt: any = null;
const installBtn = document.getElementById('btn-install-pwa');

const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as unknown as { standalone?: boolean }).standalone === true;

const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

if (!isStandalone) {
  if (isIOS) {
    if (installBtn) {
      installBtn.classList.remove('hidden');
      installBtn.classList.add('flex');
    }
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.classList.remove('hidden');
      installBtn.classList.add('flex');
    }
  });

  installBtn?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (installBtn) {
          installBtn.classList.add('hidden');
          installBtn.classList.remove('flex');
        }
        deferredPrompt = null;
      }
    } else if (isIOS) {
      alert("iPhone / iPad için kurulum:\n1. Safari'nin altındaki 'Paylaş' (Share) butonuna dokunun.\n2. Aşağı kaydırıp 'Ana Ekrana Ekle' seçeneğini seçin.");
    } else {
      alert("Tarayıcınızın menüsünden (üç nokta) 'Uygulamayı Yükle' veya 'Ana Ekrana Ekle' seçeneğini kullanarak yükleyebilirsiniz.");
    }
  });

  window.addEventListener('appinstalled', () => {
    if (installBtn) {
      installBtn.classList.add('hidden');
      installBtn.classList.remove('flex');
    }
    deferredPrompt = null;
  });
}

// Uygulamayı başlat
checkUser();
