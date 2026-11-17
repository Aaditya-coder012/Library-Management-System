import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useCallback, createContext, useContext, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Books from "./pages/Books.jsx";
import Members from "./pages/Members.jsx";
import Transactions from "./pages/Transactions.jsx";
import Fines from "./pages/Fines.jsx";
import Reports from "./pages/Reports.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

// ── Toast ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

// ── Auth ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1300px] mx-auto animate-fade-in">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books" element={<Books />} />
            <Route path="/members" element={<Members />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/fines" element={<Fines />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  // ── Auth state (persisted to localStorage) ──────────────────────────────
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lms_user")); }
    catch { return null; }
  });

  const login = useCallback((token, userData) => {
    localStorage.setItem("lms_token", token);
    localStorage.setItem("lms_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
    setUser(null);
  }, []);

  // Verify token on mount (silently logout if expired)
  useEffect(() => {
    const token = localStorage.getItem("lms_token");
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (!r.ok) logout(); })
      .catch(() => {});
  }, [logout]);

  // ── Toasts ─────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const pushToast = useCallback((message, kind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <ToastContext.Provider value={pushToast}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>

        {/* Toast notifications */}
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 min-w-[280px] max-w-[380px]">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-modal text-sm font-medium
                          animate-slide-in-right border ${
                t.kind === "error"
                  ? "bg-rust text-parchment border-rust/80"
                  : "bg-ink text-parchment border-white/10"
              }`}
            >
              <span className="text-base mt-0.5 shrink-0">
                {t.kind === "error" ? "⚠️" : "✓"}
              </span>
              <span className="leading-snug">{t.message}</span>
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}
