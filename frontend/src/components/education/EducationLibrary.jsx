import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Icon from '../events/EventIcons';
import EducationModal from '../admin/EducationModal';
import { useAuthStore } from '../../store/authStore';
import {
  actualizarPublicacion,
  crearPublicacion,
  eliminarPublicacion,
  getPublicaciones,
} from '../../services/educacion.service';
import {
  ALL_EDUCATION_CATEGORY,
  EDUCATION_CATEGORIES,
} from '../../data/educationCategories';
import '../home/EventsTab.css';
import '../../pages/app/AppEducationPage.css';

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

export default function EducationLibrary({ variant = 'app' }) {
  const isApp = variant === 'app';
  const isAdmin = useAuthStore((state) => state.user?.isAdmin);

  const [publicaciones, setPublicaciones] = useState([]);
  const [status, setStatus] = useState('loading');
  const [category, setCategory] = useState(ALL_EDUCATION_CATEGORY.name);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublicacion, setEditingPublicacion] = useState(null);

  const homePath = isApp ? '/app' : '/';
  const detailPath = (id) => (isApp ? `/app/educacion/${id}` : `/educacion/${id}`);

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

  const filteredPublicaciones = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    return publicaciones.filter((publicacion) => {
      const matchesCategory =
        category === ALL_EDUCATION_CATEGORY.name || publicacion.categoria === category;
      const matchesQuery =
        !normalizedQuery ||
        `${publicacion.titulo} ${publicacion.texto} ${publicacion.categoria}`
          .toLocaleLowerCase('es')
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [publicaciones, category, query]);

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
    <div className="ev-tab-wrap">
      <section className="ev-tab app-education" aria-labelledby="app-education-title">
        <nav className="ev-breadcrumb" aria-label="Ruta de navegación">
          <Link to={homePath}>
            <Icon name="building" size={13} /> Inicio
          </Link>
          <Icon name="chevron-right" size={12} />
          <span className="is-current">Educación Ambiental</span>
        </nav>

        <header className="ev-hero app-education__intro">
          <div>
            <p className="ev-hero__eyebrow">
              <Icon name="book" size={14} />{' '}
              {isApp ? 'BIBLIOTECA DIGITAL' : 'CONCIENCIA Y PRESERVACIÓN'}
            </p>
            <h1 id="app-education-title">Educación Ambiental</h1>
            <p className="ev-hero__lead">
              Explora nuestras publicaciones sobre el ecosistema marino de Baja California Sur.
              Aprende sobre conservación, especies locales y turismo responsable.
            </p>
          </div>

          {isAdmin && (
            <button type="button" className="ev-btn ev-btn--solid app-education__create" onClick={handleCreate}>
              <Icon name="edit" size={15} /> Crear publicación
            </button>
          )}
        </header>

        <div className="ev-filters app-education__searchbar">
          <label className="ev-field ev-field--search">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar publicaciones (ej. tortugas, manglares)..."
              aria-label="Buscar publicaciones"
            />
          </label>
        </div>

        <div className="app-education__filters ev-chips" role="tablist" aria-label="Filtrar publicaciones por categoría">
          {[ALL_EDUCATION_CATEGORY, ...EDUCATION_CATEGORIES].map((item) => (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={category === item.name}
              className={`ev-chip ${category === item.name ? 'is-active' : ''}`.trim()}
              onClick={() => setCategory(item.name)}
            >
              <Icon name={item.icon} size={14} /> {item.name}
            </button>
          ))}
        </div>

        {status === 'loading' && (
          <div className="app-education__empty" role="status">Cargando publicaciones...</div>
        )}

        {status === 'error' && (
          <div className="app-education__empty" role="alert">
            <p>No pudimos cargar las publicaciones de Educación Ambiental.</p>
            <button type="button" className="ev-btn ev-btn--outline" onClick={recargar}>
              Reintentar
            </button>
          </div>
        )}

        {status === 'ready' && filteredPublicaciones.length === 0 && (
          <div className="app-education__empty" role="status">
            <p>No encontramos publicaciones con esa búsqueda. Prueba con otra palabra o categoría.</p>
            {isAdmin && (
              <button type="button" className="ev-btn ev-btn--solid" onClick={handleCreate}>
                <Icon name="edit" size={15} /> Crear publicación
              </button>
            )}
          </div>
        )}

        {status === 'ready' && filteredPublicaciones.length > 0 && (
          <div className="app-education__grid">
            {filteredPublicaciones.map((publicacion) => (
              <article className="app-education-card" key={publicacion.id}>
                <Link
                  className="app-education-card__link"
                  to={detailPath(publicacion.id)}
                  aria-label={`Ver publicación: ${publicacion.titulo}`}
                >
                  <div className="app-education-card__image-wrap">
                    {publicacion.imagen ? (
                      <img src={publicacion.imagen} alt={publicacion.titulo} loading="lazy" />
                    ) : (
                      <div className="app-education-card__image-placeholder" aria-hidden="true">
                        <Icon name="book" size={30} />
                      </div>
                    )}
                    <span className="app-education-card__category">{publicacion.categoria}</span>
                  </div>
                  <div className="app-education-card__body">
                    <h2>{publicacion.titulo}</h2>
                    <p>{publicacion.texto}</p>
                    <span className="app-education-card__details">
                      Ver información <span>→</span>
                    </span>
                  </div>
                </Link>

                {isAdmin && (
                  <div className="app-education-card__admin">
                    <button
                      type="button"
                      className="admin-card-btn admin-card-btn--edit"
                      onClick={() => handleEdit(publicacion)}
                      aria-label={`Editar ${publicacion.titulo}`}
                    >
                      <Icon name="edit" size={15} />
                    </button>
                    <button
                      type="button"
                      className="admin-card-btn admin-card-btn--delete"
                      onClick={() => handleDelete(publicacion)}
                      aria-label={`Eliminar ${publicacion.titulo}`}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                )}
              </article>
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
    </div>
  );
}
