
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
      data.slug, data.titulo_evento, data.subtitulo_evento, data.descripcion_evento,
      data.categoria, data.etiqueta_imagen, data.insignia_tarjeta, data.badges || [], data.fase_evento, data.imagenes || [],
      data.fecha_evento, data.hora_inicio, data.hora_fin, data.duracion_horas,
      data.lugar_evento, data.localidad, data.punto_encuentro_nombre, data.punto_encuentro_direccion,
      data.latitud, data.longitud,
      data.responsable_nombre, data.responsable_cargo, data.responsable_correo, data.responsable_telefono, data.responsable_cita,
      data.cupo_total, data.cupos_ocupados || 0, data.forms_url,
      JSON.stringify(data.metricas || []), data.reglas_titulo, data.reglas_intro, JSON.stringify(data.reglas || []), JSON.stringify(data.preguntas_frecuentes || []),
      data.activo
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
      data.titulo_evento, data.subtitulo_evento, data.descripcion_evento,
      data.categoria, data.etiqueta_imagen, data.insignia_tarjeta, data.badges, data.fase_evento, data.imagenes,
      data.fecha_evento, data.hora_inicio, data.hora_fin, data.duracion_horas,
      data.lugar_evento, data.localidad, data.punto_encuentro_nombre, data.punto_encuentro_direccion,
      data.latitud, data.longitud,
      data.responsable_nombre, data.responsable_cargo, data.responsable_correo, data.responsable_telefono, data.responsable_cita,
      data.cupo_total, data.cupos_ocupados, data.forms_url,
      data.metricas ? JSON.stringify(data.metricas) : null, data.reglas_titulo, data.reglas_intro, data.reglas ? JSON.stringify(data.reglas) : null, data.preguntas_frecuentes ? JSON.stringify(data.preguntas_frecuentes) : null,
      data.activo, data.slug, slug
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
