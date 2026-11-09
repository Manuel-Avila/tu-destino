import { query } from '../config/db.js';

export async function createDestinosTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS destinos (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      location VARCHAR(200) NOT NULL,
      label VARCHAR(200),
      tag VARCHAR(100),
      category VARCHAR(100),
      description TEXT,
      image TEXT,
      images TEXT[] DEFAULT '{}',
      rules JSONB DEFAULT '[]',
      best_activities TEXT,
      coordinates JSONB DEFAULT '[]',
      rating NUMERIC(3,1),
      review_count INTEGER DEFAULT 0,
      rating_breakdown JSONB DEFAULT '[]',
      reviews JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Las reglas de formato del ID (letras y guiones) se validan solo en el frontend.
  // Por si una versión anterior creó la restricción, se elimina.
  await query(`ALTER TABLE destinos DROP CONSTRAINT IF EXISTS destinos_id_formato_chk;`);
}
