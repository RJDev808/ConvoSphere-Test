// src/pages/ChatPage.tsx
import Sidebar from "../components/Sidebar";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import Logo from "../components/Logo"; // Import the new Logo
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { Chat } from "../types";

// This is now the main "dashboard" of the app.
export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const nav = useNavigate();

  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chatId || !user?.uid) {
      setIsLoading(false);
      setOtherUserId(null);
      return;
    }
    const findOtherParticipant = async () => {
      setIsLoading(true);
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnap = await getDoc(chatDocRef);
      if (chatDocSnap.exists()) {
        const otherId = (chatDocSnap.data() as Chat).participants.find(p => p !== user.uid);
        setOtherUserId(otherId || null);
      } else {
        nav("/chats");
      }
      setIsLoading(false);
    };
    findOtherParticipant();
  }, [chatId, user?.uid, nav]);

  // This function now renders the new "dashboard" placeholder
  const renderChatContent = () => {
    if (!chatId) {
      return (
        <div className="h-full hidden md:flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow-inner">
          {/* Use the new Logo component here */}
          <Logo className="w-24 h-24 mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-400">Welcome to Convosphere</h2>
          <p className="text-slate-500">Select a chat to start messaging.</p>
        </div>
      );
    }
    if (isLoading) {
      return <div className="h-full flex items-center justify-center"><p>Loading chat...</p></div>;
    }
    if (otherUserId) {
      return <ChatWindow chatId={chatId} otherUserId={otherUserId} onBack={() => nav("/chats")} />;
    }
    return <div className="h-full flex items-center justify-center"><p className="text-red-500">Could not load chat.</p></div>;
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <Sidebar />
      <main className="flex-1 flex">
        <div className={`w-full transition-all duration-300 md:w-96 border-r dark:border-slate-800 ${chatId ? 'hidden md:flex' : 'flex'}`}>
          <ChatList />
        </div>
        <div className={`flex-1 ${chatId ? 'block' : 'hidden md:block'}`}>
          {renderChatContent()}
        </div>
      </main>
    </div>
  );
}
