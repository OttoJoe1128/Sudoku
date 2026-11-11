import { UIManager } from './ui/uiManager';
import { GameEngine } from './engine/gameEngine';
import { SudokuGen } from './engine/sudoku';
import { UserManager } from './store/userState';
import { Leaderboard } from './engine/leaderboard';
import { AchievementManager } from './engine/achievements';
import { ShopManager } from './engine/shop';
import { Rewards } from './engine/rewards';

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
let refreshBoard = () => {};

// --- OYUN KAYIT SİSTEMİ (AUTO-SAVE) ---
const saveCurrentGameState = () => {
  if (!userBoard || !currentSolution) return;
  const state: SavedGameState = {
    level: currentLevel,
    diff: currentDiff,
    userBoard,
    initialBoard,
    solution: currentSolution,
    timeElapsed,
    errors,
    hintsUsed
  };
  localStorage.setItem('sudoku_saved_game', JSON.stringify(state));
};

const clearCurrentGameState = () => {
  localStorage.removeItem('sudoku_saved_game');
};

const getSavedGameState = (): SavedGameState | null => {
  try {
    const raw = localStorage.getItem('sudoku_saved_game');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupted JSON
  }
  return null;
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const updateMenuContinueCard = () => {
  const card = document.getElementById('continue-card');
  const title = document.getElementById('continue-game-title');
  const subtitle = document.getElementById('continue-game-subtitle');
  if (!card) return;

  const saved = getSavedGameState();
  if (saved) {
    card.classList.remove('hidden');
    if (title) title.innerText = `▶ Seviye ${saved.level} (${saved.diff.toUpperCase()}) - Devam Et`;
    if (subtitle) subtitle.innerText = `Kalan Süre: ${formatTime(saved.timeElapsed)} • Hata: ${saved.errors}/3`;
  } else {
    card.classList.add('hidden');
  }
};

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  const timerEl = document.getElementById('game-timer');
  if (timerEl) timerEl.innerText = formatTime(timeElapsed);

  timerInterval = setInterval(() => {
    timeElapsed++;
    if (timerEl) timerEl.innerText = formatTime(timeElapsed);
    // Her 5 saniyede bir süre durumunu otomatik kaydet
    if (timeElapsed % 5 === 0) {
      saveCurrentGameState();
    }
  }, 1000);
};

const useHint = async () => {
  if (!selectedCell) {
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
  saveCurrentGameState();
  refreshBoard();
};

const startGame = (level: number, diff: 'basit' | 'orta' | 'zor', resumeState?: SavedGameState) => {
  currentLevel = level;
  currentDiff = diff;
  selectedCell = null;

  if (resumeState) {
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
    saveCurrentGameState();
  }

  const title = document.getElementById('game-title');
  if (title) title.innerText = `Seviye ${level} (${diff.toUpperCase()})`;

  UIManager.navigate('game');
  startTimer();

  refreshBoard = () => {
    UIManager.renderBoard(
      userBoard,
      (r, c) => {
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
    if (!selectedCell) return;

    if (num === -1) {
      useHint();
      return;
    }

    const success = GameEngine.processInput(
      selectedCell.r,
      selectedCell.c,
      num,
      userBoard,
      currentSolution,
      async () => {
        // KAZANDI
        if (timerInterval) clearInterval(timerInterval);
        clearCurrentGameState();

        const userLvl = UserManager.getCurrentLevel();
        const nextLevel = level >= userLvl ? userLvl + 1 : userLvl;
        const reward = diff === 'basit' ? 10 : diff === 'orta' ? 20 : 35;
        const nextGold = UserManager.getGold() + reward;

        await UserManager.updateProgress(nextLevel, nextGold);

        const goldEl = document.getElementById('menu-gold');
        if (goldEl) goldEl.innerText = nextGold.toString();

        alert(`🎉 Harika! Seviye ${level} tamamlandı! 🪙 +${reward} Altın Kazandın.`);
        updateMenuContinueCard();
        UIManager.navigate('menu');
      },
      (err: number) => {
        // HATA
        errors += err;
        saveCurrentGameState();
        if (errors >= 3) {
          if (timerInterval) clearInterval(timerInterval);
          clearCurrentGameState();
          alert("❌ Oyun Bitti! 3 hata sınırına ulaştın.");
          updateMenuContinueCard();
          UIManager.navigate('menu');
        }
      }
    );

    if (success) {
      saveCurrentGameState();
      refreshBoard();
    }
  });
};

// --- BUTON DİNLENİCİLERİ ---

// İpucu Butonu
document.getElementById('btn-hint')?.addEventListener('click', () => {
  useHint();
});

// Kayıtlı Oyundan Devam Et
document.getElementById('btn-continue-game')?.addEventListener('click', () => {
  const saved = getSavedGameState();
  if (saved) {
    startGame(saved.level, saved.diff, saved);
  } else {
    alert("Kayıtlı oyun bulunamadı.");
  }
});

// Yeni Oyun Başlat (Zorluk Seçim Sayfasına Yönlendirir)
document.getElementById('btn-new-game')?.addEventListener('click', () => {
  UIManager.navigate('custom');
});

// Zorluk Seçim Butonları
document.getElementById('btn-start-basit')?.addEventListener('click', () => {
  const userLvl = UserManager.getCurrentLevel();
  startGame(userLvl <= 300 ? userLvl : 1, 'basit');
});

document.getElementById('btn-start-orta')?.addEventListener('click', () => {
  const userLvl = UserManager.getCurrentLevel();
  const lvl = userLvl > 300 && userLvl <= 700 ? userLvl : 301;
  startGame(lvl, 'orta');
});

document.getElementById('btn-start-zor')?.addEventListener('click', () => {
  const userLvl = UserManager.getCurrentLevel();
  const lvl = userLvl > 700 ? userLvl : 701;
  startGame(lvl, 'zor');
});

document.getElementById('btn-back-custom')?.addEventListener('click', () => {
  updateMenuContinueCard();
  UIManager.navigate('menu');
});

// Harita Navigasyonu
document.getElementById('btn-journey')?.addEventListener('click', () => {
  const userLvl = UserManager.getCurrentLevel();
  UIManager.navigate('map');
  UIManager.renderMap(userLvl, userLvl);
});

document.getElementById('btn-back-map')?.addEventListener('click', () => {
  updateMenuContinueCard();
  UIManager.navigate('menu');
});

document.getElementById('btn-back-menu')?.addEventListener('click', () => {
  if (timerInterval) clearInterval(timerInterval);
  saveCurrentGameState();
  updateMenuContinueCard();
  UIManager.navigate('menu');
});

// Harita Hızlı Atlama Sekmeleri
document.getElementById('btn-map-jump-basit')?.addEventListener('click', () => {
  UIManager.renderMap(UserManager.getCurrentLevel(), 1);
});
document.getElementById('btn-map-jump-orta')?.addEventListener('click', () => {
  UIManager.renderMap(UserManager.getCurrentLevel(), 301);
});
document.getElementById('btn-map-jump-zor')?.addEventListener('click', () => {
  UIManager.renderMap(UserManager.getCurrentLevel(), 701);
});

// Haritadan Seviye Seçimi
document.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest('[data-level]');
  if (target) {
    const level = parseInt(target.getAttribute('data-level')!);
    const diff = SudokuGen.getDifficulty(level);
    startGame(level, diff);
  }
});

// --- LİDERLİK TABLOSU ---
const openLeaderboard = async () => {
  UIManager.toggleModal('view-leaderboard', true);
  // 1. Önce anında önbellekteki verileri bas (hiç bekleme yapmaz)
  const cached = Leaderboard.getCachedPlayers();
  UIManager.renderLeaderboard(cached, 'gold');

  // 2. Arka planda Firebase'den canlı verileri çekip güncelle
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
});

// --- BAŞARILAR ---
document.getElementById('btn-achievements')?.addEventListener('click', () => {
  const list = AchievementManager.checkAchievements();
  if (list.length === 0) {
    alert("🎖️ Henüz kazanılmış bir başarım yok. Daha fazla seviye tamamlayarak veya 500 altına ulaşarak başarımları açabilirsin!");
  } else {
    alert("🎖️ Kazanılan Başarılar:\n\n" + list.join('\n'));
  }
});

// --- KULLANICI PROFİLİ VE MODAL AKIŞI ---
const checkUser = async () => {
  const currentUsername = UserManager.getUsername();
  const currentGold = UserManager.getGold();

  const goldEl = document.getElementById('menu-gold');
  if (goldEl) goldEl.innerText = currentGold.toString();

  updateMenuContinueCard();

  if (!currentUsername) {
    const closeBtn = document.getElementById('close-username-modal');
    if (closeBtn) closeBtn.classList.add('hidden');
    UIManager.toggleModal('username-modal', true);
  } else {
    const nameEl = document.getElementById('menu-player-name');
    if (nameEl) nameEl.innerText = currentUsername;
    UIManager.navigate('menu');

    // Arka planda Firebase ile senkronize et
    UserManager.initUser().then((synced) => {
      if (synced) {
        if (nameEl) nameEl.innerText = synced.username;
        if (goldEl) goldEl.innerText = synced.gold.toString();
        updateMenuContinueCard();
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
