import { query } from '../config/db.js';

export async function findUserByEmail(email) {
  const result = await query(
    `SELECT id, full_name, email, password_hash, google_id, auth_provider, created_at
     FROM users WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await query(
    `SELECT id, full_name, email, google_id, auth_provider, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function findUserByGoogleId(googleId) {
  const result = await query(
    `SELECT id, full_name, email, google_id, auth_provider, created_at
     FROM users WHERE google_id = $1`,
    [googleId]
  );
  return result.rows[0] || null;
}

export async function createUser({ fullName, email, passwordHash }) {
  const result = await query(
    `INSERT INTO users (full_name, email, password_hash, auth_provider)
     VALUES ($1, $2, $3, 'password')
     RETURNING id, full_name, email, created_at`,
    [fullName, email, passwordHash]
  );
  return result.rows[0];
}

export async function createGoogleUser({ fullName, email, googleId }) {
  const result = await query(
    `INSERT INTO users (full_name, email, google_id, auth_provider)
     VALUES ($1, $2, $3, 'google')
     RETURNING id, full_name, email, created_at`,
    [fullName, email, googleId]
  );
  return result.rows[0];
}

export async function linkGoogleIdToUser(userId, googleId) {
  const result = await query(
    `UPDATE users SET google_id = $2 WHERE id = $1
     RETURNING id, full_name, email, created_at`,
    [userId, googleId]
  );
  return result.rows[0];
}
