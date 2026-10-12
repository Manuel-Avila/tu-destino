import { z } from 'zod';

export const INCIDENT_TYPES = [
  'contaminacion',
  'pesca_ilegal',
  'dano_habitat',
  'fauna_en_riesgo',
  'actividad_sospechosa',
  'otro',
];

const booleanFromForm = z.preprocess(
  (value) => value === true || value === 'true' || value === '1',
  z.boolean()
);

export const createReporteSchema = z.object({
  incidentType: z.enum(INCIDENT_TYPES, { message: 'Selecciona un tipo de reporte válido.' }),
  description: z.string().trim().min(20, 'Describe el incidente con al menos 20 caracteres.').max(3000, 'La descripción no puede exceder 3000 caracteres.'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  isAnonymous: booleanFromForm,
  reporterName: z.string().trim().max(150).optional().or(z.literal('')),
  reporterEmail: z.string().trim().email('Escribe un correo válido.').max(255).optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (!data.isAnonymous && !data.reporterName) {
    ctx.addIssue({ code: 'custom', path: ['reporterName'], message: 'El nombre es obligatorio para un reporte identificado.' });
  }
  if (!data.isAnonymous && !data.reporterEmail) {
    ctx.addIssue({ code: 'custom', path: ['reporterEmail'], message: 'El correo es obligatorio para un reporte identificado.' });
  }
});

export const updateReporteStatusSchema = z.object({
  status: z.enum(['pendiente', 'en_revision', 'resuelto', 'descartado'], { message: 'Selecciona un estado válido.' }),
  note: z.string().trim().min(5, 'Escribe una nota de al menos 5 caracteres.').max(1000),
});
