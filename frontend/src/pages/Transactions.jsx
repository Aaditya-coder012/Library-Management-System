import { useEffect, useState } from "react";
import { api } from "../api.js";
import Topbar from "../components/Topbar.jsx";
import { useToast } from "../App.jsx";

function FormField({ label, children }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      {children}
    </div>
  );
}

export default function Transactions() {
  const toast = useToast();
  const [issueForm, setIssueForm] = useState({ member_code: "", accession_no: "" });
  const [returnForm, setReturnForm] = useState({ accession_no: "" });
  const [busyIssue, setBusyIssue] = useState(false);
  const [busyReturn, setBusyReturn] = useState(false);
  const [rows, setRows] = useState([]);

  const load = () => {
    api.getTransactions({ status: "Issued" }).then(setRows).catch((e) => toast(e.message, "error"));
  };
  useEffect(load, []);

  const issue = async (e) => {
    e.preventDefault();
    setBusyIssue(true);
    try {
      const txn = await api.issueBook(issueForm);
      toast(`Issued "${txn.book_title}" to ${txn.first_name} ${txn.last_name} — due ${txn.due_date}`);
      setIssueForm({ member_code: "", accession_no: "" });
      load();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusyIssue(false);
    }
  };

  const doReturn = async (e) => {
    e.preventDefault();
    setBusyReturn(true);
    try {
      const txn = await api.returnBook(returnForm);
      toast(
        txn.fine_amount > 0
          ? `Returned "${txn.book_title}" — fine of ₹${txn.fine_amount} recorded`
          : `Returned "${txn.book_title}" — no fine due`
      );
      setReturnForm({ accession_no: "" });
      load();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusyReturn(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <Topbar title="Issue / Return" subtitle="Record a book leaving or returning to the shelf." />

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <form onSubmit={issue} className="card p-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
              </svg>
            </div>
            <div>
              <h2 className="font-display text-base font-semibold">Issue Book</h2>
              <p className="text-xs text-ink/40">Loan a book to a member</p>
            </div>
          </div>
          <FormField label="Member ID">
            <input required className="input" placeholder="e.g. MANIT2201"
              value={issueForm.member_code}
              onChange={(e) => setIssueForm({ ...issueForm, member_code: e.target.value })} />
          </FormField>
          <FormField label="Accession No.">
            <input required className="input" placeholder="e.g. CSE-001"
              value={issueForm.accession_no}
              onChange={(e) => setIssueForm({ ...issueForm, accession_no: e.target.value })} />
          </FormField>
          <button disabled={busyIssue} className="btn-primary w-full">
            {busyIssue ? "Processing…" : "Issue Book →"}
          </button>
        </form>

        <form onSubmit={doReturn} className="card p-6 space-y-4 animate-slide-up animate-delay-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-moss-50 border border-moss-100 text-moss">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
              </svg>
            </div>
            <div>
              <h2 className="font-display text-base font-semibold">Return Book</h2>
              <p className="text-xs text-ink/40">Process a book return</p>
            </div>
          </div>
          <FormField label="Accession No.">
            <input required className="input" placeholder="e.g. CSE-001"
              value={returnForm.accession_no}
              onChange={(e) => setReturnForm({ accession_no: e.target.value })} />
          </FormField>
          <p className="text-xs text-ink/40 bg-ink/[0.03] rounded-lg px-3 py-2.5 border border-ink/[0.06]">
            Returns the oldest active loan on this book. A fine of <strong>₹5/day</strong> is applied automatically for late returns.
          </p>
          <button disabled={busyReturn} className="btn-primary w-full">
            {busyReturn ? "Processing…" : "Return Book ↩"}
          </button>
        </form>
      </div>

      {/* Active issues table */}
      <div className="card overflow-x-auto animate-slide-up animate-delay-200">
        <div className="section-header">
          <div>
            <h2 className="font-display text-base font-semibold">Active Issues</h2>
            <p className="text-xs text-ink/40 mt-0.5">{rows.length} book{rows.length !== 1 ? "s" : ""} currently on loan</p>
          </div>
          {rows.filter(r => r.display_status === "Overdue").length > 0 && (
            <span className="badge-rust">
              {rows.filter(r => r.display_status === "Overdue").length} overdue
            </span>
          )}
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th-ledger">Member</th>
              <th className="th-ledger">Book</th>
              <th className="th-ledger">Acc. No.</th>
              <th className="th-ledger">Issued</th>
              <th className="th-ledger">Due Date</th>
              <th className="th-ledger">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="td-ledger text-center text-ink/40 py-12">
                <div className="text-3xl mb-2">✓</div>
                No active issues right now.
              </td></tr>
            )}
            {rows.map((r) => {
              const isOverdue = r.display_status === "Overdue";
              return (
                <tr key={r._id || r.id} className={`tr-hover ${isOverdue ? "tr-overdue" : ""}`}>
                  <td className="td-ledger">
                    <div className="font-medium">{r.first_name} {r.last_name}</div>
                    <div className="text-xs font-mono text-ink/40">{r.member_code}</div>
                  </td>
                  <td className="td-ledger text-ink/70">{r.book_title}</td>
                  <td className="td-ledger font-mono text-xs text-ink/55">{r.accession_no}</td>
                  <td className="td-ledger font-mono text-xs text-ink/50">{r.issue_date}</td>
                  <td className="td-ledger font-mono text-xs font-medium">{r.due_date}</td>
                  <td className="td-ledger">
                    <span className={isOverdue ? "badge-rust" : "badge-slate"}>
                      {r.display_status}
                      {isOverdue && r.live_fine > 0 && ` · ₹${r.live_fine}`}
                    </span>
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
