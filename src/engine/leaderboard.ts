import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase';
import { UserManager } from '../store/userState';
import { SudokuVariant } from './sudoku';
import { formatDisplayName } from '../utils/sanitize';

export interface Player {
  uid?: string;
  username: string;
  gold: number;
  level: number;
  avatar?: string;
  title?: string;
  isSimulated?: boolean;
  total_errors?: number;
  total_completed?: number;
  duel_wins?: number;
  duel_losses?: number;
  duel_mmr?: number;
  bot_mmr?: number;
  onlineStatus?: 'available' | 'in_game' | 'in_duel';
  lastSeenMs?: number;
  best_basit?: number;
  best_orta?: number;
  best_zor?: number;
  dominantVariant?: SudokuVariant;
  variantScores?: Record<SudokuVariant, number>;
}

export interface SpeedRecord {
  id?: string;
  uid?: string;
  username: string;
  level: number;
  difficulty: 'basit' | 'orta' | 'zor';
  timeElapsed: number;
  timeFormatted: string;
  errors: number;
  hintsUsed?: number;
  monthYear?: string;
}



export const Leaderboard = {
  getCachedPlayers(sortBy: 'level' | 'gold' | 'pvp_mmr' | 'bot_mmr' = 'level'): Player[] {
    try {
      const saved = localStorage.getItem('sudoku_cached_leaderboard');
      if (saved) {
        let parsed: Player[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed = parsed.filter(p => p && !p.isSimulated);
          if (parsed.length > 0) {
            if (sortBy === 'level') {
              parsed.sort((a, b) => b.level !== a.level ? b.level - a.level : b.gold - a.gold);
            } else if (sortBy === 'gold') {
              parsed.sort((a, b) => b.gold !== a.gold ? b.gold - a.gold : b.level - a.level);
            } else if (sortBy === 'pvp_mmr') {
              parsed.sort((a, b) => (b.duel_mmr || 1000) !== (a.duel_mmr || 1000) ? (b.duel_mmr || 1000) - (a.duel_mmr || 1000) : b.level - a.level);
            } else if (sortBy === 'bot_mmr') {
              parsed.sort((a, b) => (b.bot_mmr || 1000) !== (a.bot_mmr || 1000) ? (b.bot_mmr || 1000) - (a.bot_mmr || 1000) : b.level - a.level);
            }
            return parsed;
          }
        }
      }
    } catch {
      // ignore
    }
    return [];
  },

  getCachedFastestRecords(diffFilter: 'all' | 'basit' | 'orta' | 'zor' = 'all'): SpeedRecord[] {
    try {
      const saved = localStorage.getItem('sudoku_cached_fastest_records');
      if (saved) {
        let parsed: SpeedRecord[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (diffFilter !== 'all') {
            parsed = parsed.filter(r => r.difficulty === diffFilter);
          }
          parsed.sort((a, b) => a.timeElapsed - b.timeElapsed);
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    const cachedPlayers = this.getCachedPlayers('level');
    const fallbackList: SpeedRecord[] = [];
    cachedPlayers.forEach(p => {
      const formatTime = (sec?: number) => {
        if (typeof sec !== 'number' || sec <= 0) return '--:--';
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
      };

      const safeName = formatDisplayName(p.username, p.uid);

      if (typeof p.best_basit === 'number' && p.best_basit > 0) {
        fallbackList.push({ uid: p.uid, username: safeName, level: p.level, difficulty: 'basit', timeElapsed: p.best_basit, timeFormatted: formatTime(p.best_basit), errors: 0 });
      }
      if (typeof p.best_orta === 'number' && p.best_orta > 0) {
        fallbackList.push({ uid: p.uid, username: safeName, level: p.level, difficulty: 'orta', timeElapsed: p.best_orta, timeFormatted: formatTime(p.best_orta), errors: 0 });
      }
      if (typeof p.best_zor === 'number' && p.best_zor > 0) {
        fallbackList.push({ uid: p.uid, username: safeName, level: p.level, difficulty: 'zor', timeElapsed: p.best_zor, timeFormatted: formatTime(p.best_zor), errors: 0 });
      }
    });

    let filtered = fallbackList;
    if (diffFilter !== 'all') {
      filtered = filtered.filter(r => r.difficulty === diffFilter);
    }
    filtered.sort((a, b) => a.timeElapsed - b.timeElapsed);
    return filtered;
  },

  async fetchTopPlayers(sortBy: 'level' | 'gold' | 'pvp_mmr' | 'bot_mmr' = 'level'): Promise<Player[]> {
    try {
      const fetchPromise = (async () => {
        const colRef = collection(db, 'leaderboard');
        const snapshot = await getDocs(colRef);
        const list: Player[] = [];

        if (!snapshot.empty) {
          snapshot.docs.forEach((docSnap) => {
            const d = docSnap.data();
            const uid = d.uid || docSnap.id;
            const level = typeof d.level === 'number' ? d.level : parseInt(d.level) || 1;
            const duelWins = typeof d.duel_wins === 'number' ? d.duel_wins : 0;
            const duelMmr = typeof d.duel_mmr === 'number' ? d.duel_mmr : 1000;
            const totalCompleted = typeof d.total_completed === 'number' ? d.total_completed : 0;
            const calcTitle = UserManager.calculatePlayerTitle(level, duelWins, duelMmr, totalCompleted);
            const safeUsername = formatDisplayName(d.username, uid);

            list.push({
              uid,
              username: safeUsername,
              gold: typeof d.gold === 'number' ? d.gold : parseInt(d.gold) || 0,
              level,
              avatar: d.avatar || '🎮',
              title: calcTitle,
              total_errors: d.total_errors,
              total_completed: totalCompleted,
              duel_wins: duelWins,
              duel_losses: d.duel_losses,
              duel_mmr: duelMmr,
              bot_mmr: typeof d.bot_mmr === 'number' ? d.bot_mmr : 1000,
              best_basit: d.best_basit,
              best_orta: d.best_orta,
              best_zor: d.best_zor
            });
          });
        }

        if (sortBy === 'level') {
          list.sort((a, b) => b.level !== a.level ? b.level - a.level : b.gold - a.gold);
        } else if (sortBy === 'gold') {
          list.sort((a, b) => b.gold !== a.gold ? b.gold - a.gold : b.level - a.level);
        } else if (sortBy === 'pvp_mmr') {
          list.sort((a, b) => (b.duel_mmr || 1000) !== (a.duel_mmr || 1000) ? (b.duel_mmr || 1000) - (a.duel_mmr || 1000) : b.level - a.level);
        } else if (sortBy === 'bot_mmr') {
          list.sort((a, b) => (b.bot_mmr || 1000) !== (a.bot_mmr || 1000) ? (b.bot_mmr || 1000) - (a.bot_mmr || 1000) : b.level - a.level);
        }

        localStorage.setItem('sudoku_cached_leaderboard', JSON.stringify(list));
        return list;
      })();

      const timeoutPromise = new Promise<Player[]>((resolve) =>
        setTimeout(() => resolve(this.getCachedPlayers(sortBy)), 4000)
      );

      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (e) {
      console.warn("Liderlik tablosu canlı çekilemedi:", e);
      return this.getCachedPlayers(sortBy);
    }
  },

  async fetchFastestRecords(diffFilter: 'all' | 'basit' | 'orta' | 'zor' = 'all'): Promise<SpeedRecord[]> {
    try {
      const fetchPromise = (async () => {
        const recordsMap = new Map<string, SpeedRecord>();

        const formatTime = (sec: number) => {
          const m = Math.floor(sec / 60).toString().padStart(2, '0');
          const s = (sec % 60).toString().padStart(2, '0');
          return `${m}:${s}`;
        };

        try {
          const lbSnap = await getDocs(collection(db, 'leaderboard'));
          if (!lbSnap.empty) {
            lbSnap.docs.forEach((docSnap) => {
              const d = docSnap.data();
              const uid = d.uid || docSnap.id;
              const safeUsername = formatDisplayName(d.username, uid);
              const level = typeof d.level === 'number' ? d.level : 1;

              const checkAndAdd = (diff: 'basit' | 'orta' | 'zor', timeSec?: number) => {
                if (typeof timeSec === 'number' && timeSec > 0) {
                  const key = `${safeUsername}_${diff}`;
                  const existing = recordsMap.get(key);
                  if (!existing || timeSec < existing.timeElapsed) {
                    recordsMap.set(key, {
                      uid,
                      username: safeUsername,
                      level,
                      difficulty: diff,
                      timeElapsed: timeSec,
                      timeFormatted: formatTime(timeSec),
                      errors: 0
                    });
                  }
                }
              };

              checkAndAdd('basit', d.best_basit);
              checkAndAdd('orta', d.best_orta);
              checkAndAdd('zor', d.best_zor);
            });
          }
        } catch {
          // ignore
        }

        let resultList = Array.from(recordsMap.values());

        if (resultList.length === 0) {
          return this.getCachedFastestRecords(diffFilter);
        }

        if (diffFilter !== 'all') {
          resultList = resultList.filter(r => r.difficulty === diffFilter);
        }

        resultList.sort((a, b) => a.timeElapsed - b.timeElapsed);

        const sliced = resultList.slice(0, 30);
        localStorage.setItem('sudoku_cached_fastest_records', JSON.stringify(sliced));
        return sliced;
      })();

      const timeoutPromise = new Promise<SpeedRecord[]>((resolve) =>
        setTimeout(() => resolve(this.getCachedFastestRecords(diffFilter)), 4000)
      );

      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (e) {
      console.warn("En hızlılar tablosu çekilemedi:", e);
      return this.getCachedFastestRecords(diffFilter);
    }
  }
};
