import { query } from '../config/db.js';

function toApi(row) {
  return {
    id: row.id,
    titulo: row.titulo,
    imagen: row.imagen,
    texto: row.texto,
    categoria: row.categoria,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPublicaciones() {
  const { rows } = await query(
    `SELECT * FROM educacion_publicaciones ORDER BY id ASC`
  );
  return rows.map(toApi);
}

export async function findPublicacionById(id) {
  const { rows } = await query(
    `SELECT * FROM educacion_publicaciones WHERE id = $1`,
    [id]
  );
  return rows[0] ? toApi(rows[0]) : null;
}

export async function createPublicacion({ titulo, imagen, texto, categoria }) {
  const { rows } = await query(
    `INSERT INTO educacion_publicaciones (titulo, imagen, texto, categoria)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [titulo, imagen, texto, categoria]
  );
  return toApi(rows[0]);
}

export async function updatePublicacion(id, { titulo, imagen, texto, categoria }) {
  const { rows } = await query(
    `UPDATE educacion_publicaciones SET
       titulo = COALESCE($1, titulo),
       imagen = COALESCE($2, imagen),
       texto = COALESCE($3, texto),
       categoria = COALESCE($4, categoria),
       updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [titulo ?? null, imagen ?? null, texto ?? null, categoria ?? null, id]
  );
  return rows[0] ? toApi(rows[0]) : null;
}

export async function deletePublicacion(id) {
  const { rowCount } = await query(
    `DELETE FROM educacion_publicaciones WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
}
