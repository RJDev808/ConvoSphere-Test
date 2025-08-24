// src/components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const nav = useNavigate();

  const doLogout = async () => {
    await logout();
    nav("/");
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 h-screen p-4 flex flex-col justify-between">
      {/* Top Section */}
      <div>
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
          ConvoSphere
        </h2>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {user?.email}
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink
            to="/chats"
            className={({ isActive }) =>
              `px-3 py-2 rounded transition ${
                isActive
                  ? "bg-blue-100 dark:bg-slate-800 font-semibold"
                  : "hover:bg-gray-100 dark:hover:bg-slate-800"
              }`
            }
          >
            Chats
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `px-3 py-2 rounded transition ${
                isActive
                  ? "bg-blue-100 dark:bg-slate-800 font-semibold"
                  : "hover:bg-gray-100 dark:hover:bg-slate-800"
              }`
            }
          >
            Search
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `px-3 py-2 rounded transition ${
                isActive
                  ? "bg-blue-100 dark:bg-slate-800 font-semibold"
                  : "hover:bg-gray-100 dark:hover:bg-slate-800"
              }`
            }
          >
            Settings
          </NavLink>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 border-t dark:border-slate-700 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Theme
          </span>
          <ThemeToggle />
        </div>

        <button
          onClick={doLogout}
          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}