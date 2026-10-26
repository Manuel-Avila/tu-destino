import { useEffect, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import Icon from '../events/EventIcons';
import { profileModalStyles } from './profileModalStyles';

ReactModal.setAppElement('#root');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function validate(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = 'El nombre completo es obligatorio.';
  } else if (form.fullName.trim().length < 2) {
    errors.fullName = 'Escribe al menos 2 caracteres.';
  }

  if (!form.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Escribe un correo electrónico válido.';
  }

  if (form.location.trim().length > 120) {
    errors.location = 'La ubicación no puede superar los 120 caracteres.';
  }

  if (form.bio.trim().length > 500) {
    errors.bio = 'La descripción no puede superar los 500 caracteres.';
  }

  return errors;
}

/**
 * El ReactModal vive en el componente exterior para que se mantenga montado
 * entre aperturas y pueda limpiar overlay, foco, aria-hidden y scroll.
 * El formulario interior se desmonta al cerrar, así que cada apertura empieza limpia.
 */
export default function ProfileEditModal({ isOpen, user, onClose, onSave }) {
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
      contentLabel="Editar datos personales"
    >
      <ProfileEditForm
        user={user}
        onClose={onClose}
        onSave={onSave}
        savingRef={savingRef}
      />
    </ReactModal>
  );
}

function ProfileEditForm({ user, onClose, onSave, savingRef }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormError('');
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, avatar: 'Selecciona una imagen válida.' }));
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setErrors((prev) => ({ ...prev, avatar: 'La imagen no puede superar los 5 MB.' }));
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, avatar: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = new FormData();
    payload.append('fullName', form.fullName.trim());
    payload.append('email', form.email.trim());
    payload.append('location', form.location.trim());
    payload.append('bio', form.bio.trim());
    if (avatarFile) payload.append('avatar', avatarFile);

    setSaving(true);
    savingRef.current = true;
    setFormError('');
    try {
      await onSave(payload);
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        setErrors((prev) => ({ ...prev, ...apiErrors }));
        setFormError('');
        return;
      }
      setFormError(
        err?.response?.data?.error ||
          'No se pudo actualizar el perfil. Intenta de nuevo.'
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const initial = (form.fullName || '?').trim().slice(0, 1).toUpperCase();

  return (
    <>
      <div className="profile-modal__header">
        <div className="profile-modal__heading">
          <span className="profile-modal__icon">
            <Icon name="user" size={20} />
          </span>
          <div>
            <p className="profile-modal__eyebrow">Tu cuenta</p>
            <h2>Editar datos personales</h2>
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
        <div className="profile-modal__avatar-row">
          <div className="profile-modal__avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Foto de perfil" />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="profile-modal__avatar-copy">
            <label className="profile-modal__avatar-button">
              <Icon name="camera" size={16} />
              Cambiar foto
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </label>
            <small>JPG, PNG o WebP. Máximo 5 MB.</small>
            {errors.avatar && <span className="profile-modal__error">{errors.avatar}</span>}
          </div>
        </div>

        <label className="profile-modal__field">
          <span>Nombre completo</span>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            maxLength={150}
            autoComplete="name"
          />
          {errors.fullName && <small className="profile-modal__error">{errors.fullName}</small>}
        </label>

        <label className="profile-modal__field">
          <span>Correo electrónico</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            maxLength={255}
            autoComplete="email"
          />
          {errors.email && <small className="profile-modal__error">{errors.email}</small>}
        </label>

        <label className="profile-modal__field">
          <span>Ubicación</span>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            maxLength={120}
            placeholder="Ej. La Paz, Baja California Sur"
            autoComplete="address-level2"
          />
          {errors.location && <small className="profile-modal__error">{errors.location}</small>}
        </label>

        <label className="profile-modal__field">
          <span>Sobre ti</span>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            maxLength={500}
            rows={3}
            placeholder="Cuéntanos qué te motiva a viajar de forma responsable."
          />
          <small className="profile-modal__hint">{form.bio.length}/500 caracteres</small>
          {errors.bio && <small className="profile-modal__error">{errors.bio}</small>}
        </label>

        <div className="profile-modal__actions">
          <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </>
  );
}
