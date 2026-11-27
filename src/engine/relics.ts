/**
 * SudokuMap - Roguelike Pasif Kalıntı (Relic) Veri Mimarisi ve Envanter Sistemi
 * Oyuncunun bölümlere başlarken donanabildiği, çalışma zamanında benzersiz avantajlar
 * ve meta-ilerleme çarpanları sağlayan pasif kalıntılar.
 */

export type RelicId =
  | 'golden_compass'
  | 'chrono_hourglass'
  | 'mirror_cage'
  | 'ancient_rune_stone'
  | 'scout_mirror';

export interface RelicDef {
  id: RelicId;
  icon: string;
  nameKey: string;
  descKey: string;
  unlockLevel: number;
}

export const RELICS: RelicDef[] = [
  {
    id: 'golden_compass',
    icon: '🧭',
    nameKey: 'relic_golden_compass_name',
    descKey: 'relic_golden_compass_desc',
    unlockLevel: 1
  },
  {
    id: 'chrono_hourglass',
    icon: '⏳',
    nameKey: 'relic_chrono_hourglass_name',
    descKey: 'relic_chrono_hourglass_desc',
    unlockLevel: 5
  },
  {
    id: 'mirror_cage',
    icon: '🪞',
    nameKey: 'relic_mirror_cage_name',
    descKey: 'relic_mirror_cage_desc',
    unlockLevel: 10
  },
  {
    id: 'ancient_rune_stone',
    icon: '🗿',
    nameKey: 'relic_ancient_rune_stone_name',
    descKey: 'relic_ancient_rune_stone_desc',
    unlockLevel: 25
  },
  {
    id: 'scout_mirror',
    icon: '🔭',
    nameKey: 'relic_scout_mirror_name',
    descKey: 'relic_scout_mirror_desc',
    unlockLevel: 50
  }
];

export function getRelicDef(id: RelicId): RelicDef {
  const relic = RELICS.find(r => r.id === id);
  return relic || RELICS[0];
}

export function isRelicUnlocked(id: RelicId, playerLevel: number): boolean {
  const relic = getRelicDef(id);
  return playerLevel >= relic.unlockLevel;
}
