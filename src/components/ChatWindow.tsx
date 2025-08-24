// src/components/ChatWindow.tsx
import React, { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { ArrowLeft } from "lucide-react";
import { sendEncryptedMessage, decryptMessageForUser } from "../services/chatService";
import type { UserProfile, EncryptedMessage } from "../types";

// Message state in the component will hold the DECRYPTED text
type Message = {
  id: string;
  text: string;
  sender: string;
  createdAt: { seconds: number; nanoseconds: number };
  translatedText?: string;
};

type Props = {
  chatId: string;
  otherUserId: string;
  onBack: () => void;
};

// This function runs directly in the browser
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !targetLang || targetLang === "en") { // Assuming 'en' is the base language, no need to translate
    return "";
  }
  try {
    const response = await fetch("https://libretranslate-ptg8.onrender.com/translate", {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: targetLang,
        format: "text",
      }),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Translation API failed");
    const data = await response.json();
    return data.translatedText || "";
  } catch (error) {
    console.error("Translation failed:", error);
    return "[Translation unavailable]";
  }
}

export default function ChatWindow({ chatId, otherUserId, onBack }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [prefs, setPrefs] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMetadata() {
      if (!otherUserId) return;
      const userDocRef = doc(db, "users", otherUserId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) setOtherUser(userSnap.data() as UserProfile);

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists() && chatSnap.data()?.prefs) {
        setPrefs(chatSnap.data().prefs);
      }
    }
    fetchMetadata();
  }, [chatId, otherUserId]);

  useEffect(() => {
    if (!chatId || !user || !otherUser) return;
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
    
    const unsub = onSnapshot(q, async (snap) => {
      const myPrefLang = prefs[user.uid] || 'en';

      const processedMessages = await Promise.all(
        snap.docs.map(async (d) => {
          const encryptedMsgData = d.data() as Omit<EncryptedMessage, 'id'>;
          let plaintext = "[Encryption Error]";
          
          try {
            plaintext = await decryptMessageForUser(encryptedMsgData, user.uid, otherUser.publicKeyJwk);
          } catch (e) { console.error("Decryption failed:", e); }

          const msg: Message = {
            id: d.id,
            text: plaintext,
            sender: encryptedMsgData.sender,
            createdAt: encryptedMsgData.timestamp,
          };

          if (msg.sender !== user.uid) {
            msg.translatedText = await translateText(msg.text, myPrefLang);
          }
          return msg;
        })
      );
      setMessages(processedMessages);
    });
    return () => unsub();
  }, [chatId, user, otherUser, prefs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !otherUser) return;
    try {
      await sendEncryptedMessage(chatId, user.uid, otherUser.uid, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send encrypted message:", error);
      alert("Failed to send message. Ensure recipient has set up their account correctly.");
    }
  };

  // THIS IS THE NEW, CORRECTED FUNCTION
  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!user) return;
    const newLang = e.target.value;

    // 1. Update the preference in Firestore
    await updateDoc(doc(db, "chats", chatId), { [`prefs.${user.uid}`]: newLang });
    
    // 2. Update the local state for preferences
    setPrefs((prev) => ({ ...prev, [user.uid]: newLang }));

    // 3. Force re-translation of existing messages
    const retranslatedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (msg.sender !== user.uid) {
          msg.translatedText = await translateText(msg.text, newLang);
        }
        return msg;
      })
    );
    setMessages(retranslatedMessages);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="border-b dark:border-slate-700 p-3 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="font-semibold">{otherUser?.username || "..."}</div>
            <div className="text-xs text-gray-500">End-to-end encrypted</div>
          </div>
        </div>
        {user && chatId && (
          <select
            value={prefs?.[user.uid] || "en"}
            onChange={handleLanguageChange}
            className="p-1 border rounded bg-white dark:bg-slate-700 text-sm"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
            <option value="bn">Bengali</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="ar">Arabic</option>
          </select>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === user?.uid ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-md p-3 rounded-xl ${
                msg.sender === user?.uid
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              <p>{msg.text}</p>
              {msg.translatedText && (
                <p className="pt-2 mt-2 border-t border-black border-opacity-20 text-xs italic opacity-90">
                  {msg.translatedText}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t dark:border-slate-700 p-3 flex gap-2 bg-gray-50 dark:bg-slate-800">
        <input
          type="text"
          placeholder="Type an encrypted message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 border rounded-lg px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600"
        />
        <button onClick={handleSendMessage} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
          Send
        </button>
      </div>
    </div>
  );
}