import { query } from '../config/db.js';

export async function createReportesTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS reportes (
      id SERIAL PRIMARY KEY,
      folio VARCHAR(30) NOT NULL UNIQUE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
      reporter_name VARCHAR(150),
      reporter_email VARCHAR(255),
      incident_type VARCHAR(60) NOT NULL,
      description TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (status IN ('pendiente', 'en_revision', 'resuelto', 'descartado')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS reporte_evidencias (
      id SERIAL PRIMARY KEY,
      reporte_id INTEGER NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      media_type VARCHAR(20) NOT NULL DEFAULT 'image',
      original_name VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS reporte_historial_estado (
      id SERIAL PRIMARY KEY,
      reporte_id INTEGER NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL
        CHECK (status IN ('pendiente', 'en_revision', 'resuelto', 'descartado')),
      note TEXT,
      changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_reportes_status ON reportes (status, created_at DESC);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_reportes_type ON reportes (incident_type, created_at DESC);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_reportes_user ON reportes (user_id, created_at DESC);`);
}
