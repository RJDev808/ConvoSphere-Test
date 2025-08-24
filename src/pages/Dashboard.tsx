// src/pages/Dashboard.tsx
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
  <div className="max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">
      Welcome back, <span className="text-brand-light dark:text-brand-dark">{user?.email}</span>
    </h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link to="/chats" className="p-6 rounded-xl shadow bg-card-light dark:bg-card-dark hover:scale-105 transition">
        💬 Open Chats
      </Link>
      <Link to="/search" className="p-6 rounded-xl shadow bg-card-light dark:bg-card-dark hover:scale-105 transition">
        🔍 Find People
      </Link>
      <Link to="/settings" className="p-6 rounded-xl shadow bg-card-light dark:bg-card-dark hover:scale-105 transition">
        ⚙️ Settings
      </Link>
    </div>
  </div>
</Layout>

  );
}
