import { menuTemplate } from '../templates/menu';
import { mapTemplate } from '../templates/map';
import { customModeTemplate } from '../templates/custom';
import { leaderboardTemplate } from '../templates/leaderboard';
import { shopTemplate } from '../templates/shop';
import { usernameModalTemplate } from '../templates/usernameModal';
import { achievementsTemplate } from '../templates/achievements';
import { placementModalTemplate } from '../templates/placementModal';
import { profileModalTemplate } from '../templates/profileModal';
import { matchModalTemplate } from '../templates/matchModal';
import { inboxModalTemplate } from '../templates/inboxModal';
import { savedGamesModalTemplate } from '../templates/savedGamesModal';
import { secondChanceModalTemplate } from '../templates/secondChanceModal';
import { onboardingModalTemplate } from '../templates/onboardingModal';
import { academyModalTemplate } from '../templates/academyModal';
import { abilitiesModalTemplate } from '../templates/abilitiesModal';
import { levelPrepModalTemplate } from '../templates/levelPrepModal';
import { crystalRepairModalTemplate } from '../templates/crystalRepairModal';
import { authModalTemplate } from '../templates/authModal';
import { streakModalTemplate } from '../templates/streakModal';
import { abilityDetailModalTemplate } from '../templates/abilityDetailModal';
import { postcardModalTemplate } from '../templates/postcardModal';
import { clanModalTemplate } from '../templates/clanModal';
import { leagueModalTemplate } from '../templates/leagueModal';
import { getLevelModifierProfile, isBranchingLevel } from '../../engine/levelModifiers';
import { getRelicDef } from '../../engine/relics';
import { getMapGateDef } from '../../engine/mapGates';
import { getAmbientBackgroundHTML } from '../../design/backgrounds';
import { Icons, renderAvatarSVG, renderRankBadgeSVG, AVATAR_LIST } from '../../design/icons';
import { t, getLang, translateRankName } from '../../i18n/translations';
import { getLevelConfig, getRegionForLevel } from '../../engine/rhythmConfig';
import { BoardMechanicsState, SpecialCellRuntime } from '../../engine/boardMechanics';
import { getAbilityDef, AbilityId } from '../../engine/abilities';
import { Player, SpeedRecord } from '../../engine/leaderboard';
import { ShopItems, ShopManager } from '../../engine/shop';
import { BadgeStatus } from '../../engine/achievements';
import { ProfileStats, UserManager } from '../../store/userState';
import { ChallengeRequest } from '../../engine/matchEngine';
import { BotCharacter } from '../../engine/botData';
import { SudokuVariant, KillerCage, SudokuGen } from '../../engine/sudoku';
import { SamuraiViewport, renderSamuraiBoard, SamuraiBoardData } from '../samuraiViewport';
import { SoundManager } from '../../engine/soundManager';
import { escapeHTML, formatDisplayName } from '../../utils/sanitize';
import { SavedGameRecord } from '../types';

export const utilsUI = {
  getVariantEmblemSVG(variant: SudokuVariant = 'classic', size: number = 22): string {
    if (variant === 'irregular') {
      return `<svg class="inline-block" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4zM10 10h6v6h-6zM14 4h6v6h-6zM4 14h6v6H4z"/></svg>`;
    }
    if (variant === 'killer') {
      return `<svg class="inline-block" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-dasharray="2 2" d="M3 3h18v18H3z"/><path d="M7 7h10L10 12l7 5H7"/></svg>`;
    }
    if (variant === 'wordoku') {
      return `<svg class="inline-block" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7l-4 10h8M9 13h6"/></svg>`;
    }
    if (variant === 'samurai') {
      return `<svg class="inline-block" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="1"/><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/></svg>`;
    }
    return `<svg class="inline-block" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`;
  }
};
