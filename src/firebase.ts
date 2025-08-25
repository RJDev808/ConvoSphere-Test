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
  apiKey: "AIzaSyBEf-0Uc9tUXc38Z6L-wUIczaHqrdG0mxU",
  authDomain: "convosphere-b0e5e.firebaseapp.com",
  projectId: "convosphere-b0e5e",
  storageBucket: "convosphere-b0e5e.firebasestorage.app",
  messagingSenderId: "1065333733060",
  appId: "1:1065333733060:web:6c9b75ba5a7d66ab727b91"
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
