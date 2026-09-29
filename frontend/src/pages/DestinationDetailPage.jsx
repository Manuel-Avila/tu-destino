import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { crearResena, eliminarResena, getResenasDestino } from '../services/resenas.service';
import ImageCarousel from '../components/ImageCarousel';
import { destinationsData } from '../data/destinations';
import './destinationDetail.css';

// Fix para el icono por default de Leaflet en React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function StarRating({ rating, size = 'md' }) {
  const rounded = Math.round(rating);
  return (
    <span className={`stars stars--${size}`} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rounded ? 'is-filled' : 'is-empty'}>★</span>
      ))}
    </span>
  );
}

function ratingLabel(rating) {
  if (rating >= 4.5) return 'Calificación Excelente';
  if (rating >= 4) return 'Calificación Muy Buena';
  if (rating >= 3) return 'Calificación Buena';
  return 'Calificación Regular';
}

const emptyForm = { rating: 5, activity: '', date: '', comment: '' };

function monthYear(dateStr) {
  return new Date(`${dateStr.slice(0, 10)}T00:00:00`).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}

// Reseña que viene de la base de datos -> forma que pinta la tarjeta.
function toCardReview(r) {
  return {
    id: r.id,
    mine: r.mine,
    name: r.mine ? `${r.name} (tú)` : r.name,
    initials: r.initials,
    rating: r.rating,
    comment: r.comment,
    activity: r.activity || 'Visitante',
    date: r.visitDate ? `Visitó en ${monthYear(r.visitDate)}` : `Publicada en ${monthYear(r.createdAt)}`,
  };
}

function DestinationDetail({ id }) {
  const destination = destinationsData.find((item) => item.id === id);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Reseñas guardadas en la base de datos (persisten para siempre).
  const [dbReviews, setDbReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, suma: 0 });
  const [reviewsStatus, setReviewsStatus] = useState('loading'); // loading | ready | error
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const destinationId = destination?.id;

  const loadReviews = useCallback(() => {
    if (!destinationId) return Promise.resolve();
    return getResenasDestino(destinationId)
      .then((data) => {
        setDbReviews(data.resenas);
        setStats(data.stats);
        setReviewsStatus('ready');
      })
      .catch(() => setReviewsStatus('error'));
  }, [destinationId]);

  useEffect(() => {
    // Al cambiar de destino se vuelve a pedir la lista (la ruta reutiliza el componente).
    loadReviews();
  }, [loadReviews]);

  // Calificación combinada: la base del catálogo + las reseñas reales de usuarios.
  const summary = useMemo(() => {
    if (!destination) return { rating: 0, count: 0 };
    const count = destination.reviewCount + stats.total;
    const rating = count > 0 ? (destination.rating * destination.reviewCount + stats.suma) / count : destination.rating;
    return { rating, count };
  }, [destination, stats]);

  if (!destination) {
    return <Navigate to="/app/destinos" replace />;
  }

  const handleShare = async () => {
    const shareData = {
      title: destination.name,
      text: destination.description,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // el usuario canceló el share, no se hace nada
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles.');
    }
  };

  const mapsUrl = destination.coordinates
    ? `https://www.google.com/maps?q=${destination.coordinates[0]},${destination.coordinates[1]}`
    : null;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim() || submitting) return;
    setFormError('');
    setSubmitting(true);
    try {
      const created = await crearResena(destination.id, {
        rating: Number(form.rating),
        activity: form.activity.trim(),
        visitDate: form.date,
        comment: form.comment.trim(),
      });
      setDbReviews((prev) => [created, ...prev]);
      setStats((prev) => ({ total: prev.total + 1, suma: prev.suma + created.rating }));
      setForm(emptyForm);
    } catch (err) {
      const first = err.fieldErrors && Object.values(err.fieldErrors)[0];
      setFormError(first || err.message || 'No se pudo publicar la reseña.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (review) => {
    if (!window.confirm('¿Eliminar tu reseña? Esta acción no se puede deshacer.')) return;
    try {
      await eliminarResena(review.id);
      setDbReviews((prev) => prev.filter((r) => r.id !== review.id));
      setStats((prev) => ({ total: Math.max(0, prev.total - 1), suma: Math.max(0, prev.suma - review.rating) }));
    } catch (err) {
      setFormError(err.message || 'No se pudo eliminar la reseña.');
    }
  };

  const allReviews = [...dbReviews.map(toCardReview), ...destination.reviews];

  return (
    <div className="destination-detail-page">
      <div className="destination-detail">
        <nav className="destination-detail__breadcrumb" aria-label="Ruta de navegación">
          <Link to="/app">Inicio</Link>
          <span>/</span>
          <Link to="/app/destinos">Destinos</Link>
          <span>/</span>
          <span>{destination.location}</span>
          <span>/</span>
          <span className="is-current">{destination.name}</span>
        </nav>

        <div className="destination-detail__badges">
          <span className="destination-detail__badge">{destination.label}</span>
        </div>

        <div className="destination-detail__heading">
          <div>
            <h1>{destination.name}</h1>
            <p className="destination-detail__location">📍 {destination.location}</p>
            {typeof destination.rating === 'number' && (
              <p className="destination-detail__rating">
                <StarRating rating={summary.rating} />
                <strong>{summary.rating.toFixed(1)}</strong>
                <span>{summary.count} evaluaciones</span>
              </p>
            )}
          </div>
          <div className="destination-detail__actions">
            <button type="button" className="detail-btn detail-btn--outline" onClick={handleShare}>
              ↗ Compartir
            </button>
            <button
              type="button"
              className={`detail-btn detail-btn--outline ${saved ? 'is-active' : ''}`.trim()}
              onClick={() => setSaved((prev) => !prev)}
            >
              {saved ? '♥ Guardado' : '♡ Guardar en favoritos'}
            </button>
          </div>
        </div>

        <div className="destination-detail__hero">
          <ImageCarousel images={destination.images || [destination.image]} title={destination.name} />
        </div>

        <div className="destination-detail__grid">
          <div className="destination-detail__main">
            <section className="detail-section">
              <h2><span className="detail-bar" />Acerca de este paraíso natural</h2>
              <p>{destination.description}</p>
            </section>

            <section className="detail-section">
              <h2><span className="detail-bar" />Reglas de preservación obligatorias</h2>
              <div className="detail-rules-grid">
                {destination.rules.map((rule, idx) => (
                  <div className="detail-rule-card" key={idx}>
                    <span className="detail-rule-card__icon">✔</span>
                    <p>{rule}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h2><span className="detail-bar" />Actividades sustentables permitidas</h2>
              <p>{destination.bestActivities}</p>
            </section>
          </div>

          <aside className="destination-detail__sidebar">
            {destination.coordinates && (
              <div className="detail-card">
                <h3>📍 Ubicación</h3>
                <div className="destination-map-container">
                  <MapContainer
                    center={destination.coordinates}
                    zoom={11}
                    scrollWheelZoom={false}
                    className="destination-map destination-map--large"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={destination.coordinates}></Marker>
                  </MapContainer>
                </div>
                <p className="detail-card__coords">
                  Coordenadas: {destination.coordinates[0].toFixed(4)}°, {destination.coordinates[1].toFixed(4)}°
                </p>
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noreferrer" className="detail-card__link">
                    Abrir en Google Maps ↗
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>

        

        {/* Sección de reseñas */}
        <section className="detail-section reviews-section">
          <h2><span className="detail-bar" />Evaluaciones de la comunidad viajera</h2>

          <div className="reviews-summary">
            <div className="reviews-summary__score">
              <span className="reviews-summary__number">{summary.rating.toFixed(1)}</span>
              <StarRating rating={summary.rating} size="lg" />
              <p className="reviews-summary__label">{ratingLabel(summary.rating)}</p>
              <p className="reviews-summary__count">
                Basado en {summary.count} opiniones de visitantes
              </p>
            </div>

            {destination.ratingBreakdown && (
              <div className="reviews-summary__breakdown">
                {destination.ratingBreakdown.map((item) => (
                  <div className="breakdown-row" key={item.label}>
                    <div className="breakdown-row__top">
                      <span>{item.label}</span>
                      <span>{item.value.toFixed(1)} / 5.0</span>
                    </div>
                    <div className="breakdown-row__track">
                      <div
                        className="breakdown-row__fill"
                        style={{ width: `${(item.value / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form className="review-form" onSubmit={handleReviewSubmit}>
            <h3>Comparte tu experiencia ecológica</h3>
            <p className="review-form__hint">
              Ayuda a otros viajeros a proteger este ecosistema compartiendo consejos de preservación.
            </p>

            <div className="review-form__row">
              <label>
                Tu calificación global
                <div className="review-form__stars">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={value <= form.rating ? 'is-filled' : 'is-empty'}
                      onClick={() => setForm((prev) => ({ ...prev, rating: value }))}
                      aria-label={`${value} estrellas`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="review-form__row review-form__row--split">
              <label>
                ¿Cuándo visitaste?
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </label>
              <label>
                Actividad principal
                <input
                  type="text"
                  placeholder="Ej. Kayak, snorkel, senderismo..."
                  value={form.activity}
                  onChange={(e) => setForm((prev) => ({ ...prev, activity: e.target.value }))}
                />
              </label>
            </div>

            <label className="review-form__row">
              Tu reseña y consejos para futuros visitantes
              <textarea
                rows={4}
                placeholder="Ejemplo: Llegar temprano vale totalmente la pena. No olviden llevar sombrilla reutilizable..."
                value={form.comment}
                onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                required
              />
            </label>

            {formError && <p className="review-form__error" role="alert">{formError}</p>}

            <button type="submit" className="detail-btn detail-btn--solid" disabled={submitting}>
              {submitting ? 'Publicando…' : 'Publicar reseña'}
            </button>
          </form>

          {reviewsStatus === 'loading' && <p className="reviews-state" role="status">Cargando reseñas…</p>}
          {reviewsStatus === 'error' && (
            <p className="reviews-state" role="alert">
              No pudimos cargar las reseñas de la comunidad.{' '}
              <button type="button" className="reviews-state__retry" onClick={() => { setReviewsStatus('loading'); loadReviews(); }}>
                Reintentar
              </button>
            </p>
          )}
          {reviewsStatus === 'ready' && dbReviews.length === 0 && (
            <p className="reviews-state">Aún no hay reseñas de usuarios. ¡Sé la primera persona en compartir tu experiencia!</p>
          )}

          <div className="reviews-list">
            {allReviews.map((review) => (
              <div className={`review-card ${review.mine ? 'is-mine' : ''}`.trim()} key={review.id ? `db-${review.id}` : `seed-${review.name}`}>
                <div className="review-card__top">
                  <div className="review-card__author">
                    <span className="review-card__avatar">{review.initials}</span>
                    <div>
                      <p className="review-card__name">{review.name}</p>
                      <p className="review-card__meta">{review.activity} · {review.date}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="review-card__comment">{review.comment}</p>
                {review.mine && (
                  <button type="button" className="review-card__delete" onClick={() => handleDeleteReview(review)}>
                    Eliminar mi reseña
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
        <Link to="/app/destinos" className="destination-detail__back">Volver a Destinos</Link>
      </div>

    </div>
  );
}

// `key` reinicia el estado (reseñas, formulario) al pasar de un destino a otro.
export default function DestinationDetailPage() {
  const { id } = useParams();
  return <DestinationDetail key={id} id={id} />;
}
