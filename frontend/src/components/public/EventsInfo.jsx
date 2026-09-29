import SectionHeading from '../SectionHeading';
import AuthCallout from './AuthCallout';
import '../home/DestinationsTab.css';

/** Versión informativa de Eventos (antes de iniciar sesión): sin listado ni inscripción. */
export default function EventsInfo() {
  return (
    <section className="destinations-tab-section" aria-label="Eventos ecológicos y voluntariado">
      <div className="section-header-wrap">
        <SectionHeading
          eyebrow="INICIATIVAS COMUNITARIAS Y CIENCIA CIUDADANA"
          title="Eventos Ecológicos y Voluntariado en B.C.S."
          className="home-destinations__heading"
        />
        <p className="home-destinations__intro">
          Jornadas de limpieza de costas, reforestación de manglares y monitoreo comunitario de especies
          protegidas en santuarios marinos.
        </p>
      </div>

      <div className="tab-info-explainer">
        <div className="info-badge">Información de la sección</div>
        <h3>¿Qué encontrarás en Eventos ecológicos?</h3>
        <div className="info-steps-grid">
          <div className="info-step-card">
            <div className="info-step-card__num">1</div>
            <h4>Jornadas de conservación</h4>
            <p>Limpieza de playas, reforestación de manglares, monitoreo de fauna y talleres de educación ambiental.</p>
          </div>
          <div className="info-step-card">
            <div className="info-step-card__num">2</div>
            <h4>Organizadas por expertos</h4>
            <p>Cada evento indica quién lo organiza, dónde y cuándo es, qué incluye y qué debes llevar.</p>
          </div>
          <div className="info-step-card">
            <div className="info-step-card__num">3</div>
            <h4>Cupos y convocatoria</h4>
            <p>Consulta los lugares disponibles y confirma tu asistencia a través del formulario de cada jornada.</p>
          </div>
        </div>
      </div>

      <AuthCallout
        title="Inicia sesión para ver los eventos disponibles"
        text="Con tu cuenta puedes explorar el calendario completo, guardar tus eventos favoritos e inscribirte."
      />
    </section>
  );
}
