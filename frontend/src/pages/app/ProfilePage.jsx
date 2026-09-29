import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import SectionHeading from '../../components/SectionHeading';
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
    <section className="profile-page" aria-label="Perfil">
      <div className="section-header-wrap">
        <SectionHeading eyebrow="TU CUENTA" title="Mi perfil" className="home-destinations__heading" />
      </div>

      <div className="profile-card">
        <span className="profile-card__avatar" aria-hidden="true">
          {(user?.fullName || '?').trim().slice(0, 1).toUpperCase()}
        </span>
        <div>
          <h3>{user?.fullName}</h3>
          <p>{user?.email}</p>
          {user?.createdAt && <p className="profile-card__since">Miembro desde {formatDate(user.createdAt)}</p>}
        </div>
      </div>

      <div className="profile-block">
        <h3>Mis reseñas</h3>
        {reviewsStatus === 'loading' && <p className="profile-muted" role="status">Cargando…</p>}
        {reviewsStatus === 'error' && <p className="profile-muted" role="alert">No pudimos cargar tus reseñas.</p>}
        {reviewsStatus === 'ready' && reviews.length === 0 && (
          <p className="profile-muted">
            Todavía no has publicado reseñas. <Link to="/app/destinos">Explora los destinos</Link> y cuéntanos tu experiencia.
          </p>
        )}
        <ul className="profile-list">
          {reviews.map((review) => (
            <li key={review.id} className="profile-item">
              <div className="profile-item__top">
                <Link to={`/app/destinos/${review.destinoId}`}><strong>{destinationName(review.destinoId)}</strong></Link>
                <span className="profile-item__stars" aria-label={`${review.rating} de 5 estrellas`}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
              </div>
              <p>{review.comment}</p>
              <div className="profile-item__bottom">
                <span className="profile-muted">Publicada el {formatDate(review.createdAt)}</span>
                <button type="button" className="profile-item__delete" onClick={() => handleDelete(review)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="profile-block">
        <h3>Mis eventos guardados</h3>
        {saved.length === 0 ? (
          <p className="profile-muted">
            No has guardado eventos. Marca el corazón en <Link to="/app/eventos">Eventos ecológicos</Link>.
          </p>
        ) : (
          <ul className="profile-list">
            {savedEvents.map((evento) => (
              <li key={evento.id} className="profile-item">
                <Link to={`/app/eventos/${evento.slug}`}><strong>{evento.tituloEvento}</strong></Link>
                <span className="profile-muted">{evento.lugarEvento}, {evento.localidad}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
