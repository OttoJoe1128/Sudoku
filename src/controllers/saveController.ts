import { SavedGameRecord, UIManager } from '../ui/uiManager';
import { validateSavedGameRecord } from '../engine/saveValidator';
import { SudokuVariant, SudokuGen, KillerCage } from '../engine/sudoku';
import { UserManager } from '../store/userState';
import { t } from '../i18n/translations';

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
}

export function getSavedGamesList(): SavedGameRecord[] {
  let customList: SavedGameRecord[] = [];

  try {
    const raw = localStorage.getItem('sudoku_saved_games_list');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        customList = parsed.filter(item => item && item.isCustomMode && !item.isMatchMode && validateSavedGameRecord(item));
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
      if (parsed && validateSavedGameRecord(parsed)) {
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

export function updateSavedGamesCountUI(): void {
  if (typeof document === 'undefined') return;
  const classicLvl = UserManager.getVariantLevel('classic');
  const totalCount = getSavedGamesList().length;
  const countLabel = document.getElementById('saved-games-count-label');
  if (countLabel) {
    countLabel.innerText = t('menu_active_games_count', { level: classicLvl, count: totalCount });
  }
}

export function clearVariantJourneySaves(variant: SudokuVariant): void {
  try {
    const prefix = `sudoku_map_save_${variant}_`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
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
        updatedAtMs: Date.now()
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

export function deleteSavedGameRecord(gameId: string): void {
  try {
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

  const renderCurrentTab = () => {
    const allRecords = getSavedGamesList();
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
      ['journey', 'custom', 'duel'].forEach(tab => {
        const btn = document.getElementById(`tab-saved-${tab}`);
        if (btn) {
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
        renderCurrentTab();
        UIManager.showToast("🗑️ Kayıtlı oyun silindi.", "info");
      },
      emptyMsg
    );
  };

  ['journey', 'custom', 'duel'].forEach(tab => {
    const btn = document.getElementById(`tab-saved-${tab}`);
    if (btn) {
      btn.onclick = () => {
        activeSavedTab = tab as any;
        renderCurrentTab();
      };
    }
  });

  renderCurrentTab();
}

export function initSaveController(callbacks: { onPlaySavedGame: (record: SavedGameRecord) => void }): void {
  document.getElementById('btn-open-saved-games')?.addEventListener('click', () => {
    openSavedGamesModal(callbacks.onPlaySavedGame);
  });

  document.getElementById('close-saved-games')?.addEventListener('click', () => {
    UIManager.toggleModal('view-saved-games', false);
  });
}
