import { axiosInstance } from '../api/axios';

export const REPORT_TYPES = [
  { value: 'contaminacion', label: 'Contaminación y residuos' },
  { value: 'pesca_ilegal', label: 'Pesca ilegal o en zona protegida' },
  { value: 'dano_habitat', label: 'Daño a corales, manglares o dunas' },
  { value: 'fauna_en_riesgo', label: 'Fauna herida, varada o en riesgo' },
  { value: 'actividad_sospechosa', label: 'Actividad sospechosa' },
  { value: 'otro', label: 'Otro incidente ambiental' },
];

export const STATUS_LABELS = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  resuelto: 'Resuelto',
  descartado: 'Descartado',
};

export function reportTypeLabel(value) {
  return REPORT_TYPES.find((item) => item.value === value)?.label || value;
}

export async function createReporte(data) {
  const payload = new FormData();
  payload.append('incidentType', data.incidentType);
  payload.append('description', data.description);
  payload.append('latitude', String(data.latitude));
  payload.append('longitude', String(data.longitude));
  payload.append('isAnonymous', String(data.isAnonymous));
  if (!data.isAnonymous) {
    payload.append('reporterName', data.reporterName);
    payload.append('reporterEmail', data.reporterEmail);
  }
  data.evidences.forEach((file) => payload.append('evidencias', file));
  const { data: response } = await axiosInstance.post('/api/reportes', payload);
  return response.reporte;
}

export async function getReporteByFolio(folio) {
  const { data } = await axiosInstance.get(`/api/reportes/folio/${encodeURIComponent(folio.trim())}`);
  return data.reporte;
}

export async function getReportes(filters = {}) {
  const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
  const { data } = await axiosInstance.get('/api/reportes', { params });
  return data.reportes;
}

export async function getReporte(id) {
  const { data } = await axiosInstance.get(`/api/reportes/${id}`);
  return data.reporte;
}

export async function updateReporteStatus(id, status, note) {
  const { data } = await axiosInstance.patch(`/api/reportes/${id}/estado`, { status, note });
  return data.reporte;
}
