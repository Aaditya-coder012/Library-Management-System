const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  member_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  book_id:     { type: mongoose.Schema.Types.ObjectId, ref: "Book",   required: true },
  issue_date:  { type: String, required: true },
  due_date:    { type: String, required: true },
  return_date: { type: String, default: null },
  status:      { type: String, required: true, default: "Issued", enum: ["Issued", "Returned"] },
  fine_amount: { type: Number, required: true, default: 0 },
  fine_paid:   { type: Boolean, required: true, default: false },
}, { timestamps: { createdAt: "created_at", updatedAt: false } });

module.exports = mongoose.model("Transaction", transactionSchema);
