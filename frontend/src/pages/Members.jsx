import { useEffect, useState } from "react";
import { api } from "../api.js";
import Topbar from "../components/Topbar.jsx";
import Modal from "../components/Modal.jsx";
import { useToast } from "../App.jsx";

const TYPES = ["Student", "Faculty", "Staff"];
const DEPARTMENTS = ["Computer Science","Mathematics","Physics","Electronics","Mechanical","Civil","Chemistry","Management","Other"];
const emptyForm = { member_code: "", type: TYPES[0], first_name: "", last_name: "", department: DEPARTMENTS[0], email: "", phone: "" };

const typeColors = {
  Student: "badge-slate",
  Faculty: "badge-brass",
  Staff:   "badge-moss",
};

function Avatar({ name }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  const colors = ["bg-brass-50 text-brass border-brass-100", "bg-moss-50 text-moss border-moss-100",
                  "bg-slate-50 text-slate border-slate-100", "bg-rust-50 text-rust border-rust-100"];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  return (
    <div className={`w-8 h-8 rounded-full border flex items-center justify-center
                     text-[11px] font-mono font-semibold shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      {children}
    </div>
  );
}

export default function Members() {
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [type, setType] = useState("All Types");
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = {};
    if (type !== "All Types") params.type = type;
    if (q) params.q = q;
    api.getMembers(params).then(setMembers).catch((e) => toast(e.message, "error"));
  };
  useEffect(load, [type, q]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createMember(form);
      toast(`${form.first_name} ${form.last_name} registered`);
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m) => {
    if (!confirm(`Remove member "${m.first_name} ${m.last_name}"?`)) return;
    try {
      await api.deleteMember(m._id || m.id);
      toast("Member removed");
      load();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return (
    <div>
      <Topbar
        title="Library Members"
        subtitle={`${members.length} member${members.length === 1 ? "" : "s"} on record`}
        action={<button className="btn-primary" onClick={() => setModalOpen(true)}>+ Add Member</button>}
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <input className="input max-w-xs" placeholder="Search name, ID, email…" value={q}
          onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[180px]" value={type} onChange={(e) => setType(e.target.value)}>
          <option>All Types</option>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto animate-slide-up">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th-ledger">Member</th>
              <th className="th-ledger">ID</th>
              <th className="th-ledger">Type</th>
              <th className="th-ledger">Department</th>
              <th className="th-ledger">Active Loans</th>
              <th className="th-ledger">Standing</th>
              <th className="th-ledger">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr><td colSpan={7} className="td-ledger text-center text-ink/40 py-12">
                <div className="text-3xl mb-2">👥</div>
                No members match these filters.
              </td></tr>
            )}
            {members.map((m) => (
              <tr key={m._id || m.id} className="tr-hover group">
                <td className="td-ledger">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${m.first_name} ${m.last_name}`} />
                    <div>
                      <div className="font-medium text-ink">{m.first_name} {m.last_name}</div>
                      {m.email && <div className="text-[10.5px] text-ink/40 font-mono">{m.email}</div>}
                    </div>
                  </div>
                </td>
                <td className="td-ledger font-mono text-xs text-ink/55">{m.member_code}</td>
                <td className="td-ledger">
                  <span className={typeColors[m.type] || "badge-slate"}>{m.type}</span>
                </td>
                <td className="td-ledger text-ink/65">{m.department || "—"}</td>
                <td className="td-ledger">
                  <span className={`font-mono text-sm font-medium ${m.issued_count > 0 ? "text-slate" : "text-ink/35"}`}>
                    {m.issued_count}
                  </span>
                </td>
                <td className="td-ledger">
                  <span className={m.issued_count > 0 ? "badge-slate" : "badge-moss"}>
                    {m.issued_count > 0 ? "Active Loans" : "Good Standing"}
                  </span>
                </td>
                <td className="td-ledger">
                  <button onClick={() => remove(m)}
                    className="text-xs text-rust/60 hover:text-rust font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Member">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Member ID">
              <input required className="input" placeholder="e.g. MANIT2201"
                value={form.member_code} onChange={(e) => setForm({ ...form, member_code: e.target.value })} />
            </FormField>
            <FormField label="Type">
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First Name">
              <input required className="input" placeholder="First name"
                value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </FormField>
            <FormField label="Last Name">
              <input required className="input" placeholder="Last name"
                value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Department">
            <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email">
              <input type="email" className="input" placeholder="Optional"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </FormField>
            <FormField label="Phone">
              <input className="input" placeholder="Optional"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
