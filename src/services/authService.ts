import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  sendPasswordResetEmail,
  signOut,
  deleteUser
} from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../api/firebase';
import { UserManager } from '../store/userState';

export function validateAuthInput(
  email: string,
  password: string
): { ok: boolean; reason?: 'invalid_email' | 'weak_password' } {
  const cleanEmail = email ? email.trim() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { ok: false, reason: 'invalid_email' };
  }

  if (!password || password.length < 6) {
    return { ok: false, reason: 'weak_password' };
  }

  return { ok: true };
}

export function getAuthAccountInfo(): {
  isSignedInWithEmail: boolean;
  email: string | null;
  uid: string | null;
} {
  const user = auth.currentUser;
  const isSignedInWithEmail = Boolean(user && !user.isAnonymous && user.email);
  return {
    isSignedInWithEmail,
    email: user ? user.email : null,
    uid: user ? user.uid : null
  };
}

export async function registerOrLinkWithEmail(
  email: string,
  password: string
): Promise<{ ok: boolean; code?: string }> {
  const v = validateAuthInput(email, password);
  if (!v.ok) return { ok: false, code: v.reason };

  const cleanEmail = email.trim();

  try {
    if (auth.currentUser && auth.currentUser.isAnonymous) {
      const cred = EmailAuthProvider.credential(cleanEmail, password);
      await linkWithCredential(auth.currentUser, cred);
    } else {
      await createUserWithEmailAndPassword(auth, cleanEmail, password);
    }

    await UserManager.syncFullEconomyToCloud();

    return { ok: true };
  } catch (e: any) {
    return { ok: false, code: e?.code || 'auth/generic-error' };
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ ok: boolean; code?: string }> {
  const v = validateAuthInput(email, password);
  if (!v.ok) return { ok: false, code: v.reason };

  const cleanEmail = email.trim();

  try {
    await signInWithEmailAndPassword(auth, cleanEmail, password);
    await UserManager.initUser();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, code: e?.code || 'auth/generic-error' };
  }
}

export async function sendPasswordReset(
  email: string
): Promise<{ ok: boolean; code?: string }> {
  const cleanEmail = email ? email.trim() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return { ok: false, code: 'invalid_email' };
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, code: e?.code || 'auth/generic-error' };
  }
}

export async function logoutAccount(): Promise<{ ok: boolean; code?: string }> {
  try {
    await signOut(auth);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, code: e?.code || 'auth/generic-error' };
  }
}

export async function deleteAccountPermanently(): Promise<{ ok: boolean; code?: string }> {
  if (!auth.currentUser) return { ok: false, code: 'no_user' };

  try {
    const uid = auth.currentUser.uid;
    try {
      await deleteDoc(doc(db, 'leaderboard', uid));
    } catch {
      // ignore doc deletion error if missing
    }

    await deleteUser(auth.currentUser);

    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    return { ok: true };
  } catch (e: any) {
    if (e?.code === 'auth/requires-recent-login' || String(e?.message).includes('requires-recent-login')) {
      return { ok: false, code: 'auth/requires-recent-login' };
    }
    return { ok: false, code: e?.code || 'auth/generic-error' };
  }
}
