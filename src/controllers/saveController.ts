import { SavedGameRecord, UIManager } from '../ui';
import { validateSavedGameRecord } from '../engine/saveValidator';
import { SudokuVariant, SudokuGen, KillerCage } from '../engine/sudoku';
import { UserManager } from '../store/userState';
import { Rewards } from '../engine/rewards';
import { t } from '../i18n/translations';
import { AbilityId } from '../engine/abilities';
import { getCurrentSeason, SeasonalEventManager } from '../engine/seasonalEvents';
import { getRelicDef } from '../engine/relics';
import { getLeagueByRating } from '../engine/leagueSystem';
import { getLevelModifierProfile } from '../engine/levelModifiers';
import { ClanManager } from '../engine/clanSystem';
import { renderMiniStampsGridHTML } from '../ui/components/menu/LiveOpsPromoCard';


export interface ActiveGameSnapshot {
  isMatchMode: boolean;
  isCustomGameMode: boolean;
  variant: SudokuVariant;
  level: number;
  diff: 'basit' | 'orta' | 'zor';
  timeElapsed: number;
  userBoard: number[][];
  initialBoard: number[][];
  currentSolution: number[][];
  errors: number;
  notesBoard?: Set<number>[][];
  regionMap?: number[][];
  cages?: KillerCage[];
  samuraiBoards?: { userBoard: number[][]; initialBoard: number[][]; solution: number[][]; notesBoard: Set<number>[][] }[];
  activeSamuraiIndex?: number;
  matchData?: any;
  enemyName?: string;
  equippedAbilities?: AbilityId[];
  mechanicsSnapshot?: {
    oracleChargesLeft: number;
    shieldChargesLeft: number;
    sealBreakerChargesLeft: number;
    consumedAbilities: AbilityId[];
    firstMoveMade: boolean;
    crackedCrystals: { r: number; c: number }[];
    freeHintsGranted: number;
    errorShieldsGranted: number;
  };
}

export function hasPlayerMadeAnyMove(snapshotOrRecord: any): boolean {
  if (!snapshotOrRecord || typeof snapshotOrRecord !== 'object') return false;
  if (typeof snapshotOrRecord.errors === 'number' && snapshotOrRecord.errors > 0) return true;

  if (snapshotOrRecord.variant === 'samurai' && Array.isArray(snapshotOrRecord.samuraiBoards)) {
    for (let i = 0; i < snapshotOrRecord.samuraiBoards.length; i++) {
      const b = snapshotOrRecord.samuraiBoards[i];
      if (!b || !Array.isArray(b.userBoard) || !Array.isArray(b.initialBoard)) continue;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (b.userBoard[r][c] !== b.initialBoard[r][c]) return true;
          if (Array.isArray(b.notesBoard) && b.notesBoard[r] && b.notesBoard[r][c]) {
            const n = b.notesBoard[r][c];
            if (Array.isArray(n) && n.length > 0) return true;
            if (n && typeof n.size === 'number' && n.size > 0) return true;
            if (n && typeof n.values === 'function' && Array.from(n).length > 0) return true;
          }
        }
      }
    }
    return false;
  }

  if (Array.isArray(snapshotOrRecord.userBoard) && snapshotOrRecord.userBoard.length === 9 && Array.isArray(snapshotOrRecord.initialBoard) && snapshotOrRecord.initialBoard.length === 9) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (snapshotOrRecord.userBoard[r][c] !== snapshotOrRecord.initialBoard[r][c]) return true;
        if (Array.isArray(snapshotOrRecord.notesBoard) && snapshotOrRecord.notesBoard[r] && snapshotOrRecord.notesBoard[r][c]) {
          const n = snapshotOrRecord.notesBoard[r][c];
          if (Array.isArray(n) && n.length > 0) return true;
          if (n && typeof n.size === 'number' && n.size > 0) return true;
          if (n && typeof n.values === 'function' && Array.from(n).length > 0) return true;
        }
      }
    }
  }

  return false;
}

export function isWorthKeepingSave(rec: any): boolean {
  return hasPlayerMadeAnyMove(rec) || (typeof rec?.timeElapsed === 'number' && rec.timeElapsed >= 5) || Boolean(rec?.isPlacementSeed);
}

export function getSavedGamesList(): SavedGameRecord[] {
  let customList: SavedGameRecord[] = [];

  try {
    const raw = localStorage.getItem('sudoku_saved_games_list');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        customList = parsed.filter(item => item && item.isCustomMode && !item.isMatchMode && validateSavedGameRecord(item) && isWorthKeepingSave(item));
        localStorage.setItem('sudoku_saved_games_list', JSON.stringify(customList));
      }
    }
  } catch {
    // ignore
  }

  let duelList: SavedGameRecord[] = [];
  try {
    const raw = localStorage.getItem('sudoku_saved_duels_list');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        duelList = parsed.filter(item => item && item.isMatchMode && validateSavedGameRecord(item));
        localStorage.setItem('sudoku_saved_duels_list', JSON.stringify(duelList));
      }
    }
  } catch {
    // ignore
  }

  try {
    const legacyRaw = localStorage.getItem('sudoku_saved_game');
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      if (parsed && validateSavedGameRecord(parsed) && isWorthKeepingSave(parsed)) {
        const variant: SudokuVariant = parsed.variant || 'classic';
        const gameId = `saved_${variant}_${parsed.level || 1}`;
        const record: SavedGameRecord = {
          id: gameId,
          variant,
          level: parsed.level || 1,
          diff: parsed.diff || 'basit',
          timeElapsed: typeof parsed.timeElapsed === 'number' ? parsed.timeElapsed : 0,
          userBoard: parsed.userBoard,
          initialBoard: parsed.initialBoard,
          currentSolution: parsed.currentSolution,
          errors: typeof parsed.errors === 'number' ? parsed.errors : 0,
          notesBoard: parsed.notesBoard || [],
          isCustomMode: true,
          updatedAtMs: Date.now()
        };
        customList.unshift(record);
        localStorage.setItem('sudoku_saved_games_list', JSON.stringify(customList));
      }
      localStorage.removeItem('sudoku_saved_game');
    }
  } catch {
    localStorage.removeItem('sudoku_saved_game');
  }

  const mapByVariant = new Map<SudokuVariant, SavedGameRecord>();
  const mapKeysToDelete: string[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sudoku_map_save_')) {
        const rawMap = localStorage.getItem(key);
        if (rawMap) {
          try {
            const p = JSON.parse(rawMap);
            if (validateSavedGameRecord(p)) {
              const variant: SudokuVariant = p.variant || 'classic';
              const level = p.level || 1;
              const diff = p.diff || SudokuGen.getDifficulty(level);

              // Auto-reconcile BEFORE filtering by isWorthKeepingSave
              if (level > UserManager.getVariantLevel(variant)) {
                UserManager.updateVariantLevel(variant, level, 0);
              }

              if (isWorthKeepingSave(p)) {
                const rec: SavedGameRecord = {
                  id: `saved_map_${variant}_${level}`,
                  variant,
                  level,
                  diff,
                  timeElapsed: p.timeElapsed || 0,
                  userBoard: p.userBoard,
                  initialBoard: p.initialBoard,
                  currentSolution: p.currentSolution,
                  errors: p.errors || 0,
                  notesBoard: p.notesBoard || [],
                  regionMap: p.regionMap,
                  cages: p.cages,
                  samuraiBoards: p.samuraiBoards,
                  activeSamuraiIndex: p.activeSamuraiIndex,
                  equippedAbilities: p.equippedAbilities,
                  mechanicsSnapshot: p.mechanicsSnapshot,
                  isCustomMode: false,
                  updatedAtMs: p.updatedAtMs || Date.now()
                };

                const existing = mapByVariant.get(variant);
                if (!existing) {
                  mapByVariant.set(variant, rec);
                } else {
                  let keepRec = rec;
                  let dropRec = existing;
                  if (existing.level > rec.level || (existing.level === rec.level && existing.updatedAtMs >= rec.updatedAtMs)) {
                    keepRec = existing;
                    dropRec = rec;
                  }
                  mapByVariant.set(variant, keepRec);
                  mapKeysToDelete.push(`sudoku_map_save_${dropRec.variant}_${dropRec.level}`);
                }
              } else {
                mapKeysToDelete.push(key);
              }
            } else {
              mapKeysToDelete.push(key);
            }
          } catch {
            mapKeysToDelete.push(key);
          }
        }
      }
    }
    mapKeysToDelete.forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });
  } catch {
    // ignore
  }

  const mapList = Array.from(mapByVariant.values());

  return [...mapList, ...customList, ...duelList];
}

export function reconcileLevelsWithSavedGames(): void {
  try {
    const list = getSavedGamesList().filter(r => !r.isCustomMode && !r.isMatchMode);
    list.forEach(r => {
      const currentLevel = UserManager.getVariantLevel(r.variant);
      if (r.level > currentLevel) {
        UserManager.updateVariantLevel(r.variant, r.level, 0);
      }
    });
  } catch {
    // ignore
  }
}

export function updateSavedGamesCountUI(): void {
  if (typeof document === 'undefined') return;
  const classicLvl = UserManager.getVariantLevel('classic');
  const savedList = getSavedGamesList();
  const totalCount = savedList.length;

  const savedGamesBtn = document.getElementById('btn-open-saved-games');
  const countLabel = document.getElementById('saved-games-count-label');
  const quickTitle = document.getElementById('quick-play-title');
  const quickSub = document.getElementById('quick-play-subtitle');
  const pillText = document.getElementById('menu-progress-pill-text');
  const btnDaily = document.getElementById('btn-daily-reward');
  const dailyDot = document.getElementById('daily-reward-dot');

  const streakCount = UserManager.updateDailyStreak();
  const streakEl = document.getElementById('menu-streak-count');
  const streakCapsule = document.getElementById('menu-streak-capsule');
  if (streakEl) streakEl.innerText = streakCount.toString();
  if (streakCapsule) {
    if (UserManager.isStreakBroken()) {
      streakCapsule.className = "bg-[var(--bg-elevated)] text-rose-400 font-mono font-black px-1.5 py-1 sm:px-2 rounded-xl text-xs border border-rose-500/60 shadow-sm flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-transform animate-pulse";
    } else {
      streakCapsule.className = "bg-[var(--bg-elevated)] text-amber-400 font-mono font-black px-1.5 py-1 sm:px-2 rounded-xl text-xs border border-amber-500/40 shadow-sm flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-transform";
    }
  }

  const crystalCountEl = document.getElementById('menu-crystal-count');
  if (crystalCountEl) {
    crystalCountEl.innerText = UserManager.getCrystals().toString();
  }

  const relicTrinket = document.getElementById('menu-relic-trinket');
  if (relicTrinket) {
    const eq = UserManager.getEquippedRelic();
    if (eq) {
      const def = getRelicDef(eq);
      relicTrinket.innerText = def.icon;
      relicTrinket.title = t(def.nameKey);
    } else {
      relicTrinket.innerText = '💍';
      relicTrinket.title = t('relic_trinket_title');
    }
  }

  const leagueBadge = document.getElementById('menu-league-badge');
  if (leagueBadge) {
    const league = getLeagueByRating(1200);
    leagueBadge.innerText = league.icon;
    leagueBadge.title = t('league_modal_title');
  }

  const energyBadge = document.getElementById('hero-energy-badge');
  if (energyBadge) {
    const modProfile = getLevelModifierProfile(classicLvl, 'classic');
    energyBadge.innerHTML = `${modProfile.icon} <span>${t('energy_name_' + modProfile.energyId)}</span>`;
  }

  const progressBar = document.getElementById('quick-play-progress-bar');
  if (progressBar) {
    const regionLvl = (classicLvl - 1) % 50 + 1;
    const pct = Math.min(100, Math.max(5, Math.round((regionLvl / 50) * 100)));
    progressBar.style.width = `${pct}%`;
  }

  if (pillText) {
    pillText.innerText = `${t('label_level')} ${classicLvl} • ${t('var_classic')}`;
  }

  const currentSeason = getCurrentSeason();
  const stamps = SeasonalEventManager.getCollectedStamps(currentSeason.id);
  const seasonPillText = document.getElementById('menu-season-pill-text');
  const seasonStampsCount = document.getElementById('menu-season-stamps-count');
  const seasonStampsGrid = document.getElementById('menu-season-stamps-grid');
  if (seasonPillText) seasonPillText.innerText = t(currentSeason.nameKey);
  if (seasonStampsCount) seasonStampsCount.innerText = t('season_stamps_progress', { current: stamps.length });
  if (seasonStampsGrid) seasonStampsGrid.innerHTML = renderMiniStampsGridHTML(currentSeason.id);

  const clanPillText = document.getElementById('menu-clan-pill-text');
  const clanDustCount = document.getElementById('menu-clan-dust-count');
  const clan = ClanManager.getUserClan() || ClanManager.getPublicClans()[0];
  if (clanPillText) clanPillText.innerText = t('menu_clan_title');
  if (clanDustCount) clanDustCount.innerText = clan ? `${clan.runeDustBank}/${clan.runeDustGoal}` : '350/500';

  if (btnDaily && dailyDot) {
    if (Rewards.isClaimedToday()) {
      btnDaily.className = "relative bg-[var(--bg-elevated)] text-[var(--text-secondary)] opacity-60 p-2 rounded-xl active:scale-95 transition-all border border-[var(--border-subtle)] flex items-center justify-center text-sm";
      dailyDot.classList.add('hidden');
    } else {
      btnDaily.className = "relative bg-[var(--bg-elevated)] text-[var(--accent-gold)] p-2 rounded-xl active:scale-95 transition-all border border-[var(--border-strong)] flex items-center justify-center text-sm shadow-sm";
      dailyDot.classList.remove('hidden');
    }
  }

  const journeyLabel = document.getElementById('menu-journey-btn-label');

  if (totalCount === 0) {
    if (savedGamesBtn) {
      savedGamesBtn.classList.add('hidden');
      savedGamesBtn.classList.remove('flex');
    }
    if (quickTitle) quickTitle.innerText = t('menu_quick_play');
    if (quickSub) quickSub.innerText = `${t('label_level')} ${classicLvl} • ${t('var_classic')}`;
    if (journeyLabel) {
      const isBrandNew = classicLvl === 1;
      const key = isBrandNew ? 'menu_journey_start' : 'menu_journey_continue';
      journeyLabel.innerText = t(key);
      if (typeof journeyLabel.setAttribute === 'function') {
        journeyLabel.setAttribute('data-i18n', key);
      }
    }
  } else {
    if (savedGamesBtn) {
      savedGamesBtn.classList.remove('hidden');
      savedGamesBtn.classList.add('flex');
    }
    if (countLabel) countLabel.innerText = t('menu_active_games_list_label', { count: totalCount });
    if (journeyLabel) {
      journeyLabel.innerText = t('menu_journey_continue');
      if (typeof journeyLabel.setAttribute === 'function') {
        journeyLabel.setAttribute('data-i18n', 'menu_journey_continue');
      }
    }

    const sorted = [...savedList].sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
    const latest = sorted[0];

    if (quickTitle) quickTitle.innerText = t('menu_quick_continue');
    if (quickSub && latest) {
      const formatTime = (sec?: number) => {
        if (typeof sec !== 'number' || sec <= 0) return '00:00';
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
      };
      const varName = t('var_' + (latest.variant || 'classic'));
      quickSub.innerText = `${t('label_level')} ${latest.level} • ${varName} • ${formatTime(latest.timeElapsed)}`;
    }
  }
}

export function clearVariantJourneySaves(variant: SudokuVariant, maxLevelToClear?: number): void {
  try {
    const prefix = `sudoku_map_save_${variant}_`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        if (typeof maxLevelToClear === 'number') {
          const levelNum = parseInt(key.substring(prefix.length));
          if (!isNaN(levelNum) && levelNum <= maxLevelToClear) {
            keysToRemove.push(key);
          }
        } else {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
  updateSavedGamesCountUI();
}

export function clearDuelSavedGame(matchId: string): void {
  try {
    const raw = localStorage.getItem('sudoku_saved_duels_list');
    if (raw) {
      let list: SavedGameRecord[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        list = list.filter(item => item && item.id !== `saved_duel_${matchId}` && item.matchData?.matchId !== matchId);
        localStorage.setItem('sudoku_saved_duels_list', JSON.stringify(list));
      }
    }
  } catch {
    // ignore
  }
  updateSavedGamesCountUI();
}

export function saveActiveGameRecord(snapshot: ActiveGameSnapshot): void {
  if (!snapshot.isMatchMode && !isWorthKeepingSave(snapshot)) {
    return;
  }

  if (snapshot.isMatchMode && snapshot.matchData && snapshot.matchData.durationSec === 0) {
    try {
      const raw = localStorage.getItem('sudoku_saved_duels_list');
      let list: SavedGameRecord[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      list = list.filter(item => validateSavedGameRecord(item));

      const safeNotes = snapshot.notesBoard ? snapshot.notesBoard.map(row => (
        row ? row.map(s => (s && typeof s.values === 'function' ? Array.from(s) : Array.isArray(s) ? s : [])) : []
      )) : [];

      const safeSamuraiBoards = snapshot.variant === 'samurai' && snapshot.samuraiBoards && snapshot.samuraiBoards.length === 5 ? snapshot.samuraiBoards.map(b => ({
        userBoard: b.userBoard,
        initialBoard: b.initialBoard,
        solution: b.solution,
        notesBoard: b.notesBoard.map(row => row.map(s => (s && typeof s.values === 'function' ? Array.from(s) : Array.isArray(s) ? s : [])))
      })) : undefined;

      const gameId = `saved_duel_${snapshot.matchData.matchId || Date.now()}`;
      const record: SavedGameRecord = {
        id: gameId,
        variant: snapshot.variant,
        level: snapshot.level,
        diff: snapshot.diff,
        timeElapsed: snapshot.timeElapsed,
        userBoard: snapshot.userBoard,
        initialBoard: snapshot.initialBoard,
        currentSolution: snapshot.currentSolution,
        errors: snapshot.errors,
        notesBoard: safeNotes,
        regionMap: snapshot.regionMap,
        cages: snapshot.cages,
        samuraiBoards: safeSamuraiBoards as any,
        activeSamuraiIndex: snapshot.variant === 'samurai' ? snapshot.activeSamuraiIndex : undefined,
        isMatchMode: true,
        matchData: snapshot.matchData,
        enemyName: snapshot.enemyName || snapshot.matchData?.player2?.username || 'Rakip',
        updatedAtMs: Date.now(),
        mechanicsSnapshot: snapshot.mechanicsSnapshot
      };

      const idx = list.findIndex(item => item.id === gameId);
      if (idx >= 0) list[idx] = record;
      else list.unshift(record);

      localStorage.setItem('sudoku_saved_duels_list', JSON.stringify(list));
      updateSavedGamesCountUI();
    } catch (e) {
      console.error("Düello kaydı saklanamadı:", e);
    }
    return;
  }

  if (snapshot.isMatchMode || !snapshot.userBoard || !snapshot.initialBoard) return;
  try {
    const safeNotes = snapshot.notesBoard ? snapshot.notesBoard.map(row => (
      row ? row.map(s => (s && typeof s.values === 'function' ? Array.from(s) : Array.isArray(s) ? s : [])) : []
    )) : [];

    const safeSamuraiBoards = snapshot.variant === 'samurai' && snapshot.samuraiBoards && snapshot.samuraiBoards.length === 5 ? snapshot.samuraiBoards.map(b => ({
      userBoard: b.userBoard,
      initialBoard: b.initialBoard,
      solution: b.solution,
      notesBoard: b.notesBoard.map(row => row.map(s => (s && typeof s.values === 'function' ? Array.from(s) : Array.isArray(s) ? s : [])))
    })) : undefined;

    if (!snapshot.isCustomGameMode) {
      // Single Map slot per variant: clear other map saves for this variant
      try {
        const prefix = `sudoku_map_save_${snapshot.variant}_`;
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix) && key !== `sudoku_map_save_${snapshot.variant}_${snapshot.level}`) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch {
        // ignore
      }

      localStorage.setItem(`sudoku_map_save_${snapshot.variant}_${snapshot.level}`, JSON.stringify({
        variant: snapshot.variant,
        level: snapshot.level,
        diff: snapshot.diff,
        timeElapsed: snapshot.timeElapsed,
        userBoard: snapshot.userBoard,
        initialBoard: snapshot.initialBoard,
        currentSolution: snapshot.currentSolution,
        errors: snapshot.errors,
        notesBoard: safeNotes,
        regionMap: snapshot.regionMap,
        cages: snapshot.cages,
        samuraiBoards: safeSamuraiBoards,
        activeSamuraiIndex: snapshot.variant === 'samurai' ? snapshot.activeSamuraiIndex : undefined,
        equippedAbilities: snapshot.equippedAbilities,
        mechanicsSnapshot: snapshot.mechanicsSnapshot,
        updatedAtMs: Date.now()
      }));
    } else {
      const list = getSavedGamesList().filter(item => item.isCustomMode && !item.isMatchMode);
      const gameId = `saved_custom_${snapshot.variant}_${snapshot.level}`;
      const record: SavedGameRecord = {
        id: gameId,
        variant: snapshot.variant,
        level: snapshot.level,
        diff: snapshot.diff,
        timeElapsed: snapshot.timeElapsed,
        userBoard: snapshot.userBoard,
        initialBoard: snapshot.initialBoard,
        currentSolution: snapshot.currentSolution,
        errors: snapshot.errors,
        notesBoard: safeNotes,
        regionMap: snapshot.regionMap,
        cages: snapshot.cages,
        samuraiBoards: safeSamuraiBoards,
        activeSamuraiIndex: snapshot.variant === 'samurai' ? snapshot.activeSamuraiIndex : undefined,
        equippedAbilities: snapshot.equippedAbilities,
        mechanicsSnapshot: snapshot.mechanicsSnapshot,
        isCustomMode: true,
        updatedAtMs: Date.now()
      };

      const idx = list.findIndex(item => item.id === gameId);
      if (idx >= 0) {
        list[idx] = record;
      } else {
        list.unshift(record);
      }

      localStorage.setItem('sudoku_saved_games_list', JSON.stringify(list));
    }

    updateSavedGamesCountUI();
  } catch (e) {
    console.error("Aktif oyun kaydı saklanamadı:", e);
  }
}

export function createPlacementActiveGameSave(variant: SudokuVariant, level: number): void {
  try {
    const key = `sudoku_map_save_${variant}_${level}`;
    if (localStorage.getItem(key)) {
      updateSavedGamesCountUI();
      return;
    }

    const diff = SudokuGen.getDifficulty(level);
    const generated = SudokuGen.generateVariant(diff, variant);

    const safeSamuraiBoards = variant === 'samurai' && generated.samuraiGrids ? generated.samuraiGrids.map((g: any) => ({
      userBoard: g.puzzle.map((row: number[]) => [...row]),
      initialBoard: g.puzzle,
      solution: g.solution,
      notesBoard: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []))
    })) : undefined;

    const saveObject = {
      variant,
      level,
      diff,
      timeElapsed: 0,
      isPlacementSeed: true,
      userBoard: generated.puzzle.map((row: number[]) => [...row]),
      initialBoard: generated.puzzle,
      currentSolution: generated.solution,
      errors: 0,
      notesBoard: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
      regionMap: generated.regionMap,
      cages: generated.cages,
      samuraiBoards: safeSamuraiBoards,
      updatedAtMs: Date.now()
    };

    localStorage.setItem(key, JSON.stringify(saveObject));
    updateSavedGamesCountUI();
  } catch (e) {
    console.error("Sınav sonrası aktif oyun kaydı oluşturulamadı:", e);
  }
}

export function deleteSavedGameRecord(gameId: string): void {
  try {
    if (gameId.startsWith('saved_map_')) {
      const parts = gameId.split('_'); // ['saved', 'map', variant, level]
      if (parts.length >= 4) {
        const variant = parts[2] as SudokuVariant;
        const level = parseInt(parts[3]);
        if (!isNaN(level)) {
          localStorage.removeItem(`sudoku_map_save_${variant}_${level}`);
        }
      }
    }

    let customList = getSavedGamesList().filter(i => i.isCustomMode && !i.isMatchMode);
    customList = customList.filter(item => item.id !== gameId);
    localStorage.setItem('sudoku_saved_games_list', JSON.stringify(customList));

    let duelList = getSavedGamesList().filter(i => i.isMatchMode);
    duelList = duelList.filter(item => item.id !== gameId);
    localStorage.setItem('sudoku_saved_duels_list', JSON.stringify(duelList));
  } catch {
    // ignore
  }

  updateSavedGamesCountUI();
}

export function clearSavedGame(variant: SudokuVariant, level: number, matchId?: string): void {
  localStorage.removeItem(`sudoku_map_save_${variant}_${level}`);
  deleteSavedGameRecord(`saved_custom_${variant}_${level}`);
  if (matchId) {
    clearDuelSavedGame(matchId);
  }
  updateSavedGamesCountUI();
}

let activeSavedTab: 'journey' | 'custom' | 'duel' = 'journey';

export function openSavedGamesModal(onPlaySavedGame: (record: SavedGameRecord) => void): void {
  UIManager.toggleModal('view-saved-games', true);

  const renderCurrentTab = (autoSelectIfEmpty: boolean = false) => {
    const allRecords = getSavedGamesList();
    const journeyCount = allRecords.filter(r => !r.isCustomMode && !r.isMatchMode).length;
    const customCount = allRecords.filter(r => !!r.isCustomMode && !r.isMatchMode).length;
    const duelCount = allRecords.filter(r => !!r.isMatchMode).length;

    let activeCount = activeSavedTab === 'journey' ? journeyCount : (activeSavedTab === 'custom' ? customCount : duelCount);

    if (autoSelectIfEmpty && activeCount === 0) {
      if (journeyCount > 0) activeSavedTab = 'journey';
      else if (customCount > 0) activeSavedTab = 'custom';
      else if (duelCount > 0) activeSavedTab = 'duel';
    }

    let filtered: SavedGameRecord[] = [];
    let emptyMsg = t('no_active_games');

    if (activeSavedTab === 'journey') {
      filtered = allRecords.filter(r => !r.isCustomMode && !r.isMatchMode);
      emptyMsg = t('no_active_games');
    } else if (activeSavedTab === 'custom') {
      filtered = allRecords.filter(r => !!r.isCustomMode && !r.isMatchMode);
      emptyMsg = t('no_custom_games');
    } else if (activeSavedTab === 'duel') {
      filtered = allRecords.filter(r => !!r.isMatchMode);
      emptyMsg = t('no_duel_games');
    }

    const updateTabBtns = () => {
      const tabLabels: Record<string, string> = {
        journey: `${t('saved_tab_journey')} (${journeyCount})`,
        custom: `${t('saved_tab_custom')} (${customCount})`,
        duel: `${t('saved_tab_duel')} (${duelCount})`
      };

      ['journey', 'custom', 'duel'].forEach(tab => {
        const btn = document.getElementById(`tab-saved-${tab}`);
        if (btn) {
          btn.innerText = tabLabels[tab];
          if (tab === activeSavedTab) {
            btn.className = "saved-tab-btn py-1.5 rounded-xl font-black text-[11px] bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm transition-all";
          } else {
            btn.className = "saved-tab-btn py-1.5 rounded-xl font-bold text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent transition-all";
          }
        }
      });
    };
    updateTabBtns();

    UIManager.renderSavedGamesList(
      filtered,
      (record) => {
        UIManager.toggleModal('view-saved-games', false);
        onPlaySavedGame(record);
      },
      (record) => {
        deleteSavedGameRecord(record.id);
        renderCurrentTab(true);
        UIManager.showToast(t('toast_save_deleted'), "info");
      },
      emptyMsg
    );
  };

  ['journey', 'custom', 'duel'].forEach(tab => {
    const btn = document.getElementById(`tab-saved-${tab}`);
    if (btn) {
      btn.onclick = () => {
        activeSavedTab = tab as any;
        renderCurrentTab(false);
      };
    }
  });

  renderCurrentTab(true);
}

export function initSaveController(callbacks: { onPlaySavedGame: (record: SavedGameRecord) => void }): void {
  document.getElementById('btn-open-saved-games')?.addEventListener('click', () => {
  document.getElementById('btn-close-drawer')?.click();
  setTimeout(() => UIManager.toggleModal('view-saved-games', true), 200);
    openSavedGamesModal(callbacks.onPlaySavedGame);
  });

  document.getElementById('close-saved-games')?.addEventListener('click', () => {
    UIManager.toggleModal('view-saved-games', false);
  });
}
