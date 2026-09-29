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

export const formatDuracion = (h) => `${Number.isInteger(h) ? h : h.toFixed(1)}h`;

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
  { id: 'todos', label: 'Todos los eventos', icon: 'grid' },
  { id: 'limpieza', label: 'Limpieza de Costas y Arrecifes', icon: 'waves', tarjeta: 'Limpieza de Costas' },
  { id: 'reforestacion', label: 'Reforestación de Manglares', icon: 'sprout', tarjeta: 'Reforestación' },
  { id: 'fauna', label: 'Monitoreo de Fauna Marina', icon: 'paw', tarjeta: 'Monitoreo de Fauna' },
  { id: 'educacion', label: 'Educación & Talleres Biológicos', icon: 'book', tarjeta: 'Educación' },
  { id: 'preservacion', label: 'Preservación de Ecosistemas', icon: 'mountain', tarjeta: 'Preservación Marina' },
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
