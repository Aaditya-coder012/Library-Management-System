const express = require("express");
const Transaction = require("../models/Transaction");
const Member = require("../models/Member");
const Book = require("../models/Book");
const { LOAN_PERIOD_DAYS, FINE_PER_DAY } = require("../constants");
const router = express.Router();

function daysBetween(a, b) {
  const MS = 1000 * 60 * 60 * 24;
  return Math.floor((new Date(b) - new Date(a)) / MS);
}

function addComputed(t, today) {
  const r = t.toObject ? t.toObject() : t;
  let displayStatus = r.status;
  let liveFine = r.fine_amount;
  if (r.status === "Issued") {
    const overdueDays = daysBetween(r.due_date, today);
    if (overdueDays > 0) {
      displayStatus = "Overdue";
      liveFine = overdueDays * FINE_PER_DAY;
    }
  }
  return { ...r, display_status: displayStatus, live_fine: liveFine };
}

// GET /api/transactions (optional ?status=Issued|Returned)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const txns = await Transaction.find(filter)
      .populate("member_id", "member_code first_name last_name")
      .populate("book_id", "title accession_no")
      .sort({ issue_date: -1 })
      .lean();

    const today = new Date().toISOString().slice(0, 10);
    const result = txns.map((t) => ({
      ...t,
      member_code: t.member_id?.member_code,
      first_name:  t.member_id?.first_name,
      last_name:   t.member_id?.last_name,
      book_title:  t.book_id?.title,
      accession_no: t.book_id?.accession_no,
      ...(() => {
        let displayStatus = t.status;
        let liveFine = t.fine_amount;
        if (t.status === "Issued") {
          const days = daysBetween(t.due_date, today);
          if (days > 0) { displayStatus = "Overdue"; liveFine = days * FINE_PER_DAY; }
        }
        return { display_status: displayStatus, live_fine: liveFine };
      })(),
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/transactions/issue  { member_code, accession_no }
router.post("/issue", async (req, res) => {
  try {
    const { member_code, accession_no } = req.body;
    if (!member_code || !accession_no)
      return res.status(400).json({ error: "member_code and accession_no are required" });

    const member = await Member.findOne({ member_code });
    if (!member) return res.status(404).json({ error: "No member found with that Member ID" });

    const book = await Book.findOne({ accession_no });
    if (!book) return res.status(404).json({ error: "No book found with that Accession No." });
    if (book.copies_available < 1) return res.status(400).json({ error: "No copies of this book are currently available" });

    const already = await Transaction.findOne({ member_id: member._id, book_id: book._id, status: "Issued" });
    if (already) return res.status(400).json({ error: "This member already has this book issued" });

    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);
    const issueDateStr = issueDate.toISOString().slice(0, 10);
    const dueDateStr = dueDate.toISOString().slice(0, 10);

    book.copies_available -= 1;
    await book.save();

    const txn = await Transaction.create({
      member_id: member._id, book_id: book._id,
      issue_date: issueDateStr, due_date: dueDateStr, status: "Issued",
    });

    const populated = await Transaction.findById(txn._id)
      .populate("member_id", "member_code first_name last_name")
      .populate("book_id", "title accession_no")
      .lean();

    res.status(201).json({
      ...populated,
      member_code: populated.member_id?.member_code,
      first_name: populated.member_id?.first_name,
      last_name: populated.member_id?.last_name,
      book_title: populated.book_id?.title,
      accession_no: populated.book_id?.accession_no,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/transactions/return  { accession_no }
router.post("/return", async (req, res) => {
  try {
    const { accession_no } = req.body;
    if (!accession_no) return res.status(400).json({ error: "accession_no is required" });

    const book = await Book.findOne({ accession_no });
    if (!book) return res.status(404).json({ error: "No book found with that Accession No." });

    const txn = await Transaction.findOne({ book_id: book._id, status: "Issued" }).sort({ issue_date: 1 });
    if (!txn) return res.status(400).json({ error: "This book does not have an active issue to return" });

    const today = new Date().toISOString().slice(0, 10);
    const overdueDays = Math.max(0, daysBetween(txn.due_date, today));
    const fine = overdueDays * FINE_PER_DAY;

    book.copies_available += 1;
    await book.save();

    txn.status = "Returned";
    txn.return_date = today;
    txn.fine_amount = fine;
    await txn.save();

    const populated = await Transaction.findById(txn._id)
      .populate("member_id", "member_code first_name last_name")
      .populate("book_id", "title accession_no")
      .lean();

    res.json({
      ...populated,
      member_code: populated.member_id?.member_code,
      first_name: populated.member_id?.first_name,
      last_name: populated.member_id?.last_name,
      book_title: populated.book_id?.title,
      accession_no: populated.book_id?.accession_no,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/transactions/:id/pay-fine
router.post("/:id/pay-fine", async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.id);
    if (!txn) return res.status(404).json({ error: "Transaction not found" });
    txn.fine_paid = true;
    await txn.save();
    res.json(txn);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
