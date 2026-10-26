import { useEffect, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import Icon from '../events/EventIcons';
import { profileModalStyles } from './profileModalStyles';

ReactModal.setAppElement('#root');

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function validate(form) {
  const errors = {};

  if (!form.currentPassword) {
    errors.currentPassword = 'La contraseña actual es obligatoria.';
  }

  if (!form.newPassword) {
    errors.newPassword = 'La nueva contraseña es obligatoria.';
  } else if (!PASSWORD_REGEX.test(form.newPassword)) {
    errors.newPassword = 'Mínimo 8 caracteres, con al menos una letra y un número.';
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword = 'La nueva contraseña debe ser diferente a la actual.';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirma la nueva contraseña.';
  } else if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  return errors;
}

/**
 * Igual que en el modal de perfil: ReactModal se mantiene montado para limpiar
 * correctamente overlay, foco, aria-hidden y scroll; el formulario interior se
 * desmonta al cerrar y no conserva contraseñas entre aperturas.
 */
export default function ChangePasswordModal({ isOpen, onClose, onSave }) {
  const savingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('profile-modal-open');
    return () => document.body.classList.remove('profile-modal-open');
  }, [isOpen]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={() => !savingRef.current && onClose()}
      style={profileModalStyles}
      className="profile-modal"
      overlayClassName="profile-modal-overlay"
      contentLabel="Cambiar contraseña"
    >
      <ChangePasswordForm onClose={onClose} onSave={onSave} savingRef={savingRef} />
    </ReactModal>
  );
}

function ChangePasswordForm({ onClose, onSave, savingRef }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    savingRef.current = true;
    setFormError('');
    try {
      await onSave({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        setErrors((prev) => ({ ...prev, ...apiErrors }));
        setFormError('');
        return;
      }
      setFormError(
        err?.response?.data?.error ||
          'No se pudo cambiar la contraseña. Intenta de nuevo.'
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const inputType = showPassword ? 'text' : 'password';

  return (
    <>
      <div className="profile-modal__header">
        <div className="profile-modal__heading">
          <span className="profile-modal__icon">
            <Icon name="lock" size={20} />
          </span>
          <div>
            <p className="profile-modal__eyebrow">Seguridad</p>
            <h2>Cambiar contraseña</h2>
          </div>
        </div>
        <button
          type="button"
          className="profile-modal__close"
          onClick={onClose}
          aria-label="Cerrar"
          disabled={saving}
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      {formError && <div className="profile-modal__alert">{formError}</div>}

      <form className="profile-modal__form" onSubmit={handleSubmit} noValidate>
        <p className="profile-modal__intro">
          Usa una contraseña que no reutilices en otros sitios. Debe tener al menos 8 caracteres,
          una letra y un número.
        </p>

        <label className="profile-modal__field">
          <span>Contraseña actual</span>
          <div className="profile-modal__password-field">
            <input
              type={inputType}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="profile-modal__eye"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
            >
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
            </button>
          </div>
          {errors.currentPassword && (
            <small className="profile-modal__error">{errors.currentPassword}</small>
          )}
        </label>

        <label className="profile-modal__field">
          <span>Nueva contraseña</span>
          <input
            type={inputType}
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.newPassword && (
            <small className="profile-modal__error">{errors.newPassword}</small>
          )}
        </label>

        <label className="profile-modal__field">
          <span>Confirmar nueva contraseña</span>
          <input
            type={inputType}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <small className="profile-modal__error">{errors.confirmPassword}</small>
          )}
        </label>

        <div className="profile-modal__actions">
          <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
    </>
  );
}
