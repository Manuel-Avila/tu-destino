import { axiosInstance } from '../api/axios';

export async function getResenasDestino(destinoId) {
  const { data } = await axiosInstance.get(`/api/resenas/destino/${encodeURIComponent(destinoId)}`);
  return data; // { resenas, stats: { total, suma } }
}

export async function crearResena(destinoId, { rating, activity, visitDate, comment }) {
  const { data } = await axiosInstance.post(`/api/resenas/destino/${encodeURIComponent(destinoId)}`, {
    rating,
    activity,
    visitDate,
    comment,
  });
  return data.resena;
}

export async function eliminarResena(id) {
  await axiosInstance.delete(`/api/resenas/${id}`);
}

export async function getMisResenas() {
  const { data } = await axiosInstance.get('/api/resenas/mias');
  return data.resenas;
}
