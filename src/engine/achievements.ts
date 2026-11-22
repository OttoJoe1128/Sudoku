import { t, getLang } from '../i18n/translations';

export interface Badge {
  id: string;
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
  icon: string;
  rewardGold: number;
}

export const BADGES: Badge[] = [
  {
    id: 'first_win',
    title: 'İlk Zafer',
    titleEn: 'First Victory',
    desc: 'İlk Sudoku bulmacanı başarıyla tamamla.',
    descEn: 'Successfully complete your first Sudoku puzzle.',
    icon: 'target',
    rewardGold: 20
  },
  {
    id: 'level_10',
    title: 'Yolcu',
    titleEn: 'Traveler',
    desc: 'Seviye 10 ve üzerine ulaş.',
    descEn: 'Reach Level 10 and beyond.',
    icon: 'map',
    rewardGold: 30
  },
  {
    id: 'speed_demon',
    title: 'Hızlı Parmaklar',
    titleEn: 'Speed Demon',
    desc: 'Herhangi bir bulmacayı 3 dakikanın (180 sn) altında bitir.',
    descEn: 'Finish any puzzle in under 3 minutes (180s).',
    icon: 'zap',
    rewardGold: 40
  },
  {
    id: 'flawless',
    title: 'Kusursuz Akıl',
    titleEn: 'Flawless Mind',
    desc: 'Tek bir hata bile yapmadan (0 hata) bir bölüm tamamla.',
    descEn: 'Complete a puzzle with 0 errors.',
    icon: 'crown',
    rewardGold: 50
  },
  {
    id: 'level_50',
    title: 'Sudoku Ustası',
    titleEn: 'Sudoku Master',
    desc: 'Seviye 50 ve üzerine ulaş.',
    descEn: 'Reach Level 50 and beyond.',
    icon: 'trophy',
    rewardGold: 100
  },
  {
    id: 'medium_unlocked',
    title: 'Orta Seviye Fatihi',
    titleEn: 'Medium Conqueror',
    desc: 'Seviye 301\'e ulaşarak Orta Seviye kilidini aç.',
    descEn: 'Reach Level 301 to unlock Medium tier.',
    icon: 'fire',
    rewardGold: 150
  },
  {
    id: 'hard_unlocked',
    title: 'Efsanevi Çözücü',
    titleEn: 'Legendary Solver',
    desc: 'Seviye 701\'e ulaşarak Zor Seviye kilidini aç.',
    descEn: 'Reach Level 701 to unlock Hard tier.',
    icon: 'sword',
    rewardGold: 300
  },
  {
    id: 'gold_hoarder',
    title: 'Hazine Avcısı',
    titleEn: 'Treasure Hunter',
    desc: 'Kasanızda 500 veya daha fazla altın biriktirin.',
    descEn: 'Accumulate 500 or more gold in your vault.',
    icon: 'coin',
    rewardGold: 50
  },
  {
    id: 'puzzle_machine',
    title: 'Bulmaca Canavarı',
    titleEn: 'Puzzle Machine',
    desc: 'Toplam 10 veya daha fazla bulmaca tamamla.',
    descEn: 'Complete 10 or more puzzles in total.',
    icon: 'dice',
    rewardGold: 80
  },
  {
    id: 'daily_player',
    title: 'Sadık Oyuncu',
    titleEn: 'Loyal Player',
    desc: 'Günlük ödülünü en az bir kez topla.',
    descEn: 'Claim your daily reward at least once.',
    icon: 'zap',
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

    const claimed = new Set(this.getClaimedBadgeIds());
    let modified = false;

    if (params.totalCompleted !== undefined && params.totalCompleted < 10 && currentUnlocked.has('puzzle_machine') && !claimed.has('puzzle_machine')) {
      currentUnlocked.delete('puzzle_machine');
      modified = true;
    }
    if (params.level < 10 && currentUnlocked.has('level_10') && !claimed.has('level_10')) {
      currentUnlocked.delete('level_10');
      modified = true;
    }
    if (params.level < 50 && currentUnlocked.has('level_50') && !claimed.has('level_50')) {
      currentUnlocked.delete('level_50');
      modified = true;
    }
    if (params.level < 301 && currentUnlocked.has('medium_unlocked') && !claimed.has('medium_unlocked')) {
      currentUnlocked.delete('medium_unlocked');
      modified = true;
    }
    if (params.level < 701 && currentUnlocked.has('hard_unlocked') && !claimed.has('hard_unlocked')) {
      currentUnlocked.delete('hard_unlocked');
      modified = true;
    }
    if (params.gold < 500 && currentUnlocked.has('gold_hoarder') && !claimed.has('gold_hoarder')) {
      currentUnlocked.delete('gold_hoarder');
      modified = true;
    }

    if (modified || newlyUnlocked.length > 0) {
      localStorage.setItem('sudoku_unlocked_badges', JSON.stringify(Array.from(currentUnlocked)));
    }

    return { newlyUnlocked };
  },

  getAllBadgesWithStatus(level: number, gold: number, totalCompleted: number = 0): BadgeStatus[] {
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
      return { success: false, goldAdded: 0, message: t('badge_not_found') };
    }

    const unlocked = new Set(this.getUnlockedBadgeIds());
    if (!unlocked.has(badgeId)) {
      return { success: false, goldAdded: 0, message: t('badge_locked') };
    }

    const claimed = new Set(this.getClaimedBadgeIds());
    if (claimed.has(badgeId)) {
      return { success: false, goldAdded: 0, message: t('badge_already_claimed') };
    }

    claimed.add(badgeId);
    localStorage.setItem('sudoku_claimed_badges', JSON.stringify(Array.from(claimed)));

    const isEn = getLang() === 'en';
    const badgeTitle = isEn && badge.titleEn ? badge.titleEn : badge.title;

    return {
      success: true,
      goldAdded: badge.rewardGold,
      message: t('badge_claimed_msg', { title: badgeTitle, gold: badge.rewardGold })
    };
  }
};
