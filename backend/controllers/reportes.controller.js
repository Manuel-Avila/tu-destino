import crypto from 'crypto';
import { saveReportEvidence } from '../utils/reportEvidence.js';
import { findUserById } from '../models/user.model.js';
import {
  createReporte as createReporteModel,
  findReporteByFolio,
  findReportesByFolios,
  listReportesByUser,
  findReporteById,
  listReportes,
  updateReporteStatus,
} from '../models/reporte.model.js';

function createFolio() {
  const year = new Date().getUTCFullYear();
  return `TD-${year}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function hashTrackingToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function publicReportByFolio(reporte) {
  const { userId, isAnonymous, trackingTokenHash, ...publicReporte } = reporte;
  return publicReporte;
}

export async function createReporte(req, res) {
  try {
    const isAnonymous = req.body.isAnonymous;
    let reporterName = null;
    let reporterEmail = null;
    let userId = null;
    const trackingToken = isAnonymous ? crypto.randomBytes(32).toString('hex') : null;

    if (!isAnonymous) {
      if (req.user?.id) {
        const user = await findUserById(req.user.id);
        userId = user?.id || null;
        reporterName = user?.full_name || req.body.reporterName;
        reporterEmail = user?.email || req.body.reporterEmail;
      } else {
        reporterName = req.body.reporterName;
        reporterEmail = req.body.reporterEmail;
      }
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const evidencias = await Promise.all((req.files || []).map(async (file) => ({
      url: await saveReportEvidence(file, baseUrl),
      mediaType: 'image',
      originalName: file.originalname,
    })));

    const reporte = await createReporteModel({
      folio: createFolio(),
      userId,
      isAnonymous,
      trackingTokenHash: trackingToken ? hashTrackingToken(trackingToken) : null,
      reporterName,
      reporterEmail,
      incidentType: req.body.incidentType,
      description: req.body.description,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      evidencias,
    });

    return res.status(201).json({
      reporte: trackingToken ? { ...reporte, trackingToken } : reporte,
    });
  } catch (err) {
    console.error('[reportes.create] error:', err);
    return res.status(500).json({ error: 'No se pudo enviar el reporte. Intenta de nuevo.' });
  }
}

export async function getReporteByFolio(req, res) {
  try {
    const reporte = await findReporteByFolio(req.params.folio);
    if (!reporte) return res.status(404).json({ error: 'No encontramos un reporte con ese folio.' });

    const user = req.user ? await findUserById(req.user.id) : null;
    const isAdmin = Boolean(user?.is_admin);
    const trackingToken = req.get('x-report-access-token') || '';
    const hasValidTrackingToken = reporte.trackingTokenHash
      && trackingToken
      && hashTrackingToken(trackingToken) === reporte.trackingTokenHash;

    if (reporte.isAnonymous) {
      if (!isAdmin && !hasValidTrackingToken) {
        return res.status(404).json({ error: 'No encontramos un reporte con ese folio.' });
      }
    } else if (!isAdmin && (!req.user || reporte.userId !== req.user.id)) {
      return res.status(404).json({ error: 'No encontramos un reporte con ese folio.' });
    }

    return res.json({ reporte: publicReportByFolio(reporte) });
  } catch (err) {
    console.error('[reportes.folio] error:', err);
    return res.status(500).json({ error: 'No se pudo consultar el reporte.' });
  }
}

/** Estado de varios reportes a la vez, a partir de los folios guardados en el navegador. */
export async function consultarFolios(req, res) {
  const accesos = Array.isArray(req.body?.accesses) ? req.body.accesses : [];
  const limpios = [...new Map(
    accesos
      .filter((item) => item && typeof item.folio === 'string' && typeof item.token === 'string')
      .map((item) => ({ folio: item.folio.trim().toUpperCase(), token: item.token.trim() }))
      .filter((item) => /^TD-\d{4}-[0-9A-F]{8}$/.test(item.folio) && /^[a-f0-9]{64}$/i.test(item.token))
      .map((item) => [item.folio, item])
  ).values()].slice(0, 50);
  if (limpios.length === 0) return res.json({ reportes: [] });
  try {
    return res.json({
      reportes: await findReportesByFolios(limpios.map((item) => ({
        folio: item.folio,
        tokenHash: hashTrackingToken(item.token),
      }))),
    });
  } catch (err) {
    console.error('[reportes.consulta] error:', err);
    return res.status(500).json({ error: 'No se pudieron consultar los reportes.' });
  }
}

/** Reportes que la persona envió con su cuenta (los anónimos no se asocian a ella). */
export async function getMisReportes(req, res) {
  try {
    return res.json({ reportes: await listReportesByUser(req.user.id) });
  } catch (err) {
    console.error('[reportes.mios] error:', err);
    return res.status(500).json({ error: 'No se pudieron cargar tus reportes.' });
  }
}

export async function getReportes(req, res) {
  try {
    const reportes = await listReportes({
      status: req.query.status || '',
      incidentType: req.query.incidentType || '',
      search: (req.query.search || '').trim(),
    });
    return res.json({ reportes });
  } catch (err) {
    console.error('[reportes.list] error:', err);
    return res.status(500).json({ error: 'No se pudieron cargar los reportes.' });
  }
}

export async function getReporte(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Reporte inválido.' });
  try {
    const reporte = await findReporteById(id);
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado.' });
    return res.json({ reporte });
  } catch (err) {
    console.error('[reportes.detail] error:', err);
    return res.status(500).json({ error: 'No se pudo cargar el reporte.' });
  }
}

export async function patchReporteStatus(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Reporte inválido.' });
  try {
    const reporte = await updateReporteStatus({
      id,
      status: req.body.status,
      note: req.body.note,
      changedBy: req.user.id,
    });
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado.' });
    return res.json({ reporte });
  } catch (err) {
    console.error('[reportes.status] error:', err);
    return res.status(500).json({ error: 'No se pudo actualizar el estado.' });
  }
}
