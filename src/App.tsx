// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import ProtectedRoute from "./ProtectedRoute";

// It's cleaner to group all protected routes under a single parent ProtectedRoute.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* This route handles the main chat page with the list */}
          <Route path="/chats" element={<ChatPage />} />
          
          {/* THIS IS THE NEW LINE: It handles specific, individual chats */}
          <Route path="/chats/:chatId" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}