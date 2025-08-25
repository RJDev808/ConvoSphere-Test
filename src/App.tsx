// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./AuthContext";

// A small component to handle the redirect logic
function Redirector() {
    const { user } = useAuth();
    // If user is logged in, redirect from root to /chats, which is our new dashboard
    return user ? <Navigate to="/chats" /> : <Home />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Redirector />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* The Dashboard route is removed, ChatPage is now the main view */}
          <Route path="/chats" element={<ChatPage />} />
          <Route path="/chats/:chatId" element={<ChatPage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
