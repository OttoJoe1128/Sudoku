import { SudokuVariant } from './sudoku';

export interface GhostRunStep {
  tSec: number;
  progressPct: number; // 0 - 100
  errors: number;
}

export interface GhostRunRecord {
  id: string;
  playerUid: string;
  playerName: string;
  playerAvatar: string;
  playerRating: number;
  variant: SudokuVariant;
  difficulty: 'basit' | 'orta' | 'zor';
  totalTimeSec: number;
  finalErrors: number;
  steps: GhostRunStep[];
  createdAtMs: number;
}

const STORAGE_KEY_GHOST_RUNS = 'sudokumap_ghost_runs_v1';

export function interpolateGhostProgress(
  steps: GhostRunStep[],
  totalTimeSec: number,
  elapsedSec: number
): { progressPct: number; errors: number; isFinished: boolean } {
  if (steps.length === 0 || totalTimeSec <= 0) {
    const isFinished = elapsedSec >= Math.max(60, totalTimeSec);
    const progressPct = isFinished ? 100 : Math.min(99, Math.round((elapsedSec / Math.max(60, totalTimeSec)) * 100));
    return { progressPct, errors: 0, isFinished };
  }

  if (elapsedSec >= totalTimeSec) {
    const lastStep = steps[steps.length - 1];
    return {
      progressPct: 100,
      errors: lastStep.errors,
      isFinished: true
    };
  }

  if (elapsedSec <= 0) {
    return { progressPct: 0, errors: 0, isFinished: false };
  }

  let prevStep: GhostRunStep = { tSec: 0, progressPct: 0, errors: 0 };
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.tSec >= elapsedSec) {
      const timeSpan = step.tSec - prevStep.tSec;
      const progressSpan = step.progressPct - prevStep.progressPct;
      const factor = timeSpan > 0 ? (elapsedSec - prevStep.tSec) / timeSpan : 0;
      const currentPct = Math.round(prevStep.progressPct + progressSpan * factor);
      return {
        progressPct: Math.min(100, Math.max(0, currentPct)),
        errors: prevStep.errors,
        isFinished: false
      };
    }
    prevStep = step;
  }

  const last = steps[steps.length - 1];
  return {
    progressPct: Math.min(100, last.progressPct),
    errors: last.errors,
    isFinished: false
  };
}

export function generateFallbackGhostRun(
  difficulty: 'basit' | 'orta' | 'zor',
  variant: SudokuVariant = 'classic',
  targetRating: number = 1200
): GhostRunRecord {
  const baseTime = difficulty === 'basit' ? 95 : difficulty === 'orta' ? 165 : 255;
  const ratingBonusSec = Math.max(-40, Math.min(60, Math.round((1200 - targetRating) / 25)));
  const totalTimeSec = Math.max(45, baseTime + ratingBonusSec);

  const stepsCount = 10;
  const steps: GhostRunStep[] = [];
  const hasError = difficulty === 'zor' ? true : false;
  const errorTimeSec = hasError ? Math.round(totalTimeSec * 0.4) : -1;

  for (let i = 1; i <= stepsCount; i++) {
    const tSec = Math.round((totalTimeSec / stepsCount) * i);
    const progressPct = Math.min(100, Math.round((i / stepsCount) * 100));
    const errors = (hasError && tSec >= errorTimeSec) ? 1 : 0;
    steps.push({ tSec, progressPct, errors });
  }

  const ghostNames = ['AuraMaster', 'ShadowGrid', 'ZenRune', 'EchoSolver', 'NovaSudoku'];
  const ghostAvatars = ['fox', 'owl', 'wolf', 'cat', 'panda'];
  const nameIdx = Math.abs(Math.round(targetRating)) % ghostNames.length;
  const avatarIdx = Math.abs(Math.round(targetRating)) % ghostAvatars.length;

  return {
    id: `ghost_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    playerUid: `ghost_user_${Math.floor(Math.random() * 9000 + 1000)}`,
    playerName: ghostNames[nameIdx],
    playerAvatar: ghostAvatars[avatarIdx],
    playerRating: targetRating,
    variant,
    difficulty,
    totalTimeSec,
    finalErrors: hasError ? 1 : 0,
    steps,
    createdAtMs: Date.now()
  };
}

export const GhostRunManager = {
  getGhostRuns(): GhostRunRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GHOST_RUNS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveGhostRun(record: GhostRunRecord): void {
    try {
      const runs = this.getGhostRuns();
      runs.unshift(record);
      if (runs.length > 40) runs.length = 40;
      localStorage.setItem(STORAGE_KEY_GHOST_RUNS, JSON.stringify(runs));
    } catch {
      // ignore
    }
  },

  findBestMatchingGhost(
    variant: SudokuVariant,
    difficulty: 'basit' | 'orta' | 'zor',
    playerRating: number
  ): GhostRunRecord {
    const all = this.getGhostRuns().filter(
      r => r.variant === variant && r.difficulty === difficulty
    );

    if (all.length > 0) {
      all.sort((a, b) => Math.abs(a.playerRating - playerRating) - Math.abs(b.playerRating - playerRating));
      const closest = all[0];
      if (Math.abs(closest.playerRating - playerRating) <= 250) {
        return closest;
      }
    }

    return generateFallbackGhostRun(difficulty, variant, playerRating);
  },

  recordGhostRunFromGame(
    playerUid: string,
    playerName: string,
    playerAvatar: string,
    playerRating: number,
    variant: SudokuVariant,
    difficulty: 'basit' | 'orta' | 'zor',
    totalTimeSec: number,
    finalErrors: number,
    snapshots: { tSec: number; progressPct: number }[]
  ): GhostRunRecord {
    const steps: GhostRunStep[] = snapshots.map(s => ({
      tSec: s.tSec,
      progressPct: Math.min(100, Math.max(0, s.progressPct)),
      errors: finalErrors
    }));

    if (steps.length === 0 || steps[steps.length - 1].progressPct < 100) {
      steps.push({ tSec: totalTimeSec, progressPct: 100, errors: finalErrors });
    }

    const record: GhostRunRecord = {
      id: `ghost_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      playerUid,
      playerName,
      playerAvatar,
      playerRating,
      variant,
      difficulty,
      totalTimeSec,
      finalErrors,
      steps,
      createdAtMs: Date.now()
    };

    this.saveGhostRun(record);
    return record;
  }
};
