import { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import { destinationSchema } from '../../validators/admin.validators';
import MapPicker from './MapPicker';
import ImagePicker from './ImagePicker';
import { sanitizeSlug } from '../../utils/slug';
import './AdminModals.css';

// Estilos básicos para el modal de react-modal
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '90vh',
    overflowY: 'auto',
    width: '90%',
    maxWidth: '600px',
    padding: '20px',
    borderRadius: '8px'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000
  }
};

ReactModal.setAppElement('#root');

const emptyForm = {
  id: '',
  name: '',
  location: '',
  label: '',
  tag: '',
  category: '',
  description: '',
  rules: [],
  bestActivities: '',
  image: '',
  coordinates: [24.1422, -110.3108] // Default BCS
};

const DESTINATION_TAGS = ['Área Protegida', 'Reserva', 'Parque Nacional', 'Parque Marino'];
const DESTINATION_LABELS = [
  'Área de Protección de Flora y Fauna',
  'Reserva de la Biósfera UNESCO',
  'Parque Nacional',
  'Santuario de Cetáceos y Parque Marino',
  'Arrecife Vivo'
];

export default function DestinationModal({ isOpen, onClose, destination, onSave }) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    setErrors({});
    setStep(1);
    if (destination) {
      setFormData({
        id: destination.id || '',
        name: destination.name || '',
        location: destination.location || '',
        label: destination.label || '',
        tag: destination.tag || '',
        category: destination.category || '',
        description: destination.description || '',
        rules: Array.isArray(destination.rules) ? destination.rules : [],
        bestActivities: destination.bestActivities || '',
        image: destination.image || '',
        coordinates: Array.isArray(destination.coordinates) && destination.coordinates.length === 2
          ? destination.coordinates
          : [24.1422, -110.3108]
      });
    } else {
      setFormData(emptyForm);
    }
  }, [destination, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // El ID (slug) solo admite letras y guiones, sin guiones al inicio ni repetidos.
    // Mientras se escribe se permite un guion final para poder separar palabras.
    const nextValue = name === 'id'
      ? sanitizeSlug(value, { allowTrailingHyphen: true })
      : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Al salir del campo se elimina cualquier guion final.
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'id') {
      setFormData((prev) => ({ ...prev, id: sanitizeSlug(value) }));
    }
  };

  // Las reglas se capturan una por línea y se guardan como arreglo.
  const handleRulesChange = (e) => {
    setFormData((prev) => ({ ...prev, rules: e.target.value.split('\n') }));
    if (errors.rules) {
      setErrors(prev => ({ ...prev, rules: null }));
    }
  };

  const validateStep = () => {
    // Asegura que el ID no termine en guion antes de validar.
    const cleanId = sanitizeSlug(formData.id);
    if (cleanId !== formData.id) {
      setFormData((prev) => ({ ...prev, id: cleanId }));
    }

    const fields = step === 1 ? ['id', 'name', 'location', 'tag', 'label', 'category'] : ['description', 'rules', 'bestActivities'];
    const values = { ...formData, id: cleanId, rules: formData.rules.map((rule) => rule.trim()).filter(Boolean) };
    const nextErrors = {};
    fields.forEach((field) => {
      const result = destinationSchema.shape[field].safeParse(values[field]);
      if (!result.success) nextErrors[field] = result.error.issues[0].message;
    });
    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (validateStep()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 2) return;

    const cleanId = sanitizeSlug(formData.id);
    if (cleanId !== formData.id) {
      setFormData((prev) => ({ ...prev, id: cleanId }));
    }

    const dataToValidate = {
      ...formData,
      id: cleanId,
      rules: formData.rules.map(rule => rule.trim()).filter(Boolean)
    };
    const result = destinationSchema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach(issue => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    setIsUploading(true);
    try {
      const payload = new FormData();
      Object.keys(dataToValidate).forEach(key => {
         if (key !== 'image') {
            let val = dataToValidate[key];
            if (val !== null && typeof val === 'object') {
              payload.append(key, JSON.stringify(val));
            } else {
              payload.append(key, val);
            }
         }
      });
      
      if (formData.image instanceof File) {
        payload.append('image', formData.image);
      } else if (typeof formData.image === 'string') {
        payload.append('image', formData.image); // Will be handled normally as a string if we need it
      }

      await onSave(payload);
    } catch (err) {
      console.error(err);
      alert('Error al guardar el destino. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ReactModal isOpen={isOpen} onRequestClose={onClose} style={customStyles} contentLabel={destination ? 'Editar Destino' : 'Crear Destino'} closeTimeoutMS={200}>
      <div className="admin-modal-heading"><h2>{destination ? 'Editar Destino' : 'Crear Destino'}</h2><button type="button" className="admin-modal-close" onClick={onClose} aria-label="Cerrar formulario">×</button></div>
      <div className="admin-form-stepper" aria-label={`Paso ${step} de 2`}><span className={step === 1 ? 'is-active' : 'is-complete'}>1 · Datos y categoría</span><span className={step === 2 ? 'is-active' : ''}>2 · Información y mapa</span></div>
      <form className="admin-form" onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}>
        {step === 1 ? <>
        <label>
          Slug (URL)
          <input name="id" value={formData.id} onChange={handleChange} onBlur={handleBlur} disabled={!!destination} maxLength={50} pattern="[A-Za-z]+(-[A-Za-z]+)*" title="Solo letras y guiones, sin guiones al inicio, al final ni repetidos" />
          {errors.id && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.id}</span>}
        </label>
        <label>
          Nombre
          <input name="name" value={formData.name} onChange={handleChange} />
          {errors.name && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.name}</span>}
        </label>
        <label>
          Ubicación
          <input name="location" value={formData.location} onChange={handleChange} />
          {errors.location && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.location}</span>}
        </label>
        <label>
          Etiqueta Corta (Ej. Área Protegida)
          <select name="tag" value={formData.tag} onChange={handleChange}>
            <option value="">Selecciona una etiqueta</option>
            {DESTINATION_TAGS.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            {formData.tag && !DESTINATION_TAGS.includes(formData.tag) && <option value={formData.tag}>{formData.tag}</option>}
          </select>
          {errors.tag && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.tag}</span>}
        </label>
        <label>
          Etiqueta Larga (Ej. Área de Protección de Flora y Fauna)
          <select name="label" value={formData.label} onChange={handleChange}>
            <option value="">Selecciona una etiqueta</option>
            {DESTINATION_LABELS.map((label) => <option key={label} value={label}>{label}</option>)}
            {formData.label && !DESTINATION_LABELS.includes(formData.label) && <option value={formData.label}>{formData.label}</option>}
          </select>
          {errors.label && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.label}</span>}
        </label>
        <label>
          Categoría
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="">Selecciona una categoría</option>
            {['kayak', 'snorkel', 'senderismo', 'playa', 'observación de fauna', 'buceo', 'campismo'].map((category) => <option key={category} value={category}>{category.replace(/^./, (letter) => letter.toLocaleUpperCase('es-MX'))}</option>)}
            {formData.category && !['kayak', 'snorkel', 'senderismo', 'playa', 'observación de fauna', 'buceo', 'campismo'].includes(formData.category) && <option value={formData.category}>{formData.category}</option>}
          </select>
          {errors.category && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.category}</span>}
        </label>
        </> : <>
        <label>
          Descripción
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} />
          {errors.description && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.description}</span>}
        </label>
        <label>
          Reglas de preservación obligatorias
          <textarea
            name="rules"
            value={formData.rules.join('\n')}
            onChange={handleRulesChange}
            rows={4}
            placeholder={'Ej. Sin plásticos de un solo uso\nUso de protector solar biodegradable\nProhibido pisar los manglares'}
          />
          <span style={{ fontSize: '0.8em', fontWeight: 400, color: '#6b7280' }}>
            Escribe una regla por línea.
          </span>
          {errors.rules && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.rules}</span>}
        </label>
        <label>
          Actividades sustentables permitidas
          <textarea
            name="bestActivities"
            value={formData.bestActivities}
            onChange={handleChange}
            rows={3}
            placeholder="Ej. Kayak suave, paddle board y senderismo por rutas autorizadas."
          />
          {errors.bestActivities && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.bestActivities}</span>}
        </label>
        <label>Imagen Principal</label>
        <ImagePicker 
          multiple={false} 
          initialImages={formData.image ? [formData.image] : []} 
          onChange={(filesOrUrls) => setFormData(prev => ({ ...prev, image: filesOrUrls[0] || '' }))}
        />

        <label>Ubicación en Mapa</label>
        <MapPicker 
          lat={formData.coordinates?.[0]} 
          lng={formData.coordinates?.[1]} 
          onChange={(lat, lng) => setFormData(prev => ({ ...prev, coordinates: [lat, lng] }))}
        />
        </>}

        <div className="admin-form-actions">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onClose}>Cancelar</button>
          {step === 2 && <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setStep(1)}>Anterior</button>}
          {step === 1
            ? <button type="button" className="admin-btn admin-btn--primary" onClick={handleNextStep}>Siguiente</button>
            : <button type="submit" className="admin-btn admin-btn--primary" disabled={isUploading}>{isUploading ? "Subiendo..." : "Guardar destino"}</button>}
        </div>
      </form>
    </ReactModal>
  );
}
