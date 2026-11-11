// src/engine/gameEngine.ts
import { UIManager } from '../ui/uiManager';

export const GameEngine = {
  playSound(type: 'tap' | 'error' | 'win') {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'tap') osc.frequency.value = 600;
      else if (type === 'error') osc.frequency.value = 150;
      else osc.frequency.value = 800;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio autoplay policy may suppress audio until user interaction
    }
  },

  doVibrate() {
    if (navigator.vibrate) navigator.vibrate([50]);
  },
  
  processInput(
    r: number,
    c: number,
    num: number,
    userBoard: number[][],
    solution: number[][],
    onWin: () => void,
    onError?: (err: number) => void
  ) {
    if (num === 0) { 
      userBoard[r][c] = 0;
    } else if (num !== solution[r][c]) {
      this.playSound('error');
      this.doVibrate();
      UIManager.showError(r, c);
      if (onError) onError(1);
      return false;
    } else {
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
    }
    return true;
  }
};
