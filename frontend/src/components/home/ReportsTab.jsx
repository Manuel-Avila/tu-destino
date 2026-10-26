import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import MapPicker from '../admin/MapPicker';
import ImagePicker from '../admin/ImagePicker';
import Icon from '../events/EventIcons';
import {
  consultarFolios,
  createReporte,
  getMisReportes,
  getReporteByFolio,
  REPORT_TYPES,
  STATUS_LABELS,
  reportTypeLabel,
} from '../../services/reportes.service';
import './ReportsTab.css';

function formatDate(value) {
  return new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

// Los reportes anónimos no se asocian a la cuenta, así que sus folios se recuerdan solo en este navegador.
const folioKey = (userId) => `tudestino:mis-reportes:${userId ?? 'anon'}`;

function readFolios(userId) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(folioKey(userId)) || '[]');
    return Array.isArray(parsed) ? parsed.filter((f) => typeof f === 'string') : [];
  } catch {
    return [];
  }
}

function saveFolio(userId, folio) {
  try {
    const next = [folio, ...readFolios(userId).filter((f) => f !== folio)].slice(0, 50);
    window.localStorage.setItem(folioKey(userId), JSON.stringify(next));
  } catch {
    // almacenamiento no disponible: el folio solo se muestra en la pantalla de confirmación
  }
}

export default function ReportsTab() {
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState({
    incidentType: '', description: '', latitude: null, longitude: null,
    isAnonymous: true, reporterName: user?.fullName || '', reporterEmail: user?.email || '', evidences: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const [lookupFolio, setLookupFolio] = useState('');
  const [lookup, setLookup] = useState({ status: 'idle', report: null, error: '' });
  const [mine, setMine] = useState({ status: 'loading', items: [] });

  // Lista de reportes de la persona: los de su cuenta + los folios guardados en este navegador.
  useEffect(() => {
    let cancelled = false;
    const folios = readFolios(user?.id);
    Promise.all([
      folios.length ? consultarFolios(folios).catch(() => []) : [],
      user ? getMisReportes().catch(() => []) : [],
    ]).then(([porFolio, porCuenta]) => {
      if (cancelled) return;
      const unicos = new Map();
      [...porCuenta, ...porFolio].forEach((item) => unicos.set(item.folio, item));
      const items = [...unicos.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMine({ status: 'ready', items });
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, submit: undefined }));
  }

  function handleEvidence(filesOrUrls) {
    const files = filesOrUrls.filter((item) => item instanceof File);
    if (files.length > 5) {
      setErrors((current) => ({ ...current, evidences: 'Puedes adjuntar hasta 5 imágenes.' }));
      return;
    }
    const invalid = files.find((file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024);
    if (invalid) {
      setErrors((current) => ({ ...current, evidences: 'Cada archivo debe ser una imagen de máximo 10 MB.' }));
      return;
    }
    setForm((current) => ({ ...current, evidences: files }));
    setErrors((current) => ({ ...current, evidences: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.incidentType) next.incidentType = 'Selecciona el tipo de incidente.';
    if (form.description.trim().length < 20) next.description = 'Agrega una descripción de al menos 20 caracteres.';
    if (form.latitude == null || form.longitude == null) next.location = 'Marca la ubicación aproximada en el mapa.';
    if (!form.isAnonymous && !form.reporterName.trim()) next.reporterName = 'El nombre es obligatorio.';
    if (!form.isAnonymous && !/^\S+@\S+\.\S+$/.test(form.reporterEmail)) next.reporterEmail = 'Escribe un correo válido.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const report = await createReporte(form);
      saveFolio(user?.id, report.folio);
      setMine((current) => ({
        status: 'ready',
        items: [report, ...current.items.filter((item) => item.folio !== report.folio)],
      }));
      setCreated(report);
      setLookupFolio(report.folio);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrors((current) => ({ ...current, ...(err.fieldErrors || {}), submit: err.message || 'No se pudo enviar el reporte.' }));
    } finally {
      setSubmitting(false);
    }
  }

  async function runLookup(folio) {
    if (!folio.trim()) return;
    setLookup({ status: 'loading', report: null, error: '' });
    try {
      const report = await getReporteByFolio(folio);
      setLookup({ status: 'ready', report, error: '' });
    } catch (err) {
      setLookup({ status: 'error', report: null, error: err.message || 'No encontramos ese folio.' });
    }
  }

  function handleLookup(event) {
    event.preventDefault();
    runLookup(lookupFolio);
  }

  function openFromList(folio) {
    setLookupFolio(folio);
    runLookup(folio);
  }

  if (created) {
    return (
      <section className="reports-page reports-page--success" aria-labelledby="report-success-title">
        <div className="report-success-card">
          <span className="report-success-card__icon"><Icon name="check" size={34} /></span>
          <p className="reports-eyebrow">REPORTE RECIBIDO</p>
          <h1 id="report-success-title">Gracias por ayudar a proteger Baja California Sur</h1>
          <p>Conserva este folio. Es la única referencia necesaria para consultar el seguimiento.</p>
          <strong className="report-folio">{created.folio}</strong>
          <div className="report-success-card__actions">
            <button type="button" className="report-primary-btn" onClick={() => setCreated(null)}>Enviar otro reporte</button>
            <button type="button" className="report-secondary-btn" onClick={() => { setCreated(null); runLookup(created.folio); }}>Consultar seguimiento</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="reports-page" id="reportes" aria-label="Reportes ambientales">
      <div className="reports-intro">
        <span className="reports-secure-badge"><Icon name="shield" size={14} /> Reporte seguro</span>
        <p className="reports-eyebrow">VIGILANCIA CIUDADANA</p>
        <h1>Reporte ambiental</h1>
        <p className="reports-intro__lead">Ayuda a proteger Baja California Sur. Comparte observaciones sobre fauna en riesgo, contaminación o actividades que puedan dañar nuestros ecosistemas.</p>
        <div className="reports-privacy-card">
          <Icon name="shield" size={24} />
          <div><h2>Tu identidad está protegida</h2><p>Si eliges reportar de forma anónima, no guardaremos tu cuenta, nombre ni correo junto al reporte.</p></div>
        </div>

        <section className="report-lookup" aria-labelledby="report-lookup-title">
          <div>
            <p className="reports-eyebrow">SEGUIMIENTO</p>
            <h2 id="report-lookup-title">Consulta el estado de tu reporte</h2>
            <p>Ingresa el folio que recibiste al enviarlo.</p>
          </div>
          <form onSubmit={handleLookup}>
            <input value={lookupFolio} onChange={(event) => setLookupFolio(event.target.value.toUpperCase())} placeholder="Ej. TD-2026-A1B2C3D4" aria-label="Folio del reporte" />
            <button type="submit" className="report-secondary-btn">Consultar</button>
          </form>
          {lookup.status === 'loading' && <p role="status">Consultando...</p>}
          {lookup.status === 'error' && <p className="report-error" role="alert">{lookup.error}</p>}
          {lookup.report && (
            <article className="report-lookup-result">
              <div className="report-lookup-result__top">
                <strong>{lookup.report.folio}</strong>
                <span className={`report-status report-status--${lookup.report.status}`}>{STATUS_LABELS[lookup.report.status]}</span>
              </div>
              <dl className="report-lookup-result__meta">
                <div><dt>Tipo</dt><dd>{reportTypeLabel(lookup.report.incidentType)}</dd></div>
                <div><dt>Enviado el</dt><dd>{formatDate(lookup.report.createdAt)}</dd></div>
              </dl>
              <div className="report-lookup-result__desc">
                <h3>Descripción</h3>
                <p>{lookup.report.description}</p>
              </div>
              <h3 className="report-lookup-result__history-title">Seguimiento</h3>
              <ol>{lookup.report.history.map((item, index) => <li key={`${item.status}-${index}`}><strong>{STATUS_LABELS[item.status]}</strong><span>{formatDate(item.createdAt)}</span></li>)}</ol>
            </article>
          )}
        </section>

        <section className="report-mine" aria-labelledby="report-mine-title">
          <div className="report-mine__head">
            <h2 id="report-mine-title">Mis reportes</h2>
            <span className="report-mine__count">{mine.items.length}</span>
          </div>
          {mine.status === 'loading' && <p className="report-help" role="status">Cargando tus reportes...</p>}
          {mine.status === 'ready' && mine.items.length === 0 && (
            <p className="report-help">Aún no has enviado reportes desde este navegador o cuenta.</p>
          )}
          {mine.items.length > 0 && (
            <ul className="report-mine__list">
              {mine.items.map((item) => (
                <li key={item.folio}>
                  <button type="button" className={`report-mine__item ${lookup.report?.folio === item.folio ? 'is-selected' : ''}`.trim()} onClick={() => openFromList(item.folio)}>
                    <span className="report-mine__row">
                      <strong>{item.folio}</strong>
                      <span className={`report-status report-status--${item.status}`}>{STATUS_LABELS[item.status]}</span>
                    </span>
                    <span className="report-mine__type">{reportTypeLabel(item.incidentType)}</span>
                    <span className="report-mine__desc">{item.description}</span>
                    <small>{formatDate(item.createdAt)}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <form className="report-form-card" onSubmit={handleSubmit} noValidate>
        <label className="report-field">
          <span>Tipo de reporte</span>
          <select value={form.incidentType} onChange={(event) => update('incidentType', event.target.value)} aria-invalid={Boolean(errors.incidentType)}>
            <option value="">Selecciona una categoría...</option>
            {REPORT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          {errors.incidentType && <small className="report-error">{errors.incidentType}</small>}
        </label>

        <label className="report-field">
          <span>Descripción</span>
          <textarea rows="5" maxLength="3000" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe qué observaste, cuándo ocurrió y cualquier detalle útil..." aria-invalid={Boolean(errors.description)} />
          <small className={errors.description ? 'report-error' : 'report-help'}>{errors.description || `${form.description.length}/3000 caracteres`}</small>
        </label>

        <div className="report-field">
          <div className="report-field__heading"><span>Ubicación aproximada</span><small><Icon name="pin" size={13} /> Haz clic para marcar</small></div>
          <MapPicker lat={form.latitude} lng={form.longitude} onChange={(latitude, longitude) => setForm((current) => ({ ...current, latitude, longitude }))} />
          {errors.location && <small className="report-error">{errors.location}</small>}
        </div>

        <div className="report-field">
          <span>Evidencia <em>(opcional)</em></span>
          <ImagePicker multiple onChange={handleEvidence} />
          <small className={errors.evidences ? 'report-error' : 'report-help'}>{errors.evidences || 'Hasta 5 imágenes, máximo 10 MB cada una.'}</small>
        </div>

        <div className="report-anonymous-row">
          <span className="report-anonymous-row__icon"><Icon name="shield" size={18} /></span>
          <div><strong>Enviar el reporte anónimamente</strong><small>Tu identidad no se asociará al reporte.</small></div>
          <button type="button" role="switch" aria-checked={form.isAnonymous} className={`report-switch ${form.isAnonymous ? 'is-active' : ''}`} onClick={() => update('isAnonymous', !form.isAnonymous)}><span /></button>
        </div>

        {!form.isAnonymous && (
          <div className="report-identity-fields">
            <label className="report-field"><span>Nombre</span><input value={form.reporterName} onChange={(event) => update('reporterName', event.target.value)} readOnly={Boolean(user)} />{errors.reporterName && <small className="report-error">{errors.reporterName}</small>}</label>
            <label className="report-field"><span>Correo electrónico</span><input type="email" value={form.reporterEmail} onChange={(event) => update('reporterEmail', event.target.value)} readOnly={Boolean(user)} />{errors.reporterEmail && <small className="report-error">{errors.reporterEmail}</small>}</label>
          </div>
        )}

        {errors.submit && <div className="report-submit-error" role="alert">{errors.submit}</div>}
        <button type="submit" className="report-primary-btn" disabled={submitting}>{submitting ? 'Enviando reporte...' : 'Enviar reporte'}</button>
      </form>

    </section>
  );
}
