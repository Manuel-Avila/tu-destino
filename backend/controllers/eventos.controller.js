import { z } from 'zod';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';
import { listEventos, findEventoBySlug, registrarInscripcion, createEvento as createEventoModel, updateEvento as updateEventoModel, deleteEvento as deleteEventoModel } from '../models/evento.model.js';


export async function getEventos(req, res) {
  try {
    res.json({ eventos: await listEventos() });
  } catch (err) {
    console.error('[eventos] listar:', err);
    res.status(500).json({ error: 'No se pudieron cargar los eventos.' });
  }
}

export async function getEvento(req, res) {
  try {
    const evento = await findEventoBySlug(req.params.slug);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado.' });
    res.json({ evento });
  } catch (err) {
    console.error('[eventos] detalle:', err);
    res.status(500).json({ error: 'No se pudo cargar el evento.' });
  }
}

const inscripcionSchema = z.object({
  respuestaId: z.string().min(1).max(120),
  nombre: z.string().max(150).optional(),
  correo: z.string().max(255).optional(),
});

/**
 * Webhook que llama el Google Form (Apps Script) cada vez que alguien envía el formulario.
 * Ver docs/google-forms-cupos.md para el script.
 */
export async function confirmarAsistencia(req, res) {
  const parsed = inscripcionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Datos de inscripción inválidos.' });
  }

  try {
    const result = await registrarInscripcion(req.params.slug, parsed.data);
    if (!result) return res.status(404).json({ error: 'Evento no encontrado.' });
    res.status(result.registrado ? 201 : 200).json(result);
  } catch (err) {
    console.error('[eventos] inscripción:', err);
    res.status(500).json({ error: 'No se pudo registrar la inscripción.' });
  }
}

export async function createEvento(req, res) {
  try {
    const data = { ...req.body };
    if (data.duracion_horas) data.duracion_horas = Number(data.duracion_horas);
    if (data.latitud) data.latitud = Number(data.latitud);
    if (data.longitud) data.longitud = Number(data.longitud);
    if (data.cupo_total) data.cupo_total = Number(data.cupo_total);
    if (data.activo === 'true') data.activo = true;
    if (data.activo === 'false') data.activo = false;
    
    if (data.imagenes_existentes) {
       try { data.imagenes = JSON.parse(data.imagenes_existentes); } catch (e) { data.imagenes = []; }
    } else {
       data.imagenes = [];
    }

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadBufferToCloudinary(file.buffer));
      const newUrls = await Promise.all(uploadPromises);
      data.imagenes = [...data.imagenes, ...newUrls];
    }

    const evento = await createEventoModel(data);
    res.status(201).json({ evento });
  } catch (err) {
    console.error('[eventos] crear:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El Slug (URL) ya existe. Por favor usa uno diferente.' });
    }
    res.status(500).json({ error: 'No se pudo crear el evento.' });
  }
}

export async function updateEvento(req, res) {
  try {
    const data = { ...req.body };
    if (data.duracion_horas) data.duracion_horas = Number(data.duracion_horas);
    if (data.latitud) data.latitud = Number(data.latitud);
    if (data.longitud) data.longitud = Number(data.longitud);
    if (data.cupo_total) data.cupo_total = Number(data.cupo_total);
    if (data.activo === 'true') data.activo = true;
    if (data.activo === 'false') data.activo = false;
    
    if (data.imagenes_existentes) {
       try { data.imagenes = JSON.parse(data.imagenes_existentes); } catch (e) { data.imagenes = []; }
    } else {
       data.imagenes = [];
    }

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadBufferToCloudinary(file.buffer));
      const newUrls = await Promise.all(uploadPromises);
      data.imagenes = [...data.imagenes, ...newUrls];
    }

    const evento = await updateEventoModel(req.params.slug, data);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado.' });
    res.json({ evento });
  } catch (err) {
    console.error('[eventos] actualizar:', err);
    res.status(500).json({ error: 'No se pudo actualizar el evento.' });
  }
}

export async function deleteEvento(req, res) {
  try {
    const deleted = await deleteEventoModel(req.params.slug);
    if (!deleted) return res.status(404).json({ error: 'Evento no encontrado.' });
    res.json({ success: true });
  } catch (err) {
    console.error('[eventos] eliminar:', err);
    res.status(500).json({ error: 'No se pudo eliminar el evento.' });
  }
}

