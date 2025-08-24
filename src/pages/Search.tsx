// src/pages/Search.tsx
import { useState } from "react";
import Layout from "../components/Layout";
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

  const doSearch = async () => {
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", term.trim()));
      const snap = await getDocs(q);
      const list = snap.docs
        .filter(doc => doc.id !== user?.uid) // Don't show yourself in results
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
    let lang = prompt(`Enter language code to receive messages from ${otherUser.username} (e.g., en, hi, es)`, "en");
    if (!lang) lang = "en";
    const chatId = await createOrOpenChat(user.uid, otherUser.uid, lang);
    nav(`/chats/${chatId}`);
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Search Users</h2>
        <div className="flex gap-2 mb-4">
          <input value={term} onChange={e => setTerm(e.target.value)} placeholder="Enter exact username" className="flex-1 p-2 border rounded" />
          <button onClick={doSearch} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        <div className="space-y-2">
          {searched && results.length === 0 && !loading && (
            <div className="text-center p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
              <p className="text-slate-500">No user found with that username.</p>
            </div>
          )}
          {results.map(r => (
            <div key={r.uid} className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow flex justify-between items-center">
              <div>
                <div className="font-medium">{r.username}</div>
                <div className="text-sm text-slate-500">{r.email}</div>
              </div>
              <div>
                <button onClick={() => startChat(r)} className="px-3 py-1 bg-green-600 text-white rounded">Chat</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}