import { UIManager } from './ui/uiManager';
import { GameEngine } from './engine/gameEngine';
import { SudokuGen } from './engine/sudoku';
import { UserManager } from './store/userState';
import { Leaderboard } from './engine/leaderboard';

UIManager.mountUI();

let currentSolution: number[][];
let userBoard: number[][];
let selectedCell: {r: number, c: number} | null = null;
let errors = 0;
let hintsUsed = 0;
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
    errors = 0;
    hintsUsed = 0;
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
        if (!selectedCell) return;
        
        if (num === -1) { // İpucu Butonu (Numpad içine entegre edildiğinde 💡 ikonuna basınca)
            if (hintsUsed >= 5) return alert("İpucu sınırı doldu!");
            // 10 altın maliyeti (burada altın yönetimi eklenmeli)
            userBoard[selectedCell.r][selectedCell.c] = currentSolution[selectedCell.r][selectedCell.c];
            hintsUsed++;
            refresh();
            return;
        }

        const success = GameEngine.processInput(selectedCell.r, selectedCell.c, num, userBoard, currentSolution, () => {
            const userLvl = UserManager.getCurrentLevel();
            if (level === userLvl) localStorage.setItem('sudoku_level', (userLvl + 1).toString());
            alert("Tebrikler!");
            UIManager.navigate('menu');
        }, (err) => {
            errors += err;
            if (errors >= 3) { alert("Oyun Bitti!"); UIManager.navigate('menu'); }
        });
        if (success) refresh();
    });
};

document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-level]');
    if (target) {
        const level = parseInt(target.getAttribute('data-level')!);
        const diff = SudokuGen.getDifficulty(level);
        startGame(level, diff);
    }
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

// Navigasyon
document.getElementById('btn-journey')?.addEventListener('click', () => {
    const diff = localStorage.getItem('sudoku_diff') as 'basit'|'orta'|'zor' || 'basit';
    const startLvl = SudokuGen.getStartLevelForDifficulty(diff);
    UIManager.navigate('map');
    UIManager.renderMap(UserManager.getCurrentLevel(), startLvl);
});

document.getElementById('btn-diff-basit')?.addEventListener('click', () => { localStorage.setItem('sudoku_diff', 'basit'); UIManager.renderMap(UserManager.getCurrentLevel(), 1); });
document.getElementById('btn-diff-orta')?.addEventListener('click', () => { localStorage.setItem('sudoku_diff', 'orta'); UIManager.renderMap(UserManager.getCurrentLevel(), 301); });
document.getElementById('btn-diff-zor')?.addEventListener('click', () => { localStorage.setItem('sudoku_diff', 'zor'); UIManager.renderMap(UserManager.getCurrentLevel(), 701); });

document.getElementById('btn-back-menu')?.addEventListener('click', () => {
    if(timerInterval) clearInterval(timerInterval);
    UIManager.navigate('menu');
});

// Modallar
document.getElementById('btn-leaderboard')?.addEventListener('click', async () => {
  UIManager.toggleModal('view-leaderboard', true);
  const players = await Leaderboard.fetchTopPlayers();
  UIManager.renderLeaderboard(players, 'gold');
});
document.getElementById('close-leaderboard')?.addEventListener('click', () => UIManager.toggleModal('view-leaderboard', false));
document.getElementById('btn-shop')?.addEventListener('click', () => UIManager.toggleModal('view-shop', true));
document.getElementById('close-shop')?.addEventListener('click', () => UIManager.toggleModal('view-shop', false));
