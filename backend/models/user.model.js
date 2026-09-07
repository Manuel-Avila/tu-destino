import { query } from '../config/db.js';

export async function findUserByEmail(email) {
  const result = await query(
    `SELECT id, full_name, email, password_hash, auth_provider, created_at
     FROM users WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await query(
    `SELECT id, full_name, email, auth_provider, created_at
     FROM users WHERE id = $1`,
    [id]
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
