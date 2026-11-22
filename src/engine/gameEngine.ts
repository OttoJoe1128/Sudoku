import { UIManager } from '../ui/uiManager';
import { SoundManager } from './soundManager';

export const GameEngine = {
  playSound(type: 'tap' | 'error' | 'win') {
    try {
      if (type === 'tap') SoundManager.playNumber();
      else if (type === 'error') SoundManager.playError();
      else if (type === 'win') SoundManager.playWin();
    } catch {
      // ignore audio errors
    }
  },

  doVibrate() {
    try {
      if (navigator.vibrate) navigator.vibrate([60]);
    } catch {
      // ignore
    }
  },

  processInput(
    r: number,
    c: number,
    num: number,
    userBoard: number[][],
    solution: number[][],
    initialBoard: number[][],
    onWin: () => void,
    onError: (count: number) => void
  ): boolean {
    // 1. Hücre kilit kontrolü: Zaten doğru çözülmüş veya başlangıçta verilmiş olan dolu hücreler değiştirilemez
    if (userBoard && userBoard[r] && userBoard[r][c] !== 0) {
      UIManager.showToast("Bu hücre tamamlanmıştır, değiştirilemez.", "info");
      return false;
    }

    if (num === 0) { 
      return false;
    }

    if (!solution || !solution[r] || solution[r][c] === undefined) {
      console.error("Çözüm verisi bulunamadı!");
      return false;
    }

    if (num !== solution[r][c]) {
      this.playSound('error');
      this.doVibrate();
      UIManager.showError(r, c);
      UIManager.showToast("❌ Hatalı hamle!", "error");
      onError(1);
      return false;
    }

    userBoard[r][c] = num;
    this.playSound('tap');

    // Kazandık mı kontrol et
    const isWin = userBoard.every((row, ri) =>
      row.every((val, ci) => val === solution[ri][ci])
    );
    if (isWin) {
      this.playSound('win');
      onWin();
    }
    return true;
  }
};
