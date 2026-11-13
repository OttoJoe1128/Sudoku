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
  createdAt?: any;
}

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

    const challengeData: ChallengeRequest = {
      challengeId,
      fromUid: currentUid,
      fromUsername: currentUsername,
      targetUid,
      targetUsername,
      difficulty,
      status: 'pending'
    };

    await setDoc(doc(db, 'challenges', challengeId), {
      ...challengeData,
      createdAt: serverTimestamp()
    });

    return { challengeId };
  },

  listenIncomingChallenges(onChallengeReceived: (challenge: ChallengeRequest) => void) {
    if (challengeSnapshotUnsubscribe) challengeSnapshotUnsubscribe();

    if (!UserManager.getNotificationsEnabled()) return;
    if (!auth.currentUser) return;

    const currentUid = auth.currentUser.uid;
    const q = query(
      collection(db, 'challenges'),
      where('targetUid', '==', currentUid),
      where('status', '==', 'pending')
    );

    try {
      challengeSnapshotUnsubscribe = onSnapshot(q, (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data() as ChallengeRequest;
            onChallengeReceived(data);
          }
        });
      });
    } catch (e) {
      console.warn("Gelen düello davetleri dinlenemedi:", e);
    }
  },

  async respondToChallenge(challengeId: string, accept: boolean): Promise<MatchState | null> {
    try {
      const chalRef = doc(db, 'challenges', challengeId);
      if (!accept) {
        await updateDoc(chalRef, { status: 'declined' });
        return null;
      }

      await updateDoc(chalRef, { status: 'accepted' });

      // Kabul edilirse maç oluştur
      const currentUsername = UserManager.getUsername() || 'Oyuncu';
      const currentUid = auth.currentUser ? auth.currentUser.uid : `user_${Date.now()}`;
      const matchId = `match_${Date.now()}`;
      const generated = SudokuGen.generate('basit');

      const match: MatchState = {
        matchId,
        difficulty: 'basit',
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
      };

      await setDoc(doc(db, 'matches', matchId), match);
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
        const matchData = foundDoc.data() as MatchState;

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
      await setDoc(doc(db, 'matches', matchId), {
        ...initialMatch,
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
          const data = docSnap.data() as MatchState;
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
          onUpdate(docSnap.data() as MatchState);
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
