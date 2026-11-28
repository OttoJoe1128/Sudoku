// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui';
import { SoundManager } from '../engine/soundManager';

describe('Adım 1: Çekirdek Tahta Katmanı, Numpad & HUD Revizyonu', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
  });

  it('1. Model 1 Ergonomik Numpad: Kalan sayaç rozetleri ve tamamlanma rünü', () => {
    const remainingCounts = new Map<number, number>([
      [1, 0], // Tamamlandı
      [2, 4],
      [9, 1]
    ]);

    UIManager.renderNumpad(() => {}, remainingCounts, false, 2);

    const btn1 = document.querySelector('[data-numpad-num="1"]') as HTMLElement;
    const btn2 = document.querySelector('[data-numpad-num="2"]') as HTMLElement;
    const btn9 = document.querySelector('[data-numpad-num="9"]') as HTMLElement;

    expect(btn1).not.toBeNull();
    expect(btn1.className).toContain('opacity-30');
    expect(btn1.className).toContain('pointer-events-none');
    expect(btn1.textContent).toContain('✓');

    expect(btn2.textContent).toContain('4');
    expect(btn9.textContent).toContain('1');
  });

  it('2. Tahta Hata Reaksiyonu (Shake & Crack): triggerBoardShakeAndCrack tahtayı anlık kırmızıyla sarsmalı', () => {
    const boardEl = document.getElementById('sudoku-grid');
    expect(boardEl).not.toBeNull();

    UIManager.triggerBoardShakeAndCrack();
    expect(boardEl?.classList.contains('border-rose-600')).toBe(true);
    expect(boardEl?.classList.contains('ring-rose-600')).toBe(true);
  });

  it('3. Audio-Haptic Matrix: playBlockComplete hatasız çağrılabilmeli', () => {
    expect(() => SoundManager.playBlockComplete()).not.toThrow();
  });

  it('4. Vektörel Çözücü Işınları: İleri teknikte #hint-raycast-overlay SVG çizgileri çizilmeli', () => {
    const board = Array.from({ length: 9 }, () => new Array(9).fill(0));
    const smartHint = {
      row: 0,
      col: 1,
      relatedCells: [],
      primaryCells: [
        { r: 0, c: 1 },
        { r: 0, c: 7 },
        { r: 8, c: 1 },
        { r: 8, c: 7 }
      ]
    };

    UIManager.renderBoard(board, () => {}, -1, -1, undefined, undefined, 'classic', undefined, undefined, undefined, smartHint as any);

    const overlay = document.getElementById('hint-raycast-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay?.tagName.toLowerCase()).toBe('svg');

    const lines = overlay?.querySelectorAll('line');
    expect(lines && lines.length).toBeGreaterThan(0);
    expect(lines?.[0].getAttribute('stroke')).toBe('#F59E0B');
  });
});
