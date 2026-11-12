// src/engine/achievements.ts

export interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  rewardGold: number;
}

export const BADGES: Badge[] = [
  {
    id: 'first_win',
    title: 'İlk Zafer',
    desc: 'İlk Sudoku bulmacanı başarıyla tamamla.',
    icon: '🎯',
    rewardGold: 20
  },
  {
    id: 'level_10',
    title: 'Yolcu',
    desc: 'Seviye 10 ve üzerine ulaş.',
    icon: '🚶‍♂️',
    rewardGold: 30
  },
  {
    id: 'speed_demon',
    title: 'Hızlı Parmaklar',
    desc: 'Herhangi bir bulmacayı 3 dakikanın (180 sn) altında bitir.',
    icon: '⚡',
    rewardGold: 40
  },
  {
    id: 'flawless',
    title: 'Kusursuz Akıl',
    desc: 'Tek bir hata bile yapmadan (0 hata) bir bölüm tamamla.',
    icon: '💎',
    rewardGold: 50
  },
  {
    id: 'level_50',
    title: 'Sudoku Ustası',
    desc: 'Seviye 50 ve üzerine ulaş.',
    icon: '🎖️',
    rewardGold: 100
  },
  {
    id: 'medium_unlocked',
    title: 'Orta Seviye Fatihi',
    desc: 'Seviye 301\'e ulaşarak Orta Seviye kilidini aç.',
    icon: '🏔️',
    rewardGold: 150
  },
  {
    id: 'hard_unlocked',
    title: 'Efsanevi Çözücü',
    desc: 'Seviye 701\'e ulaşarak Zor Seviye kilidini aç.',
    icon: '🔥',
    rewardGold: 300
  },
  {
    id: 'gold_hoarder',
    title: 'Hazine Avcısı',
    desc: 'Kasanızda 500 veya daha fazla altın biriktirin.',
    icon: '💰',
    rewardGold: 50
  },
  {
    id: 'puzzle_machine',
    title: 'Bulmaca Canavarı',
    desc: 'Toplam 10 veya daha fazla bulmaca tamamla.',
    icon: '👑',
    rewardGold: 80
  },
  {
    id: 'daily_player',
    title: 'Sadık Oyuncu',
    desc: 'Günlük ödülünü en az bir kez topla.',
    icon: '🎁',
    rewardGold: 25
  }
];

export interface BadgeStatus extends Badge {
  isUnlocked: boolean;
  isClaimed: boolean;
}

export const AchievementManager = {
  getUnlockedBadgeIds(): string[] {
    try {
      const raw = localStorage.getItem('sudoku_unlocked_badges');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  },

  getClaimedBadgeIds(): string[] {
    try {
      const raw = localStorage.getItem('sudoku_claimed_badges');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  },

  checkAndUnlockBadges(params: {
    level: number;
    gold: number;
    totalCompleted?: number;
    lastTimeElapsed?: number;
    lastErrors?: number;
    dailyClaimed?: boolean;
  }): { newlyUnlocked: Badge[] } {
    const currentUnlocked = new Set(this.getUnlockedBadgeIds());
    const newlyUnlocked: Badge[] = [];

    BADGES.forEach((badge) => {
      if (currentUnlocked.has(badge.id)) return;

      let qualifies = false;
      switch (badge.id) {
        case 'first_win':
          qualifies = params.level > 1 || (params.totalCompleted !== undefined && params.totalCompleted >= 1);
          break;
        case 'level_10':
          qualifies = params.level >= 10;
          break;
        case 'speed_demon':
          qualifies = params.lastTimeElapsed !== undefined && params.lastTimeElapsed > 0 && params.lastTimeElapsed <= 180;
          break;
        case 'flawless':
          qualifies = params.lastErrors !== undefined && params.lastErrors === 0 && (params.lastTimeElapsed !== undefined && params.lastTimeElapsed > 0);
          break;
        case 'level_50':
          qualifies = params.level >= 50;
          break;
        case 'medium_unlocked':
          qualifies = params.level >= 301;
          break;
        case 'hard_unlocked':
          qualifies = params.level >= 701;
          break;
        case 'gold_hoarder':
          qualifies = params.gold >= 500;
          break;
        case 'puzzle_machine':
          qualifies = (params.totalCompleted !== undefined && params.totalCompleted >= 10);
          break;
        case 'daily_player':
          qualifies = !!params.dailyClaimed || localStorage.getItem('sudoku_daily_reward_last_claim') !== null;
          break;
      }

      if (qualifies) {
        currentUnlocked.add(badge.id);
        newlyUnlocked.push(badge);
      }
    });

    if (newlyUnlocked.length > 0) {
      localStorage.setItem('sudoku_unlocked_badges', JSON.stringify(Array.from(currentUnlocked)));
    }

    return { newlyUnlocked };
  },

  getAllBadgesWithStatus(level: number, gold: number, totalCompleted: number = 0): BadgeStatus[] {
    // Önce arka planda otomatik kontrol yap
    this.checkAndUnlockBadges({ level, gold, totalCompleted });

    const unlocked = new Set(this.getUnlockedBadgeIds());
    const claimed = new Set(this.getClaimedBadgeIds());

    return BADGES.map((b) => ({
      ...b,
      isUnlocked: unlocked.has(b.id),
      isClaimed: claimed.has(b.id)
    }));
  },

  claimBadgeReward(badgeId: string): { success: boolean; goldAdded: number; message: string } {
    const badge = BADGES.find((b) => b.id === badgeId);
    if (!badge) {
      return { success: false, goldAdded: 0, message: "Rozet bulunamadı." };
    }

    const unlocked = new Set(this.getUnlockedBadgeIds());
    if (!unlocked.has(badgeId)) {
      return { success: false, goldAdded: 0, message: "Bu rozet henüz kilitli!" };
    }

    const claimed = new Set(this.getClaimedBadgeIds());
    if (claimed.has(badgeId)) {
      return { success: false, goldAdded: 0, message: "Bu rozetin ödülü zaten alındı." };
    }

    claimed.add(badgeId);
    localStorage.setItem('sudoku_claimed_badges', JSON.stringify(Array.from(claimed)));

    return {
      success: true,
      goldAdded: badge.rewardGold,
      message: `Tebrikler! "${badge.title}" rozeti için +${badge.rewardGold} 🪙 kazandınız!`
    };
  }
};
