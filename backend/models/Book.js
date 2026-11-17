const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  accession_no: { type: String, required: true, unique: true, trim: true },
  isbn:         { type: String, default: null },
  title:        { type: String, required: true, trim: true },
  author:       { type: String, required: true, trim: true },
  genre:        { type: String, required: true },
  year:         { type: Number, default: null },
  publisher:    { type: String, default: null },
  copies_total:     { type: Number, required: true, default: 1 },
  copies_available: { type: Number, required: true, default: 1 },
}, { timestamps: { createdAt: "created_at", updatedAt: false } });

module.exports = mongoose.model("Book", bookSchema);
