import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import MapPicker from '../admin/MapPicker';
import ImagePicker from '../admin/ImagePicker';
import Icon from '../events/EventIcons';
import {
  createReporte,
  getReporteByFolio,
  REPORT_TYPES,
  STATUS_LABELS,
  reportTypeLabel,
} from '../../services/reportes.service';
import './ReportsTab.css';

function formatDate(value) {
  return new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
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
      setCreated(report);
      setLookupFolio(report.folio);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrors((current) => ({ ...current, ...(err.fieldErrors || {}), submit: err.message || 'No se pudo enviar el reporte.' }));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLookup(event) {
    event.preventDefault();
    if (!lookupFolio.trim()) return;
    setLookup({ status: 'loading', report: null, error: '' });
    try {
      const report = await getReporteByFolio(lookupFolio);
      setLookup({ status: 'ready', report, error: '' });
    } catch (err) {
      setLookup({ status: 'error', report: null, error: err.message || 'No encontramos ese folio.' });
    }
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
            <button type="button" className="report-secondary-btn" onClick={() => { setCreated(null); setLookup({ status: 'idle', report: null, error: '' }); }}>Consultar seguimiento</button>
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
        <button type="submit" className="report-primary-btn" disabled={submitting}><Icon name="arrow" size={18} /> {submitting ? 'Enviando reporte...' : 'Enviar reporte'}</button>
      </form>

      <section className="report-lookup" aria-labelledby="report-lookup-title">
        <div><p className="reports-eyebrow">SEGUIMIENTO</p><h2 id="report-lookup-title">Consulta el estado de tu reporte</h2><p>Ingresa el folio que recibiste al enviarlo.</p></div>
        <form onSubmit={handleLookup}><input value={lookupFolio} onChange={(event) => setLookupFolio(event.target.value.toUpperCase())} placeholder="Ej. TD-2026-A1B2C3D4" aria-label="Folio del reporte" /><button type="submit" className="report-secondary-btn">Consultar</button></form>
        {lookup.status === 'loading' && <p role="status">Consultando...</p>}
        {lookup.status === 'error' && <p className="report-error" role="alert">{lookup.error}</p>}
        {lookup.report && (
          <article className="report-lookup-result">
            <div><span className={`report-status report-status--${lookup.report.status}`}>{STATUS_LABELS[lookup.report.status]}</span><strong>{lookup.report.folio}</strong></div>
            <p>{reportTypeLabel(lookup.report.incidentType)} · enviado el {formatDate(lookup.report.createdAt)}</p>
            <ol>{lookup.report.history.map((item, index) => <li key={`${item.status}-${index}`}><strong>{STATUS_LABELS[item.status]}</strong><span>{formatDate(item.createdAt)}</span></li>)}</ol>
          </article>
        )}
      </section>
    </section>
  );
}
