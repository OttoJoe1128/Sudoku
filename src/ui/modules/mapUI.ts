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

export const mapUI = {
  renderMap(
    currentLevel: number,
    windowStart: number,
    windowEnd: number,
    onNodeClick: (level: number) => void,
    autoScrollToCurrent: boolean = false,
    variant: SudokuVariant = 'classic',
    onGateClick?: (gateLevel: number) => void
  ) {
    const container = document.getElementById('map-path-container');
    const targetLabel = document.getElementById('map-target-label');
    const biomeTitle = document.getElementById('map-biome-title');
    const tierProgress = document.getElementById('map-tier-progress');
    if (!container) return;
    container.innerHTML = '';

    const diff = SudokuGen.getDifficulty(currentLevel);
    if (targetLabel) {
      const currentLang = getLang();
      const diffUpper = currentLang === 'tr' ? t('diff_' + diff).toLocaleUpperCase('tr-TR') : t('diff_' + diff).toUpperCase();
      targetLabel.innerText = `${t('label_level')} ${currentLevel} • ${diffUpper}`;
    }

    if (biomeTitle) {
      if (currentLevel <= 300) biomeTitle.innerText = t('biome_emerald');
      else if (currentLevel <= 700) biomeTitle.innerText = t('biome_hextech');
      else biomeTitle.innerText = t('biome_crimson');
    }

    if (tierProgress) {
      const pct = Math.min(100, Math.max(5, Math.round(((currentLevel % 300) / 300) * 100)));
      tierProgress.style.width = `${pct}%`;
    }
    const scrollArea = document.getElementById('map-scroll-area');
    if (scrollArea) {
      if (currentLevel <= 300) {
        scrollArea.className = 'w-full h-full overflow-y-auto hidden-scrollbar relative z-10 pt-4 pb-28 bg-gradient-to-b from-emerald-950/15 via-transparent to-emerald-950/10 transition-colors duration-500';
      } else if (currentLevel <= 700) {
        scrollArea.className = 'w-full h-full overflow-y-auto hidden-scrollbar relative z-10 pt-4 pb-28 bg-gradient-to-b from-amber-950/20 via-transparent to-amber-950/15 transition-colors duration-500';
      } else {
        scrollArea.className = 'w-full h-full overflow-y-auto hidden-scrollbar relative z-10 pt-4 pb-28 bg-gradient-to-b from-rose-950/25 via-transparent to-indigo-950/20 transition-colors duration-500';
      }
    }


    // 20 Bölge × 50 Bölüm Kartı Güncellemesi
    const currentRegion = getRegionForLevel(currentLevel);
    const rhythmCfg = getLevelConfig(currentLevel, variant);
    const regionBanner = document.getElementById('map-region-banner');
    const regionBadge = document.getElementById('map-region-badge');
    const regionTitle = document.getElementById('map-region-title');
    const regionTech = document.getElementById('map-region-tech');
    const regionProgressText = document.getElementById('map-region-progress-text');
    const regionProgressBar = document.getElementById('map-region-progress-bar');

    if (regionBanner && regionBadge && regionTitle && regionTech && regionProgressText && regionProgressBar) {
      regionBadge.innerText = t('map_region_label', { id: currentRegion.id });
      regionTitle.innerText = t(currentRegion.key);
      regionTech.innerText = t('tech_' + currentRegion.techniqueId);
      regionProgressText.innerText = t('map_region_progress', { current: rhythmCfg.levelInRegion });
      const pct = Math.min(100, Math.max(2, (rhythmCfg.levelInRegion / 50) * 100));
      regionProgressBar.style.width = `${pct}%`;

      let borderColor = 'var(--border-strong)';
      if (currentRegion.biome === 'emerald') borderColor = 'rgba(16, 185, 129, 0.4)';
      else if (currentRegion.biome === 'hextech') borderColor = 'rgba(6, 182, 212, 0.4)';
      else if (currentRegion.biome === 'crimson') borderColor = 'rgba(244, 63, 94, 0.4)';
      regionBanner.style.borderColor = borderColor;
    }

    const startLvl = Math.max(1, windowStart);
    const endLvl = Math.min(1000, Math.max(startLvl + 5, windowEnd));
    const totalLevels = endLvl - startLvl + 1;

    const ROW_H = 116;
    const totalHeight = totalLevels * ROW_H;
    container.style.height = `${totalHeight}px`;

    const avatar = UserManager.getAvatar() || 'av_prism';

    // Exact Numeric SVG Energy Path
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('width', '320');
    svgEl.setAttribute('height', totalHeight.toString());
    svgEl.setAttribute('viewBox', `0 0 320 ${totalHeight}`);
    svgEl.setAttribute('class', 'absolute top-0 left-0 pointer-events-none z-0');
    container.appendChild(svgEl);

    const nodePoints: { lvl: number; cx: number; cy: number }[] = [];

    let index = 0;
    for (let lvl = endLvl; lvl >= startLvl; lvl--) {
      const isCompleted = lvl < currentLevel;
      const isCurrent = lvl === currentLevel;
      const nodeRhythm = getLevelConfig(lvl, variant);

      const offsetX = Math.round(Math.sin(lvl * 0.85) * 76);
      const cx = 160 + offsetX;
      const cy = index * ROW_H + (ROW_H / 2);

      nodePoints.push({ lvl, cx, cy });

      const wrapper = document.createElement('div');
      wrapper.id = `map-node-${lvl}`;
      wrapper.setAttribute('data-map-level', lvl.toString());
      wrapper.style.position = 'absolute';
      wrapper.style.top = `${index * ROW_H}px`;
      wrapper.style.left = '0px';
      wrapper.style.width = '320px';
      wrapper.style.height = `${ROW_H}px`;
      wrapper.className = 'flex items-center justify-center relative z-10';

      const innerBox = document.createElement('div');
      innerBox.className = 'relative flex flex-col items-center justify-center group';
      innerBox.style.transform = `translateX(${offsetX}px)`;

      let milestoneBadge = '';
      if (nodeRhythm.isRegionGuardian) {
        milestoneBadge = `<div class="absolute -top-4 z-30 pointer-events-none bg-rose-600/90 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full border border-rose-400 shadow flex items-center gap-0.5"><span>👑</span><span>${t('map_guardian_tag')}</span></div>`;
      } else if (nodeRhythm.isMilestone) {
        milestoneBadge = `<div class="absolute -top-4 z-30 pointer-events-none bg-amber-500/90 text-amber-950 font-black text-[9px] px-1.5 py-0.5 rounded-full border border-amber-300 shadow flex items-center gap-0.5"><span>⭐</span><span>${t('map_milestone_tag')}</span></div>`;
      }

      const modProfile = getLevelModifierProfile(lvl, variant);
      const collectedCrystals = UserManager.getLevelCollectedCrystals(variant, lvl);
      const energyBadgeHTML = `<span class="absolute -bottom-1.5 -right-1.5 text-[11px] bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-full w-5 h-5 flex items-center justify-center shadow z-20 pointer-events-none">${modProfile.icon}</span>`;
      const crystalCounterHTML = (isCompleted || isCurrent)
        ? `<div data-node-crystals="${lvl}" class="absolute -bottom-4 text-[9px] font-mono font-black text-[var(--accent-cyan)] pointer-events-none z-20">${collectedCrystals}/${modProfile.maxCollectibleCrystals}💎</div>`
        : '';

      let gateBadgeHTML = '';
      if (lvl % 10 === 0) {
        const gateDef = getMapGateDef(lvl, variant);
        if (gateDef) {
          const isClaimed = UserManager.isMapGateClaimed(variant, lvl);
          const collectedBlock = UserManager.getBlockCollectedCrystals(variant, gateDef.startLevel, gateDef.endLevel);
          const isReady = collectedBlock >= gateDef.requiredCrystals;

          let status = 'locked';
          let statusClasses = 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] opacity-70';
          let label = `🔒 ${collectedBlock}/${gateDef.requiredCrystals}💎`;

          if (isClaimed) {
            status = 'claimed';
            statusClasses = 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300';
            label = `✅ ${t('gate_btn_claimed')}`;
          } else if (isReady) {
            status = 'ready';
            statusClasses = 'bg-amber-500/30 border-amber-400 text-amber-200 animate-pulse';
            label = `🎁 ${t('gate_btn_open')}`;
          }

          if (gateDef.isRegionVault) {
            gateBadgeHTML = `
              <div class="absolute -left-28 top-1/2 -translate-y-1/2 w-24 flex flex-col items-center p-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[var(--bg-card)] to-amber-500/20 border-2 border-amber-400/80 shadow-xl z-25">
                <span class="text-[7.5px] font-black uppercase text-amber-300 tracking-wider mb-1 flex items-center gap-0.5"><span>⛩️</span><span>${t('map_region_gate_title', { id: Math.floor(lvl / 50) })}</span></span>
                <button data-map-gate="${lvl}" data-gate-status="${status}" class="border font-mono font-black text-[8.5px] px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${statusClasses}">
                  <span>${label}</span>
                </button>
              </div>
            `;
          } else {
            gateBadgeHTML = `
              <button data-map-gate="${lvl}" data-gate-status="${status}" class="absolute -left-20 top-1/2 -translate-y-1/2 border font-mono font-black text-[9px] px-2 py-1 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all z-20 cursor-pointer ${statusClasses}">
                <span>${label}</span>
              </button>
            `;
          }
        }
      }

      if (isCurrent) {
        innerBox.innerHTML = `
          ${milestoneBadge}
          ${gateBadgeHTML}
          <div class="absolute -top-7 bg-[var(--bg-app)] border border-[var(--accent-gold)] text-[var(--accent-gold-bright)] font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 z-30">
            <span>${renderAvatarSVG(avatar, 14)}</span>
            <span>${t('label_level').toUpperCase()} ${lvl}</span>
          </div>
          <button data-level="${lvl}" class="w-24 h-24 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-strong)] ring-4 ring-[var(--accent-cyan)]/60 text-[var(--text-primary)] shadow-2xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform relative">
            <span class="text-xl font-mono font-black leading-none text-[var(--accent-gold)]">${lvl}</span>
            <span class="text-[9px] font-black text-[var(--accent-gold-bright)] tracking-widest mt-1">${t('btn_play')}</span>
            ${energyBadgeHTML}
          </button>
          ${crystalCounterHTML}
        `;
      } else if (isCompleted) {
        innerBox.innerHTML = `
          ${milestoneBadge}
          ${gateBadgeHTML}
          <button data-level="${lvl}" class="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--accent-cyan)] text-[var(--text-primary)] shadow-md flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform relative">
            <span class="text-base font-mono font-black leading-none">${lvl}</span>
            <span class="mt-0.5">${Icons.check}</span>
            ${energyBadgeHTML}
          </button>
          ${crystalCounterHTML}
        `;
      } else {
        innerBox.innerHTML = `
          ${milestoneBadge}
          ${gateBadgeHTML}
          <button disabled data-level="${lvl}" class="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] text-[var(--text-secondary)] flex flex-col items-center justify-center cursor-not-allowed opacity-60 relative">
            <span class="text-sm font-mono font-black leading-none">${lvl}</span>
            <span class="mt-0.5">${Icons.lock}</span>
            ${energyBadgeHTML}
          </button>
        `;
      }

      const btn = innerBox.querySelector('button');
      if (btn) {
        const modProfile = getLevelModifierProfile(lvl, variant);
        btn.setAttribute('data-rhythm', nodeRhythm.rhythmPhase);
        btn.setAttribute('data-energy', modProfile.energyId);
        if (isBranchingLevel(lvl)) {
          btn.setAttribute('data-branching', 'true');
          const isEn = getLang() === 'en';
          const speedLabel = isEn ? 'Speed' : 'Hız';
          const branchBadgeHTML = `
            <div class="absolute -top-5 flex items-center gap-1 z-30 pointer-events-none whitespace-nowrap">
              <span class="text-[7.5px] font-mono font-black bg-rose-950/90 border border-rose-500/60 text-rose-300 px-1 py-0.2 rounded shadow">🗝️ Risk</span>
              <span class="text-[7.5px] font-mono font-black bg-amber-950/90 border border-amber-400/60 text-amber-300 px-1 py-0.2 rounded shadow">⚡ ${speedLabel}</span>
            </div>
            <span class="absolute -top-1.5 -left-1.5 text-[8px] bg-[var(--bg-app)] border border-amber-400/50 rounded-full w-4 h-4 flex items-center justify-center shadow z-20 pointer-events-none text-amber-300">⚡</span>
          `;
          innerBox.insertAdjacentHTML('beforeend', branchBadgeHTML);
        }
        if (btn.hasAttribute('data-level')) {
          btn.addEventListener('click', () => onNodeClick(lvl));
        }
      }

      if (lvl > currentLevel + 2) {
        wrapper.style.filter = 'blur(1.2px)';
        wrapper.style.opacity = '0.45';
      }

      const gateBtn = innerBox.querySelector('[data-map-gate]');
      if (gateBtn && onGateClick) {
        gateBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onGateClick(lvl);
        });
      }

      wrapper.appendChild(innerBox);
      container.appendChild(wrapper);
      index++;
    }

    for (let i = 0; i < nodePoints.length - 1; i++) {
      const p1 = nodePoints[i];
      const p2 = nodePoints[i + 1];

      const midY = (p1.cy + p2.cy) / 2;
      const d = `M ${p1.cx} ${p1.cy} C ${p1.cx} ${midY}, ${p2.cx} ${midY}, ${p2.cx} ${p2.cy}`;

      const isCompletedLine = p1.lvl <= currentLevel && p2.lvl <= currentLevel;
      const isActiveLine = p2.lvl === currentLevel;

      if (isCompletedLine) {
        const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glowPath.setAttribute('d', d);
        glowPath.setAttribute('fill', 'none');
        glowPath.setAttribute('stroke', 'var(--accent-cyan)');
        glowPath.setAttribute('stroke-opacity', '0.22');
        glowPath.setAttribute('stroke-width', '10');
        svgEl.appendChild(glowPath);

        const corePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        corePath.setAttribute('d', d);
        corePath.setAttribute('fill', 'none');
        corePath.setAttribute('stroke', 'var(--accent-cyan)');
        corePath.setAttribute('stroke-width', '3.5');
        svgEl.appendChild(corePath);
      } else if (isActiveLine) {
        const activePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        activePath.setAttribute('d', d);
        activePath.setAttribute('fill', 'none');
        activePath.setAttribute('stroke', 'var(--accent-gold)');
        activePath.setAttribute('stroke-width', '3.5');
        svgEl.appendChild(activePath);
      } else {
        const lockedPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        lockedPath.setAttribute('d', d);
        lockedPath.setAttribute('fill', 'none');
        lockedPath.setAttribute('stroke', 'var(--border-subtle)');
        lockedPath.setAttribute('stroke-width', '3');
        lockedPath.setAttribute('stroke-dasharray', '6 6');
        svgEl.appendChild(lockedPath);
      }
    }

    if (autoScrollToCurrent) {
      setTimeout(() => {
        const currentEl = document.getElementById(`map-node-${currentLevel}`);
        if (currentEl) {
          currentEl.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      }, 50);
    }
  },

  animateMapLevelUnlock(newLevel: number) {
    if (typeof document === 'undefined') return;
    const nodeEl = document.querySelector(`[data-map-level="${newLevel}"]`) || document.getElementById(`map-node-${newLevel}`);
    if (!nodeEl) return;

    nodeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const btn = nodeEl.querySelector('button') || nodeEl;
    if (btn) {
      btn.classList.add('ring-4', 'ring-emerald-400/80', 'scale-110', 'transition-transform', 'duration-500');
      setTimeout(() => {
        btn.classList.remove('ring-4', 'ring-emerald-400/80', 'scale-110', 'transition-transform', 'duration-500');
      }, 1100);
    }
  },

  animateStampDropAndFly(stampIdx: number, seasonNameKey: string, onComplete?: () => void): void {
    if (typeof document === 'undefined') {
      if (onComplete) onComplete();
      return;
    }

    const container = document.getElementById('container') || document.body;
    const tile = document.createElement('div');
    tile.id = 'victory-stamp-flyer';
    tile.className = 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 border-4 border-amber-200 text-slate-950 font-black shadow-[0_0_40px_rgba(245,158,11,0.7)] flex flex-col items-center justify-center z-50 pointer-events-none transition-all duration-700 transform scale-50 opacity-0';
    const isEn = getLang() === 'en';
    const pulLabel = isEn ? 'Stamp' : 'Pul';
    tile.innerHTML = `
      <span class="text-3xl mb-1 drop-shadow animate-bounce">📮</span>
      <span class="text-xs font-mono font-black uppercase tracking-wider">#${stampIdx + 1} ${pulLabel}</span>
      <span class="text-[8.5px] opacity-90 font-bold">${t(seasonNameKey).slice(0, 10)}</span>
    `;

    container.appendChild(tile);

    setTimeout(() => {
      tile.classList.remove('scale-50', 'opacity-0');
      tile.classList.add('scale-110', 'opacity-100');
    }, 20);

    setTimeout(() => {
      tile.style.transform = 'translate3d(140px, -280px, 0) scale(0.25)';
      tile.style.opacity = '0';
    }, 600);

    setTimeout(() => {
      tile.remove();
      if (onComplete) onComplete();
    }, 1200);
  }
};
