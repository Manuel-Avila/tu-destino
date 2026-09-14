import SectionHeading from '../SectionHeading';
import './AboutTab.css';

export default function AboutTab() {
  return (
    <section className="home-about" id="acerca-de" aria-label="Acerca de TuDestino">
      <div className="section-header-wrap">
        <SectionHeading
          eyebrow="NUESTRA MISIÓN"
          title="Acerca de TuDestino"
          className="home-destinations__heading"
        />
        <p className="home-destinations__intro">
          Tecnología ciudadana para la conservación de los ecosistemas marinos de Baja California Sur.
        </p>
      </div>

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
  );
}
