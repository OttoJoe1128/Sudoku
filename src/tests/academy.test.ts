// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/uiManager';
import { setLang, getLang, t, applyStaticTranslations, TRANSLATIONS } from '../i18n/translations';
import { REGIONS } from '../engine/rhythmConfig';
import {
  ACADEMY_LESSONS,
  getAcademyLessonForRegion,
  getAcademyLessonForLevel,
  isLessonUnlocked,
  hasSeenRegionLesson,
  markRegionLessonSeen,
  shouldAutoShowRegionLesson
} from '../engine/academyData';
import {
  initAcademyController,
  openAcademyBooklet,
  openAcademyLesson,
  closeAcademyModal,
  maybeShowRegionIntroLesson,
  refreshAcademyLanguageUI
} from '../controllers/academyController';

describe('Faz 2.5c Sudoku Akademisi Ders Kartları, Mini Diyagramlar & Kitapçık Modalı Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');

    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initAcademyController();
  });

  describe('1. Müfredat & 20 Diyagram Bütünlüğü', () => {
    it('ACADEMY_LESSONS tam 20 ders içermeli ve her derste 9 hücreli diyagram bulunmalı', () => {
      expect(ACADEMY_LESSONS.length).toBe(20);

      REGIONS.forEach(region => {
        const lesson = ACADEMY_LESSONS.find(l => l.regionId === region.id);
        expect(lesson).toBeDefined();
        expect(lesson?.techniqueId).toBe(region.techniqueId);
        expect(lesson?.unlockLevel).toBe(region.startLevel);

        expect(lesson?.diagramCells.length).toBe(9);
        const hasTarget = lesson?.diagramCells.some(c => c.role === 'target');
        expect(hasTarget).toBe(true);
      });
    });
  });

  describe('2. 40 Ders Çevirisi & Sıfır Sızıntı', () => {
    it('20 teknik için özet ve ipucu anahtarları tr ve en sözlüklerinde eksiksiz olmalı', () => {
      REGIONS.forEach(region => {
        const sumKey = `academy_summary_${region.techniqueId}`;
        const tipKey = `academy_tip_${region.techniqueId}`;

        expect(TRANSLATIONS.tr[sumKey]).toBeDefined();
        expect(TRANSLATIONS.en[sumKey]).toBeDefined();
        expect(TRANSLATIONS.tr[tipKey]).toBeDefined();
        expect(TRANSLATIONS.en[tipKey]).toBeDefined();
      });
    });

    it('EN metinlerinde Türkçe karakter, TR metinlerinde yasaklı İngilizce kelime sızmamalı', () => {
      const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;
      const forbiddenEnWords = /\b(Region|Level|Boss|Milestone|Guardian|Play|Next|Score|Single|Pair|Triple|Wing|Chain|Swordfish|Skyscraper|Lesson|Academy|Locked|Unlocked)\b/i;

      REGIONS.forEach(region => {
        const sumEn = TRANSLATIONS.en[`academy_summary_${region.techniqueId}`];
        const tipEn = TRANSLATIONS.en[`academy_tip_${region.techniqueId}`];

        expect(trCharRegex.test(sumEn)).toBe(false);
        expect(trCharRegex.test(tipEn)).toBe(false);

        const sumTr = TRANSLATIONS.tr[`academy_summary_${region.techniqueId}`];
        const tipTr = TRANSLATIONS.tr[`academy_tip_${region.techniqueId}`];

        expect(forbiddenEnWords.test(sumTr)).toBe(false);
        expect(forbiddenEnWords.test(tipTr)).toBe(false);
      });
    });
  });

  describe('3. Kitapçık Kilit/Açık Mantığı (DOM)', () => {
    it('Seviye 1 için 1 açık / 19 kilitli, Seviye 301 için 7 açık / 13 kilitli render edilmeli', () => {
      openAcademyBooklet(1);

      const unlockedCards1 = document.querySelectorAll('#academy-lessons-list [data-unlocked="true"]');
      const lockedCards1 = document.querySelectorAll('#academy-lessons-list [data-unlocked="false"]');

      expect(unlockedCards1.length).toBe(1);
      expect(lockedCards1.length).toBe(19);

      openAcademyBooklet(301);

      const unlockedCards301 = document.querySelectorAll('#academy-lessons-list [data-unlocked="true"]');
      const lockedCards301 = document.querySelectorAll('#academy-lessons-list [data-unlocked="false"]');

      expect(unlockedCards301.length).toBe(7);
      expect(lockedCards301.length).toBe(13);
    });

    it('Açık bir derse tıklanınca #academy-detail-view ve 9 hücreli diyagram açılmalı', () => {
      openAcademyBooklet(1);

      const firstCard = document.querySelector('#academy-lessons-list [data-unlocked="true"]') as HTMLElement;
      firstCard?.click();

      const detailView = document.getElementById('academy-detail-view');
      const diagramCells = document.querySelectorAll('#academy-lesson-diagram > div');

      expect(detailView?.classList.contains('hidden')).toBe(false);
      expect(diagramCells.length).toBe(9);
    });
  });

  describe('4. Tek Seferlik Yeni Bölge Otomatik Gösterimi', () => {
    it('maybeShowRegionIntroLesson(51) ilk çağrıda true dönmeli, ikinci çağrıda false dönmeli', () => {
      expect(hasSeenRegionLesson(2)).toBe(false);

      const firstCall = maybeShowRegionIntroLesson(51);
      expect(firstCall).toBe(true);
      expect(hasSeenRegionLesson(2)).toBe(true);

      closeAcademyModal();

      const secondCall = maybeShowRegionIntroLesson(51);
      expect(secondCall).toBe(false);

      const notStartLvlCall = maybeShowRegionIntroLesson(52);
      expect(notStartLvlCall).toBe(false);
    });
  });

  describe('5. Canlı Dil Geçişi (TR <-> EN)', () => {
    it('Akademi ders kartı açıkken dil EN yapıldığında tüm metinler İngilizceye dönmeli', () => {
      openAcademyLesson(1, false);

      setLang('en');
      applyStaticTranslations();
      refreshAcademyLanguageUI();

      const lessonTitle = document.getElementById('academy-lesson-title');
      const lessonSummary = document.getElementById('academy-lesson-summary');
      const lessonTip = document.getElementById('academy-lesson-tip');

      const trCharRegex = /[ğĞşŞıİçÇöÖüÜ]/;

      expect(trCharRegex.test(lessonTitle?.innerText || '')).toBe(false);
      expect(trCharRegex.test(lessonSummary?.innerText || '')).toBe(false);
      expect(trCharRegex.test(lessonTip?.innerText || '')).toBe(false);

      expect(lessonSummary?.innerText).toBe(t('academy_summary_row_col_scan'));
    });
  });
});
