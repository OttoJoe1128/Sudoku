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
let errors = 0;
let hintsUsed = 0;

const startGame = (level: number, diff: 'basit' | 'orta' | 'zor') => {
    localStorage.setItem('last_selected_diff', diff);
    errors = 0;
    hintsUsed = 0;
    const data = SudokuGen.generate(diff);
    currentSolution = data.solution;
    userBoard = data.puzzle;
    
    const title = document.getElementById('game-title');
    if (title) title.innerText = `Seviye ${level}`;
    
    UIManager.navigate('game');
    
    const refresh = () => {
        UIManager.renderBoard(userBoard, (r, c) => {
            selectedCell = {r, c};
            refresh();
        }, selectedCell?.r ?? -1, selectedCell?.c ?? -1);
    };

    refresh();
    
    UIManager.renderNumpad((num) => {
        if (!selectedCell) return alert("Hücre seç!");
        
        if (num === -1) { // İpucu butonu (renderNumpad'e eklenecek)
            if (hintsUsed >= 5) return alert("İpucu sınırı doldu!");
            // Altın kontrolü (Rewards mantığı ile)
            hintsUsed++;
            // ... (İpucu mantığı)
            return;
        }

        const success = GameEngine.processInput(selectedCell.r, selectedCell.c, num, userBoard, currentSolution, () => {
            // WIN
            const userLvl = UserManager.getCurrentLevel();
            if (level === userLvl) localStorage.setItem('sudoku_level', (userLvl + 1).toString());
            alert("Tebrikler!");
            UIManager.navigate('menu');
        }, (errs) => {
            errors += errs;
            if (errors >= 3) {
                alert("Oyun Bitti! 3 hata yaptın.");
                UIManager.navigate('menu');
            }
        });
        refresh();
    });
};

// ... (Kullanıcı akışı ve diğer kodlar aynı)
