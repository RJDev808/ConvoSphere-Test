// src/components/ChatList.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import type { Chat, UserProfile } from "../types";

type ChatWithUserData = Chat & { otherUser: UserProfile | null };

export default function ChatList() {
  const { user } = useAuth();
  const { chatId } = useParams();
  const [chats, setChats] = useState<ChatWithUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
    const unsub = onSnapshot(q, async (snapshot) => {
      const chatPromises = snapshot.docs.map(async (chatDoc) => {
        const chatData = { id: chatDoc.id, ...chatDoc.data() } as Chat;
        const otherUid = chatData.participants.find(p => p !== user.uid);
        let otherUser: UserProfile | null = null;
        if (otherUid) {
          const userSnap = await getDoc(doc(db, "users", otherUid));
          if (userSnap.exists()) {
            otherUser = userSnap.data() as UserProfile;
          }
        }
        return { ...chatData, otherUser };
      });

      const resolvedChats = await Promise.all(chatPromises);
      setChats(resolvedChats);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);
  
  return (
    <div className={`w-80 bg-white dark:bg-slate-800 p-4 rounded-lg shadow h-full transition-all duration-300 ${chatId ? 'hidden md:block' : 'block'}`}>
      <h3 className="font-semibold mb-3">Recent Chats</h3>
      <div className="space-y-2">
        {loading && <div className="text-sm text-slate-500">Loading...</div>}
        {!loading && chats.length === 0 && <div className="text-sm text-slate-500">No chats yet.</div>}
        {chats.map((c) => (
          <div
            key={c.id}
            onClick={() => nav(`/chats/${c.id}`)}
            className={`p-3 rounded-lg cursor-pointer transition ${c.id === chatId ? 'bg-blue-100 dark:bg-slate-700' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
          >
            <div className="font-medium">{c.otherUser?.username || 'Unknown User'}</div>
            <div className="text-sm text-slate-500 truncate">Click to open chat</div>
          </div>
        ))}
      </div>
    </div>
  );
}