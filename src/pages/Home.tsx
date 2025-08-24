// src/pages/Home.tsx
import { useState } from "react";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";

export default function Home() {
  const { user, signup, login } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/dashboard" />;

  const handleRegister = async () => {
    setError("");
    if (!username.trim()) { setError("Please enter a username"); return; }
    try {
      await signup(email, password, username.trim());
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  const handleLogin = async () => {
    setError("");
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  return (
    // Added p-4 for spacing on small screens
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition">
      <div className="w-full max-w-md bg-card-light dark:bg-card-dark p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-brand-light dark:text-brand-dark">
          ConvoSphere
        </h1>

        {/* Login/Register Switch */}
        <div className="flex gap-2 justify-center mb-6">
          <button
            onClick={() => setMode("login")}
            className={`px-4 py-2 rounded-lg transition ${
              mode === "login"
                ? "bg-brand-light text-white dark:bg-brand-dark"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`px-4 py-2 rounded-lg transition ${
              mode === "register"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Register
          </button>
        </div>

        {/* Inputs */}
        {mode === "register" && (
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username (unique)"
            className="w-full p-3 border rounded-lg mb-3 bg-gray-50 dark:bg-slate-700 dark:text-white"
          />
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border rounded-lg mb-3 bg-gray-50 dark:bg-slate-700 dark:text-white"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border rounded-lg mb-3 bg-gray-50 dark:bg-slate-700 dark:text-white"
        />

        {/* Error */}
        {error && <div className="text-sm text-red-500 mb-3">{error}</div>}

        {/* Submit Button */}
        {mode === "login" ? (
          <button
            onClick={handleLogin}
            className="w-full bg-brand-light hover:bg-indigo-700 text-white p-3 rounded-lg transition"
          >
            Login
          </button>
        ) : (
          <button
            onClick={handleRegister}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition"
          >
            Create account
          </button>
        )}
      </div>
    </div>
  );
}