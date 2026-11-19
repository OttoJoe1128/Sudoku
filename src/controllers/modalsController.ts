import { SudokuVariant } from '../engine/sudoku';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { ShopManager } from '../engine/shop';
import { AchievementManager } from '../engine/achievements';
import { Leaderboard } from '../engine/leaderboard';
import { Rewards } from '../engine/rewards';
import { MatchEngine, ChallengeRequest } from '../engine/matchEngine';
import { renderAvatarSVG } from '../design/icons';
import { t } from '../i18n/translations';

let selectedCustomVariant: SudokuVariant = 'classic';
let selectedCustomTimeSec: number = 0;

let currentLeaderboardType: 'level' | 'gold' | 'pvp_mmr' | 'bot_mmr' | 'speed' | 'discipline' = 'level';
let currentLeaderboardVariant: SudokuVariant = 'classic';

let currentlyViewedTargetUsername: string = '';
let currentlyViewedTargetUid: string = '';

export function getSelectedCustomVariant(): SudokuVariant {
  return selectedCustomVariant;
}

export function getSelectedCustomTimeSec(): number {
  return selectedCustomTimeSec;
}

export async function openPlayerProfile(targetData?: any): Promise<void> {
  const currentUsername = UserManager.getUsername();

  let isOwn = true;
  let stats;

  if (!targetData || targetData.username === currentUsername) {
    stats = await UserManager.getUserProfileStats();
    isOwn = true;
  } else {
    currentlyViewedTargetUid = targetData.uid || targetData.username || 'target';
    currentlyViewedTargetUsername = targetData.username || 'Oyuncu';
    stats = await UserManager.getUserProfileStats(currentlyViewedTargetUid);
    stats.username = currentlyViewedTargetUsername;
    stats.avatar = targetData.avatar || stats.avatar || 'av_prism';
    isOwn = false;
  }

  const badges = AchievementManager.getAllBadgesWithStatus(stats.level, stats.gold, stats.totalCompleted);
  UIManager.renderProfileModal(stats, badges, isOwn);

  if (isOwn) {
    document.querySelectorAll('.avatar-option-btn').forEach(btn => {
      (btn as HTMLElement).onclick = async (e: Event) => {
        const newAvatar = (e.currentTarget as HTMLElement).getAttribute('data-avatar');
        if (newAvatar) {
          await UserManager.updateProfileCustomization(newAvatar, UserManager.getTitle());
          const avatarBox = document.getElementById('menu-avatar-box');
          if (avatarBox) avatarBox.innerHTML = renderAvatarSVG(newAvatar, 28);
          UIManager.showToast("Avatar güncellendi!", "success");
          openPlayerProfile();
        }
      };
    });
  }
}

export function updateBadgeNotificationDot(unclaimedCount: number): void {
  const dot = document.getElementById('badge-notify-dot');
  if (dot) {
    if (unclaimedCount > 0) dot.classList.remove('hidden');
    else dot.classList.add('hidden');
  }
}

export const loadLeaderboardData = async () => {
  if (currentLeaderboardType === 'speed') {
    const records = await Leaderboard.fetchFastestRecords('all');
    UIManager.renderLeaderboard(records, 'speed', (p) => openPlayerProfile(p), currentLeaderboardVariant);
  } else if (currentLeaderboardType === 'discipline') {
    const players = await Leaderboard.fetchTopPlayers('level');
    players.sort((a, b) => {
      const scoreA = a.variantScores ? a.variantScores[currentLeaderboardVariant] || 0 : 0;
      const scoreB = b.variantScores ? b.variantScores[currentLeaderboardVariant] || 0 : 0;
      return scoreB - scoreA;
    });
    UIManager.renderLeaderboard(players, 'discipline', (p) => openPlayerProfile(p), currentLeaderboardVariant);
  } else {
    const players = await Leaderboard.fetchTopPlayers(currentLeaderboardType);
    UIManager.renderLeaderboard(players, currentLeaderboardType, (p) => openPlayerProfile(p), currentLeaderboardVariant);
  }
};

export function setupCustomTimeButtons(): void {
  const btnNoLimit = document.getElementById('btn-custom-time-no-limit');
  const btn7m = document.getElementById('btn-custom-time-7m');
  const btn3m = document.getElementById('btn-custom-time-3m');

  const updateBtns = (sec: number) => {
    selectedCustomTimeSec = sec;
    [btnNoLimit, btn7m, btn3m].forEach(b => {
      if (!b) return;
      const bSec = parseInt(b.getAttribute('data-time') || '0');
      if (bSec === sec) {
        b.className = "custom-time-btn flex-1 py-1.5 rounded-xl font-black text-[10px] transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex items-center justify-center gap-1";
      } else {
        b.className = "custom-time-btn flex-1 py-1.5 rounded-xl font-bold text-[10px] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent flex items-center justify-center gap-1";
      }
    });

    const mult = sec === 180 ? 1.5 : 1.0;
    const b1 = document.getElementById('badge-custom-basit-reward');
    const b2 = document.getElementById('badge-custom-orta-reward');
    const b3 = document.getElementById('badge-custom-zor-reward');
    if (b1) b1.innerText = `+${Math.round(10 * mult)} ${t('label_gold')}`;
    if (b2) b2.innerText = `+${Math.round(20 * mult)} ${t('label_gold')}`;
    if (b3) b3.innerText = `+${Math.round(35 * mult)} ${t('label_gold')}`;
  };

  btnNoLimit?.addEventListener('click', () => updateBtns(0));
  btn7m?.addEventListener('click', () => updateBtns(420));
  btn3m?.addEventListener('click', () => updateBtns(180));
}

export function initModalsController(callbacks: {
  onStartCustomGame: (level: number, diff: 'basit' | 'orta' | 'zor', variant: SudokuVariant, timeLimitSec: number) => void;
  onStartPlacementExam: (diff: 'basit' | 'orta' | 'zor') => void;
  onStartLevelDirect: (level: number, diff: 'basit' | 'orta' | 'zor') => void;
  onUpdateGoldDisplay: () => void;
  onUpdateSavedGamesUI: () => void;
  onTriggerExpertBotMatch: () => void;
  getSelectedArenaVariant: () => SudokuVariant;
  getRuleDescription: (variant: SudokuVariant) => string;
  onHandleIncomingChallenge: (chal: ChallengeRequest) => void;
}): void {
  const {
    onStartCustomGame,
    onStartPlacementExam,
    onStartLevelDirect,
    onUpdateGoldDisplay,
    onUpdateSavedGamesUI,
    onTriggerExpertBotMatch,
    getSelectedArenaVariant,
    getRuleDescription,
    onHandleIncomingChallenge
  } = callbacks;

  // 1. Serbest Mod
  document.getElementById('btn-new-game')?.addEventListener('click', () => {
    UIManager.navigate('custom');
  });

  document.getElementById('btn-back-custom')?.addEventListener('click', () => {
    onUpdateSavedGamesUI();
    UIManager.navigate('menu');
  });

  (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(v => {
    document.getElementById(`btn-variant-${v}`)?.addEventListener('click', () => {
      selectedCustomVariant = v;
      (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(other => {
        const btn = document.getElementById(`btn-variant-${other}`);
        if (btn) {
          if (other === v) {
            btn.className = "custom-variant-btn p-2 rounded-xl bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";
          } else {
            btn.className = "custom-variant-btn p-2 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";
          }
        }
      });

      const badge = document.getElementById('custom-variant-multiplier-badge');
      const descEl = document.getElementById('custom-variant-rule-desc');
      const mults: Record<SudokuVariant, string> = { classic: '1.0x', wordoku: '1.2x', irregular: '1.5x', killer: '1.8x', samurai: '2.5x' };
      if (badge) badge.innerText = t('pts_multiplier', { mult: mults[v] || '1.0x' });
      if (descEl) descEl.innerText = getRuleDescription(v);
    });
  });

  setupCustomTimeButtons();

  document.getElementById('btn-custom-basit')?.addEventListener('click', () => {
    const userLvl = UserManager.getVariantLevel(selectedCustomVariant);
    onStartCustomGame(userLvl, 'basit', selectedCustomVariant, selectedCustomTimeSec);
  });

  document.getElementById('btn-custom-orta')?.addEventListener('click', () => {
    const userLvl = Math.max(301, UserManager.getVariantLevel(selectedCustomVariant));
    onStartCustomGame(userLvl, 'orta', selectedCustomVariant, selectedCustomTimeSec);
  });

  document.getElementById('btn-custom-zor')?.addEventListener('click', () => {
    const userLvl = Math.max(701, UserManager.getVariantLevel(selectedCustomVariant));
    onStartCustomGame(userLvl, 'zor', selectedCustomVariant, selectedCustomTimeSec);
  });

  document.getElementById('btn-custom-info')?.addEventListener('click', () => {
    UIManager.showRulesAndScoringModal('custom');
  });

  document.getElementById('btn-arena-info')?.addEventListener('click', () => {
    UIManager.showRulesAndScoringModal('arena');
  });

  // 2. Profil Modalı
  document.getElementById('btn-open-profile')?.addEventListener('click', async () => {
    openPlayerProfile();
  });

  document.getElementById('close-profile')?.addEventListener('click', () => {
    UIManager.toggleModal('view-profile', false);
  });

  document.getElementById('btn-profile-edit-name')?.addEventListener('click', () => {
    UIManager.toggleModal('view-profile', false);
    const input = document.getElementById('username-input') as HTMLInputElement;
    const closeBtn = document.getElementById('close-username-modal');
    if (input) input.value = UserManager.getUsername() || '';
    if (closeBtn) closeBtn.classList.remove('hidden');
    UIManager.toggleModal('username-modal', true);
  });

  document.getElementById('btn-profile-open-achievements')?.addEventListener('click', () => {
    UIManager.toggleModal('view-profile', false);
    document.getElementById('btn-achievements')?.click();
  });

  document.getElementById('toggle-notifications')?.addEventListener('change', async (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          UserManager.saveNotificationsEnabled(true);
          UIManager.showToast('🔔 Canlı düello bildirimleri açıldı!', 'success');
          MatchEngine.listenIncomingChallenges((chal) => onHandleIncomingChallenge(chal));
        } else {
          (e.target as HTMLInputElement).checked = false;
          UserManager.saveNotificationsEnabled(false);
          UIManager.showToast('⚠️ Bildirim izni verilmedi.', 'error');
        }
      } else {
        UserManager.saveNotificationsEnabled(true);
        UIManager.showToast('🔔 Düello bildirimleri aktif!', 'success');
      }
    } else {
      UserManager.saveNotificationsEnabled(false);
      UIManager.showToast('🔕 Bildirimler kapatıldı.', 'info');
    }
  });

  document.getElementById('btn-challenge-player')?.addEventListener('click', () => {
    const targetUsername = currentlyViewedTargetUsername || document.getElementById('profile-username')?.innerText || 'Oyuncu';
    const targetUid = currentlyViewedTargetUid || targetUsername;

    if (!targetUid || targetUsername === UserManager.getUsername()) {
      return UIManager.showToast("Kendi profilinize davet gönderemezsiniz.", "info");
    }

    UIManager.renderChallengeDurationSelectModal(targetUsername, async (durationSec) => {
      try {
        const arenaVariant = getSelectedArenaVariant();
        await MatchEngine.sendDirectChallenge(targetUid, targetUsername, 'basit', durationSec, arenaVariant);
        const modeText = durationSec > 0 ? `${Math.floor(durationSec / 60)} Dk` : 'Süresiz';
        UIManager.showToast(`⚔️ Düello daveti (${modeText}) ${targetUsername} adlı oyuncunun gelen kutusuna gönderildi!`, 'success');
        UIManager.toggleModal('view-profile', false);
      } catch (e: any) {
        console.warn("Düello davet gönderme yetki hatası:", e);
        UIManager.toggleModal('view-profile', false);

        UIManager.renderBotFallbackPromptModal(
          () => {
            onTriggerExpertBotMatch();
          },
          () => {
            UIManager.navigate('menu');
          }
        );
      }
    });
  });

  // 3. Liderlik Tablosu
  document.getElementById('btn-leaderboard')?.addEventListener('click', async () => {
    UIManager.toggleModal('view-leaderboard', true);
    loadLeaderboardData();
  });

  document.getElementById('close-leaderboard')?.addEventListener('click', () => {
    UIManager.toggleModal('view-leaderboard', false);
  });

  document.getElementById('refresh-leaderboard')?.addEventListener('click', () => {
    loadLeaderboardData();
  });

  document.getElementById('btn-tab-gold')?.addEventListener('click', () => {
    currentLeaderboardType = 'level';
    document.getElementById('general-sort-filters')?.classList.remove('hidden');
    document.getElementById('general-sort-filters')?.classList.add('grid');
    document.getElementById('speed-diff-filters')?.classList.add('hidden');
    document.getElementById('speed-diff-filters')?.classList.remove('flex');

    const tabGold = document.getElementById('btn-tab-gold');
    const tabSpeed = document.getElementById('btn-tab-speed');
    if (tabGold) tabGold.className = "flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm";
    if (tabSpeed) tabSpeed.className = "flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent bg-transparent";
    loadLeaderboardData();
  });

  document.getElementById('btn-tab-speed')?.addEventListener('click', async () => {
    currentLeaderboardType = 'speed';
    document.getElementById('general-sort-filters')?.classList.add('hidden');
    document.getElementById('general-sort-filters')?.classList.remove('grid');
    document.getElementById('speed-diff-filters')?.classList.remove('hidden');
    document.getElementById('speed-diff-filters')?.classList.add('flex');

    const tabGold = document.getElementById('btn-tab-gold');
    const tabSpeed = document.getElementById('btn-tab-speed');
    if (tabSpeed) tabSpeed.className = "flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm";
    if (tabGold) tabGold.className = "flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent bg-transparent";
    loadLeaderboardData();
  });

  const updateSortFilterBtns = (activeSort: 'level' | 'gold' | 'pvp_mmr' | 'bot_mmr') => {
    currentLeaderboardType = activeSort;
    const sortBtns = {
      level: document.getElementById('btn-sort-level'),
      gold: document.getElementById('btn-sort-gold'),
      pvp_mmr: document.getElementById('btn-sort-pvp-mmr'),
      bot_mmr: document.getElementById('btn-sort-bot-mmr')
    };

    Object.entries(sortBtns).forEach(([key, btn]) => {
      if (!btn) return;
      if (key === activeSort) {
        btn.className = "py-1.5 text-[10px] font-black rounded-xl bg-[var(--accent-gold)] text-[var(--text-on-gold)] shadow-sm flex items-center justify-center gap-1";
      } else {
        btn.className = "py-1.5 text-[10px] font-bold rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center gap-1";
      }
    });

    loadLeaderboardData();
  };

  document.getElementById('btn-sort-level')?.addEventListener('click', () => updateSortFilterBtns('level'));
  document.getElementById('btn-sort-gold')?.addEventListener('click', () => updateSortFilterBtns('gold'));
  document.getElementById('btn-sort-pvp-mmr')?.addEventListener('click', () => updateSortFilterBtns('pvp_mmr'));
  document.getElementById('btn-sort-bot-mmr')?.addEventListener('click', () => updateSortFilterBtns('bot_mmr'));

  document.querySelectorAll('.speed-filter-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const diff = target.getAttribute('data-diff') as any;

      document.querySelectorAll('.speed-filter-btn').forEach(other => {
        if (other === target) {
          other.className = "speed-filter-btn flex-1 py-1 text-[11px] font-black rounded-lg bg-[var(--accent-gold)] text-[var(--text-on-gold)] shadow-sm";
        } else {
          other.className = "speed-filter-btn flex-1 py-1 text-[11px] font-bold rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]";
        }
      });

      const records = await Leaderboard.fetchFastestRecords(diff || 'all');
      UIManager.renderLeaderboard(records, 'speed', (p) => openPlayerProfile(p), currentLeaderboardVariant);
    });
  });

  // 4. Mağaza Modalı
  const openAndRenderShop = () => {
    UIManager.renderShop(async (itemId) => {
      const result = await ShopManager.buyItem(itemId);
      UIManager.showToast(result.msg, result.success ? "success" : "error");
      if (result.success) {
        onUpdateGoldDisplay();
        UIManager.applyTheme(ShopManager.getActiveTheme());
        openAndRenderShop();
      }
    });
  };

  document.getElementById('btn-shop')?.addEventListener('click', () => {
    UIManager.toggleModal('view-shop', true);
    openAndRenderShop();
  });

  document.getElementById('close-shop')?.addEventListener('click', () => {
    UIManager.toggleModal('view-shop', false);
  });

  // 5. Rozetler / Başarımlar Modalı
  const openAndRenderAchievements = () => {
    const badges = AchievementManager.getAllBadgesWithStatus(
      UserManager.getCurrentLevel(),
      UserManager.getGold()
    );

    const unclaimedCount = badges.filter(b => b.isUnlocked && !b.isClaimed).length;
    updateBadgeNotificationDot(unclaimedCount);

    UIManager.renderAchievements(badges, async (badgeId) => {
      const claimResult = AchievementManager.claimBadgeReward(badgeId);
      UIManager.showToast(claimResult.message, claimResult.success ? "success" : "info");
      if (claimResult.success) {
        const newGold = UserManager.getGold() + claimResult.goldAdded;
        await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
        onUpdateGoldDisplay();
        openAndRenderAchievements();
      }
    });
  };

  document.getElementById('btn-achievements')?.addEventListener('click', () => {
    UIManager.toggleModal('view-achievements', true);
    openAndRenderAchievements();
  });

  document.getElementById('close-achievements')?.addEventListener('click', () => {
    UIManager.toggleModal('view-achievements', false);
  });

  // 6. Günlük Ödül
  document.getElementById('btn-daily-reward')?.addEventListener('click', async () => {
    const result = await Rewards.claimReward();
    UIManager.showToast(result.message, result.success ? "success" : "info");
    if (result.success) {
      onUpdateGoldDisplay();
      AchievementManager.checkAndUnlockBadges({
        level: UserManager.getCurrentLevel(),
        gold: UserManager.getGold(),
        dailyClaimed: true
      });
    }
  });

  // 7. Seviye Atlama Sınavı
  document.getElementById('btn-open-placement-test')?.addEventListener('click', () => {
    UIManager.toggleModal('placement-modal', true);
  });

  document.getElementById('close-placement-modal')?.addEventListener('click', () => {
    UIManager.toggleModal('placement-modal', false);
  });

  document.getElementById('btn-skip-placement')?.addEventListener('click', () => {
    UIManager.toggleModal('placement-modal', false);
    onStartLevelDirect(1, 'basit');
  });

  document.getElementById('btn-placement-basit')?.addEventListener('click', () => {
    UIManager.toggleModal('placement-modal', false);
    onStartPlacementExam('basit');
  });

  document.getElementById('btn-placement-orta')?.addEventListener('click', () => {
    UIManager.toggleModal('placement-modal', false);
    onStartPlacementExam('orta');
  });

  document.getElementById('btn-placement-zor')?.addEventListener('click', () => {
    UIManager.toggleModal('placement-modal', false);
    onStartPlacementExam('zor');
  });
}
