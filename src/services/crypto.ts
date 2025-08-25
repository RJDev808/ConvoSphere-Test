// src/services/crypto.ts
// WebCrypto-based ECDH (P-256) + AES-GCM helpers.
// Warning: private JWK is stored in localStorage in this implementation. For production use IndexedDB or secure storage.

// helpers
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
function utf8Encode(s: string) { return new TextEncoder().encode(s); }
function utf8Decode(buf: ArrayBuffer) { return new TextDecoder().decode(buf); }

const PRIV_KEY_STORAGE_PREFIX = "cs_privkey_"; // + uid

// Generate a keypair, store private JWK locally, return public JWK
export async function generateAndStoreKeyPairForUid(uid: string) {
  const kp = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true, // extractable so we can export private (for this demo)
    ["deriveKey"]
  );

  const pubJwk = await crypto.subtle.exportKey("jwk", kp.publicKey);
  const privJwk = await crypto.subtle.exportKey("jwk", kp.privateKey);

  // store private JWK locally (secure storage recommended)
  localStorage.setItem(PRIV_KEY_STORAGE_PREFIX + uid, JSON.stringify(privJwk));

  // return public jwk so caller can upload to Firestore
  return pubJwk;
}

export async function ensureLocalPrivateKeyExists(uid: string) {
  const key = localStorage.getItem(PRIV_KEY_STORAGE_PREFIX + uid);
  if (key) return JSON.parse(key);
  
  // no local private key: try to generate (but you typically call generateAndStore at signup)
  // We call this for its side-effect of storing the key, so we don't need the return value here.
  await generateAndStoreKeyPairForUid(uid);
  
  return JSON.parse(localStorage.getItem(PRIV_KEY_STORAGE_PREFIX + uid)!);
}

// Import a public JWK (other user's) into a CryptoKey
export async function importPublicKeyFromJwk(pubJwk: JsonWebKey) {
  return crypto.subtle.importKey("jwk", pubJwk, { name: "ECDH", namedCurve: "P-256" }, false, []);
}

// Import private key JWK stored locally
export async function importPrivateKeyFromJwk(privJwk: JsonWebKey) {
  return crypto.subtle.importKey("jwk", privJwk, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey"]);
}

// Derive a symmetric AES-GCM CryptoKey given myPrivateKey (CryptoKey) and otherPublicKey (CryptoKey)
export async function deriveSharedKey(myPrivateKey: CryptoKey, otherPublicKey: CryptoKey) {
  const sharedKey = await crypto.subtle.deriveKey(
    { name: "ECDH", public: otherPublicKey },
    myPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return sharedKey;
}

// Encrypt text using derived AES-GCM key; returns { ciphertextBase64, ivBase64 }
export async function encryptWithSharedKey(sharedKey: CryptoKey, plaintext: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, sharedKey, utf8Encode(plaintext));
  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

// Decrypt
export async function decryptWithSharedKey(sharedKey: CryptoKey, ciphertextB64: string, ivB64: string) {
  const ctBuf = base64ToArrayBuffer(ciphertextB64);
  const ivBuf = base64ToArrayBuffer(ivB64);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(ivBuf) }, sharedKey, ctBuf);
  return utf8Decode(decrypted);
}
