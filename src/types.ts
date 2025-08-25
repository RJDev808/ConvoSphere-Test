// src/types.ts
import { Timestamp } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  username: string;
  email: string;
  publicKeyJwk: JsonWebKey;
  preferredLang: string;
  createdAt: Timestamp;
  photoURL?: string;
};

export type Chat = {
  id: string;
  participants: string[];
  createdAt: Timestamp;
  colors?: Record<string, string>; 
  prefs?: Record<string, string>;
};

// --- THIS IS THE KEY FIX ---
// This type now correctly includes the 'iv' field, matching what's in Firestore.
export type EncryptedMessage = {
  id: string;
  chatId: string;
  sender: string;
  ciphertext: string; 
  iv: string;
  timestamp: Timestamp;
};
