// src/components/ChatList.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
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
    <div className="w-full flex flex-col bg-white dark:bg-slate-900 h-full">
      <h3 className="font-semibold p-4 border-b dark:border-slate-800 text-lg">Recent Chats</h3>
      <div className="flex-1 overflow-y-auto">
        {loading && <div className="p-4 text-sm text-slate-500">Loading chats...</div>}
        {!loading && chats.length === 0 && (
          <div className="p-4 text-center text-sm text-slate-500">
            No chats yet. Click the '+' button to find someone!
          </div>
        )}
        {chats.map((c) => (
          <div
            key={c.id}
            onClick={() => nav(`/chats/${c.id}`)}
            className={`p-3 flex items-center gap-3 cursor-pointer transition border-b dark:border-slate-800 ${c.id === chatId ? 'bg-blue-100 dark:bg-slate-800' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}
          >
            <img 
              src={c.otherUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${c.otherUser?.username || '?'}`} 
              alt={c.otherUser?.username} 
              className="w-12 h-12 rounded-full bg-gray-200"
            />
            <div className="flex-1 overflow-hidden">
                <div className="font-medium truncate">{c.otherUser?.username || 'Unknown User'}</div>
                <div className="text-sm text-slate-500 truncate">Last message placeholder...</div>
            </div>
          </div>
        ))}
      </div>
      <Link to="/search" className="absolute bottom-6 right-6 md:right-auto md:left-[calc(24rem-3.5rem)] bg-brand-light dark:bg-brand-dark text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
        <PlusCircle size={24} />
      </Link>
    </div>
  );
}
