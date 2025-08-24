// src/types.ts
import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  username: string;
  email: string | null;
  publicKeyJwk: JsonWebKey;
  preferredLang: string;
  createdAt: Timestamp;
}

export interface Chat {
  id: string;
  participants: string[];
  prefs: Record<string, string>;
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  sender: string;
  ciphertext: string;
  iv: string;
  timestamp: Timestamp;
}

export interface EncryptedMessage {
  id: string;
  sender: string;
  ciphertext: string;
  iv: string;
  timestamp: Timestamp;
}
