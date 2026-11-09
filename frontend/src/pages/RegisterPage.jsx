import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { parse } from 'tldts';
import { z } from 'zod';
import Icon from '../components/events/EventIcons';
import AuthLayout from './AuthLayout';
import { useAuthStore } from '../store/authStore';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const EMAIL_SCHEMA = z.string().trim().email('Escribe un correo electrónico válido.').refine(
  (email) => parse(email.slice(email.lastIndexOf('@') + 1)).isIcann,
  'El dominio del correo no es válido.'
);

function validate({ fullName, email, password, confirmPassword }) {
  const errors = {};

  if (!fullName.trim()) {
    errors.fullName = 'El nombre completo es obligatorio.';
  } else if (fullName.trim().length < 3) {
    errors.fullName = 'Escribe al menos 3 caracteres.';
  }

  if (!email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else {
    const emailResult = EMAIL_SCHEMA.safeParse(email);
    if (!emailResult.success) errors.email = emailResult.error.issues[0].message;
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria.';
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.password = 'Mínimo 8 caracteres, con al menos una letra y un número.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña.';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  return errors;
}

export default function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [field]: undefined, ...(field === 'password' ? { confirmPassword: undefined } : {}) }));
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
      await register({ fullName: form.fullName.trim(), email: form.email.trim(), password: form.password });
      navigate('/app/destinos', { replace: true });
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
          <div className="auth-password-input">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={handleChange('password')} aria-invalid={Boolean(fieldErrors.password)} />
            <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword}>
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
            </button>
          </div>
          {fieldErrors.password && <p className="auth-field__error">{fieldErrors.password}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <div className="auth-password-input">
            <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} aria-invalid={Boolean(fieldErrors.confirmPassword)} />
            <button type="button" className="auth-password-toggle" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'} aria-pressed={showConfirmPassword}>
              <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={18} />
            </button>
          </div>
          {fieldErrors.confirmPassword && <p className="auth-field__error">{fieldErrors.confirmPassword}</p>}
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
