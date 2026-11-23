import { BiomeId, REGIONS, getRegionForLevel } from './rhythmConfig';

export interface AcademyDiagramCell {
  value: string;
  role: 'given' | 'highlight' | 'target' | 'eliminated' | 'empty';
}

export interface AcademyLesson {
  regionId: number;
  techniqueId: string;
  biome: BiomeId;
  difficulty: 'basit' | 'orta' | 'zor';
  unlockLevel: number;
  diagramCells: AcademyDiagramCell[];
}

const SEEN_ACADEMY_KEY = 'sudokumap_seen_academy_regions';

export const ACADEMY_LESSONS: AcademyLesson[] = [
  // 1. row_col_scan (Region 1, Level 1)
  {
    regionId: 1, techniqueId: 'row_col_scan', biome: 'emerald', difficulty: 'basit', unlockLevel: 1,
    diagramCells: [
      { value: '1', role: 'given' }, { value: '2', role: 'given' }, { value: '3', role: 'given' },
      { value: '4', role: 'given' }, { value: '9', role: 'target' }, { value: '6', role: 'given' },
      { value: '7', role: 'given' }, { value: '8', role: 'given' }, { value: '5', role: 'given' }
    ]
  },
  // 2. box_elimination (Region 2, Level 51)
  {
    regionId: 2, techniqueId: 'box_elimination', biome: 'emerald', difficulty: 'basit', unlockLevel: 51,
    diagramCells: [
      { value: '4', role: 'given' }, { value: '8', role: 'highlight' }, { value: '2', role: 'given' },
      { value: '', role: 'empty' }, { value: '7', role: 'target' }, { value: '', role: 'empty' },
      { value: '3', role: 'given' }, { value: '1', role: 'given' }, { value: '6', role: 'given' }
    ]
  },
  // 3. naked_single (Region 3, Level 101)
  {
    regionId: 3, techniqueId: 'naked_single', biome: 'emerald', difficulty: 'basit', unlockLevel: 101,
    diagramCells: [
      { value: '1', role: 'given' }, { value: '2', role: 'given' }, { value: '3', role: 'given' },
      { value: '4', role: 'given' }, { value: '5', role: 'given' }, { value: '6', role: 'given' },
      { value: '7', role: 'given' }, { value: '8', role: 'given' }, { value: '9', role: 'target' }
    ]
  },
  // 4. hidden_single (Region 4, Level 151)
  {
    regionId: 4, techniqueId: 'hidden_single', biome: 'emerald', difficulty: 'basit', unlockLevel: 151,
    diagramCells: [
      { value: '', role: 'empty' }, { value: '3', role: 'highlight' }, { value: '', role: 'empty' },
      { value: '', role: 'empty' }, { value: '3', role: 'target' }, { value: '', role: 'empty' },
      { value: '5', role: 'given' }, { value: '8', role: 'given' }, { value: '1', role: 'given' }
    ]
  },
  // 5. pencil_marks (Region 5, Level 201)
  {
    regionId: 5, techniqueId: 'pencil_marks', biome: 'emerald', difficulty: 'basit', unlockLevel: 201,
    diagramCells: [
      { value: '1,4', role: 'highlight' }, { value: '2', role: 'given' }, { value: '3', role: 'given' },
      { value: '5', role: 'given' }, { value: '4', role: 'target' }, { value: '7', role: 'given' },
      { value: '8', role: 'given' }, { value: '9', role: 'given' }, { value: '6', role: 'given' }
    ]
  },
  // 6. crosshatching (Region 6, Level 251)
  {
    regionId: 6, techniqueId: 'crosshatching', biome: 'emerald', difficulty: 'basit', unlockLevel: 251,
    diagramCells: [
      { value: 'X', role: 'eliminated' }, { value: 'X', role: 'eliminated' }, { value: '5', role: 'highlight' },
      { value: 'X', role: 'eliminated' }, { value: '5', role: 'target' }, { value: 'X', role: 'eliminated' },
      { value: '5', role: 'highlight' }, { value: 'X', role: 'eliminated' }, { value: 'X', role: 'eliminated' }
    ]
  },
  // 7. pointing_pairs (Region 7, Level 301)
  {
    regionId: 7, techniqueId: 'pointing_pairs', biome: 'hextech', difficulty: 'orta', unlockLevel: 301,
    diagramCells: [
      { value: '2,7', role: 'highlight' }, { value: '2,7', role: 'highlight' }, { value: 'X', role: 'eliminated' },
      { value: '3', role: 'given' }, { value: '5', role: 'given' }, { value: '2', role: 'target' },
      { value: '8', role: 'given' }, { value: '9', role: 'given' }, { value: '1', role: 'given' }
    ]
  },
  // 8. box_line_reduction (Region 8, Level 351)
  {
    regionId: 8, techniqueId: 'box_line_reduction', biome: 'hextech', difficulty: 'orta', unlockLevel: 351,
    diagramCells: [
      { value: '4', role: 'highlight' }, { value: 'X', role: 'eliminated' }, { value: 'X', role: 'eliminated' },
      { value: '4', role: 'highlight' }, { value: '6', role: 'target' }, { value: '2', role: 'given' },
      { value: '1', role: 'given' }, { value: '8', role: 'given' }, { value: '9', role: 'given' }
    ]
  },
  // 9. naked_pairs (Region 9, Level 401)
  {
    regionId: 9, techniqueId: 'naked_pairs', biome: 'hextech', difficulty: 'orta', unlockLevel: 401,
    diagramCells: [
      { value: '3,8', role: 'highlight' }, { value: '3,8', role: 'highlight' }, { value: 'X', role: 'eliminated' },
      { value: '1', role: 'given' }, { value: '5', role: 'given' }, { value: '3', role: 'target' },
      { value: '6', role: 'given' }, { value: '7', role: 'given' }, { value: '9', role: 'given' }
    ]
  },
  // 10. hidden_pairs (Region 10, Level 451)
  {
    regionId: 10, techniqueId: 'hidden_pairs', biome: 'hextech', difficulty: 'orta', unlockLevel: 451,
    diagramCells: [
      { value: '1,6', role: 'highlight' }, { value: '1,6', role: 'highlight' }, { value: 'X', role: 'eliminated' },
      { value: '2', role: 'given' }, { value: '6', role: 'target' }, { value: '4', role: 'given' },
      { value: '8', role: 'given' }, { value: '9', role: 'given' }, { value: '5', role: 'given' }
    ]
  },
  // 11. naked_triples (Region 11, Level 501)
  {
    regionId: 11, techniqueId: 'naked_triples', biome: 'hextech', difficulty: 'orta', unlockLevel: 501,
    diagramCells: [
      { value: '1,2', role: 'highlight' }, { value: '2,3', role: 'highlight' }, { value: '1,3', role: 'highlight' },
      { value: 'X', role: 'eliminated' }, { value: '2', role: 'target' }, { value: '5', role: 'given' },
      { value: '6', role: 'given' }, { value: '7', role: 'given' }, { value: '8', role: 'given' }
    ]
  },
  // 12. hidden_triples (Region 12, Level 551)
  {
    regionId: 12, techniqueId: 'hidden_triples', biome: 'hextech', difficulty: 'orta', unlockLevel: 551,
    diagramCells: [
      { value: '4,7,9', role: 'highlight' }, { value: '4,7', role: 'highlight' }, { value: '7,9', role: 'highlight' },
      { value: 'X', role: 'eliminated' }, { value: '7', role: 'target' }, { value: '1', role: 'given' },
      { value: '2', role: 'given' }, { value: '3', role: 'given' }, { value: '5', role: 'given' }
    ]
  },
  // 13. locked_candidates (Region 13, Level 601)
  {
    regionId: 13, techniqueId: 'locked_candidates', biome: 'hextech', difficulty: 'orta', unlockLevel: 601,
    diagramCells: [
      { value: '5', role: 'highlight' }, { value: '5', role: 'highlight' }, { value: 'X', role: 'eliminated' },
      { value: '2', role: 'given' }, { value: '5', role: 'target' }, { value: '8', role: 'given' },
      { value: '1', role: 'given' }, { value: '3', role: 'given' }, { value: '9', role: 'given' }
    ]
  },
  // 14. skyscraper (Region 14, Level 651)
  {
    regionId: 14, techniqueId: 'skyscraper', biome: 'hextech', difficulty: 'orta', unlockLevel: 651,
    diagramCells: [
      { value: '9', role: 'highlight' }, { value: 'X', role: 'eliminated' }, { value: '9', role: 'highlight' },
      { value: '9', role: 'highlight' }, { value: '9', role: 'target' }, { value: '9', role: 'highlight' },
      { value: '1', role: 'given' }, { value: '4', role: 'given' }, { value: '6', role: 'given' }
    ]
  },
  // 15. x_wing (Region 15, Level 701)
  {
    regionId: 15, techniqueId: 'x_wing', biome: 'crimson', difficulty: 'zor', unlockLevel: 701,
    diagramCells: [
      { value: '7', role: 'highlight' }, { value: 'X', role: 'eliminated' }, { value: '7', role: 'highlight' },
      { value: 'X', role: 'eliminated' }, { value: '7', role: 'target' }, { value: 'X', role: 'eliminated' },
      { value: '7', role: 'highlight' }, { value: 'X', role: 'eliminated' }, { value: '7', role: 'highlight' }
    ]
  },
  // 16. y_wing (Region 16, Level 751)
  {
    regionId: 16, techniqueId: 'y_wing', biome: 'crimson', difficulty: 'zor', unlockLevel: 751,
    diagramCells: [
      { value: 'AB', role: 'highlight' }, { value: 'BC', role: 'highlight' }, { value: 'AC', role: 'highlight' },
      { value: 'X', role: 'eliminated' }, { value: 'C', role: 'target' }, { value: 'X', role: 'eliminated' },
      { value: '1', role: 'given' }, { value: '5', role: 'given' }, { value: '8', role: 'given' }
    ]
  },
  // 17. swordfish (Region 17, Level 801)
  {
    regionId: 17, techniqueId: 'swordfish', biome: 'crimson', difficulty: 'zor', unlockLevel: 801,
    diagramCells: [
      { value: '6', role: 'highlight' }, { value: 'X', role: 'eliminated' }, { value: '6', role: 'highlight' },
      { value: '6', role: 'highlight' }, { value: '6', role: 'target' }, { value: '6', role: 'highlight' },
      { value: '6', role: 'highlight' }, { value: 'X', role: 'eliminated' }, { value: '6', role: 'highlight' }
    ]
  },
  // 18. xy_chain (Region 18, Level 851)
  {
    regionId: 18, techniqueId: 'xy_chain', biome: 'crimson', difficulty: 'zor', unlockLevel: 851,
    diagramCells: [
      { value: '1,2', role: 'highlight' }, { value: '2,8', role: 'highlight' }, { value: '8,4', role: 'highlight' },
      { value: 'X', role: 'eliminated' }, { value: '4', role: 'target' }, { value: 'X', role: 'eliminated' },
      { value: '3', role: 'given' }, { value: '7', role: 'given' }, { value: '9', role: 'given' }
    ]
  },
  // 19. unique_rectangle (Region 19, Level 901)
  {
    regionId: 19, techniqueId: 'unique_rectangle', biome: 'crimson', difficulty: 'zor', unlockLevel: 901,
    diagramCells: [
      { value: '5,9', role: 'highlight' }, { value: '5,9', role: 'highlight' }, { value: 'X', role: 'eliminated' },
      { value: '5,9', role: 'highlight' }, { value: '5,9,3', role: 'highlight' }, { value: '3', role: 'target' },
      { value: '1', role: 'given' }, { value: '4', role: 'given' }, { value: '6', role: 'given' }
    ]
  },
  // 20. grandmaster_synthesis (Region 20, Level 951)
  {
    regionId: 20, techniqueId: 'grandmaster_synthesis', biome: 'crimson', difficulty: 'zor', unlockLevel: 951,
    diagramCells: [
      { value: '⚡', role: 'highlight' }, { value: '⚡', role: 'highlight' }, { value: '⚡', role: 'highlight' },
      { value: '⚡', role: 'highlight' }, { value: '🏆', role: 'target' }, { value: '⚡', role: 'highlight' },
      { value: '⚡', role: 'highlight' }, { value: '⚡', role: 'highlight' }, { value: '⚡', role: 'highlight' }
    ]
  }
];

export function getAcademyLessonForRegion(regionId: number): AcademyLesson {
  const clamped = Math.max(1, Math.min(20, regionId));
  const lesson = ACADEMY_LESSONS.find(l => l.regionId === clamped);
  return lesson || ACADEMY_LESSONS[0];
}

export function getAcademyLessonForLevel(level: number): AcademyLesson {
  const region = getRegionForLevel(level);
  return getAcademyLessonForRegion(region.id);
}

export function isLessonUnlocked(lesson: AcademyLesson, maxUnlockedLevel: number): boolean {
  return maxUnlockedLevel >= lesson.unlockLevel;
}

export function getSeenAcademyRegions(): number[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(SEEN_ACADEMY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function hasSeenRegionLesson(regionId: number): boolean {
  return getSeenAcademyRegions().includes(regionId);
}

export function markRegionLessonSeen(regionId: number): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const seen = new Set(getSeenAcademyRegions());
    seen.add(regionId);
    localStorage.setItem(SEEN_ACADEMY_KEY, JSON.stringify(Array.from(seen)));
  } catch {
    // ignore
  }
}

export function shouldAutoShowRegionLesson(level: number): AcademyLesson | null {
  const region = getRegionForLevel(level);
  if (level === region.startLevel && !hasSeenRegionLesson(region.id)) {
    return getAcademyLessonForRegion(region.id);
  }
  return null;
}
