import { UIManager } from './ui/uiManager';
import { GameEngine } from './engine/gameEngine';
import { SudokuGen } from './engine/sudoku';
import { Rewards } from './engine/rewards';
import { UserManager } from './store/userState';
import { Leaderboard } from './engine/leaderboard';

UIManager.mountUI();

let currentSolution: number[][];
let userBoard: number[][];
let selectedCell: {r: number, c: number} | null = null;
let timeElapsed = 0;
let timerInterval: any = null;

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

const startGame = (level: number, diff: 'basit' | 'orta' | 'zor') => {
    const data = SudokuGen.generate(diff);
    currentSolution = data.solution;
    userBoard = data.puzzle;
    
    // Oyun başlığını seviye ile güncelle
    const titleEl = document.getElementById('game-title');
    if (titleEl) titleEl.innerText = `Seviye ${level}`;
    
    UIManager.navigate('game');
    startTimer();
    
    const refreshBoard = () => {
        UIManager.renderBoard(userBoard, (r, c) => {
            selectedCell = {r, c};
            refreshBoard();
        }, selectedCell?.r ?? -1, selectedCell?.c ?? -1);
    };

    refreshBoard();

    UIManager.renderNumpad((num) => {
        if (selectedCell) {
            GameEngine.processInput(selectedCell.r, selectedCell.c, num, userBoard, currentSolution);
            localStorage.setItem('sudoku_saved_game', JSON.stringify({puzzle: userBoard, solution: currentSolution}));
            refreshBoard();
        } else {
            alert("Lütfen önce bir hücre seç!");
        }
    });
};

// Harita tıklama delegasyonu (Düzeltilmiş)
document.getElementById('map-nodes')?.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('button');
    if (target && target.dataset.level) {
        const level = parseInt(target.dataset.level);
        const diff = SudokuGen.getDifficulty(level); 
        startGame(level, diff);
    }
});

// Kullanıcı Akışı
const checkUser = () => {
  if (!UserManager.getUsername()) {
    UIManager.toggleModal('username-modal', true);
  } else {
    const nameEl = document.getElementById('menu-player-name');
    if (nameEl) nameEl.innerText = UserManager.getUsername()!;
    UIManager.navigate('menu');
  }
};

document.getElementById('save-username')?.addEventListener('click', () => {
  const input = document.getElementById('username-input') as HTMLInputElement;
  if (input?.value.length >= 3) {
    UserManager.saveUser(input.value);
    UIManager.toggleModal('username-modal', false);
    checkUser();
  } else {
    alert("En az 3 karakter!");
  }
});

checkUser();

// Navigasyon
document.getElementById('btn-journey')?.addEventListener('click', () => UIManager.navigate('custom'));
document.getElementById('btn-custom')?.addEventListener('click', () => UIManager.navigate('custom'));

// Zorluk Seçimi
const openMap = (diff: 'basit' | 'orta' | 'zor') => {
    const startLvl = SudokuGen.getStartLevelForDifficulty(diff);
    const userLvl = UserManager.getCurrentLevel();
    const focusLevel = (userLvl >= startLvl && userLvl < startLvl + 300) ? userLvl : startLvl;
    
    UIManager.navigate('map');
    UIManager.renderMap(userLvl, focusLevel);
};

document.getElementById('btn-diff-basit')?.addEventListener('click', () => openMap('basit'));
document.getElementById('btn-diff-orta')?.addEventListener('click', () => openMap('orta'));
document.getElementById('btn-diff-zor')?.addEventListener('click', () => openMap('zor'));

// Modallar
document.getElementById('btn-leaderboard')?.addEventListener('click', async () => {
  UIManager.toggleModal('view-leaderboard', true);
  const players = await Leaderboard.fetchTopPlayers();
  UIManager.renderLeaderboard(players, 'gold');
});
document.getElementById('close-leaderboard')?.addEventListener('click', () => UIManager.toggleModal('view-leaderboard', false));
document.getElementById('btn-shop')?.addEventListener('click', () => UIManager.toggleModal('view-shop', true));
document.getElementById('close-shop')?.addEventListener('click', () => UIManager.toggleModal('view-shop', false));

// Ödül
document.getElementById('btn-daily-reward')?.addEventListener('click', () => {
    const result = Rewards.claimReward();
    if(result.success) {
        alert(`Tebrikler! ${result.amount} Altın kazandın.`);
        const status = document.getElementById('reward-status');
        if(status) status.innerText = "Alındı";
    } else {
        alert("Ödülünü zaten aldın, yarın tekrar gel!");
    }
});

document.getElementById('btn-back-menu')?.addEventListener('click', () => {
    if(timerInterval) clearInterval(timerInterval);
    UIManager.navigate('menu');
});
