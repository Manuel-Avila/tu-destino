import { Link } from 'react-router-dom';
import SectionHeading from '../SectionHeading';
import Icon from '../events/EventIcons';
import AuthCallout from '../public/AuthCallout';
import { destinationsData } from '../../data/destinations';
import './EventsTab.css';
import './DestinationsTab.css';

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

function CatalogGrid() {
  return (
    <div className="destinations-catalog-grid">
      {destinationsData.map((destination) => (
        <div
          className="catalog-card"
          key={destination.id}
          style={{ backgroundImage: `url(${destination.image})` }}
        >
          <span className="catalog-card__badge">{destination.tag || destination.label}</span>

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

// locked = antes de iniciar sesión: solo se muestra la información de la sección.
// Con sesión, usa el mismo formato de contenedor que Eventos ecológicos.
export default function DestinationsTab({ locked = false }) {
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
            <p className="ev-hero__eyebrow"><Icon name="pin" size={14} /> ÁREAS NATURALES PROTEGIDAS</p>
            <h1>Destinos de Baja California Sur</h1>
            <p className="ev-hero__lead">
              Explora playas, arrecifes y santuarios marinos de alto valor ecológico. Conoce su estatus de
              protección, sus reglas de visita y las actividades de bajo impacto que te permiten disfrutarlos
              sin alterar sus hábitats.
            </p>
          </header>

          <CatalogGrid />
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
