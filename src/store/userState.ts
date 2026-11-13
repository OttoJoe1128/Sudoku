import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../api/firebase';

export interface GameCompletionDetails {
  level: number;
  difficulty: 'basit' | 'orta' | 'zor';
  timeElapsed: number;
  timeFormatted: string;
  errors: number;
  hintsUsed: number;
}

export interface UserData {
  username: string;
  gold: number;
  level: number;
  best_basit?: number;
  best_orta?: number;
  best_zor?: number;
  total_completed?: number;
}

export interface ProfileStats {
  username: string;
  level: number;
  gold: number;
  totalCompleted: number;
  bestBasitFormatted: string;
  bestOrtaFormatted: string;
  bestZorFormatted: string;
}

export const UserManager = {
  async initUser(): Promise<UserData | null> {
    try {
      const cred = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
      const uid = cred.user.uid;

      const userDocRef = doc(db, 'leaderboard', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const username = data.username || 'Oyuncu';
        const gold = typeof data.gold === 'number' ? data.gold : 100;
        const level = typeof data.level === 'number' ? data.level : 1;

        localStorage.setItem('sudoku_username', username);
        localStorage.setItem('sudoku_gold', gold.toString());
        localStorage.setItem('sudoku_level', level.toString());

        return { username, gold, level };
      }

      const localUsername = this.getUsername();
      if (localUsername) {
        const found = await this.findUserByName(localUsername);
        if (found) {
          localStorage.setItem('sudoku_gold', found.gold.toString());
          localStorage.setItem('sudoku_level', found.level.toString());
          await setDoc(userDocRef, {
            uid,
            username: found.username,
            gold: found.gold,
            level: found.level,
            updatedAt: serverTimestamp()
          }, { merge: true });
          return found;
        }
      }
    } catch (e) {
      console.warn("Kullanıcı Firebase ile senkronize edilemedi, yerel veri kullanılıyor:", e);
    }
    return null;
  },

  async findUserByName(username: string): Promise<UserData | null> {
    try {
      const directDocRef = doc(db, 'leaderboard', username);
      const directSnap = await getDoc(directDocRef);
      if (directSnap.exists()) {
        const d = directSnap.data();
        return {
          username: d.username || username,
          gold: typeof d.gold === 'number' ? d.gold : 100,
          level: typeof d.level === 'number' ? d.level : 1
        };
      }

      const q = query(collection(db, 'leaderboard'), where('username', '==', username));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const d = querySnap.docs[0].data();
        return {
          username: d.username || username,
          gold: typeof d.gold === 'number' ? d.gold : 100,
          level: typeof d.level === 'number' ? d.level : 1
        };
      }
    } catch (e) {
      console.warn("Kullanıcı adı aranırken hata:", e);
    }
    return null;
  },

  async saveUser(username: string): Promise<UserData> {
    localStorage.setItem('sudoku_username', username);
    let gold = this.getGold();
    let level = this.getCurrentLevel();

    try {
      const cred = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
      const uid = cred.user.uid;

      const existing = await this.findUserByName(username);
      if (existing) {
        gold = existing.gold;
        level = existing.level;
        localStorage.setItem('sudoku_gold', gold.toString());
        localStorage.setItem('sudoku_level', level.toString());
      }

      await setDoc(doc(db, 'leaderboard', uid), {
        uid,
        username,
        gold,
        level,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore'a kullanıcı kaydedilemedi:", e);
    }

    return { username, gold, level };
  },

  async updateProgress(level: number, gold: number) {
    localStorage.setItem('sudoku_level', level.toString());
    localStorage.setItem('sudoku_gold', gold.toString());

    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const username = this.getUsername() || 'Oyuncu';
        await setDoc(doc(db, 'leaderboard', uid), {
          uid,
          username,
          gold,
          level,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore ilerlemesi güncellenemedi:", e);
    }
  },

  async recordGameCompletion(details: GameCompletionDetails): Promise<void> {
    try {
      const cred = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
      const uid = cred.user.uid;
      const username = this.getUsername() || 'Oyuncu';

      const now = new Date();
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      await addDoc(collection(db, 'game_records'), {
        uid,
        username,
        level: details.level,
        difficulty: details.difficulty,
        timeElapsed: details.timeElapsed,
        timeFormatted: details.timeFormatted,
        errors: details.errors,
        hintsUsed: details.hintsUsed,
        monthYear,
        completedAt: serverTimestamp()
      });

      const userDocRef = doc(db, 'leaderboard', uid);
      const snap = await getDoc(userDocRef);
      const currentData = snap.exists() ? snap.data() : {};

      const updates: Record<string, any> = {
        uid,
        username,
        updatedAt: serverTimestamp(),
        total_completed: (typeof currentData.total_completed === 'number' ? currentData.total_completed : 0) + 1
      };

      const diffKey = details.difficulty === 'basit' ? 'best_basit' : details.difficulty === 'orta' ? 'best_orta' : 'best_zor';
      const prevBest = typeof currentData[diffKey] === 'number' ? currentData[diffKey] : null;

      if (prevBest === null || details.timeElapsed < prevBest) {
        updates[diffKey] = details.timeElapsed;
      }

      await setDoc(userDocRef, updates, { merge: true });
    } catch (e) {
      console.warn("Oyun süresi ve kaydı Firebase'e yazılamadı:", e);
    }
  },

  async getUserProfileStats(): Promise<ProfileStats> {
    const username = this.getUsername() || 'Oyuncu';
    const level = this.getCurrentLevel();
    const gold = this.getGold();

    let totalCompleted = 0;
    let bestBasit = null;
    let bestOrta = null;
    let bestZor = null;

    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, 'leaderboard', uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          totalCompleted = typeof data.total_completed === 'number' ? data.total_completed : 0;
          bestBasit = typeof data.best_basit === 'number' ? data.best_basit : null;
          bestOrta = typeof data.best_orta === 'number' ? data.best_orta : null;
          bestZor = typeof data.best_zor === 'number' ? data.best_zor : null;
        }
      }
    } catch (e) {
      console.warn("Profil istatistikleri çekilemedi:", e);
    }

    const formatTime = (secs: number | null) => {
      if (secs === null || secs === undefined) return '--:--';
      const m = Math.floor(secs / 60).toString().padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    return {
      username,
      level,
      gold,
      totalCompleted,
      bestBasitFormatted: formatTime(bestBasit),
      bestOrtaFormatted: formatTime(bestOrta),
      bestZorFormatted: formatTime(bestZor)
    };
  },

  getUsername(): string | null {
    return localStorage.getItem('sudoku_username');
  },

  getCurrentLevel(): number {
    return parseInt(localStorage.getItem('sudoku_level') || '1');
  },

  getGold(): number {
    return parseInt(localStorage.getItem('sudoku_gold') || '100');
  }
};
