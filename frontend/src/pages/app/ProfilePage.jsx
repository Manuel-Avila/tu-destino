import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
// Asumo que tu Icon y SectionHeading los sigues usando o los reemplazas por Material Symbols
import Icon from '../../components/events/EventIcons'; 
import { destinationsData } from '../../data/destinations';
import { eliminarResena, getMisResenas } from '../../services/resenas.service';
import { getEventos } from '../../services/eventos.service';
import { useSavedEvents } from '../../hooks/useSavedEvents';
import './profile.css';

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const { saved } = useSavedEvents();

  const [reviews, setReviews] = useState([]);
  const [reviewsStatus, setReviewsStatus] = useState('loading'); // loading | ready | error
  const [savedEvents, setSavedEvents] = useState([]);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMisResenas()
      .then((data) => {
        if (cancelled) return;
        setReviews(data);
        setReviewsStatus('ready');
      })
      .catch(() => !cancelled && setReviewsStatus('error'));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (saved.length === 0) return undefined;
    getEventos()
      .then((all) => !cancelled && setSavedEvents(all.filter((e) => saved.includes(e.slug))))
      .catch(() => !cancelled && setSavedEvents([]));
    return () => {
      cancelled = true;
    };
  }, [saved]);

  const destinationName = (id) => destinationsData.find((d) => d.id === id)?.name || id;
  const firstName = user?.fullName?.trim().split(' ')[0] || 'Explorador';
  const initial = (user?.fullName || '?').trim().slice(0, 1).toUpperCase();

  async function handleDelete(review) {
    if (!window.confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) return;
    try {
      await eliminarResena(review.id);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch {
      window.alert('No se pudo eliminar la reseña. Intenta de nuevo.');
    }
  }

  return (
    <main className="profile-page bg-surface text-on-surface">
      <div className="profile-container">
        
        {/* Navegación y Encabezado */}
        <nav aria-label="Ruta de navegación" className="profile-breadcrumb">
          <Link to="/app/cuenta" className="breadcrumb-link">
            <Icon name="user" size={16} /> Tu Cuenta
          </Link>
          <Icon name="chevron-right" size={14} className="divider" />
          <span className="breadcrumb-current">Mi perfil y Configuración</span>
        </nav>

        <div className="profile-header">
          <div className="profile-header-text">
            <div className="profile-eyebrow-container">
              <span className="profile-eyebrow">Panel Personal</span>
              <span className="dot"></span>
              <span className="profile-subtitle">Baja California & Ecoturismo</span>
            </div>
            <h1>Mi perfil</h1>
            <p>Gestiona tu información personal, preferencias de visualización y protocolos de seguridad ambiental y de tu cuenta.</p>
          </div>
        </div>

        {/* Tarjeta de Identidad (Hero) */}
        <section className="profile-hero card-surface">
          <div className="profile-hero-bg">
            <div className="hero-verified">
              <Icon name="shield" size={15} /> Perfil Verificado
            </div>
          </div>
          <div className="profile-hero-content">
            <div className="profile-hero-identity">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">{initial}</div>
                <button aria-label="Cambiar foto de perfil" className="btn-camera" type="button">
                  <Icon name="user" size={16} />
                </button>
              </div>
              <div className="profile-user-info">
                <div className="profile-name-row">
                  <h2>{user?.fullName || firstName}</h2>
                  <span className="badge-eco">
                    <Icon name="leaf" size={14} />
                    Eco-Explorador
                  </span>
                </div>
                <p className="user-email"><Icon name="mail" size={16} /> {user?.email || 'correo@ejemplo.com'}</p>
                <div className="user-meta">
                  <span><Icon name="pin" size={15} /> Baja California, MX</span>
                  <span className="dot-divider">•</span>
                  <span><Icon name="calendar" size={15} /> Miembro desde {user?.createdAt ? formatDate(user.createdAt) : 'Sep 2026'}</span>
                </div>
              </div>
            </div>

            <div className="profile-hero-actions">
              <div className="profile-stats">
                <div className="stat-box">
                  <strong>{reviews.length}</strong><span>Reseñas</span>
                </div>
                <div className="stat-box">
                  <strong className="text-secondary">{saved.length}</strong><span>Guardados</span>
                </div>
                <div className="stat-box">
                  <strong>5</strong><span>Visitados</span>
                </div>
              </div>
              <button className="btn-primary" type="button">
                <Icon name="grid" size={17} /> Editar datos personales
              </button>
            </div>
          </div>
        </section>

        {/* Cuadrícula Principal */}
        <div className="profile-grid">
          {/* Columna Izquierda: Ajustes */}
          <div className="profile-col">
            <div className="profile-panel card-surface">
              <div className="panel-header">
                <div className="panel-icon bg-primary-light"><Icon name="grid" size={19} /></div>
                <div>
                  <h3>Preferencias de visualización</h3>
                  <p>Personaliza tu experiencia cartográfica y de lectura</p>
                </div>
              </div>
              <div className="panel-body">
                <div className="setting-row">
                  <div className="setting-info">
                    <div className="setting-icon"><Icon name="lightbulb" size={18} /></div>
                    <div>
                      <strong>Modo de tema</strong>
                      <small>Tema optimizado para legibilidad bajo luz.</small>
                    </div>
                  </div>
                  <button 
                    role="switch" 
                    aria-checked={highContrast} 
                    className={`toggle-switch ${highContrast ? 'active' : ''}`} 
                    onClick={() => setHighContrast(!highContrast)}
                    type="button"
                  >
                    <span className="toggle-knob"></span>
                  </button>
                </div>
              </div>
            </div>

            <div className="profile-panel card-surface">
              <div className="panel-header">
                <div className="panel-icon bg-secondary-light"><Icon name="shield" size={19} /></div>
                <div>
                  <h3>Seguridad y Acceso</h3>
                  <p>Protege tus credenciales y actividades de voluntariado</p>
                </div>
              </div>
              <div className="panel-body">
                <div className="security-row">
                  <div>
                    <div className="security-title">
                      <strong>Contraseña de acceso</strong>
                      <span className="badge-secure"><span className="dot-secure"></span> Segura</span>
                    </div>
                    <small>Último cambio hace 3 meses</small>
                  </div>
                  <button className="btn-outline" type="button">
                    <Icon name="shield" size={16} /> Cambiar contraseña
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Contenido */}
          <div className="profile-col">
            
            {/* Mis Reseñas */}
            <div className="profile-panel card-surface">
              <div className="panel-header-between">
                <div className="panel-header-left">
                  <div className="panel-icon bg-primary-light"><Icon name="chat" size={19} /></div>
                  <div>
                    <h3>Mis reseñas</h3>
                    <p>Tus opiniones y verificaciones de senderos</p>
                  </div>
                </div>
                <span className="badge-count">{reviews.length} publicadas</span>
              </div>
              
              <div className="panel-body">
                {reviewsStatus === 'loading' && <p className="status-text">Cargando reseñas...</p>}
                {reviewsStatus === 'error' && <p className="status-text error">No pudimos cargar tus reseñas.</p>}
                
                {reviewsStatus === 'ready' && reviews.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><Icon name="chat" size={30} /></div>
                    <h4>Todavía no has publicado reseñas</h4>
                    <p>Comparte tus observaciones sobre la preservación de reservas, estado de senderos y buenas prácticas ambientales en tu último viaje.</p>
                    <Link className="btn-primary" to="/app/destinos">
                      <Icon name="search" size={18} /> Explorar destinos cercanos
                    </Link>
                  </div>
                ) : (
                  <ul className="review-list">
                    {reviews.map((review) => (
                      <li key={review.id} className="review-item">
                        <div className="review-top">
                          <Link to={`/app/destinos/${review.destinoId}`}><strong>{destinationName(review.destinoId)}</strong></Link>
                          <span className="stars" aria-label={`${review.rating} de 5 estrellas`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                        </div>
                        <p>{review.comment}</p>
                        <div className="review-bottom">
                          <span className="review-date">Publicada el {formatDate(review.createdAt)}</span>
                          <button type="button" className="btn-delete" onClick={() => handleDelete(review)}>Eliminar</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Eventos Guardados */}
            <div className="profile-panel card-surface">
              <div className="panel-header-between">
                <div className="panel-header-left">
                  <div className="panel-icon bg-secondary-light"><Icon name="bag" size={19} /></div>
                  <div>
                    <h3>Mis eventos guardados</h3>
                    <p>Voluntariados y talleres programados</p>
                  </div>
                </div>
                <Link className="link-action" to="/app/eventos">Ver agenda completa <Icon name="chevron-right" size={16} /></Link>
              </div>

              <div className="panel-body">
                {saved.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No has guardado eventos. Explora la agenda para participar.</p>
                  </div>
                ) : (
                  <ul className="event-list">
                    {savedEvents.map((evento) => (
                      <li key={evento.id} className="event-item">
                        <div className="event-img">
                          <img src={evento.imagenUrl || 'placeholder.jpg'} alt={evento.tituloEvento} />
                          <span className="event-date-badge">14 OCT</span> {/* Reemplazar con lógica de fecha real si la tienes */}
                        </div>
                        <div className="event-info">
                          <div className="event-title-row">
                            <div>
                              <span className="badge-tag">Evento Ecológico</span>
                              <h4><Link to={`/app/eventos/${evento.slug}`}>{evento.tituloEvento}</Link></h4>
                            </div>
                            <button className="btn-icon-danger" title="Quitar de guardados"><Icon name="ban" size={17} /></button>
                          </div>
                          <p className="event-location"><Icon name="pin" size={15} /> {evento.lugarEvento}, {evento.localidad}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="panel-footer">
                  <Link className="btn-block-outline" to="/app/eventos">
                    <Icon name="search" size={16} /> Explorar más eventos ecológicos
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}