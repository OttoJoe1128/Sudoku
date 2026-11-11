import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../api/firebase';

export interface UserData {
  username: string;
  gold: number;
  level: number;
}

export const UserManager = {
  async initUser(): Promise<UserData | null> {
    try {
      const cred = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
      const uid = cred.user.uid;

      // 1. Önce kullanıcının kendi UID dokümanını kontrol et
      const userDocRef = doc(db, 'leaderboard', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const username = data.username || 'Oyuncu';
        const gold = typeof data.gold === 'number' ? data.gold : 100;
        const level = typeof data.level === 'number' ? data.level : 1;

        localStorage.setItem('sudoku_username', username);
        localStorage.setItem('sudoku_gold', gold.toString());
        localStorage.setItem('sudoku_level', level.toString());

        return { username, gold, level };
      }

      // 2. Eğer UID ile henüz doküman yoksa ama yerel kullanıcı adı varsa, veritabanından ismi ara
      const localUsername = this.getUsername();
      if (localUsername) {
        const found = await this.findUserByName(localUsername);
        if (found) {
          localStorage.setItem('sudoku_gold', found.gold.toString());
          localStorage.setItem('sudoku_level', found.level.toString());
          // Kullanıcının UID dokümanına da bağla
          await setDoc(userDocRef, {
            uid,
            username: found.username,
            gold: found.gold,
            level: found.level,
            updatedAt: serverTimestamp()
          }, { merge: true });
          return found;
        }
      }
    } catch (e) {
      console.warn("Kullanıcı Firebase ile senkronize edilemedi, yerel veri kullanılıyor:", e);
    }
    return null;
  },

  async findUserByName(username: string): Promise<UserData | null> {
    try {
      // Önce doğrudan ID olarak ara (eski sürümlerde doküman ID'si isim olabiliyordu)
      const directDocRef = doc(db, 'leaderboard', username);
      const directSnap = await getDoc(directDocRef);
      if (directSnap.exists()) {
        const d = directSnap.data();
        return {
          username: d.username || username,
          gold: typeof d.gold === 'number' ? d.gold : 100,
          level: typeof d.level === 'number' ? d.level : 1
        };
      }

      // Ardından username alanına göre ara
      const q = query(collection(db, 'leaderboard'), where('username', '==', username));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const d = querySnap.docs[0].data();
        return {
          username: d.username || username,
          gold: typeof d.gold === 'number' ? d.gold : 100,
          level: typeof d.level === 'number' ? d.level : 1
        };
      }
    } catch (e) {
      console.warn("Kullanıcı adı aranırken hata:", e);
    }
    return null;
  },

  async saveUser(username: string): Promise<UserData> {
    localStorage.setItem('sudoku_username', username);
    let gold = this.getGold();
    let level = this.getCurrentLevel();

    try {
      const cred = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
      const uid = cred.user.uid;

      // Eğer bu kullanıcı adına ait eski kayıt varsa, puan ve seviyeyi geri yükle
      const existing = await this.findUserByName(username);
      if (existing) {
        gold = existing.gold;
        level = existing.level;
        localStorage.setItem('sudoku_gold', gold.toString());
        localStorage.setItem('sudoku_level', level.toString());
      }

      // Firestore'a kaydet / güncelle
      await setDoc(doc(db, 'leaderboard', uid), {
        uid,
        username,
        gold,
        level,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore'a kullanıcı kaydedilemedi:", e);
    }

    return { username, gold, level };
  },

  async updateProgress(level: number, gold: number) {
    localStorage.setItem('sudoku_level', level.toString());
    localStorage.setItem('sudoku_gold', gold.toString());

    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const username = this.getUsername() || 'Oyuncu';
        await setDoc(doc(db, 'leaderboard', uid), {
          uid,
          username,
          gold,
          level,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore ilerlemesi güncellenemedi:", e);
    }
  },

  getUsername(): string | null {
    return localStorage.getItem('sudoku_username');
  },

  getCurrentLevel(): number {
    return parseInt(localStorage.getItem('sudoku_level') || '1');
  },

  getGold(): number {
    return parseInt(localStorage.getItem('sudoku_gold') || '100');
  }
};
