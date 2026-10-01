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

export async function createEvento(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`
      INSERT INTO eventos (
        slug, titulo_evento, subtitulo_evento, descripcion_evento,
        categoria, etiqueta_imagen, insignia_tarjeta, badges, fase_evento, imagenes,
        fecha_evento, hora_inicio, hora_fin, duracion_horas,
        lugar_evento, localidad, punto_encuentro_nombre, punto_encuentro_direccion,
        latitud, longitud,
        responsable_nombre, responsable_cargo, responsable_correo, responsable_telefono, responsable_cita,
        cupo_total, cupos_ocupados, forms_url,
        metricas, reglas_titulo, reglas_intro, reglas, preguntas_frecuentes,
        activo
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, COALESCE($34, TRUE)
      ) RETURNING *
    `, [
      data.slug ?? null, data.titulo_evento ?? null, data.subtitulo_evento ?? null, data.descripcion_evento ?? null,
      data.categoria ?? null, data.etiqueta_imagen ?? null, data.insignia_tarjeta ?? null, data.badges || [], data.fase_evento ?? null, data.imagenes || [],
      data.fecha_evento ?? null, data.hora_inicio ?? null, data.hora_fin ?? null, data.duracion_horas ?? null,
      data.lugar_evento ?? null, data.localidad ?? null, data.punto_encuentro_nombre ?? null, data.punto_encuentro_direccion ?? null,
      data.latitud ?? null, data.longitud ?? null,
      data.responsable_nombre ?? null, data.responsable_cargo ?? null, data.responsable_correo ?? null, data.responsable_telefono ?? null, data.responsable_cita ?? null,
      data.cupo_total ?? null, data.cupos_ocupados || 0, data.forms_url ?? null,
      JSON.stringify(data.metricas || []), data.reglas_titulo ?? null, data.reglas_intro ?? null, JSON.stringify(data.reglas || []), JSON.stringify(data.preguntas_frecuentes || []),
      data.activo ?? null
    ]);

    const id = rows[0].id;

    if (data.itinerario) {
      for (let i = 0; i < data.itinerario.length; i++) {
        const step = data.itinerario[i];
        await client.query(
          `INSERT INTO evento_itinerario (evento_id, orden, titulo, hora, descripcion) VALUES ($1, $2, $3, $4, $5)`,
          [id, i + 1, step.titulo, step.hora, step.descripcion]
        );
      }
    }
    if (data.organizadores) {
      for (let i = 0; i < data.organizadores.length; i++) {
        const org = data.organizadores[i];
        await client.query(
          `INSERT INTO evento_organizadores (evento_id, orden, nombre, nombre_corto, descripcion) VALUES ($1, $2, $3, $4, $5)`,
          [id, i + 1, org.nombre, org.nombreCorto || org.nombre_corto, org.descripcion]
        );
      }
    }
    if (data.lineas_impacto) {
      for (let i = 0; i < data.lineas_impacto.length; i++) {
        const li = data.lineas_impacto[i];
        await client.query(
          `INSERT INTO evento_lineas_impacto (evento_id, orden, etiqueta, destacada) VALUES ($1, $2, $3, $4)`,
          [id, i + 1, li.etiqueta, li.destacada || false]
        );
      }
    }
    if (data.incluye) {
      for (let i = 0; i < data.incluye.length; i++) {
        await client.query(
          `INSERT INTO evento_incluye (evento_id, orden, texto) VALUES ($1, $2, $3)`,
          [id, i + 1, data.incluye[i]]
        );
      }
    }
    if (data.llevar) {
      for (let i = 0; i < data.llevar.length; i++) {
        await client.query(
          `INSERT INTO evento_llevar (evento_id, orden, texto) VALUES ($1, $2, $3)`,
          [id, i + 1, data.llevar[i]]
        );
      }
    }

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateEvento(slug, data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`
      UPDATE eventos SET
        titulo_evento = COALESCE($1, titulo_evento), subtitulo_evento = COALESCE($2, subtitulo_evento), descripcion_evento = COALESCE($3, descripcion_evento),
        categoria = COALESCE($4, categoria), etiqueta_imagen = COALESCE($5, etiqueta_imagen), insignia_tarjeta = COALESCE($6, insignia_tarjeta), badges = COALESCE($7, badges), fase_evento = COALESCE($8, fase_evento), imagenes = COALESCE($9, imagenes),
        fecha_evento = COALESCE($10, fecha_evento), hora_inicio = COALESCE($11, hora_inicio), hora_fin = COALESCE($12, hora_fin), duracion_horas = COALESCE($13, duracion_horas),
        lugar_evento = COALESCE($14, lugar_evento), localidad = COALESCE($15, localidad), punto_encuentro_nombre = COALESCE($16, punto_encuentro_nombre), punto_encuentro_direccion = COALESCE($17, punto_encuentro_direccion),
        latitud = COALESCE($18, latitud), longitud = COALESCE($19, longitud),
        responsable_nombre = COALESCE($20, responsable_nombre), responsable_cargo = COALESCE($21, responsable_cargo), responsable_correo = COALESCE($22, responsable_correo), responsable_telefono = COALESCE($23, responsable_telefono), responsable_cita = COALESCE($24, responsable_cita),
        cupo_total = COALESCE($25, cupo_total), cupos_ocupados = COALESCE($26, cupos_ocupados), forms_url = COALESCE($27, forms_url),
        metricas = COALESCE($28, metricas), reglas_titulo = COALESCE($29, reglas_titulo), reglas_intro = COALESCE($30, reglas_intro), reglas = COALESCE($31, reglas), preguntas_frecuentes = COALESCE($32, preguntas_frecuentes),
        activo = COALESCE($33, activo), slug = COALESCE($34, slug)
      WHERE slug = $35 RETURNING id
    `, [
      data.titulo_evento ?? null, data.subtitulo_evento ?? null, data.descripcion_evento ?? null,
      data.categoria ?? null, data.etiqueta_imagen ?? null, data.insignia_tarjeta ?? null, data.badges ?? null, data.fase_evento ?? null, data.imagenes ?? null,
      data.fecha_evento ?? null, data.hora_inicio ?? null, data.hora_fin ?? null, data.duracion_horas ?? null,
      data.lugar_evento ?? null, data.localidad ?? null, data.punto_encuentro_nombre ?? null, data.punto_encuentro_direccion ?? null,
      data.latitud ?? null, data.longitud ?? null,
      data.responsable_nombre ?? null, data.responsable_cargo ?? null, data.responsable_correo ?? null, data.responsable_telefono ?? null, data.responsable_cita ?? null,
      data.cupo_total ?? null, data.cupos_ocupados ?? null, data.forms_url ?? null,
      data.metricas ? JSON.stringify(data.metricas) : null, data.reglas_titulo ?? null, data.reglas_intro ?? null, data.reglas ? JSON.stringify(data.reglas) : null, data.preguntas_frecuentes ? JSON.stringify(data.preguntas_frecuentes) : null,
      data.activo ?? null, data.slug ?? null, slug
    ]);

    if (!rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }
    const id = rows[0].id;

    if (data.itinerario) {
      await client.query('DELETE FROM evento_itinerario WHERE evento_id = $1', [id]);
      for (let i = 0; i < data.itinerario.length; i++) {
        const step = data.itinerario[i];
        await client.query(
          `INSERT INTO evento_itinerario (evento_id, orden, titulo, hora, descripcion) VALUES ($1, $2, $3, $4, $5)`,
          [id, i + 1, step.titulo, step.hora, step.descripcion]
        );
      }
    }
    if (data.organizadores) {
      await client.query('DELETE FROM evento_organizadores WHERE evento_id = $1', [id]);
      for (let i = 0; i < data.organizadores.length; i++) {
        const org = data.organizadores[i];
        await client.query(
          `INSERT INTO evento_organizadores (evento_id, orden, nombre, nombre_corto, descripcion) VALUES ($1, $2, $3, $4, $5)`,
          [id, i + 1, org.nombre, org.nombreCorto || org.nombre_corto, org.descripcion]
        );
      }
    }
    if (data.lineas_impacto) {
      await client.query('DELETE FROM evento_lineas_impacto WHERE evento_id = $1', [id]);
      for (let i = 0; i < data.lineas_impacto.length; i++) {
        const li = data.lineas_impacto[i];
        await client.query(
          `INSERT INTO evento_lineas_impacto (evento_id, orden, etiqueta, destacada) VALUES ($1, $2, $3, $4)`,
          [id, i + 1, li.etiqueta, li.destacada || false]
        );
      }
    }
    if (data.incluye) {
      await client.query('DELETE FROM evento_incluye WHERE evento_id = $1', [id]);
      for (let i = 0; i < data.incluye.length; i++) {
        await client.query(
          `INSERT INTO evento_incluye (evento_id, orden, texto) VALUES ($1, $2, $3)`,
          [id, i + 1, data.incluye[i]]
        );
      }
    }
    if (data.llevar) {
      await client.query('DELETE FROM evento_llevar WHERE evento_id = $1', [id]);
      for (let i = 0; i < data.llevar.length; i++) {
        await client.query(
          `INSERT INTO evento_llevar (evento_id, orden, texto) VALUES ($1, $2, $3)`,
          [id, i + 1, data.llevar[i]]
        );
      }
    }

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteEvento(slug) {
  const { rowCount } = await query('DELETE FROM eventos WHERE slug = $1', [slug]);
  return rowCount > 0;
}
