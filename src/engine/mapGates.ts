import { SudokuVariant } from './sudoku';
import { getLevelModifierProfile } from './levelModifiers';

export interface MapGateDef {
  gateLevel: number;
  variant: SudokuVariant;
  startLevel: number;
  endLevel: number;
  requiredCrystals: number;
  maxBlockCrystals: number;
  rewardGold: number;
  rewardCrystals: number;
  isRegionVault: boolean;
}

export function getMapGateKey(variant: SudokuVariant, gateLevel: number): string {
  return `${variant}_${gateLevel}`;
}

export function getMapGateDef(gateLevel: number, variant: SudokuVariant = 'classic'): MapGateDef | null {
  if (gateLevel < 10 || gateLevel > 1000 || gateLevel % 10 !== 0) {
    return null;
  }

  const startLevel = gateLevel - 9;
  const endLevel = gateLevel;

  let maxBlockCrystals = 0;
  for (let lvl = startLevel; lvl <= endLevel; lvl++) {
    const profile = getLevelModifierProfile(lvl, variant);
    maxBlockCrystals += profile.maxCollectibleCrystals;
  }

  const requiredCrystals = Math.max(10, Math.round(maxBlockCrystals * 0.6));
  const isRegionVault = gateLevel % 50 === 0;

  const rewardGold = isRegionVault ? 60 : 25;
  const rewardCrystals = isRegionVault ? 3 : 1;

  return {
    gateLevel,
    variant,
    startLevel,
    endLevel,
    requiredCrystals,
    maxBlockCrystals,
    rewardGold,
    rewardCrystals,
    isRegionVault
  };
}
