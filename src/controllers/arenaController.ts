import { SudokuVariant, SudokuGen } from '../engine/sudoku';
import { UIManager } from '../ui/uiManager';
import { UserManager } from '../store/userState';
import { MatchEngine, MatchState, ChallengeRequest } from '../engine/matchEngine';
import { t } from '../i18n/translations';
import { BotCharacters, BotCharacter } from '../engine/botData';
import { Player, SIMULATED_LOBBY_PLAYERS } from '../engine/leaderboard';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../api/firebase';

let selectedArenaVariant: SudokuVariant = 'classic';
let currentArenaDiff: 'basit' | 'orta' | 'zor' = 'basit';
let selectedMatchTimeSec = 180;
let arenaUnsubLobby: (() => void) | null = null;

export function getSelectedArenaVariant(): SudokuVariant {
  return selectedArenaVariant;
}

export function getSelectedMatchTimeSec(): number {
  return selectedMatchTimeSec;
}

export function startBotMatch(
  bot: BotCharacter,
  onStartMatchGame: (level: number, diff: 'basit' | 'orta' | 'zor', matchData: MatchState, variant: SudokuVariant) => void,
  onBotMatchProgress: (botProgress: number, enemyName: string) => Promise<void>
) {
  UIManager.toggleModal('match-search-modal', false);

  const currentUsername = UserManager.getUsername() || 'Oyuncu';
  const currentUid = auth.currentUser ? auth.currentUser.uid : `user_${Date.now()}`;
  const generated = SudokuGen.generateVariant(bot.difficulty, selectedArenaVariant);

  const matchData: MatchState = {
    matchId: `match_${Date.now()}`,
    difficulty: bot.difficulty,
    variant: selectedArenaVariant,
    durationSec: selectedMatchTimeSec,
    puzzle: generated.puzzle,
    solution: generated.solution,
    regionMap: generated.regionMap,
    cages: generated.cages,
    status: 'in_progress',
    player1: {
      uid: currentUid,
      username: currentUsername,
      isBot: false,
      progress: 0,
      errors: 0
    },
    player2: {
      uid: bot.id,
      username: `${bot.avatar} ${bot.name} (${bot.title})`,
      isBot: true,
      progress: 0,
      errors: 0
    }
  };

  onStartMatchGame(bot.level, bot.difficulty, matchData, selectedArenaVariant);

  const enemyName = `${bot.avatar} ${bot.name}`;
  MatchEngine.startBotAI(bot.difficulty, async (botProgress) => {
    await onBotMatchProgress(botProgress, enemyName);
  }, bot.speedMs);
}

export function triggerExpertBotMatch(
  onStartMatchGame: (level: number, diff: 'basit' | 'orta' | 'zor', matchData: MatchState, variant: SudokuVariant) => void,
  onBotMatchProgress: (botProgress: number, enemyName: string) => Promise<void>
): void {
  const expertBot = BotCharacters.find(b => b.level === 300) || BotCharacters[0];
  startBotMatch(expertBot, onStartMatchGame, onBotMatchProgress);
}

export function startSimulatedMatch(
  targetPlayer: Player,
  onStartMatchGame: (level: number, diff: 'basit' | 'orta' | 'zor', matchData: MatchState, variant: SudokuVariant) => void,
  onBotMatchProgress: (botProgress: number, enemyName: string) => Promise<void>
) {
  UIManager.toggleModal('match-search-modal', false);

  const currentUsername = UserManager.getUsername() || 'Oyuncu';
  const currentUid = auth.currentUser ? auth.currentUser.uid : `user_${Date.now()}`;
  const generated = SudokuGen.generateVariant(currentArenaDiff, selectedArenaVariant);

  const matchData: MatchState = {
    matchId: `match_${Date.now()}`,
    difficulty: currentArenaDiff,
    variant: selectedArenaVariant,
    durationSec: selectedMatchTimeSec,
    puzzle: generated.puzzle,
    solution: generated.solution,
    regionMap: generated.regionMap,
    cages: generated.cages,
    status: 'in_progress',
    player1: {
      uid: currentUid,
      username: currentUsername,
      isBot: false,
      progress: 0,
      errors: 0
    },
    player2: {
      uid: targetPlayer.uid || `sim_${targetPlayer.username}`,
      username: `${targetPlayer.avatar || '🎮'} ${targetPlayer.username} (${targetPlayer.title || 'Çırak'})`,
      isBot: true,
      progress: 0,
      errors: 0
    }
  };

  onStartMatchGame(targetPlayer.level || 1, currentArenaDiff, matchData, selectedArenaVariant);

  const enemyName = `${targetPlayer.avatar || '🎮'} ${targetPlayer.username}`;
  const simSpeed = currentArenaDiff === 'basit' ? 3200 : currentArenaDiff === 'orta' ? 2400 : 1800;

  MatchEngine.startBotAI(currentArenaDiff, async (botProgress) => {
    await onBotMatchProgress(botProgress, enemyName);
  }, simSpeed);
}

export function loadArenaLobbyPlayers(
  onStartMatchGame: (level: number, diff: 'basit' | 'orta' | 'zor', matchData: MatchState, variant: SudokuVariant) => void,
  onBotMatchProgress: (botProgress: number, enemyName: string) => Promise<void>
) {
  if (arenaUnsubLobby) arenaUnsubLobby();

  try {
    const q = query(
      collection(db, 'leaderboard'),
      limit(30)
    );
    arenaUnsubLobby = onSnapshot(q, (snap) => {
      const list: Player[] = [];
      const myUsername = UserManager.getUsername();
      snap.docs.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.username !== myUsername) {
          const level = typeof d.level === 'number' ? d.level : 1;
          const wins = typeof d.duel_wins === 'number' ? d.duel_wins : 0;
          const mmr = typeof d.duel_mmr === 'number' ? d.duel_mmr : 1000;
          const completed = typeof d.total_completed === 'number' ? d.total_completed : 0;
          const title = UserManager.calculatePlayerTitle(level, wins, mmr, completed);

          list.push({
            uid: d.uid || docSnap.id,
            username: d.username || 'Oyuncu',
            gold: d.gold || 100,
            level,
            avatar: d.avatar || '🎮',
            title,
            duel_wins: wins,
            duel_mmr: mmr,
            total_completed: completed,
            onlineStatus: d.onlineStatus || 'available',
            lastSeenMs: d.lastSeenMs
          } as any);
        }
      });

      SIMULATED_LOBBY_PLAYERS.forEach(sim => {
        if (!list.some(p => p.username === sim.username)) {
          const title = UserManager.calculatePlayerTitle(sim.level, sim.duel_wins || 0, sim.duel_mmr || 1000, sim.total_completed || 0);
          list.push({ ...sim, title });
        }
      });

      UIManager.renderLobbyPlayers(list, async (targetPlayer) => {
        const modeText = selectedMatchTimeSec > 0 ? `${Math.floor(selectedMatchTimeSec / 60)} Dk` : 'Süresiz';
        UIManager.showToast(`📩 ${targetPlayer.username} davetini inceliyor (${modeText})...`, 'info');

        setTimeout(() => {
          UIManager.showToast(`⚔️ ${targetPlayer.username} davetini kabul etti! Düello başlıyor...`, 'success');
          startSimulatedMatch(targetPlayer, onStartMatchGame, onBotMatchProgress);
        }, 1800);
      });
    });
  } catch (e) {
    console.warn("Lobi oyuncuları dinlenemedi:", e);
  }
}

export function loadBotCharactersUI(
  diff: 'basit' | 'orta' | 'zor',
  onStartMatchGame: (level: number, diff: 'basit' | 'orta' | 'zor', matchData: MatchState, variant: SudokuVariant) => void,
  onBotMatchProgress: (botProgress: number, enemyName: string) => Promise<void>
) {
  currentArenaDiff = diff;
  const filtered = BotCharacters.filter(b => b.difficulty === diff);

  ['basit', 'orta', 'zor'].forEach(d => {
    const btn = document.getElementById(`btn-diff-${d}`);
    if (btn) {
      if (d === diff) {
        let bgClass = "bg-emerald-600";
        if (d === 'orta') bgClass = "bg-amber-600";
        if (d === 'zor') bgClass = "bg-rose-600";
        btn.className = `arena-diff-btn flex-1 py-1 rounded-lg font-black text-[10px] transition-all ${bgClass} text-white shadow-sm`;
      } else {
        btn.className = "arena-diff-btn flex-1 py-1 rounded-lg font-bold text-[10px] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent bg-transparent";
      }
    }
  });

  UIManager.renderBotCharacters(filtered, (selectedBot) => startBotMatch(selectedBot, onStartMatchGame, onBotMatchProgress));
}

export function setupMatchTimeButtons(): void {
  const btn3m = document.getElementById('btn-match-time-3m');
  const btn7m = document.getElementById('btn-match-time-7m');
  const btnNoLimit = document.getElementById('btn-match-time-no-limit');

  const updateTimeBtns = (activeSec: number) => {
    selectedMatchTimeSec = activeSec;
    [btn3m, btn7m, btnNoLimit].forEach(btn => {
      if (!btn) return;
      const sec = parseInt(btn.getAttribute('data-time') || '0');
      if (sec === activeSec) {
        btn.className = "match-time-btn flex-1 py-1 rounded-lg font-black text-[10px] transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex items-center justify-center gap-1";
      } else {
        btn.className = "match-time-btn flex-1 py-1 rounded-lg font-bold text-[10px] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent bg-transparent flex items-center justify-center gap-1";
      }
    });
  };

  btn3m?.addEventListener('click', () => updateTimeBtns(180));
  btn7m?.addEventListener('click', () => updateTimeBtns(420));
  btnNoLimit?.addEventListener('click', () => updateTimeBtns(0));
}

export function startMatchWithDiff(
  diff: 'basit' | 'orta' | 'zor',
  onStartMatchGame: (level: number, diff: 'basit' | 'orta' | 'zor', matchData: MatchState, variant: SudokuVariant) => void
) {
  const box = document.getElementById('match-search-status-box');
  const textEl = document.getElementById('match-search-status-text');

  if (box) box.classList.remove('hidden');

  MatchEngine.startMatchSearch(
    diff,
    (match) => {
      UIManager.toggleModal('match-search-modal', false);
      if (box) box.classList.add('hidden');
      onStartMatchGame(1, diff, match, selectedArenaVariant);
    },
    (statusText) => {
      if (textEl) textEl.innerText = statusText;
    },
    selectedArenaVariant
  );
}

export function handleIncomingChallenge(
  challenge: ChallengeRequest,
  onStartMatchGame: (level: number, diff: 'basit' | 'orta' | 'zor', matchData: MatchState, variant: SudokuVariant) => void
) {
  UIManager.renderIncomingChallengePopup(
    challenge,
    async () => {
      const match = await MatchEngine.respondToChallenge(challenge.challengeId, true, challenge);
      if (match) {
        UIManager.showToast('⚔️ Düello başladı!', 'success');
        onStartMatchGame(1, challenge.difficulty, match, challenge.variant || 'classic');
      }
    },
    async () => {
      await MatchEngine.respondToChallenge(challenge.challengeId, false, challenge);
      UIManager.showToast('Düello daveti reddedildi.', 'info');
    }
  );
}

export function loadInboxData(
  onStartMatchGame: (level: number, diff: 'basit' | 'orta' | 'zor', matchData: MatchState, variant: SudokuVariant) => void
) {
  MatchEngine.fetchPendingChallenges().then((challenges) => {
    UIManager.renderInbox(
      challenges,
      async (challenge) => {
        const match = await MatchEngine.respondToChallenge(challenge.challengeId, true, challenge);
        if (match) {
          UIManager.toggleModal('view-inbox', false);
          UIManager.showToast(`⚔️ ${challenge.fromUsername} ile düello başladı!`, 'success');
          onStartMatchGame(1, challenge.difficulty, match, challenge.variant || 'classic');
        }
      },
      async (challenge) => {
        await MatchEngine.respondToChallenge(challenge.challengeId, false, challenge);
        UIManager.showToast('Düello daveti reddedildi.', 'info');
        loadInboxData(onStartMatchGame);
      }
    );
  });
}

export function initArenaController(callbacks: {
  onStartMatchGame: (level: number, diff: 'basit' | 'orta' | 'zor', matchData: MatchState, variant: SudokuVariant) => void;
  onBotMatchProgress: (botProgress: number, enemyName: string) => Promise<void>;
  getRuleDescription: (variant: SudokuVariant) => string;
}): void {
  const { onStartMatchGame, onBotMatchProgress, getRuleDescription } = callbacks;

  (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(v => {
    document.getElementById(`arena-variant-${v}`)?.addEventListener('click', () => {
      selectedArenaVariant = v;
      (['classic', 'irregular', 'killer', 'wordoku', 'samurai'] as SudokuVariant[]).forEach(other => {
        const btn = document.getElementById(`arena-variant-${other}`);
        if (btn) {
          if (other === v) {
            btn.className = "arena-variant-btn p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";
          } else {
            btn.className = "arena-variant-btn p-1.5 rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform";
          }
        }
      });

      const badge = document.getElementById('arena-variant-multiplier-badge');
      const descEl = document.getElementById('arena-variant-rule-desc');
      const mults: Record<SudokuVariant, string> = { classic: '1.0x', wordoku: '1.2x', irregular: '1.5x', killer: '1.8x', samurai: '2.5x' };
      if (badge) badge.innerText = t('pts_multiplier', { mult: mults[v] || '1.0x' });
      if (descEl) descEl.innerText = getRuleDescription(v);
    });
  });

  document.getElementById('tab-arena-lobby')?.addEventListener('click', () => {
    document.getElementById('section-arena-lobby')?.classList.remove('hidden');
    document.getElementById('section-arena-lobby')?.classList.add('flex');
    document.getElementById('section-arena-bots')?.classList.add('hidden');
    document.getElementById('section-arena-bots')?.classList.remove('flex');

    const tabLobby = document.getElementById('tab-arena-lobby');
    const tabBots = document.getElementById('tab-arena-bots');
    if (tabLobby) tabLobby.className = "flex-1 py-2 rounded-xl font-black text-xs transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex items-center justify-center gap-1.5";
    if (tabBots) tabBots.className = "flex-1 py-2 rounded-xl font-bold text-xs transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent flex items-center justify-center gap-1.5";
    loadArenaLobbyPlayers(onStartMatchGame, onBotMatchProgress);
  });

  document.getElementById('tab-arena-bots')?.addEventListener('click', () => {
    document.getElementById('section-arena-bots')?.classList.remove('hidden');
    document.getElementById('section-arena-bots')?.classList.add('flex');
    document.getElementById('section-arena-lobby')?.classList.add('hidden');
    document.getElementById('section-arena-lobby')?.classList.remove('flex');

    const tabLobby = document.getElementById('tab-arena-lobby');
    const tabBots = document.getElementById('tab-arena-bots');
    if (tabBots) tabBots.className = "flex-1 py-2 rounded-xl font-black text-xs transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm flex items-center justify-center gap-1.5";
    if (tabLobby) tabLobby.className = "flex-1 py-2 rounded-xl font-bold text-xs transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent flex items-center justify-center gap-1.5";
    loadBotCharactersUI(currentArenaDiff, onStartMatchGame, onBotMatchProgress);
  });

  document.getElementById('btn-diff-basit')?.addEventListener('click', () => loadBotCharactersUI('basit', onStartMatchGame, onBotMatchProgress));
  document.getElementById('btn-diff-orta')?.addEventListener('click', () => loadBotCharactersUI('orta', onStartMatchGame, onBotMatchProgress));
  document.getElementById('btn-diff-zor')?.addEventListener('click', () => loadBotCharactersUI('zor', onStartMatchGame, onBotMatchProgress));

  document.getElementById('btn-open-match')?.addEventListener('click', () => {
    UIManager.toggleModal('match-search-modal', true);
    loadArenaLobbyPlayers(onStartMatchGame, onBotMatchProgress);
    loadBotCharactersUI(currentArenaDiff, onStartMatchGame, onBotMatchProgress);
  });

  document.getElementById('close-match-search')?.addEventListener('click', () => {
    if (arenaUnsubLobby) {
      arenaUnsubLobby();
      arenaUnsubLobby = null;
    }
    MatchEngine.clearActiveMatch();
    const box = document.getElementById('match-search-status-box');
    if (box) box.classList.add('hidden');
    UIManager.toggleModal('match-search-modal', false);
  });

  document.getElementById('btn-quick-online-match')?.addEventListener('click', () => {
    startMatchWithDiff(currentArenaDiff, onStartMatchGame);
  });

  setupMatchTimeButtons();

  document.getElementById('btn-open-inbox')?.addEventListener('click', () => {
    UIManager.toggleModal('view-inbox', true);
    loadInboxData(onStartMatchGame);
  });

  document.getElementById('close-inbox')?.addEventListener('click', () => {
    UIManager.toggleModal('view-inbox', false);
  });
}
