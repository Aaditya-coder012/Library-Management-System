const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/books", require("./routes/books"));
app.use("/api/members", require("./routes/members"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/auth", require("./routes/auth"));

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Library API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
