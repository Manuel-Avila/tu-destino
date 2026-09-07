import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuthStore } from '../store/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) {
    errors.email = 'El correo electrnico es obligatorio.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Escribe un correo electrnico vlido.';
  }
  if (!password) {
    errors.password = 'La contrasea es obligatoria.';
  }
  return errors;
}

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err.message || 'No se pudo iniciar sesin.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout headline={<>Bienvenido de vuelta, guardin de las costas.</>}>
      <h2>Inicia sesin</h2>
      <p className="auth-form-panel__subtitle">
        Contina cuidando el paraso donde lo dejaste.
      </p>

      {formError && <div className="auth-form__error-banner">{formError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="email">Correo electrnico</label>
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
          <label htmlFor="password">Contrasea</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
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
          {submitting ? 'Iniciando sesin...' : 'Iniciar sesin'}
        </button>
      </form>

      <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
        No tienes cuenta? <Link to="/register">Regstrate</Link>
      </p>
    </AuthLayout>
  );
}
