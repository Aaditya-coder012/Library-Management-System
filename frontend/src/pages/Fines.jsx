import { useEffect, useState } from "react";
import { api } from "../api.js";
import Topbar from "../components/Topbar.jsx";
import { useToast } from "../App.jsx";

export default function Fines() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [paying, setPaying] = useState(null);

  const load = () => api.getFines().then(setRows).catch((e) => toast(e.message, "error"));
  useEffect(load, []);

  const markPaid = async (id) => {
    setPaying(id);
    try {
      await api.payFine(id);
      toast("Fine marked as paid ✓");
      load();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setPaying(null);
    }
  };

  const unpaid = rows.filter(r => r.status !== "Paid");
  const totalOutstanding = unpaid.reduce((s, r) => s + r.fine, 0);
  const totalPaid = rows.filter(r => r.status === "Paid").reduce((s, r) => s + r.fine_amount, 0);

  return (
    <div>
      <Topbar title="Fine Records" subtitle="Track overdue fines and payment status." />

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-7 animate-slide-up">
        {[
          { label: "Outstanding", value: `₹${totalOutstanding}`, color: "text-rust", bg: "bg-rust-50 border-rust-100" },
          { label: "Unpaid Records", value: unpaid.length, color: "text-slate", bg: "bg-slate-50 border-slate-100" },
          { label: "Total Collected", value: `₹${totalPaid}`, color: "text-moss", bg: "bg-moss-50 border-moss-100" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`card p-4 border ${bg}`}>
            <div className="text-[10.5px] font-mono uppercase tracking-widest text-ink/40 mb-1">{label}</div>
            <div className={`font-display text-2xl font-semibold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto animate-slide-up animate-delay-100">
        <div className="section-header">
          <h2 className="font-display text-base font-semibold">Fine Ledger</h2>
          {rows.length === 0 && <span className="badge-moss">Clean ledger ✓</span>}
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th-ledger">Member</th>
              <th className="th-ledger">Book</th>
              <th className="th-ledger">Days Overdue</th>
              <th className="th-ledger">Fine (₹)</th>
              <th className="th-ledger">Status</th>
              <th className="th-ledger">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="td-ledger text-center text-ink/40 py-12">
                <div className="text-3xl mb-2">🎉</div>
                No fines on record — a clean ledger.
              </td></tr>
            )}
            {rows.map((r) => {
              const isOngoing = r.status === "Unpaid (Ongoing)";
              const isPaid = r.status === "Paid";
              return (
                <tr key={r.id} className={`tr-hover ${!isPaid && r.days_overdue > 0 ? "tr-overdue" : ""}`}>
                  <td className="td-ledger">
                    <div className="font-medium">{r.first_name} {r.last_name}</div>
                    <div className="text-xs font-mono text-ink/40">{r.member_code}</div>
                  </td>
                  <td className="td-ledger text-ink/65 max-w-[160px] truncate">{r.book_title}</td>
                  <td className="td-ledger">
                    <span className={`font-mono text-sm font-medium ${r.days_overdue > 0 ? "text-rust" : "text-ink/40"}`}>
                      {r.days_overdue > 0 ? `+${r.days_overdue}` : "0"}
                    </span>
                  </td>
                  <td className="td-ledger font-mono font-semibold text-ink">{r.fine > 0 ? `₹${r.fine}` : "—"}</td>
                  <td className="td-ledger">
                    <span className={
                      isPaid    ? "badge-moss" :
                      isOngoing ? "badge-slate" :
                      "badge-rust"
                    }>{r.status}</span>
                  </td>
                  <td className="td-ledger">
                    {!isPaid && r.fine > 0 ? (
                      <button
                        onClick={() => markPaid(r.id)}
                        disabled={paying === r.id}
                        className="btn-ghost text-xs text-moss hover:text-moss disabled:opacity-50 px-2 py-1"
                      >
                        {paying === r.id ? "Saving…" : "Mark Paid"}
                      </button>
                    ) : (
                      <span className="text-xs text-ink/25">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
