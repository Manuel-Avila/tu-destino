import { z } from 'zod';
import { EDUCATION_CATEGORIES } from '../constants/educacion.js';

export const publicacionSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(5, 'El título debe tener al menos 5 caracteres.')
    .max(200, 'El título es demasiado largo (máx. 200).'),
  texto: z
    .string()
    .trim()
    .min(20, 'El texto debe tener al menos 20 caracteres.')
    .max(5000, 'El texto es demasiado largo (máx. 5000).'),
  categoria: z.enum(EDUCATION_CATEGORIES, {
    error: 'Selecciona una categoría válida.',
  }),
});
