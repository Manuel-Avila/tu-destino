import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

export async function seedUsersIfEmpty() {
  const { rows } = await query('SELECT COUNT(*) AS count FROM users WHERE email = $1', ['admin@tudestino.com']);
  if (parseInt(rows[0].count, 10) > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash('secret', 10);

  await query(
    `INSERT INTO users (full_name, email, password_hash, auth_provider, is_admin)
     VALUES ($1, $2, $3, $4, $5)`,
    ['Admin', 'admin@tudestino.com', passwordHash, 'password', true]
  );

  console.log('[db] Usuario administrador insertado (seed) correctamente.');
}
