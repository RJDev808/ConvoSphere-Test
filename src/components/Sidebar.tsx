// src/components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ThemeToggle from "./ThemeToggle";
import { MessageSquare, Search, Settings, LogOut } from 'lucide-react';

// New SVG Logo Component
const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" className="text-blue-600 dark:text-blue-400">
        <path fill="currentColor" d="M50 10 C 27.9 10 10 27.9 10 50 C 10 72.1 27.9 90 50 90 C 58.5 90 66.4 87.5 73 83.2 L 73 69.8 C 67.2 73.4 60.9 75.8 54.2 75.8 C 38 75.8 25.2 63 25.2 46.8 C 25.2 30.6 38 17.8 54.2 17.8 C 60.9 17.8 67.2 20.2 73 23.8 L 73 10.4 C 66.4 6.1 58.5 4.2 50 4.2 L 50 10 Z M 90 50 C 90 38.3 84.1 27.8 75.8 21.1 L 62.4 21.1 C 68.2 26.9 71.6 34.6 71.6 43.2 C 71.6 51.8 68.2 59.5 62.4 65.3 L 75.8 65.3 C 84.1 58.6 90 48.1 90 50 Z" />
    </svg>
);


export default function Sidebar() {
  const { logout, userProfile } = useAuth();
  const nav = useNavigate();

  const doLogout = async () => {
    await logout();
    nav("/");
  };

  const navItems = [
    { to: "/chats", label: "Chats", icon: MessageSquare },
    { to: "/search", label: "Search", icon: Search },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-20 md:w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 h-screen p-3 md:p-4 flex flex-col justify-between">
      {/* Top Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
            <Logo />
            <h2 className="hidden md:block text-2xl font-bold text-blue-600 dark:text-blue-400">
                Convosphere
            </h2>
        </div>
        
        <nav className="flex flex-col gap-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-center md:justify-start gap-3 px-3 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-blue-100 dark:bg-slate-800 font-semibold text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-slate-800"
                }`
              }
            >
              <item.icon size={20} />
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t dark:border-slate-700 pt-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
            <img 
                src={userProfile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.username}`} 
                alt="My Avatar" 
                className="w-10 h-10 rounded-full bg-gray-200"
            />
            <div className="hidden md:block overflow-hidden">
                <p className="font-semibold truncate">{userProfile?.username}</p>
                <p className="text-xs text-slate-500 truncate">{userProfile?.email}</p>
            </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="hidden md:inline text-sm text-gray-600 dark:text-gray-400">Theme</span>
          <ThemeToggle />
        </div>
        <button
          onClick={doLogout}
          className="flex items-center justify-center md:justify-start gap-3 w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
        >
          <LogOut size={20} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
