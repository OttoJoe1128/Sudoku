import { UIManager } from '../ui';
import { SoundManager } from '../engine/soundManager';
import { t } from '../i18n/translations';
import { UserManager } from '../store/userState';
import { SudokuVariant } from '../engine/sudoku';
import { REGIONS } from '../engine/rhythmConfig';
import {
  ACADEMY_LESSONS,
  AcademyLesson,
  getAcademyLessonForRegion,
  getAcademyLessonForLevel,
  isLessonUnlocked,
  markRegionLessonSeen,
  shouldAutoShowRegionLesson
} from '../engine/academyData';

let currentLessonRegionId: number | null = null;

export function closeAcademyModal(): void {
  UIManager.toggleModal('academy-modal', false);
}

export function openAcademyLesson(regionId: number, isAutoIntro: boolean = false): void {
  currentLessonRegionId = regionId;
  const lesson = getAcademyLessonForRegion(regionId);
  const region = REGIONS.find(r => r.id === lesson.regionId) || REGIONS[0];

  UIManager.toggleModal('academy-modal', true);

  const listView = document.getElementById('academy-list-view');
  const detailView = document.getElementById('academy-detail-view');
  const newBadge = document.getElementById('academy-new-badge');
  const lessonRegion = document.getElementById('academy-lesson-region');
  const lessonTitle = document.getElementById('academy-lesson-title');
  const lessonSummary = document.getElementById('academy-lesson-summary');
  const lessonTip = document.getElementById('academy-lesson-tip');
  const diagramGrid = document.getElementById('academy-lesson-diagram');

  if (listView) {
    listView.classList.add('hidden');
  }
  if (detailView) {
    detailView.classList.remove('hidden');
    detailView.classList.add('flex');
  }

  if (newBadge) {
    if (isAutoIntro) newBadge.classList.remove('hidden');
    else newBadge.classList.add('hidden');
  }

  if (lessonRegion) lessonRegion.innerText = t('map_region_label', { id: lesson.regionId });
  if (lessonTitle) lessonTitle.innerText = `${t(region.key)} · ${t('tech_' + lesson.techniqueId)}`;
  if (lessonSummary) lessonSummary.innerText = t('academy_summary_' + lesson.techniqueId);
  if (lessonTip) lessonTip.innerText = t('academy_tip_' + lesson.techniqueId);

  isSimulatingElimination = false;
  renderDiagramGrid(lesson, false);

  const simulateBtn = document.getElementById('btn-academy-simulate-step');
  const simulateLabel = document.getElementById('academy-simulate-step-label');
  const hasEliminations = lesson.diagramCells.some(c => c.role === 'eliminated');

  if (simulateBtn) {
    if (hasEliminations) {
      simulateBtn.classList.remove('hidden');
      simulateBtn.classList.add('flex');
      if (simulateLabel) simulateLabel.innerText = t('academy_btn_simulate');
      simulateBtn.onclick = () => {
        SoundManager.playNumber();
        isSimulatingElimination = !isSimulatingElimination;
        renderDiagramGrid(lesson, isSimulatingElimination);
        if (simulateLabel) {
          simulateLabel.innerText = isSimulatingElimination
            ? t('academy_btn_reset_diagram')
            : t('academy_btn_simulate');
        }
      };
    } else {
      simulateBtn.classList.add('hidden');
      simulateBtn.classList.remove('flex');
    }
  }

  markRegionLessonSeen(regionId);
}

let isSimulatingElimination = false;

function renderDiagramGrid(lesson: AcademyLesson, simulated: boolean): void {
  const diagramGrid = document.getElementById('academy-lesson-diagram');
  if (!diagramGrid) return;
  diagramGrid.innerHTML = '';
  lesson.diagramCells.forEach(cell => {
    const cellDiv = document.createElement('div');
    let cellClasses = 'flex items-center justify-center font-mono font-black text-xs rounded-xl border select-none transition-all duration-300 ';
    let cellValue = cell.value;

    if (cell.role === 'target') {
      if (simulated) {
        cellClasses += 'bg-emerald-500/30 text-emerald-300 border-emerald-400 shadow-lg scale-105 ring-2 ring-emerald-400/50';
      } else {
        cellClasses += 'bg-[var(--accent-gold)] text-[var(--text-on-gold)] border-[var(--accent-gold-bright)] shadow-md animate-pulse';
      }
    } else if (cell.role === 'highlight') {
      cellClasses += 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/60';
    } else if (cell.role === 'eliminated') {
      if (simulated) {
        cellClasses += 'bg-rose-950/70 text-rose-500 border-rose-500 line-through opacity-40 scale-95';
        cellValue = '✕';
      } else {
        cellClasses += 'bg-rose-950/40 text-rose-400 border-rose-500/40 line-through';
      }
    } else if (cell.role === 'given') {
      cellClasses += 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-strong)]';
    } else {
      cellClasses += 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]';
    }

    cellDiv.className = cellClasses;
    cellDiv.innerText = cellValue;
    diagramGrid.appendChild(cellDiv);
  });
}

export function openAcademyBooklet(maxUnlockedLevel?: number): void {
  const variants: SudokuVariant[] = ['classic', 'irregular', 'killer', 'wordoku', 'samurai'];
  const maxLvl = maxUnlockedLevel !== undefined
    ? maxUnlockedLevel
    : Math.max(1, ...variants.map(v => UserManager.getVariantLevel(v)));

  UIManager.toggleModal('academy-modal', true);

  const listView = document.getElementById('academy-list-view');
  const detailView = document.getElementById('academy-detail-view');
  const summaryEl = document.getElementById('academy-unlocked-summary');
  const listContainer = document.getElementById('academy-lessons-list');

  if (detailView) {
    detailView.classList.add('hidden');
    detailView.classList.remove('flex');
  }
  if (listView) {
    listView.classList.remove('hidden');
  }

  const unlockedCount = ACADEMY_LESSONS.filter(l => isLessonUnlocked(l, maxLvl)).length;
  if (summaryEl) summaryEl.innerText = t('academy_unlocked_count', { unlocked: unlockedCount });

  if (listContainer) {
    listContainer.innerHTML = '';
    ACADEMY_LESSONS.forEach(lesson => {
      const region = REGIONS.find(r => r.id === lesson.regionId) || REGIONS[0];
      const unlocked = isLessonUnlocked(lesson, maxLvl);
      const card = document.createElement('div');

      if (unlocked) {
        card.className = 'w-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-strong)] rounded-2xl p-3 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-all shadow-sm';
        card.setAttribute('data-academy-region', lesson.regionId.toString());
        card.setAttribute('data-unlocked', 'true');
        card.innerHTML = `
          <div class="text-left">
            <span class="text-[9px] font-black uppercase text-[var(--accent-gold)] tracking-wider block">${t('map_region_label', { id: lesson.regionId })}</span>
            <h5 class="text-xs font-black text-[var(--text-primary)] mb-0.5">${t(region.key)}</h5>
            <p class="text-[10px] text-[var(--text-secondary)] font-bold">${t('tech_' + lesson.techniqueId)}</p>
          </div>
          <span class="text-xs font-black text-[var(--accent-gold)] shrink-0">📖 ➔</span>
        `;
        card.onclick = () => {
          SoundManager.playNumber();
          openAcademyLesson(lesson.regionId, false);
        };
      } else {
        card.className = 'w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3 flex justify-between items-center opacity-50 cursor-not-allowed select-none';
        card.setAttribute('data-academy-region', lesson.regionId.toString());
        card.setAttribute('data-unlocked', 'false');
        card.innerHTML = `
          <div class="text-left">
            <span class="text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-wider block">${t('map_region_label', { id: lesson.regionId })}</span>
            <h5 class="text-xs font-black text-[var(--text-secondary)] mb-0.5">${t(region.key)}</h5>
            <p class="text-[10px] text-[var(--text-secondary)] font-medium">${t('tech_' + lesson.techniqueId)}</p>
          </div>
          <span class="text-[10px] font-bold text-[var(--text-secondary)] shrink-0">🔒 ${t('academy_locked_hint', { level: lesson.unlockLevel })}</span>
        `;
      }

      listContainer.appendChild(card);
    });
  }
}

export function maybeShowRegionIntroLesson(level: number): boolean {
  const lesson = shouldAutoShowRegionLesson(level);
  if (!lesson) return false;

  const tourOverlay = document.getElementById('app-tour-overlay');
  const isTourActive = tourOverlay && !tourOverlay.classList.contains('hidden');
  if (isTourActive) return false;

  openAcademyLesson(lesson.regionId, true);
  return true;
}

export function refreshAcademyLanguageUI(): void {
  const modal = document.getElementById('academy-modal');
  if (!modal || modal.classList.contains('hidden')) return;

  const detailView = document.getElementById('academy-detail-view');
  if (detailView && !detailView.classList.contains('hidden') && currentLessonRegionId !== null) {
    openAcademyLesson(currentLessonRegionId, false);
  } else {
    openAcademyBooklet();
  }
}

export function initAcademyController(): void {
  const openHandler = () => {
    SoundManager.playNumber();
    openAcademyBooklet();
  };

  document.getElementById('btn-open-academy')?.addEventListener('click', openHandler);
  document.getElementById('btn-menu-open-academy')?.addEventListener('click', openHandler);

  document.getElementById('btn-close-academy')?.addEventListener('click', () => {
    closeAcademyModal();
  });

  document.getElementById('btn-academy-got-it')?.addEventListener('click', () => {
    SoundManager.playNumber();
    closeAcademyModal();
  });

  document.getElementById('btn-academy-back-list')?.addEventListener('click', () => {
    SoundManager.playNumber();
    openAcademyBooklet();
  });
}
