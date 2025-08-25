// src/components/ChatWindow.tsx
import React, { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { ArrowLeft, Trash2 } from "lucide-react";
import { sendEncryptedMessage, decryptMessageForUser, deleteMessageForEveryone } from "../services/chatService";
import type { UserProfile, EncryptedMessage, Chat } from "../types";
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text || !targetLang || targetLang === "en") { return ""; }
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyVPzcpFCzTaww9D5CGHyEYLw-iHd7uE8DV0BEg6KLgSqgmvgxtqMk8307FWxFeCT3B/exec';
    const url = `${scriptUrl}?text=${encodeURIComponent(text)}&target=${targetLang}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API failed with status: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.translatedText || "";
    } catch (error) {
      console.error("Translation failed:", error);
      return "[Translation unavailable]";
    }
}

type Message = {
  id: string;
  text: string;
  sender: string;
  createdAt: Date;
  translatedText?: string;
};

const formatDateSeparator = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, 'EEEE');
    return format(date, 'MMMM d, yyyy');
};

export default function ChatWindow({ chatId, otherUserId, onBack }: { chatId: string; otherUserId: string; onBack: () => void; }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [chatDetails, setChatDetails] = useState<Chat | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMetadata() {
      const userDocRef = doc(db, "users", otherUserId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) setOtherUser(userSnap.data() as UserProfile);

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) setChatDetails(chatSnap.data() as Chat);
    }
    fetchMetadata();
  }, [chatId, otherUserId]);

  useEffect(() => {
    if (!chatId || !user || !otherUser) return;
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
    
    const unsub = onSnapshot(q, async (snap) => {
      const myPrefLang = chatDetails?.prefs?.[user.uid] || 'en';
      const processedMessages = await Promise.all(
        snap.docs.map(async (d) => {
          // --- THIS LINE NO LONGER CAUSES AN ERROR ---
          const encryptedMsgData = d.data() as Omit<EncryptedMessage, 'id'>;
          let plaintext = "[Encryption Error]";
          try {
            plaintext = await decryptMessageForUser(encryptedMsgData, user.uid, otherUser.publicKeyJwk);
          } catch (e) { console.error("Decryption failed:", e); }

          const msg: Message = {
            id: d.id,
            text: plaintext,
            sender: encryptedMsgData.sender,
            createdAt: (encryptedMsgData.timestamp as Timestamp).toDate(),
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
  }, [chatId, user, otherUser, chatDetails]);

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
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm("Delete this message for everyone?")) {
        try {
            await deleteMessageForEveryone(chatId, messageId);
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
    }
  };

  const groupedMessages: { [key: string]: Message[] } = messages.reduce((acc, msg) => {
    const dateKey = format(msg.createdAt, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {} as { [key: string]: Message[] });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="border-b dark:border-slate-700 p-3 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full md:hidden">
            <ArrowLeft size={20} />
          </button>
          <img 
            src={otherUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser?.username || '?'}`} 
            alt={otherUser?.username} 
            className="w-10 h-10 rounded-full bg-gray-200"
          />
          <div>
            <div className="font-semibold">{otherUser?.username || "..."}</div>
            <div className="text-xs text-slate-500">End-to-end encrypted</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
            <React.Fragment key={date}>
                <div className="text-center my-4">
                    <span className="bg-gray-200 dark:bg-slate-700 text-xs px-2 py-1 rounded-full">
                        {formatDateSeparator(new Date(date))}
                    </span>
                </div>
                {msgs.map(msg => (
                    <div key={msg.id} className={`group flex items-end gap-2 ${msg.sender === user?.uid ? "justify-end" : "justify-start"}`}>
                        {msg.sender === user?.uid && (
                            <button onClick={() => handleDeleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-500">
                                <Trash2 size={16}/>
                            </button>
                        )}
                        <div className={`max-w-md p-3 rounded-xl relative ${msg.sender === user?.uid ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-700'}`}>
                            <p>{msg.text}</p>
                            {msg.translatedText && (
                                <p className="pt-2 mt-2 border-t border-black border-opacity-20 text-xs italic opacity-90">
                                    {msg.translatedText}
                                </p>
                            )}
                            <div className="text-right text-xs opacity-70 mt-1">
                                {format(msg.createdAt, 'p')}
                            </div>
                        </div>
                    </div>
                ))}
            </React.Fragment>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t dark:border-slate-700 p-3 flex gap-2 bg-gray-50 dark:bg-slate-800">
        <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1 border rounded-lg px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600" />
        <button onClick={handleSendMessage} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">Send</button>
      </div>
    </div>
  );
}
