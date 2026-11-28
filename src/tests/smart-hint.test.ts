// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui';
import { UserManager } from '../store/userState';
import { setLang, t, applyStaticTranslations, TRANSLATIONS } from '../i18n/translations';
import { findSmartHint, getCandidates, formatHintSymbol } from '../engine/hintSolver';
import { initGameController, startGame, getGameRuntimeState } from '../controllers/gameController';
import { initAcademyController, openAcademyBooklet } from '../controllers/academyController';
import { auth } from '../api/firebase';

describe('Faz 2.5d Açıklamalı Akıllı İpucu Motoru & Faz 2.5c Bağlantı Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');

    if (auth) {
      (auth as any).currentUser = {
        uid: 'test_user_uid',
        getIdToken: () => Promise.resolve('mock_token'),
        stsTokenManager: { accessToken: 'mock_token' }
      };
    }

    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();

    initGameController({
      onUpdateGoldDisplay: () => {
        const goldEl = document.getElementById('menu-gold');
        if (goldEl) goldEl.innerText = UserManager.getGold().toString();
      }
    });

    initAcademyController();
  });

  describe('1. Naked Single Tespiti', () => {
    it('tek aday kalan hücrede findSmartHint naked_single döndürmeli', () => {
      const userBoard = [
        [1, 2, 3, 4, 5, 6, 7, 8, 0],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 1, 5, 6, 4, 8, 9, 7],
        [5, 6, 4, 8, 9, 7, 2, 3, 1],
        [8, 9, 7, 2, 3, 1, 5, 6, 4],
        [3, 1, 2, 6, 4, 5, 9, 7, 8],
        [6, 4, 5, 9, 7, 8, 3, 1, 2],
        [9, 7, 8, 3, 1, 2, 6, 4, 5]
      ];
      const solution = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 1, 5, 6, 4, 8, 9, 7],
        [5, 6, 4, 8, 9, 7, 2, 3, 1],
        [8, 9, 7, 2, 3, 1, 5, 6, 4],
        [3, 1, 2, 6, 4, 5, 9, 7, 8],
        [6, 4, 5, 9, 7, 8, 3, 1, 2],
        [9, 7, 8, 3, 1, 2, 6, 4, 5]
      ];

      const hint = findSmartHint(userBoard, solution);
      expect(hint).not.toBeNull();
      expect(hint?.technique).toBe('naked_single');
      expect(hint?.row).toBe(0);
      expect(hint?.col).toBe(8);
      expect(hint?.digit).toBe(9);
    });
  });

  describe('2. Hidden Single Tespiti', () => {
    it('sıfır Naked Single içeren tahtada hidden_single_box döndürmeli', () => {
      const solution = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 1, 5, 6, 4, 8, 9, 7],
        [5, 6, 4, 8, 9, 7, 2, 3, 1],
        [8, 9, 7, 2, 3, 1, 5, 6, 4],
        [3, 1, 2, 6, 4, 5, 9, 7, 8],
        [6, 4, 5, 9, 7, 8, 3, 1, 2],
        [9, 7, 8, 3, 1, 2, 6, 4, 5]
      ];
      // Tüm 1, 2, 3 hücreleri boş; yalnızca (3,2)=1 ve (6,1)=1 dolu
      const userBoard = solution.map((row, r) =>
        row.map((val, c) => {
          if (val === 2 || val === 3) return 0;
          if (val === 1 && !((r === 3 && c === 2) || (r === 6 && c === 1))) return 0;
          return val;
        })
      );

      // Tahtadaki HER boş hücrede >= 2 aday olmalı (sıfır Naked Single garantisi)
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (userBoard[r][c] === 0) {
            expect(getCandidates(userBoard, r, c).length).toBeGreaterThanOrEqual(2);
          }
        }
      }

      const hint = findSmartHint(userBoard, solution);
      expect(hint).not.toBeNull();
      expect(hint?.technique).toBe('hidden_single_box');
      expect(hint?.row).toBe(0);
      expect(hint?.col).toBe(0);
      expect(hint?.digit).toBe(1);
    });
  });

  describe('3. Wordoku Sembol Biçimlendirme', () => {
    it('formatHintSymbol Wordoku ve Klasik modda doğru karakterleri dönmeli', () => {
      expect(formatHintSymbol(1, 'wordoku')).toBe('A');
      expect(formatHintSymbol(9, 'wordoku')).toBe('I');
      expect(formatHintSymbol(5, 'wordoku')).toBe('E');
      expect(formatHintSymbol(7, 'classic')).toBe('7');
    });
  });

  describe('4. DOM 2 Aşamalı İpucu Akışı & Sıfır Dil Sızıntısı', () => {
    it('#btn-hint 1. tıkta şerit açılmalı (altın düşmemeli), 2. tıkta altın düşüp hücre dolmalı', async () => {
      localStorage.setItem('sudoku_gold', '100');
      startGame(1, 'basit', undefined, undefined, 'classic', false);

      const hintBtn = document.getElementById('btn-hint');
      expect(hintBtn).not.toBeNull();

      // 1. Tıklama (Ücretsiz mantık şeridi gösterimi)
      hintBtn?.click();
      expect(UserManager.getGold()).toBe(100);

      const banner = document.getElementById('smart-hint-banner');
      expect(banner?.classList.contains('hidden')).toBe(false);

      const targetCell = document.querySelector('[data-hint-target="true"]');
      expect(targetCell).not.toBeNull();

      // 2. Tıklama (#btn-apply-smart-hint tıklaması - async)
      const applyBtn = document.getElementById('btn-apply-smart-hint');
      (applyBtn as HTMLElement)?.click();

      await new Promise(r => setTimeout(r, 60));

      expect(UserManager.getGold()).toBe(90);
      expect(banner?.classList.contains('hidden')).toBe(true);
    });

    it('EN modunda ipucu şeridinde Türkçe karakter, TR modunda İngilizce kelime sızmamalı', () => {
      setLang('en');
      applyStaticTranslations();

      startGame(1, 'basit', undefined, undefined, 'classic', false);
      const hintBtn = document.getElementById('btn-hint');
      hintBtn?.click();

      const banner = document.getElementById('smart-hint-banner');
      const text = banner?.textContent || '';
      const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;

      expect(trCharRegex.test(text)).toBe(false);

      // TR Moduna geç
      setLang('tr');
      applyStaticTranslations();

      document.getElementById('btn-dismiss-smart-hint')?.click();
      hintBtn?.click();

      const textTr = banner?.textContent || '';
      const forbiddenEnWords = /\b(Region|Level|Single|Pair|Row|Column|Box|Hint|Apply|Gold)\b/i;

      expect(forbiddenEnWords.test(textTr)).toBe(false);
    });

    it('Son tek boş hücrede akıllı ipucu kullanıldığında zafer akışı tetiklenmeli ve seviye artmalı', async () => {
      localStorage.setItem('sudoku_gold', '100');
      startGame(1, 'basit', undefined, undefined, 'classic', false);

      const state = getGameRuntimeState();
      const solution = state.currentSolution;
      const uBoard = state.userBoard;
      const iBoard = state.initialBoard;

      let emptyCells: { r: number; c: number }[] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (iBoard[r][c] === 0) {
            emptyCells.push({ r, c });
          }
        }
      }

      expect(emptyCells.length).toBeGreaterThan(1);

      // Son boş hücre hariç tümünü doğru rakamla doldur
      const lastEmptyCell = emptyCells.pop()!;
      emptyCells.forEach(cell => {
        uBoard[cell.r][cell.c] = solution[cell.r][cell.c];
      });

      // Son boş hücreyi seç
      const lastCellEl = document.querySelectorAll('#sudoku-grid > div')[lastEmptyCell.r * 9 + lastEmptyCell.c] as HTMLElement;
      lastCellEl?.click();

      const hintBtn = document.getElementById('btn-hint');
      hintBtn?.click();

      const banner = document.getElementById('smart-hint-banner');
      expect(banner?.classList.contains('hidden')).toBe(false);

      const applyBtn = document.getElementById('btn-apply-smart-hint');
      (applyBtn as HTMLElement)?.click();

      await new Promise(r => setTimeout(r, 250));

      expect(UserManager.getVariantLevel('classic')).toBe(2);
      expect(banner?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('5. main.ts Akademi Bağlantı Doğrulaması', () => {
    it('#btn-open-academy tıklandığında #academy-modal açılmalı', () => {
      UIManager.navigate('map');
      const btnAcademy = document.getElementById('btn-open-academy');
      expect(btnAcademy).not.toBeNull();

      (btnAcademy as HTMLElement)?.click();

      const academyModal = document.getElementById('academy-modal');
      expect(academyModal?.classList.contains('hidden')).toBe(false);
    });
  });

  describe('6. İnteraktif Adım Adım Açıklamalı Çözücü UI', () => {
    it('#btn-hint ile açılan ipucunda adım adım inceleme (#btn-step-smart-hint) çalışmalı', () => {
      startGame(1, 'basit', undefined, undefined, 'classic', false);
      const hintBtn = document.getElementById('btn-hint');
      hintBtn?.click();

      const banner = document.getElementById('smart-hint-banner');
      const stepBadge = document.getElementById('smart-hint-step-badge');
      const stepBtn = document.getElementById('btn-step-smart-hint');

      expect(banner?.classList.contains('hidden')).toBe(false);
      expect(stepBadge?.classList.contains('hidden')).toBe(false);
      expect(stepBadge?.innerText).toContain('1/2');
      expect(stepBtn?.classList.contains('hidden')).toBe(false);

      // 2. Adıma ilerle
      stepBtn?.click();
      expect(stepBadge?.innerText).toContain('2/2');
      expect(stepBtn?.classList.contains('hidden')).toBe(true);

      // Kapat
      document.getElementById('btn-dismiss-smart-hint')?.click();
      expect(banner?.classList.contains('hidden')).toBe(true);
    });
  });
});
