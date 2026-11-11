import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase';

export interface Player {
  username: string;
  gold: number;
  level: number;
  total_errors?: number;
  best_basit?: number;
  best_orta?: number;
  best_zor?: number;
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
  }
};
