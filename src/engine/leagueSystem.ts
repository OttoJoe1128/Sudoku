import { UserManager } from '../store/userState';

export type LeagueId = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'grandmaster';

export interface LeagueTierDef {
  id: LeagueId;
  nameKey: string;
  icon: string;
  minMmr: number;
  maxMmr: number;
  badgeClass: string;
  endOfSeasonRewardGold: number;
  endOfSeasonRewardCrystals: number;
}

export const LEAGUE_TIERS: LeagueTierDef[] = [
  {
    id: 'bronze',
    nameKey: 'league_bronze',
    icon: '🥉',
    minMmr: 0,
    maxMmr: 999,
    badgeClass: 'text-amber-700 border-amber-800/40 bg-amber-900/10',
    endOfSeasonRewardGold: 50,
    endOfSeasonRewardCrystals: 5
  },
  {
    id: 'silver',
    nameKey: 'league_silver',
    icon: '🥈',
    minMmr: 1000,
    maxMmr: 1399,
    badgeClass: 'text-slate-300 border-slate-400/40 bg-slate-500/10',
    endOfSeasonRewardGold: 100,
    endOfSeasonRewardCrystals: 10
  },
  {
    id: 'gold',
    nameKey: 'league_gold',
    icon: '🥇',
    minMmr: 1400,
    maxMmr: 1799,
    badgeClass: 'text-amber-400 border-amber-400/50 bg-amber-500/10',
    endOfSeasonRewardGold: 200,
    endOfSeasonRewardCrystals: 20
  },
  {
    id: 'platinum',
    nameKey: 'league_platinum',
    icon: '💎',
    minMmr: 1800,
    maxMmr: 2199,
    badgeClass: 'text-cyan-400 border-cyan-400/50 bg-cyan-500/10',
    endOfSeasonRewardGold: 350,
    endOfSeasonRewardCrystals: 35
  },
  {
    id: 'diamond',
    nameKey: 'league_diamond',
    icon: '🔮',
    minMmr: 2200,
    maxMmr: 2599,
    badgeClass: 'text-purple-400 border-purple-400/50 bg-purple-500/10',
    endOfSeasonRewardGold: 500,
    endOfSeasonRewardCrystals: 50
  },
  {
    id: 'grandmaster',
    nameKey: 'league_grandmaster',
    icon: '👑',
    minMmr: 2600,
    maxMmr: 99999,
    badgeClass: 'text-rose-400 border-rose-400/60 bg-rose-500/15',
    endOfSeasonRewardGold: 1000,
    endOfSeasonRewardCrystals: 100
  }
];

export function getLeagueByRating(rating: number): LeagueTierDef {
  const safeRating = Math.max(0, rating);
  for (let i = LEAGUE_TIERS.length - 1; i >= 0; i--) {
    if (safeRating >= LEAGUE_TIERS[i].minMmr) {
      return LEAGUE_TIERS[i];
    }
  }
  return LEAGUE_TIERS[0];
}

export function getLeagueProgress(rating: number): {
  currentLeague: LeagueTierDef;
  nextLeague: LeagueTierDef | null;
  progressPct: number;
  mmrToNext: number;
} {
  const current = getLeagueByRating(rating);
  const currentIdx = LEAGUE_TIERS.findIndex(l => l.id === current.id);
  const next = currentIdx < LEAGUE_TIERS.length - 1 ? LEAGUE_TIERS[currentIdx + 1] : null;

  if (!next) {
    return {
      currentLeague: current,
      nextLeague: null,
      progressPct: 100,
      mmrToNext: 0
    };
  }

  const range = current.maxMmr - current.minMmr + 1;
  const earned = rating - current.minMmr;
  const progressPct = Math.min(100, Math.max(0, Math.round((earned / range) * 100)));
  const mmrToNext = Math.max(0, next.minMmr - rating);

  return {
    currentLeague: current,
    nextLeague: next,
    progressPct,
    mmrToNext
  };
}

const STORAGE_KEY_LEAGUE_REWARDS = 'sudokumap_league_rewards_v1';

export const LeagueManager = {
  getClaimedSeasonRewards(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LEAGUE_REWARDS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  isSeasonRewardClaimed(seasonId: string, leagueId: LeagueId): boolean {
    const list = this.getClaimedSeasonRewards();
    return list.includes(`${seasonId}_${leagueId}`);
  },

  async claimLeagueSeasonReward(
    seasonId: string,
    playerRating: number
  ): Promise<{ success: boolean; gold: number; crystals: number; league: LeagueTierDef }> {
    const league = getLeagueByRating(playerRating);
    const key = `${seasonId}_${league.id}`;
    const list = this.getClaimedSeasonRewards();

    if (list.includes(key)) {
      return { success: false, gold: 0, crystals: 0, league };
    }

    list.push(key);
    try {
      localStorage.setItem(STORAGE_KEY_LEAGUE_REWARDS, JSON.stringify(list));
    } catch {
      // ignore
    }

    const currentGold = UserManager.getGold();
    await UserManager.updateProgress(UserManager.getCurrentLevel(), currentGold + league.endOfSeasonRewardGold);
    await UserManager.addCrystals(league.endOfSeasonRewardCrystals);

    return {
      success: true,
      gold: league.endOfSeasonRewardGold,
      crystals: league.endOfSeasonRewardCrystals,
      league
    };
  }
};
