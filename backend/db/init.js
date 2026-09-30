import { query } from '../config/db.js';
import { createEventosTables } from './eventos.schema.js';
import { seedEventosIfEmpty } from './eventos.seed.js';
import { createResenasTables } from './resenas.schema.js';
import { createDestinosTables } from './destinos.schema.js';

/**
 * Crea las tablas necesarias si no existen todavía.
 * Se ejecuta una vez al arrancar el servidor (ver index.js).
 * Para un proyecto en crecimiento, esto normalmente se reemplaza
 * por una herramienta de migraciones (node-pg-migrate, knex, etc.),
 * pero para este alcance es suficiente y evita pasos manuales extra.
 */
export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(150) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      -- Nulo para cuentas creadas solo vía Google (no tienen contraseña propia).
      password_hash TEXT,
      google_id VARCHAR(255) UNIQUE,
      auth_provider VARCHAR(20) NOT NULL DEFAULT 'password',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Por si la tabla ya existía de una versión anterior sin estas columnas.
  await query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'password';`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;`);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
  `);

  await createResenasTables();
  await createEventosTables();
  await seedEventosIfEmpty();
  await createDestinosTables();
  
  const { seedDestinosIfEmpty } = await import('./destinos.seed.js');
  await seedDestinosIfEmpty();

  const { seedUsersIfEmpty } = await import('./users.seed.js');
  await seedUsersIfEmpty();

  console.log('[db] Tablas verificadas/creadas correctamente.');
}
