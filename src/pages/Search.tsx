// src/pages/Search.tsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { createOrOpenChat } from "../services/chatService";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../types";

export default function Search() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { user } = useAuth();
  const nav = useNavigate();

  const doSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", term.trim()));
      const snap = await getDocs(q);
      const list = snap.docs
        .filter(doc => doc.id !== user?.uid)
        .map(d => d.data() as UserProfile);
      setResults(list);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (otherUser: UserProfile) => {
    if (!user) return;
    let lang = prompt(`Enter the language code you want to receive messages from ${otherUser.username} in (e.g., en, es, hi).`, "en");
    
    if (!lang) {
      lang = "en";
    }

    const chatId = await createOrOpenChat(user.uid, otherUser.uid, lang.trim().toLowerCase());
    nav(`/chats/${chatId}`);
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        <Sidebar />
        <main className="flex-1 p-6">
            <div className="max-w-xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Find People</h2>
                <form onSubmit={doSearch} className="flex gap-2 mb-6">
                    <input value={term} onChange={e => setTerm(e.target.value)} placeholder="Enter exact username" className="flex-1 p-2 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700" />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg" disabled={loading}>
                        {loading ? "Searching..." : "Search"}
                    </button>
                </form>
                <div className="space-y-3">
                    {searched && results.length === 0 && !loading && (
                        <div className="text-center p-6 bg-gray-100 dark:bg-slate-800 rounded-lg">
                            <p className="text-slate-500">No user found with that username.</p>
                        </div>
                    )}
                    {results.map(r => (
                        <div key={r.uid} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <img src={r.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${r.username}`} alt={r.username} className="w-10 h-10 rounded-full bg-gray-200" />
                                <div>
                                    <div className="font-medium">{r.username}</div>
                                    <div className="text-sm text-slate-500">{r.email}</div>
                                </div>
                            </div>
                            <div>
                                <button onClick={() => startChat(r)} className="px-3 py-1 bg-green-600 text-white rounded-md text-sm">Chat</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    </div>
  );
}
