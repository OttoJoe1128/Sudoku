/**
 * SudokuMap - Dinamik Yapay Zekâ Destekli Adaptif Zorluk Ayarlaması (DDA)
 * Oyuncunun çözme hızını, hata sıklığını ve kararsızlık sürelerini izleyerek
 * akış kanalında (flow state) kalmasını sağlayan adaptasyon motoru.
 */

export interface PlayerPaceMetrics {
  consecutiveMistakes: number;
  movesMade: number;
  flawlessStreak: number;
  averageMoveTimeMs: number;
  lastMoveTimestamp: number;
}

export interface DDAAdjustment {
  scoutSupportActive: boolean;
  masterFlowActive: boolean;
  hesitationDetected: boolean;
  scoreMultiplier: number;
}

export function createInitialPaceMetrics(nowMs: number = Date.now()): PlayerPaceMetrics {
  return {
    consecutiveMistakes: 0,
    movesMade: 0,
    flawlessStreak: 0,
    averageMoveTimeMs: 0,
    lastMoveTimestamp: nowMs
  };
}

export function recordMoveInMetrics(
  metrics: PlayerPaceMetrics,
  isCorrect: boolean,
  nowMs: number = Date.now()
): PlayerPaceMetrics {
  const delta = metrics.lastMoveTimestamp > 0 ? Math.max(500, nowMs - metrics.lastMoveTimestamp) : 3000;
  const newMovesCount = metrics.movesMade + 1;
  const newAvgTime = metrics.movesMade === 0
    ? delta
    : Math.round((metrics.averageMoveTimeMs * metrics.movesMade + delta) / newMovesCount);

  if (isCorrect) {
    return {
      consecutiveMistakes: 0,
      movesMade: newMovesCount,
      flawlessStreak: metrics.flawlessStreak + 1,
      averageMoveTimeMs: newAvgTime,
      lastMoveTimestamp: nowMs
    };
  } else {
    return {
      consecutiveMistakes: metrics.consecutiveMistakes + 1,
      movesMade: newMovesCount,
      flawlessStreak: 0,
      averageMoveTimeMs: newAvgTime,
      lastMoveTimestamp: nowMs
    };
  }
}

export function evaluateDDA(metrics: PlayerPaceMetrics, nowMs: number = Date.now()): DDAAdjustment {
  const scoutSupportActive = metrics.consecutiveMistakes >= 2;
  const masterFlowActive = metrics.flawlessStreak >= 5 && metrics.averageMoveTimeMs <= 4500;
  const hesitationDetected = metrics.lastMoveTimestamp > 0 && (nowMs - metrics.lastMoveTimestamp) >= 45000;

  let scoreMultiplier = 1.0;
  if (masterFlowActive) {
    scoreMultiplier = 1.25; // Usta akışında +%25 skor bonusu
  }

  return {
    scoutSupportActive,
    masterFlowActive,
    hesitationDetected,
    scoreMultiplier
  };
}
