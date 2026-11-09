import { z } from 'zod';
import { parse } from 'tldts';

const registrationEmail = z.string().trim().email('Correo electrónico inválido').refine(
  (email) => parse(email.slice(email.lastIndexOf('@') + 1)).isIcann,
  'El dominio del correo no es válido.'
);

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'El nombre debe tener al menos 4 caracteres'),
  email: registrationEmail,
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede superar los 150 caracteres'),
  email: z
    .string()
    .trim()
    .email('Correo electrónico inválido')
    .max(255, 'El correo no puede superar los 255 caracteres'),
  location: z
    .string()
    .trim()
    .max(120, 'La ubicación no puede superar los 120 caracteres')
    .optional()
    .default(''),
  bio: z
    .string()
    .trim()
    .max(500, 'La descripción no puede superar los 500 caracteres')
    .optional()
    .default(''),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Za-z]/, 'La nueva contraseña debe incluir al menos una letra')
    .regex(/\d/, 'La nueva contraseña debe incluir al menos un número'),
});
