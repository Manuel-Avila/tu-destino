import { Link } from 'react-router-dom';
import Icon from '../events/EventIcons';
import { useAuthStore } from '../../store/authStore';
import './EventsTab.css';
import './AboutTab.css';

// Mismo encabezado (migas + div con título y descripción) que Destinos y Eventos, con o sin sesión.
export default function AboutTab() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  return (
    <div className="ev-tab-wrap">
    <section className="ev-tab about-page" id="acerca-de" aria-label="Acerca de TuDestino">
      <nav className="ev-breadcrumb" aria-label="Ruta de navegación">
        <Link to={isAuthenticated ? '/app' : '/'}><Icon name="building" size={13} /> Inicio</Link>
        <Icon name="chevron-right" size={12} />
        <span className="is-current">Acerca de</span>
      </nav>

      <header className="ev-hero">
        <p className="ev-hero__eyebrow"><Icon name="leaf" size={14} /> NUESTRA MISIÓN</p>
        <h1>Acerca de TuDestino</h1>
        <p className="ev-hero__lead">
          Tecnología ciudadana para la conservación de los ecosistemas marinos de Baja California Sur.
        </p>
      </header>

      <div className="about-grid">
        <div className="about-text-card">
          <h3>¿Quiénes somos?</h3>
          <p>
            TuDestino es un proyecto desarrollado con el compromiso de crear conciencia ecológica y herramientas prácticas para habitantes y turistas en Baja California Sur.
          </p>
          <p>
            Creemos que el turismo y la preservación ambiental pueden convivir cuando los visitantes cuentan con información transparente sobre reglamentos, biodiversidad y un canal directo de reporte ante incidentes ambientales.
          </p>

          <h3>Objetivos Clave</h3>
          <ul className="about-bullets">
            <li><strong>Monitoreo participativo:</strong> Facilitar denuncias ciudadanas de daño ambiental y pesca ilegal.</li>
            <li><strong>Turismo regenerativo:</strong> Educar sobre buenas prácticas antes, durante y después de cada visita.</li>
            <li><strong>Alianzas ambientales:</strong> Canalizar anomalías con inspectores y organizaciones civiles locales.</li>
          </ul>
        </div>

        <div className="about-sidebar">
          <div className="about-info-box">
            <h4>Contacto y Enlaces de Interés</h4>
            <p><strong>Ubicación:</strong> La Paz, Baja California Sur, México.</p>
            <p><strong>Institución:</strong> UABCS - Desarrollo de Proyectos de Software 2026.</p>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
