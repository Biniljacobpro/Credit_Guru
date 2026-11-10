const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DATABASE_POOL_SIZE || 10),
  idleTimeoutMillis: 30000,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (error) => console.error("Unexpected PostgreSQL pool error:", error));

module.exports = pool;
