// src/pages/ChatPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import type { Chat } from "../types";

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const nav = useNavigate();

  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId || !user?.uid) {
      setIsLoading(false);
      return;
    }

    const findOtherParticipant = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const chatDocRef = doc(db, "chats", chatId);
        const chatDocSnap = await getDoc(chatDocRef);

        if (chatDocSnap.exists()) {
          const chatData = chatDocSnap.data() as Chat;
          const otherId = chatData.participants.find(p => p !== user.uid);
          if (otherId) {
            setOtherUserId(otherId);
          } else {
            throw new Error("Could not determine the other participant.");
          }
        } else {
          throw new Error("Chat not found.");
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while loading the chat.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    findOtherParticipant();
  }, [chatId, user?.uid]);

  const renderContent = () => {
    if (!chatId) {
      return (
        <div className="h-full hidden md:flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow">
          <p className="text-slate-500">Select a chat to start messaging.</p>
        </div>
      );
    }
    if (isLoading) {
      return <div className="h-full flex items-center justify-center"><p>Loading chat...</p></div>;
    }
    if (error) {
      return <div className="h-full flex items-center justify-center"><p className="text-red-500">{error}</p></div>;
    }
    if (otherUserId) {
      return (
        <ChatWindow
          chatId={chatId}
          otherUserId={otherUserId}
          onBack={() => nav("/chats")}
        />
      );
    }
    return <div className="h-full flex items-center justify-center"><p className="text-red-500">Could not load chat participant.</p></div>;
  };

  return (
    <Layout>
      {/* This container now controls the responsive layout */}
      <div className="flex h-[calc(100vh-84px)]"> {/* Fills the available height */}
        
        {/* ChatList: Hidden on mobile IF a chat is selected */}
        <div className={`w-full transition-all duration-300 md:w-80 ${chatId ? 'hidden md:block' : 'block'}`}>
          <ChatList />
        </div>
        
        {/* ChatWindow container: Hidden on mobile UNLESS a chat is selected */}
        <div className={`flex-1 ${chatId ? 'block' : 'hidden md:block'}`}>
          {renderContent()}
        </div>

      </div>
    </Layout>
  );
}