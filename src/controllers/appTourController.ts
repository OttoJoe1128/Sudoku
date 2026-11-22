import { UIManager } from '../ui/uiManager';
import { t } from '../i18n/translations';
import { SoundManager } from '../engine/soundManager';

export interface AppTourStep {
  targetId: string;
  titleKey: string;
  descKey: string;
}

export const APP_TOUR_STEPS: AppTourStep[] = [
  { targetId: 'btn-sound-toggle', titleKey: 'tour_step1_title', descKey: 'tour_step1_desc' },
  { targetId: 'btn-open-help', titleKey: 'tour_step2_title', descKey: 'tour_step2_desc' },
  { targetId: 'btn-lang-toggle', titleKey: 'tour_step3_title', descKey: 'tour_step3_desc' },
  { targetId: 'btn-theme-toggle', titleKey: 'tour_step4_title', descKey: 'tour_step4_desc' },
  { targetId: 'btn-open-profile', titleKey: 'tour_step5_title', descKey: 'tour_step5_desc' },
  { targetId: 'btn-daily-reward', titleKey: 'tour_step6_title', descKey: 'tour_step6_desc' },
  { targetId: 'btn-open-inbox', titleKey: 'tour_step7_title', descKey: 'tour_step7_desc' },
  { targetId: 'menu-gold-capsule', titleKey: 'tour_step8_title', descKey: 'tour_step8_desc' },
  { targetId: 'btn-quick-play', titleKey: 'tour_step9_title', descKey: 'tour_step9_desc' },
  { targetId: 'btn-new-game', titleKey: 'tour_step10_title', descKey: 'tour_step10_desc' },
  { targetId: 'btn-open-match', titleKey: 'tour_step11_title', descKey: 'tour_step11_desc' },
  { targetId: 'btn-open-saved-games', titleKey: 'tour_step12_title', descKey: 'tour_step12_desc' },
  { targetId: 'btn-open-map', titleKey: 'tour_step13_title', descKey: 'tour_step13_desc' },
  { targetId: 'btn-leaderboard', titleKey: 'tour_step14_title', descKey: 'tour_step14_desc' },
  { targetId: 'btn-achievements', titleKey: 'tour_step15_title', descKey: 'tour_step15_desc' },
  { targetId: 'btn-shop', titleKey: 'tour_step16_title', descKey: 'tour_step16_desc' }
];

let currentTourIndex = 0;
let savedGamesWasHiddenTemp = false;

export function isAppTourDone(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('sudoku_app_tour_done') === '1';
  } catch {
    return false;
  }
}

export function finishAppTour(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sudoku_app_tour_done', '1');
    }
  } catch {
    // ignore
  }

  if (typeof document === 'undefined') return;

  const overlay = document.getElementById('app-tour-overlay');
  if (overlay) overlay.remove();

  if (savedGamesWasHiddenTemp) {
    const savedGamesBtn = document.getElementById('btn-open-saved-games');
    if (savedGamesBtn) {
      savedGamesBtn.classList.add('hidden');
      savedGamesBtn.classList.remove('flex');
      savedGamesBtn.style.opacity = '1';
    }
    savedGamesWasHiddenTemp = false;
  }

  currentTourIndex = 0;
}

function updateSpotlightPosition(step: AppTourStep) {
  if (typeof document === 'undefined') return;

  const targetEl = document.getElementById(step.targetId);
  const spotlightBox = document.getElementById('tour-spotlight-box');
  const tooltipCard = document.getElementById('tour-tooltip-card');

  if (!targetEl || !spotlightBox || !tooltipCard) return;

  // Handle temporary display of saved games if hidden
  if (step.targetId === 'btn-open-saved-games' && targetEl.classList.contains('hidden')) {
    savedGamesWasHiddenTemp = true;
    targetEl.classList.remove('hidden');
    targetEl.classList.add('flex');
    targetEl.style.opacity = '0.9';
  } else if (savedGamesWasHiddenTemp && step.targetId !== 'btn-open-saved-games') {
    const savedGamesBtn = document.getElementById('btn-open-saved-games');
    if (savedGamesBtn) {
      savedGamesBtn.classList.add('hidden');
      savedGamesBtn.classList.remove('flex');
      savedGamesBtn.style.opacity = '1';
    }
    savedGamesWasHiddenTemp = false;
  }

  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    const rect = targetEl.getBoundingClientRect();
    const pad = 6;

    spotlightBox.style.top = `${rect.top - pad}px`;
    spotlightBox.style.left = `${rect.left - pad}px`;
    spotlightBox.style.width = `${rect.width + (pad * 2)}px`;
    spotlightBox.style.height = `${rect.height + (pad * 2)}px`;

    const isTopHalf = rect.top < (window.innerHeight / 2);
    const cardWidth = Math.min(300, window.innerWidth - 32);
    const cardLeft = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, rect.left + (rect.width / 2) - (cardWidth / 2)));

    tooltipCard.style.width = `${cardWidth}px`;
    tooltipCard.style.left = `${cardLeft}px`;

    if (isTopHalf) {
      tooltipCard.style.top = `${rect.bottom + 14}px`;
      tooltipCard.style.bottom = 'auto';
    } else {
      tooltipCard.style.bottom = `${(window.innerHeight - rect.top) + 14}px`;
      tooltipCard.style.top = 'auto';
    }
  }, 100);
}

export function renderTourStep(index: number): void {
  if (index < 0 || index >= APP_TOUR_STEPS.length) {
    finishAppTour();
    return;
  }

  currentTourIndex = index;
  const step = APP_TOUR_STEPS[index];
  let overlay = document.getElementById('app-tour-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'app-tour-overlay';
    overlay.className = 'fixed inset-0 z-[98] pointer-events-auto';
    overlay.innerHTML = `
      <!-- Spotlight Altın Kutusu -->
      <div id="tour-spotlight-box" class="fixed z-[99] rounded-2xl border-2 border-[var(--accent-gold)] ring-4 ring-[var(--accent-gold)]/30 shadow-[0_0_0_9999px_rgba(7,13,25,0.82)] pointer-events-none transition-all duration-300"></div>

      <!-- Açıklama Kartı (Tooltip) -->
      <div id="tour-tooltip-card" class="fixed z-[100] bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-3xl p-4 shadow-2xl flex flex-col transition-all duration-300">
        <div class="flex justify-between items-center mb-2 border-b border-[var(--border-subtle)] pb-1.5">
          <span id="tour-step-counter" class="text-xs font-black text-[var(--accent-gold)] tracking-wider">1 / 16</span>
          <button id="btn-tour-skip" class="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">${t('tour_btn_skip')}</button>
        </div>
        <h4 id="tour-step-title" class="text-sm font-black text-[var(--text-primary)] mb-1"></h4>
        <p id="tour-step-desc" class="text-xs text-[var(--text-secondary)] font-medium leading-relaxed mb-4"></p>
        <div class="flex justify-between items-center pt-1 border-t border-[var(--border-subtle)]">
          <button id="btn-tour-prev" class="bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-xl font-bold text-xs active:scale-95 transition-transform hover:bg-[var(--bg-card-hover)] cursor-pointer">
            ← ${t('btn_prev')}
          </button>
          <button id="btn-tour-next" class="bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black px-4 py-1.5 rounded-xl text-xs active:scale-95 transition-transform shadow hover:brightness-110 cursor-pointer">
            ${t('btn_next')} ➔
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-tour-skip')?.addEventListener('click', () => finishAppTour());

    document.getElementById('btn-tour-prev')?.addEventListener('click', () => {
      SoundManager.playNumber();
      renderTourStep(currentTourIndex - 1);
    });

    document.getElementById('btn-tour-next')?.addEventListener('click', () => {
      SoundManager.playNumber();
      renderTourStep(currentTourIndex + 1);
    });
  }

  const counterEl = document.getElementById('tour-step-counter');
  const titleEl = document.getElementById('tour-step-title');
  const descEl = document.getElementById('tour-step-desc');
  const prevBtn = document.getElementById('btn-tour-prev');
  const nextBtn = document.getElementById('btn-tour-next');

  if (counterEl) counterEl.innerText = `${index + 1} / ${APP_TOUR_STEPS.length}`;
  if (titleEl) titleEl.innerText = t(step.titleKey);
  if (descEl) descEl.innerText = t(step.descKey);

  if (prevBtn) {
    if (index === 0) prevBtn.classList.add('hidden');
    else prevBtn.classList.remove('hidden');
  }

  if (nextBtn) {
    if (index === APP_TOUR_STEPS.length - 1) {
      nextBtn.innerText = `✓ ${t('btn_finish')}`;
    } else {
      nextBtn.innerText = `${t('btn_next')} ➔`;
    }
  }

  updateSpotlightPosition(step);
}

export function startAppTour(): void {
  if (typeof document === 'undefined') return;
  UIManager.navigate('menu');
  renderTourStep(0);
}
