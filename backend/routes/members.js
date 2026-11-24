const express = require("express");
const mongoose = require("mongoose");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");
const router = express.Router();

function escapeRegex(text) {
  return text.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

// GET /api/members (optional ?type=&q=)
router.get("/", async (req, res) => {
  try {
    const { type, q } = req.query;
    const filter = {};
    if (type && type !== "All Types") filter.type = type;
    if (q && q.trim()) {
      const re = new RegExp(escapeRegex(q.trim()), "i");
      filter.$or = [{ first_name: re }, { last_name: re }, { member_code: re }, { email: re }];
    }
    const members = await Member.find(filter).sort({ created_at: -1 }).lean();
    // Attach issued_count for each member
    const ids = members.map((m) => m._id);
    const counts = await Transaction.aggregate([
      { $match: { member_id: { $in: ids }, status: "Issued" } },
      { $group: { _id: "$member_id", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    const withCount = members.map((m) => ({ ...m, issued_count: countMap[m._id.toString()] || 0 }));
    res.json(withCount);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/members/:id
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: "Member not found" });
    }
    const member = await Member.findById(req.params.id).lean();
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json(member);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/members
router.post("/", async (req, res) => {
  try {
    const { member_code, type, first_name, last_name, department, email, phone } = req.body;
    if (!member_code || !type || !first_name || !last_name)
      return res.status(400).json({ error: "member_code, type, first_name, and last_name are required" });

    const trimmedCode = member_code.trim();
    const existing = await Member.findOne({ member_code: new RegExp(`^${escapeRegex(trimmedCode)}$`, "i") });
    if (existing) return res.status(409).json({ error: "A member with this ID already exists" });

    const member = await Member.create({
      member_code: trimmedCode,
      type,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      department: department ? department.trim() : null,
      email: email ? email.trim() : null,
      phone: phone ? phone.trim() : null,
    });
    res.status(201).json(member);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/members/:id
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: "Member not found" });
    }
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    const { type, first_name, last_name, department, email, phone } = req.body;
    member.type = type ?? member.type;
    member.first_name = first_name !== undefined ? first_name.trim() : member.first_name;
    member.last_name = last_name !== undefined ? last_name.trim() : member.last_name;
    member.department = department !== undefined ? (department ? department.trim() : null) : member.department;
    member.email = email !== undefined ? (email ? email.trim() : null) : member.email;
    member.phone = phone !== undefined ? (phone ? phone.trim() : null) : member.phone;
    await member.save();
    res.json(member);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/members/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: "Member not found" });
    }
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    const activeLoan = await Transaction.findOne({ member_id: req.params.id, status: "Issued" });
    if (activeLoan) return res.status(400).json({ error: "Cannot delete a member with active issues" });
    await member.deleteOne();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
