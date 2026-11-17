const express = require("express");
const Book = require("../models/Book");
const Transaction = require("../models/Transaction");
const router = express.Router();

// GET /api/books  (optional ?genre=&status=&q=)
router.get("/", async (req, res) => {
  try {
    const { genre, status, q } = req.query;
    const filter = {};
    if (genre && genre !== "All Genres") filter.genre = genre;
    if (status === "Available") filter.copies_available = { $gt: 0 };
    else if (status === "Issued") filter.copies_available = 0;
    if (q) {
      const re = new RegExp(q, "i");
      filter.$or = [{ title: re }, { author: re }, { accession_no: re }, { isbn: re }];
    }
    const books = await Book.find(filter).sort({ created_at: -1 }).lean();
    res.json(books);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/books/:id
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/books
router.post("/", async (req, res) => {
  try {
    const { accession_no, isbn, title, author, genre, year, publisher, copies } = req.body;
    if (!accession_no || !title || !author || !genre)
      return res.status(400).json({ error: "accession_no, title, author, and genre are required" });

    const existing = await Book.findOne({ accession_no });
    if (existing) return res.status(409).json({ error: "A book with this accession number already exists" });

    const copiesNum = Number(copies) > 0 ? Number(copies) : 1;
    const book = await Book.create({
      accession_no, isbn: isbn || null, title, author, genre,
      year: year || null, publisher: publisher || null,
      copies_total: copiesNum, copies_available: copiesNum,
    });
    res.status(201).json(book);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/books/:id
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    const { isbn, title, author, genre, year, publisher, copies_total } = req.body;
    const issuedCount = book.copies_total - book.copies_available;
    const newTotal = copies_total != null ? Number(copies_total) : book.copies_total;
    if (newTotal < issuedCount)
      return res.status(400).json({ error: `Cannot set total copies below ${issuedCount} (currently issued)` });

    book.isbn = isbn ?? book.isbn;
    book.title = title ?? book.title;
    book.author = author ?? book.author;
    book.genre = genre ?? book.genre;
    book.year = year ?? book.year;
    book.publisher = publisher ?? book.publisher;
    book.copies_total = newTotal;
    book.copies_available = newTotal - issuedCount;
    await book.save();
    res.json(book);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/books/:id
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    const activeLoan = await Transaction.findOne({ book_id: req.params.id, status: "Issued" });
    if (activeLoan) return res.status(400).json({ error: "Cannot delete a book with active issues" });
    await book.deleteOne();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
