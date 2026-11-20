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

export function computeNextJourneyLevel(completedLevel: number, currentVariantLevel: number): number {
  const next = completedLevel >= currentVariantLevel ? completedLevel + 1 : currentVariantLevel;
  return Math.min(1000, next);
}

export const UserManager = {
  calculatePlayerTitle(
    level: number = 1,
    duelWins: number = 0,
    duelMmr: number = 1000,
    totalCompleted: number = 0
  ): string {
    const tierProgress = level >= 701 ? (level - 701) : (level >= 301 ? (level - 301) : (level - 1));
    const effectiveCompleted = Math.max(totalCompleted, Math.max(0, tierProgress));
    const mmrBonus = Math.max(0, duelMmr - 1000) * 2;
    const tierBonus = level >= 701 ? 120 : (level >= 301 ? 50 : 0);

    const rankScore = (effectiveCompleted * 15) + (duelWins * 45) + mmrBonus + tierBonus;

    if (rankScore >= 1500) return '🔥 Büyükusta';
    if (rankScore >= 700) return '💎 Üstat';
    if (rankScore >= 300) return '🥇 Zihin Ustası';
    if (rankScore >= 100) return '🥈 Kaşif';
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
    if (typeof localStorage === 'undefined') return 1;
    const raw = localStorage.getItem(`sudoku_level_${variant}`);
    return raw ? parseInt(raw) : (variant === 'classic' ? this.getCurrentLevel() : 1);
  },

  async updateVariantLevel(variant: SudokuVariant, newLevel: number, addedGold: number = 0): Promise<void> {
    const currentVariantLevel = this.getVariantLevel(variant);
    const updatedLevel = Math.min(1000, Math.max(currentVariantLevel, newLevel));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`sudoku_level_${variant}`, updatedLevel.toString());
    }

    let currentGold = this.getGold();
    if (addedGold > 0) {
      currentGold += addedGold;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sudoku_gold', currentGold.toString());
      }
    }

    if (variant === 'classic') {
      const currentClassicLevel = this.getCurrentLevel();
      const updatedClassic = Math.min(1000, Math.max(currentClassicLevel, updatedLevel));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sudoku_level', updatedClassic.toString());
      }
    }

    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const updates: Record<string, any> = {
          [`level_${variant}`]: updatedLevel,
          gold: currentGold,
          updatedAt: serverTimestamp()
        };
        if (variant === 'classic') {
          updates.level = Math.max(this.getCurrentLevel(), updatedLevel);
        }
        await setDoc(doc(db, 'leaderboard', uid), updates, { merge: true });
      }
    } catch {
      // ignore
    }
  },

  getVariantScore(variant: SudokuVariant = 'classic'): number {
    if (typeof localStorage === 'undefined') return 0;
    const raw = localStorage.getItem(`sudoku_score_${variant}`);
    return raw ? parseInt(raw) : 0;
  },

  async updateVariantProgress(variant: SudokuVariant, level: number, pointsGained: number) {
    const currentVariantLevel = this.getVariantLevel(variant);
    const safeLevel = Math.max(currentVariantLevel, level);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`sudoku_level_${variant}`, safeLevel.toString());
    }

    const mult = VARIANT_MULTIPLIERS[variant] || 1.0;
    const currentScore = this.getVariantScore(variant);
    const newScore = currentScore + Math.round(pointsGained * mult);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`sudoku_score_${variant}`, newScore.toString());
    }

    if (variant === 'classic') {
      const currentClassic = this.getCurrentLevel();
      const safeClassic = Math.max(currentClassic, safeLevel);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sudoku_level', safeClassic.toString());
      }
    }

    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const updates: Record<string, any> = {
          [`level_${variant}`]: safeLevel,
          [`score_${variant}`]: newScore,
          updatedAt: serverTimestamp()
        };
        if (variant === 'classic') {
          updates.level = Math.max(this.getCurrentLevel(), safeLevel);
        }
        await setDoc(doc(db, 'leaderboard', uid), updates, { merge: true });
      }
    } catch {
      // ignore
    }
  },

  validateAndRepairLocalState(): void {
    if (typeof localStorage === 'undefined') return;

    (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(v => {
      const raw = localStorage.getItem(`sudoku_level_${v}`);
      let lvl = raw ? parseInt(raw) : (v === 'classic' ? this.getCurrentLevel() : 1);
      if (isNaN(lvl) || lvl < 1) lvl = 1;
      if (lvl > 1000) lvl = 1000;
      localStorage.setItem(`sudoku_level_${v}`, lvl.toString());
    });

    const classicLvl = this.getVariantLevel('classic');
    const currentLvl = this.getCurrentLevel();
    const safeClassic = Math.max(1, Math.min(1000, Math.max(classicLvl, currentLvl)));
    localStorage.setItem('sudoku_level', safeClassic.toString());
    localStorage.setItem('sudoku_level_classic', safeClassic.toString());

    let gold = parseInt(localStorage.getItem('sudoku_gold') || '100');
    if (isNaN(gold) || gold < 0) gold = 0;
    localStorage.setItem('sudoku_gold', gold.toString());

    let totalComp = parseInt(localStorage.getItem('sudoku_total_completed') || '0');
    if (isNaN(totalComp) || totalComp < 0) totalComp = 0;
    localStorage.setItem('sudoku_total_completed', totalComp.toString());
  },

  getOfflineFallbackUser(): UserData | null {
    this.validateAndRepairLocalState();
    const localUsername = this.getUsername();
    if (!localUsername) return null;
    const level = this.getCurrentLevel();
    return {
      username: localUsername,
      gold: this.getGold(),
      level,
      avatar: this.getAvatar(),
      title: this.getTitle()
    };
  },

  async initUser(): Promise<UserData | null> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return this.getOfflineFallbackUser();
    }

    const fetchPromise = (async () => {
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
        const totalCompleted = typeof data.total_completed === 'number' ? data.total_completed : 0;

        const localTotal = this.getTotalCompleted();
        const safeTotal = Math.max(localTotal, totalCompleted);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sudoku_total_completed', safeTotal.toString());
        }

        (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(v => {
          const localLvl = this.getVariantLevel(v);
          const fireLvl = typeof data[`level_${v}`] === 'number' ? data[`level_${v}`] : (v === 'classic' ? level : 1);
          const safeLvl = Math.max(localLvl, fireLvl);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`sudoku_level_${v}`, safeLvl.toString());
          }

          const localScore = this.getVariantScore(v);
          const fireScore = typeof data[`score_${v}`] === 'number' ? data[`score_${v}`] : 0;
          const safeScore = Math.max(localScore, fireScore);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`sudoku_score_${v}`, safeScore.toString());
          }
        });

        const classicLvl = this.getVariantLevel('classic');
        const safeClassic = Math.max(this.getCurrentLevel(), level, classicLvl);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sudoku_level', safeClassic.toString());
          localStorage.setItem('sudoku_username', username);
          localStorage.setItem('sudoku_gold', gold.toString());
          localStorage.setItem('sudoku_avatar', avatar);
        }

        this.validateAndRepairLocalState();

        // 2-Way Sync: write back to Firestore if local levels/scores are higher
        const dirtyUpdates: Record<string, any> = {};
        (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(v => {
          const localLvl = this.getVariantLevel(v);
          const fireLvl = typeof data[`level_${v}`] === 'number' ? data[`level_${v}`] : (v === 'classic' ? level : 1);
          if (localLvl > fireLvl) {
            dirtyUpdates[`level_${v}`] = localLvl;
            if (v === 'classic') dirtyUpdates.level = localLvl;
          }

          const localScore = this.getVariantScore(v);
          const fireScore = typeof data[`score_${v}`] === 'number' ? data[`score_${v}`] : 0;
          if (localScore > fireScore) {
            dirtyUpdates[`score_${v}`] = localScore;
          }
        });

        if (safeTotal > totalCompleted) {
          dirtyUpdates.total_completed = safeTotal;
        }

        if (Object.keys(dirtyUpdates).length > 0) {
          dirtyUpdates.updatedAt = serverTimestamp();
          await setDoc(userDocRef, dirtyUpdates, { merge: true });
        }

        const title = this.calculatePlayerTitle(safeClassic, duelWins, duelMmr, safeTotal);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sudoku_title', title);
        }

        await this.setPresence('available');

        return { uid, username, gold, level: safeClassic, avatar, title, duel_wins: duelWins, duel_mmr: duelMmr };
      }

      const localUsername = this.getUsername();
      if (localUsername) {
        const found = await this.findUserByName(localUsername);
        if (found) {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('sudoku_gold', found.gold.toString());

            (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(v => {
              if (found.variantLevels && typeof found.variantLevels[v] === 'number') {
                const safeLvl = Math.max(this.getVariantLevel(v), found.variantLevels[v]);
                localStorage.setItem(`sudoku_level_${v}`, safeLvl.toString());
              }
              if (found.variantScores && typeof found.variantScores[v] === 'number') {
                const safeScore = Math.max(this.getVariantScore(v), found.variantScores[v]);
                localStorage.setItem(`sudoku_score_${v}`, safeScore.toString());
              }
            });

            const safeClassic = Math.max(this.getCurrentLevel(), found.level, this.getVariantLevel('classic'));
            localStorage.setItem('sudoku_level', safeClassic.toString());

            const localTotal = this.getTotalCompleted();
            const safeTotal = Math.max(localTotal, found.total_completed || 0);
            localStorage.setItem('sudoku_total_completed', safeTotal.toString());

            const calcTitle = this.calculatePlayerTitle(safeClassic, found.duel_wins || 0, found.duel_mmr || 1000, safeTotal);
            localStorage.setItem('sudoku_title', calcTitle);
          }

          const safeClassic = Math.max(this.getCurrentLevel(), found.level, this.getVariantLevel('classic'));
          const calcTitle = this.calculatePlayerTitle(safeClassic, found.duel_wins || 0, found.duel_mmr || 1000, this.getTotalCompleted());

          await setDoc(userDocRef, {
            uid,
            username: found.username,
            gold: found.gold,
            level: safeClassic,
            avatar: found.avatar || '🎮',
            title: calcTitle,
            duel_mmr: found.duel_mmr || 1000,
            bot_mmr: found.bot_mmr || 1000,
            onlineStatus: 'available',
            lastSeenMs: Date.now(),
            updatedAt: serverTimestamp()
          }, { merge: true });

          return { ...found, level: safeClassic, title: calcTitle };
        }
      }
      return null;
    })().catch(() => null);

    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<UserData | null>((resolve) => {
      timeoutId = setTimeout(() => {
        console.warn("initUser zaman aşımına uğradı (3.5s), yerel veri kullanılıyor.");
        resolve(this.getOfflineFallbackUser());
      }, 3500);
    });

    try {
      const res = await Promise.race([fetchPromise, timeoutPromise]);
      return res || this.getOfflineFallbackUser();
    } catch (e) {
      console.warn("initUser Firebase hatası, yerel veri kullanılıyor:", e);
      return this.getOfflineFallbackUser();
    } finally {
      clearTimeout(timeoutId!);
    }
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
        const completed = typeof d.total_completed === 'number' ? d.total_completed : 0;

        const variantLevels: Record<SudokuVariant, number> = {
          classic: typeof d.level_classic === 'number' ? d.level_classic : level,
          irregular: typeof d.level_irregular === 'number' ? d.level_irregular : 1,
          killer: typeof d.level_killer === 'number' ? d.level_killer : 1,
          wordoku: typeof d.level_wordoku === 'number' ? d.level_wordoku : 1,
          samurai: typeof d.level_samurai === 'number' ? d.level_samurai : 1
        };

        const variantScores: Record<SudokuVariant, number> = {
          classic: typeof d.score_classic === 'number' ? d.score_classic : 0,
          irregular: typeof d.score_irregular === 'number' ? d.score_irregular : 0,
          killer: typeof d.score_killer === 'number' ? d.score_killer : 0,
          wordoku: typeof d.score_wordoku === 'number' ? d.score_wordoku : 0,
          samurai: typeof d.score_samurai === 'number' ? d.score_samurai : 0
        };

        return {
          uid: d.uid || username,
          username: d.username || username,
          gold: typeof d.gold === 'number' ? d.gold : 100,
          level,
          avatar: d.avatar || '🎮',
          title: this.calculatePlayerTitle(level, wins, mmr, completed),
          duel_mmr: mmr,
          bot_mmr: typeof d.bot_mmr === 'number' ? d.bot_mmr : 1000,
          total_completed: completed,
          duel_wins: wins,
          duel_losses: d.duel_losses,
          onlineStatus: d.onlineStatus || 'available',
          lastSeenMs: d.lastSeenMs,
          variantLevels,
          variantScores
        };
      }

      const q = query(collection(db, 'leaderboard'), where('username', '==', username));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0].data();
        const level = typeof d.level === 'number' ? d.level : 1;
        const wins = typeof d.duel_wins === 'number' ? d.duel_wins : 0;
        const mmr = typeof d.duel_mmr === 'number' ? d.duel_mmr : 1000;
        const completed = typeof d.total_completed === 'number' ? d.total_completed : 0;

        const variantLevels: Record<SudokuVariant, number> = {
          classic: typeof d.level_classic === 'number' ? d.level_classic : level,
          irregular: typeof d.level_irregular === 'number' ? d.level_irregular : 1,
          killer: typeof d.level_killer === 'number' ? d.level_killer : 1,
          wordoku: typeof d.level_wordoku === 'number' ? d.level_wordoku : 1,
          samurai: typeof d.level_samurai === 'number' ? d.level_samurai : 1
        };

        const variantScores: Record<SudokuVariant, number> = {
          classic: typeof d.score_classic === 'number' ? d.score_classic : 0,
          irregular: typeof d.score_irregular === 'number' ? d.score_irregular : 0,
          killer: typeof d.score_killer === 'number' ? d.score_killer : 0,
          wordoku: typeof d.score_wordoku === 'number' ? d.score_wordoku : 0,
          samurai: typeof d.score_samurai === 'number' ? d.score_samurai : 0
        };

        return {
          uid: d.uid || snap.docs[0].id,
          username: d.username,
          gold: typeof d.gold === 'number' ? d.gold : 100,
          level,
          avatar: d.avatar || '🎮',
          title: this.calculatePlayerTitle(level, wins, mmr, completed),
          duel_mmr: mmr,
          bot_mmr: typeof d.bot_mmr === 'number' ? d.bot_mmr : 1000,
          total_completed: completed,
          duel_wins: wins,
          duel_losses: d.duel_losses,
          onlineStatus: d.onlineStatus || 'available',
          lastSeenMs: d.lastSeenMs,
          variantLevels,
          variantScores
        };
      }
    } catch {
      // ignore
    }
    return null;
  },

  getUsername(): string | null { if (typeof localStorage === 'undefined') return null; return localStorage.getItem('sudoku_username'); },
  getGold(): number { if (typeof localStorage === 'undefined') return 100; return parseInt(localStorage.getItem('sudoku_gold') || '100'); },
  getCurrentLevel(): number { if (typeof localStorage === 'undefined') return 1; return parseInt(localStorage.getItem('sudoku_level') || '1'); },
  getTotalCompleted(): number { if (typeof localStorage === 'undefined') return 0; return parseInt(localStorage.getItem('sudoku_total_completed') || '0'); },
  getAvatar(): string { if (typeof localStorage === 'undefined') return '🎮'; return localStorage.getItem('sudoku_avatar') || '🎮'; },
  getTitle(): string {
    const level = this.getCurrentLevel();
    const totalCompleted = this.getTotalCompleted();
    if (typeof localStorage === 'undefined') return this.calculatePlayerTitle(level, 0, 1000, totalCompleted);
    return localStorage.getItem('sudoku_title') || this.calculatePlayerTitle(level, 0, 1000, totalCompleted);
  },
  getNotificationsEnabled(): boolean { if (typeof localStorage === 'undefined') return false; return localStorage.getItem('sudoku_notifications_enabled') === 'true'; },

  saveNotificationsEnabled(enabled: boolean) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sudoku_notifications_enabled', enabled ? 'true' : 'false');
    }
  },

  async saveUser(username: string): Promise<UserData> {
    const currentGold = this.getGold();
    const currentLevel = this.getCurrentLevel();
    const avatar = this.getAvatar();
    const title = this.getTitle();

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sudoku_username', username);
    }

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
    const safeLevel = Math.max(this.getCurrentLevel(), this.getVariantLevel('classic'), level);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sudoku_level', safeLevel.toString());
      localStorage.setItem('sudoku_level_classic', safeLevel.toString());
      localStorage.setItem('sudoku_gold', gold.toString());
    }

    const currentTitle = this.getTitle();

    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, 'leaderboard', uid);
        await setDoc(userDocRef, {
          level: safeLevel,
          level_classic: safeLevel,
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
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sudoku_avatar', avatar);
      localStorage.setItem('sudoku_title', title);
    }

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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sudoku_gold', newGold.toString());
      }

      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, 'leaderboard', uid);
        const snap = await getDoc(userDocRef);
        const currentData = snap.exists() ? snap.data() : {};

        const level = typeof currentData.level === 'number' ? currentData.level : this.getCurrentLevel();
        const wins = (typeof currentData.duel_wins === 'number' ? currentData.duel_wins : 0) + (isWin ? 1 : 0);
        const losses = (typeof currentData.duel_losses === 'number' ? currentData.duel_losses : 0) + (isWin ? 0 : 1);
        const completed = typeof currentData.total_completed === 'number' ? currentData.total_completed : this.getTotalCompleted();

        const currentPvpMmr = typeof currentData.duel_mmr === 'number' ? currentData.duel_mmr : 1000;
        const currentBotMmr = typeof currentData.bot_mmr === 'number' ? currentData.bot_mmr : 1000;

        const effectiveMmrChange = mmrChange !== 0 ? mmrChange : (isWin ? 25 : -20);
        const updatedMmr = isBot ? currentPvpMmr : Math.max(100, currentPvpMmr + effectiveMmrChange);
        const newTitle = this.calculatePlayerTitle(level, wins, updatedMmr, completed);

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sudoku_title', newTitle);
        }

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

      const localTotal = this.getTotalCompleted();
      const totalCompleted = (typeof currentData.total_completed === 'number' ? currentData.total_completed : 0) + 1;
      const safeTotal = Math.max(localTotal, totalCompleted);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sudoku_total_completed', safeTotal.toString());
      }

      const calcTitle = this.calculatePlayerTitle(level, wins, mmr, safeTotal);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sudoku_title', calcTitle);
      }

      const updates: Record<string, any> = {
        uid,
        username,
        title: calcTitle,
        lastSeenMs: Date.now(),
        updatedAt: serverTimestamp(),
        total_completed: safeTotal
      };

      const diffKey = details.difficulty === 'basit' ? 'best_basit' : details.difficulty === 'orta' ? 'best_orta' : 'best_zor';
      const prevBest = typeof currentData[diffKey] === 'number' ? currentData[diffKey] : null;

      if (prevBest === null || details.timeElapsed < prevBest) {
        updates[diffKey] = details.timeElapsed;
      }

      await setDoc(userDocRef, updates, { merge: true });

      // Disiplin puanı kazanımı
      const basePoints = details.difficulty === 'basit' ? 50 : details.difficulty === 'orta' ? 100 : 200;
      await this.updateVariantProgress(details.variant || 'classic', this.getVariantLevel(details.variant || 'classic'), basePoints);
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

    let totalCompleted = this.getTotalCompleted();
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
          totalCompleted = Math.max(totalCompleted, typeof d.total_completed === 'number' ? d.total_completed : 0);
          duelWins = typeof d.duel_wins === 'number' ? d.duel_wins : 0;
          duelLosses = typeof d.duel_losses === 'number' ? d.duel_losses : 0;
          duelMmr = typeof d.duel_mmr === 'number' ? d.duel_mmr : 1000;
          botMmr = typeof d.bot_mmr === 'number' ? d.bot_mmr : 1000;
          bestBasit = d.best_basit;
          bestOrta = d.best_orta;
          bestZor = d.best_zor;

          (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(v => {
            if (typeof d[`score_${v}`] === 'number') variantScores[v] = Math.max(variantScores[v], d[`score_${v}`]);
            if (typeof d[`level_${v}`] === 'number') variantLevels[v] = Math.max(variantLevels[v], d[`level_${v}`]);
          });
        }
      } catch (e) {
        console.warn("Profil istatistikleri çekilemedi:", e);
      }
    }

    const title = this.calculatePlayerTitle(level, duelWins, duelMmr, totalCompleted);

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
