import { useState } from 'react';
import ReactModal from 'react-modal';
import { educationSchema } from '../../validators/admin.validators';
import { EDUCATION_CATEGORIES, EDUCATION_CATEGORY_NAMES } from '../../data/educationCategories';
import ImagePicker from './ImagePicker';
import './AdminModals.css';

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
    maxWidth: '640px',
    padding: '20px',
    borderRadius: '8px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
};

ReactModal.setAppElement('#root');

const emptyForm = {
  titulo: '',
  categoria: '',
  texto: '',
  imagen: '',
};

export default function EducationModal({ isOpen, onClose, publicacion, onSave }) {
  const [formData, setFormData] = useState(() =>
    publicacion
      ? {
          titulo: publicacion.titulo || '',
          categoria: EDUCATION_CATEGORY_NAMES.includes(publicacion.categoria)
            ? publicacion.categoria
            : '',
          texto: publicacion.texto || '',
          imagen: publicacion.imagen || '',
        }
      : emptyForm
  );
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (filesOrUrls) => {
    setFormData((prev) => ({ ...prev, imagen: filesOrUrls[0] || '' }));
    if (errors.imagen) {
      setErrors((prev) => ({ ...prev, imagen: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = educationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!publicacion && !(formData.imagen instanceof File)) {
      setErrors({ imagen: 'Selecciona una imagen para la publicación.' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('titulo', formData.titulo);
      payload.append('categoria', formData.categoria);
      payload.append('texto', formData.texto);

      if (formData.imagen instanceof File) {
        payload.append('imagen', formData.imagen);
      } else if (publicacion && !formData.imagen) {
        payload.append('quitar_imagen', 'true');
      }

      await onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel={publicacion ? 'Editar publicación' : 'Crear publicación'}
      closeTimeoutMS={200}
    >
      <h2 style={{ marginTop: 0, color: '#00695b' }}>
        {publicacion ? 'Editar publicación' : 'Crear publicación'}
      </h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Título
          <input
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ej. Protección de Arrecifes de Coral"
          />
          {errors.titulo && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.titulo}</span>}
        </label>

        <label>
          Categoría
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
          >
            <option value="">Selecciona una categoría</option>
            {EDUCATION_CATEGORIES.map((categoria) => (
              <option key={categoria.name} value={categoria.name}>
                {categoria.name}
              </option>
            ))}
          </select>
          {errors.categoria && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.categoria}</span>}
        </label>

        <label>
          Texto
          <textarea
            name="texto"
            rows={6}
            value={formData.texto}
            onChange={handleChange}
            placeholder="Escribe el contenido educativo para la comunidad..."
          />
          {errors.texto && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.texto}</span>}
        </label>

        <label>Imagen</label>
        <ImagePicker
          key={publicacion?.id ?? 'nueva'}
          multiple={false}
          initialImages={formData.imagen && typeof formData.imagen === 'string' ? [formData.imagen] : []}
          onChange={handleImageChange}
        />
        {errors.imagen && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.imagen}</span>}

        <div className="admin-form-actions">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </ReactModal>
  );
}
