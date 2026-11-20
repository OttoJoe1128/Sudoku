import { SudokuVariant, SudokuGen } from '../engine/sudoku';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';

let selectedMapVariant: SudokuVariant = 'classic';
let mapWindowStart = 1;
let mapWindowEnd = 25;
let storedOnStartLevel: ((level: number, diff: 'basit' | 'orta' | 'zor', variant: SudokuVariant) => void) | null = null;
let storedGetRuleDescription: ((variant: SudokuVariant) => string) | null = null;

export function getSelectedMapVariant(): SudokuVariant {
  return selectedMapVariant;
}

export function openMapAtLevel(
  variant: SudokuVariant,
  highlightLevel?: number,
  onStartLevel?: (level: number, diff: 'basit' | 'orta' | 'zor', variant: SudokuVariant) => void
): void {
  const startFn = onStartLevel || storedOnStartLevel;
  if (!startFn) return;

  selectedMapVariant = variant;

  (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(other => {
    const btn = document.getElementById(`map-variant-${other}`);
    if (btn) {
      if (other === variant) {
        btn.className = "map-variant-btn p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";
      } else {
        btn.className = "map-variant-btn p-1.5 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";
      }
    }
  });

  if (storedGetRuleDescription) {
    const descEl = document.getElementById('map-variant-rule-desc');
    if (descEl) descEl.innerText = storedGetRuleDescription(variant);
  }

  const targetLvl = highlightLevel || UserManager.getVariantLevel(variant);
  mapWindowStart = Math.max(1, targetLvl - 8);
  mapWindowEnd = Math.min(1000, targetLvl + 14);

  UIManager.navigate('map');
  renderMapPathUI(startFn, true);
  setupMapScrollListener(startFn);

  if (highlightLevel) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        UIManager.animateMapLevelUnlock(highlightLevel);
      }, 120);
    });
  }
}

export function renderMapPathUI(
  onStartLevel: (level: number, diff: 'basit' | 'orta' | 'zor', variant: SudokuVariant) => void,
  autoScrollToCurrent: boolean = false
): void {
  const userLvl = UserManager.getVariantLevel(selectedMapVariant);
  UIManager.renderMap(
    userLvl,
    mapWindowStart,
    mapWindowEnd,
    (lvl) => {
      const diff = SudokuGen.getDifficulty(lvl);
      onStartLevel(lvl, diff, selectedMapVariant);
    },
    autoScrollToCurrent
  );
}

export function setupMapScrollListener(
  onStartLevel: (level: number, diff: 'basit' | 'orta' | 'zor', variant: SudokuVariant) => void
): void {
  const scrollEl = document.getElementById('map-scroll-area');
  if (!scrollEl) return;

  scrollEl.onscroll = () => {
    if (scrollEl.scrollTop < 140 && mapWindowEnd < 1000) {
      const prevH = scrollEl.scrollHeight;
      const prevTop = scrollEl.scrollTop;

      mapWindowEnd = Math.min(1000, mapWindowEnd + 15);
      renderMapPathUI(onStartLevel, false);

      const newH = scrollEl.scrollHeight;
      scrollEl.scrollTop = prevTop + (newH - prevH);
    } else if (scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 140 && mapWindowStart > 1) {
      mapWindowStart = Math.max(1, mapWindowStart - 15);
      renderMapPathUI(onStartLevel, false);
    }
  };
}

export function initMapController(callbacks: {
  onStartLevel: (level: number, diff: 'basit' | 'orta' | 'zor', variant: SudokuVariant) => void;
  onBackToMenu: () => void;
  getRuleDescription: (variant: SudokuVariant) => string;
}): void {
  const { onStartLevel, onBackToMenu, getRuleDescription } = callbacks;
  storedOnStartLevel = onStartLevel;
  storedGetRuleDescription = getRuleDescription;

  (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(v => {
    document.getElementById(`map-variant-${v}`)?.addEventListener('click', () => {
      selectedMapVariant = v;
      (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(other => {
        const btn = document.getElementById(`map-variant-${other}`);
        if (btn) {
          if (other === v) {
            btn.className = "map-variant-btn p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";
          } else {
            btn.className = "map-variant-btn p-1.5 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";
          }
        }
      });

      const descEl = document.getElementById('map-variant-rule-desc');
      if (descEl) descEl.innerText = getRuleDescription(v);

      const userLvl = UserManager.getVariantLevel(v);
      mapWindowStart = Math.max(1, userLvl - 8);
      mapWindowEnd = Math.min(1000, userLvl + 14);
      renderMapPathUI(onStartLevel, true);
    });
  });

  document.getElementById('btn-open-map')?.addEventListener('click', () => {
    const userLvl = UserManager.getVariantLevel(selectedMapVariant);
    mapWindowStart = Math.max(1, userLvl - 8);
    mapWindowEnd = Math.min(1000, userLvl + 14);
    UIManager.navigate('map');
    renderMapPathUI(onStartLevel, true);
    setupMapScrollListener(onStartLevel);
  });

  document.getElementById('btn-map-focus-current')?.addEventListener('click', () => {
    const userLvl = UserManager.getVariantLevel(selectedMapVariant);
    mapWindowStart = Math.max(1, userLvl - 8);
    mapWindowEnd = Math.min(1000, userLvl + 14);
    renderMapPathUI(onStartLevel, true);
  });

  document.getElementById('btn-map-start-current')?.addEventListener('click', () => {
    const userLvl = UserManager.getVariantLevel(selectedMapVariant);
    const diff = SudokuGen.getDifficulty(userLvl);
    onStartLevel(userLvl, diff, selectedMapVariant);
  });

  document.getElementById('btn-back-map')?.addEventListener('click', () => {
    onBackToMenu();
  });
}
