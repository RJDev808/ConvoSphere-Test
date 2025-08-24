// src/components/Layout.tsx
import React from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import useTheme from "../hooks/useTheme";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* Navbar */}
      <header className="bg-card-light dark:bg-card-dark shadow p-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold text-brand-light dark:text-brand-dark">
          ConvoSphere
        </Link>
        <div className="flex gap-3 items-center">
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded bg-brand-light text-white dark:bg-brand-dark"
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button
            onClick={logout}
            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content - NOW RESPONSIVE */}
      <main className="flex-1 p-2 md:p-6 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}