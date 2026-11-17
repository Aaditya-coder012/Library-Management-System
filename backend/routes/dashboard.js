const express = require("express");
const Book = require("../models/Book");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");
const { FINE_PER_DAY } = require("../constants");
const router = express.Router();

function daysBetween(a, b) {
  const MS = 1000 * 60 * 60 * 24;
  return Math.floor((new Date(b) - new Date(a)) / MS);
}

// GET /api/dashboard/stats
router.get("/stats", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [booksAgg] = await Book.aggregate([
      { $group: { _id: null, totalBooks: { $sum: "$copies_total" }, totalTitles: { $sum: 1 } } },
    ]);
    const totalBooks = booksAgg?.totalBooks || 0;
    const totalTitles = booksAgg?.totalTitles || 0;

    const totalMembers = await Member.countDocuments();
    const issuedNow = await Transaction.countDocuments({ status: "Issued" });
    const overdue = await Transaction.countDocuments({ status: "Issued", due_date: { $lt: today } });

    const recentRaw = await Transaction.find()
      .populate("member_id", "first_name last_name")
      .populate("book_id", "title")
      .sort({ issue_date: -1 })
      .limit(8)
      .lean();

    const recent = recentRaw.map((t) => ({
      id: t._id,
      first_name: t.member_id?.first_name || "Unknown",
      last_name: t.member_id?.last_name || "",
      book_title: t.book_id?.title || "Unknown Book",
      due_date: t.due_date,
      status: t.status,
      display_status: t.status === "Issued" && t.due_date < today ? "Overdue" : t.status,
    }));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

    const popularRaw = await Transaction.aggregate([
      { $match: { issue_date: { $gte: thirtyDaysAgoStr } } },
      { $group: { _id: "$book_id", issues: { $sum: 1 } } },
      { $sort: { issues: -1 } },
      { $limit: 6 },
      { $lookup: { from: "books", localField: "_id", foreignField: "_id", as: "book" } },
      { $unwind: "$book" },
      { $project: { title: "$book.title", author: "$book.author", genre: "$book.genre", issues: 1 } },
    ]);

    res.json({
      total_books: totalBooks,
      total_titles: totalTitles,
      total_members: totalMembers,
      issued_now: issuedNow,
      overdue_count: overdue,
      recent_activity: recent,
      popular_books: popularRaw,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/dashboard/analytics
router.get("/analytics", async (req, res) => {
  try {
    const genreDist = await Book.aggregate([
      { $group: { _id: "$genre", titles: { $sum: 1 }, copies: { $sum: "$copies_total" } } },
      { $sort: { copies: -1 } },
      { $project: { genre: "$_id", titles: 1, copies: 1, _id: 0 } },
    ]);

    const memberBreakdown = await Member.aggregate([
      { $group: { _id: "$type", n: { $sum: 1 } } },
      { $project: { type: "$_id", n: 1, _id: 0 } },
    ]);

    // Build last 7 days array
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const [issues, returns, finesAgg] = await Promise.all([
        Transaction.countDocuments({ issue_date: dateStr }),
        Transaction.countDocuments({ return_date: dateStr }),
        Transaction.aggregate([
          { $match: { return_date: dateStr } },
          { $group: { _id: null, total: { $sum: "$fine_amount" } } },
        ]),
      ]);
      last7.push({
        date: dateStr,
        issues,
        returns,
        fines_collected: finesAgg[0]?.total || 0,
      });
    }

    res.json({ genre_distribution: genreDist, member_breakdown: memberBreakdown, issue_history: last7 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/dashboard/fines
router.get("/fines", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const rows = await Transaction.find({
      $or: [
        { status: "Issued", due_date: { $lt: today } },
        { fine_amount: { $gt: 0 } },
      ],
    })
      .populate("member_id", "first_name last_name member_code")
      .populate("book_id", "title")
      .sort({ due_date: 1 })
      .lean();

    const withComputed = rows.map((r) => {
      let daysOverdue, fine, status;
      if (r.status === "Issued") {
        daysOverdue = daysBetween(r.due_date, today);
        fine = daysOverdue * FINE_PER_DAY;
        status = "Unpaid (Ongoing)";
      } else {
        daysOverdue = Math.max(0, daysBetween(r.due_date, r.return_date));
        fine = r.fine_amount;
        status = r.fine_paid ? "Paid" : "Unpaid";
      }
      return {
        id: r._id,
        first_name: r.member_id?.first_name || "Unknown",
        last_name: r.member_id?.last_name || "",
        member_code: r.member_id?.member_code || "N/A",
        book_title: r.book_id?.title || "Unknown Book",
        due_date: r.due_date,
        return_date: r.return_date,
        fine_amount: r.fine_amount,
        fine_paid: r.fine_paid,
        days_overdue: daysOverdue,
        fine,
        status,
      };
    });

    res.json(withComputed);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
