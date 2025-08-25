// src/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  getIdTokenResult,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth, db, doc, setDoc, getDoc, deleteDoc, serverTimestamp, query, collection, where, getDocs } from "./firebase";
import { generateAndStoreKeyPairForUid } from "./services/crypto";
import type { UserProfile } from "./types";

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, username: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  updateUserEmail: (password: string, newEmail: string) => Promise<void>;
  updateUserPassword: (oldPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUserProfile(snap.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signup = async (email: string, password: string, username: string) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error("Username already taken.");
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await getIdTokenResult(cred.user, true);

    const uid = cred.user.uid;
    const publicJwk = await generateAndStoreKeyPairForUid(uid);

    // Create a default avatar URL on signup
    const defaultPhotoURL = `https://api.dicebear.com/7.x/personas/svg?seed=male&backgroundColor=b6e3f4`;

    const newUserProfile: Omit<UserProfile, 'createdAt'> = {
      uid,
      email: cred.user.email || "",
      username,
      publicKeyJwk: publicJwk,
      preferredLang: "en",
      photoURL: defaultPhotoURL, // Set default avatar
    };

    await setDoc(doc(db, "users", uid), {
      ...newUserProfile,
      createdAt: serverTimestamp(),
    });

    setUserProfile(newUserProfile as UserProfile);
    return cred;
  };

  const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);

  const logout = () => fbSignOut(auth);

  const reauthenticate = async (password: string) => {
    if (!auth.currentUser || !auth.currentUser.email) throw new Error("User not found.");
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
  };

  const updateUserEmail = async (password: string, newEmail: string) => {
    if (!auth.currentUser) throw new Error("No user logged in.");
    await reauthenticate(password);
    await updateEmail(auth.currentUser, newEmail);
    await setDoc(doc(db, "users", auth.currentUser.uid), { email: newEmail }, { merge: true });
  };

  const updateUserPassword = async (oldPassword: string, newPassword: string) => {
    if (!auth.currentUser) throw new Error("No user logged in.");
    await reauthenticate(oldPassword);
    await updatePassword(auth.currentUser, newPassword);
  };

  const deleteAccount = async (password: string) => {
    if (!auth.currentUser) throw new Error("No user logged in");
    await reauthenticate(password);
    
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid));
    } catch (err) {
      console.warn("Failed deleting user doc:", err);
    }
    await auth.currentUser.delete();
  };

  const value = {
    user,
    userProfile,
    loading,
    signup,
    login,
    logout,
    deleteAccount,
    updateUserEmail,
    updateUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
