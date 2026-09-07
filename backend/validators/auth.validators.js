import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrnico invlido'),
  password: z.string().min(6, 'La contrasea debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Correo electrnico invlido'),
  password: z.string().min(1, 'La contrasea es obligatoria'),
});
