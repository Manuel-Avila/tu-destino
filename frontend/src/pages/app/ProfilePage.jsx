import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
// Asumo que tu Icon y SectionHeading los sigues usando o los reemplazas por Material Symbols
import Icon from '../../components/events/EventIcons';
import ProfileEditModal from '../../components/profile/ProfileEditModal';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import { destinationsData } from '../../data/destinations';
import { eliminarResena, getMisResenas } from '../../services/resenas.service';
import { getEventos, getMisInscripciones } from '../../services/eventos.service';
import { axiosInstance } from '../../api/axios';
import { useSavedEvents } from '../../hooks/useSavedEvents';
import { useSavedDestinations } from '../../hooks/useSavedDestinations';
import { parseFecha } from '../../components/events/eventUtils';
import './profile.css';

// "2026-10-24" -> "24 OCT"
function badgeFecha(fecha) {
  if (!fecha) return '';
  const d = parseFecha(fecha);
  const mes = d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '').toUpperCase();
  return `${d.getDate()} ${mes}`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
});

// Botones para cambiar entre las dos listas de un panel.
function PanelTabs({ tabs, active, onChange, label }) {
  return (
    <div className="profile-tabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`profile-tab ${active === tab.id ? 'is-active' : ''}`.trim()}
          onClick={() => onChange(tab.id)}
        >
          <Icon name={tab.icon} size={15} /> {tab.label}
          <span className="profile-tab__count">{tab.count}</span>
        </button>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const changePassword = useAuthStore((state) => state.changePassword);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { saved, toggle } = useSavedEvents();
  const { saved: savedDestIds, toggle: toggleDest } = useSavedDestinations();

  const [reviews, setReviews] = useState([]);
  const [reviewsStatus, setReviewsStatus] = useState('loading'); // loading | ready | error
  const [allEvents, setAllEvents] = useState([]);
  const [attendingSlugs, setAttendingSlugs] = useState([]);
  const [allDestinos, setAllDestinos] = useState([]);
  const [destTab, setDestTab] = useState('guardados'); // guardados | resenas
  const [eventTab, setEventTab] = useState('guardados'); // guardados | asistire
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

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

  // Eventos (para guardados y para "Voy a asistir") y destinos (para guardados y nombres de reseñas).
  useEffect(() => {
    let cancelled = false;
    getEventos().then((all) => !cancelled && setAllEvents(all)).catch(() => {});
    getMisInscripciones().then((slugs) => !cancelled && setAttendingSlugs(slugs)).catch(() => {});
    axiosInstance
      .get('/api/destinos')
      .then((res) => !cancelled && setAllDestinos(res.data.destinos || res.data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const savedEvents = allEvents.filter((e) => saved.includes(e.slug));
  const attendingEvents = allEvents.filter((e) => attendingSlugs.includes(e.slug));
  const savedDestinos = allDestinos.filter((d) => savedDestIds.includes(d.id));

  const destinationName = (id) =>
    allDestinos.find((d) => d.id === id)?.name || destinationsData.find((d) => d.id === id)?.name || id;
  const displayName = user?.fullName?.trim() || 'Explorador';
  const initial = displayName.slice(0, 1).toUpperCase();
  const memberSince = user?.createdAt ? formatDate(user.createdAt) : '—';
  const userLocation = user?.location?.trim();
  const avatarUrl = user?.avatarUrl;
  const visitedCount = new Set(reviews.map((review) => review.destinoId)).size;
  const explorerBadge = reviews.length > 0 ? 'Eco-Explorador' : 'Nuevo explorador';
  const passwordStatus = user?.passwordUpdatedAt
    ? `Actualizada el ${formatDate(user.passwordUpdatedAt)}`
    : 'Aún no has cambiado tu contraseña';

  async function handleDelete(review) {
    if (!window.confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) return;
    try {
      await eliminarResena(review.id);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch {
      window.alert('No se pudo eliminar la reseña. Intenta de nuevo.');
    }
  }

  function openEditModal() {
    setEditOpen(true);
  }

  function openPasswordModal() {
    setPasswordOpen(true);
  }

  async function handleProfileSave(formData) {
    await updateProfile(formData);
    setEditOpen(false);
    Toast.fire({ icon: 'success', title: 'Perfil actualizado correctamente' });
  }

  async function handlePasswordSave(payload) {
    await changePassword(payload);
    setPasswordOpen(false);
    Toast.fire({ icon: 'success', title: 'Contraseña actualizada correctamente' });
  }

  return (
    <main className="profile-page bg-surface text-on-surface">
      <div className="profile-container">
        
        {/* Navegación y Encabezado */}
        <nav aria-label="Ruta de navegación" className="profile-breadcrumb">
          <Link to="/app" className="breadcrumb-link">
            <Icon name="home" size={16} /> Inicio
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
              <Icon name="shield" size={15} /> Cuenta activa
            </div>
          </div>
          <div className="profile-hero-content">
            <div className="profile-hero-identity">
              <div className="profile-avatar-wrapper">
                <div className={`profile-avatar ${avatarUrl ? 'profile-avatar--image' : ''}`.trim()}>
                  {avatarUrl ? <img src={avatarUrl} alt={`Foto de ${displayName}`} /> : initial}
                </div>
                <button
                  aria-label="Cambiar foto de perfil"
                  className="btn-camera"
                  type="button"
                  onClick={openEditModal}
                >
                  <Icon name="camera" size={16} />
                </button>
              </div>
              <div className="profile-user-info">
                <div className="profile-name-row">
                  <h2>{displayName}</h2>
                  <span className="badge-eco">
                    <Icon name="leaf" size={14} />
                    {explorerBadge}
                  </span>
                </div>
                <p className="user-email"><Icon name="mail" size={16} /> {user?.email || 'Sin correo registrado'}</p>
                <div className="user-meta">
                  <span><Icon name="pin" size={15} /> {userLocation || 'Ubicación no definida'}</span>
                  <span className="dot-divider">•</span>
                  <span><Icon name="calendar" size={15} /> Miembro desde {memberSince}</span>
                </div>
                {user?.bio && <p className="profile-bio">{user.bio}</p>}
              </div>
            </div>

            <div className="profile-hero-actions">
              <div className="profile-stats">
                <div className="stat-box">
                  <strong>{reviews.length}</strong><span>Reseñas</span>
                </div>
                <div className="stat-box">
                  <strong className="text-secondary">{saved.length + savedDestIds.length}</strong><span>Guardados</span>
                </div>
                <div className="stat-box">
                  <strong>{visitedCount}</strong><span>Visitados</span>
                </div>
              </div>
              <button className="btn-primary" type="button" onClick={openEditModal}>
                <Icon name="edit" size={17} /> Editar datos personales
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
                    <div className="setting-icon">
                      <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={18} />
                    </div>
                    <div>
                      <strong>Modo oscuro</strong>
                      <small>
                        {theme === 'dark'
                          ? 'Activado: interfaz en tonos oscuros.'
                          : 'Desactivado: interfaz en tonos claros.'}
                      </small>
                    </div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={theme === 'dark'}
                    aria-label="Cambiar modo oscuro"
                    className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`.trim()}
                    onClick={toggleTheme}
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
                    <small>{passwordStatus}</small>
                  </div>
                  <button className="btn-outline" type="button" onClick={openPasswordModal}>
                    <Icon name="lock" size={16} /> Cambiar contraseña
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Contenido */}
          <div className="profile-col">
            
            {/* Destinos: guardados y reseñas */}
            <div className="profile-panel card-surface">
              <div className="panel-header-between">
                <div className="panel-header-left">
                  <div className="panel-icon bg-primary-light"><Icon name="pin" size={19} /></div>
                  <div>
                    <h3>Destinos</h3>
                    <p>Tus lugares favoritos y tus opiniones</p>
                  </div>
                </div>
                <Link className="link-action" to="/app/destinos">Ver destinos <Icon name="chevron-right" size={16} /></Link>
              </div>

              <div className="panel-body">
                <PanelTabs
                  label="Destinos"
                  active={destTab}
                  onChange={setDestTab}
                  tabs={[
                    { id: 'guardados', label: 'Destinos guardados', icon: 'heart', count: savedDestinos.length },
                    { id: 'resenas', label: 'Mis reseñas', icon: 'chat', count: reviews.length },
                  ]}
                />

                {destTab === 'guardados' && (
                  savedDestIds.length === 0 ? (
                    <div className="empty-state-small">
                      <p>No has guardado destinos. Toca el corazón en un destino para verlo aquí.</p>
                    </div>
                  ) : (
                    <ul className="event-list">
                      {savedDestinos.map((destino) => (
                        <li key={destino.id} className="event-item">
                          <div className="event-img">
                            <img src={destino.image || destino.images?.[0] || ''} alt={destino.name} loading="lazy" />
                          </div>
                          <div className="event-info">
                            <div className="event-title-row">
                              <div>
                                <span className="badge-tag">{destino.tag || destino.label}</span>
                                <h4><Link to={`/app/destinos/${destino.id}`}>{destino.name}</Link></h4>
                              </div>
                              <button type="button" className="btn-icon-danger" title="Quitar de guardados" aria-label="Quitar de destinos guardados" onClick={() => toggleDest(destino.id)}><Icon name="ban" size={17} /></button>
                            </div>
                            <p className="event-location"><Icon name="pin" size={15} /> <span className="event-location__text">{destino.location}</span></p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )
                )}

                {destTab === 'resenas' && (
                  <>
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
                  </>
                )}
              </div>
            </div>

            {/* Eventos: guardados y a los que asistiré */}
            <div className="profile-panel card-surface">
              <div className="panel-header-between">
                <div className="panel-header-left">
                  <div className="panel-icon bg-secondary-light"><Icon name="bag" size={19} /></div>
                  <div>
                    <h3>Eventos</h3>
                    <p>Voluntariados y talleres programados</p>
                  </div>
                </div>
                <Link className="link-action" to="/app/eventos">Ver agenda completa <Icon name="chevron-right" size={16} /></Link>
              </div>

              <div className="panel-body">
                <PanelTabs
                  label="Eventos"
                  active={eventTab}
                  onChange={setEventTab}
                  tabs={[
                    { id: 'guardados', label: 'Eventos guardados', icon: 'heart', count: savedEvents.length },
                    { id: 'asistire', label: 'Eventos a los que asistiré', icon: 'check', count: attendingEvents.length },
                  ]}
                />

                {(() => {
                  const lista = eventTab === 'guardados' ? savedEvents : attendingEvents;
                  if (lista.length === 0) {
                    return (
                      <div className="empty-state-small">
                        <p>
                          {eventTab === 'guardados'
                            ? 'No has guardado eventos. Explora la agenda para participar.'
                            : 'Aún no te has inscrito a ningún evento. Abre un evento y llena el formulario de inscripción.'}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <ul className="event-list">
                      {lista.map((evento) => (
                        <li key={evento.id} className="event-item">
                          <div className="event-img">
                            <img src={evento.imagenes?.[0] || ''} alt={evento.tituloEvento} loading="lazy" />
                            <span className="event-date-badge">{badgeFecha(evento.fecha)}</span>
                          </div>
                          <div className="event-info">
                            <div className="event-title-row">
                              <div>
                                <span className="badge-tag">{eventTab === 'guardados' ? 'Evento Ecológico' : 'Inscrito ✓'}</span>
                                <h4><Link to={`/app/eventos/${evento.slug}`}>{evento.tituloEvento}</Link></h4>
                              </div>
                              {eventTab === 'guardados' && (
                                <button type="button" className="btn-icon-danger" title="Quitar de guardados" aria-label="Quitar de guardados" onClick={() => toggle(evento.slug)}><Icon name="ban" size={17} /></button>
                              )}
                            </div>
                            <p className="event-location"><Icon name="pin" size={15} /> <span className="event-location__text">{evento.lugarEvento}, {evento.localidad}</span></p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                })()}

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

      <ProfileEditModal
        isOpen={editOpen}
        user={user}
        onClose={() => setEditOpen(false)}
        onSave={handleProfileSave}
      />

      <ChangePasswordModal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSave={handlePasswordSave}
      />
    </main>
  );
}