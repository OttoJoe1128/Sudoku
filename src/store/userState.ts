import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../api/firebase';
import { SudokuVariant } from '../engine/sudoku';

export interface GameCompletionDetails {
  level: number;
  difficulty: 'basit' | 'orta' | 'zor';
  variant?: SudokuVariant;
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
  onlineStatus?: 'available' | 'in_game' | 'in_duel';
  lastSeenMs?: number;
  best_basit?: number;
  best_orta?: number;
  best_zor?: number;
  total_completed?: number;
  variantScores?: Record<SudokuVariant, number>;
  variantLevels?: Record<SudokuVariant, number>;
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
  variantScores: Record<SudokuVariant, number>;
  variantLevels: Record<SudokuVariant, number>;
  dominantVariant: SudokuVariant;
}

export const VARIANT_MULTIPLIERS: Record<SudokuVariant, number> = {
  classic: 1.0,
  wordoku: 1.2,
  irregular: 1.5,
  killer: 1.8,
  samurai: 2.5
};

export const UserManager = {
  calculatePlayerTitle(level: number, duelWins: number = 0, duelMmr: number = 1000): string {
    if (level >= 701 || duelWins >= 50 || duelMmr >= 1400) return '🔥 Büyükusta';
    if (level >= 301 || duelWins >= 20 || duelMmr >= 1200) return '💎 Üstat';
    if (level >= 100 || duelWins >= 10 || duelMmr >= 1100) return '🥇 Zihin Ustası';
    if (level >= 25 || duelWins >= 3) return '🥈 Kaşif';
    return '🥉 Çırak';
  },

  async setPresence(status: 'available' | 'in_game' | 'in_duel'): Promise<void> {
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        await setDoc(doc(db, 'leaderboard', uid), {
          onlineStatus: status,
          lastSeenMs: Date.now(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch {
      // ignore
    }
  },

  getVariantLevel(variant: SudokuVariant = 'classic'): number {
    const raw = localStorage.getItem(`sudoku_level_${variant}`);
    return raw ? parseInt(raw) : (variant === 'classic' ? this.getCurrentLevel() : 1);
  },

  getVariantScore(variant: SudokuVariant = 'classic'): number {
    const raw = localStorage.getItem(`sudoku_score_${variant}`);
    return raw ? parseInt(raw) : 0;
  },

  async updateVariantProgress(variant: SudokuVariant, level: number, pointsGained: number) {
    localStorage.setItem(`sudoku_level_${variant}`, level.toString());
    const mult = VARIANT_MULTIPLIERS[variant] || 1.0;
    const currentScore = this.getVariantScore(variant);
    const newScore = currentScore + Math.round(pointsGained * mult);
    localStorage.setItem(`sudoku_score_${variant}`, newScore.toString());

    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        await setDoc(doc(db, 'leaderboard', uid), {
          [`level_${variant}`]: level,
          [`score_${variant}`]: newScore,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch {
      // ignore
    }
  },

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
        const duelWins = typeof data.duel_wins === 'number' ? data.duel_wins : 0;
        const duelMmr = typeof data.duel_mmr === 'number' ? data.duel_mmr : 1000;
        const title = this.calculatePlayerTitle(level, duelWins, duelMmr);

        localStorage.setItem('sudoku_username', username);
        localStorage.setItem('sudoku_gold', gold.toString());
        localStorage.setItem('sudoku_level', level.toString());
        localStorage.setItem('sudoku_avatar', avatar);
        localStorage.setItem('sudoku_title', title);

        await this.setPresence('available');

        return { uid, username, gold, level, avatar, title, duel_wins: duelWins, duel_mmr: duelMmr };
      }

      const localUsername = this.getUsername();
      if (localUsername) {
        const found = await this.findUserByName(localUsername);
        if (found) {
          localStorage.setItem('sudoku_gold', found.gold.toString());
          localStorage.setItem('sudoku_level', found.level.toString());
          const calcTitle = this.calculatePlayerTitle(found.level, found.duel_wins || 0, found.duel_mmr || 1000);
          localStorage.setItem('sudoku_title', calcTitle);

          await setDoc(userDocRef, {
            uid,
            username: found.username,
            gold: found.gold,
            level: found.level,
            avatar: found.avatar || '🎮',
            title: calcTitle,
            duel_mmr: found.duel_mmr || 1000,
            bot_mmr: found.bot_mmr || 1000,
            onlineStatus: 'available',
            lastSeenMs: Date.now(),
            updatedAt: serverTimestamp()
          }, { merge: true });

          return { ...found, title: calcTitle };
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
        const level = typeof d.level === 'number' ? d.level : 1;
        const wins = typeof d.duel_wins === 'number' ? d.duel_wins : 0;
        const mmr = typeof d.duel_mmr === 'number' ? d.duel_mmr : 1000;
        return {
          uid: d.uid || username,
          username: d.username || username,
          gold: typeof d.gold === 'number' ? d.gold : 100,
          level,
          avatar: d.avatar || '🎮',
          title: this.calculatePlayerTitle(level, wins, mmr),
          duel_mmr: mmr,
          bot_mmr: typeof d.bot_mmr === 'number' ? d.bot_mmr : 1000,
          total_completed: d.total_completed,
          duel_wins: wins,
          duel_losses: d.duel_losses,
          onlineStatus: d.onlineStatus || 'available',
          lastSeenMs: d.lastSeenMs
        };
      }

      const q = query(collection(db, 'leaderboard'), where('username', '==', username));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0].data();
        const level = typeof d.level === 'number' ? d.level : 1;
        const wins = typeof d.duel_wins === 'number' ? d.duel_wins : 0;
        const mmr = typeof d.duel_mmr === 'number' ? d.duel_mmr : 1000;
        return {
          uid: d.uid || snap.docs[0].id,
          username: d.username,
          gold: typeof d.gold === 'number' ? d.gold : 100,
          level,
          avatar: d.avatar || '🎮',
          title: this.calculatePlayerTitle(level, wins, mmr),
          duel_mmr: mmr,
          bot_mmr: typeof d.bot_mmr === 'number' ? d.bot_mmr : 1000,
          total_completed: d.total_completed,
          duel_wins: wins,
          duel_losses: d.duel_losses,
          onlineStatus: d.onlineStatus || 'available',
          lastSeenMs: d.lastSeenMs
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
  getTitle(): string {
    const level = this.getCurrentLevel();
    return localStorage.getItem('sudoku_title') || this.calculatePlayerTitle(level);
  },
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
        onlineStatus: 'available',
        lastSeenMs: Date.now(),
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

    const currentTitle = this.getTitle();

    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, 'leaderboard', uid);
        await setDoc(userDocRef, {
          level,
          gold,
          title: currentTitle,
          lastSeenMs: Date.now(),
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

        const level = typeof currentData.level === 'number' ? currentData.level : this.getCurrentLevel();
        const wins = (typeof currentData.duel_wins === 'number' ? currentData.duel_wins : 0) + (isWin ? 1 : 0);
        const losses = (typeof currentData.duel_losses === 'number' ? currentData.duel_losses : 0) + (isWin ? 0 : 1);

        const currentPvpMmr = typeof currentData.duel_mmr === 'number' ? currentData.duel_mmr : 1000;
        const currentBotMmr = typeof currentData.bot_mmr === 'number' ? currentData.bot_mmr : 1000;

        const effectiveMmrChange = mmrChange !== 0 ? mmrChange : (isWin ? 25 : -20);
        const updatedMmr = isBot ? currentPvpMmr : Math.max(100, currentPvpMmr + effectiveMmrChange);
        const newTitle = this.calculatePlayerTitle(level, wins, updatedMmr);

        localStorage.setItem('sudoku_title', newTitle);

        const updates: any = {
          gold: newGold,
          duel_wins: wins,
          duel_losses: losses,
          title: newTitle,
          lastSeenMs: Date.now(),
          updatedAt: serverTimestamp()
        };

        if (isBot) {
          updates.bot_mmr = Math.max(100, currentBotMmr + effectiveMmrChange);
        } else {
          updates.duel_mmr = updatedMmr;
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
        variant: details.variant || 'classic',
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

      const level = typeof currentData.level === 'number' ? currentData.level : details.level;
      const wins = typeof currentData.duel_wins === 'number' ? currentData.duel_wins : 0;
      const mmr = typeof currentData.duel_mmr === 'number' ? currentData.duel_mmr : 1000;
      const calcTitle = this.calculatePlayerTitle(level, wins, mmr);

      localStorage.setItem('sudoku_title', calcTitle);

      const updates: Record<string, any> = {
        uid,
        username,
        title: calcTitle,
        lastSeenMs: Date.now(),
        updatedAt: serverTimestamp(),
        total_completed: (typeof currentData.total_completed === 'number' ? currentData.total_completed : 0) + 1
      };

      const diffKey = details.difficulty === 'basit' ? 'best_basit' : details.difficulty === 'orta' ? 'best_orta' : 'best_zor';
      const prevBest = typeof currentData[diffKey] === 'number' ? currentData[diffKey] : null;

      if (prevBest === null || details.timeElapsed < prevBest) {
        updates[diffKey] = details.timeElapsed;
      }

      await setDoc(userDocRef, updates, { merge: true });

      // Disiplin puanı kazanımı
      const basePoints = details.difficulty === 'basit' ? 50 : details.difficulty === 'orta' ? 100 : 200;
      await this.updateVariantProgress(details.variant || 'classic', details.level, basePoints);
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
    const notificationsEnabled = this.getNotificationsEnabled();

    let totalCompleted = 0;
    let duelWins = 0;
    let duelLosses = 0;
    let duelMmr = 1000;
    let botMmr = 1000;
    let bestBasit: number | undefined;
    let bestOrta: number | undefined;
    let bestZor: number | undefined;

    const variantScores: Record<SudokuVariant, number> = {
      classic: this.getVariantScore('classic'),
      irregular: this.getVariantScore('irregular'),
      killer: this.getVariantScore('killer'),
      wordoku: this.getVariantScore('wordoku'),
      samurai: this.getVariantScore('samurai')
    };

    const variantLevels: Record<SudokuVariant, number> = {
      classic: this.getVariantLevel('classic'),
      irregular: this.getVariantLevel('irregular'),
      killer: this.getVariantLevel('killer'),
      wordoku: this.getVariantLevel('wordoku'),
      samurai: this.getVariantLevel('samurai')
    };

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

          (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(v => {
            if (typeof d[`score_${v}`] === 'number') variantScores[v] = d[`score_${v}`];
            if (typeof d[`level_${v}`] === 'number') variantLevels[v] = d[`level_${v}`];
          });
        }
      } catch (e) {
        console.warn("Profil istatistikleri çekilemedi:", e);
      }
    }

    const title = this.calculatePlayerTitle(level, duelWins, duelMmr);

    // En baskın disiplin tespiti
    let maxScore = -1;
    let dominantVariant: SudokuVariant = 'classic';
    (Object.keys(variantScores) as SudokuVariant[]).forEach(v => {
      if (variantScores[v] > maxScore) {
        maxScore = variantScores[v];
        dominantVariant = v;
      }
    });

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
      bestZorFormatted: this.formatTime(bestZor),
      variantScores,
      variantLevels,
      dominantVariant
    };
  },

  formatTime(seconds?: number): string {
    if (typeof seconds !== 'number' || seconds <= 0) return '--:--';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
};
