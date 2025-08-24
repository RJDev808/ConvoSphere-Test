// src/services/chatService.ts
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { importPublicKeyFromJwk, importPrivateKeyFromJwk, deriveSharedKey, encryptWithSharedKey, decryptWithSharedKey } from "./crypto";

// helper: deterministic chat id
export function chatIdFor(uidA: string, uidB: string) {
  return [uidA, uidB].sort().join("_");
}

// create or return chat doc ref; prefs: map of uid->lang
export async function createOrOpenChat(uidA: string, uidB: string, myPrefLang = "en") {
  const id = chatIdFor(uidA, uidB);
  const docRef = doc(db, "chats", id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    const prefs: Record<string, string> = {};
    prefs[uidA] = myPrefLang;
    prefs[uidB] = "en"; // default for other; they can change later
    await setDoc(docRef, {
      id,
      participants: [uidA, uidB],
      prefs,
      createdAt: new Date()
    });
  }
  return id;
}

// send encrypted message
export async function sendEncryptedMessage(chatId: string, senderUid: string, recipientUid: string, plaintext: string) {
  const otherDoc = await getDoc(doc(db, "users", recipientUid));
  if (!otherDoc.exists() || !otherDoc.data()?.publicKeyJwk) {
    throw new Error("Recipient missing public key, cannot send message.");
  }
  const otherPub = otherDoc.data().publicKeyJwk;
  const otherPublicKey = await importPublicKeyFromJwk(otherPub);

  const privRaw = localStorage.getItem("cs_privkey_" + senderUid);
  if (!privRaw) throw new Error("Local private key not found. Please log in on the device where you registered.");
  const privJwk = JSON.parse(privRaw);
  const myPrivKey = await importPrivateKeyFromJwk(privJwk);

  const sharedKey = await deriveSharedKey(myPrivKey, otherPublicKey);
  const { ciphertext, iv } = await encryptWithSharedKey(sharedKey, plaintext);

  await addDoc(collection(db, "chats", chatId, "messages"), {
    sender: senderUid,
    ciphertext,
    iv,
    timestamp: new Date()
  });
}

// decrypt a message
export async function decryptMessageForUser(
  msgData: { ciphertext: string; iv: string }, // Use a specific shape instead of any
  myUid: string, 
  otherPubJwk: JsonWebKey // Use the standard JsonWebKey type instead of any
) {
  // ... (the rest of the function remains the same)
  const otherPublicKey = await importPublicKeyFromJwk(otherPubJwk);
  const privRaw = localStorage.getItem("cs_privkey_" + myUid);
  if (!privRaw) throw new Error("No local private key found; cannot decrypt.");
  const privJwk = JSON.parse(privRaw);
  const myPrivKey = await importPrivateKeyFromJwk(privJwk);
  const sharedKey = await deriveSharedKey(myPrivKey, otherPublicKey);
  const plaintext = await decryptWithSharedKey(sharedKey, msgData.ciphertext, msgData.iv);
  return plaintext;
}