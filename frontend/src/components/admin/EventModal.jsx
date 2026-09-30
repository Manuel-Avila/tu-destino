import { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import { eventSchema } from '../../validators/admin.validators';
import MapPicker from './MapPicker';
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
    maxWidth: '700px',
    padding: '20px',
    borderRadius: '8px'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000
  }
};

ReactModal.setAppElement('#root');

export default function EventModal({ isOpen, onClose, evento, onSave }) {
  const [formData, setFormData] = useState({
    slug: '',
    tituloEvento: '',
    descripcionEvento: '',
    categoria: 'limpieza',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    duracionHoras: '',
    lugarEvento: '',
    localidad: '',
    latitud: 24.1422,
    longitud: -110.3108,
    responsableNombre: '',
    responsableCorreo: '',
    responsableTelefono: '',
    cupoTotal: 100,
    imagenes: '' 
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors({});
    if (evento) {
      setFormData({
        slug: evento.slug || '',
        tituloEvento: evento.tituloEvento || '',
        descripcionEvento: evento.descripcionEvento || '',
        categoria: evento.categoria || 'limpieza',
        fecha: evento.fecha || '',
        horaInicio: evento.horaInicio || '',
        horaFin: evento.horaFin || '',
        duracionHoras: evento.duracionHoras || '',
        lugarEvento: evento.lugarEvento || '',
        localidad: evento.localidad || '',
        latitud: evento.coordenadas?.[0] || evento.puntoEncuentro?.coordenadas?.[0] || 24.1422,
        longitud: evento.coordenadas?.[1] || evento.puntoEncuentro?.coordenadas?.[1] || -110.3108,
        imagenes: Array.isArray(evento.imagenes) ? evento.imagenes.join(', ') : '',
        responsableNombre: evento.responsable?.nombre || '',
        responsableCorreo: evento.responsable?.correo || '',
        responsableTelefono: evento.responsable?.telefono || '',
        cupoTotal: evento.convocatoria?.cupoTotal || 100
      });
    } else {
      setFormData({
        slug: '',
        tituloEvento: '',
        descripcionEvento: '',
        categoria: 'limpieza',
        fecha: '',
        horaInicio: '',
        horaFin: '',
        duracionHoras: '',
        lugarEvento: '',
        localidad: '',
        latitud: 24.1422,
        longitud: -110.3108,
        responsableNombre: '',
        responsableCorreo: '',
        responsableTelefono: '',
        cupoTotal: 100,
        imagenes: ''
      });
    }
  }, [evento, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = eventSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach(issue => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    const payload = {
      slug: formData.slug,
      titulo_evento: formData.tituloEvento,
      descripcion_evento: formData.descripcionEvento,
      categoria: formData.categoria,
      fecha_evento: formData.fecha,
      hora_inicio: formData.horaInicio,
      hora_fin: formData.horaFin,
      duracion_horas: Number(formData.duracionHoras),
      lugar_evento: formData.lugarEvento,
      localidad: formData.localidad,
      latitud: Number(formData.latitud),
      longitud: Number(formData.longitud),
      responsable_nombre: formData.responsableNombre,
      responsable_correo: formData.responsableCorreo,
      responsable_telefono: formData.responsableTelefono,
      cupo_total: Number(formData.cupoTotal),
      imagenes: Array.isArray(formData.imagenes) 
        ? formData.imagenes.filter(img => typeof img === 'string') 
        : (typeof formData.imagenes === 'string' ? formData.imagenes.split(',').map(s => s.trim()).filter(Boolean) : []),
      activo: true
    };
    onSave(payload);
  };

  return (
    <ReactModal isOpen={isOpen} onRequestClose={onClose} style={customStyles} contentLabel={evento ? "Editar Evento" : "Crear Evento"} closeTimeoutMS={200}>
      <h2 style={{ marginTop: 0, color: "#00695b" }}>{evento ? "Editar Evento" : "Crear Evento"}</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Slug (URL)
          <input name="slug" value={formData.slug} onChange={handleChange} disabled={!!evento} />
          {errors.slug && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.slug}</span>}
        </label>
        <label>
          Título
          <input name="tituloEvento" value={formData.tituloEvento} onChange={handleChange} />
          {errors.tituloEvento && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.tituloEvento}</span>}
        </label>
        <label>
          Descripción
          <textarea name="descripcionEvento" value={formData.descripcionEvento} onChange={handleChange} rows={3} />
          {errors.descripcionEvento && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.descripcionEvento}</span>}
        </label>
        <label>
          Categoría
          <select name="categoria" value={formData.categoria} onChange={handleChange}>
            <option value="limpieza">Limpieza</option>
            <option value="reforestacion">Reforestación</option>
            <option value="fauna">Fauna</option>
            <option value="educacion">Educación</option>
            <option value="preservacion">Preservación</option>
          </select>
          {errors.categoria && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.categoria}</span>}
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <label style={{ flex: 1 }}>Fecha<input type="date" name="fecha" value={formData.fecha} onChange={handleChange} />
            {errors.fecha && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.fecha}</span>}</label>
          <label style={{ flex: 1 }}>Hora Inicio<input type="time" name="horaInicio" value={formData.horaInicio} onChange={handleChange} />
            {errors.horaInicio && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.horaInicio}</span>}</label>
          <label style={{ flex: 1 }}>Hora Fin<input type="time" name="horaFin" value={formData.horaFin} onChange={handleChange} />
            {errors.horaFin && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.horaFin}</span>}</label>
          <label style={{ flex: 1 }}>Duración (hrs)<input type="number" step="0.5" name="duracionHoras" value={formData.duracionHoras} onChange={handleChange} />
            {errors.duracionHoras && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.duracionHoras}</span>}</label>
        </div>
        <label>
          Lugar
          <input name="lugarEvento" value={formData.lugarEvento} onChange={handleChange} />
          {errors.lugarEvento && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.lugarEvento}</span>}
        </label>
        <label>
          Localidad
          <input name="localidad" value={formData.localidad} onChange={handleChange} />
          {errors.localidad && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.localidad}</span>}
        </label>
        
        <label>Ubicación en Mapa</label>
        <MapPicker 
          lat={formData.latitud} 
          lng={formData.longitud} 
          onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitud: lat, longitud: lng }))}
        />

        <label>Responsable Nombre<input name="responsableNombre" value={formData.responsableNombre} onChange={handleChange} />
          {errors.responsableNombre && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.responsableNombre}</span>}</label>
        <label>Responsable Correo<input type="email" name="responsableCorreo" value={formData.responsableCorreo} onChange={handleChange} />
          {errors.responsableCorreo && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.responsableCorreo}</span>}</label>
        <label>Responsable Teléfono
          <input 
            type="tel" 
            name="responsableTelefono" 
            maxLength={10}
            value={formData.responsableTelefono} 
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              setFormData(prev => ({ ...prev, responsableTelefono: val }));
              if (errors.responsableTelefono) setErrors(prev => ({ ...prev, responsableTelefono: null }));
            }} 
          />
          {errors.responsableTelefono && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.responsableTelefono}</span>}
        </label>
        <label>Cupo Total<input type="number" name="cupoTotal" value={formData.cupoTotal} onChange={handleChange} />
          {errors.cupoTotal && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.cupoTotal}</span>}</label>
        
        <label>Imágenes</label>
        <ImagePicker 
          multiple={true} 
          initialImages={Array.isArray(formData.imagenes) ? formData.imagenes : (typeof formData.imagenes === 'string' && formData.imagenes.trim() ? formData.imagenes.split(',').map(s => s.trim()).filter(Boolean) : [])} 
          onChange={(filesOrUrls) => setFormData(prev => ({ ...prev, imagenes: filesOrUrls }))}
        />

        <div className="admin-form-actions">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="admin-btn admin-btn--primary">Guardar</button>
        </div>
      </form>
    </ReactModal>
  );
}