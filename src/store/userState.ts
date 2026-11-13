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
  bot_mmr?: number;
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
  botMmr: number;
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
        const title = data.title || 'Çırak';
        const duelMmr = typeof data.duel_mmr === 'number' ? data.duel_mmr : 1000;
        const botMmr = typeof data.bot_mmr === 'number' ? data.bot_mmr : 1000;

        localStorage.setItem('sudoku_username', username);
        localStorage.setItem('sudoku_gold', gold.toString());
        localStorage.setItem('sudoku_level', level.toString());
        localStorage.setItem('sudoku_avatar', avatar);
        localStorage.setItem('sudoku_title', title);

        return { uid, username, gold, level, avatar, title, duel_mmr: duelMmr, bot_mmr: botMmr };
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
            title: found.title || 'Çırak',
            duel_mmr: found.duel_mmr || 1000,
            bot_mmr: found.bot_mmr || 1000,
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
          uid: d.uid || username,
          username: d.username || username,
          gold: typeof d.gold === 'number' ? d.gold : 100,
          level: typeof d.level === 'number' ? d.level : 1,
          avatar: d.avatar || '🎮',
          title: d.title || 'Çırak',
          duel_mmr: typeof d.duel_mmr === 'number' ? d.duel_mmr : 1000,
          bot_mmr: typeof d.bot_mmr === 'number' ? d.bot_mmr : 1000,
          total_completed: d.total_completed,
          duel_wins: d.duel_wins,
          duel_losses: d.duel_losses
        };
      }

      const q = query(collection(db, 'leaderboard'), where('username', '==', username));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0].data();
        return {
          uid: d.uid || snap.docs[0].id,
          username: d.username,
          gold: typeof d.gold === 'number' ? d.gold : 100,
          level: typeof d.level === 'number' ? d.level : 1,
          avatar: d.avatar || '🎮',
          title: d.title || 'Çırak',
          duel_mmr: typeof d.duel_mmr === 'number' ? d.duel_mmr : 1000,
          bot_mmr: typeof d.bot_mmr === 'number' ? d.bot_mmr : 1000,
          total_completed: d.total_completed,
          duel_wins: d.duel_wins,
          duel_losses: d.duel_losses
        };
      }
    } catch {
      // ignore
    }
    return null;
  },

  getUsername(): string | null { return localStorage.getItem('sudoku_username'); },
  getGold(): number { return parseInt(localStorage.getItem('sudoku_gold') || '100'); },
  getCurrentLevel(): number { return parseInt(localStorage.getItem('sudoku_level') || '1'); },
  getAvatar(): string { return localStorage.getItem('sudoku_avatar') || '🎮'; },
  getTitle(): string { return localStorage.getItem('sudoku_title') || 'Çırak'; },
  getNotificationsEnabled(): boolean { return localStorage.getItem('sudoku_notifications_enabled') === 'true'; },

  saveNotificationsEnabled(enabled: boolean) {
    localStorage.setItem('sudoku_notifications_enabled', enabled ? 'true' : 'false');
  },

  async saveUser(username: string): Promise<UserData> {
    const currentGold = this.getGold();
    const currentLevel = this.getCurrentLevel();
    const avatar = this.getAvatar();
    const title = this.getTitle();

    localStorage.setItem('sudoku_username', username);

    try {
      const cred = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
      const uid = cred.user.uid;
      const userDocRef = doc(db, 'leaderboard', uid);
      await setDoc(userDocRef, {
        uid,
        username,
        gold: currentGold,
        level: currentLevel,
        avatar,
        title,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return { uid, username, gold: currentGold, level: currentLevel, avatar, title };
    } catch (e) {
      console.warn("Kullanıcı Firebase'e kaydedilemedi:", e);
      return { username, gold: currentGold, level: currentLevel, avatar, title };
    }
  },

  async updateProgress(level: number, gold: number): Promise<void> {
    localStorage.setItem('sudoku_level', level.toString());
    localStorage.setItem('sudoku_gold', gold.toString());

    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, 'leaderboard', uid);
        await setDoc(userDocRef, {
          level,
          gold,
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

  async recordDuelResult(isWin: boolean, isBot: boolean = false, mmrChange: number = 0, rewardGold: number = 0) {
    try {
      const currentGold = this.getGold();
      const newGold = Math.max(0, currentGold + rewardGold);
      localStorage.setItem('sudoku_gold', newGold.toString());

      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, 'leaderboard', uid);
        const snap = await getDoc(userDocRef);
        const currentData = snap.exists() ? snap.data() : {};

        const wins = (typeof currentData.duel_wins === 'number' ? currentData.duel_wins : 0) + (isWin ? 1 : 0);
        const losses = (typeof currentData.duel_losses === 'number' ? currentData.duel_losses : 0) + (isWin ? 0 : 1);

        const currentPvpMmr = typeof currentData.duel_mmr === 'number' ? currentData.duel_mmr : 1000;
        const currentBotMmr = typeof currentData.bot_mmr === 'number' ? currentData.bot_mmr : 1000;

        const effectiveMmrChange = mmrChange !== 0 ? mmrChange : (isWin ? 25 : -20);

        const updates: any = {
          gold: newGold,
          duel_wins: wins,
          duel_losses: losses,
          updatedAt: serverTimestamp()
        };

        if (isBot) {
          updates.bot_mmr = Math.max(100, currentBotMmr + effectiveMmrChange);
        } else {
          updates.duel_mmr = Math.max(100, currentPvpMmr + effectiveMmrChange);
        }

        await setDoc(userDocRef, updates, { merge: true });
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
    let botMmr = 1000;
    let bestBasit: number | undefined;
    let bestOrta: number | undefined;
    let bestZor: number | undefined;

    if (uid) {
      try {
        const snap = await getDoc(doc(db, 'leaderboard', uid));
        if (snap.exists()) {
          const d = snap.data();
          totalCompleted = typeof d.total_completed === 'number' ? d.total_completed : 0;
          duelWins = typeof d.duel_wins === 'number' ? d.duel_wins : 0;
          duelLosses = typeof d.duel_losses === 'number' ? d.duel_losses : 0;
          duelMmr = typeof d.duel_mmr === 'number' ? d.duel_mmr : 1000;
          botMmr = typeof d.bot_mmr === 'number' ? d.bot_mmr : 1000;
          bestBasit = d.best_basit;
          bestOrta = d.best_orta;
          bestZor = d.best_zor;
        }
      } catch (e) {
        console.warn("Profil istatistikleri çekilemedi:", e);
      }
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
      botMmr,
      bestBasitFormatted: this.formatTime(bestBasit),
      bestOrtaFormatted: this.formatTime(bestOrta),
      bestZorFormatted: this.formatTime(bestZor)
    };
  },

  formatTime(seconds?: number): string {
    if (typeof seconds !== 'number' || seconds <= 0) return '--:--';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
};
