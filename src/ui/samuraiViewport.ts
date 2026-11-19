import { Icons } from '../design/icons';

export const SAMURAI_GRID_OFFSETS = [
  { gridIdx: 0, rowOff: 6, colOff: 6 }, // 0: Center
  { gridIdx: 1, rowOff: 0, colOff: 0 }, // 1: Top-Left
  { gridIdx: 2, rowOff: 0, colOff: 12 }, // 2: Top-Right
  { gridIdx: 3, rowOff: 12, colOff: 0 }, // 3: Bottom-Left
  { gridIdx: 4, rowOff: 12, colOff: 12 } // 4: Bottom-Right
] as const;

export interface SamuraiCellRef {
  gridIdx: number;
  r: number;
  c: number;
  isOverlap: boolean;
}

export function mapGlobalToSamuraiCell(
  gr: number,
  gc: number,
  preferredGridIdx: number = 0
): SamuraiCellRef | null {
  if (gr < 0 || gr >= 21 || gc < 0 || gc >= 21) return null;

  const matches: { gridIdx: number; r: number; c: number }[] = [];

  SAMURAI_GRID_OFFSETS.forEach(offset => {
    if (
      gr >= offset.rowOff &&
      gr < offset.rowOff + 9 &&
      gc >= offset.colOff &&
      gc < offset.colOff + 9
    ) {
      matches.push({
        gridIdx: offset.gridIdx,
        r: gr - offset.rowOff,
        c: gc - offset.colOff
      });
    }
  });

  if (matches.length === 0) return null;

  const isOverlap = matches.length > 1;
  const preferredMatch = matches.find(m => m.gridIdx === preferredGridIdx);
  const selected = preferredMatch || matches[0];

  return {
    gridIdx: selected.gridIdx,
    r: selected.r,
    c: selected.c,
    isOverlap
  };
}

export interface SamuraiBoardData {
  userBoard: number[][];
  initialBoard: number[][];
  solution: number[][];
  notesBoard: Set<number>[][];
}

const CELL_PX = 36;
const CANVAS_SIZE = 21 * CELL_PX; // 756px
const MIN_SCALE = 0.44;
const MAX_SCALE = 1.45;

let scale = 0.5;
let tx = 0;
let ty = 0;
let initialized = false;
let listenersBound = false;
let isPointerDown = false;
let isPinching = false;
let isDragging = false;
let pointerDownX = 0;
let pointerDownY = 0;
let dragStartX = 0;
let dragStartY = 0;
let lastPinchDist = 0;

function clampCamera(viewportEl: HTMLElement) {
  const vWidth = viewportEl.clientWidth || 360;
  const vHeight = viewportEl.clientHeight || 400;

  const scaledSize = CANVAS_SIZE * scale;

  const minTx = vWidth - scaledSize - 100;
  const maxTx = 100;
  const minTy = vHeight - scaledSize - 100;
  const maxTy = 100;

  tx = Math.max(minTx, Math.min(maxTx, tx));
  ty = Math.max(minTy, Math.min(maxTy, ty));
}

function applyCamera(viewportEl: HTMLElement, smooth: boolean = false) {
  clampCamera(viewportEl);
  const canvas = viewportEl.querySelector('#samurai-canvas') as HTMLElement;
  if (canvas) {
    canvas.style.transition = smooth ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
    canvas.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
  }
}

export const SamuraiViewport = {
  resetCamera() {
    initialized = false;
    listenersBound = false;
  },

  focusGrid(gridIdx: number, viewportEl: HTMLElement, smooth: boolean = true) {
    if (!viewportEl) return;
    if (viewportEl.clientWidth === 0) {
      requestAnimationFrame(() => this.focusGrid(gridIdx, viewportEl, smooth));
      return;
    }

    const offset = SAMURAI_GRID_OFFSETS.find(o => o.gridIdx === gridIdx) || SAMURAI_GRID_OFFSETS[0];

    const vWidth = viewportEl.clientWidth || 360;
    const vHeight = viewportEl.clientHeight || 400;

    scale = Math.min(1.12, Math.max(MIN_SCALE, (vWidth - 16) / 345));

    const gridCenterGlobalR = offset.rowOff + 4.5;
    const gridCenterGlobalC = offset.colOff + 4.5;

    const gridCenterPxX = gridCenterGlobalC * CELL_PX;
    const gridCenterPxY = gridCenterGlobalR * CELL_PX;

    tx = (vWidth / 2) - (gridCenterPxX * scale);
    ty = (vHeight / 2) - (gridCenterPxY * scale);

    applyCamera(viewportEl, smooth);
  },

  fitOverview(viewportEl: HTMLElement, smooth: boolean = true) {
    const vWidth = viewportEl.clientWidth || 360;
    const vHeight = viewportEl.clientHeight || 400;

    const scaleX = (vWidth - 16) / CANVAS_SIZE;
    const scaleY = (vHeight - 16) / CANVAS_SIZE;
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, Math.min(scaleX, scaleY)));

    const scaledSize = CANVAS_SIZE * scale;
    tx = (vWidth - scaledSize) / 2;
    ty = (vHeight - scaledSize) / 2;

    applyCamera(viewportEl, smooth);
  },

  zoomBy(factor: number, viewportEl: HTMLElement) {
    const vWidth = viewportEl.clientWidth || 360;
    const vHeight = viewportEl.clientHeight || 400;

    const oldScale = scale;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
    if (newScale === oldScale) return;

    const centerX = vWidth / 2;
    const centerY = vHeight / 2;

    tx = centerX - ((centerX - tx) / oldScale) * newScale;
    ty = centerY - ((centerY - ty) / oldScale) * newScale;
    scale = newScale;

    applyCamera(viewportEl, true);
  },

  setupGestureListeners(viewportEl: HTMLElement) {
    if (listenersBound) return;
    listenersBound = true;

    viewportEl.classList.add('touch-none', 'select-none');
    viewportEl.style.backgroundImage = 'radial-gradient(var(--border-subtle) 1px, transparent 1px)';
    viewportEl.style.backgroundSize = '20px 20px';

    viewportEl.addEventListener('pointerdown', (e) => {
      if (isPinching) return;
      isPointerDown = true;
      isDragging = false;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      dragStartX = tx;
      dragStartY = ty;
    });

    viewportEl.addEventListener('pointermove', (e) => {
      if (!isPointerDown || isPinching) return;

      const dx = e.clientX - pointerDownX;
      const dy = e.clientY - pointerDownY;

      if (Math.hypot(dx, dy) > 8) {
        isDragging = true;
      }

      if (isDragging) {
        tx = dragStartX + dx;
        ty = dragStartY + dy;
        applyCamera(viewportEl, false);
      }
    });

    const handlePointerUp = () => {
      isPointerDown = false;
      setTimeout(() => {
        isDragging = false;
      }, 40);
    };

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    viewportEl.addEventListener('touchstart', (e) => {
      if (e.touches.length >= 2) {
        isPinching = true;
        isPointerDown = false;
        isDragging = true;
        lastPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    viewportEl.addEventListener('touchmove', (e) => {
      if (e.touches.length >= 2) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );

        if (lastPinchDist > 0) {
          const ratio = currentDist / lastPinchDist;
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

          const rect = viewportEl.getBoundingClientRect();
          const relX = midX - rect.left;
          const relY = midY - rect.top;

          const oldScale = scale;
          const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * ratio));

          if (newScale !== oldScale) {
            tx = relX - ((relX - tx) / oldScale) * newScale;
            ty = relY - ((relY - ty) / oldScale) * newScale;
            scale = newScale;
            applyCamera(viewportEl, false);
          }
        }
        lastPinchDist = currentDist;
      }
    }, { passive: true });

    viewportEl.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        isPinching = false;
        lastPinchDist = 0;
      }
    }, { passive: true });

    viewportEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.88;
      this.zoomBy(factor, viewportEl);
    }, { passive: false });
  }
};

export function renderSamuraiBoard(
  viewportEl: HTMLElement,
  boards: SamuraiBoardData[],
  activeGridIdx: number,
  selectedR: number,
  selectedC: number,
  onCellClick: (gridIdx: number, r: number, c: number) => void
): void {
  if (!viewportEl) return;

  let canvas = viewportEl.querySelector('#samurai-canvas') as HTMLElement;

  if (!canvas || !initialized) {
    viewportEl.innerHTML = `
      <!-- 21x21 Canvas -->
      <div id="samurai-canvas" class="absolute top-0 left-0 grid" style="width:${CANVAS_SIZE}px;height:${CANVAS_SIZE}px;transform-origin:0 0;grid-template-columns:repeat(21,36px);grid-template-rows:repeat(21,36px);"></div>

      <!-- Yüzen Kamera Kontrol Hapı -->
      <div class="absolute bottom-3 right-3 z-30 flex items-center gap-1 bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-strong)] p-1 rounded-2xl shadow-xl">
        <button id="btn-samurai-zoom-out" title="Uzaklaş" class="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] font-black text-sm flex items-center justify-center active:scale-90 transition-transform">
          −
        </button>
        <button id="btn-samurai-fit" title="Tümünü Gör (21x21)" class="px-2.5 h-8 rounded-xl bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black text-[10px] uppercase tracking-wider flex items-center justify-center active:scale-90 transition-transform hover:brightness-110">
          21×21
        </button>
        <button id="btn-samurai-zoom-in" title="Yakınlaş" class="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] font-black text-sm flex items-center justify-center active:scale-90 transition-transform">
          +
        </button>
      </div>
    `;

    canvas = viewportEl.querySelector('#samurai-canvas') as HTMLElement;
    SamuraiViewport.setupGestureListeners(viewportEl);
    SamuraiViewport.focusGrid(activeGridIdx, viewportEl, false);
    initialized = true;

    viewportEl.querySelector('#btn-samurai-zoom-out')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SamuraiViewport.zoomBy(0.85, viewportEl);
    });

    viewportEl.querySelector('#btn-samurai-fit')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SamuraiViewport.fitOverview(viewportEl, true);
    });

    viewportEl.querySelector('#btn-samurai-zoom-in')?.addEventListener('click', (e) => {
      e.stopPropagation();
      SamuraiViewport.zoomBy(1.18, viewportEl);
    });
  }

  if (!canvas) return;

  const activeBoard = boards[activeGridIdx];
  const selectedValue = (activeBoard && selectedR >= 0 && selectedC >= 0 && activeBoard.userBoard[selectedR])
    ? activeBoard.userBoard[selectedR][selectedC]
    : 0;

  const activeOffset = SAMURAI_GRID_OFFSETS.find(o => o.gridIdx === activeGridIdx);
  const selGlobalR = (activeOffset && selectedR >= 0) ? activeOffset.rowOff + selectedR : -1;
  const selGlobalC = (activeOffset && selectedC >= 0) ? activeOffset.colOff + selectedC : -1;

  let html = '';

  for (let gr = 0; gr < 21; gr++) {
    for (let gc = 0; gc < 21; gc++) {
      const cellRef = mapGlobalToSamuraiCell(gr, gc, activeGridIdx);

      if (!cellRef) {
        html += `<div class="w-[36px] h-[36px] pointer-events-none"></div>`;
        continue;
      }

      const { gridIdx, r, c, isOverlap } = cellRef;
      const bData = boards[gridIdx];
      const val = (bData && bData.userBoard && bData.userBoard[r]) ? bData.userBoard[r][c] : 0;
      const initialVal = (bData && bData.initialBoard && bData.initialBoard[r]) ? bData.initialBoard[r][c] : 0;
      const isInitial = initialVal > 0;

      const isSelected = selGlobalR === gr && selGlobalC === gc;

      const isMatchingValue = selectedValue > 0 && val === selectedValue;

      const isRelatedGroup = gridIdx === activeGridIdx && selectedR >= 0 && selectedC >= 0 && (
        r === selectedR ||
        c === selectedC ||
        (Math.floor(r / 3) === Math.floor(selectedR / 3) && Math.floor(c / 3) === Math.floor(selectedC / 3))
      );

      let borderClass = 'border-[0.5px] border-[var(--border-subtle)]';

      if (r % 3 === 2) borderClass += ' border-b-[2px] border-b-[var(--accent-gold)]';
      if (c % 3 === 2) borderClass += ' border-r-[2px] border-r-[var(--accent-gold)]';
      if (r === 0) borderClass += ' border-t-[2px] border-t-[var(--accent-gold)]';
      if (c === 0) borderClass += ' border-l-[2px] border-l-[var(--accent-gold)]';

      if (isOverlap) {
        borderClass += ' ring-1 ring-inset ring-[var(--accent-gold)]/45';
      }

      let bgClass = 'bg-[var(--cell-bg)] text-[var(--accent-cyan)]';

      if (isSelected) {
        bgClass = 'bg-[var(--cell-selected-bg)] text-[var(--text-on-gold)] font-black shadow-lg ring-2 ring-[var(--accent-gold-bright)] z-10';
      } else if (isMatchingValue) {
        bgClass = 'bg-[var(--cell-match-bg)] text-[var(--accent-gold-bright)] font-black ring-1 ring-[var(--accent-gold)]/50 z-1';
      } else if (isRelatedGroup) {
        bgClass = 'bg-[var(--cell-related-bg)] text-[var(--text-primary)] font-bold';
      } else if (isInitial) {
        bgClass = 'bg-[var(--cell-initial-bg)] text-[var(--text-primary)] font-black';
      }

      let contentHTML = '';
      if (val > 0) {
        contentHTML = `<span class="text-sm font-black">${val}</span>`;
      } else if (bData && bData.notesBoard && bData.notesBoard[r] && bData.notesBoard[r][c] && bData.notesBoard[r][c].size > 0) {
        const notesSet = bData.notesBoard[r][c];
        contentHTML = `<div class="grid grid-cols-3 gap-0 w-full h-full p-0.5 pointer-events-none">`;
        for (let n = 1; n <= 9; n++) {
          contentHTML += `<span class="text-[7px] font-mono leading-none flex items-center justify-center ${notesSet.has(n) ? 'text-[var(--accent-gold-bright)] font-bold' : 'opacity-0'}">${n}</span>`;
        }
        contentHTML += `</div>`;
      }

      html += `
        <div data-samurai-gr="${gr}" data-samurai-gc="${gc}" class="samurai-cell-btn w-[36px] h-[36px] flex items-center justify-center cursor-pointer select-none transition-colors relative ${borderClass} ${bgClass}">
          ${contentHTML}
        </div>
      `;
    }
  }

  canvas.innerHTML = html;

  canvas.querySelectorAll('.samurai-cell-btn').forEach(cellEl => {
    cellEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isDragging) return;

      const gr = parseInt((e.currentTarget as HTMLElement).getAttribute('data-samurai-gr') || '0');
      const gc = parseInt((e.currentTarget as HTMLElement).getAttribute('data-samurai-gc') || '0');

      const ref = mapGlobalToSamuraiCell(gr, gc, activeGridIdx);
      if (ref) {
        onCellClick(ref.gridIdx, ref.r, ref.c);
      }
    });
  });
}
