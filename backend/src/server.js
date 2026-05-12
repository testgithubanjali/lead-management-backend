const express = require("express");
const cors = require("cors");
require("dotenv").config();

const leadRoutes = require("./routes/leadRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (dev)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ─── Routes ──────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Lead Management System API",
    version: "1.0.0",
    endpoints: {
      leads: "/api/leads",
      stats: "/api/leads/stats",
    },
  });
});

app.use("/api/leads", leadRoutes);

// ─── 404 Handler ─────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { error: err.message }),
  });
});

// ─── Start Server ─────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API: http://localhost:${PORT}/api/leads`);
  console.log(`📊 Stats: http://localhost:${PORT}/api/leads/stats\n`);
});
