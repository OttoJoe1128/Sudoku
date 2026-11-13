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
      const colRef = collection(db, 'game_records');
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) return [];

      let list: SpeedRecord[] = [];
      snapshot.docs.forEach((docSnap) => {
        const d = docSnap.data();
        if (typeof d.timeElapsed === 'number' && d.timeElapsed > 0) {
          list.push({
            id: docSnap.id,
            uid: d.uid,
            username: d.username || 'Oyuncu',
            level: typeof d.level === 'number' ? d.level : 1,
            difficulty: d.difficulty || 'basit',
            timeElapsed: d.timeElapsed,
            timeFormatted: d.timeFormatted || `${Math.floor(d.timeElapsed / 60).toString().padStart(2, '0')}:${(d.timeElapsed % 60).toString().padStart(2, '0')}`,
            errors: typeof d.errors === 'number' ? d.errors : 0,
            hintsUsed: typeof d.hintsUsed === 'number' ? d.hintsUsed : 0,
            monthYear: d.monthYear
          });
        }
      });

      if (diffFilter !== 'all') {
        list = list.filter(r => r.difficulty === diffFilter);
      }

      list.sort((a, b) => a.timeElapsed - b.timeElapsed);

      return list.slice(0, 30);
    } catch (e) {
      console.warn("En hızlılar tablosu çekilemedi:", e);
      return [];
    }
  }
};
