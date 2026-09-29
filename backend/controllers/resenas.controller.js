import {
  createResena,
  deleteResena,
  getStatsByDestino,
  listResenasByDestino,
  listResenasByUser,
} from '../models/resena.model.js';
import { destinoIdSchema } from '../validators/resenas.validators.js';

function initialsOf(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
}

function toDto(row, currentUserId) {
  return {
    id: row.id,
    destinoId: row.destino_id,
    name: row.full_name,
    initials: initialsOf(row.full_name),
    rating: row.rating,
    activity: row.actividad || '',
    visitDate: row.fecha_visita || null,
    comment: row.comentario,
    createdAt: row.created_at,
    mine: currentUserId != null && row.user_id === currentUserId,
  };
}

function parseDestinoId(req, res) {
  const parsed = destinoIdSchema.safeParse(req.params.destinoId);
  if (!parsed.success) {
    res.status(400).json({ error: 'Destino inválido.' });
    return null;
  }
  return parsed.data;
}

export async function getResenasDestino(req, res) {
  const destinoId = parseDestinoId(req, res);
  if (!destinoId) return;
  try {
    const [rows, stats] = await Promise.all([
      listResenasByDestino(destinoId),
      getStatsByDestino(destinoId),
    ]);
    return res.json({
      resenas: rows.map((r) => toDto(r, req.user.id)),
      stats: { total: stats.total, suma: stats.suma },
    });
  } catch (err) {
    console.error('[resenas.getResenasDestino] error:', err);
    return res.status(500).json({ error: 'No se pudieron cargar las reseñas.' });
  }
}

export async function postResena(req, res) {
  const destinoId = parseDestinoId(req, res);
  if (!destinoId) return;
  const { rating, activity, visitDate, comment } = req.body;
  try {
    const row = await createResena({
      userId: req.user.id,
      destinoId,
      rating,
      actividad: activity,
      fechaVisita: visitDate,
      comentario: comment,
    });
    return res.status(201).json({ resena: toDto(row, req.user.id) });
  } catch (err) {
    console.error('[resenas.postResena] error:', err);
    return res.status(500).json({ error: 'No se pudo guardar la reseña. Intenta de nuevo.' });
  }
}

export async function deleteResenaPropia(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Reseña inválida.' });
  }
  try {
    const ok = await deleteResena({ id, userId: req.user.id });
    if (!ok) return res.status(404).json({ error: 'No encontramos esa reseña entre las tuyas.' });
    return res.status(204).end();
  } catch (err) {
    console.error('[resenas.deleteResenaPropia] error:', err);
    return res.status(500).json({ error: 'No se pudo eliminar la reseña.' });
  }
}

export async function getMisResenas(req, res) {
  try {
    const rows = await listResenasByUser(req.user.id);
    return res.json({ resenas: rows.map((r) => toDto(r, req.user.id)) });
  } catch (err) {
    console.error('[resenas.getMisResenas] error:', err);
    return res.status(500).json({ error: 'No se pudieron cargar tus reseñas.' });
  }
}
