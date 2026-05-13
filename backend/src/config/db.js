const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "lead_management",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
});

// Clear any cached prepared statements on each new connection
pool.on("connect", (client) => {
  client.query("DEALLOCATE ALL").catch(() => {});
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    client.query("SELECT current_database()", (err, result) => {
      release();
      if (!err) console.log("✅ Connected to database:", result.rows[0].current_database);
    });
  }
});

module.exports = pool;