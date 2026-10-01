import { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import { destinationSchema } from '../../validators/admin.validators';
import MapPicker from './MapPicker';
import ImagePicker from './ImagePicker';
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

export default function DestinationModal({ isOpen, onClose, destination, onSave }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    location: '',
    label: '',
    tag: '',
    category: '',
    description: '',
    image: '',
    coordinates: [24.1422, -110.3108] // Default BCS
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setErrors({});
    if (destination) {
      setFormData(destination);
    } else {
      setFormData({
        id: '',
        name: '',
        location: '',
        label: '',
        tag: '',
        category: '',
        description: '',
        image: '',
        coordinates: [24.1422, -110.3108]
      });
    }
  }, [destination, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = destinationSchema.safeParse(formData);
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
      Object.keys(formData).forEach(key => {
         if (key !== 'image') {
            let val = formData[key];
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
      <h2 style={{ marginTop: 0, color: '#00695b' }}>{destination ? 'Editar Destino' : 'Crear Destino'}</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Slug (URL)
          <input name="id" value={formData.id} onChange={handleChange} disabled={!!destination} />
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
          <input name="tag" value={formData.tag} onChange={handleChange} />
          {errors.tag && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.tag}</span>}
        </label>
        <label>
          Etiqueta Larga (Ej. Área de Protección de Flora y Fauna)
          <input name="label" value={formData.label} onChange={handleChange} />
          {errors.label && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.label}</span>}
        </label>
        <label>
          Categoría
          <input name="category" value={formData.category} onChange={handleChange} />
          {errors.category && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.category}</span>}
        </label>
        <label>
          Descripción
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} />
          {errors.description && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.description}</span>}
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

        <div className="admin-form-actions">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={isUploading}>{isUploading ? "Subiendo..." : "Guardar"}</button>
        </div>
      </form>
    </ReactModal>
  );
}
