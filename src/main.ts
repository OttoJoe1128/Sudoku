import { UIManager } from './ui/uiManager';
import { GameEngine } from './engine/gameEngine';
import { SudokuGen } from './engine/sudoku';
import { UserManager } from './store/userState';
import { Leaderboard } from './engine/leaderboard';
import { App } from '@capacitor/app';

UIManager.mountUI();

let currentSolution: number[][];
let userBoard: number[][];
let initialBoard: number[][];
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
    selectedCell = null;

    const data = SudokuGen.generate(diff);
    currentSolution = data.solution;
    // Derin kopya (deep copy) alarak başlangıç bulmacasını saklıyoruz
    userBoard = data.puzzle.map(row => [...row]);
    initialBoard = data.puzzle.map(row => [...row]);

    const title = document.getElementById('game-title');
    if (title) title.innerText = `Seviye ${level}`;

    const updateErrorUI = () => {
        const errorEl = document.getElementById('game-errors');
        if (errorEl) errorEl.innerText = `Hata: ${errors}/3`;
    };
    updateErrorUI();

    UIManager.navigate('game');
    startTimer();

    const refresh = () => {
        UIManager.renderBoard(
            userBoard,
            (r, c) => {
                // Verilen sabit sayı kilitliyse seçmeyelim/vurgulayalım
                if (initialBoard[r][c] !== 0) {
                    selectedCell = null;
                } else {
                    selectedCell = {r, c};
                }
                refresh();
            },
            selectedCell?.r ?? -1,
            selectedCell?.c ?? -1,
            initialBoard
        );
    };

    refresh();

    // Ekrandaki İpucu Butonunu Dinle
    const hintBtn = document.getElementById('btn-hint');
    if (hintBtn) {
        hintBtn.onclick = () => {
            if (!selectedCell) return alert("Lütfen önce boş bir hücre seçin!");
            if (initialBoard[selectedCell.r][selectedCell.c] !== 0) return alert("Bu hücre kilitli!");
            if (hintsUsed >= 5) return alert("İpucu sınırı doldu!");
            userBoard[selectedCell.r][selectedCell.c] = currentSolution[selectedCell.r][selectedCell.c];
            hintsUsed++;
            refresh();
        };
    }

    UIManager.renderNumpad((num) => {
        if (!selectedCell) return;

        if (num === -1) { // İpucu Butonu Numpad'den tetiklenirse
            if (hintsUsed >= 5) return alert("İpucu sınırı doldu!");
            if (initialBoard[selectedCell.r][selectedCell.c] !== 0) return;
            userBoard[selectedCell.r][selectedCell.c] = currentSolution[selectedCell.r][selectedCell.c];
            hintsUsed++;
            refresh();
            return;
        }

        const success = GameEngine.processInput(
            selectedCell.r,
            selectedCell.c,
            num,
            userBoard,
            currentSolution,
            initialBoard,
            () => {
                if (timerInterval) clearInterval(timerInterval);
                const userLvl = UserManager.getCurrentLevel();
                if (level === userLvl) localStorage.setItem('sudoku_level', (userLvl + 1).toString());
                alert("Tebrikler, Bulmacayı Çözdünüz!");
                UIManager.navigate('menu');
            },
            (errCount) => {
                errors += errCount;
                updateErrorUI();
                if (errors >= 3) {
                    if (timerInterval) clearInterval(timerInterval);
                    alert("Oyun Bitti! 3 Hata Yaptınız.");
                    UIManager.navigate('menu');
                }
            }
        );
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

// Android Donanım Geri Tuşu Mantığı (Capacitor)
App.addListener('backButton', () => {
    // 1. Açık modal var mı kontrol et
    const modals = ['username-modal', 'view-leaderboard', 'view-shop'];
    const openModal = modals.find(id => {
        const el = document.getElementById(id);
        return el && !el.classList.contains('hidden');
    });

    if (openModal) {
        UIManager.toggleModal(openModal, false);
        return;
    }

    // 2. Aktif ekran kontrolü
    const gameView = document.getElementById('game-view');
    const mapView = document.getElementById('view-map');
    const customView = document.getElementById('view-custom');

    if (gameView && !gameView.classList.contains('hidden')) {
        if (timerInterval) clearInterval(timerInterval);
        UIManager.navigate('menu');
        return;
    }

    if (mapView && !mapView.classList.contains('hidden')) {
        UIManager.navigate('menu');
        return;
    }

    if (customView && !customView.classList.contains('hidden')) {
        UIManager.navigate('menu');
        return;
    }

    // 3. Zaten ana menüdeysek uygulamadan çık
    App.exitApp();
});
