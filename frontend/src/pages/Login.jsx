import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12 rounded-l-2xl text-parchment relative overflow-hidden"
         style={{ background: "linear-gradient(155deg, #1c1a17 0%, #2d2820 60%, #1a1209 100%)" }}>
      {/* Decorative dots */}
      <div className="absolute inset-0 opacity-[0.04]"
           style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #f6f2e9 1px, transparent 0)", backgroundSize: "20px 20px" }} />

      {/* Book stack decoration */}
      <div className="absolute bottom-0 right-0 opacity-10 select-none" style={{ fontSize: "11rem", lineHeight: 1 }}>📚</div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-brass/20 border border-brass/30 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a8823c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
          </div>
          <div>
            <div className="font-display text-lg font-semibold">Central Library</div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-brass uppercase">MANIT Bhopal</div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight text-parchment/95 mb-4">
            Knowledge<br/>at your<br/>fingertips.
          </h2>
          <p className="text-parchment/50 text-sm leading-relaxed max-w-[240px]">
            Managing 50,000+ volumes across every department. Serving MANIT since 1965.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        {["Books catalogued", "Active members", "Daily transactions"].map((label, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-brass" />
            <span className="text-parchment/40 text-xs font-mono">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      login(data.token, data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl animate-scale-in">
        <div className="grid lg:grid-cols-2 shadow-modal rounded-2xl overflow-hidden border border-ink/[0.08]">
          <BrandPanel />

          {/* Form panel */}
          <div className="bg-parchment p-10">
            <div className="mb-8">
              <h1 className="font-display text-2xl font-semibold text-ink mb-1">Welcome back</h1>
              <p className="text-sm text-ink/45">Sign in to the library management system</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-rust/[0.08] border border-rust/25 rounded-lg text-sm text-rust">
                <span className="shrink-0">⚠</span> {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="input-label">Email Address</label>
                <input id="login-email" type="email" required autoComplete="email"
                  value={form.email} onChange={set("email")} className="input"
                  placeholder="you@manit.ac.in" />
              </div>
              <div>
                <label className="input-label">Password</label>
                <input id="login-password" type="password" required autoComplete="current-password"
                  value={form.password} onChange={set("password")} className="input"
                  placeholder="••••••••" />
              </div>
              <button id="login-submit" type="submit" disabled={loading}
                className="btn-primary w-full py-2.5 mt-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="animate-pulse-dot">●</span> Signing in…
                  </span>
                ) : "Sign In →"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-ink/45">
              No account?{" "}
              <Link to="/register" className="text-brass hover:text-brass/70 font-medium transition-colors">
                Register here
              </Link>
            </p>

            <p className="text-center text-[10.5px] font-mono text-ink/25 mt-8">
              Est. records since 1965 · Ledger System v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
