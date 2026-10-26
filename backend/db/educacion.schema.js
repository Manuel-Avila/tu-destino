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

  // Normaliza las categorías antiguas a las categorías de la biblioteca educativa.
  await query(`
    UPDATE educacion_publicaciones
    SET categoria = CASE
      WHEN LOWER(categoria) = 'arrecifes' THEN 'Biodiversidad'
      WHEN LOWER(categoria) = 'manglares' THEN 'Biodiversidad'
      WHEN LOWER(categoria) = 'fauna marina' THEN 'Fauna Marina'
      WHEN LOWER(categoria) = 'residuos' THEN 'Turismo Responsable'
      WHEN LOWER(categoria) = 'turismo responsable' THEN 'Turismo Responsable'
      ELSE categoria
    END
    WHERE LOWER(categoria) IN (
      'arrecifes',
      'manglares',
      'fauna marina',
      'residuos',
      'turismo responsable'
    );
  `);
}
