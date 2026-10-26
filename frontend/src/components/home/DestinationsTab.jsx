import { Link, useNavigate } from 'react-router-dom';
import SectionHeading from '../SectionHeading';
import Icon from '../events/EventIcons';
import AuthCallout from '../public/AuthCallout';
import { useEffect, useMemo, useState } from 'react';
import { axiosInstance } from '../../api/axios';
import Swal from 'sweetalert2';
import { useAuthStore } from '../../store/authStore';
import DestinationModal from '../admin/DestinationModal';
import './EventsTab.css';
import { normalizar } from '../events/eventUtils';
import { useSavedDestinations } from '../../hooks/useSavedDestinations';
import './DestinationsTab.css';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

// Filtros por tipo de destino (se comparan con la etiqueta de cada tarjeta).
const CATEGORIAS_DESTINO = [
  { id: 'todo', label: 'Todo', icon: 'grid' },
  { id: 'area', label: 'Área protegida', icon: 'leaf', coincide: 'area protegida' },
  { id: 'nacional', label: 'Parque nacional', icon: 'mountain', coincide: 'parque nacional' },
  { id: 'reserva', label: 'Reserva', icon: 'paw', coincide: 'reserva' },
  { id: 'marino', label: 'Parque marino', icon: 'waves', coincide: 'parque marino' },
];

function StarRating({ rating }) {
  const rounded = Math.round(rating);
  return (
    <span className="catalog-card__stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rounded ? 'is-filled' : 'is-empty'}>★</span>
      ))}
    </span>
  );
}

function CatalogGrid({ destinations, isAdmin, onEdit, onDelete }) {
  const navigate = useNavigate();
  const { isSaved, toggle } = useSavedDestinations();
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div className="destinations-catalog-grid">
      {destinations.map((destination) => (
        <article
          className="catalog-card"
          key={destination.id}
          role="link"
          tabIndex={0}
          aria-label={`Ver destino: ${destination.name}`}
          style={{ backgroundImage: `url(${destination.image})` }}
          onClick={() => navigate(`/app/destinos/${destination.id}`)}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate(`/app/destinos/${destination.id}`);
            }
          }}
        >
          <span className="catalog-card__badge">{destination.tag || destination.label}</span>
          <div className="catalog-card__actions">
            {isAdmin && (
              <>
                <button type="button" className="admin-card-btn admin-card-btn--edit" aria-label="Editar destino" onClick={stop(() => onEdit(destination))}><Icon name="edit" size={14} /></button>
                <button type="button" className="admin-card-btn admin-card-btn--delete" aria-label="Eliminar destino" onClick={stop(() => onDelete(destination.id))}><Icon name="trash" size={14} /></button>
              </>
            )}
            <button
              type="button"
              className={`catalog-card__save ${isSaved(destination.id) ? 'is-saved' : ''}`.trim()}
              aria-pressed={isSaved(destination.id)}
              aria-label={isSaved(destination.id) ? 'Quitar de destinos guardados' : 'Guardar destino'}
              onClick={stop(() => toggle(destination.id))}
            >
              <Icon name="heart" size={17} style={isSaved(destination.id) ? { fill: 'currentColor' } : undefined} />
            </button>
          </div>

          <div className="catalog-card__content">
            <h3>{destination.name}</h3>
            <p className="dest-location">📍 {destination.location}</p>

            <p className="catalog-card__rating">
              <StarRating rating={destination.rating || 0} />
              {destination.reviewCount > 0 ? (
                <>
                  <span className="catalog-card__rating-number">{destination.rating.toFixed(1)}</span>
                  <span className="catalog-card__rating-count">
                    ({destination.reviewCount} {destination.reviewCount === 1 ? 'reseña' : 'reseñas'})
                  </span>
                </>
              ) : (
                <span className="catalog-card__rating-count">Sin calificaciones aún</span>
              )}
            </p>

            <p className="dest-description">{destination.description}</p>

            <span className="catalog-card__cta">Explorar destino</span>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function DestinationsTab({ locked = false }) {
  const isAdmin = useAuthStore(state => state.user?.isAdmin);
  const [destinations, setDestinations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [localidad, setLocalidad] = useState('todas');
  const [puntuacion, setPuntuacion] = useState('todas');
  const [categoria, setCategoria] = useState('todo');

  const fetchDestinations = async () => {
    try {
      const res = await axiosInstance.get('/api/destinos');
      setDestinations(res.data.destinos || res.data);
    } catch (err) {
      console.error('Error fetching destinations:', err);
    }
  };

  useEffect(() => {
    if (!locked) {
      fetchDestinations();
    }
  }, [locked]);

  const localidades = useMemo(
    () => [...new Set(destinations.map((d) => d.location).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')),
    [destinations]
  );

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    const cat = CATEGORIAS_DESTINO.find((c) => c.id === categoria);
    return destinations.filter((d) => {
      if (cat?.coincide && !normalizar(d.tag || d.label || '').includes(cat.coincide)) return false;
      if (localidad !== 'todas' && d.location !== localidad) return false;
      const rating = d.rating || 0;
      const total = d.reviewCount || 0;
      if (puntuacion === 'sin' && total > 0) return false;
      if (puntuacion !== 'todas' && puntuacion !== 'sin' && (total === 0 || rating < Number(puntuacion))) return false;
      if (!q) return true;
      return normalizar([d.name, d.location, d.label, d.tag, d.description].filter(Boolean).join(' ')).includes(q);
    });
  }, [destinations, busqueda, localidad, puntuacion, categoria]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setLocalidad('todas');
    setPuntuacion('todas');
    setCategoria('todo');
  };

  const handleCreate = () => {
    setEditingDest(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dest) => {
    setEditingDest(dest);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        confirmButton: 'admin-btn admin-btn--danger',
        cancelButton: 'admin-btn admin-btn--secondary'
      },
      buttonsStyling: false
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.delete(`/api/destinos/${id}`);
      fetchDestinations();
      Toast.fire({ icon: 'success', title: 'Destino eliminado' });
    } catch (err) {
      console.error(err);
      Toast.fire({ icon: 'error', title: 'Error al eliminar destino' });
    }
  };

  const handleSaveModal = async (payload) => {
    try {
      if (editingDest) {
        await axiosInstance.put(`/api/destinos/${editingDest.id}`, payload);
        Toast.fire({ icon: 'success', title: 'Destino actualizado' });
      } else {
        await axiosInstance.post('/api/destinos', payload);
        Toast.fire({ icon: 'success', title: 'Destino creado' });
      }
      setIsModalOpen(false);
      fetchDestinations();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Error al guardar destino';
      Toast.fire({ icon: 'error', title: msg });
    }
  };

  if (!locked) {
    return (
      <div className="ev-tab-wrap">
        <section className="ev-tab" id="destinos" aria-label="Destinos protegidos de Baja California Sur">
          <nav className="ev-breadcrumb" aria-label="Ruta de navegación">
            <Link to="/app"><Icon name="building" size={13} /> Inicio</Link>
            <Icon name="chevron-right" size={12} />
            <span className="is-current">Destinos</span>
          </nav>

          <header className="ev-hero">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="ev-hero__eyebrow"><Icon name="pin" size={14} /> ÁREAS NATURALES PROTEGIDAS</p>
                <h1>Destinos de Baja California Sur</h1>
              </div>
              {isAdmin && (
                <button type="button" className="ev-btn ev-btn--ghost" onClick={handleCreate} style={{ whiteSpace: 'nowrap' }}>
                  + Crear Destino
                </button>
              )}
            </div>
            <p className="ev-hero__lead">
              Explora playas, arrecifes y santuarios marinos de alto valor ecológico. Conoce su estatus de
              protección, sus reglas de visita y las actividades de bajo impacto que te permiten disfrutarlos
              sin alterar sus hábitats.
            </p>
          </header>

          <div className="ev-filters dest-filters">
            <label className="ev-field ev-field--search">
              <Icon name="search" size={17} />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar destino por nombre o lugar (ej. Balandra, Cabo Pulmo)..."
                aria-label="Buscar destinos"
              />
            </label>

            <label className="ev-field">
              <Icon name="pin" size={17} />
              <select value={localidad} onChange={(e) => setLocalidad(e.target.value)} aria-label="Localidad">
                <option value="todas">Todas las localidades (B.C.S.)</option>
                {localidades.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <Icon name="chevron-down" size={14} className="ev-field__caret" />
            </label>

            <label className="ev-field">
              <span className="dest-filters__star" aria-hidden="true">★</span>
              <select value={puntuacion} onChange={(e) => setPuntuacion(e.target.value)} aria-label="Puntuación">
                <option value="todas">Todas las puntuaciones</option>
                <option value="4.5">4.5 ★ o más</option>
                <option value="4">4 ★ o más</option>
                <option value="3">3 ★ o más</option>
                <option value="sin">Sin calificaciones</option>
              </select>
              <Icon name="chevron-down" size={14} className="ev-field__caret" />
            </label>
          </div>

          <div className="ev-chips" role="tablist" aria-label="Tipos de destino">
            {CATEGORIAS_DESTINO.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={categoria === c.id}
                className={`ev-chip ${categoria === c.id ? 'is-active' : ''}`.trim()}
                onClick={() => setCategoria(c.id)}
              >
                <Icon name={c.icon} size={14} /> {c.label}
              </button>
            ))}
          </div>

          {filtrados.length === 0 ? (
            <div className="ev-state">
              <p>No hay destinos que coincidan con tu búsqueda.</p>
              <button type="button" className="ev-btn ev-btn--outline" onClick={limpiarFiltros}>Limpiar filtros</button>
            </div>
          ) : (
            <CatalogGrid destinations={filtrados} isAdmin={isAdmin} onEdit={handleEdit} onDelete={handleDelete} />
          )}
          {isModalOpen && (
            <DestinationModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              destination={editingDest}
              onSave={handleSaveModal}
            />
          )}
        </section>
      </div>
    );
  }

  return (
    <section className="destinations-tab-section" id="destinos" aria-label="Destinos protegidos de Baja California Sur">
      <div className="section-header-wrap">
        <SectionHeading
          eyebrow="ÁREAS NATURALES PROTEGIDAS"
          title="Destinos de Baja California Sur"
          className="home-destinations__heading"
        />
        <p className="home-destinations__intro">
          Lugares impresionantes de alto valor ecológico que requieren nuestra protección y respeto constante.
        </p>
      </div>

      {/* Explicador informativo de lo que se puede hacer */}
      <div className="tab-info-explainer">
        <div className="info-badge">Información de la sección</div>
        <h3>¿Qué puedes hacer en la pestaña de Destinos?</h3>
        <div className="info-steps-grid">
          <div className="info-step-card">
            <div className="info-step-card__num">1</div>
            <h4>Consultar información ecológica oficial</h4>
            <p>
              Conoce el estatus de protección de cada destino, su biodiversidad clave y la importancia de sus arrecifes, manglares y dunas.
            </p>
          </div>
          <div className="info-step-card">
            <div className="info-step-card__num">2</div>
            <h4>Aprender reglamentos y aforos</h4>
            <p>
              Infórmate sobre los turnos de visita en Balandra, boyado de fondeo en Cabo Pulmo y lineamientos para evitar multas o daños al entorno.
            </p>
          </div>
          <div className="info-step-card">
            <div className="info-step-card__num">3</div>
            <h4>Turismo de bajo impacto</h4>
            <p>
              Descubre las actividades recomendadas (kayak, snorkel responsable, senderismo) para disfrutar las reservas sin alterar los hábitats marinos.
            </p>
          </div>
        </div>
      </div>

      <AuthCallout
        title="Inicia sesión para ver los destinos"
        text="Con tu cuenta podrás ver la ficha completa de cada destino, sus reglas de preservación y las reseñas de la comunidad."
      />
    </section>
  );
}
