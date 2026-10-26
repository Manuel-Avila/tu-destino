import pool, { query } from '../config/db.js';

function toApi(row) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    label: row.label,
    tag: row.tag,
    category: row.category,
    description: row.description,
    image: row.image,
    images: row.images,
    rules: row.rules,
    bestActivities: row.best_activities,
    coordinates: row.coordinates,
    // Calificación REAL: promedio y total calculados con las reseñas de usuarios
    // (tabla destino_resenas). Sin reseñas = 0 / 0. Ya no se usan los valores fijos del seed.
    rating: row.real_rating != null ? parseFloat(row.real_rating) : 0,
    reviewCount: row.real_count != null ? Number(row.real_count) : 0,
    ratingBreakdown: row.rating_breakdown,
    reviews: row.reviews,
  };
}

// Une cada destino con el promedio y el conteo de sus reseñas reales.
const SELECT_CON_CALIFICACION = `
  SELECT d.*,
         COALESCE(r.promedio, 0) AS real_rating,
         COALESCE(r.total, 0)    AS real_count
  FROM destinos d
  LEFT JOIN (
    SELECT destino_id, ROUND(AVG(rating)::numeric, 1) AS promedio, COUNT(*)::int AS total
    FROM destino_resenas
    GROUP BY destino_id
  ) r ON r.destino_id = d.id
`;

export async function listDestinos() {
  const { rows } = await query(`${SELECT_CON_CALIFICACION} ORDER BY d.created_at DESC`);
  return rows.map(toApi);
}

export async function findDestinoById(id) {
  const { rows } = await query(`${SELECT_CON_CALIFICACION} WHERE d.id = $1`, [id]);
  if (!rows[0]) return null;
  return toApi(rows[0]);
}

export async function createDestino(data) {
  const {
    id, name, location, label, tag, category, description, image,
    images = [], rules = [], bestActivities, coordinates = [],
    rating = 0, reviewCount = 0, ratingBreakdown = [], reviews = []
  } = data;

  const { rows } = await query(
    `INSERT INTO destinos (
      id, name, location, label, tag, category, description, image,
      images, rules, best_activities, coordinates, rating, review_count,
      rating_breakdown, reviews
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
    ) RETURNING *`,
    [
      id ?? null, name ?? null, location ?? null, label ?? null, tag ?? null, category ?? null, description ?? null, image ?? null,
      images ?? [], rules ? JSON.stringify(rules) : '[]', bestActivities ?? null, coordinates ? JSON.stringify(coordinates) : '[]',
      rating ?? 0, reviewCount ?? 0, ratingBreakdown ? JSON.stringify(ratingBreakdown) : '[]', reviews ? JSON.stringify(reviews) : '[]'
    ]
  );
  return findDestinoById(rows[0].id);
}

export async function updateDestino(id, data) {
  const {
    name, location, label, tag, category, description, image,
    images, rules, bestActivities, coordinates,
    rating, reviewCount, ratingBreakdown, reviews
  } = data;

  const { rows } = await query(
    `UPDATE destinos SET
      name = COALESCE($1, name),
      location = COALESCE($2, location),
      label = COALESCE($3, label),
      tag = COALESCE($4, tag),
      category = COALESCE($5, category),
      description = COALESCE($6, description),
      image = COALESCE($7, image),
      images = COALESCE($8, images),
      rules = COALESCE($9, rules),
      best_activities = COALESCE($10, best_activities),
      coordinates = COALESCE($11, coordinates),
      rating = COALESCE($12, rating),
      review_count = COALESCE($13, review_count),
      rating_breakdown = COALESCE($14, rating_breakdown),
      reviews = COALESCE($15, reviews)
    WHERE id = $16 RETURNING *`,
    [
      name ?? null, location ?? null, label ?? null, tag ?? null, category ?? null, description ?? null, image ?? null,
      images ? images : null,
      rules ? JSON.stringify(rules) : null,
      bestActivities ?? null,
      coordinates ? JSON.stringify(coordinates) : null,
      rating ?? null, reviewCount ?? null,
      ratingBreakdown ? JSON.stringify(ratingBreakdown) : null,
      reviews ? JSON.stringify(reviews) : null,
      id
    ]
  );
  if (!rows[0]) return null;
  return findDestinoById(rows[0].id);
}

export async function deleteDestino(id) {
  const { rowCount } = await query(`DELETE FROM destinos WHERE id = $1`, [id]);
  return rowCount > 0;
}
