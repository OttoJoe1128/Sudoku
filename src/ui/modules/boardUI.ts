import { menuTemplate } from '../templates/menu';
import { mapTemplate } from '../templates/map';
import { customModeTemplate } from '../templates/custom';
import { leaderboardTemplate } from '../templates/leaderboard';
import { shopTemplate } from '../templates/shop';
import { usernameModalTemplate } from '../templates/usernameModal';
import { achievementsTemplate } from '../templates/achievements';
import { placementModalTemplate } from '../templates/placementModal';
import { profileModalTemplate } from '../templates/profileModal';
import { matchModalTemplate } from '../templates/matchModal';
import { inboxModalTemplate } from '../templates/inboxModal';
import { savedGamesModalTemplate } from '../templates/savedGamesModal';
import { secondChanceModalTemplate } from '../templates/secondChanceModal';
import { onboardingModalTemplate } from '../templates/onboardingModal';
import { academyModalTemplate } from '../templates/academyModal';
import { abilitiesModalTemplate } from '../templates/abilitiesModal';
import { levelPrepModalTemplate } from '../templates/levelPrepModal';
import { crystalRepairModalTemplate } from '../templates/crystalRepairModal';
import { authModalTemplate } from '../templates/authModal';
import { streakModalTemplate } from '../templates/streakModal';
import { abilityDetailModalTemplate } from '../templates/abilityDetailModal';
import { postcardModalTemplate } from '../templates/postcardModal';
import { clanModalTemplate } from '../templates/clanModal';
import { leagueModalTemplate } from '../templates/leagueModal';
import { getLevelModifierProfile, isBranchingLevel } from '../../engine/levelModifiers';
import { getRelicDef } from '../../engine/relics';
import { getMapGateDef } from '../../engine/mapGates';
import { getAmbientBackgroundHTML } from '../../design/backgrounds';
import { Icons, renderAvatarSVG, renderRankBadgeSVG, AVATAR_LIST } from '../../design/icons';
import { t, getLang, translateRankName } from '../../i18n/translations';
import { getLevelConfig, getRegionForLevel } from '../../engine/rhythmConfig';
import { BoardMechanicsState, SpecialCellRuntime } from '../../engine/boardMechanics';
import { getAbilityDef, AbilityId } from '../../engine/abilities';
import { Player, SpeedRecord } from '../../engine/leaderboard';
import { ShopItems, ShopManager } from '../../engine/shop';
import { BadgeStatus } from '../../engine/achievements';
import { ProfileStats, UserManager } from '../../store/userState';
import { ChallengeRequest } from '../../engine/matchEngine';
import { BotCharacter } from '../../engine/botData';
import { SudokuVariant, KillerCage, SudokuGen } from '../../engine/sudoku';
import { SamuraiViewport, renderSamuraiBoard, SamuraiBoardData } from '../samuraiViewport';
import { SoundManager } from '../../engine/soundManager';
import { escapeHTML, formatDisplayName } from '../../utils/sanitize';
import { SavedGameRecord } from '../types';

export const boardUI = {
  renderBoard(
    board: number[][],
    onCellClick: (r: number, c: number) => void,
    selectedR: number,
    selectedC: number,
    initialBoard?: number[][],
    notesBoard?: Set<number>[][],
    variant: SudokuVariant = 'classic',
    regionMap?: number[][],
    cages?: KillerCage[],
    samuraiGridIndex?: number,
    smartHint?: { row: number; col: number; relatedCells: { r: number; c: number }[] } | null,
    specialCells?: SpecialCellRuntime[]
  ) {
    const boardEl = document.getElementById('sudoku-grid');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    const wordokuLetters = ['A','B','C','D','E','F','G','H','I'];
    const selectedVal = (selectedR >= 0 && selectedC >= 0) ? board[selectedR][selectedC] : 0;
    const selectedBoxR = selectedR >= 0 ? Math.floor(selectedR / 3) : -1;
    const selectedBoxC = selectedC >= 0 ? Math.floor(selectedC / 3) : -1;

    const cageMap = new Map<string, number>();
    if (variant === 'killer' && cages) {
      cages.forEach(cage => {
        if (cage.cells.length > 0) {
          const first = cage.cells[0];
          cageMap.set(`${first.r}_${first.c}`, cage.sum);
        }
      });
    }

    board.forEach((row, r) => {
      row.forEach((val, c) => {
        const cell = document.createElement('div');
        const isSelected = r === selectedR && c === selectedC;
        const isInitial = initialBoard ? initialBoard[r][c] !== 0 : false;

        const isRelatedGroup = selectedR >= 0 && (
          r === selectedR ||
          c === selectedC ||
          (variant === 'irregular' && regionMap ? (regionMap[r][c] === regionMap[selectedR][selectedC]) : (Math.floor(r / 3) === selectedBoxR && Math.floor(c / 3) === selectedBoxC))
        );

        const isMatchingValue = selectedVal !== 0 && val === selectedVal;

        let isSamuraiCorner = false;
        if (variant === 'samurai' && typeof samuraiGridIndex === 'number') {
          if (samuraiGridIndex === 0) isSamuraiCorner = (r < 3 || r >= 6) && (c < 3 || c >= 6);
          else if (samuraiGridIndex === 1) isSamuraiCorner = r >= 6 && c >= 6;
          else if (samuraiGridIndex === 2) isSamuraiCorner = r >= 6 && c < 3;
          else if (samuraiGridIndex === 3) isSamuraiCorner = r < 3 && c >= 6;
          else if (samuraiGridIndex === 4) isSamuraiCorner = r < 3 && c < 3;
        }

        const isHintTarget = !!(smartHint && smartHint.row === r && smartHint.col === c);
        const isHintPattern = !!(smartHint && (smartHint as any).primaryCells && (smartHint as any).primaryCells.some((pc: any) => pc.r === r && pc.c === c));
        const isHintElimination = !!(smartHint && (smartHint as any).eliminatedCells && (smartHint as any).eliminatedCells.some((ec: any) => ec.r === r && ec.c === c));
        const isHintRelated = !!(smartHint && !isHintTarget && !isHintPattern && !isHintElimination && smartHint.relatedCells.some(rc => rc.r === r && rc.c === c));

        if (isHintTarget) cell.setAttribute('data-hint-target', 'true');
        if (isHintPattern) cell.setAttribute('data-hint-pattern', 'true');
        if (isHintElimination) cell.setAttribute('data-hint-elimination', 'true');
        if (isHintRelated) cell.setAttribute('data-hint-related', 'true');

        const specCell = specialCells ? specialCells.find(sc => sc.r === r && sc.c === c) : undefined;
        let specialBadgeHTML = '';

        if (specCell) {
          if (specCell.kind === 'crystal' && specCell.state === 'active') {
            cell.setAttribute('data-special-cell', 'crystal');
            specialBadgeHTML = `<span class="absolute top-0.5 right-0.5 text-[10px] pointer-events-none drop-shadow z-2">💎</span>`;
          } else if (specCell.kind === 'crystal' && specCell.state === 'cracked') {
            cell.setAttribute('data-special-cell', 'cracked');
            specialBadgeHTML = `<span class="absolute top-0.5 right-0.5 text-[10px] opacity-60 pointer-events-none drop-shadow z-2">💔</span>`;
          } else if (specCell.kind === 'key' && specCell.state === 'active') {
            cell.setAttribute('data-special-cell', 'key');
            specialBadgeHTML = `<span class="absolute top-0.5 right-0.5 text-[10px] pointer-events-none drop-shadow z-2">🗝️</span>`;
          } else if (specCell.kind === 'seal' && specCell.state === 'active') {
            cell.setAttribute('data-special-cell', 'seal');
            cell.setAttribute('data-sealed', 'true');
            specialBadgeHTML = `<span class="absolute top-0.5 right-0.5 text-[10px] pointer-events-none drop-shadow z-2">🔒</span>`;
          } else if (specCell.kind === 'spark' && specCell.state === 'active') {
            cell.setAttribute('data-special-cell', 'spark');
            specialBadgeHTML = `<span class="absolute top-0.5 right-0.5 text-[10px] pointer-events-none drop-shadow z-2">⚡</span>`;
          } else if (specCell.kind === 'treasure' && specCell.state === 'active') {
            cell.setAttribute('data-special-cell', 'treasure');
            specialBadgeHTML = `<span class="absolute top-0.5 right-0.5 text-[10px] pointer-events-none drop-shadow z-2">🎁</span>`;
          }
        }

        let bgStyle = 'bg-[var(--cell-bg)]';
        if (specCell?.kind === 'seal' && specCell.state === 'active') {
          bgStyle = 'bg-[var(--cell-bg)] ring-1 ring-rose-400/70';
        } else if (isHintTarget) {
          bgStyle = 'bg-emerald-500/20 ring-2 ring-emerald-400 z-10';
        } else if (isHintPattern) {
          bgStyle = 'bg-amber-500/25 ring-2 ring-amber-400 z-10 animate-pulse';
        } else if (isHintElimination) {
          bgStyle = 'bg-rose-500/15 ring-1 ring-rose-400 z-5';
        } else if (isHintRelated) {
          bgStyle = 'bg-[var(--accent-cyan)]/10';
        } else if (isMatchingValue) {
          bgStyle = 'bg-[var(--cell-match-bg)] ring-1 ring-[var(--accent-gold)]/50 z-1';
        } else if (isRelatedGroup) {
          bgStyle = 'bg-[var(--cell-related-bg)]';
        } else if (isSamuraiCorner) {
          bgStyle = 'bg-[var(--cell-initial-bg)] ring-1 ring-inset ring-rose-500/50';
        } else if (isInitial) {
          bgStyle = 'bg-[var(--cell-initial-bg)]';
        }

        const textColor = isInitial ? 'text-[var(--cell-initial-text)] font-black' : 'text-[var(--cell-user-text)] font-black';

        let stateClass = '';
        if (isSelected) {
          stateClass = 'sudoku-cell-selected bg-[var(--cell-selected-bg)] text-[var(--text-on-gold)] font-black shadow-lg ring-2 ring-[var(--accent-gold-bright)] z-10';
        } else {
          stateClass = `${bgStyle} ${textColor} cursor-pointer`;
        }

        let borderRight = '';
        let borderBottom = '';

        if (variant === 'irregular' && regionMap) {
          const currentRegion = regionMap[r][c];
          if (c < 8 && regionMap[r][c + 1] !== currentRegion) {
            borderRight = '!border-r-[2.5px] !border-r-[var(--accent-gold)] shadow-[inset_-1px_0_0_rgba(0,0,0,0.12)]';
          }
          if (r < 8 && regionMap[r + 1][c] !== currentRegion) {
            borderBottom = '!border-b-[2.5px] !border-b-[var(--accent-gold)] shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)]';
          }
        } else {
          if (c === 2 || c === 5) borderRight = '!border-r-[2.5px] !border-r-[var(--accent-gold)] shadow-[inset_-1px_0_0_rgba(0,0,0,0.12)]';
          if (r === 2 || r === 5) borderBottom = '!border-b-[2.5px] !border-b-[var(--accent-gold)] shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)]';
        }

        cell.className = `w-full h-full min-w-0 min-h-0 box-border border border-[var(--border-subtle)] flex items-center justify-center text-lg select-none cursor-pointer active:scale-[0.96] transition-transform duration-100 ease-out relative ${stateClass} ${borderRight} ${borderBottom}`;

        if (specialBadgeHTML) {
          cell.insertAdjacentHTML('beforeend', specialBadgeHTML);
        }

        // Killer Sudoku Dış Sınır Kafes Çerçevesi
        if (variant === 'killer' && cages) {
          const myCageIdx = cages.findIndex(cg => cg.cells.some(cell => cell.r === r && cell.c === c));
          if (myCageIdx >= 0) {
            const topCageIdx = r > 0 ? cages.findIndex(cg => cg.cells.some(cell => cell.r === r - 1 && cell.c === c)) : -1;
            const bottomCageIdx = r < 8 ? cages.findIndex(cg => cg.cells.some(cell => cell.r === r + 1 && cell.c === c)) : -1;
            const leftCageIdx = c > 0 ? cages.findIndex(cg => cg.cells.some(cell => cell.r === r && cell.c === c - 1)) : -1;
            const rightCageIdx = c < 8 ? cages.findIndex(cg => cg.cells.some(cell => cell.r === r && cell.c === c + 1)) : -1;

            const cageFrame = document.createElement('div');
            let frameBorders = 'pointer-events-none absolute inset-[2px] z-5 ';

            if (topCageIdx !== myCageIdx) frameBorders += 'border-t border-dashed border-[var(--accent-gold)] ';
            if (bottomCageIdx !== myCageIdx) frameBorders += 'border-b border-dashed border-[var(--accent-gold)] ';
            if (leftCageIdx !== myCageIdx) frameBorders += 'border-l border-dashed border-[var(--accent-gold)] ';
            if (rightCageIdx !== myCageIdx) frameBorders += 'border-r border-dashed border-[var(--accent-gold)] ';

            cageFrame.className = frameBorders;
            cell.appendChild(cageFrame);
          }
        }

        // Killer Sudoku kafes toplamı rozeti (Sol Üst Hücre)
        const cageSum = cageMap.get(`${r}_${c}`);
        if (variant === 'killer' && cageSum !== undefined) {
          const cageBadge = document.createElement('span');
          cageBadge.className = "absolute top-[2px] left-[3px] text-[8px] font-mono font-black text-[var(--accent-gold)] leading-none pointer-events-none z-10";
          cageBadge.innerText = cageSum.toString();
          cell.appendChild(cageBadge);
        }

        const cellNotes = notesBoard ? notesBoard[r][c] : undefined;
        if (val === 0 && cellNotes && cellNotes.size > 0) {
          const notesDiv = document.createElement('div');
          notesDiv.className = "grid grid-cols-3 gap-0 w-full h-full p-0.5 pointer-events-none text-[8px] font-mono leading-none text-[var(--text-secondary)] font-bold items-center justify-center text-center";
          notesDiv.innerHTML = [1,2,3,4,5,6,7,8,9].map(n => `<div>${cellNotes.has(n) ? (variant === 'wordoku' ? wordokuLetters[n - 1] : n) : ''}</div>`).join('');
          cell.appendChild(notesDiv);
        } else if (val !== 0) {
          const textSpan = document.createElement('span');
          if (variant === 'killer' && cageSum !== undefined) {
            textSpan.className = "mt-1.5 text-base";
          }
          textSpan.innerText = variant === 'wordoku' ? wordokuLetters[val - 1] : val.toString();
          cell.appendChild(textSpan);
        }

        cell.onclick = () => onCellClick(r, c);
        boardEl.appendChild(cell);
      });
    });
    // Vektörel Çözücü Işınları Katmanı (Raycasting Visualizer)
    const existingSvg = boardEl.querySelector('#hint-raycast-overlay');
    if (existingSvg) existingSvg.remove();

    const advHint = smartHint as any;
    if (advHint && advHint.primaryCells && advHint.primaryCells.length >= 2) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('id', 'hint-raycast-overlay');
      svg.setAttribute('class', 'absolute inset-0 pointer-events-none w-full h-full z-15');
      svg.setAttribute('viewBox', '0 0 900 900');

      const pts = advHint.primaryCells.map((pc: any) => ({
        x: pc.c * 100 + 50,
        y: pc.r * 100 + 50
      }));

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          if (pts[i].x === pts[j].x || pts[i].y === pts[j].y) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', pts[i].x.toString());
            line.setAttribute('y1', pts[i].y.toString());
            line.setAttribute('x2', pts[j].x.toString());
            line.setAttribute('y2', pts[j].y.toString());
            line.setAttribute('stroke', '#F59E0B');
            line.setAttribute('stroke-width', '4');
            line.setAttribute('stroke-dasharray', '8,6');
            line.setAttribute('stroke-opacity', '0.85');
            line.setAttribute('class', 'animate-pulse');
            svg.appendChild(line);
          }
        }
      }
      boardEl.appendChild(svg);
    }

  },

  renderNumpad(
    onNumberClick: (num: number) => void,
    remainingCounts?: Map<number, number>,
    isWordoku: boolean = false,
    selectedNum: number = 0
  ) {
    const grid = document.getElementById('numpad-grid');
    if (!grid) return;

    let row1 = document.getElementById('numpad-row-1');
    let row2 = document.getElementById('numpad-row-2');

    if (!row1 || !row2) {
      grid.innerHTML = `
        <div id="numpad-row-1" class="grid grid-cols-5 gap-1.5 sm:gap-2 w-full"></div>
        <div id="numpad-row-2" class="grid grid-cols-4 gap-1.5 sm:gap-2 w-[82%] sm:w-[84%] mx-auto"></div>
      `;
      row1 = document.getElementById('numpad-row-1');
      row2 = document.getElementById('numpad-row-2');
    }

    if (row1) row1.innerHTML = '';
    if (row2) row2.innerHTML = '';

    const wordokuLetters = ['A','B','C','D','E','F','G','H','I'];

    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(num => {
        const label = isWordoku ? wordokuLetters[num - 1] : num.toString();
        const remaining = remainingCounts ? remainingCounts.get(num) ?? 9 : 9;
        const isCompleted = remaining <= 0;
        const isSelected = selectedNum === num;

        const btn = document.createElement('button');
        btn.type = "button";
        btn.setAttribute('data-numpad-num', num.toString());
        let btnClasses = 'min-h-[48px] py-1.5 px-2 rounded-2xl border font-black text-base transition-all flex flex-col items-center justify-center relative shadow-sm select-none ';

        if (isCompleted) {
          btnClasses += 'opacity-30 pointer-events-none cursor-not-allowed bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]';
        } else if (isSelected) {
          btnClasses += 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold-bright)] border-2 border-[var(--accent-gold)] ring-2 ring-[var(--accent-gold)]/50 shadow-md z-10 active:scale-95 cursor-pointer';
        } else {
          btnClasses += 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border-[var(--border-subtle)] text-[var(--text-primary)] active:scale-95 cursor-pointer';
        }

        btn.className = btnClasses;

        btn.innerHTML = `
          <span class="pointer-events-none text-base sm:text-lg font-black leading-none">${label}</span>
          <span class="absolute bottom-1 right-1.5 text-[8.5px] font-mono font-black pointer-events-none leading-none px-1 py-0.5 rounded ${isCompleted ? 'text-amber-400 bg-amber-500/20 border border-amber-400/40' : 'text-[var(--accent-gold)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]'}">${isCompleted ? '✓' : remaining}</span>
        `;
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          SoundManager.vibrate(10);
          onNumberClick(num);
        };

        if (num <= 5 && row1) {
          row1.appendChild(btn);
        } else if (row2) {
          row2.appendChild(btn);
        } else {
          grid.appendChild(btn);
        }
    });
  },

  updateHintButtonLabel(freeHints: number = 0) {
    const hintSpan = document.querySelector('#btn-hint [data-i18n="btn_hint"]');
    const applySpan = document.querySelector('#btn-apply-smart-hint [data-i18n="hint_btn_apply"]');

    if (freeHints > 0) {
      if (hintSpan) hintSpan.textContent = t('btn_hint_free', { count: freeHints });
      if (applySpan) applySpan.textContent = t('hint_btn_apply_free');
    } else {
      if (hintSpan) hintSpan.textContent = t('btn_hint');
      if (applySpan) applySpan.textContent = t('hint_btn_apply');
    }
  },

  renderGameMechanicsBar(
    state: BoardMechanicsState | null,
    handlers: { onUseOracle: () => void; onUseSealBreaker: () => void; onOpenRepair?: () => void },
    timeElapsedSec: number = 0
  ) {
    const bar = document.getElementById('game-mechanics-bar');
    const energyPill = document.getElementById('game-energy-pill');
    const crystalCounter = document.getElementById('game-crystal-counter');
    const abilitiesContainer = document.getElementById('game-equipped-abilities');
    const gamePopover = document.getElementById('game-info-popover');

    if (!bar || !state) {
      if (bar) { bar.classList.add('hidden'); bar.classList.remove('flex'); }
      if (gamePopover) { gamePopover.classList.add('hidden'); gamePopover.innerText = ''; }
      return;
    }

    bar.classList.remove('hidden');
    bar.classList.add('flex');

    if (energyPill) {
      energyPill.className = "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-lg text-[10px] font-black text-[var(--accent-gold)] flex items-center gap-1 shadow-inner cursor-pointer hover:brightness-110 active:scale-95 transition-all";
      energyPill.innerHTML = `${state.profile.icon} <span>${t('energy_name_' + state.profile.energyId)}</span> <span class="text-[10px] opacity-80 font-normal">ⓘ</span>`;
      energyPill.onclick = () => {
        this.toggleGameInfoPopover(state.profile.energyId);
      };
    }

    if (crystalCounter) crystalCounter.innerText = `${state.crystalsEarnedInRun}/${state.profile.maxCollectibleCrystals}💎`;
    const relicPill = document.getElementById('game-relic-pill');
    const equippedRelic = UserManager.getEquippedRelic();
    if (relicPill) {
      if (equippedRelic) {
        const rDef = getRelicDef(equippedRelic);
        relicPill.classList.remove('hidden');
        relicPill.innerHTML = `<span>${rDef.icon}</span><span class="text-[9px] font-mono font-bold hidden sm:inline">${t(rDef.nameKey).slice(0, 6)}</span>`;
        relicPill.onclick = (e) => {
          e.stopPropagation();
          this.showToast(`🧭 ${t(rDef.nameKey)}: ${t(rDef.descKey)}`, 'info');
        };
      } else {
        relicPill.classList.add('hidden');
      }
    }


    this.updateMechanicsLiveTimers(state, timeElapsedSec);

    if (abilitiesContainer) {
      abilitiesContainer.innerHTML = '';
      state.equippedAbilities.forEach(id => {
        const def = getAbilityDef(id);
        let charges = 0;
        if (id === 'oracle_eye') charges = state.oracleChargesLeft;
        if (id === 'seal_breaker') charges = state.sealBreakerChargesLeft;
        if (id === 'crystal_shield') charges = state.shieldChargesLeft;

        const btn = document.createElement('button');
        let btnClasses = 'px-2 py-1 rounded-xl font-extrabold text-[10px] border shadow-sm flex items-center gap-1 transition-all active:scale-95 ';

        if (def.triggerType === 'active') {
          if (charges > 0) {
            btnClasses += 'bg-[var(--accent-gold)] text-[var(--text-on-gold)] border-[var(--accent-gold-bright)] cursor-pointer';
          } else {
            btnClasses += 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] opacity-50 cursor-not-allowed';
          }
        } else {
          btnClasses += 'bg-[var(--bg-elevated)] text-[var(--accent-gold)] border-[var(--border-subtle)] cursor-default';
        }

        btn.className = btnClasses;
        btn.setAttribute('data-game-ability', id);

        const chargesBadge = (def.triggerType === 'active' || id === 'crystal_shield')
          ? `<span class="text-[9px] font-mono font-black opacity-90">(${charges})</span>`
          : '';

        btn.innerHTML = `<span>${def.icon}</span>${chargesBadge}`;

        if (def.triggerType === 'active' && charges > 0) {
          btn.onclick = () => {
            if (id === 'oracle_eye') handlers.onUseOracle();
            if (id === 'seal_breaker') handlers.onUseSealBreaker();
          };
        }

        abilitiesContainer.appendChild(btn);
      });

      if (state.errorShieldsGranted > 0) {
        const shieldBadge = document.createElement('span');
        shieldBadge.setAttribute('data-treasure-shield', 'true');
        shieldBadge.className = 'px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-400 border border-emerald-400/40';
        shieldBadge.innerHTML = `🛡️x${state.errorShieldsGranted}`;
        abilitiesContainer.appendChild(shieldBadge);
      }

      if (state.crackedCrystals.length > 0) {
        const repairBtn = document.createElement('button');
        repairBtn.id = 'btn-open-crystal-repair';
        repairBtn.className = 'px-2 py-1 rounded-xl font-extrabold text-[10px] bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer animate-pulse';
        repairBtn.innerHTML = `<span>${t('repair_btn_open')}</span>`;
        if (handlers.onOpenRepair) {
          repairBtn.onclick = handlers.onOpenRepair;
        }
        abilitiesContainer.appendChild(repairBtn);
      }
    }
  },

  showSmartHintBanner(
    techLabel: string,
    reasonText: string,
    stepInfo?: { currentStep: number; totalSteps: number; onNextStep?: () => void }
  ) {
    const banner = document.getElementById('smart-hint-banner');
    const techEl = document.getElementById('smart-hint-tech');
    const textEl = document.getElementById('smart-hint-text');
    const stepBadge = document.getElementById('smart-hint-step-badge');
    const stepBtn = document.getElementById('btn-step-smart-hint');

    if (techEl) techEl.innerText = techLabel;
    if (textEl) textEl.innerText = reasonText;

    if (stepInfo && stepInfo.totalSteps > 1) {
      if (stepBadge) {
        stepBadge.classList.remove('hidden');
        stepBadge.innerText = `${t('hint_step_label')} ${stepInfo.currentStep}/${stepInfo.totalSteps}`;
      }
      if (stepBtn) {
        if (stepInfo.currentStep < stepInfo.totalSteps) {
          stepBtn.classList.remove('hidden');
          stepBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (stepInfo.onNextStep) stepInfo.onNextStep();
          };
        } else {
          stepBtn.classList.add('hidden');
        }
      }
    } else {
      if (stepBadge) stepBadge.classList.add('hidden');
      if (stepBtn) stepBtn.classList.add('hidden');
    }

    if (banner) {
      banner.classList.remove('hidden');
      banner.classList.add('flex');
    }
  },

  hideSmartHintBanner() {
    const banner = document.getElementById('smart-hint-banner');
    if (banner) {
      banner.classList.add('hidden');
      banner.classList.remove('flex');
    }
    const stepBadge = document.getElementById('smart-hint-step-badge');
    const stepBtn = document.getElementById('btn-step-smart-hint');
    if (stepBadge) stepBadge.classList.add('hidden');
    if (stepBtn) stepBtn.classList.add('hidden');
  },

  triggerBoardShakeAndCrack(): void {
    const boardEl = document.getElementById('sudoku-grid');
    if (!boardEl) return;
    boardEl.classList.add('ring-4', 'ring-rose-600', 'border-rose-600', 'scale-[0.98]');
    setTimeout(() => {
      boardEl.classList.remove('ring-4', 'ring-rose-600', 'border-rose-600', 'scale-[0.98]');
    }, 400);
  },

  updateMechanicsLiveTimers(
    state: BoardMechanicsState | null,
    timeElapsedSec: number = 0,
    nowMs: number = Date.now()
  ): void {
    const momentumPill = document.getElementById('game-momentum-pill');
    if (!momentumPill || !state) {
      if (momentumPill) {
        momentumPill.classList.add('hidden');
      }
      return;
    }

    const isSparkActive = nowMs < state.sparkFlowEndsAtMs;
    if (isSparkActive) {
      const remSec = Math.ceil((state.sparkFlowEndsAtMs - nowMs) / 1000);
      momentumPill.classList.remove('hidden');
      if (state.sparkCombo >= 5) {
        momentumPill.className = 'bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-rose-500/30 text-amber-200 border-2 border-orange-400 px-2 py-0.5 rounded-md text-[9px] font-mono font-black animate-pulse shadow-md';
      } else if (state.sparkCombo >= 3) {
        momentumPill.className = 'bg-orange-500/25 text-orange-200 border border-orange-400/50 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black animate-pulse shadow-sm';
      } else {
        momentumPill.className = 'bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black animate-pulse';
      }
      momentumPill.innerText = `⚡ x${state.sparkCombo} (${remSec}s)`;
    } else if (state.profile.sprintTargetSec > 0) {
      const remainingSec = state.profile.sprintTargetSec - timeElapsedSec;
      momentumPill.classList.remove('hidden');
      if (remainingSec >= 0) {
        const mm = Math.floor(remainingSec / 60).toString().padStart(2, '0');
        const ss = (remainingSec % 60).toString().padStart(2, '0');
        momentumPill.className = 'bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black';
        momentumPill.innerText = `⏱️ ${mm}:${ss}`;
      } else {
        momentumPill.className = 'bg-slate-700/40 text-slate-400 border border-slate-600/40 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black';
        momentumPill.innerText = t('sprint_missed');
      }
    } else {
      momentumPill.classList.add('hidden');
    }
    const boardEl = document.getElementById('sudoku-grid');
    if (boardEl) {
      if (isSparkActive) {
        if (state.sparkCombo >= 5) {
          boardEl.classList.add('border-rose-500', 'ring-4', 'ring-rose-500/50');
          boardEl.classList.remove('border-[var(--border-strong)]', 'border-amber-400', 'border-cyan-400', 'ring-2', 'ring-3', 'ring-cyan-400/40', 'ring-amber-400/50');
        } else if (state.sparkCombo >= 3) {
          boardEl.classList.add('border-amber-400', 'ring-3', 'ring-amber-400/50');
          boardEl.classList.remove('border-[var(--border-strong)]', 'border-rose-500', 'border-cyan-400', 'ring-2', 'ring-4', 'ring-cyan-400/40', 'ring-rose-500/50');
        } else {
          boardEl.classList.add('border-cyan-400', 'ring-2', 'ring-cyan-400/40');
          boardEl.classList.remove('border-[var(--border-strong)]', 'border-rose-500', 'border-amber-400', 'ring-3', 'ring-4', 'ring-amber-400/50', 'ring-rose-500/50');
        }
      } else {
        boardEl.classList.remove('border-rose-500', 'border-amber-400', 'border-cyan-400', 'ring-2', 'ring-3', 'ring-4', 'ring-cyan-400/40', 'ring-amber-400/50', 'ring-rose-500/50');
        boardEl.classList.add('border-[var(--border-strong)]');
      }
    }
  },

  renderSamuraiRadar(
    activeIndex: number,
    completionStatuses: { completed: boolean; remaining: number }[],
    onSelect: (idx: number) => void
  ) {
    const barEl = document.getElementById('samurai-radar-bar');
    if (!barEl) return;
    barEl.classList.remove('hidden');
    barEl.classList.add('grid');

    const radarItems = [
      { idx: 1, label: t('radar_top_left') },
      { idx: 2, label: t('radar_top_right') },
      { idx: 0, label: t('radar_center') },
      { idx: 3, label: t('radar_bottom_left') },
      { idx: 4, label: t('radar_bottom_right') }
    ];

    barEl.innerHTML = radarItems.map(item => {
      const isSelected = item.idx === activeIndex;
      const status = completionStatuses[item.idx] || { completed: false, remaining: 0 };

      let btnClass = "bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]";
      if (isSelected) {
        btnClass = "bg-rose-600 text-white font-black shadow-sm ring-2 ring-rose-400";
      } else if (status.completed) {
        btnClass = "bg-emerald-500 text-white font-black";
      }

      const badgeText = status.completed ? '✓' : t('radar_empty_count', { count: status.remaining });

      return `
        <button data-samurai-idx="${item.idx}" class="samurai-radar-btn ${btnClass} py-1.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center transition-all active:scale-95 leading-tight">
          <span>${item.label}</span>
          <span class="text-[8px] font-mono opacity-90">${badgeText}</span>
        </button>
      `;
    }).join('');

    barEl.querySelectorAll('.samurai-radar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-samurai-idx') || '0');
        onSelect(idx);
      });
    });
  },

  hideSamuraiRadar() {
    const barEl = document.getElementById('samurai-radar-bar');
    if (barEl) {
      barEl.classList.add('hidden');
      barEl.classList.remove('grid');
    }
  },

  renderSamuraiSpace(
    boards: SamuraiBoardData[],
    activeGridIdx: number,
    selectedR: number,
    selectedC: number,
    onCellClick: (gridIdx: number, r: number, c: number) => void
  ) {
    const gridEl = document.getElementById('sudoku-grid');
    const vpEl = document.getElementById('samurai-viewport');

    if (gridEl) {
      gridEl.classList.add('hidden');
      gridEl.classList.remove('grid');
    }
    if (vpEl) {
      vpEl.classList.remove('hidden');
      renderSamuraiBoard(vpEl, boards, activeGridIdx, selectedR, selectedC, onCellClick);
    }
  },

  hideSamuraiSpace() {
    const gridEl = document.getElementById('sudoku-grid');
    const vpEl = document.getElementById('samurai-viewport');

    if (vpEl) {
      vpEl.classList.add('hidden');
    }
    if (gridEl) {
      gridEl.classList.remove('hidden');
      gridEl.classList.add('grid');
    }
    SamuraiViewport.resetCamera();
  },

  focusSamuraiGrid(gridIdx: number) {
    const vpEl = document.getElementById('samurai-viewport');
    if (vpEl && !vpEl.classList.contains('hidden')) {
      SamuraiViewport.focusGrid(gridIdx, vpEl, true);
    }
  }
};
