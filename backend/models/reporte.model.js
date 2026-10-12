import pool, { query } from '../config/db.js';

function toSummary(row) {
  return {
    id: row.id,
    folio: row.folio,
    incidentType: row.incident_type,
    description: row.description,
    coordinates: [row.latitude, row.longitude],
    isAnonymous: row.is_anonymous,
    status: row.status,
    evidenceCount: Number(row.evidence_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createReporte(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO reportes (
        folio, user_id, is_anonymous, reporter_name, reporter_email,
        incident_type, description, latitude, longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.folio,
        data.userId,
        data.isAnonymous,
        data.reporterName,
        data.reporterEmail,
        data.incidentType,
        data.description,
        data.latitude,
        data.longitude,
      ]
    );
    const reporte = rows[0];

    for (const evidencia of data.evidencias || []) {
      await client.query(
        `INSERT INTO reporte_evidencias (reporte_id, url, media_type, original_name)
         VALUES ($1, $2, $3, $4)`,
        [reporte.id, evidencia.url, evidencia.mediaType, evidencia.originalName]
      );
    }

    await client.query(
      `INSERT INTO reporte_historial_estado (reporte_id, status, note)
       VALUES ($1, 'pendiente', 'Reporte recibido')`,
      [reporte.id]
    );

    await client.query('COMMIT');
    return toSummary({ ...reporte, evidence_count: (data.evidencias || []).length });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function findReporteByFolio(folio) {
  const { rows } = await query(
    `SELECT r.*,
      (SELECT COUNT(*) FROM reporte_evidencias e WHERE e.reporte_id = r.id) AS evidence_count
     FROM reportes r WHERE UPPER(r.folio) = UPPER($1)`,
    [folio]
  );
  if (!rows[0]) return null;
  const history = await query(
    `SELECT status, created_at FROM reporte_historial_estado
     WHERE reporte_id = $1 ORDER BY created_at`,
    [rows[0].id]
  );
  const row = rows[0];
  return {
    folio: row.folio,
    incidentType: row.incident_type,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    history: history.rows.map((item) => ({
      status: item.status,
      createdAt: item.created_at,
    })),
  };
}

export async function listReportes({ status, incidentType, search }) {
  const values = [];
  const conditions = [];
  if (status) {
    values.push(status);
    conditions.push(`r.status = $${values.length}`);
  }
  if (incidentType) {
    values.push(incidentType);
    conditions.push(`r.incident_type = $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(r.folio ILIKE $${values.length} OR r.description ILIKE $${values.length})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT r.*,
      (SELECT COUNT(*) FROM reporte_evidencias e WHERE e.reporte_id = r.id) AS evidence_count
     FROM reportes r ${where}
     ORDER BY r.created_at DESC`,
    values
  );
  return rows.map(toSummary);
}

export async function findReporteById(id) {
  const { rows } = await query(
    `SELECT r.*, u.full_name AS account_name, u.email AS account_email,
      (SELECT COUNT(*) FROM reporte_evidencias e WHERE e.reporte_id = r.id) AS evidence_count
     FROM reportes r LEFT JOIN users u ON u.id = r.user_id
     WHERE r.id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  const [evidencias, historial] = await Promise.all([
    query(`SELECT id, url, media_type, original_name, created_at FROM reporte_evidencias WHERE reporte_id = $1 ORDER BY id`, [id]),
    query(
      `SELECT h.id, h.status, h.note, h.created_at, u.full_name AS changed_by_name
       FROM reporte_historial_estado h
       LEFT JOIN users u ON u.id = h.changed_by
       WHERE h.reporte_id = $1 ORDER BY h.created_at`,
      [id]
    ),
  ]);
  const row = rows[0];
  return {
    ...toSummary(row),
    reporter: row.is_anonymous ? null : {
      name: row.reporter_name || row.account_name,
      email: row.reporter_email || row.account_email,
    },
    evidences: evidencias.rows.map((item) => ({
      id: item.id,
      url: item.url,
      mediaType: item.media_type,
      originalName: item.original_name,
      createdAt: item.created_at,
    })),
    history: historial.rows.map((item) => ({
      id: item.id,
      status: item.status,
      note: item.note,
      changedBy: item.changed_by_name,
      createdAt: item.created_at,
    })),
  };
}

export async function updateReporteStatus({ id, status, note, changedBy }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE reportes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
      [status, id]
    );
    if (!rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }
    await client.query(
      `INSERT INTO reporte_historial_estado (reporte_id, status, note, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [id, status, note, changedBy]
    );
    await client.query('COMMIT');
    return findReporteById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
