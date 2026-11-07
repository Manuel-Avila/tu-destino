import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Icon from '../components/events/EventIcons';
import PanoramaViewer from '../components/immersion/PanoramaViewer';
import { getImmersionPlace } from '../data/immersion';
import '../components/home/EventsTab.css';
import '../components/immersion/immersion.css';

export default function ImmersionPage() {
  const { id } = useParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const home = isAuthenticated ? '/app' : '/';
  const place = getImmersionPlace(id);

  if (!place) return <Navigate to={home} replace />;
  const hasScenes = place.scenes.length > 0;

  return (
    <div className="ev-tab-wrap">
      <section className="ev-tab" aria-label={`Recorrido 360° de ${place.name}`}>
        <nav className="ev-breadcrumb" aria-label="Ruta de navegación">
          <Link to={home}><Icon name="building" size={13} /> Inicio</Link>
          <Icon name="chevron-right" size={12} />
          <Link to={`${home}#inmersion`}>Inmersión BCS</Link>
          <Icon name="chevron-right" size={12} />
          <span className="is-current">{place.name}</span>
        </nav>

        <header className="ev-hero">
          <div>
            <p className="ev-hero__eyebrow">INMERSIÓN BCS</p>
            <h1>{place.name}</h1>
          </div>
          <p className="ev-hero__lead">{place.description}</p>
        </header>

        {!isAuthenticated ? (
          <div className="immersion-soon">
            <Icon name="lock" size={28} />
            <h2>Inicia sesión para acceder al recorrido</h2>
            <p>Entra a tu cuenta para recorrer {place.name} en 360°.</p>
            <Link
              className="app-button app-button--primary"
              to="/login"
              state={{ from: { pathname: `/app/inmersion/${place.id}` } }}
            >
              Iniciar sesión
            </Link>
          </div>
        ) : hasScenes ? (
          <PanoramaViewer key={place.id} place={place} />
        ) : (
          <div className="immersion-soon">
            <h2>Próximamente</h2>
            <p>Estamos preparando el recorrido 360° de {place.name}. Mientras tanto, puedes explorar Playa Conchalito.</p>
            <Link className="app-button" to={`${home === '/' ? '' : home}/inmersion/playa-conchalito`}>
              Ver Playa Conchalito
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
