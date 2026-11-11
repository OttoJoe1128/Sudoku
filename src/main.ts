import { UIManager } from './ui/uiManager';
import { GameEngine } from './engine/gameEngine';
import { SudokuGen } from './engine/sudoku';
import { UserManager } from './store/userState';
import { Leaderboard } from './engine/leaderboard';
import { ShopManager } from './engine/shop';
import { Rewards } from './engine/rewards';
import confetti from 'canvas-confetti';

UIManager.mountUI();

interface SavedGameState {
  level: number;
  diff: 'basit' | 'orta' | 'zor';
  userBoard: number[][];
  initialBoard: number[][];
  solution: number[][];
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
let refreshBoard = () => {};

// Tahtanın tamamen ve doğru şekilde tamamlanıp tamamlanmadığını kontrol eden yardımcı
const isBoardComplete = (board: number[][], solution: number[][]): boolean => {
  if (!board || !solution) return false;
  return board.every((row, ri) =>
    row.every((val, ci) => val !== 0 && val === solution[ri][ci])
  );
};

// --- GÜVENLİ VE KALICI OYUN KAYIT SİSTEMİ ---
const saveCurrentGameState = () => {
  // Oyun aktif değilse veya oyun zaten bitmişse ASLA kaydetme!
  if (!isGameActive || !userBoard || !currentSolution || !initialBoard) return;

  // Eğer tahta zaten tamamlanmışsa kayıtlı oyunu hemen sil ve kaydetme
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
        // Eğer kaydedilmiş oyun zaten tamamlanmış bir tahtaysa geçersiz say ve temizle
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
    if (subtitle) subtitle.innerText = `Seviye ${saved.level} (${saved.diff.toUpperCase()}) • ⏱ ${formatTime(saved.timeElapsed)} • Hata: ${saved.errors}/3`;
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
    // Her 5 saniyede bir otomatik süre güncellemesi kaydet
    if (timeElapsed % 5 === 0) {
      saveCurrentGameState();
    }
  }, 1000);
};

// --- ZAFER VE BÖLÜM BİTİRME MANTIĞI ---
const handleVictory = async (level: number, diff: 'basit' | 'orta' | 'zor') => {
  // 1. Oyunu anında pasif yap ve sayacı durdur
  isGameActive = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // 2. Kayıtlı oyunu kesin olarak temizle (bir daha yarım kaldı diye gözükmez!)
  clearCurrentGameState();

  // 3. İlerlemeyi ve altın ödülünü kaydet
  const currentLvl = UserManager.getCurrentLevel();
  // Seviye 301 bitirildiyse bir sonraki seviye 302 olur
  const nextLevel = Math.max(currentLvl, level + 1);
  const reward = diff === 'basit' ? 10 : diff === 'orta' ? 20 : 35;
  const nextGold = UserManager.getGold() + reward;

  await UserManager.updateProgress(nextLevel, nextGold);

  const goldEl = document.getElementById('menu-gold');
  if (goldEl) goldEl.innerText = nextGold.toString();

  // 4. Konfeti patlat
  try {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch {
    // ignore
  }

  // 5. Oyun içi şık zafer modalını göster
  UIManager.showVictoryModal(level, diff, formatTime(timeElapsed), errors, reward);
  updateMenuContinueCard();
  updateDailyRewardUI();
};

// --- OYUN BİTTİ (3 HATA) MANTIĞI ---
const handleGameOver = () => {
  isGameActive = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  clearCurrentGameState();
  updateMenuContinueCard();
  UIManager.showGameOverModal(errors);
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

  userBoard[selectedCell.r][selectedCell.c] = currentSolution[selectedCell.r][selectedCell.c];
  hintsUsed++;
  refreshBoard();

  // Eğer ipucu son kutucuğu doldurduysa zaferi tetikle
  if (isBoardComplete(userBoard, currentSolution)) {
    await handleVictory(currentLevel, currentDiff);
  } else {
    saveCurrentGameState();
  }
};

// Oyunu Başlat veya Kayıtlı Oyundan Sürdür
const startGame = (level: number, diff: 'basit' | 'orta' | 'zor', resumeState?: SavedGameState) => {
  // Eğer daha önceden kalmış zafer veya gameover modalı varsa kapat
  UIManager.hideVictoryModal();
  UIManager.hideGameOverModal();

  currentLevel = level;
  currentDiff = diff;
  selectedCell = null;

  if (resumeState) {
    // Eğer resumeState zaten tamamlanmışsa oyunu devam ettirme, zaferi kutla ve menüye dön
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
    timeElapsed = resumeState.timeElapsed;
    errors = resumeState.errors;
    hintsUsed = resumeState.hintsUsed;
  } else {
    errors = 0;
    hintsUsed = 0;
    timeElapsed = 0;
    const data = SudokuGen.generate(diff);
    currentSolution = data.solution;
    userBoard = data.puzzle.map(row => [...row]);
    initialBoard = data.puzzle.map(row => [...row]);
  }

  isGameActive = true;
  saveCurrentGameState();

  const title = document.getElementById('game-title');
  if (title) title.innerText = `Seviye ${level} (${diff.toUpperCase()})`;

  UIManager.navigate('game');
  startTimer();

  refreshBoard = () => {
    UIManager.renderBoard(
      userBoard,
      (r, c) => {
        if (!isGameActive) return;
        // Sabit başlangıç hücresi seçilemez
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
  };

  refreshBoard();

  UIManager.renderNumpad((num) => {
    if (!isGameActive || !selectedCell) return;

    if (num === -1) {
      useHint();
      return;
    }

    const result = GameEngine.processInput(
      selectedCell.r,
      selectedCell.c,
      num,
      userBoard,
      currentSolution,
      async () => {
        // --- ZAFER / BÖLÜM BİTTİ ---
        await handleVictory(level, diff);
      },
      (err: number) => {
        // --- HATA YAPILDI ---
        errors += err;
        if (errors >= 3) {
          handleGameOver();
        } else {
          saveCurrentGameState();
        }
      }
    );

    // Zafer kazanıldıysa ASLA tekrar kaydetme!
    if (result.won) {
      return;
    }

    if (result.valid) {
      saveCurrentGameState();
      refreshBoard();
    }
  });
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

// Uygulamayı başlat
checkUser();
