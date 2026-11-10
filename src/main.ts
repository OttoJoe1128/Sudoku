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
    
    const title = document.getElementById('game-title');
    if (title) title.innerText = `Seviye ${level}`;
    
    UIManager.navigate('game');
    startTimer();
    
    const refresh = () => {
        UIManager.renderBoard(userBoard, (r, c) => {
            selectedCell = {r, c};
            refresh();
        }, selectedCell?.r ?? -1, selectedCell?.c ?? -1);
    };
    refresh();
    
    UIManager.renderNumpad((num) => {
        if (selectedCell) {
            GameEngine.processInput(selectedCell.r, selectedCell.c, num, userBoard, currentSolution, () => {
                // Kazanma Mantığı
                const userLvl = UserManager.getCurrentLevel();
                if (level === userLvl) {
                    localStorage.setItem('sudoku_level', (userLvl + 1).toString());
                }
                alert("Tebrikler! Seviyeyi tamamladın.");
                if(timerInterval) clearInterval(timerInterval);
                UIManager.navigate('menu');
            });
            refresh();
        } else {
            alert("Lütfen önce bir hücre seç!");
        }
    });
};

// Harita Tıklama - Event Delegation (EN SAĞLAM YÖNTEM)
document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('button');
    if (target && target.dataset.level) {
        const level = parseInt(target.dataset.level);
        const diff = SudokuGen.getDifficulty(level);
        startGame(level, diff);
    }
});

const openMap = (diff: 'basit' | 'orta' | 'zor') => {
    const startLvl = SudokuGen.getStartLevelForDifficulty(diff);
    const userLvl = UserManager.getCurrentLevel();
    UIManager.navigate('map');
    // Haritayı render et ve startLvl'e odaklan
    UIManager.renderMap(userLvl, startLvl);
};

// Buton Bağlantıları
document.getElementById('btn-journey')?.addEventListener('click', () => UIManager.navigate('custom'));
document.getElementById('btn-custom')?.addEventListener('click', () => UIManager.navigate('custom'));
document.getElementById('btn-diff-basit')?.addEventListener('click', () => openMap('basit'));
document.getElementById('btn-diff-orta')?.addEventListener('click', () => openMap('orta'));
document.getElementById('btn-diff-zor')?.addEventListener('click', () => openMap('zor'));
document.getElementById('btn-back-map')?.addEventListener('click', () => UIManager.navigate('menu'));
document.getElementById('btn-back-menu')?.addEventListener('click', () => {
    if(timerInterval) clearInterval(timerInterval);
    UIManager.navigate('menu');
});

// Kullanıcı Akışı
const checkUser = () => {
  if (!UserManager.getUsername()) UIManager.toggleModal('username-modal', true);
  else {
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
  }
});
checkUser();

// Modallar
document.getElementById('btn-leaderboard')?.addEventListener('click', async () => {
  UIManager.toggleModal('view-leaderboard', true);
  const players = await Leaderboard.fetchTopPlayers();
  UIManager.renderLeaderboard(players, 'gold');
});
document.getElementById('close-leaderboard')?.addEventListener('click', () => UIManager.toggleModal('view-leaderboard', false));
document.getElementById('btn-shop')?.addEventListener('click', () => UIManager.toggleModal('view-shop', true));
document.getElementById('close-shop')?.addEventListener('click', () => UIManager.toggleModal('view-shop', false));
