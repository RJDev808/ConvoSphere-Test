// src/pages/Settings.tsx
import { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../AuthContext";
import { doc, updateDoc } from "../firebase";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function Settings() {
  const { user, deleteAccount } = useAuth();
  const [lang, setLang] = useState("en");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  const saveLang = async () => {
    if (!user) return;
    try {
      const docRef = doc(/* db */ (await import("../firebase")).db, "users", user.uid);
      await updateDoc(docRef, { preferredLang: lang });
      setMsg("Saved");
    } catch (err) {
      console.error(err);
      setMsg("Error saving");
    }
  };

  const handleDelete = async () => {
    setMsg("");
    if (!user) { setMsg("No user"); return; }
    try {
      // reauthenticate because delete requires recent login
      if (!pw) { setMsg("Please enter your password to confirm"); return; }
      const cred = EmailAuthProvider.credential(user.email || "", pw);
      await reauthenticateWithCredential(user, cred);
      await deleteAccount();
      setMsg("Account deleted");
      // on success, auth state will change and app redirects
    } catch (err: any) {
      console.error(err);
      setMsg(err.message || "Delete failed");
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-xl font-semibold">Settings</h2>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          <h3 className="font-medium mb-2">Language preference</h3>
          <select value={lang} onChange={e=>setLang(e.target.value)} className="p-2 border rounded">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="bn">Bengali</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
          <div className="mt-3">
            <button onClick={saveLang} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          <h3 className="font-medium mb-2 text-red-600">Delete account</h3>
          <p className="text-sm text-slate-500 mb-2">This will permanently remove your account and profile.</p>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Enter your password to confirm" className="w-full p-2 border rounded mb-2" />
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete account</button>
          {msg && <div className="mt-2 text-sm">{msg}</div>}
        </div>
      </div>
    </Layout>
  );
}
