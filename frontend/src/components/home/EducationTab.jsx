import { useCallback, useEffect, useState } from 'react';
import SectionHeading from '../SectionHeading';
import Icon from '../events/EventIcons';
import EducationModal from '../admin/EducationModal';
import { useAuthStore } from '../../store/authStore';
import {
  actualizarPublicacion,
  crearPublicacion,
  eliminarPublicacion,
  getPublicaciones,
} from '../../services/educacion.service';
import Swal from 'sweetalert2';
import './EducationTab.css';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

function PublicacionCard({ publicacion, isAdmin, onEdit, onDelete }) {
  return (
    <article className="edu-guide-card">
      {isAdmin && (
        <div className="edu-guide-card__actions">
          <button
            type="button"
            className="edu-card-btn edu-card-btn--edit"
            onClick={() => onEdit(publicacion)}
            aria-label="Editar publicación"
          >
            <Icon name="edit" size={15} />
          </button>
          <button
            type="button"
            className="edu-card-btn edu-card-btn--delete"
            onClick={() => onDelete(publicacion)}
            aria-label="Eliminar publicación"
          >
            <Icon name="trash" size={15} />
          </button>
        </div>
      )}

      {publicacion.imagen ? (
        <div className="edu-guide-card__media">
          <img src={publicacion.imagen} alt={publicacion.titulo} loading="lazy" />
        </div>
      ) : (
        <div className="edu-guide-card__media edu-guide-card__media--empty" aria-hidden="true">
          <Icon name="book" size={30} />
        </div>
      )}

      {publicacion.categoria && (
        <span className="edu-guide-card__category">{publicacion.categoria}</span>
      )}
      <h4>{publicacion.titulo}</h4>
      <p>{publicacion.texto}</p>
    </article>
  );
}

export default function EducationTab() {
  const isAdmin = useAuthStore((state) => state.user?.isAdmin);

  const [publicaciones, setPublicaciones] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublicacion, setEditingPublicacion] = useState(null);

  const cargar = useCallback(() => {
    getPublicaciones()
      .then((data) => {
        setPublicaciones(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const recargar = () => {
    setStatus('loading');
    cargar();
  };

  const handleCreate = () => {
    setEditingPublicacion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (publicacion) => {
    setEditingPublicacion(publicacion);
    setIsModalOpen(true);
  };

  const handleDelete = async (publicacion) => {
    const result = await Swal.fire({
      title: '¿Eliminar publicación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'admin-btn admin-btn--danger',
        cancelButton: 'admin-btn admin-btn--secondary',
      },
    });

    if (!result.isConfirmed) return;

    try {
      await eliminarPublicacion(publicacion.id);
      recargar();
      Toast.fire({ icon: 'success', title: 'Publicación eliminada' });
    } catch (err) {
      Toast.fire({
        icon: 'error',
        title: err.message || 'No se pudo eliminar la publicación',
      });
    }
  };

  const handleSaveModal = async (formData) => {
    try {
      if (editingPublicacion) {
        await actualizarPublicacion(editingPublicacion.id, formData);
        Toast.fire({ icon: 'success', title: 'Publicación actualizada' });
      } else {
        await crearPublicacion(formData);
        Toast.fire({ icon: 'success', title: 'Publicación creada' });
      }
      setIsModalOpen(false);
      setEditingPublicacion(null);
      recargar();
    } catch (err) {
      const firstFieldError = err.fieldErrors && Object.values(err.fieldErrors)[0];
      Toast.fire({
        icon: 'error',
        title: firstFieldError || err.message || 'No se pudo guardar la publicación',
      });
    }
  };

  return (
    <section className="home-education" id="educacion" aria-label="Educación ambiental">
      <div className="edu-section-header">
        <div>
          <SectionHeading
            eyebrow="CONCIENCIA Y PRESERVACIÓN"
            title="Educación Ambiental"
            className="home-destinations__heading"
          />
          <p className="home-destinations__intro">
            Conoce cómo convivir armónicamente con la vida marina y los ecosistemas costeros del Golfo de California.
          </p>
        </div>

        {isAdmin && (
          <button type="button" className="edu-create-btn" onClick={handleCreate}>
            <Icon name="edit" size={15} /> Crear publicación
          </button>
        )}
      </div>

      {/* Explicador informativo de lo que se puede hacer */}
      <div className="tab-info-explainer">
        <div className="info-badge">Información de la sección</div>
        <h3>¿Qué puedes aprender en Educación Ambiental?</h3>
        <div className="info-steps-grid">
          <div className="info-step-card">
            <div className="info-step-card__num">1</div>
            <h4>Decálogo del Turista Consciente</h4>
            <p>
              Pautas indispensables para disfrutar de las costas de BCS sin dejar huella ecológica ni alterar especies protegidas.
            </p>
          </div>
          <div className="info-step-card">
            <div className="info-step-card__num">2</div>
            <h4>Protección de Arrecifes y Manglares</h4>
            <p>
              Descubre por qué los protectores solares químicos dañan corales y cuáles son las alternativas Reef-Safe autorizadas.
            </p>
          </div>
          <div className="info-step-card">
            <div className="info-step-card__num">3</div>
            <h4>Convivencia Respetuosa con la Fauna</h4>
            <p>
              Aprende las distancias mínimas y protocolos oficiales de avistamiento para tiburón ballena, lobos marinos y tortugas.
            </p>
          </div>
        </div>
      </div>

      {status === 'loading' && (
        <p className="edu-state" role="status">Cargando publicaciones...</p>
      )}

      {status === 'error' && (
        <div className="edu-state" role="alert">
          <p>No pudimos cargar las publicaciones de educación ambiental.</p>
          <button type="button" className="edu-state__retry" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}

      {status === 'ready' && publicaciones.length === 0 && (
        <div className="edu-state">
          <p>Todavía no hay publicaciones de educación ambiental.</p>
          {isAdmin && (
            <button type="button" className="edu-create-btn" onClick={handleCreate}>
              <Icon name="edit" size={15} /> Crear la primera publicación
            </button>
          )}
        </div>
      )}

      {status === 'ready' && publicaciones.length > 0 && (
        <div className="education-content-grid">
          {publicaciones.map((publicacion) => (
            <PublicacionCard
              key={publicacion.id}
              publicacion={publicacion}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <EducationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPublicacion(null);
          }}
          publicacion={editingPublicacion}
          onSave={handleSaveModal}
        />
      )}
    </section>
  );
}
