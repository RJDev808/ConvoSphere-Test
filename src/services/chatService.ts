// src/services/chatService.ts
import { db, doc, getDoc, setDoc, addDoc, collection, deleteDoc, serverTimestamp } from "../firebase";
import {
  ensureLocalPrivateKeyExists,
  importPrivateKeyFromJwk,
  importPublicKeyFromJwk,
  deriveSharedKey,
  encryptWithSharedKey,
  decryptWithSharedKey,
} from "./crypto";
import type { EncryptedMessage, UserProfile } from "../types";

// This function remains the same as the one I provided previously
export async function createOrOpenChat(uid1: string, uid2: string, myLang: string): Promise<string> {
    const chatId = [uid1, uid2].sort().join("_");
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);
  
    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        participants: [uid1, uid2],
        prefs: { [uid1]: myLang },
        colors: {
            [uid1]: 'bg-blue-600',
            [uid2]: 'bg-gray-200 dark:bg-slate-700'
        },
        createdAt: serverTimestamp()
      });
    }
    return chatId;
}

// --- THIS FUNCTION IS NOW CORRECTED ---
export async function sendEncryptedMessage(chatId: string, senderId: string, recipientId: string, plaintext: string): Promise<void> {
    // 1. Get user profiles to find their public keys
    const recipientSnap = await getDoc(doc(db, "users", recipientId));
    if (!recipientSnap.exists()) throw new Error("Recipient not found.");
    const recipientProfile = recipientSnap.data() as UserProfile;

    // 2. Ensure my local private key exists and import it
    const myPrivJwk = await ensureLocalPrivateKeyExists(senderId);
    const myPrivateKey = await importPrivateKeyFromJwk(myPrivJwk);

    // 3. Import recipient's public key
    const recipientPublicKey = await importPublicKeyFromJwk(recipientProfile.publicKeyJwk);

    // 4. Derive the shared secret key
    const sharedKey = await deriveSharedKey(myPrivateKey, recipientPublicKey);

    // 5. Encrypt the message using the shared key
    const { ciphertext, iv } = await encryptWithSharedKey(sharedKey, plaintext);

    // 6. Store the encrypted data in Firestore
    const messagesColRef = collection(db, "chats", chatId, "messages");
    await addDoc(messagesColRef, {
      chatId,
      sender: senderId,
      timestamp: serverTimestamp(),
      // Your crypto file separates ciphertext and iv, so we store them that way
      ciphertext: ciphertext,
      iv: iv,
    });
}

// --- THIS FUNCTION IS NOW CORRECTED ---
export async function decryptMessageForUser(encryptedMsg: Omit<EncryptedMessage, 'id'> & { iv: string }, myUid: string, otherUserPublicKeyJwk: JsonWebKey): Promise<string> {
    // 1. Ensure my local private key exists and import it
    const myPrivJwk = await ensureLocalPrivateKeyExists(myUid);
    const myPrivateKey = await importPrivateKeyFromJwk(myPrivJwk);

    // 2. Import the other user's public key
    const otherPublicKey = await importPublicKeyFromJwk(otherUserPublicKeyJwk);

    // 3. Derive the same shared secret
    const sharedKey = await deriveSharedKey(myPrivateKey, otherPublicKey);

    // 4. Decrypt using the shared key and the provided ciphertext and IV
    return await decryptWithSharedKey(sharedKey, encryptedMsg.ciphertext as unknown as string, encryptedMsg.iv);
}

// This function remains the same
export async function deleteMessageForEveryone(chatId: string, messageId: string): Promise<void> {
  await deleteDoc(doc(db, "chats", chatId, "messages", messageId));
}
