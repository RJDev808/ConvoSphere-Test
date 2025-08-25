// src/firebase.ts
// This file initializes and exports all Firebase services.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
  getDoc,
  deleteDoc,
  updateDoc,
  addDoc, // Ensure addDoc is imported from firebase/firestore
} from "firebase/firestore";

// --- IMPORTANT ---
// PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
  getDoc,
  deleteDoc,
  updateDoc,
  addDoc, // --- FIX: Export addDoc here ---
};
