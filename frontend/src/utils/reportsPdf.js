import { STATUS_LABELS, reportTypeLabel } from '../services/reportes.service';

const KNOWN_STATUS = ['pendiente', 'en_revision', 'resuelto', 'descartado'];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function formatDate(value) {
  return new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatDay(value) {
  return new Date(value).toLocaleDateString('es-MX', { dateStyle: 'medium' });
}

function safeImageUrl(url) {
  return /^https?:\/\//i.test(String(url || '')) ? url : '';
}

function statusKey(status) {
  return KNOWN_STATUS.includes(status) ? status : 'otro';
}

function statusBadge(status) {
  return `<span class="badge badge--${statusKey(status)}">${escapeHtml(STATUS_LABELS[status] || status)}</span>`;
}

function band(right) {
  return `
    <div class="band">
      <div class="brand">Tu<span>Destino</span><small>Reportes ciudadanos</small></div>
      <div class="band__right">${right}</div>
    </div>`;
}

function summarySheet(reports) {
  const counts = KNOWN_STATUS
    .map((key) => ({ key, total: reports.filter((item) => item.status === key).length }))
    .filter((item) => item.total > 0);

  return `
    <section class="sheet">
      ${band('Resumen')}
      <div class="content">
        <p class="eyebrow">Selección para descarga</p>
        <h1>${reports.length} reportes ciudadanos</h1>
        <div class="stats">
          ${counts.map((item) => `
            <div class="stat stat--${item.key}">
              <strong>${item.total}</strong>
              <span>${escapeHtml(STATUS_LABELS[item.key])}</span>
            </div>`).join('')}
        </div>
        <table class="summary">
          <thead><tr><th>Folio</th><th>Categoría</th><th>Estado</th><th>Fecha</th></tr></thead>
          <tbody>
            ${reports.map((item) => `
              <tr>
                <td class="mono">${escapeHtml(item.folio)}</td>
                <td>${escapeHtml(reportTypeLabel(item.incidentType))}</td>
                <td>${statusBadge(item.status)}</td>
                <td>${escapeHtml(formatDay(item.createdAt))}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>`;
}

function reportSheet(report, index, total) {
  const [lat, lng] = report.coordinates || [];
  const evidences = (report.evidences || []).filter((item) => safeImageUrl(item.url));
  const identityHtml = report.isAnonymous
    ? 'Reporte anónimo'
    : `${escapeHtml(report.reporter?.name || '—')}${report.reporter?.email ? `<br><span class="soft">${escapeHtml(report.reporter.email)}</span>` : ''}`;
  const mapUrl = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
    ? `https://www.google.com/maps?q=${Number(lat)},${Number(lng)}`
    : '';

  return `
    <section class="sheet">
      ${band(`Reporte ${index + 1} de ${total}`)}
      <div class="content">
        <p class="eyebrow">${escapeHtml(reportTypeLabel(report.incidentType))}</p>
        <div class="title">
          <h1 class="mono">${escapeHtml(report.folio)}</h1>
          ${statusBadge(report.status)}
        </div>

        <div class="cards">
          <div class="card"><dt>Fecha</dt><dd>${escapeHtml(formatDate(report.createdAt))}</dd></div>
          <div class="card"><dt>Identidad</dt><dd>${identityHtml}</dd></div>
          <div class="card"><dt>Ubicación</dt><dd>${escapeHtml(lat)}, ${escapeHtml(lng)}${mapUrl ? `<br><a href="${escapeHtml(mapUrl)}">Ver en Google Maps</a>` : ''}</dd></div>
          <div class="card"><dt>Evidencias</dt><dd>${escapeHtml(report.evidenceCount ?? evidences.length)} ${Number(report.evidenceCount ?? evidences.length) === 1 ? 'archivo' : 'archivos'}</dd></div>
        </div>

        <h3>Descripción</h3>
        <p class="description">${escapeHtml(report.description)}</p>

        ${evidences.length ? `
          <h3>Evidencias</h3>
          <div class="evidence">
            ${evidences.map((item, i) => `
              <figure>
                <img src="${escapeHtml(safeImageUrl(item.url))}" alt="${escapeHtml(item.originalName || 'Evidencia')}" />
                <figcaption>Evidencia ${i + 1}</figcaption>
              </figure>`).join('')}
          </div>` : ''}

        ${report.history?.length ? `
          <h3>Historial de seguimiento</h3>
          <ol class="timeline">
            ${report.history.map((item) => `
              <li class="timeline--${statusKey(item.status)}">
                <div>${statusBadge(item.status)}<small>${escapeHtml(formatDate(item.createdAt))}${item.changedBy ? ` · ${escapeHtml(item.changedBy)}` : ''}</small></div>
                ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ''}
              </li>`).join('')}
          </ol>` : ''}
      </div>
    </section>`;
}

const STYLES = `
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; }
  body { color: #173b35; font: 12px/1.5 "Segoe UI", Arial, sans-serif; }
  .mono { font-family: Consolas, "Courier New", monospace; }
  .soft { color: #637974; font-size: 11px; }

  .sheet { min-height: 297mm; break-after: page; }
  .sheet:last-of-type { break-after: auto; }

  .band { display: flex; justify-content: space-between; align-items: center; padding: 11mm 16mm 9mm; background: #0a4d3c; background: linear-gradient(120deg, #0a4d3c 0%, #087c6e 100%); color: #fff; }
  .brand { font-size: 20px; font-weight: 800; letter-spacing: .3px; }
  .brand span { color: #9be7d4; }
  .brand small { display: block; margin-top: 1px; color: #cdeee5; font-size: 9px; font-weight: 600; letter-spacing: 1.6px; text-transform: uppercase; }
  .band__right { padding: 5px 12px; border: 1px solid rgba(255, 255, 255, .45); border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; }

  .content { padding: 9mm 16mm 24mm; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
  .eyebrow { margin: 0 0 4px; color: #087c6e; font-size: 10px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
  h1 { margin: 0; font-size: 26px; line-height: 1.15; color: #0a2f27; }
  .title { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }

  .badge { display: inline-block; padding: 3px 10px; border: 1px solid; border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: .3px; white-space: nowrap; }
  .badge--pendiente { background: #fff3cd; border-color: #ecd58a; color: #7a5b00; }
  .badge--en_revision { background: #dbeafe; border-color: #a9c7f2; color: #1e4e8c; }
  .badge--resuelto { background: #d6f5e3; border-color: #93d8b1; color: #0a6b3d; }
  .badge--descartado, .badge--otro { background: #e8ecea; border-color: #c3ccc9; color: #4b5a56; }

  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 0 0 6px; }
  .card { min-width: 0; min-height: 82px; margin: 0; padding: 10px 12px; border: 1px solid #d3e6df; border-top: 3px solid #087c6e; border-radius: 8px; background: #f7fcfa; break-inside: avoid; }
  .card dt { color: #637974; font-size: 9px; font-weight: 800; letter-spacing: .9px; text-transform: uppercase; }
  .card dd { margin: 3px 0 0; font-size: 12.5px; font-weight: 600; overflow-wrap: anywhere; }
  .card a { color: #087c6e; font-size: 11px; font-weight: 600; }

  h3 { display: flex; align-items: center; gap: 8px; margin: 20px 0 8px; color: #0a4d3c; font-size: 12px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; break-after: avoid; }
  h3::before { content: ""; width: 4px; height: 14px; border-radius: 2px; background: #087c6e; }

  .description { margin: 0; padding: 12px 14px; border-left: 4px solid #087c6e; border-radius: 0 8px 8px 0; background: #f1f8f5; font-size: 12.5px; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; }

  .evidence { font-size: 0; }
  .evidence figure { display: inline-block; width: calc(50% - 6px); margin: 0 12px 12px 0; vertical-align: top; break-inside: avoid; }
  .evidence figure:nth-child(2n) { margin-right: 0; }
  .evidence img { display: block; width: 100%; height: 170px; object-fit: cover; border: 1px solid #cbded8; border-radius: 8px; background: #e8f1ee; }
  .evidence figcaption { margin-top: 4px; color: #71827e; font-size: 9px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; }

  .timeline { margin: 4px 0 0 5px; padding: 0 0 0 16px; list-style: none; border-left: 2px solid #cfe5dd; }
  .timeline li { position: relative; padding: 0 0 12px; break-inside: avoid; }
  .timeline li::before { content: ""; position: absolute; top: 3px; left: -23px; width: 10px; height: 10px; border: 2px solid #fff; border-radius: 50%; background: #087c6e; box-shadow: 0 0 0 1.5px #087c6e; }
  .timeline--pendiente::before { background: #e0b43a !important; box-shadow: 0 0 0 1.5px #e0b43a !important; }
  .timeline--en_revision::before { background: #3b82d6 !important; box-shadow: 0 0 0 1.5px #3b82d6 !important; }
  .timeline--descartado::before { background: #8a9894 !important; box-shadow: 0 0 0 1.5px #8a9894 !important; }
  .timeline small { margin-left: 8px; color: #71827e; font-size: 10px; }
  .timeline p { margin: 4px 0 0; color: #3f5a54; overflow-wrap: anywhere; }

  .stats { display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0 18px; }
  .stat { min-width: 110px; padding: 10px 14px; border: 1px solid #d3e6df; border-radius: 10px; background: #f7fcfa; }
  .stat strong { display: block; font-size: 24px; line-height: 1.1; color: #0a2f27; }
  .stat span { color: #637974; font-size: 10px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; }
  .stat--pendiente { background: #fff8e1; border-color: #ecd58a; }
  .stat--en_revision { background: #eaf2fe; border-color: #a9c7f2; }
  .stat--resuelto { background: #e6f8ee; border-color: #93d8b1; }

  .summary { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  .summary thead { display: table-header-group; }
  .summary th { padding: 8px 10px; background: #0a4d3c; color: #fff; font-size: 9px; letter-spacing: .9px; text-align: left; text-transform: uppercase; }
  .summary td { padding: 8px 10px; border-bottom: 1px solid #dcebe6; }
  .summary tbody tr:nth-child(even) td { background: #f7fcfa; }
  .summary tr { break-inside: avoid; }

  .foot { position: fixed; right: 0; bottom: 0; left: 0; display: flex; justify-content: space-between; padding: 5mm 16mm 7mm; border-top: 1px solid #d3e6df; background: #fff; color: #71827e; font-size: 9px; }
`;

// El navegador sugiere este texto como nombre del archivo al elegir "Guardar como PDF".
function fileTitle(reports) {
  const day = new Date().toLocaleDateString('sv-SE');
  return `Reportes TuDestino ${day} (${reports.length})`;
}

function buildHtml(reports) {
  const title = fileTitle(reports);
  const generated = new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });
  return `<!doctype html>
    <html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
    <style>${STYLES}</style></head><body>
      ${reports.length > 1 ? summarySheet(reports) : ''}
      ${reports.map((item, index) => reportSheet(item, index, reports.length)).join('')}
      <div class="foot"><span>TuDestino · Reportes ciudadanos · Documento de uso administrativo</span><span>Generado el ${escapeHtml(generated)}</span></div>
    </body></html>`;
}

function waitForImages(doc, timeoutMs = 8000) {
  const pending = [...(doc.images ? doc.images : doc.querySelectorAll('img'))]
    .filter((img) => !img.complete)
    .map((img) => new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    }));
  return Promise.race([
    Promise.all(pending),
    new Promise((resolve) => { window.setTimeout(resolve, timeoutMs); }),
  ]);
}

/** Ventana en blanco con un aviso de carga. */
export function openPdfWindow() {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return null;
  printWindow.document.write('<!doctype html><title>Generando PDF…</title><p style="font:14px Arial,sans-serif;padding:24px;color:#173b35">Generando PDF…</p>');
  return printWindow;
}

/** Escribe los reportes en la ventana y abre el diálogo de impresión  */
export async function printReportsPdf(printWindow, reports) {
  printWindow.document.open();
  printWindow.document.write(buildHtml(reports));
  printWindow.document.close();
  
  printWindow.document.title = fileTitle(reports);
  await waitForImages(printWindow.document);
  printWindow.document.title = fileTitle(reports);
  printWindow.focus();
  printWindow.onafterprint = () => printWindow.close();
  printWindow.print();
}
