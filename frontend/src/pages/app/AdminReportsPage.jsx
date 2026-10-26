import { useEffect, useState } from 'react';
import Icon from '../../components/events/EventIcons';
import {
  getReporte,
  getReportes,
  REPORT_TYPES,
  STATUS_LABELS,
  reportTypeLabel,
  updateReporteStatus,
} from '../../services/reportes.service';
import '../../components/home/ReportsTab.css';

function formatDate(value) {
  return new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminReportsPage() {
  const [filters, setFilters] = useState({ status: '', incidentType: '', search: '' });
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('loading');
  const [selected, setSelected] = useState(null);
  const [stateForm, setStateForm] = useState({ status: 'en_revision', note: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadReports(nextFilters = filters) {
    setStatus('loading');
    try {
      setReports(await getReportes(nextFilters));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    let active = true;
    getReportes()
      .then((data) => {
        if (!active) return;
        setReports(data);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => { active = false; };
  }, []);

  async function openReport(id) {
    setError('');
    try {
      const detail = await getReporte(id);
      setSelected(detail);
      setStateForm({ status: detail.status, note: '' });
    } catch (err) {
      setError(err.message || 'No se pudo abrir el reporte.');
    }
  }

  async function submitStatus(event) {
    event.preventDefault();
    if (stateForm.note.trim().length < 5) {
      setError('Agrega una nota de al menos 5 caracteres.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const detail = await updateReporteStatus(selected.id, stateForm.status, stateForm.note);
      setSelected(detail);
      setStateForm((current) => ({ ...current, note: '' }));
      await loadReports();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el estado.');
    } finally {
      setSaving(false);
    }
  }

  function applyFilters(event) {
    event.preventDefault();
    loadReports(filters);
  }

  return (
    <section className="admin-reports" aria-labelledby="admin-reports-title">
      <header className="admin-reports__header">
        <div>
          <p className="reports-eyebrow">PANEL ADMINISTRATIVO</p>
          <h1 id="admin-reports-title">Reportes ciudadanos</h1>
          <p>Revisa evidencias, ubicación y seguimiento de incidencias ambientales.</p>
        </div>
        <span className="admin-reports__count">{reports.length} reportes</span>
      </header>

      <form className="admin-report-filters" onSubmit={applyFilters}>
        <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Buscar por folio o descripción" />
        <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={filters.incidentType} onChange={(event) => setFilters((current) => ({ ...current, incidentType: event.target.value }))}>
          <option value="">Todas las categorías</option>
          {REPORT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <button className="report-secondary-btn" type="submit"><Icon name="search" size={16} /> Filtrar</button>
      </form>

      {status === 'loading' && <p className="admin-report-state">Cargando reportes...</p>}
      {status === 'error' && <p className="admin-report-state report-error">No se pudieron cargar los reportes.</p>}
      {status === 'ready' && reports.length === 0 && <p className="admin-report-state">Aún no hay reportes con estos filtros.</p>}
      {status === 'ready' && reports.length > 0 && !selected && (
        <p className="admin-report-hint"><Icon name="list" size={16} /> Selecciona un reporte para revisar sus detalles.</p>
      )}

      <div className={`admin-reports__layout ${selected ? '' : 'admin-reports__layout--list-only'}`}>
        <div className="admin-report-list">
          {reports.map((report) => (
            <button type="button" key={report.id} className={`admin-report-row ${selected?.id === report.id ? 'is-selected' : ''}`} onClick={() => openReport(report.id)}>
              <div><strong>{report.folio}</strong><span>{reportTypeLabel(report.incidentType)}</span></div>
              <p>{report.description}</p>
              <div><span className={`report-status report-status--${report.status}`}>{STATUS_LABELS[report.status]}</span><small>{formatDate(report.createdAt)}</small></div>
            </button>
          ))}
        </div>

        {selected && (
          <aside className="admin-report-detail">
            <>
              <div className="admin-report-detail__title"><div><small>{selected.folio}</small><h2>{reportTypeLabel(selected.incidentType)}</h2></div><span className={`report-status report-status--${selected.status}`}>{STATUS_LABELS[selected.status]}</span></div>
              <dl className="admin-report-meta">
                <div><dt>Fecha</dt><dd>{formatDate(selected.createdAt)}</dd></div>
                <div><dt>Identidad</dt><dd>{selected.isAnonymous ? 'Reporte anónimo' : `${selected.reporter?.name} · ${selected.reporter?.email}`}</dd></div>
                <div><dt>Ubicación</dt><dd><a href={`https://www.google.com/maps?q=${selected.coordinates[0]},${selected.coordinates[1]}`} target="_blank" rel="noreferrer">{selected.coordinates.join(', ')} ↗</a></dd></div>
              </dl>
              <section><h3>Descripción</h3><p className="admin-report-description">{selected.description}</p></section>
              <section><h3>Evidencias ({selected.evidences.length})</h3>{selected.evidences.length ? <div className="admin-report-evidence">{selected.evidences.map((item) => <a key={item.id} href={item.url} target="_blank" rel="noreferrer"><img src={item.url} alt={item.originalName || 'Evidencia del reporte'} /></a>)}</div> : <p className="admin-report-muted">No se adjuntaron evidencias.</p>}</section>
              <section><h3>Historial</h3><ol className="admin-report-history">{selected.history.map((item) => <li key={item.id}><span className={`report-status report-status--${item.status}`}>{STATUS_LABELS[item.status]}</span><p>{item.note}</p><small>{formatDate(item.createdAt)}{item.changedBy ? ` · ${item.changedBy}` : ''}</small></li>)}</ol></section>
              <form className="admin-report-status-form" onSubmit={submitStatus}>
                <h3>Actualizar seguimiento</h3>
                <select value={stateForm.status} onChange={(event) => setStateForm((current) => ({ ...current, status: event.target.value }))}>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                <textarea rows="3" value={stateForm.note} onChange={(event) => setStateForm((current) => ({ ...current, note: event.target.value }))} placeholder="Nota interna obligatoria..." />
                {error && <p className="report-error">{error}</p>}
                <button type="submit" className="report-primary-btn" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambio'}</button>
              </form>
            </>
          </aside>
        )}
      </div>
    </section>
  );
}
