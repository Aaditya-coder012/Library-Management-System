const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  member_code: { type: String, required: true, unique: true, trim: true },
  type:        { type: String, required: true, enum: ["Student", "Faculty", "Staff"] },
  first_name:  { type: String, required: true, trim: true },
  last_name:   { type: String, required: true, trim: true },
  department:  { type: String, default: null },
  email:       { type: String, default: null },
  phone:       { type: String, default: null },
}, { timestamps: { createdAt: "created_at", updatedAt: false } });

module.exports = mongoose.model("Member", memberSchema);
