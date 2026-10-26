import { axiosInstance } from '../api/axios';

export const me = async () => {
  const response = await axiosInstance.get('/api/auth/me');
  return response.data;
};

export const register = async ({ fullName, email, password }) => {
  const response = await axiosInstance.post('/api/auth/register', { fullName, email, password });
  return response.data;
};

export const login = async ({ email, password }) => {
  const response = await axiosInstance.post('/api/auth/login', { email, password });
  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await axiosInstance.put('/api/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await axiosInstance.put('/api/auth/password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};
