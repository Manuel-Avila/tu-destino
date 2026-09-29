import { query } from '../config/db.js';

const COLUMNS = `
  r.id, r.user_id, r.destino_id, r.rating, r.actividad,
  to_char(r.fecha_visita, 'YYYY-MM-DD') AS fecha_visita, r.comentario, r.created_at, u.full_name
`;

export async function listResenasByDestino(destinoId) {
  const result = await query(
    `SELECT ${COLUMNS}
     FROM destino_resenas r
     JOIN users u ON u.id = r.user_id
     WHERE r.destino_id = $1
     ORDER BY r.created_at DESC`,
    [destinoId]
  );
  return result.rows;
}

export async function getStatsByDestino(destinoId) {
  const result = await query(
    `SELECT COUNT(*)::int AS total, COALESCE(SUM(rating), 0)::int AS suma
     FROM destino_resenas WHERE destino_id = $1`,
    [destinoId]
  );
  return result.rows[0];
}

export async function listResenasByUser(userId) {
  const result = await query(
    `SELECT ${COLUMNS}
     FROM destino_resenas r
     JOIN users u ON u.id = r.user_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function createResena({ userId, destinoId, rating, actividad, fechaVisita, comentario }) {
  const result = await query(
    `WITH nueva AS (
       INSERT INTO destino_resenas (user_id, destino_id, rating, actividad, fecha_visita, comentario)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *
     )
     SELECT ${COLUMNS}
     FROM nueva r JOIN users u ON u.id = r.user_id`,
    [userId, destinoId, rating, actividad || null, fechaVisita || null, comentario]
  );
  return result.rows[0];
}

/** Borra solo si la reseña es del usuario. Devuelve true si se borró. */
export async function deleteResena({ id, userId }) {
  const result = await query(
    `DELETE FROM destino_resenas WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rowCount > 0;
}
