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
let wasPlayingBeforeBackground = false;

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

      const now = ctx.currentTime;

      // 1. Friction Noise (Kağıt Üzerinde Kalem Sürtünme Sesi)
      const bufferSize = Math.floor(ctx.sampleRate * 0.04);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2800, now);
      noiseFilter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // 2. Graphite Pressure Tone (Grafit Kalem Ucu Temas Vuruşu)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.035);

      oscGain.gain.setValueAtTime(0.06, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start(now);
      osc.start(now);
      osc.stop(now + 0.04);
      noise.stop(now + 0.04);
    } catch {
      // ignore
    }
  },

  vibrate(pattern: number | number[]): void {
    if (!soundEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // ignore
    }
  },

  playError(): void {
    if (!soundEnabled) return;
    this.vibrate([45, 30, 45]);
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
    this.vibrate([30, 40, 60]);
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
    wasPlayingBeforeBackground = false;
  },

  pauseForBackground(): void {
    try {
      if (isBgmPlaying || (bgmAudio && !bgmAudio.paused)) {
        wasPlayingBeforeBackground = true;
        if (bgmAudio) {
          bgmAudio.pause();
        }
        isBgmPlaying = false;
      } else {
        wasPlayingBeforeBackground = false;
      }

      if (audioCtx && audioCtx.state === 'running' && typeof audioCtx.suspend === 'function') {
        audioCtx.suspend().catch(() => {});
      }
    } catch {
      // Node/Vitest safe
    }
  },

  resumeFromBackground(): void {
    try {
      if (audioCtx && audioCtx.state === 'suspended' && typeof audioCtx.resume === 'function') {
        audioCtx.resume().catch(() => {});
      }

      if (soundEnabled && wasPlayingBeforeBackground) {
        wasPlayingBeforeBackground = false;
        if (!isInGame && typeof window !== 'undefined') {
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
        }
      }
    } catch {
      // Node/Vitest safe
    }
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
