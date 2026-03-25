/**
 * src/services/profileService.js
 * All data persisted in the `profiles` PostgreSQL table.
 */
"use strict";

import { query } from "../db/pool";

// ─── helpers ────────────────────────────────────────────────────────────────

function validatePublicKey(key) {
  if (!key || !/^G[A-Z0-9]{55}$/.test(key)) {
    const e = new Error("Invalid Stellar public key");
    e.status = 400;
    throw e;
  }
}

/** Convert snake_case DB row → camelCase API object */
function rowToProfile(row) {
  return {
    publicKey:       row.public_key,
    displayName:     row.display_name,
    bio:             row.bio,
    skills:          row.skills,
    role:            row.role,
    completedJobs:   row.completed_jobs,
    totalEarnedXLM:  row.total_earned_xlm,
    rating:          row.rating !== null ? parseFloat(row.rating) : null,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

// ─── service functions ───────────────────────────────────────────────────────

async function getProfile(publicKey) {
  validatePublicKey(publicKey);

  const { rows } = await query(
    "SELECT * FROM profiles WHERE public_key = $1",
    [publicKey]
  );

  if (!rows.length) {
    const e = new Error("Profile not found");
    e.status = 404;
    throw e;
  }

  return rowToProfile(rows[0]);
}

async function upsertProfile({ publicKey, displayName, bio, skills, role }) {
  validatePublicKey(publicKey);

  const safeSkills = Array.isArray(skills) ? skills.slice(0, 15) : null;

  // INSERT … ON CONFLICT lets us handle create-or-update atomically.
  const { rows } = await query(
    `
    INSERT INTO profiles (public_key, display_name, bio, skills, role, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    ON CONFLICT (public_key) DO UPDATE
      SET display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), profiles.display_name),
          bio          = COALESCE(NULLIF(EXCLUDED.bio,          ''), profiles.bio),
          skills       = COALESCE(EXCLUDED.skills,                  profiles.skills),
          role         = COALESCE(NULLIF(EXCLUDED.role,         ''), profiles.role),
          updated_at   = NOW()
    RETURNING *
    `,
    [
      publicKey,
      displayName?.trim() || null,
      bio?.trim()         || null,
      safeSkills,
      role || "both",
    ]
  );

  return rowToProfile(rows[0]);
}

export default { getProfile, upsertProfile };