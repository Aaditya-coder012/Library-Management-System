const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const { connectDB, mongoose } = require("./db");

const app = express();

// Trust proxy for reverse proxies like Render, Cloudflare, etc.
app.set("trust proxy", 1);

// Configure CORS
const allowedOrigins = process.env.CLIENT_URL || process.env.FRONTEND_URL || process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: allowedOrigins
      ? allowedOrigins.split(",").map((s) => s.trim())
      : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints (compatible with Render Health Checks)
app.get(["/health", "/api/health"], (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    status: "ok",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/books", require("./routes/books"));
app.use("/api/members", require("./routes/members"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/auth", require("./routes/auth"));

// Optional: Serve frontend static build if present (e.g. monorepo deployment)
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  // Friendly root endpoint for API-only deployments
  app.get("/", (req, res) => {
    res.json({
      name: "MANIT Central Library Management System API",
      status: "online",
      endpoints: {
        health: "/api/health",
        books: "/api/books",
        members: "/api/members",
        transactions: "/api/transactions",
        dashboard: "/api/dashboard",
        auth: "/api/auth",
      },
    });
  });
}

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 4000;
const HOST = "0.0.0.0";

let server;

connectDB()
  .then(() => {
    server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Library API listening on http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server due to database connection error:", err.message);
    process.exit(1);
  });

// Graceful shutdown handling for Render deployments
const handleShutdown = (signal) => {
  console.log(`Received ${signal}. Gracefully shutting down...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      try {
        await mongoose.connection.close(false);
        console.log("MongoDB connection closed.");
      } catch (e) {
        console.error("Error closing MongoDB connection:", e);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
