import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    let err = new Error('Ocurri un error inesperado.');
    if (error.response) {
      err.status = error.response.status;
      err.fieldErrors = error.response.data.errors || null;
      err.message = error.response.data.error || 'Error en el servidor.';
      
      if (error.response.status === 401) {
        useAuthStore.getState().logout();
      }
    } else if (error.request) {
      err.message = 'No se pudo conectar con el servidor.';
    }
    return Promise.reject(err);
  }
);
