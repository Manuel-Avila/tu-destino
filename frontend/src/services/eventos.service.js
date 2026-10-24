import { axiosInstance } from '../api/axios';

// Todos los datos salen de la BD (tablas eventos, evento_itinerario, etc.) vía /api/eventos.
export async function getEventos() {
  const { data } = await axiosInstance.get('/api/eventos');
  return data.eventos;
}

/** Inscribe al usuario con sesión. Devuelve { inscrito, convocatoria } con los cupos ya actualizados. */
export async function inscribirseEvento(slug, datos) {
  const { data } = await axiosInstance.post(`/api/eventos/${encodeURIComponent(slug)}/inscripcion`, datos);
  return data;
}

/** Slugs de los eventos a los que el usuario ya se inscribió. */
export async function getMisInscripciones() {
  const { data } = await axiosInstance.get('/api/eventos/mis-inscripciones');
  return data.slugs;
}

export async function getEvento(slug) {
  const { data } = await axiosInstance.get(`/api/eventos/${encodeURIComponent(slug)}`);
  return data.evento;
}
