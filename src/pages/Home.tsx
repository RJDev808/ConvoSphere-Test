// src/pages/Home.tsx
import { useState } from "react";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";

// Re-using the Logo component from Sidebar for consistency
const Logo = () => (
    <svg width="48" height="48" viewBox="0 0 100 100" className="text-white mx-auto">
        <path fill="currentColor" d="M50 10 C 27.9 10 10 27.9 10 50 C 10 72.1 27.9 90 50 90 C 58.5 90 66.4 87.5 73 83.2 L 73 69.8 C 67.2 73.4 60.9 75.8 54.2 75.8 C 38 75.8 25.2 63 25.2 46.8 C 25.2 30.6 38 17.8 54.2 17.8 C 60.9 17.8 67.2 20.2 73 23.8 L 73 10.4 C 66.4 6.1 58.5 4.2 50 4.2 L 50 10 Z M 90 50 C 90 38.3 84.1 27.8 75.8 21.1 L 62.4 21.1 C 68.2 26.9 71.6 34.6 71.6 43.2 C 71.6 51.8 68.2 59.5 62.4 65.3 L 75.8 65.3 C 84.1 58.6 90 48.1 90 50 Z" />
    </svg>
);


export default function Home() {
  const { user, signup, login, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to the main chat page now instead of dashboard
  if (user) return <Navigate to="/chats" />;

  // Show a loading spinner during initial auth check
  if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-background-dark"></div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        if (!username.trim()) throw new Error("Please enter a username");
        await signup(email, password, username.trim());
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="text-center mb-8">
            <Logo />
            <h1 className="text-3xl font-bold mt-4 text-white">Convosphere</h1>
            <p className="text-white/80">Connect across languages.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 justify-center mb-6">
            <button type="button" onClick={() => setMode("login")} className={`px-4 py-2 w-full rounded-lg transition ${mode === "login" ? "bg-white/90 text-indigo-600 font-semibold" : "bg-white/20 text-white"}`}>Login</button>
            <button type="button" onClick={() => setMode("register")} className={`px-4 py-2 w-full rounded-lg transition ${mode === "register" ? "bg-white/90 text-indigo-600 font-semibold" : "bg-white/20 text-white"}`}>Register</button>
          </div>

          <div className="space-y-4">
            {mode === "register" && (
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username (unique)" className="w-full p-3 border-0 rounded-lg bg-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/80 outline-none" />
            )}
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required className="w-full p-3 border-0 rounded-lg bg-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/80 outline-none" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full p-3 border-0 rounded-lg bg-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/80 outline-none" />
          </div>

          {error && <div className="text-sm text-red-300 mt-4 text-center">{error}</div>}

          <button type="submit" disabled={isSubmitting} className="w-full bg-white hover:bg-white/90 text-indigo-600 font-bold p-3 rounded-lg transition mt-6 disabled:opacity-50">
            {isSubmitting ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
