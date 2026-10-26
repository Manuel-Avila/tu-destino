import { query } from '../config/db.js';

/**
 * Publicaciones de la sección de Educación Ambiental.
 * Solo los administradores pueden crearlas, editarlas o eliminarlas;
 * cualquier visitante puede consultarlas.
 */
export async function createEducacionTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS educacion_publicaciones (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(200) NOT NULL,
      imagen TEXT,
      texto TEXT NOT NULL,
      categoria VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_educacion_categoria ON educacion_publicaciones (categoria);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_educacion_created ON educacion_publicaciones (created_at DESC);`);
}
