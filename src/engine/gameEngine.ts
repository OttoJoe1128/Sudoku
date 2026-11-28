import { UIManager } from '../ui';
import { SoundManager } from './soundManager';
import { t } from '../i18n/translations';

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
    if (userBoard && userBoard[r] && userBoard[r][c] !== 0) {
      UIManager.showToast(t('cell_completed_toast'), "info");
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
      UIManager.showToast(t('error_move_toast'), "error");
      onError(1);
      return false;
    }

    userBoard[r][c] = num;
    this.playSound('tap');

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
