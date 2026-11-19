import { collection, doc, setDoc, updateDoc, onSnapshot, getDocs, query, where, limit, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../api/firebase';
import { SudokuGen, SudokuVariant } from './sudoku';
import { UserManager } from '../store/userState';

export interface MatchPlayer {
  uid: string;
  username: string;
  isBot?: boolean;
  progress: number; // 0 - 81
  errors: number;
  completedAt?: number;
}

export interface MatchState {
  matchId: string;
  difficulty: 'basit' | 'orta' | 'zor';
  variant?: SudokuVariant;
  durationSec?: number;
  puzzle: number[][];
  solution: number[][];
  regionMap?: number[][];
  cages?: any[];
  status: 'waiting' | 'in_progress' | 'completed';
  player1: MatchPlayer;
  player2?: MatchPlayer;
  winnerUid?: string;
  forfeitBy?: string;
}

export interface ChallengeRequest {
  challengeId: string;
  fromUid: string;
  fromUsername: string;
  targetUid: string;
  targetUsername: string;
  difficulty: 'basit' | 'orta' | 'zor';
  variant?: SudokuVariant;
  durationSec?: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  matchId?: string;
  matchData?: MatchState;
  createdAt?: any;
  createdAtMs?: number;
}

// Chess ELO (MMR) Hesaplama Motoru
export const calculateEloChange = (
  ratingA: number,
  ratingB: number,
  isWinA: boolean,
  difficulty: 'basit' | 'orta' | 'zor' = 'basit',
  errorsA: number = 0,
  timeDiffSec: number = 0
): { newRatingA: number; mmrChangeA: number } => {
  const expectedScoreA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const actualScoreA = isWinA ? 1 : 0;

  let k = 32;
  if (ratingA < 1200) k = 40;
  else if (ratingA >= 1800) k = 24;

  const diffMultiplier = difficulty === 'basit' ? 1.0 : difficulty === 'orta' ? 1.2 : 1.5;
  const effectiveK = k * diffMultiplier;

  let mmrChange = Math.round(effectiveK * (actualScoreA - expectedScoreA));

  if (isWinA && mmrChange < 5) mmrChange = 5;
  if (!isWinA && mmrChange > -5) mmrChange = -5;

  if (isWinA && errorsA === 0) {
    mmrChange = Math.round(mmrChange * 1.15);
  }

  if (isWinA && timeDiffSec >= 60) {
    mmrChange += 3;
  }

  const newRatingA = Math.max(100, ratingA + mmrChange);
  return { newRatingA, mmrChangeA: mmrChange };
};

// 9x9 2D Matrisi Firestore uyumlu 1D 81 elemanlı diziye çevirir
export const serializePuzzle = (grid: any): number[] => {
  if (!grid) return new Array(81).fill(0);
  if (Array.isArray(grid) && grid.length === 81 && typeof grid[0] === 'number') {
    return grid;
  }
  if (Array.isArray(grid) && grid.length === 9 && Array.isArray(grid[0])) {
    return grid.flat();
  }
  if (typeof grid === 'string') {
    try {
      const parsed = JSON.parse(grid);
      if (Array.isArray(parsed) && parsed.length === 9) return parsed.flat();
      if (Array.isArray(parsed) && parsed.length === 81) return parsed;
    } catch {
      // fallback
    }
  }
  return new Array(81).fill(0);
};

// Firestore'dan gelen 1D 81 elemanlı diziyi tekrar 9x9 2D matrise çevirir
export const deserializePuzzle = (data: any): number[][] => {
  let flat: number[] = [];

  if (Array.isArray(data)) {
    if (data.length === 81 && typeof data[0] === 'number') {
      flat = data;
    } else if (data.length === 9 && Array.isArray(data[0])) {
      return data;
    } else {
      flat = data.flat();
    }
  } else if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return deserializePuzzle(parsed);
    } catch {
      flat = new Array(81).fill(0);
    }
  }

  if (flat.length !== 81) {
    flat = new Array(81).fill(0);
  }

  const grid: number[][] = [];
  for (let i = 0; i < 9; i++) {
    grid.push(flat.slice(i * 9, (i + 1) * 9));
  }
  return grid;
};

export const serializeMatchForFirestore = (match: MatchState): any => {
  if (!match) return null;
  return {
    ...match,
    puzzle: serializePuzzle(match.puzzle),
    solution: serializePuzzle(match.solution)
  };
};

export const deserializeMatchFromFirestore = (data: any): MatchState => {
  if (!data) return null as any;
  return {
    ...data,
    puzzle: deserializePuzzle(data.puzzle),
    solution: deserializePuzzle(data.solution)
  };
};

export const serializeChallengeForFirestore = (chal: ChallengeRequest): any => {
  if (!chal) return null;
  const payload: any = { ...chal };
  if (payload.matchData) {
    payload.matchData = serializeMatchForFirestore(payload.matchData);
  }
  return JSON.parse(JSON.stringify(payload));
};

export const deserializeChallengeFromFirestore = (data: any): ChallengeRequest => {
  if (!data) return null as any;
  const chal = { ...data };
  if (chal.matchData) {
    chal.matchData = deserializeMatchFromFirestore(chal.matchData);
  }
  return chal;
};

let activeMatchSnapshotUnsubscribe: (() => void) | null = null;
let challengeSnapshotUnsubscribe: (() => void) | null = null;
let outgoingChallengesUnsub: (() => void) | null = null;
let botTimerInterval: any = null;

export const MatchEngine = {
  clearActiveMatch() {
    if (activeMatchSnapshotUnsubscribe) {
      activeMatchSnapshotUnsubscribe();
      activeMatchSnapshotUnsubscribe = null;
    }
    if (challengeSnapshotUnsubscribe) {
      challengeSnapshotUnsubscribe();
      challengeSnapshotUnsubscribe = null;
    }
    if (outgoingChallengesUnsub) {
      outgoingChallengesUnsub();
      outgoingChallengesUnsub = null;
    }
    if (botTimerInterval) {
      clearInterval(botTimerInterval);
      botTimerInterval = null;
    }
  },

  async sendDirectChallenge(
    targetUid: string,
    targetUsername: string,
    difficulty: 'basit' | 'orta' | 'zor',
    durationSec: number = 180,
    variant: SudokuVariant = 'classic'
  ): Promise<{ challengeId: string }> {
    const currentUsername = UserManager.getUsername() || 'Oyuncu';
    const currentUid = auth.currentUser ? auth.currentUser.uid : `user_${Date.now()}`;
    const safeTargetUid = targetUid || targetUsername || 'target_player';

    // Zaten bekleyen bir davet var mı kontrolü
    try {
      const q = query(
        collection(db, 'challenges'),
        where('fromUid', '==', currentUid),
        where('targetUid', '==', safeTargetUid),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        throw new Error('PENDING_EXISTS');
      }
    } catch (e: any) {
      if (e.message === 'PENDING_EXISTS') throw e;
      // Index yoksa veya başka hata varsa devam et (opt-in)
    }

    const challengeId = `chal_${Date.now()}`;
    const generated = SudokuGen.generateVariant(difficulty, variant);

    const safeTargetUsername = targetUsername || 'Oyuncu';

    const challengeData: ChallengeRequest = {
      challengeId,
      fromUid: currentUid,
      fromUsername: currentUsername,
      targetUid: safeTargetUid,
      targetUsername: safeTargetUsername,
      difficulty,
      durationSec,
      variant,
      status: 'pending',
      matchData: {
        matchId: `match_${Date.now()}`,
        difficulty,
        durationSec,
        variant,
        puzzle: generated.puzzle,
        solution: generated.solution,
        status: 'in_progress',
        player1: {
          uid: currentUid,
          username: currentUsername,
          isBot: false,
          progress: 0,
          errors: 0
        }
      }
    };

    const payload = serializeChallengeForFirestore(challengeData);

    await setDoc(doc(db, 'challenges', challengeId), {
      ...payload,
      createdAt: serverTimestamp()
    });

    return { challengeId };
  },

  async fetchPendingChallenges(): Promise<ChallengeRequest[]> {
    if (!auth.currentUser) return [];
    const currentUid = auth.currentUser.uid;
    const currentUsername = UserManager.getUsername() || '';

    try {
      const q = query(
        collection(db, 'challenges'),
        where('status', '==', 'pending'),
        limit(20)
      );
      const snap = await getDocs(q);
      const list: ChallengeRequest[] = [];
      snap.docs.forEach((d) => {
        const data = deserializeChallengeFromFirestore(d.data());
        if (
          data.targetUid === currentUid ||
          (currentUsername && data.targetUsername === currentUsername) ||
          (data.targetUid && data.targetUid === currentUsername)
        ) {
          list.push(data);
        }
      });
      return list;
    } catch (e) {
      console.warn("Gelen davetler çekilemedi:", e);
      return [];
    }
  },

  listenIncomingChallenges(onIncoming: (challenge: ChallengeRequest) => void) {
    this.listenPendingChallenges((challenges) => {
      if (challenges.length > 0) {
        onIncoming(challenges[0]);
      }
    });
  },

  listenPendingChallenges(onUpdate: (challenges: ChallengeRequest[]) => void) {
    if (challengeSnapshotUnsubscribe) {
      challengeSnapshotUnsubscribe();
      challengeSnapshotUnsubscribe = null;
    }
    if (!auth.currentUser) return;

    const currentUid = auth.currentUser.uid;
    const currentUsername = UserManager.getUsername() || '';

    const q = query(
      collection(db, 'challenges'),
      where('status', '==', 'pending')
    );

    try {
      challengeSnapshotUnsubscribe = onSnapshot(
        q,
        (snap) => {
          const list: ChallengeRequest[] = [];
          snap.docs.forEach((d) => {
            const data = deserializeChallengeFromFirestore(d.data());
            if (
              data.targetUid === currentUid ||
              (currentUsername && data.targetUsername === currentUsername) ||
              (data.targetUid && data.targetUid === currentUsername)
            ) {
              list.push(data);
            }
          });
          onUpdate(list);
        },
        (err) => console.warn('Gelen davetler dinlenirken hata:', err)
      );
    } catch (e) {
      console.warn("Gelen davetler dinlenemedi:", e);
    }
  },

  listenOutgoingChallenges(onChallengeAccepted: (challenge: ChallengeRequest) => void) {
    if (outgoingChallengesUnsub) {
      outgoingChallengesUnsub();
      outgoingChallengesUnsub = null;
    }
    if (!auth.currentUser) return;
    const currentUid = auth.currentUser.uid;
    const now = Date.now();

    const q = query(
      collection(db, 'challenges'),
      where('fromUid', '==', currentUid),
      where('status', '==', 'accepted')
    );

    try {
      outgoingChallengesUnsub = onSnapshot(
        q,
        (snap) => {
          snap.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const data = deserializeChallengeFromFirestore(change.doc.data());
              if (data.status === 'accepted' && data.matchData && data.createdAtMs && data.createdAtMs > now - 10000) {
                onChallengeAccepted(data);
              }
            }
          });
        },
        (err) => console.warn('Gönderilen davetler dinlenirken hata:', err)
      );
    } catch (e) {
      console.warn("Gönderilen davetler dinlenemedi:", e);
    }
  },

  async respondToChallenge(challengeId: string, accept: boolean, challengeData?: ChallengeRequest): Promise<MatchState | null> {
    try {
      const chalRef = doc(db, 'challenges', challengeId);
      if (!accept) {
        await updateDoc(chalRef, { status: 'declined' });
        return null;
      }

      const currentUsername = UserManager.getUsername() || 'Oyuncu';
      const currentUid = auth.currentUser ? auth.currentUser.uid : `user_${Date.now()}`;
      const matchId = challengeData?.matchData?.matchId || `match_${Date.now()}`;
      const difficulty = challengeData?.difficulty || 'basit';
      const durationSec = challengeData?.durationSec || 180;
      const variant = challengeData?.variant || 'classic';
      const generated = challengeData?.matchData?.puzzle ? { puzzle: challengeData.matchData.puzzle, solution: challengeData.matchData.solution } : SudokuGen.generateVariant(difficulty, variant);

      const match: MatchState = {
        matchId,
        difficulty,
        durationSec,
        variant,
        puzzle: generated.puzzle,
        solution: generated.solution,
        status: 'in_progress',
        player1: {
          uid: challengeData?.fromUid || 'challenger',
          username: challengeData?.fromUsername || 'Rakip',
          isBot: false,
          progress: challengeData?.matchData?.player1?.progress || 0,
          errors: challengeData?.matchData?.player1?.errors || 0
        },
        player2: {
          uid: currentUid,
          username: currentUsername,
          isBot: false,
          progress: 0,
          errors: 0
        }
      };

      const matchPayload = serializeMatchForFirestore(match);
      await setDoc(doc(db, 'matches', matchId), matchPayload);
      await updateDoc(chalRef, { status: 'accepted', matchId, matchData: matchPayload });
      return match;
    } catch (e) {
      console.warn("Davete yanıt verilemedi:", e);
      return null;
    }
  },

  async notifyMatchForfeit(matchId: string, forfeitByUid: string, winnerUid: string) {
    try {
      const matchRef = doc(db, 'matches', matchId);
      await updateDoc(matchRef, {
        status: 'completed',
        forfeitBy: forfeitByUid,
        winnerUid: winnerUid
      });
    } catch (e) {
      console.warn("Düello terki bildirilemedi:", e);
    }
  },

  async startMatchSearch(
    difficulty: 'basit' | 'orta' | 'zor',
    onMatchFound: (match: MatchState) => void,
    onStatusUpdate?: (statusText: string) => void,
    variant: SudokuVariant = 'classic'
  ) {
    this.clearActiveMatch();
    const currentUsername = UserManager.getUsername() || 'Oyuncu';
    const currentUid = auth.currentUser ? auth.currentUser.uid : `user_${Date.now()}`;

    if (onStatusUpdate) onStatusUpdate("Açık maçlar taranıyor...");

    try {
      const q = query(
        collection(db, 'matches'),
        where('difficulty', '==', difficulty),
        where('status', '==', 'waiting'),
        limit(1)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const foundDoc = snap.docs[0];
        const matchData = deserializeMatchFromFirestore(foundDoc.data());

        if (matchData.player1.uid !== currentUid) {
          if (onStatusUpdate) onStatusUpdate("Açık rakip bulundu, maça bağlanılıyor...");
          const matchRef = doc(db, 'matches', foundDoc.id);

          const updatedPlayer2: MatchPlayer = {
            uid: currentUid,
            username: currentUsername,
            isBot: false,
            progress: 0,
            errors: 0
          };

          await updateDoc(matchRef, {
            player2: updatedPlayer2,
            status: 'in_progress'
          });

          matchData.player2 = updatedPlayer2;
          matchData.status = 'in_progress';
          onMatchFound(matchData);
          return;
        }
      }
    } catch (e) {
      console.warn("Online maç arama hatası, offline moda düşülüyor:", e);
    }

    if (onStatusUpdate) onStatusUpdate("Oda oluşturuluyor, rakip bekleniyor...");
    const matchId = `match_${Date.now()}`;
    const generated = SudokuGen.generateVariant(difficulty, variant);

    const initialMatch: MatchState = {
      matchId,
      difficulty,
      variant,
      puzzle: generated.puzzle,
      solution: generated.solution,
      status: 'waiting',
      player1: {
        uid: currentUid,
        username: currentUsername,
        isBot: false,
        progress: 0,
        errors: 0
      }
    };

    try {
      const matchPayload = serializeMatchForFirestore(initialMatch);
      await setDoc(doc(db, 'matches', matchId), {
        ...matchPayload,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("Firestore maç oluşturma atlandı:", e);
    }

    let botTimeout = setTimeout(() => {
      if (onStatusUpdate) onStatusUpdate("Rakip bulunamadı. Yapay Zekâ (Bot) ile maç başlatılıyor!");

      const botNames = ['SudokuBot Alpha', 'Usta Çözücü AI', 'Akıllı Bot', 'Matrix Solver'];
      const randomBotName = botNames[Math.floor(Math.random() * botNames.length)];

      const botPlayer: MatchPlayer = {
        uid: `bot_${Date.now()}`,
        username: randomBotName,
        isBot: true,
        progress: 0,
        errors: 0
      };

      initialMatch.player2 = botPlayer;
      initialMatch.status = 'in_progress';

      try {
        updateDoc(doc(db, 'matches', matchId), {
          player2: botPlayer,
          status: 'in_progress'
        });
      } catch (e) {
        // ignore
      }

      onMatchFound(initialMatch);
    }, 4000);

    try {
      const matchRef = doc(db, 'matches', matchId);
      if (activeMatchSnapshotUnsubscribe) {
        activeMatchSnapshotUnsubscribe();
        activeMatchSnapshotUnsubscribe = null;
      }
      activeMatchSnapshotUnsubscribe = onSnapshot(
        matchRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = deserializeMatchFromFirestore(docSnap.data());
            if (data.status === 'in_progress' && data.player2 && !data.player2.isBot) {
              clearTimeout(botTimeout);
              onMatchFound(data);
            }
          }
        },
        (err) => console.warn('Eşleşme araması dinlenirken hata:', err)
      );
    } catch (e) {
      // ignore
    }
  },

  startBotAI(difficulty: string, onBotProgress: (progress: number) => void, customSpeedMs?: number) {
    if (botTimerInterval) clearInterval(botTimerInterval);
    let botProgress = 0;
    const intervalMs = customSpeedMs || (difficulty === 'basit' ? 2500 : difficulty === 'orta' ? 2000 : 1500);

    botTimerInterval = setInterval(() => {
      botProgress += Math.floor(Math.random() * 2) + 1;
      if (botProgress > 81) botProgress = 81;
      onBotProgress(botProgress);
      if (botProgress >= 81) {
        clearInterval(botTimerInterval);
      }
    }, intervalMs);
  },

  listenMatchUpdates(matchId: string, onUpdate: (match: MatchState) => void) {
    if (activeMatchSnapshotUnsubscribe) {
      activeMatchSnapshotUnsubscribe();
      activeMatchSnapshotUnsubscribe = null;
    }
    try {
      const matchRef = doc(db, 'matches', matchId);
      activeMatchSnapshotUnsubscribe = onSnapshot(
        matchRef,
        (docSnap) => {
          if (docSnap.exists()) {
            onUpdate(deserializeMatchFromFirestore(docSnap.data()));
          }
        },
        (err) => console.warn('Maç dinleme hatası:', err)
      );
    } catch (e) {
      console.warn("Maç dinleme hatası:", e);
    }
  },

  async updateProgress(matchId: string, isPlayer1: boolean, progress: number, errors: number) {
    try {
      const matchRef = doc(db, 'matches', matchId);
      const fieldPrefix = isPlayer1 ? 'player1' : 'player2';
      await updateDoc(matchRef, {
        [`${fieldPrefix}.progress`]: progress,
        [`${fieldPrefix}.errors`]: errors
      });
    } catch (e) {
      // ignore offline fallback
    }
  }
};
