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
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'tap') osc.frequency.value = 600;
      else if (type === 'error') osc.frequency.value = 180;
      else osc.frequency.value = 880;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
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
