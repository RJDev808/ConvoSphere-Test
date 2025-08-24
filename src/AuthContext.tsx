// src/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  getIdTokenResult, // <-- Make sure this is imported
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth, db, collection, query, where, getDocs, setDoc, doc, serverTimestamp, getDoc, deleteDoc } from "./firebase";
import { generateAndStoreKeyPairForUid } from "./services/crypto";

// NOTE: Your deleteAccount function had a 'passwordForReauth' parameter that wasn't used.
// I have removed it for now. We can add re-authentication logic later if needed.
type AuthContextType = {
  user: User | null;
  signup: (email: string, password: string, username: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>; 
  profileDocId?: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profileDocId, setProfileDocId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const snap = await getDoc(docRef);
        setProfileDocId(snap.exists() ? snap.id : null);
      } else {
        setProfileDocId(null);
      }
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
    
    // THIS IS THE CRITICAL FIX FOR THE RACE CONDITION
    // Force refresh the token to ensure the backend recognizes the new user.
    await getIdTokenResult(cred.user, true);

    const uid = cred.user.uid;
    const publicJwk = await generateAndStoreKeyPairForUid(uid);

    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, {
      uid,
      email: cred.user.email || null,
      username,
      publicKeyJwk: publicJwk,
      preferredLang: "en",
      createdAt: serverTimestamp(),
    });

    setProfileDocId(uid);
    return cred;
  };

  const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);

  const logout = () => fbSignOut(auth);

  const deleteAccount = async () => {
    if (!auth.currentUser) throw new Error("No user logged in");
    try {
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, "users", uid);
      await deleteDoc(userDocRef);
    } catch (err) {
      console.warn("Failed deleting user doc:", err);
    }
    await auth.currentUser.delete();
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, deleteAccount, profileDocId }}>
      {children}
    </AuthContext.Provider>
  );
}