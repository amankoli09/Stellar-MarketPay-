/**
 * src/services/store.js
 * In-memory data store for v1.
 * Replace with a real database (PostgreSQL / Supabase) in v1.1.
 * See ROADMAP.md for the database migration plan.
 */
"use strict";

// /** @type {Map<string, object>} jobId → Job */
// const jobs = new Map();

// /** @type {Map<string, object>} applicationId → Application */
// const applications = new Map();

// /** @type {Map<string, object>} publicKey → UserProfile */
// const profiles = new Map();

// /** @type {Map<string, object>} jobId → EscrowRecord */
// const escrows = new Map();

// module.exports = { jobs, applications, profiles, escrows };

/**
 * Data is now persisted in PostgreSQL.
 * This file is kept so that any code that imports from "./store"
 * receives the shared pool instead of crashing.
 *
 * The in-memory Maps have been removed.
 * See src/db/pool.js for the connection pool.
 * See src/db/schema.sql for the table definitions.
 */
 
import pool from "../db/pool";
export default { pool };