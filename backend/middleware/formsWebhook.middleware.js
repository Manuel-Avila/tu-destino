import crypto from 'node:crypto';
import { config } from '../config/env.js';

/**
 * Protege el webhook del Google Form con un secreto compartido en el header "x-forms-secret".
 * Si FORMS_WEBHOOK_SECRET no está configurado, el webhook queda deshabilitado (503).
 */
export function requireFormsSecret(req, res, next) {
  const expected = config.formsWebhookSecret;
  if (!expected) {
    return res.status(503).json({ error: 'Webhook de formularios no configurado.' });
  }

  const received = String(req.headers['x-forms-secret'] || '');
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Secreto inválido.' });
  }
  next();
}
