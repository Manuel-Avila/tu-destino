import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import Icon from './EventIcons';
import { inscribirseEvento } from '../../services/eventos.service';
import './EnrollModal.css';

const PHONE_INPUT_REGEX = /^\d*$/;
const PHONE_VALID_REGEX = /^\d{10}$/;
const MAX_PHONE_DIGITS = 10;

const EMPTY = {
  telefono: '',
  edad: '',
  contactoEmergenciaNombre: '',
  contactoEmergenciaTelefono: '',
  notas: '',
};

function telefonoValido(value) {
  return PHONE_VALID_REGEX.test(value.trim());
}

function validar(form) {
  const errors = {};
  if (!telefonoValido(form.telefono)) errors.telefono = 'Escribe un teléfono de exactamente 10 dígitos.';
  const edad = Number(form.edad);
  if (!form.edad || !Number.isInteger(edad) || edad < 5 || edad > 99) errors.edad = 'Escribe una edad entre 5 y 99 años.';
  if (form.contactoEmergenciaNombre.trim().length < 2) errors.contactoEmergenciaNombre = 'Escribe el nombre del contacto de emergencia.';
  if (!telefonoValido(form.contactoEmergenciaTelefono)) errors.contactoEmergenciaTelefono = 'Escribe un teléfono de emergencia de exactamente 10 dígitos.';
  if (form.notas.length > 500) errors.notas = 'Máximo 500 caracteres.';
  return errors;
}

/**
 * Ventana con el formulario de inscripción.
 * Nombre y correo salen de la cuenta; el usuario solo completa teléfono y datos de contacto.
 * Al enviar se pide confirmación y, si todo sale bien, se avisa al padre con los cupos actualizados.
 */
export default function EnrollModal({ evento, user, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Esc cierra la ventana y el fondo no se desplaza mientras está abierta.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, submitting]);

  const update = (field) => (e) => {
    const value = e.target.value;
    const isPhone = field === 'telefono' || field === 'contactoEmergenciaTelefono';
    if (isPhone && (value.length > MAX_PHONE_DIGITS || !PHONE_INPUT_REGEX.test(value))) return;
    if (field === 'edad' && (!/^\d*$/.test(value) || value.length > 2)) return;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, submit: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validar(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const confirmacion = await Swal.fire({
      title: '¿Estás seguro de continuar?',
      html: `Se enviará tu inscripción a <strong>${evento.tituloEvento.replace(/</g, '&lt;')}</strong> con los datos que ingresaste.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, inscribirme',
      cancelButtonText: 'Revisar datos',
      reverseButtons: true,
      confirmButtonColor: '#0a4d3c',
    });
    if (!confirmacion.isConfirmed) return;

    setSubmitting(true);
    try {
      const result = await inscribirseEvento(evento.slug, {
        telefono: form.telefono.trim(),
        edad: Number(form.edad),
        contactoEmergenciaNombre: form.contactoEmergenciaNombre.trim(),
        contactoEmergenciaTelefono: form.contactoEmergenciaTelefono.trim(),
        notas: form.notas.trim(),
      });
      await Swal.fire({
        title: '¡Inscripción confirmada!',
        text: 'Te esperamos en el evento. Lo encontrarás en tu perfil, en "Voy a asistir".',
        icon: 'success',
        confirmButtonText: 'Listo',
        confirmButtonColor: '#0a4d3c',
      });
      onSuccess(result.convocatoria);
    } catch (err) {
      // 409: ya inscrito o cupo lleno → se actualizan los cupos que muestra la página.
      if (err.status === 409) onSuccess(null, err.message);
      setErrors({ ...(err.fieldErrors || {}), submit: err.message || 'No se pudo completar la inscripción.' });
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="enroll-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}>
      <div className="enroll-modal" role="dialog" aria-modal="true" aria-labelledby="enroll-title">
        <header className="enroll-modal__header">
          <div>
            <p className="enroll-modal__eyebrow">INSCRIPCIÓN AL EVENTO</p>
            <h2 id="enroll-title">{evento.tituloEvento}</h2>
          </div>
          <button type="button" className="enroll-modal__close" onClick={onClose} disabled={submitting} aria-label="Cerrar">
            <Icon name="x" size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate className="enroll-form">
          <div className="enroll-grid">
            <label className="enroll-field">
              <span>Nombre</span>
              <input value={user?.fullName || ''} readOnly />
            </label>
            <label className="enroll-field">
              <span>Correo electrónico</span>
              <input value={user?.email || ''} readOnly />
            </label>

            <label className="enroll-field">
              <span>Teléfono / WhatsApp</span>
              <input type="tel" inputMode="tel" maxLength={10} value={form.telefono} onChange={update('telefono')} placeholder="Ej. 6121234567" aria-invalid={Boolean(errors.telefono)} />
              {errors.telefono && <small className="enroll-error">{errors.telefono}</small>}
            </label>
            <label className="enroll-field">
              <span>Edad</span>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={form.edad} onChange={update('edad')} placeholder="Ej. 28" aria-invalid={Boolean(errors.edad)} />
              {errors.edad && <small className="enroll-error">{errors.edad}</small>}
            </label>

            <label className="enroll-field">
              <span>Contacto de emergencia</span>
              <input value={form.contactoEmergenciaNombre} onChange={update('contactoEmergenciaNombre')} placeholder="Nombre completo" maxLength={150} aria-invalid={Boolean(errors.contactoEmergenciaNombre)} />
              {errors.contactoEmergenciaNombre && <small className="enroll-error">{errors.contactoEmergenciaNombre}</small>}
            </label>
            <label className="enroll-field">
              <span>Teléfono de emergencia</span>
              <input type="tel" inputMode="tel" maxLength={10} value={form.contactoEmergenciaTelefono} onChange={update('contactoEmergenciaTelefono')} placeholder="Ej. 6127654321" aria-invalid={Boolean(errors.contactoEmergenciaTelefono)} />
              {errors.contactoEmergenciaTelefono && <small className="enroll-error">{errors.contactoEmergenciaTelefono}</small>}
            </label>
          </div>

          <label className="enroll-field">
            <span>Alergias o condiciones médicas <em>(opcional)</em></span>
            <textarea rows="3" maxLength={500} value={form.notas} onChange={update('notas')} placeholder="Ej. alergia a picaduras, asma, ninguna..." />
            <small className="enroll-help">{form.notas.length}/500 caracteres</small>
          </label>

          {errors.submit && <div className="enroll-submit-error" role="alert">{errors.submit}</div>}

          <div className="enroll-actions">
            <button type="button" className="enroll-btn enroll-btn--outline" onClick={onClose} disabled={submitting}>Cancelar</button>
            <button type="submit" className="enroll-btn enroll-btn--solid" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar formulario de inscripción'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
