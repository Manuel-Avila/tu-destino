import SectionHeading from '../SectionHeading';
import { destinationsData } from '../../data/destinations';
import './DestinationsTab.css';

export default function DestinationsTab() {
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

      {/* Grid de Destinos del Catálogo */}
      <div className="destinations-catalog-grid">
        {destinationsData.map((destination) => (
          <article
            className="catalog-card"
            key={destination.id}
            style={{ backgroundImage: `url(${destination.image})` }}
          >
            <div className="catalog-card__content">
              <div className="catalog-card__top">
                <span className="catalog-card__label">{destination.label}</span>
              </div>
              <h3>{destination.name}</h3>
              <p className="dest-location">📍 {destination.location}</p>
              <p className="dest-description">{destination.description}</p>

              <div className="catalog-card__details">
                <div className="dest-rules">
                  <strong>Reglas de preservación:</strong>
                  <ul>
                    {destination.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <p className="dest-activities">
                  <strong>Actividades sustentables:</strong> {destination.bestActivities}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
