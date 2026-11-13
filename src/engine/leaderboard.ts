import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase';

export interface Player {
  uid?: string;
  username: string;
  gold: number;
  level: number;
  avatar?: string;
  title?: string;
  total_errors?: number;
  total_completed?: number;
  duel_wins?: number;
  duel_losses?: number;
  duel_mmr?: number;
  best_basit?: number;
  best_orta?: number;
  best_zor?: number;
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
  getCachedPlayers(sortBy: 'level' | 'gold' = 'level'): Player[] {
    try {
      const saved = localStorage.getItem('sudoku_cached_leaderboard');
      if (saved) {
        const parsed: Player[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (sortBy === 'level') {
            parsed.sort((a, b) => b.level !== a.level ? b.level - a.level : b.gold - a.gold);
          } else {
            parsed.sort((a, b) => b.gold !== a.gold ? b.gold - a.gold : b.level - a.level);
          }
          return parsed;
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

    // Fallback: oyuncu önbelleğinden süresi olanları üret
    const cachedPlayers = this.getCachedPlayers('level');
    const fallbackList: SpeedRecord[] = [];
    cachedPlayers.forEach(p => {
      const formatTime = (sec?: number) => {
        if (typeof sec !== 'number' || sec <= 0) return '--:--';
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
      };

      if (typeof p.best_basit === 'number' && p.best_basit > 0) {
        fallbackList.push({ uid: p.uid, username: p.username, level: p.level, difficulty: 'basit', timeElapsed: p.best_basit, timeFormatted: formatTime(p.best_basit), errors: 0 });
      }
      if (typeof p.best_orta === 'number' && p.best_orta > 0) {
        fallbackList.push({ uid: p.uid, username: p.username, level: p.level, difficulty: 'orta', timeElapsed: p.best_orta, timeFormatted: formatTime(p.best_orta), errors: 0 });
      }
      if (typeof p.best_zor === 'number' && p.best_zor > 0) {
        fallbackList.push({ uid: p.uid, username: p.username, level: p.level, difficulty: 'zor', timeElapsed: p.best_zor, timeFormatted: formatTime(p.best_zor), errors: 0 });
      }
    });

    let filtered = fallbackList;
    if (diffFilter !== 'all') {
      filtered = filtered.filter(r => r.difficulty === diffFilter);
    }
    filtered.sort((a, b) => a.timeElapsed - b.timeElapsed);
    return filtered;
  },

  async fetchTopPlayers(sortBy: 'level' | 'gold' = 'level'): Promise<Player[]> {
    try {
      const fetchPromise = (async () => {
        const colRef = collection(db, 'leaderboard');
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          const list: Player[] = [];
          snapshot.docs.forEach((docSnap) => {
            const d = docSnap.data();
            list.push({
              uid: d.uid || docSnap.id || d.username,
              username: d.username || docSnap.id || 'Oyuncu',
              gold: typeof d.gold === 'number' ? d.gold : parseInt(d.gold) || 0,
              level: typeof d.level === 'number' ? d.level : parseInt(d.level) || 1,
              avatar: d.avatar || '🎮',
              title: d.title || 'Çırak',
              total_errors: d.total_errors,
              total_completed: d.total_completed,
              duel_wins: d.duel_wins,
              duel_losses: d.duel_losses,
              duel_mmr: d.duel_mmr,
              best_basit: d.best_basit,
              best_orta: d.best_orta,
              best_zor: d.best_zor
            });
          });

          if (sortBy === 'level') {
            list.sort((a, b) => {
              if (b.level !== a.level) return b.level - a.level;
              return b.gold - a.gold;
            });
          } else {
            list.sort((a, b) => {
              if (b.gold !== a.gold) return b.gold - a.gold;
              return b.level - a.level;
            });
          }

          localStorage.setItem('sudoku_cached_leaderboard', JSON.stringify(list));
          return list;
        }
        return this.getCachedPlayers(sortBy);
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

        // 1. Veri Kaynağı: leaderboard koleksiyonundaki best_basit, best_orta, best_zor alanları
        try {
          const lbSnap = await getDocs(collection(db, 'leaderboard'));
          if (!lbSnap.empty) {
            lbSnap.docs.forEach((docSnap) => {
              const d = docSnap.data();
              const username = d.username || docSnap.id || 'Oyuncu';
              const level = typeof d.level === 'number' ? d.level : 1;
              const uid = d.uid || docSnap.id;

              const checkAndAdd = (diff: 'basit' | 'orta' | 'zor', timeSec?: number) => {
                if (typeof timeSec === 'number' && timeSec > 0) {
                  const key = `${username}_${diff}`;
                  const existing = recordsMap.get(key);
                  if (!existing || timeSec < existing.timeElapsed) {
                    recordsMap.set(key, {
                      uid,
                      username,
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

        // 2. Veri Kaynağı: game_records koleksiyonundaki tamamlanmış oyun detayları
        try {
          const recSnap = await getDocs(collection(db, 'game_records'));
          if (!recSnap.empty) {
            recSnap.docs.forEach((docSnap) => {
              const d = docSnap.data();
              if (typeof d.timeElapsed === 'number' && d.timeElapsed > 0) {
                const username = d.username || 'Oyuncu';
                const diff: 'basit' | 'orta' | 'zor' = d.difficulty || 'basit';
                const key = `${username}_${diff}`;
                const existing = recordsMap.get(key);

                if (!existing || d.timeElapsed < existing.timeElapsed) {
                  recordsMap.set(key, {
                    id: docSnap.id,
                    uid: d.uid,
                    username,
                    level: typeof d.level === 'number' ? d.level : 1,
                    difficulty: diff,
                    timeElapsed: d.timeElapsed,
                    timeFormatted: d.timeFormatted || formatTime(d.timeElapsed),
                    errors: typeof d.errors === 'number' ? d.errors : 0,
                    hintsUsed: typeof d.hintsUsed === 'number' ? d.hintsUsed : 0,
                    monthYear: d.monthYear
                  });
                }
              }
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
