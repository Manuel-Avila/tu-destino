import { axiosInstance } from '../api/axios';

// Todos los datos salen de la BD (tablas eventos, evento_itinerario, etc.) vía /api/eventos.
export async function getEventos() {
  const { data } = await axiosInstance.get('/api/eventos');
  return data.eventos;
}

export async function getEvento(slug) {
  const { data } = await axiosInstance.get(`/api/eventos/${encodeURIComponent(slug)}`);
  return data.evento;
}
