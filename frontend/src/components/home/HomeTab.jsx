import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../Button';
import SectionHeading from '../SectionHeading';
import ImmersionMap from '../immersion/ImmersionMap';
import { IMMERSION_PLACES } from '../../data/immersion';
import conchalitoImage from '../../assets/conchalito-card.png';
import './HomeTab.css';

// Tarjetas de Inmersión BCS: cada una lleva a su recorrido 360°.
const CARD_STYLE = {
  'malecon-la-paz': { className: 'destination-card--malecon', image: null },
  'playa-conchalito': { className: 'destination-card--conchalito', image: conchalitoImage },
};

// El Inicio es igual con y sin sesión; solo cambia a dónde llevan los botones.
export default function HomeTab() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const basePath = isAuthenticated ? '/app' : '';
  return (
    <div className="tab-view tab-view--inicio">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__content">
          <h1 id="home-title">
            Descubre Baja California Sur.{' '}
            Protege lo que amas.
          </h1>
          <p>
            Únete a nuestra comunidad de viajeros conscientes y guardianes del océano.{' '}
            Explora destinos increíbles mientras contribuyes a la conservación marina.
          </p>
          <div className="home-hero__actions">
            <Button to={isAuthenticated ? '/app/destinos' : '/login'}>
              Explorar destinos
            </Button>
          </div>
        </div>
      </section>

      <section className="home-destinations" id="inmersion" aria-label="Inmersión BCS">
        <SectionHeading eyebrow={null} title="Inmersión BCS" className="home-destinations__heading" />
        <p className="home-destinations__intro">Recorre en 360° los lugares que nos toca cuidar.</p>

        <div className="home-destination-grid">
          {IMMERSION_PLACES.map((place) => {
            const style = CARD_STYLE[place.id] || {};
            return (
              <Link
                className={`destination-card ${style.className || ''}`.trim()}
                key={place.id}
                to={`${basePath}/inmersion/${place.id}`}
                style={style.image ? { backgroundImage: `url(${style.image})` } : undefined}
              >
                <div className="destination-card__content">
                  <span className="destination-card__label">{place.label}</span>
                  <h3>{place.name}</h3>
                  <p>{place.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <ImmersionMap basePath={basePath} />
      </section>
    </div>
  );
}
