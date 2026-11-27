// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  interpolateGhostProgress,
  generateFallbackGhostRun,
  GhostRunManager,
  GhostRunStep
} from '../engine/ghostRun';

describe('Faz 4 — Adım 4.1: Asenkron Hayalet Koşusu (Ghost Run) Motoru', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. interpolateGhostProgress: Zaman adımları arasında pürüzsüz interpolasyon sağlamalı', () => {
    const steps: GhostRunStep[] = [
      { tSec: 10, progressPct: 20, errors: 0 },
      { tSec: 20, progressPct: 50, errors: 0 },
      { tSec: 30, progressPct: 100, errors: 1 }
    ];

    // Başlangıç
    const at0 = interpolateGhostProgress(steps, 30, 0);
    expect(at0.progressPct).toBe(0);
    expect(at0.isFinished).toBe(false);

    // 15. saniye (10s: 20%, 20s: 50% -> tam ortası 35%)
    const at15 = interpolateGhostProgress(steps, 30, 15);
    expect(at15.progressPct).toBe(35);
    expect(at15.isFinished).toBe(false);

    // Bitiş (30. saniye)
    const at30 = interpolateGhostProgress(steps, 30, 30);
    expect(at30.progressPct).toBe(100);
    expect(at30.errors).toBe(1);
    expect(at30.isFinished).toBe(true);

    // Bitiş sonrası (35. saniye)
    const at35 = interpolateGhostProgress(steps, 30, 35);
    expect(at35.progressPct).toBe(100);
    expect(at35.isFinished).toBe(true);
  });

  it('2. generateFallbackGhostRun: Hedef reytinge uygun organik hayalet koşusu üretmeli', () => {
    const ghost = generateFallbackGhostRun('orta', 'classic', 1400);

    expect(ghost.id).toContain('ghost_');
    expect(ghost.playerRating).toBe(1400);
    expect(ghost.difficulty).toBe('orta');
    expect(ghost.steps.length).toBe(10);
    expect(ghost.steps[ghost.steps.length - 1].progressPct).toBe(100);
    expect(ghost.totalTimeSec).toBeGreaterThan(45);
  });

  it('3. GhostRunManager: Koşu kaydetme, depolama ve reyting eşleştirme', () => {
    expect(GhostRunManager.getGhostRuns().length).toBe(0);

    const saved = GhostRunManager.recordGhostRunFromGame(
      'u123',
      'SudokuPro',
      'fox',
      1500,
      'classic',
      'orta',
      120,
      0,
      [
        { tSec: 30, progressPct: 25 },
        { tSec: 60, progressPct: 50 },
        { tSec: 90, progressPct: 75 }
      ]
    );

    expect(saved.playerName).toBe('SudokuPro');
    expect(GhostRunManager.getGhostRuns().length).toBe(1);

    // Reyting eşleştirme testi
    const matched = GhostRunManager.findBestMatchingGhost('classic', 'orta', 1520);
    expect(matched.playerName).toBe('SudokuPro');
    expect(matched.playerRating).toBe(1500);
  });
});
