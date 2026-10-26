import { query } from '../config/db.js';

const USER_FIELDS = `
  id,
  full_name,
  email,
  auth_provider,
  is_admin,
  location,
  bio,
  avatar_url,
  created_at,
  password_updated_at
`;

export async function findUserByEmail(email) {
  const result = await query(
    `SELECT ${USER_FIELDS}, password_hash
     FROM users WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await query(
    `SELECT ${USER_FIELDS}
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function findUserByIdWithPassword(id) {
  const result = await query(
    `SELECT ${USER_FIELDS}, password_hash
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function createUser({ fullName, email, passwordHash }) {
  const result = await query(
    `INSERT INTO users (full_name, email, password_hash, auth_provider)
     VALUES ($1, $2, $3, 'password')
     RETURNING ${USER_FIELDS}`,
    [fullName, email, passwordHash]
  );
  return result.rows[0];
}

export async function updateUserProfile(id, { fullName, email, location, bio, avatarUrl }) {
  const result = await query(
    `UPDATE users
     SET full_name = $1,
         email = $2,
         location = $3,
         bio = $4,
         avatar_url = COALESCE($5, avatar_url)
     WHERE id = $6
     RETURNING ${USER_FIELDS}`,
    [fullName, email, location, bio, avatarUrl, id]
  );
  return result.rows[0] || null;
}

export async function updateUserPassword(id, passwordHash) {
  const result = await query(
    `UPDATE users
     SET password_hash = $1,
         password_updated_at = NOW()
     WHERE id = $2
     RETURNING ${USER_FIELDS}`,
    [passwordHash, id]
  );
  return result.rows[0] || null;
}
