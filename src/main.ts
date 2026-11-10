import { UIManager } from './ui/uiManager';
import { GameEngine } from './engine/gameEngine';
import { SudokuGen } from './engine/sudoku';
import { Rewards } from './engine/rewards';
import { UserManager } from './store/userState';
import { Leaderboard } from './engine/leaderboard';

UIManager.mountUI();

let currentSolution: number[][];
let userBoard: number[][];

const startGame = (diff: 'basit' | 'orta' | 'zor') => {
    const data = SudokuGen.generate(diff);
    currentSolution = data.solution;
    userBoard = data.puzzle;
    
    UIManager.navigate('game');
    UIManager.renderBoard(userBoard, (r, c) => {
        const num = prompt("Sayı gir (1-9) veya sil (0):");
        if (num !== null) {
            GameEngine.processInput(r, c, parseInt(num), userBoard, currentSolution);
        }
    });
};

// Kullanıcı Adı Kontrolü
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

// Başlangıç
checkUser();

// Navigasyon & Modallar
document.getElementById('btn-journey')?.addEventListener('click', () => UIManager.navigate('map'));
document.getElementById('btn-custom')?.addEventListener('click', () => UIManager.navigate('custom'));

document.getElementById('btn-leaderboard')?.addEventListener('click', async () => {
  UIManager.toggleModal('view-leaderboard', true);
  const players = await Leaderboard.fetchTopPlayers();
  UIManager.renderLeaderboard(players);
});
document.getElementById('close-leaderboard')?.addEventListener('click', () => UIManager.toggleModal('view-leaderboard', false));

document.getElementById('btn-shop')?.addEventListener('click', () => UIManager.toggleModal('view-shop', true));
document.getElementById('close-shop')?.addEventListener('click', () => UIManager.toggleModal('view-shop', false));

// Oyun Mantığı
document.getElementById('btn-diff-basit')?.addEventListener('click', () => startGame('basit'));
document.getElementById('btn-diff-orta')?.addEventListener('click', () => startGame('orta'));
document.getElementById('btn-diff-zor')?.addEventListener('click', () => startGame('zor'));

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
