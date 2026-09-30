import { z } from 'zod';

export const destinationSchema = z.object({
  id: z.string().min(3, 'El ID debe tener al menos 3 caracteres').max(50),
  name: z.string().min(5, 'El nombre debe tener al menos 5 caracteres').max(200),
  location: z.string().min(5, 'La ubicación debe tener al menos 5 caracteres').max(200),
  label: z.string().min(3, 'La etiqueta larga debe tener al menos 3 caracteres').max(200),
  tag: z.string().min(3, 'La etiqueta corta debe tener al menos 3 caracteres').max(100),
  category: z.string().min(3, 'La categoría debe tener al menos 3 caracteres').max(100),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  image: z.any().optional(),
  coordinates: z.array(z.number()).length(2).optional()
});

export const eventSchema = z.object({
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').max(120),
  tituloEvento: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  descripcionEvento: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  categoria: z.string().min(1, 'Selecciona una categoría'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  horaFin: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  duracionHoras: z.union([z.string(), z.number()]).refine(val => Number(val) > 0, 'La duración debe ser mayor a 0'),
  lugarEvento: z.string().min(3, 'El lugar debe tener al menos 3 caracteres').max(200),
  localidad: z.string().min(3, 'La localidad debe tener al menos 3 caracteres').max(120),
  latitud: z.union([z.string(), z.number()]).refine(val => !isNaN(Number(val)), 'Debe ser un número válido'),
  longitud: z.union([z.string(), z.number()]).refine(val => !isNaN(Number(val)), 'Debe ser un número válido'),
  responsableNombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(150),
  responsableCorreo: z.string().email('Debe ser un correo electrónico válido'),
  responsableTelefono: z.string().regex(/^\d{10}$/, 'El teléfono debe contener exactamente 10 dígitos'),
  cupoTotal: z.union([z.string(), z.number()]).refine(val => Number(val) > 0, 'El cupo debe ser mayor a 0'),
  imagenes: z.any().optional()
});
