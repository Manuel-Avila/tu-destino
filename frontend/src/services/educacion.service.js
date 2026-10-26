import { axiosInstance } from '../api/axios';

export async function getPublicaciones() {
  const { data } = await axiosInstance.get('/api/educacion');
  return data.publicaciones;
}

export async function getPublicacion(id) {
  const { data } = await axiosInstance.get(`/api/educacion/${id}`);
  return data.publicacion;
}

export async function crearPublicacion(formData) {
  const { data } = await axiosInstance.post('/api/educacion', formData);
  return data.publicacion;
}

export async function actualizarPublicacion(id, formData) {
  const { data } = await axiosInstance.put(`/api/educacion/${id}`, formData);
  return data.publicacion;
}

export async function eliminarPublicacion(id) {
  await axiosInstance.delete(`/api/educacion/${id}`);
}
