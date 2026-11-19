let soundEnabled = true;
try {
  soundEnabled = localStorage.getItem('sudoku_sound_enabled') !== 'false';
} catch {
  soundEnabled = true;
}

let audioCtx: AudioContext | null = null;
let bgmAudio: HTMLAudioElement | null = null;
let isBgmPlaying = false;
let isInGame = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const SoundManager = {
  isEnabled(): boolean {
    return soundEnabled;
  },

  toggle(): boolean {
    soundEnabled = !soundEnabled;
    try {
      localStorage.setItem('sudoku_sound_enabled', soundEnabled ? 'true' : 'false');
    } catch {
      // ignore
    }

    if (!soundEnabled) {
      this.stopBgm();
    } else if (!isInGame) {
      this.startBgm();
    }

    return soundEnabled;
  },

  playTap(): void {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // ignore
    }
  },

  playNumber(): void {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // ignore
    }
  },

  playError(): void {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {
      // ignore
    }
  },

  playWin(): void {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const startTime = ctx.currentTime + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.22, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.22);
      });
    } catch {
      // ignore
    }
  },

  startBgm(): void {
    if (!soundEnabled || isBgmPlaying || isInGame) return;
    if (typeof window === 'undefined') return;

    try {
      if (!bgmAudio) {
        bgmAudio = new Audio('./audio/bgm.mp3');
        bgmAudio.loop = true;
        bgmAudio.volume = 0.28;
      }

      const playPromise = bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isBgmPlaying = true;
          })
          .catch(() => {
            isBgmPlaying = false;
          });
      }
    } catch {
      // ignore
    }
  },

  pauseBgm(): void {
    if (bgmAudio) {
      try {
        bgmAudio.pause();
      } catch {
        // ignore
      }
    }
    isBgmPlaying = false;
  },

  stopBgm(): void {
    if (bgmAudio) {
      try {
        bgmAudio.pause();
        bgmAudio.currentTime = 0;
      } catch {
        // ignore
      }
    }
    isBgmPlaying = false;
  },

  setInGame(inGame: boolean): void {
    isInGame = inGame;
    if (inGame) {
      this.pauseBgm();
    } else if (soundEnabled) {
      this.startBgm();
    }
  }
};
