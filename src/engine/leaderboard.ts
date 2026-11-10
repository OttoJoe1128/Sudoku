import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../api/firebase';

export interface Player {
  username: string;
  gold: number;
  level: number;
}

export const Leaderboard = {
  async fetchTopPlayers(): Promise<Player[]> {
    try {
      const q = query(collection(db, "leaderboard"), orderBy("gold", "desc"), limit(50));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Player);
    } catch (e) {
      console.error("Liderlik tablosu çekilemedi:", e);
      return [];
    }
  }
};
