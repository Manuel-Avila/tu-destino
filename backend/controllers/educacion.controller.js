import { uploadBufferToCloudinary } from '../utils/cloudinary.js';
import {
  createPublicacion,
  deletePublicacion,
  listPublicaciones,
  updatePublicacion,
} from '../models/educacion.model.js';
import { publicacionSchema } from '../validators/educacion.validators.js';

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Publicación inválida.' });
    return null;
  }
  return id;
}

export async function getAll(req, res) {
  try {
    res.json({ publicaciones: await listPublicaciones() });
  } catch (err) {
    console.error('[educacion] listar:', err);
    res.status(500).json({ error: 'No se pudieron cargar las publicaciones.' });
  }
}

export async function create(req, res) {
  const parsed = publicacionSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = {};
    parsed.error.issues.forEach((issue) => {
      if (issue.path.length > 0) errors[issue.path[0]] = issue.message;
    });
    return res.status(400).json({ errors });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'La imagen de la publicación es obligatoria.' });
  }

  try {
    const imagen = await uploadBufferToCloudinary(req.file.buffer, 'tudestino/educacion');
    const publicacion = await createPublicacion({ ...parsed.data, imagen });
    return res.status(201).json({ publicacion });
  } catch (err) {
    console.error('[educacion] crear:', err);
    return res.status(500).json({ error: 'No se pudo crear la publicación.' });
  }
}

export async function update(req, res) {
  const id = parseId(req, res);
  if (!id) return;

  const parsed = publicacionSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = {};
    parsed.error.issues.forEach((issue) => {
      if (issue.path.length > 0) errors[issue.path[0]] = issue.message;
    });
    return res.status(400).json({ errors });
  }

  try {
    const data = { ...parsed.data };
    if (req.file) {
      data.imagen = await uploadBufferToCloudinary(req.file.buffer, 'tudestino/educacion');
    } else if (req.body.quitar_imagen === 'true') {
      data.imagen = '';
    }

    const publicacion = await updatePublicacion(id, data);
    if (!publicacion) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }
    return res.json({ publicacion });
  } catch (err) {
    console.error('[educacion] actualizar:', err);
    return res.status(500).json({ error: 'No se pudo actualizar la publicación.' });
  }
}

export async function remove(req, res) {
  const id = parseId(req, res);
  if (!id) return;

  try {
    const deleted = await deletePublicacion(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[educacion] eliminar:', err);
    return res.status(500).json({ error: 'No se pudo eliminar la publicación.' });
  }
}
