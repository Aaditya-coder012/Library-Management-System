import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import { api } from "../api.js";

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12 rounded-l-2xl text-parchment relative overflow-hidden"
         style={{ background: "linear-gradient(155deg, #1c1a17 0%, #2d2820 60%, #1a1209 100%)" }}>
      <div className="absolute inset-0 opacity-[0.04]"
           style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #f6f2e9 1px, transparent 0)", backgroundSize: "20px 20px" }} />
      <div className="absolute bottom-0 right-0 opacity-10 select-none" style={{ fontSize: "11rem", lineHeight: 1 }}>🏛️</div>

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
            Join the<br/>Library<br/>Network.
          </h2>
          <p className="text-parchment/50 text-sm leading-relaxed max-w-[240px]">
            Create your staff account to start managing the collection and member records.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        {["Role-based access control", "Real-time fine tracking", "Analytics dashboard"].map((label, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-brass" />
            <span className="text-parchment/40 text-xs font-mono">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const data = await api.register({ name: form.name, email: form.email, password: form.password });
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
            <div className="mb-7">
              <h1 className="font-display text-2xl font-semibold text-ink mb-1">Create an account</h1>
              <p className="text-sm text-ink/45">Register to access the library dashboard</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-rust/[0.08] border border-rust/25 rounded-lg text-sm text-rust">
                <span className="shrink-0">⚠</span> {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                <input id="reg-name" type="text" required autoComplete="name"
                  value={form.name} onChange={set("name")} className="input" placeholder="Dr. Jane Doe" />
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <input id="reg-email" type="email" required autoComplete="email"
                  value={form.email} onChange={set("email")} className="input" placeholder="you@manit.ac.in" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Password</label>
                  <input id="reg-password" type="password" required autoComplete="new-password"
                    value={form.password} onChange={set("password")} className="input" placeholder="Min. 6 chars" />
                </div>
                <div>
                  <label className="input-label">Confirm</label>
                  <input id="reg-confirm" type="password" required autoComplete="new-password"
                    value={form.confirm} onChange={set("confirm")} className="input" placeholder="Re-enter" />
                </div>
              </div>
              <button id="reg-submit" type="submit" disabled={loading}
                className="btn-primary w-full py-2.5 mt-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="animate-pulse-dot">●</span> Creating account…
                  </span>
                ) : "Create Account →"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-ink/45">
              Already have an account?{" "}
              <Link to="/login" className="text-brass hover:text-brass/70 font-medium transition-colors">
                Sign in
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
