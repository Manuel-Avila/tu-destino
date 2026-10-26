import { z } from 'zod';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';
import { findUserById } from '../models/user.model.js';
import { listEventos, findEventoBySlug, registrarInscripcion, inscribirUsuario, listSlugsInscritos, createEvento as createEventoModel, updateEvento as updateEventoModel, deleteEvento as deleteEventoModel } from '../models/evento.model.js';


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

const telefonoRegex = /^[0-9+()\-\s]{8,20}$/;

const inscripcionAppSchema = z.object({
  telefono: z.string().trim().regex(telefonoRegex, 'Escribe un teléfono válido (8 a 20 dígitos).'),
  edad: z.coerce.number().int().min(5, 'La edad mínima es 5 años.').max(99, 'Escribe una edad válida.'),
  contactoEmergenciaNombre: z.string().trim().min(2, 'Escribe el nombre del contacto de emergencia.').max(150),
  contactoEmergenciaTelefono: z.string().trim().regex(telefonoRegex, 'Escribe un teléfono de emergencia válido.'),
  notas: z.string().trim().max(500, 'Máximo 500 caracteres.').optional().or(z.literal('')),
});

/** El usuario con sesión se inscribe desde el formulario de la app. */
export async function inscribirse(req, res) {
  const parsed = inscripcionAppSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = {};
    for (const issue of parsed.error.issues) errors[issue.path[0]] = issue.message;
    return res.status(400).json({ error: Object.values(errors)[0] || 'Datos de inscripción inválidos.', errors });
  }

  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(401).json({ error: 'Sesión inválida.' });

    const result = await inscribirUsuario(req.params.slug, user, parsed.data);
    if (!result) return res.status(404).json({ error: 'Evento no encontrado.' });
    if (result.estado === 'duplicado') {
      return res.status(409).json({ error: 'Ya estás inscrito en este evento.', convocatoria: result.convocatoria });
    }
    if (result.estado === 'lleno') {
      return res.status(409).json({ error: 'El cupo de este evento ya está lleno.', convocatoria: result.convocatoria });
    }
    res.status(201).json({ inscrito: true, convocatoria: result.convocatoria });
  } catch (err) {
    console.error('[eventos] inscribirse:', err);
    res.status(500).json({ error: 'No se pudo completar la inscripción.' });
  }
}

/** Slugs de los eventos en los que el usuario está inscrito. */
export async function misInscripciones(req, res) {
  try {
    res.json({ slugs: await listSlugsInscritos(req.user.id) });
  } catch (err) {
    console.error('[eventos] mis inscripciones:', err);
    res.status(500).json({ error: 'No se pudieron cargar tus inscripciones.' });
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

