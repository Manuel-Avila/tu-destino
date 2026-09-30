import { Link } from 'react-router-dom';
import SectionHeading from '../SectionHeading';
import Icon from '../events/EventIcons';
import AuthCallout from '../public/AuthCallout';
import { useEffect, useState } from 'react';
import { axiosInstance } from '../../api/axios';
import Swal from 'sweetalert2';
import { useAuthStore } from '../../store/authStore';
import DestinationModal from '../admin/DestinationModal';
import './EventsTab.css';
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
  return (
    <div className="destinations-catalog-grid">
      {destinations.map((destination) => (
        <div
          className="catalog-card"
          key={destination.id}
          style={{ backgroundImage: `url(${destination.image})` }}
        >
          <span className="catalog-card__badge">{destination.tag || destination.label}</span>
          {isAdmin && (
            <div style={{ position: 'absolute', top: '1.1rem', right: '1.1rem', display: 'flex', gap: '4px', zIndex: 2 }}>
              <button type="button" className="admin-card-btn admin-card-btn--edit" onClick={() => onEdit(destination)}><Icon name="edit" size={14} /></button>
              <button type="button" className="admin-card-btn admin-card-btn--delete" onClick={() => onDelete(destination.id)}><Icon name="trash" size={14} /></button>
            </div>
          )}

          <div className="catalog-card__content">
            <h3>{destination.name}</h3>
            <p className="dest-location">📍 {destination.location}</p>

            {typeof destination.rating === 'number' && (
              <p className="catalog-card__rating">
                <StarRating rating={destination.rating} />
                <span className="catalog-card__rating-number">{destination.rating.toFixed(1)}</span>
                <span className="catalog-card__rating-count">({destination.reviewCount} reviews)</span>
              </p>
            )}

            <p className="dest-description">{destination.description}</p>

            <Link to={`/app/destinos/${destination.id}`} className="catalog-card__cta">
              Explorar destino
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DestinationsTab({ locked = false }) {
  const isAdmin = useAuthStore(state => state.user?.isAdmin);
  const [destinations, setDestinations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState(null);

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
      Toast.fire({ icon: 'error', title: 'Error al guardar destino' });
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

          <CatalogGrid destinations={destinations} isAdmin={isAdmin} onEdit={handleEdit} onDelete={handleDelete} />
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
