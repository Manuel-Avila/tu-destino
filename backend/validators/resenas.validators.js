import { z } from 'zod';

export const resenaSchema = z.object({
  rating: z.coerce.number().int('La calificación debe ser un número entero.').min(1, 'Elige de 1 a 5 estrellas.').max(5, 'Elige de 1 a 5 estrellas.'),
  activity: z.string().trim().max(120, 'La actividad es demasiado larga (máx. 120).').optional().default(''),
  visitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida.')
    .optional()
    .or(z.literal('')),
  comment: z.string().trim().min(10, 'Cuéntanos un poco más (mínimo 10 caracteres).').max(1500, 'La reseña es demasiado larga (máx. 1500).'),
}).superRefine((data, ctx) => {
  // No se puede reseñar una visita que aún no ocurre (la fecha de hoy se toma en horario de B.C.S.).
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mazatlan' });
  if (data.visitDate && data.visitDate > hoy) {
    ctx.addIssue({
      code: 'custom',
      path: ['visitDate'],
      message: 'La fecha de la visita no puede ser futura. Reseña el lugar cuando ya lo hayas visitado.',
    });
  }
});

export const destinoIdSchema = z.string().regex(/^[a-z0-9-]{1,60}$/, 'Destino inválido.');
