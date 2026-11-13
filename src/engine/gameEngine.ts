import { UIManager } from '../ui/uiManager';

let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const GameEngine = {
  playSound(type: 'tap' | 'error' | 'win') {
    const ctx = getAudioContext();
    if (!ctx) return;
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
  },

  doVibrate() { if (navigator.vibrate) navigator.vibrate([50]); },
  
  processInput(
    r: number,
    c: number,
    num: number,
    userBoard: number[][],
    solution: number[][],
    initialBoard: number[][],
    onWin: () => void,
    onError: (count: number) => void
  ) {
    // 1. Orijinal hücre kilit kontrolü: verilen sayılar değiştirilemez
    if (initialBoard && initialBoard[r][c] !== 0) {
      return false;
    }

    if (num === 0) { 
      userBoard[r][c] = 0;
    } else if (num !== solution[r][c]) {
      this.playSound('error');
      this.doVibrate();
      UIManager.showError(r, c);
      onError(1);
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
