/**
 * Runs schema.sql against the connected database.
 * Call once during server startup (before accepting requests).
 *
 * Usage:
 *   const migrate = require("./db/migrate");
 *   await migrate();
 */
"use strict";

const fs   = require("fs");
const path = require("path");
const pool = require("./pool");

async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  console.log("[migrate] Running schema migrations…");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("[migrate] Migrations complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[migrate] Migration failed — rolling back:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = migrate;