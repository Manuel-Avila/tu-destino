import { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import { eventSchema } from '../../validators/admin.validators';
import MapPicker from './MapPicker';
import ImagePicker from './ImagePicker';
import { CATEGORIAS } from '../events/eventUtils';
import { sanitizeSlug } from '../../utils/slug';
import './AdminModals.css';

const INCLUYE_OPTIONS = [
  'Guantes reutilizables y equipo de protección para la actividad.',
  'Herramientas y materiales necesarios para realizar la actividad.',
  'Estación de hidratación con agua purificada.',
  'Botiquín de primeros auxilios disponible durante la jornada.',
  'Seguro básico para las personas participantes.',
  'Refrigerio o bebida al cierre de la jornada.',
  'Constancia digital de participación.'
];
const LLEVAR_OPTIONS = [
  'Termo o cilindro reutilizable con agua suficiente para la duración de la jornada.',
  'Calzado cerrado y cómodo, adecuado al terreno y a las condiciones de la actividad.',
  'Gorra o sombrero de ala ancha y ropa ligera que proteja del sol.',
  'Protector solar biodegradable, de acuerdo con las indicaciones del área que se visita.',
  'Ropa que se pueda mojar o ensuciar cuando la actividad se realice en agua, lodo o arena.',
  'Repelente sin aroma fuerte cuando el sitio o el horario lo requieran.',
  'Teléfono celular cargado para comunicación o registro de observaciones, si se requiere.'
];
const RULE_OPTIONS = [
  { titulo: 'Cero plásticos desechables', texto: 'Evita bolsas, botellas y envases de un solo uso; lleva tus residuos de regreso y usa recipientes reutilizables.', icono: 'ban' },
  { titulo: 'Respeto a senderos y zonas autorizadas', texto: 'Permanece en las rutas y áreas indicadas por el personal para no dañar dunas, vegetación, raíces o zonas de restauración.', icono: 'leaf' },
  { titulo: 'Fauna silvestre: observar sin intervenir', texto: 'Mantén la distancia indicada; no toques, alimentes, persigas ni ilumines directamente a los animales.', icono: 'paw' },
  { titulo: 'Sin mascotas', texto: 'No ingreses con mascotas, salvo que las reglas específicas del sitio y la organización lo permitan.', icono: 'paw' },
  { titulo: 'Respeto de horarios y silencio', texto: 'Llega a la hora indicada y evita bocinas, música o ruidos que perturben la actividad o la fauna.', icono: 'clock' },
  { titulo: 'Seguir las indicaciones del equipo organizador', texto: 'Participa en la inducción y sigue las indicaciones de seguridad durante toda la jornada.', icono: 'people' },
  { titulo: 'Uso adecuado del equipo', texto: 'Utiliza el equipo de seguridad y los materiales como indique el personal responsable.', icono: 'shield' }
];

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
    lugarEvento: '',
    localidad: '',
    latitud: 24.1422,
    longitud: -110.3108,
    responsableNombre: '',
    responsableCorreo: '',
    responsableTelefono: '',
    cupoTotal: 100,
    imagenes: '',
    itinerario: [],
    incluye: [],
    llevar: [],
    reglasTitulo: '',
    reglasIntro: '',
    reglas: []
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [customIncluye, setCustomIncluye] = useState('');
  const [customLlevar, setCustomLlevar] = useState('');
  const [customRuleTitle, setCustomRuleTitle] = useState('');
  const [customRuleText, setCustomRuleText] = useState('');
  const [itineraryError, setItineraryError] = useState('');

  useEffect(() => {
    setErrors({});
    setStep(1);
    setCustomIncluye('');
    setCustomLlevar('');
    setCustomRuleTitle('');
    setCustomRuleText('');
    setItineraryError('');
    if (evento) {
      setFormData({
        slug: evento.slug || '',
        tituloEvento: evento.tituloEvento || '',
        descripcionEvento: evento.descripcionEvento || '',
        categoria: evento.categoria || 'limpieza',
        fecha: evento.fecha || '',
        horaInicio: evento.horaInicio || '',
        horaFin: evento.horaFin || '',
        lugarEvento: evento.lugarEvento || '',
        localidad: evento.localidad || '',
        latitud: evento.coordenadas?.[0] || evento.puntoEncuentro?.coordenadas?.[0] || 24.1422,
        longitud: evento.coordenadas?.[1] || evento.puntoEncuentro?.coordenadas?.[1] || -110.3108,
        imagenes: Array.isArray(evento.imagenes) ? evento.imagenes.join(', ') : '',
        responsableNombre: evento.responsable?.nombre || '',
        responsableCorreo: evento.responsable?.correo || '',
        responsableTelefono: evento.responsable?.telefono || '',
        cupoTotal: evento.convocatoria?.cupoTotal || 100,
        itinerario: evento.itinerario || [],
        incluye: evento.incluye || [],
        llevar: evento.llevar || [],
        reglasTitulo: evento.reglasTitulo || '',
        reglasIntro: evento.reglasIntro || '',
        reglas: evento.reglas || []
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
        lugarEvento: '',
        localidad: '',
        latitud: 24.1422,
        longitud: -110.3108,
        responsableNombre: '',
        responsableCorreo: '',
        responsableTelefono: '',
        cupoTotal: 100,
        imagenes: '',
        itinerario: [],
        incluye: [],
        llevar: [],
        reglasTitulo: '',
        reglasIntro: '',
        reglas: []
      });
    }
  }, [evento, isOpen]);

  useEffect(() => {
    setErrors({});
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // El slug solo admite letras y guiones, sin guiones al inicio ni repetidos.
    // Mientras se escribe se permite un guion final para poder separar palabras.
    const nextValue = name === 'slug'
      ? sanitizeSlug(value, { allowTrailingHyphen: true })
      : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Al salir del campo se elimina cualquier guion final.
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'slug') {
      setFormData((prev) => ({ ...prev, slug: sanitizeSlug(value) }));
    }
  };

  const validateStep = () => {
    // Asegura que el slug no termine en guion antes de validar.
    const cleanSlug = sanitizeSlug(formData.slug);
    if (cleanSlug !== formData.slug) {
      setFormData((prev) => ({ ...prev, slug: cleanSlug }));
    }

    const fieldsByStep = {
      1: ['slug', 'tituloEvento', 'descripcionEvento', 'categoria'],
      2: ['fecha', 'horaInicio', 'horaFin', 'lugarEvento', 'localidad', 'latitud', 'longitud'],
      3: [],
      4: ['responsableNombre', 'responsableCorreo', 'responsableTelefono', 'cupoTotal']
    };
    const fields = fieldsByStep[step];
    const nextErrors = {};
    fields.forEach((field) => {
      const value = field === 'slug' ? cleanSlug : formData[field];
      const result = eventSchema.shape[field].safeParse(value);
      if (!result.success) nextErrors[field] = result.error.issues[0].message;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const toggleChecklistItem = (field, item) => {
    setFormData((current) => ({
      ...current,
      [field]: current[field].includes(item)
        ? current[field].filter((entry) => entry !== item)
        : [...current[field], item]
    }));
  };

  const toggleRule = (rule) => {
    setFormData((current) => ({
      ...current,
      reglas: current.reglas.some((entry) => entry.titulo === rule.titulo)
        ? current.reglas.filter((entry) => entry.titulo !== rule.titulo)
        : [...current.reglas, rule]
    }));
  };

  const updateItinerary = (index, field, value) => {
    setItineraryError('');
    setFormData((current) => ({
      ...current,
      itinerario: current.itinerario.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    }));
  };

  const appendChecklistItem = (field, value, clear) => {
    const item = value.trim();
    if (!item || formData[field].includes(item)) return;
    setFormData((current) => ({ ...current, [field]: [...current[field], item] }));
    clear('');
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 4) {
      if (validateStep()) setStep((current) => current + 1);
      return;
    }
    const cleanSlug = sanitizeSlug(formData.slug);
    if (cleanSlug !== formData.slug) {
      setFormData((prev) => ({ ...prev, slug: cleanSlug }));
    }
    const result = eventSchema.safeParse({ ...formData, slug: cleanSlug });
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach(issue => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const partialItinerary = formData.itinerario.some((item) =>
      [item.hora, item.titulo, item.descripcion].some(Boolean) &&
      ![item.hora, item.titulo, item.descripcion].every((value) => String(value || '').trim())
    );
    if (partialItinerary) {
      setItineraryError('Completa hora, actividad y descripción en cada bloque del programa, o elimina los bloques vacíos.');
      return;
    }
    setItineraryError('');

    setIsUploading(true);
    try {
      const payload = new FormData();
      
      payload.append('slug', cleanSlug);
      payload.append('titulo_evento', formData.tituloEvento);
      payload.append('descripcion_evento', formData.descripcionEvento);
      payload.append('categoria', formData.categoria);
      payload.append('fecha_evento', formData.fecha);
      payload.append('hora_inicio', formData.horaInicio);
      payload.append('hora_fin', formData.horaFin);
      payload.append('lugar_evento', formData.lugarEvento);
      payload.append('localidad', formData.localidad);
      payload.append('latitud', formData.latitud);
      payload.append('longitud', formData.longitud);
      payload.append('responsable_nombre', formData.responsableNombre);
      payload.append('responsable_correo', formData.responsableCorreo);
      payload.append('responsable_telefono', formData.responsableTelefono);
      payload.append('cupo_total', formData.cupoTotal);
      payload.append('activo', 'true');
      payload.append('itinerario', JSON.stringify(formData.itinerario
        .filter((item) => item.hora && item.titulo.trim() && item.descripcion.trim())
        .sort((a, b) => a.hora.localeCompare(b.hora))));
      payload.append('incluye', JSON.stringify(formData.incluye));
      payload.append('llevar', JSON.stringify(formData.llevar));
      payload.append('reglas_titulo', formData.reglasTitulo);
      payload.append('reglas_intro', formData.reglasIntro);
      payload.append('reglas', JSON.stringify(formData.reglas));

      let existingImages = [];
      const currentImages = Array.isArray(formData.imagenes) 
        ? formData.imagenes 
        : (typeof formData.imagenes === 'string' && formData.imagenes.trim() ? formData.imagenes.split(',').map(s => s.trim()).filter(Boolean) : []);
      
      for (const img of currentImages) {
        if (img instanceof File) {
          payload.append('imagenes', img);
        } else if (typeof img === 'string') {
          existingImages.push(img);
        }
      }
      
      if (existingImages.length > 0) {
        payload.append('imagenes_existentes', JSON.stringify(existingImages));
      }

      await onSave(payload);
    } catch (err) {
      console.error(err);
      alert('Error al guardar el evento. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ReactModal isOpen={isOpen} onRequestClose={onClose} style={customStyles} contentLabel={evento ? "Editar Evento" : "Crear Evento"} closeTimeoutMS={200}>
      <div className="admin-modal-heading"><h2>{evento ? "Editar Evento" : "Crear Evento"}</h2><button type="button" className="admin-modal-close" onClick={onClose} aria-label="Cerrar formulario">×</button></div>
      <div className="admin-form-stepper admin-form-stepper--four" aria-label={`Paso ${step} de 4`}><span className={step === 1 ? 'is-active' : step > 1 ? 'is-complete' : ''}>1 · Evento</span><span className={step === 2 ? 'is-active' : step > 2 ? 'is-complete' : ''}>2 · Lugar</span><span className={step === 3 ? 'is-active' : step > 3 ? 'is-complete' : ''}>3 · Jornada</span><span className={step === 4 ? 'is-active' : ''}>4 · Contacto</span></div>
      <form className="admin-form" onSubmit={handleSubmit}>
        {step === 1 ? <>
        <label>
          Slug (URL)
          <input name="slug" value={formData.slug} onChange={handleChange} onBlur={handleBlur} disabled={!!evento} maxLength={120} pattern="[A-Za-z]+(-[A-Za-z]+)*" title="Solo letras y guiones, sin guiones al inicio, al final ni repetidos" />
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
            {CATEGORIAS.filter((categoria) => categoria.id !== 'todos').map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.label}</option>)}
          </select>
          {errors.categoria && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.categoria}</span>}
        </label>
        </> : step === 2 ? <>
        <div className="admin-event-datetime">
          <label style={{ flex: 1 }}>Fecha<input type="date" name="fecha" value={formData.fecha} onChange={handleChange} />
            {errors.fecha && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.fecha}</span>}</label>
          <label style={{ flex: 1 }}>Hora Inicio<input type="time" name="horaInicio" value={formData.horaInicio} onChange={handleChange} />
            {errors.horaInicio && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.horaInicio}</span>}</label>
          <label style={{ flex: 1 }}>Hora Fin<input type="time" name="horaFin" value={formData.horaFin} onChange={handleChange} />
            {errors.horaFin && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.horaFin}</span>}</label>
        </div>
        <label>
          Lugar
          <input name="lugarEvento" value={formData.lugarEvento} onChange={handleChange} />
          {errors.lugarEvento && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.lugarEvento}</span>}
        </label>
        <label>
          Localidad (Baja California Sur)
          <select name="localidad" value={formData.localidad} onChange={handleChange}>
            <option value="">Selecciona una localidad</option>
            {['La Paz', 'Loreto', 'Los Cabos / La Ribera'].map((localidad) => <option key={localidad} value={localidad}>{localidad}</option>)}
            {formData.localidad && !['La Paz', 'Loreto', 'Los Cabos / La Ribera'].includes(formData.localidad) && <option value={formData.localidad}>{formData.localidad}</option>}
          </select>
          {errors.localidad && <span style={{ color: "red", fontSize: "0.85em" }}>{errors.localidad}</span>}
        </label>
        
        <label>Ubicación en Mapa</label>
        <MapPicker 
          lat={formData.latitud} 
          lng={formData.longitud} 
          onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitud: lat, longitud: lng }))}
        />
        </> : step === 4 ? <>

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
        </> : step === 3 ? <>
        <section className="admin-event-options">
          <h3>¿Qué incluye la jornada?</h3>
          <p>Marca todo lo que proporcionarás a las personas participantes.</p>
          <div className="admin-checkbox-grid">
            {[...new Set([...INCLUYE_OPTIONS, ...formData.incluye])].map((item) => <label className="admin-checkbox-option" key={item}><input type="checkbox" checked={formData.incluye.includes(item)} onChange={() => toggleChecklistItem('incluye', item)} /><span>{item.replace(/\*\*/g, '')}</span></label>)}
          </div>
          <div className="admin-add-option"><input aria-label="Otro elemento incluido" placeholder="Agregar otro elemento" value={customIncluye} onChange={(e) => setCustomIncluye(e.target.value)} /><button type="button" className="admin-btn admin-btn--secondary" onClick={() => appendChecklistItem('incluye', customIncluye, setCustomIncluye)}>Agregar</button></div>
        </section>

        <section className="admin-event-options">
          <h3>¿Qué debes llevar?</h3>
          <p>Selecciona lo necesario para esta actividad.</p>
          <div className="admin-checkbox-grid">
            {[...new Set([...LLEVAR_OPTIONS, ...formData.llevar])].map((item) => <label className="admin-checkbox-option" key={item}><input type="checkbox" checked={formData.llevar.includes(item)} onChange={() => toggleChecklistItem('llevar', item)} /><span>{item.replace(/\*\*/g, '')}</span></label>)}
          </div>
          <div className="admin-add-option"><input aria-label="Otro elemento que deben llevar" placeholder="Agregar otro elemento" value={customLlevar} onChange={(e) => setCustomLlevar(e.target.value)} /><button type="button" className="admin-btn admin-btn--secondary" onClick={() => appendChecklistItem('llevar', customLlevar, setCustomLlevar)}>Agregar</button></div>
        </section>

        <section className="admin-event-options">
          <h3>Reglas de la jornada</h3>
          <p>Elige las reglas que deben ver las personas inscritas y personaliza el encabezado si lo necesitas.</p>
          <label>Título de las reglas<input value={formData.reglasTitulo} onChange={(e) => setFormData((current) => ({ ...current, reglasTitulo: e.target.value }))} placeholder="Reglas de respeto ecológico" /></label>
          <label>Introducción<textarea value={formData.reglasIntro} onChange={(e) => setFormData((current) => ({ ...current, reglasIntro: e.target.value }))} rows={2} placeholder="Indicaciones generales para cuidar el sitio." /></label>
          <div className="admin-checkbox-grid">
            {[...RULE_OPTIONS, ...formData.reglas.filter((rule) => !RULE_OPTIONS.some((option) => option.titulo === rule.titulo))].map((rule) => <label className="admin-checkbox-option" key={rule.titulo}><input type="checkbox" checked={formData.reglas.some((selected) => selected.titulo === rule.titulo)} onChange={() => toggleRule(rule)} /><span><strong>{rule.titulo}</strong><small>{rule.texto}</small></span></label>)}
          </div>
          <div className="admin-custom-rule"><input aria-label="Título de regla personalizada" placeholder="Título de otra regla" value={customRuleTitle} onChange={(e) => setCustomRuleTitle(e.target.value)} /><input aria-label="Descripción de regla personalizada" placeholder="Descripción de la regla" value={customRuleText} onChange={(e) => setCustomRuleText(e.target.value)} /><button type="button" className="admin-btn admin-btn--secondary" onClick={() => { const titulo = customRuleTitle.trim(); const texto = customRuleText.trim(); if (titulo && texto && !formData.reglas.some((rule) => rule.titulo === titulo)) { setFormData((current) => ({ ...current, reglas: [...current.reglas, { titulo, texto, icono: 'leaf' }] })); setCustomRuleTitle(''); setCustomRuleText(''); } }}>Agregar regla</button></div>
        </section>

        <section className="admin-event-options">
          <h3>Programa / cronograma operativo</h3>
          <p>Agrega cada momento en orden: hora, actividad y una breve descripción. Puedes dejarlo vacío si aún no tienes un programa definido.</p>
          {formData.itinerario.map((item, index) => <div className="admin-itinerary-row" key={`itinerario-${index}`}>
            <label>Hora<input type="time" value={item.hora || ''} onChange={(e) => updateItinerary(index, 'hora', e.target.value)} /></label>
            <label>Actividad<input value={item.titulo || ''} onChange={(e) => updateItinerary(index, 'titulo', e.target.value)} placeholder="Ej. Registro y bienvenida" /></label>
            <label>Descripción<textarea value={item.descripcion || ''} onChange={(e) => updateItinerary(index, 'descripcion', e.target.value)} rows={2} placeholder="¿Qué harán las personas en este momento?" /></label>
            <button type="button" className="admin-btn admin-btn--secondary" onClick={() => { setItineraryError(''); setFormData((current) => ({ ...current, itinerario: current.itinerario.filter((_, itemIndex) => itemIndex !== index) })); }}>Quitar bloque</button>
          </div>)}
          {itineraryError && <span className="admin-field-error">{itineraryError}</span>}
          <button type="button" className="admin-btn admin-btn--secondary admin-add-itinerary" onClick={() => { setItineraryError(''); setFormData((current) => ({ ...current, itinerario: [...current.itinerario, { hora: '', titulo: '', descripcion: '' }] })); }}>+ Agregar momento al programa</button>
        </section>
        </> : null}

        <div className="admin-form-actions">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onClose}>Cancelar</button>
          {step > 1 && <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setStep((current) => current - 1)}>Anterior</button>}
          {step < 4
            ? <button type="button" className="admin-btn admin-btn--primary" onClick={() => { if (validateStep()) setStep((current) => current + 1); }}>Siguiente</button>
            : <button type="submit" className="admin-btn admin-btn--primary" disabled={isUploading}>{isUploading ? "Subiendo..." : "Guardar evento"}</button>}
        </div>
      </form>
    </ReactModal>
  );
}
