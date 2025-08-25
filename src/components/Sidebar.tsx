// src/components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo"; // Import the new Logo component
import { MessageSquare, Search, Settings, LogOut } from 'lucide-react';

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
            {/* Use the new Logo component */}
            <Logo className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="hidden md:block text-2xl font-bold text-blue-600 dark:text-blue-400">
                Convosphere
            </h2>
        </div>
        
        <nav className="flex flex-col gap-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end // Add 'end' prop to prevent matching parent routes like /chats/:chatId
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
