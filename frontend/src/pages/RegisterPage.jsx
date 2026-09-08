import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuthStore } from '../store/authStore';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ fullName, email, password }) {
  const errors = {};

  if (!fullName.trim()) {
    errors.fullName = 'El nombre completo es obligatorio.';
  } else if (fullName.trim().length < 3) {
    errors.fullName = 'Escribe al menos 3 caracteres.';
  }

  if (!email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Escribe un correo electrónico válido.';
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria.';
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.password = 'Mínimo 8 caracteres, con al menos una letra y un número.';
  }

  return errors;
}

export default function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setFormError(err.message || 'No se pudo crear la cuenta.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout headline={<>Conviértete en un guardián de las costas de BCS.</>}>
      <h2>Crear una cuenta</h2>
      <p className="auth-form-panel__subtitle">
        Únete a nuestra comunidad y ayuda a proteger el paraíso.
      </p>

      {formError && <div className="auth-form__error-banner">{formError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="fullName">Nombre completo</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Ej. Armando Castro"
            value={form.fullName}
            onChange={handleChange('fullName')}
            aria-invalid={Boolean(fieldErrors.fullName)}
          />
          {fieldErrors.fullName && (
            <p className="auth-field__error">{fieldErrors.fullName}</p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={handleChange('email')}
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email && <p className="auth-field__error">{fieldErrors.email}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder=""
            value={form.password}
            onChange={handleChange('password')}
            aria-invalid={Boolean(fieldErrors.password)}
          />
          {fieldErrors.password && (
            <p className="auth-field__error">{fieldErrors.password}</p>
          )}
        </div>

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? 'Creando cuenta...' : 'Registrarse'}
        </button>
      </form>

      <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>

      <p className="auth-terms">
        Al registrarte, aceptas nuestros{' '}
        <a href="/terminos">Términos de Servicio</a> y{' '}
        <a href="/privacidad">Política de Privacidad</a>.
      </p>
    </AuthLayout>
  );
}
