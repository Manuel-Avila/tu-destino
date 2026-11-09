const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// 'YYYY-MM-DD' → Date local (sin desfase de zona horaria)
export function parseFecha(fecha) {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatHora12(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

// Baja California Sur usa la hora de la montaña (UTC−7, sin horario de verano).
const ZONA_BCS = 'America/Mazatlan';

/** Fecha ('YYYY-MM-DD') y hora ('HH:MM') actuales en BCS, sin importar la zona horaria del dispositivo. */
export function ahoraBCS() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_BCS,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const dato = (tipo) => partes.find((p) => p.type === tipo).value;
  return { fecha: `${dato('year')}-${dato('month')}-${dato('day')}`, hora: `${dato('hour')}:${dato('minute')}` };
}

/** true si el evento ya terminó (fecha y hora de fin del evento contra la fecha y hora actuales de BCS). */
export function eventoYaPaso({ fecha, horaFin }) {
  const hoy = ahoraBCS();
  if (fecha !== hoy.fecha) return fecha < hoy.fecha;
  return hoy.hora >= horaFin;
}

export const formatDuracion = (h) => `${Number.isInteger(h) ? h : h.toFixed(1)}h`;

/** Duración en horas calculada a partir de las horas de inicio y fin ('HH:MM'). */
export function duracionEntreHoras(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return 0;
  const [hInicio, mInicio] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);
  let minutos = (hFin * 60 + mFin) - (hInicio * 60 + mInicio);
  if (minutos < 0) minutos += 24 * 60;
  return Math.round((minutos / 60) * 10) / 10;
}

/** "Sáb 24 Oct" */
export function formatFechaCorta(fecha) {
  const d = parseFecha(fecha);
  return `${DIAS_CORTOS[d.getDay()]} ${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
}

/** "Sábado 24 de Octubre, 2026" */
export function formatFechaLarga(fecha) {
  const d = parseFecha(fecha);
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}, ${d.getFullYear()}`;
}

export const nombreMes = (fecha) => MESES[parseFecha(fecha).getMonth()];
export const claveMes = (fecha) => fecha.slice(0, 7);

export function normalizar(texto = '') {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Categorías del filtro (id = valor de eventos.categoria en la BD)
export const CATEGORIAS = [
  { id: 'todos', label: 'Todo', icon: 'grid' },
  { id: 'limpieza', label: 'Limpieza', icon: 'waves', tarjeta: 'Limpieza de Costas' },
  { id: 'reforestacion', label: 'Reforestación', icon: 'sprout', tarjeta: 'Reforestación' },
  { id: 'fauna', label: 'Monitoreo', icon: 'paw', tarjeta: 'Monitoreo de Fauna' },
  { id: 'educacion', label: 'Educación', icon: 'book', tarjeta: 'Educación' },
  { id: 'preservacion', label: 'Preservación', icon: 'mountain', tarjeta: 'Preservación Marina' },
];

export const etiquetaCategoria = (id) => CATEGORIAS.find((c) => c.id === id)?.tarjeta || 'Evento';

export function whatsappUrl(telefono) {
  return `https://wa.me/${telefono.replace(/\D/g, '')}`;
}

export function googleMapsUrl([lat, lng]) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/** Convierte "texto **resaltado** texto" en nodos React con <strong>. */
export function renderNegritas(texto) {
  return texto.split(/\*\*(.+?)\*\*/g).map((parte, i) => (i % 2 === 1 ? <strong key={i}>{parte}</strong> : parte));
}
