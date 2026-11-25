// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { setLang, t, TRANSLATIONS } from '../i18n/translations';
import { startGame, initGameController, getGameRuntimeState } from '../controllers/gameController';

describe('Faz 4b Release Polish Verification Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initGameController({
      onUpdateGoldDisplay: () => {},
      onReturnToMap: () => {}
    });
  });

  it('1. Undo (Geri Al) Akışı: Not modunda eklenen adaylar sırasıyla geri alınmalı, çözülmüş hücreler bozulmamalı', () => {
    startGame(1, 'basit', undefined, undefined, 'classic', false);

    const runtime = getGameRuntimeState();
    expect(runtime).not.toBeNull();

    // 1. Boş hücre bul
    let emptyR = -1;
    let emptyC = -1;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (runtime.userBoard[r][c] === 0) {
          emptyR = r;
          emptyC = c;
          break;
        }
      }
      if (emptyR !== -1) break;
    }

    expect(emptyR).not.toBe(-1);

    // Hücreyi seç ve not modunu aç
    const gridEl = document.getElementById('sudoku-grid');
    const cellEl = gridEl?.children[emptyR * 9 + emptyC] as HTMLElement;
    expect(cellEl).not.toBeNull();
    cellEl?.click();

    const notesBtn = document.getElementById('btn-toggle-notes');
    notesBtn?.click();

    // Numpad 3 (index 2) ve 7 (index 6) seç
    const numpadGrid = document.getElementById('numpad-grid');
    const numpad3 = numpadGrid?.children[2] as HTMLElement;
    const numpad7 = numpadGrid?.children[6] as HTMLElement;

    expect(numpad3).not.toBeNull();
    expect(numpad7).not.toBeNull();

    numpad3?.click();
    numpad7?.click();

    let updatedState = getGameRuntimeState();
    const cellNotes = updatedState.notesBoard[emptyR][emptyC];
    expect(cellNotes.has(3)).toBe(true);
    expect(cellNotes.has(7)).toBe(true);

    // Undo 1. tık -> 7 silinmeli, 3 kalmalı
    const undoBtn = document.getElementById('btn-undo');
    expect(undoBtn).not.toBeNull();

    undoBtn?.click();
    updatedState = getGameRuntimeState();
    expect(updatedState.notesBoard[emptyR][emptyC].has(7)).toBe(false);
    expect(updatedState.notesBoard[emptyR][emptyC].has(3)).toBe(true);

    // Undo 2. tık -> 3 de silinmeli (boş kalmalı)
    undoBtn?.click();
    updatedState = getGameRuntimeState();
    expect(updatedState.notesBoard[emptyR][emptyC].size).toBe(0);

    // Çözülmüş/kilitli hücre seçildiğinde Undo basılması çözülmüş rakamı bozmamalı
    let solvedR = -1;
    let solvedC = -1;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (runtime.initialBoard[r][c] !== 0) {
          solvedR = r;
          solvedC = c;
          break;
        }
      }
      if (solvedR !== -1) break;
    }

    const initialVal = runtime.initialBoard[solvedR][solvedC];
    const solvedCellEl = gridEl?.children[solvedR * 9 + solvedC] as HTMLElement;
    solvedCellEl?.click();

    undoBtn?.click();
    updatedState = getGameRuntimeState();
    expect(updatedState.userBoard[solvedR][solvedC]).toBe(initialVal);
  });

  it('2. Safe-Area Doğrulaması: Alt dock ve #game-view stillerinde safe-area-inset-bottom bulunmalı', () => {
    const menuHTML = document.getElementById('app')?.innerHTML || '';
    expect(menuHTML).toContain('safe-area-inset-bottom');

    const gameView = document.getElementById('game-view');
    expect(gameView?.getAttribute('style')).toContain('safe-area-inset-bottom');
  });

  it('3. Çift Dilli Sızıntı (TR <-> EN): btn_undo ve toast_undo_empty anahtarları doğru çevrilmeli', () => {
    const keys = ['btn_undo', 'toast_undo_empty'];
    const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;

    keys.forEach(k => {
      const trVal = TRANSLATIONS.tr[k] || '';
      const enVal = TRANSLATIONS.en[k] || '';

      expect(trVal.length).toBeGreaterThan(0);
      expect(enVal.length).toBeGreaterThan(0);

      // EN metninde Türkçe özel karakter olmamalı
      expect(trCharRegex.test(enVal)).toBe(false);
    });
  });
});
