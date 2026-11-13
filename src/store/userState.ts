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
  uid?: string;
  username: string;
  gold: number;
  level: number;
  avatar?: string;
  title?: string;
  duel_wins?: number;
  duel_losses?: number;
  duel_mmr?: number;
  notifications_enabled?: boolean;
  best_basit?: number;
  best_orta?: number;
  best_zor?: number;
  total_completed?: number;
}

export interface ProfileStats {
  uid?: string;
  username: string;
  level: number;
  gold: number;
  avatar: string;
  title: string;
  notificationsEnabled: boolean;
  totalCompleted: number;
  duelWins: number;
  duelLosses: number;
  duelMmr: number;
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
        const avatar = data.avatar || '🎮';
        const title = data.title || 'Çaylak Bulmacacı';

        localStorage.setItem('sudoku_username', username);
        localStorage.setItem('sudoku_gold', gold.toString());
        localStorage.setItem('sudoku_level', level.toString());
        localStorage.setItem('sudoku_avatar', avatar);
        localStorage.setItem('sudoku_title', title);

        return { uid, username, gold, level, avatar, title };
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
            avatar: found.avatar || '🎮',
            title: found.title || 'Çaylak Bulmacacı',
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
          uid: d.uid,
          username: d.username || username,
          gold: typeof d.gold === 'number' ? d.gold : 100,
          level: typeof d.level === 'number' ? d.level : 1,
          avatar: d.avatar || '🎮',
          title: d.title || 'Çaylak Bulmacacı',
          duel_wins: d.duel_wins || 0,
          duel_losses: d.duel_losses || 0,
          duel_mmr: d.duel_mmr || 1000,
          best_basit: d.best_basit,
          best_orta: d.best_orta,
          best_zor: d.best_zor,
          total_completed: d.total_completed
        };
      }

      const q = query(collection(db, 'leaderboard'), where('username', '==', username));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const d = querySnap.docs[0].data();
        return {
          uid: d.uid,
          username: d.username || username,
          gold: typeof d.gold === 'number' ? d.gold : 100,
          level: typeof d.level === 'number' ? d.level : 1,
          avatar: d.avatar || '🎮',
          title: d.title || 'Çaylak Bulmacacı',
          duel_wins: d.duel_wins || 0,
          duel_losses: d.duel_losses || 0,
          duel_mmr: d.duel_mmr || 1000,
          best_basit: d.best_basit,
          best_orta: d.best_orta,
          best_zor: d.best_zor,
          total_completed: d.total_completed
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
    let avatar = this.getAvatar();
    let title = this.getTitle();

    try {
      const cred = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
      const uid = cred.user.uid;

      const existing = await this.findUserByName(username);
      if (existing) {
        gold = existing.gold;
        level = existing.level;
        avatar = existing.avatar || avatar;
        title = existing.title || title;
        localStorage.setItem('sudoku_gold', gold.toString());
        localStorage.setItem('sudoku_level', level.toString());
        localStorage.setItem('sudoku_avatar', avatar);
        localStorage.setItem('sudoku_title', title);
      }

      await setDoc(doc(db, 'leaderboard', uid), {
        uid,
        username,
        gold,
        level,
        avatar,
        title,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore'a kullanıcı kaydedilemedi:", e);
    }

    return { username, gold, level, avatar, title };
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

  async updateProfileCustomization(avatar: string, title: string) {
    localStorage.setItem('sudoku_avatar', avatar);
    localStorage.setItem('sudoku_title', title);

    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        await setDoc(doc(db, 'leaderboard', uid), {
          avatar,
          title,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn("Profil özelleştirmeleri kaydedilemedi:", e);
    }
  },

  async recordDuelResult(isWin: boolean) {
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, 'leaderboard', uid);
        const snap = await getDoc(userDocRef);
        const currentData = snap.exists() ? snap.data() : {};

        const wins = (typeof currentData.duel_wins === 'number' ? currentData.duel_wins : 0) + (isWin ? 1 : 0);
        const losses = (typeof currentData.duel_losses === 'number' ? currentData.duel_losses : 0) + (isWin ? 0 : 1);
        const mmr = Math.max(800, (typeof currentData.duel_mmr === 'number' ? currentData.duel_mmr : 1000) + (isWin ? 25 : -10));

        await setDoc(userDocRef, {
          duel_wins: wins,
          duel_losses: losses,
          duel_mmr: mmr,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn("Düello sonucu kaydedilemedi:", e);
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

  async getUserProfileStats(targetUid?: string): Promise<ProfileStats> {
    const uid = targetUid || (auth.currentUser ? auth.currentUser.uid : undefined);
    const username = this.getUsername() || 'Oyuncu';
    const level = this.getCurrentLevel();
    const gold = this.getGold();
    const avatar = this.getAvatar();
    const title = this.getTitle();
    const notificationsEnabled = this.getNotificationsEnabled();

    let totalCompleted = 0;
    let duelWins = 0;
    let duelLosses = 0;
    let duelMmr = 1000;
    let bestBasit = null;
    let bestOrta = null;
    let bestZor = null;

    try {
      if (uid) {
        const userDocRef = doc(db, 'leaderboard', uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          totalCompleted = typeof data.total_completed === 'number' ? data.total_completed : 0;
          duelWins = typeof data.duel_wins === 'number' ? data.duel_wins : 0;
          duelLosses = typeof data.duel_losses === 'number' ? data.duel_losses : 0;
          duelMmr = typeof data.duel_mmr === 'number' ? data.duel_mmr : 1000;
          bestBasit = typeof data.best_basit === 'number' ? data.best_basit : null;
          bestOrta = typeof data.best_orta === 'number' ? data.best_orta : null;
          bestZor = typeof data.best_zor === 'number' ? data.best_zor : null;

          return {
            uid,
            username: data.username || username,
            level: typeof data.level === 'number' ? data.level : level,
            gold: typeof data.gold === 'number' ? data.gold : gold,
            avatar: data.avatar || avatar,
            title: data.title || title,
            notificationsEnabled,
            totalCompleted,
            duelWins,
            duelLosses,
            duelMmr,
            bestBasitFormatted: this.formatTime(bestBasit),
            bestOrtaFormatted: this.formatTime(bestOrta),
            bestZorFormatted: this.formatTime(bestZor)
          };
        }
      }
    } catch (e) {
      console.warn("Profil istatistikleri çekilemedi:", e);
    }

    return {
      uid,
      username,
      level,
      gold,
      avatar,
      title,
      notificationsEnabled,
      totalCompleted,
      duelWins,
      duelLosses,
      duelMmr,
      bestBasitFormatted: this.formatTime(bestBasit),
      bestOrtaFormatted: this.formatTime(bestOrta),
      bestZorFormatted: this.formatTime(bestZor)
    };
  },

  formatTime(secs: number | null): string {
    if (secs === null || secs === undefined) return '--:--';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  },

  getUsername(): string | null {
    return localStorage.getItem('sudoku_username');
  },

  getCurrentLevel(): number {
    return parseInt(localStorage.getItem('sudoku_level') || '1');
  },

  getGold(): number {
    return parseInt(localStorage.getItem('sudoku_gold') || '100');
  },

  getAvatar(): string {
    return localStorage.getItem('sudoku_avatar') || '🎮';
  },

  getTitle(): string {
    return localStorage.getItem('sudoku_title') || 'Çaylak Bulmacacı';
  },

  getNotificationsEnabled(): boolean {
    return localStorage.getItem('sudoku_notifications_enabled') === 'true';
  },

  saveNotificationsEnabled(enabled: boolean) {
    localStorage.setItem('sudoku_notifications_enabled', enabled ? 'true' : 'false');
  }
};
