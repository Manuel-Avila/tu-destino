const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Al menos 8 caracteres, una letra y un número.
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida el body de POST /api/auth/register.
 * Devuelve { valid: boolean, errors: { campo: mensaje } }
 */
export function validateRegisterInput(body = {}) {
  const errors = {};
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!isNonEmptyString(fullName)) {
    errors.fullName = 'El nombre completo es obligatorio.';
  } else if (fullName.length < 3) {
    errors.fullName = 'El nombre completo debe tener al menos 3 caracteres.';
  } else if (fullName.length > 150) {
    errors.fullName = 'El nombre completo es demasiado largo.';
  }

  if (!isNonEmptyString(email)) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'El correo electrónico no es válido.';
  } else if (email.length > 255) {
    errors.email = 'El correo electrónico es demasiado largo.';
  }

  if (!isNonEmptyString(password)) {
    errors.password = 'La contraseña es obligatoria.';
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.password =
      'La contraseña debe tener al menos 8 caracteres, incluyendo una letra y un número.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { fullName, email, password },
  };
}

/**
 * Valida el body de POST /api/auth/login.
 */
export function validateLoginInput(body = {}) {
  const errors = {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!isNonEmptyString(email)) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'El correo electrónico no es válido.';
  }

  if (!isNonEmptyString(password)) {
    errors.password = 'La contraseña es obligatoria.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { email, password },
  };
}
