import { useEffect, useState } from "react";
import { api } from "../api.js";
import Topbar from "../components/Topbar.jsx";
import Modal from "../components/Modal.jsx";
import { useToast } from "../App.jsx";

const GENRES = ["Computer Science","Mathematics","Physics","Electronics","Mechanical","Civil","Chemistry","Management","Literature"];
const emptyForm = { accession_no: "", isbn: "", title: "", author: "", genre: GENRES[0], year: "", publisher: "", copies: 1 };

function FormField({ label, children }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      {children}
    </div>
  );
}

export default function Books() {
  const toast = useToast();
  const [books, setBooks] = useState([]);
  const [genre, setGenre] = useState("All Genres");
  const [status, setStatus] = useState("All Status");
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = {};
    if (genre !== "All Genres") params.genre = genre;
    if (status !== "All Status") params.status = status;
    if (q) params.q = q;
    api.getBooks(params).then(setBooks).catch((e) => toast(e.message, "error"));
  };
  useEffect(load, [genre, status, q]);

  const openAdd = () => { setEditBook(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (b) => {
    setEditBook(b);
    setForm({ accession_no: b.accession_no, isbn: b.isbn || "", title: b.title, author: b.author,
              genre: b.genre, year: b.year || "", publisher: b.publisher || "", copies: b.copies_total });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editBook) {
        await api.updateBook(editBook._id || editBook.id, {
          isbn: form.isbn, title: form.title, author: form.author, genre: form.genre,
          year: form.year ? Number(form.year) : null, publisher: form.publisher,
          copies_total: Number(form.copies),
        });
        toast(`"${form.title}" updated`);
      } else {
        await api.createBook({ ...form, year: form.year ? Number(form.year) : null, copies: Number(form.copies) });
        toast(`"${form.title}" added to the catalogue`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (book) => {
    if (!confirm(`Remove "${book.title}" from the catalogue?`)) return;
    try {
      await api.deleteBook(book._id || book.id);
      toast("Book removed");
      load();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return (
    <div>
      <Topbar
        title="Book Catalogue"
        subtitle={`${books.length} title${books.length === 1 ? "" : "s"} matching filters`}
        action={<button className="btn-primary" onClick={openAdd}>+ Add Book</button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input className="input max-w-xs" placeholder="Search title, author, accession…" value={q}
          onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[200px]" value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option>All Genres</option>
          {GENRES.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select className="input max-w-[160px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All Status</option>
          <option>Available</option>
          <option>Issued</option>
        </select>
      </div>

      <div className="card overflow-x-auto animate-slide-up">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th-ledger">Acc. No.</th>
              <th className="th-ledger">Title</th>
              <th className="th-ledger">Author</th>
              <th className="th-ledger">Genre</th>
              <th className="th-ledger">Copies</th>
              <th className="th-ledger">Status</th>
              <th className="th-ledger">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 && (
              <tr><td colSpan={7} className="td-ledger text-center text-ink/40 py-12">
                <div className="text-3xl mb-2">📚</div>
                No books match these filters.
              </td></tr>
            )}
            {books.map((b) => {
              const avail = b.copies_available;
              const total = b.copies_total;
              return (
                <tr key={b._id || b.id} className="tr-hover group">
                  <td className="td-ledger font-mono text-xs text-ink/60">{b.accession_no}</td>
                  <td className="td-ledger">
                    <div className="font-medium text-ink">{b.title}</div>
                    {b.isbn && <div className="text-[10.5px] font-mono text-ink/35">ISBN {b.isbn}</div>}
                  </td>
                  <td className="td-ledger text-ink/65">{b.author}</td>
                  <td className="td-ledger">
                    <span className="badge-brass">{b.genre}</span>
                  </td>
                  <td className="td-ledger">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-ink/[0.08] rounded-full overflow-hidden">
                        <div className="h-full bg-moss rounded-full transition-all"
                          style={{ width: `${total > 0 ? (avail / total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs font-mono text-ink/50">{avail}/{total}</span>
                    </div>
                  </td>
                  <td className="td-ledger">
                    <span className={avail > 0 ? "badge-moss" : "badge-rust"}>
                      {avail > 0 ? "Available" : "All Issued"}
                    </span>
                  </td>
                  <td className="td-ledger">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(b)} className="text-xs text-brass hover:text-brass/70 font-medium">Edit</button>
                      <button onClick={() => remove(b)} className="text-xs text-rust/70 hover:text-rust font-medium">Remove</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editBook ? "Edit Book" : "Add New Book"}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Accession No.">
              <input required className="input" placeholder="e.g. CSE-001"
                value={form.accession_no} disabled={!!editBook}
                onChange={(e) => setForm({ ...form, accession_no: e.target.value })} />
            </FormField>
            <FormField label="ISBN">
              <input className="input" placeholder="Optional"
                value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Title">
            <input required className="input" placeholder="Book title"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </FormField>
          <FormField label="Author">
            <input required className="input" placeholder="Author name"
              value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Genre">
              <select className="input" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </FormField>
            <FormField label="Year">
              <input type="number" className="input" placeholder="e.g. 2020"
                value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Publisher">
              <input className="input" placeholder="Publisher"
                value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
            </FormField>
            <FormField label="Total Copies">
              <input type="number" min="1" className="input" placeholder="1"
                value={form.copies} onChange={(e) => setForm({ ...form, copies: e.target.value })} />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : editBook ? "Update Book" : "Add Book"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
