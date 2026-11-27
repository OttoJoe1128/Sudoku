/**
 * SudokuMap - 14 Günlük Sezonluk Canlı Operasyon Motoru & Tematik Pul Koleksiyonu
 * Sezonluk rotasyon, pul toplama, kartpostal tamamlama ve tematik ödül sistemi.
 */

import { ShopManager } from './shop';
import { UserManager } from '../store/userState';

export type SeasonId =
  | 'ancient_egypt'
  | 'cyber_metropolis'
  | 'emerald_grove'
  | 'celestial_temple';

export interface SeasonDef {
  id: SeasonId;
  index: number;
  nameKey: string;
  descKey: string;
  themeId: string;
  totalStamps: number;
  rewardGold: number;
  rewardCrystals: number;
  artworkColors: string[];
}

export const SEASONS: SeasonDef[] = [
  {
    id: 'ancient_egypt',
    index: 0,
    nameKey: 'season_egypt_name',
    descKey: 'season_egypt_desc',
    themeId: 'theme-egypt',
    totalStamps: 9,
    rewardGold: 150,
    rewardCrystals: 20,
    artworkColors: ['#B45309', '#D97706', '#F59E0B', '#FBBF24', '#FDE68A', '#78350F', '#92400E', '#F59E0B', '#B45309']
  },
  {
    id: 'cyber_metropolis',
    index: 1,
    nameKey: 'season_cyber_name',
    descKey: 'season_cyber_desc',
    themeId: 'theme-cyber',
    totalStamps: 9,
    rewardGold: 150,
    rewardCrystals: 20,
    artworkColors: ['#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#06B6D4']
  },
  {
    id: 'emerald_grove',
    index: 2,
    nameKey: 'season_emerald_name',
    descKey: 'season_emerald_desc',
    themeId: 'theme-jade',
    totalStamps: 9,
    rewardGold: 150,
    rewardCrystals: 20,
    artworkColors: ['#047857', '#059669', '#10B981', '#34D399', '#6EE7B7', '#065F46', '#047857', '#10B981', '#059669']
  },
  {
    id: 'celestial_temple',
    index: 3,
    nameKey: 'season_celestial_name',
    descKey: 'season_celestial_desc',
    themeId: 'theme-shogun',
    totalStamps: 9,
    rewardGold: 150,
    rewardCrystals: 20,
    artworkColors: ['#991B1B', '#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#7F1D1D', '#B91C1C', '#EF4444', '#DC2626']
  }
];

export const SEASON_CYCLE_DAYS = 14;
const MS_PER_DAY = 86400 * 1000;

export function getCurrentSeason(nowMs: number = Date.now()): SeasonDef {
  const period = Math.floor(nowMs / (SEASON_CYCLE_DAYS * MS_PER_DAY));
  const seasonIndex = Math.abs(period % SEASONS.length);
  return SEASONS[seasonIndex];
}

export function getRemainingSeasonDays(nowMs: number = Date.now()): number {
  const currentPeriodMs = nowMs % (SEASON_CYCLE_DAYS * MS_PER_DAY);
  const remainingMs = (SEASON_CYCLE_DAYS * MS_PER_DAY) - currentPeriodMs;
  return Math.max(1, Math.ceil(remainingMs / MS_PER_DAY));
}

export const SeasonalEventManager = {
  getCollectedStamps(seasonId: SeasonId): number[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`sudoku_season_stamps_${seasonId}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  awardRandomStamp(seasonId: SeasonId): { newStampIndex: number; isCompleted: boolean; isAlreadyHad: boolean } {
    const collected = this.getCollectedStamps(seasonId);
    if (collected.length >= 9) {
      return { newStampIndex: -1, isCompleted: true, isAlreadyHad: true };
    }

    // Henüz toplanmamış pulları belirle
    const uncollected: number[] = [];
    for (let i = 0; i < 9; i++) {
      if (!collected.includes(i)) {
        uncollected.push(i);
      }
    }

    if (uncollected.length === 0) {
      return { newStampIndex: -1, isCompleted: true, isAlreadyHad: true };
    }

    const randomIndex = uncollected[Math.floor(Math.random() * uncollected.length)];
    collected.push(randomIndex);
    collected.sort((a, b) => a - b);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`sudoku_season_stamps_${seasonId}`, JSON.stringify(collected));
    }

    const isCompleted = collected.length === 9;
    return { newStampIndex: randomIndex, isCompleted, isAlreadyHad: false };
  },

  isPostcardCompleted(seasonId: SeasonId): boolean {
    return this.getCollectedStamps(seasonId).length >= 9;
  },

  isRewardClaimed(seasonId: SeasonId): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(`sudoku_season_claimed_${seasonId}`) === 'true';
  },

  async claimSeasonReward(seasonId: SeasonId): Promise<{ success: boolean; gold: number; crystals: number }> {
    if (!this.isPostcardCompleted(seasonId)) {
      return { success: false, gold: 0, crystals: 0 };
    }
    if (this.isRewardClaimed(seasonId)) {
      return { success: false, gold: 0, crystals: 0 };
    }

    const season = SEASONS.find(s => s.id === seasonId) || SEASONS[0];
    localStorage.setItem(`sudoku_season_claimed_${seasonId}`, 'true');

    // Ödülleri ver
    await UserManager.updateProgress(UserManager.getCurrentLevel(), UserManager.getGold() + season.rewardGold);
    await UserManager.addCrystals(season.rewardCrystals);

    // Temayı aç
    ShopManager.unlockTheme(season.themeId);

    return { success: true, gold: season.rewardGold, crystals: season.rewardCrystals };
  }
};
