import { collection, doc, setDoc, updateDoc, onSnapshot, getDocs, query, where, limit, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../api/firebase';
import { SudokuGen } from './sudoku';
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
  puzzle: number[][];
  solution: number[][];
  status: 'waiting' | 'in_progress' | 'completed';
  player1: MatchPlayer;
  player2?: MatchPlayer;
  winnerUid?: string;
}

export interface ChallengeRequest {
  challengeId: string;
  fromUid: string;
  fromUsername: string;
  targetUid: string;
  targetUsername: string;
  difficulty: 'basit' | 'orta' | 'zor';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  matchId?: string;
  matchData?: MatchState;
  createdAt?: any;
}

// Firestore 2D Matris (Nested Array) Serileştirme & Ayrıştırma Yardımcıları
export const serializePuzzle = (grid?: number[][]): string => {
  if (!grid || !Array.isArray(grid)) return "[]";
  return JSON.stringify(grid);
};

export const deserializePuzzle = (data: any): number[][] => {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback
    }
  }
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data;
  }
  return Array.from({ length: 9 }, () => Array(9).fill(0));
};

export const serializeMatchForFirestore = (match: MatchState): any => {
  return JSON.parse(JSON.stringify({
    ...match,
    puzzle: serializePuzzle(match.puzzle),
    solution: serializePuzzle(match.solution)
  }));
};

export const deserializeMatchFromFirestore = (data: any): MatchState => {
  return {
    ...data,
    puzzle: deserializePuzzle(data.puzzle),
    solution: deserializePuzzle(data.solution)
  };
};

export const serializeChallengeForFirestore = (chal: ChallengeRequest): any => {
  const payload: any = { ...chal };
  if (payload.matchData) {
    payload.matchData = serializeMatchForFirestore(payload.matchData);
  }
  return JSON.parse(JSON.stringify(payload));
};

export const deserializeChallengeFromFirestore = (data: any): ChallengeRequest => {
  const chal = { ...data };
  if (chal.matchData) {
    chal.matchData = deserializeMatchFromFirestore(chal.matchData);
  }
  return chal;
};

let activeMatchSnapshotUnsubscribe: (() => void) | null = null;
let challengeSnapshotUnsubscribe: (() => void) | null = null;
let botTimerInterval: any = null;

export const MatchEngine = {
  clearActiveMatch() {
    if (activeMatchSnapshotUnsubscribe) {
      activeMatchSnapshotUnsubscribe();
      activeMatchSnapshotUnsubscribe = null;
    }
    if (botTimerInterval) {
      clearInterval(botTimerInterval);
      botTimerInterval = null;
    }
  },

  async sendDirectChallenge(targetUid: string, targetUsername: string, difficulty: 'basit' | 'orta' | 'zor'): Promise<{ challengeId: string }> {
    const currentUsername = UserManager.getUsername() || 'Oyuncu';
    const currentUid = auth.currentUser ? auth.currentUser.uid : `user_${Date.now()}`;
    const challengeId = `chal_${Date.now()}`;
    const generated = SudokuGen.generate(difficulty);

    const safeTargetUid = targetUid || targetUsername || 'target_player';
    const safeTargetUsername = targetUsername || 'Oyuncu';

    const challengeData: ChallengeRequest = {
      challengeId,
      fromUid: currentUid,
      fromUsername: currentUsername,
      targetUid: safeTargetUid,
      targetUsername: safeTargetUsername,
      difficulty,
      status: 'pending',
      matchData: {
        matchId: `match_${Date.now()}`,
        difficulty,
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

  listenPendingChallenges(onUpdate: (challenges: ChallengeRequest[]) => void) {
    if (challengeSnapshotUnsubscribe) challengeSnapshotUnsubscribe();
    if (!auth.currentUser) return;

    const currentUid = auth.currentUser.uid;
    const currentUsername = UserManager.getUsername() || '';

    const q = query(
      collection(db, 'challenges'),
      where('status', '==', 'pending')
    );

    try {
      challengeSnapshotUnsubscribe = onSnapshot(q, (snap) => {
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
      });
    } catch (e) {
      console.warn("Gelen davetler dinlenemedi:", e);
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
      const generated = challengeData?.matchData?.puzzle ? { puzzle: challengeData.matchData.puzzle, solution: challengeData.matchData.solution } : SudokuGen.generate(difficulty);

      const match: MatchState = {
        matchId,
        difficulty,
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

  async startMatchSearch(
    difficulty: 'basit' | 'orta' | 'zor',
    onMatchFound: (match: MatchState) => void,
    onStatusUpdate?: (statusText: string) => void
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
    const generated = SudokuGen.generate(difficulty);

    const initialMatch: MatchState = {
      matchId,
      difficulty,
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
      activeMatchSnapshotUnsubscribe = onSnapshot(matchRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = deserializeMatchFromFirestore(docSnap.data());
          if (data.status === 'in_progress' && data.player2 && !data.player2.isBot) {
            clearTimeout(botTimeout);
            onMatchFound(data);
          }
        }
      });
    } catch (e) {
      // ignore
    }
  },

  startBotAI(difficulty: string, onBotProgress: (progress: number) => void) {
    if (botTimerInterval) clearInterval(botTimerInterval);
    let botProgress = 0;
    const intervalMs = difficulty === 'basit' ? 2500 : difficulty === 'orta' ? 2000 : 1500;

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
    try {
      const matchRef = doc(db, 'matches', matchId);
      activeMatchSnapshotUnsubscribe = onSnapshot(matchRef, (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(deserializeMatchFromFirestore(docSnap.data()));
        }
      });
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
