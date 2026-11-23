import { UIManager } from '../ui/uiManager';
import { SoundManager } from '../engine/soundManager';
import { t } from '../i18n/translations';
import { startAppTour } from './appTourController';

let currentStep = 1;

export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem('sudoku_onboarding_done') === '1';
  } catch {
    return false;
  }
}

export function closeOnboardingModal(): void {
  try {
    localStorage.setItem('sudoku_onboarding_done', '1');
  } catch {
    // ignore
  }
  UIManager.toggleModal('onboarding-modal', false);
}

export function renderOnboardingStep(step: number): void {
  if (typeof document === 'undefined') return;
  currentStep = step;
  const indicator = document.getElementById('onboarding-step-indicator');
  const content = document.getElementById('onboarding-content');
  if (indicator) indicator.innerText = `${step} / 3`;
  if (!content) return;

  if (step === 1) {
    // Adım 1 — Satır & Sütun Kuralı (Eksik rakam: 5)
    content.innerHTML = `
      <h3 class="text-lg font-black text-[var(--text-primary)] mb-1" data-i18n="onboarding_step1_title">${t('onboarding_step1_title')}</h3>
      <p class="text-xs text-[var(--text-secondary)] mb-4 font-medium leading-relaxed" data-i18n="onboarding_step1_desc">${t('onboarding_step1_desc')}</p>

      <!-- Mini 1x9 Satır Görseli -->
      <div class="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-2.5 mb-4 shadow-inner">
        <div class="grid grid-cols-9 gap-1 w-full max-w-[320px] mx-auto">
          <div class="aspect-square bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">1</div>
          <div class="aspect-square bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">2</div>
          <div class="aspect-square bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">3</div>
          <div class="aspect-square bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">4</div>
          <div id="onboarding-cell-step1" class="aspect-square bg-[var(--cell-selected-bg)] text-[var(--text-on-gold)] border-2 border-[var(--accent-gold-bright)] rounded-lg flex items-center justify-center font-black text-base shadow-md animate-pulse">?</div>
          <div class="aspect-square bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">6</div>
          <div class="aspect-square bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">7</div>
          <div class="aspect-square bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">8</div>
          <div class="aspect-square bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">9</div>
        </div>
      </div>

      <!-- 3 Seçenek Düğmesi -->
      <div class="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
        <button data-num="3" class="onboarding-opt-btn bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-black py-3 rounded-2xl active:scale-95 transition-all text-base">3</button>
        <button data-num="5" class="onboarding-opt-btn bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-black py-3 rounded-2xl active:scale-95 transition-all text-base">5</button>
        <button data-num="8" class="onboarding-opt-btn bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-black py-3 rounded-2xl active:scale-95 transition-all text-base">8</button>
      </div>
    `;

    content.querySelectorAll('.onboarding-opt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const num = parseInt(target.getAttribute('data-num') || '0');
        const cell = document.getElementById('onboarding-cell-step1');

        if (num === 5) {
          SoundManager.playNumber();
          if (cell) {
            cell.innerText = '5';
            cell.className = "aspect-square bg-emerald-600 text-white border-2 border-emerald-400 rounded-lg flex items-center justify-center font-black text-base shadow-md";
          }
          UIManager.showToast(t('onboarding_correct_toast'), 'success');
          setTimeout(() => renderOnboardingStep(2), 700);
        } else {
          SoundManager.playError();
          target.classList.add('!bg-rose-950/80', '!border-rose-500/60', '!text-rose-300', 'animate-shake');
          UIManager.showToast(t('onboarding_wrong_toast'), 'error');
          setTimeout(() => target.classList.remove('!bg-rose-950/80', '!border-rose-500/60', '!text-rose-300', 'animate-shake'), 600);
        }
      });
    });

  } else if (step === 2) {
    // Adım 2 — 3x3 Kutu Kuralı (Eksik rakam: 7)
    content.innerHTML = `
      <h3 class="text-lg font-black text-[var(--text-primary)] mb-1" data-i18n="onboarding_step2_title">${t('onboarding_step2_title')}</h3>
      <p class="text-xs text-[var(--text-secondary)] mb-4 font-medium leading-relaxed" data-i18n="onboarding_step2_desc">${t('onboarding_step2_desc')}</p>

      <!-- Mini 3x3 Kutu Görseli -->
      <div class="bg-[var(--bg-elevated)] border-2 border-[var(--border-strong)] rounded-2xl p-2 mb-4 shadow-inner">
        <div class="grid grid-cols-3 gap-1 w-36 h-36 mx-auto">
          <div class="bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">1</div>
          <div class="bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">2</div>
          <div class="bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">3</div>
          <div class="bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">4</div>
          <div id="onboarding-cell-step2" class="bg-[var(--cell-selected-bg)] text-[var(--text-on-gold)] border-2 border-[var(--accent-gold-bright)] rounded-lg flex items-center justify-center font-black text-base shadow-md animate-pulse">?</div>
          <div class="bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">6</div>
          <div class="bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">8</div>
          <div class="bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">9</div>
          <div class="bg-[var(--cell-bg)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center font-black text-sm text-[var(--cell-initial-text)]">5</div>
        </div>
      </div>

      <!-- 3 Seçenek Düğmesi -->
      <div class="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
        <button data-num="2" class="onboarding-opt-btn bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-black py-3 rounded-2xl active:scale-95 transition-all text-base">2</button>
        <button data-num="7" class="onboarding-opt-btn bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-black py-3 rounded-2xl active:scale-95 transition-all text-base">7</button>
        <button data-num="9" class="onboarding-opt-btn bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-black py-3 rounded-2xl active:scale-95 transition-all text-base">9</button>
      </div>
    `;

    content.querySelectorAll('.onboarding-opt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const num = parseInt(target.getAttribute('data-num') || '0');
        const cell = document.getElementById('onboarding-cell-step2');

        if (num === 7) {
          SoundManager.playNumber();
          if (cell) {
            cell.innerText = '7';
            cell.className = "bg-emerald-600 text-white border-2 border-emerald-400 rounded-lg flex items-center justify-center font-black text-base shadow-md";
          }
          UIManager.showToast(t('onboarding_correct_step2_toast'), 'success');
          setTimeout(() => renderOnboardingStep(3), 700);
        } else {
          SoundManager.playError();
          target.classList.add('!bg-rose-950/80', '!border-rose-500/60', '!text-rose-300', 'animate-shake');
          UIManager.showToast(t('onboarding_wrong_toast'), 'error');
          setTimeout(() => target.classList.remove('!bg-rose-950/80', '!border-rose-500/60', '!text-rose-300', 'animate-shake'), 600);
        }
      });
    });

  } else if (step === 3) {
    // Adım 3 — SudokuMap'e Hazırsın (Ana Menü Özeti)
    content.innerHTML = `
      <div class="w-14 h-14 bg-[var(--bg-elevated)] text-[var(--accent-gold)] border border-[var(--border-strong)] rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-inner">
        🏆
      </div>
      <h3 class="text-xl font-black text-[var(--text-primary)] mb-3" data-i18n="onboarding_step3_title">${t('onboarding_step3_title')}</h3>

      <div class="w-full text-left space-y-2.5 mb-5 text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
        <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-2.5 flex items-start gap-2.5">
          <span class="text-base text-[var(--accent-gold)] shrink-0">⚡</span>
          <div>
            <p class="font-black text-[var(--text-primary)]" data-i18n="onboarding_summary_1_title">${t('onboarding_summary_1_title')}</p>
            <p data-i18n="onboarding_summary_1_desc">${t('onboarding_summary_1_desc')}</p>
          </div>
        </div>

        <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-2.5 flex items-start gap-2.5">
          <span class="text-base text-[var(--accent-cyan)] shrink-0">🎯</span>
          <div>
            <p class="font-black text-[var(--text-primary)]" data-i18n="onboarding_summary_2_title">${t('onboarding_summary_2_title')}</p>
            <p data-i18n="onboarding_summary_2_desc">${t('onboarding_summary_2_desc')}</p>
          </div>
        </div>

        <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-2.5 flex items-start gap-2.5">
          <span class="text-base text-[var(--accent-gold)] shrink-0">✏️</span>
          <div>
            <p class="font-black text-[var(--text-primary)]" data-i18n="onboarding_summary_3_title">${t('onboarding_summary_3_title')}</p>
            <p data-i18n="onboarding_summary_3_desc">${t('onboarding_summary_3_desc')}</p>
          </div>
        </div>
      </div>

      <button id="btn-onboarding-finish" class="w-full bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black py-3.5 rounded-2xl shadow-lg active:scale-95 transition-transform text-xs tracking-wide hover:brightness-110 flex items-center justify-center gap-1.5">
        <span data-i18n="btn_start_playing">${t('btn_start_playing')}</span>
      </button>
    `;

    document.getElementById('btn-onboarding-finish')?.addEventListener('click', () => {
      SoundManager.playWin();
      closeOnboardingModal();
    });
  }
}

export function openOnboardingModal(): void {
  UIManager.toggleModal('onboarding-modal', true);
  renderOnboardingStep(1);

  const skipBtn = document.getElementById('btn-onboarding-skip');
  if (skipBtn) {
    skipBtn.onclick = () => closeOnboardingModal();
  }

  const tourBtn = document.getElementById('btn-start-app-tour');
  if (tourBtn) {
    tourBtn.onclick = () => {
      closeOnboardingModal();
      startAppTour();
    };
  }
}
