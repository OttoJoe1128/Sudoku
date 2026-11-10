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

const startGame = (diff: 'basit' | 'orta' | 'zor') => {
    const saved = localStorage.getItem('sudoku_saved_game');
    const data = saved ? JSON.parse(saved) : SudokuGen.generate(diff);
    currentSolution = data.solution;
    userBoard = data.puzzle;
    
    UIManager.navigate('game');
    
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
        }
    });
};

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

// Oyun Başlatma
document.getElementById('btn-diff-basit')?.addEventListener('click', () => startGame('basit'));
document.getElementById('btn-diff-orta')?.addEventListener('click', () => startGame('orta'));
document.getElementById('btn-diff-zor')?.addEventListener('click', () => startGame('zor'));

// Modallar
document.getElementById('btn-leaderboard')?.addEventListener('click', async () => {
  UIManager.toggleModal('view-leaderboard', true);
  const players = await Leaderboard.fetchTopPlayers();
  UIManager.renderLeaderboard(players);
});
document.getElementById('close-leaderboard')?.addEventListener('click', () => UIManager.toggleModal('view-leaderboard', false));

document.getElementById('btn-shop')?.addEventListener('click', () => UIManager.toggleModal('view-shop', true));
document.getElementById('close-shop')?.addEventListener('click', () => UIManager.toggleModal('view-shop', false));

// Ödül Sistemi
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

document.getElementById('btn-back-menu')?.addEventListener('click', () => UIManager.navigate('menu'));
