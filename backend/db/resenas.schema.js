import { query } from '../config/db.js';

/**
 * Tabla de reseñas de destinos.
 * Cada reseña pertenece a un usuario (users.id). Si el usuario se elimina,
 * sus reseñas también. destino_id es el id del destino del catálogo del
 * frontend (balandra, pulmo, espiritu, loreto...).
 */
export async function createResenasTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS destino_resenas (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      destino_id VARCHAR(60) NOT NULL,
      rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      actividad VARCHAR(120),
      fecha_visita DATE,
      comentario TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_resenas_destino ON destino_resenas (destino_id, created_at DESC);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_resenas_user ON destino_resenas (user_id, created_at DESC);`);
}
