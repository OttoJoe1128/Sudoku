import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase';

export interface Player {
  username: string;
  gold: number;
  level: number;
  total_errors?: number;
  total_completed?: number;
  best_basit?: number;
  best_orta?: number;
  best_zor?: number;
}

export interface SpeedRecord {
  id?: string;
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
  getCachedPlayers(): Player[] {
    try {
      const saved = localStorage.getItem('sudoku_cached_leaderboard');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  },

  async fetchTopPlayers(): Promise<Player[]> {
    try {
      const fetchPromise = (async () => {
        const colRef = collection(db, 'leaderboard');
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          const list: Player[] = [];
          snapshot.docs.forEach((doc) => {
            const d = doc.data();
            list.push({
              username: d.username || doc.id || 'Oyuncu',
              gold: typeof d.gold === 'number' ? d.gold : parseInt(d.gold) || 0,
              level: typeof d.level === 'number' ? d.level : parseInt(d.level) || 1,
              total_errors: d.total_errors,
              total_completed: d.total_completed,
              best_basit: d.best_basit,
              best_orta: d.best_orta,
              best_zor: d.best_zor
            });
          });

          // Puanlarına (altın) göre büyükten küçüğe sırala
          list.sort((a, b) => b.gold - a.gold);

          // Yerel önbelleğe kaydet
          localStorage.setItem('sudoku_cached_leaderboard', JSON.stringify(list));
          return list;
        }
        return this.getCachedPlayers();
      })();

      const timeoutPromise = new Promise<Player[]>((resolve) =>
        setTimeout(() => resolve(this.getCachedPlayers()), 4000)
      );

      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (e) {
      console.warn("Liderlik tablosu canlı çekilemedi:", e);
      return this.getCachedPlayers();
    }
  },

  async fetchFastestRecords(diffFilter: 'all' | 'basit' | 'orta' | 'zor' = 'all'): Promise<SpeedRecord[]> {
    try {
      const colRef = collection(db, 'game_records');
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) return [];

      let list: SpeedRecord[] = [];
      snapshot.docs.forEach((doc) => {
        const d = doc.data();
        if (typeof d.timeElapsed === 'number' && d.timeElapsed > 0) {
          list.push({
            id: doc.id,
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

      // En hızlı bitirenler en üstte (küçük süreden büyüğe)
      list.sort((a, b) => a.timeElapsed - b.timeElapsed);

      return list.slice(0, 30);
    } catch (e) {
      console.warn("En hızlılar tablosu çekilemedi:", e);
      return [];
    }
  }
};
