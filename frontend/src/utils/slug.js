/**
 * Normaliza un slug mientras se escribe.
 *
 * Reglas:
 * - Solo letras (A-Z, a-z) y guiones.
 * - Sin guiones al inicio.
 * - Sin guiones consecutivos.
 * - Sin guion al final (se puede permitir temporalmente mientras se escribe,
 *   para poder separar palabras, y se recorta al salir del campo o al guardar).
 */
export function sanitizeSlug(value = '', { allowTrailingHyphen = false } = {}) {
  let next = String(value)
    .replace(/[^A-Za-z-]/g, '') // descarta todo lo que no sea letra o guion
    .replace(/-+/g, '-')        // colapsa guiones repetidos
    .replace(/^-+/, '');        // sin guion al inicio

  if (!allowTrailingHyphen) {
    next = next.replace(/-+$/, ''); // sin guion al final
  }

  return next;
}

/** Valida el formato final: palabras separadas por un solo guion. */
export const SLUG_PATTERN = /^[A-Za-z]+(-[A-Za-z]+)*$/;
