import { useEffect, useState } from "react";
import { api } from "../api.js";
import Topbar from "../components/Topbar.jsx";

const icons = {
  books:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  members:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  issued:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  overdue:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

function StatCard({ label, value, hint, color, icon }) {
  const colorMap = {
    brass: "bg-brass-50 text-brass border-brass-100",
    slate: "bg-slate-50 text-slate border-slate-100",
    rust:  "bg-rust-50  text-rust  border-rust-100",
    moss:  "bg-moss-50  text-moss  border-moss-100",
  };
  return (
    <div className="card-hover p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg border ${colorMap[color]}`}>{icon}</div>
      </div>
      <div className="font-display text-3xl font-semibold text-ink mb-1">{value}</div>
      <div className="text-[11px] font-mono uppercase tracking-widest text-ink/40 mb-0.5">{label}</div>
      {hint && <div className="text-xs text-ink/35 mt-1">{hint}</div>}
    </div>
  );
}

function SkeletonCard() {
  return <div className="card p-5"><div className="skeleton h-20 w-full" /></div>;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="h-16 skeleton rounded-lg mb-7" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5"><div className="skeleton h-64 w-full" /></div>
        <div className="card p-5"><div className="skeleton h-64 w-full" /></div>
      </div>
    </div>
  );
  if (!stats) return <div className="text-rust text-sm">Could not load dashboard data.</div>;

  return (
    <div>
      <Topbar title="Dashboard" subtitle="An overview of the collection, right now." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Titles Catalogued" value={stats.total_titles}
          hint={`${stats.total_books} total copies`} color="brass" icon={icons.books} />
        <StatCard label="Registered Members" value={stats.total_members}
          color="slate" icon={icons.members} />
        <StatCard label="Currently Issued" value={stats.issued_now}
          hint="active loans" color="slate" icon={icons.issued} />
        <StatCard label="Overdue Returns" value={stats.overdue_count}
          hint={stats.overdue_count > 0 ? "needs attention" : "all on time"}
          color={stats.overdue_count > 0 ? "rust" : "moss"} icon={icons.overdue} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card animate-slide-up animate-delay-100">
          <div className="section-header">
            <h2 className="font-display text-base font-semibold">Recent Activity</h2>
            <span className="badge-moss gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-moss animate-pulse-dot" />
              Live
            </span>
          </div>
          {stats.recent_activity.length === 0 ? (
            <p className="text-sm text-ink/40 py-10 text-center">No transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="th-ledger">Member</th>
                    <th className="th-ledger">Book</th>
                    <th className="th-ledger">Due</th>
                    <th className="th-ledger">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_activity.map((r) => (
                    <tr key={r.id} className={`tr-hover ${r.display_status === "Overdue" ? "tr-overdue" : ""}`}>
                      <td className="td-ledger font-medium">{r.first_name} {r.last_name}</td>
                      <td className="td-ledger text-ink/65 max-w-[140px] truncate">{r.book_title}</td>
                      <td className="td-ledger font-mono text-xs text-ink/55">{r.due_date}</td>
                      <td className="td-ledger">
                        <span className={
                          r.display_status === "Overdue"  ? "badge-rust" :
                          r.display_status === "Returned" ? "badge-moss" : "badge-slate"
                        }>{r.display_status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Popular Books */}
        <div className="card animate-slide-up animate-delay-200">
          <div className="section-header">
            <h2 className="font-display text-base font-semibold">Popular Books</h2>
            <span className="text-[10.5px] font-mono text-ink/35">last 30 days</span>
          </div>
          {stats.popular_books.length === 0 ? (
            <p className="text-sm text-ink/40 py-10 text-center">No issues in the last 30 days.</p>
          ) : (() => {
            const max = Math.max(...stats.popular_books.map(b => b.issues), 1);
            return (
              <div className="p-4 space-y-3">
                {stats.popular_books.map((b, i) => (
                  <div key={i} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink truncate">{b.title}</div>
                        <div className="text-[11px] text-ink/40 font-mono">{b.author} · {b.genre}</div>
                      </div>
                      <span className="text-xs font-mono text-ink/50 ml-3 shrink-0">{b.issues}×</span>
                    </div>
                    <div className="h-1 bg-ink/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brass rounded-full transition-all duration-500"
                        style={{ width: `${(b.issues / max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
