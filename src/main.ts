import { UIManager } from './ui/uiManager';
import { GameEngine } from './engine/gameEngine';
import { SudokuGen } from './engine/sudoku';
import { UserManager } from './store/userState';
import { Leaderboard } from './engine/leaderboard';
import { ShopManager } from './engine/shop';
import { Rewards } from './engine/rewards';
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
    savedAt: Date.now()
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

// Ana Menüdeki "Kayıtlı Oyundan Devam Et" Kartını Güncelle
const updateMenuContinueCard = () => {
  const btn = document.getElementById('btn-continue-game') as HTMLButtonElement;
  const title = document.getElementById('continue-game-title');
  const subtitle = document.getElementById('continue-game-subtitle');
  const tag = document.getElementById('continue-tag');
  const dot = document.getElementById('continue-dot');
  if (!btn) return;

  const saved = getSavedGameState();
  if (saved) {
    btn.disabled = false;
    btn.className = "w-full text-left rounded-2xl p-5 shadow-md active:scale-[0.98] transition-all border flex justify-between items-center group bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 cursor-pointer";
    if (title) title.innerText = `▶ Kayıtlı Oyundan Devam Et`;
    if (subtitle) subtitle.innerText = `Seviye ${saved.level} (${saved.diff.toUpperCase()}) • ⏱ ${formatTime(saved.timeElapsed)} • Hata: ${saved.errors}/5`;
    if (tag) tag.innerText = "Aktif Oyun Kayıtlı";
    if (dot) dot.classList.remove('hidden');
  } else {
    btn.disabled = true;
    btn.className = "w-full text-left rounded-2xl p-5 border flex justify-between items-center bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed";
    if (title) title.innerText = `▶ Kayıtlı Oyun Yok`;
    if (subtitle) subtitle.innerText = `Yeni bir oyun başlatarak oynamaya başlayın`;
    if (tag) tag.innerText = "Kayıt Yok";
    if (dot) dot.classList.add('hidden');
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
    if (timeElapsed % 5 === 0) {
      saveCurrentGameState();
    }
  }, 1000);
};

// --- ZAFER VE BÖLÜM BİTİRME MANTIĞI ---
const handleVictory = async (level: number, diff: 'basit' | 'orta' | 'zor') => {
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

  await UserManager.updateProgress(nextLevel, nextGold);

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
    await handleVictory(currentLevel, currentDiff);
  } else {
    saveCurrentGameState();
  }
};

// Oyunu Başlat veya Kayıtlı Oyundan Sürdür
const startGame = (level: number, diff: 'basit' | 'orta' | 'zor', resumeState?: SavedGameState) => {
  UIManager.hideVictoryModal();
  UIManager.hideGameOverModal();
  UIManager.hideErrorLimitModal();

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

    currentSolution = resumeState.solution;
    userBoard = resumeState.userBoard;
    initialBoard = resumeState.initialBoard;
    userNotes = resumeState.notes ? { ...resumeState.notes } : {};
    timeElapsed = resumeState.timeElapsed;
    errors = resumeState.errors;
    hintsUsed = resumeState.hintsUsed;
  } else {
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
  if (title) title.innerText = `Seviye ${level} (${diff.toUpperCase()})`;

  UIManager.updateErrorCount(errors, 5);
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
        // Sil: Seçili hücrenin notlarını temizle
        delete userNotes[key];
        saveCurrentGameState();
        refreshBoard();
        return;
      }

      // Hücrede zaten yerleştirilmiş bir ana sayı varsa not yazılmaz
      if (userBoard[selectedCell.r][selectedCell.c] !== 0) {
        return;
      }

      // 1-9 Aday sayısını ekle veya çıkar (toggle)
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
      async () => {
        await handleVictory(level, diff);
      },
      (err: number) => {
        errors += err;
        UIManager.updateErrorCount(errors, 5);

        if (errors >= 5) {
          handleFiveErrorsReached();
        } else {
          saveCurrentGameState();
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

// Tarayıcı kapanırken durumu sadece aktif oyun varsa kaydet
window.addEventListener('beforeunload', () => {
  if (isGameActive && userBoard && currentSolution) {
    saveCurrentGameState();
  }
});

// --- BUTON VE MENÜ DİNLENİCİLERİ ---

// İpucu Butonu
document.getElementById('btn-hint')?.addEventListener('click', () => {
  useHint();
});

// Not Alma (Pencil/Notes) Modu Butonu
document.getElementById('btn-toggle-notes')?.addEventListener('click', () => {
  if (!isGameActive) return;
  isNotesMode = !isNotesMode;
  UIManager.updateNotesModeUI(isNotesMode);
});

// 1. Kayıtlı Oyundan Devam Et Butonu
document.getElementById('btn-continue-game')?.addEventListener('click', () => {
  const saved = getSavedGameState();
  if (saved) {
    startGame(saved.level, saved.diff, saved);
  } else {
    alert("Şu anda devam edebileceğiniz aktif bir kayıtlı oyun bulunmamaktadır.");
  }
});

// 2. Yeni Oyun Başlat Butonu (Zorluk Seçim Ekranını Açar)
document.getElementById('btn-new-game')?.addEventListener('click', () => {
  UIManager.navigate('custom');
});

// Yeni Oyun Başlatma Onayı (Mevcut kayıtlı oyunu koruma kalkanı)
const requestStartNewGame = (diff: 'basit' | 'orta' | 'zor') => {
  const saved = getSavedGameState();
  if (saved) {
    const onay = confirm(`Kayıtlı bir oyununuz bulunuyor (Seviye ${saved.level}).\n\nYeni bir oyun başlatırsanız önceki oyununuz silinecektir. Devam etmek istiyor musunuz?`);
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

// Oyundan Menüye Dönüş (Oyunu asla silmez, kaydeder ve durdurur)
document.getElementById('btn-back-menu')?.addEventListener('click', () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (isGameActive) {
    saveCurrentGameState();
  }
  updateMenuContinueCard();
  updateDailyRewardUI();
  UIManager.navigate('menu');
});

// --- 5 HATA MODAL BUTONLARI (50 ALTIN İLE DEVAM ET YA DA BAŞTAN AL) ---
document.getElementById('btn-continue-with-gold')?.addEventListener('click', async () => {
  const currentGold = UserManager.getGold();
  if (currentGold < 50) {
    alert(`Devam etmek için 50 🪙 gerekiyor.\nMevcut altınınız: ${currentGold} 🪙.\n\nOyunu baştan başlatabilir veya günlük ödülünüzü alabilirsiniz.`);
    return;
  }

  // 50 altın düş ve oyuncuya 3 can hakkı tanımla (hatayı 2'ye çek, 5'e kadar 3 hakkı olsun)
  const newGold = currentGold - 50;
  await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
  const goldEl = document.getElementById('menu-gold');
  if (goldEl) goldEl.innerText = newGold.toString();

  errors = 2; // 5 - 2 = 3 can hakkı sağlandı
  UIManager.updateErrorCount(errors, 5);
  UIManager.hideErrorLimitModal();

  isGameActive = true;
  saveCurrentGameState();
  startTimer();
  refreshBoard();
});

document.getElementById('btn-restart-level')?.addEventListener('click', () => {
  // Ücretsiz baştan başlat: tahtayı başlangıç haline döndür, hataları ve süreyi sıfırla
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
const openLeaderboard = async () => {
  UIManager.toggleModal('view-leaderboard', true);
  const cached = Leaderboard.getCachedPlayers();
  UIManager.renderLeaderboard(cached, 'gold');

  try {
    const fresh = await Leaderboard.fetchTopPlayers();
    UIManager.renderLeaderboard(fresh, 'gold');
  } catch (err) {
    console.warn("Liderlik güncellenemedi:", err);
  }
};

document.getElementById('btn-leaderboard')?.addEventListener('click', openLeaderboard);
document.getElementById('refresh-leaderboard')?.addEventListener('click', openLeaderboard);
document.getElementById('close-leaderboard')?.addEventListener('click', () => {
  UIManager.toggleModal('view-leaderboard', false);
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

// Halihazırda PWA olarak (standalone) çalışıp çalışmadığını kontrol et
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
