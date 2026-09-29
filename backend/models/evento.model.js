import pool, { query } from '../config/db.js';

// Columnas base + campos formateados (evita que pg convierta DATE/TIME a objetos Date con zona horaria).
const BASE_SELECT = `
  e.id, e.slug, e.titulo_evento, e.subtitulo_evento, e.descripcion_evento,
  e.categoria, e.etiqueta_imagen, e.insignia_tarjeta, e.badges, e.fase_evento, e.imagenes,
  to_char(e.fecha_evento, 'YYYY-MM-DD') AS fecha,
  to_char(e.hora_inicio, 'HH24:MI') AS hora_inicio,
  to_char(e.hora_fin, 'HH24:MI') AS hora_fin,
  e.duracion_horas::float AS duracion_horas,
  e.lugar_evento, e.localidad, e.punto_encuentro_nombre, e.punto_encuentro_direccion,
  e.latitud, e.longitud,
  e.responsable_nombre, e.responsable_cargo, e.responsable_correo, e.responsable_telefono, e.responsable_cita,
  e.cupo_total, e.cupos_ocupados, e.forms_url,
  e.metricas, e.reglas_titulo, e.reglas_intro, e.reglas, e.preguntas_frecuentes
`;

const ORGS_SUBQUERY = `
  COALESCE((
    SELECT json_agg(json_build_object(
      'nombre', o.nombre, 'nombreCorto', o.nombre_corto, 'descripcion', o.descripcion
    ) ORDER BY o.orden)
    FROM evento_organizadores o WHERE o.evento_id = e.id
  ), '[]'::json) AS organizadores`;

const LINEAS_SUBQUERY = `
  COALESCE((
    SELECT json_agg(json_build_object('etiqueta', l.etiqueta, 'destacada', l.destacada) ORDER BY l.orden)
    FROM evento_lineas_impacto l WHERE l.evento_id = e.id
  ), '[]'::json) AS lineas_impacto`;

// La tarjeta reutiliza la descripción del evento: solo toma la primera oración del primer párrafo.
function resumenDe(descripcion) {
  const primerParrafo = descripcion.split(/\n{2,}/)[0].trim();
  const match = primerParrafo.match(/^.*?[.!?](?=\s|$)/s);
  return match ? match[0] : primerParrafo;
}

function toApi(row) {
  const restantes = row.cupo_total - row.cupos_ocupados;
  return {
    id: row.id,
    slug: row.slug,
    tituloEvento: row.titulo_evento,
    subtituloEvento: row.subtitulo_evento,
    descripcionEvento: row.descripcion_evento,
    resumen: resumenDe(row.descripcion_evento),
    categoria: row.categoria,
    etiquetaImagen: row.etiqueta_imagen,
    insigniaTarjeta: row.insignia_tarjeta,
    badges: row.badges,
    faseEvento: row.fase_evento,
    imagenes: row.imagenes,
    fecha: row.fecha,
    horaInicio: row.hora_inicio,
    horaFin: row.hora_fin,
    duracionHoras: row.duracion_horas,
    lugarEvento: row.lugar_evento,
    localidad: row.localidad,
    puntoEncuentro: {
      nombre: row.punto_encuentro_nombre,
      direccion: row.punto_encuentro_direccion,
    },
    coordenadas: [row.latitud, row.longitud],
    responsable: {
      nombre: row.responsable_nombre,
      cargo: row.responsable_cargo,
      correo: row.responsable_correo,
      telefono: row.responsable_telefono,
      cita: row.responsable_cita,
    },
    convocatoria: {
      cupoTotal: row.cupo_total,
      cuposOcupados: row.cupos_ocupados,
      cuposRestantes: restantes,
      lleno: restantes <= 0,
      formsUrl: row.forms_url,
    },
    metricas: row.metricas,
    reglasTitulo: row.reglas_titulo,
    reglasIntro: row.reglas_intro,
    reglas: row.reglas,
    preguntasFrecuentes: row.preguntas_frecuentes,
    organizadores: row.organizadores,
    lineasImpacto: row.lineas_impacto,
  };
}

export async function listEventos() {
  const { rows } = await query(
    `SELECT ${BASE_SELECT}, ${ORGS_SUBQUERY}, ${LINEAS_SUBQUERY}
     FROM eventos e
     WHERE e.activo = TRUE
     ORDER BY e.fecha_evento, e.hora_inicio`
  );
  return rows.map(toApi);
}

export async function findEventoBySlug(slug) {
  const { rows } = await query(
    `SELECT ${BASE_SELECT}, ${ORGS_SUBQUERY}, ${LINEAS_SUBQUERY}
     FROM eventos e WHERE e.slug = $1 AND e.activo = TRUE`,
    [slug]
  );
  if (!rows[0]) return null;
  const evento = toApi(rows[0]);
  const id = rows[0].id;

  const [itinerario, incluye, llevar] = await Promise.all([
    query(
      `SELECT titulo, to_char(hora, 'HH24:MI') AS hora, descripcion
       FROM evento_itinerario WHERE evento_id = $1 ORDER BY orden`,
      [id]
    ),
    query(`SELECT texto FROM evento_incluye WHERE evento_id = $1 ORDER BY orden`, [id]),
    query(`SELECT texto FROM evento_llevar WHERE evento_id = $1 ORDER BY orden`, [id]),
  ]);

  evento.itinerario = itinerario.rows;
  evento.incluye = incluye.rows.map((r) => r.texto);
  evento.llevar = llevar.rows.map((r) => r.texto);
  return evento;
}

/**
 * Registra una inscripción confirmada (llega desde el Google Form) y actualiza cupos_ocupados.
 * Es idempotente: si la misma respuesta_id llega dos veces, solo cuenta una.
 * Devuelve { registrado, convocatoria } o null si el evento no existe.
 */
export async function registrarInscripcion(slug, { respuestaId, nombre, correo }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ev = await client.query(
      `SELECT id, cupo_total, cupos_ocupados FROM eventos WHERE slug = $1 AND activo = TRUE FOR UPDATE`,
      [slug]
    );
    if (!ev.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }
    const { id, cupo_total } = ev.rows[0];

    const ins = await client.query(
      `INSERT INTO evento_inscripciones (evento_id, respuesta_id, nombre, correo)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (evento_id, respuesta_id) DO NOTHING
       RETURNING id`,
      [id, respuestaId, nombre || null, correo || null]
    );

    let cuposOcupados = ev.rows[0].cupos_ocupados;
    const registrado = ins.rowCount > 0;
    if (registrado) {
      const upd = await client.query(
        `UPDATE eventos SET cupos_ocupados = LEAST(cupo_total, cupos_ocupados + 1)
         WHERE id = $1 RETURNING cupos_ocupados`,
        [id]
      );
      cuposOcupados = upd.rows[0].cupos_ocupados;
    }

    await client.query('COMMIT');
    return {
      registrado,
      convocatoria: {
        cupoTotal: cupo_total,
        cuposOcupados,
        cuposRestantes: cupo_total - cuposOcupados,
        lleno: cuposOcupados >= cupo_total,
      },
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
