import { UIManager } from './ui/uiManager';
import { GameEngine } from './engine/gameEngine';
import { SudokuGen } from './engine/sudoku';
import { UserManager } from './store/userState';

// Oyun Durumu
let currentSolution: number[][];
let userBoard: number[][];
let selectedCell: {r: number, c: number} | null = null;
let errors = 0;
let hintsUsed = 0;
let gold = 100; // Örnek başlangıç

const startGame = (level: number, diff: 'basit' | 'orta' | 'zor') => {
    errors = 0;
    hintsUsed = 0;
    const data = SudokuGen.generate(diff);
    currentSolution = data.solution;
    userBoard = data.puzzle;
    
    const title = document.getElementById('game-title');
    if (title) title.innerText = `Seviye ${level} (${diff})`;
    
    UIManager.navigate('game');
    
    const refresh = () => {
        UIManager.renderBoard(userBoard, (r, c) => {
            selectedCell = {r, c};
            refresh();
        }, selectedCell?.r ?? -1, selectedCell?.c ?? -1);
    };

    refresh();
    
    UIManager.renderNumpad((num) => {
        if (!selectedCell) return;
        
        if (num === -1) { // İpucu
            if (hintsUsed >= 5) return alert("İpucu sınırı doldu!");
            if (gold < 10) return alert("Altın yetersiz!");
            gold -= 10;
            hintsUsed++;
            // Basit bir ipucu mantığı
            userBoard[selectedCell.r][selectedCell.c] = currentSolution[selectedCell.r][selectedCell.c];
            refresh();
            return;
        }

        const success = GameEngine.processInput(selectedCell.r, selectedCell.c, num, userBoard, currentSolution, 
            () => { alert("Tebrikler!"); UIManager.navigate('menu'); },
            (errCount) => {
                errors += errCount;
                alert(`Hatalı hamle! (${errors}/3)`);
                if (errors >= 3) { alert("Oyun Bitti!"); UIManager.navigate('menu'); }
            }
        );
        if (success) refresh();
    });
};

// ... (Kullanıcı akışı ve diğer eventler)
UIManager.mountUI();

// Zorluk Kontrolü ve Başlatma
const handleJourneyClick = () => {
    const savedDiff = localStorage.getItem('sudoku_diff');
    if (savedDiff) {
        // Kayıtlı zorluk varsa haritayı o zorluğun seviyesinden aç
        const diff = savedDiff as 'basit'|'orta'|'zor';
        const startLvl = SudokuGen.getStartLevelForDifficulty(diff);
        UIManager.navigate('map');
        UIManager.renderMap(UserManager.getCurrentLevel(), startLvl);
    } else {
        // Zorluk seçimi ekranına git
        UIManager.navigate('custom');
    }
};

document.getElementById('btn-journey')?.addEventListener('click', handleJourneyClick);

// Zorluk Seçim butonları
const setDifficulty = (diff: 'basit' | 'orta' | 'zor') => {
    localStorage.setItem('sudoku_diff', diff);
    const startLvl = SudokuGen.getStartLevelForDifficulty(diff);
    UIManager.navigate('map');
    UIManager.renderMap(UserManager.getCurrentLevel(), startLvl);
};

document.getElementById('btn-diff-basit')?.addEventListener('click', () => setDifficulty('basit'));
document.getElementById('btn-diff-orta')?.addEventListener('click', () => setDifficulty('orta'));
document.getElementById('btn-diff-zor')?.addEventListener('click', () => setDifficulty('zor'));

// Harita tıklama delegasyonu
document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-level]');
    if (target) {
        const level = parseInt(target.getAttribute('data-level')!);
        const diff = localStorage.getItem('sudoku_diff') as 'basit'|'orta'|'zor';
        startGame(level, diff || 'basit');
    }
});

// Kullanıcı işlemleri
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
