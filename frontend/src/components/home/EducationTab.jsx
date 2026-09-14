import SectionHeading from '../SectionHeading';
import './EducationTab.css';

export default function EducationTab() {
  return (
    <section className="home-education" id="educacion" aria-label="Educación ambiental">
      <div className="section-header-wrap">
        <SectionHeading
          eyebrow="CONCIENCIA Y PRESERVACIÓN"
          title="Educación Ambiental"
          className="home-destinations__heading"
        />
        <p className="home-destinations__intro">
          Conoce cómo convivir armónicamente con la vida marina y los ecosistemas costeros del Golfo de California.
        </p>
      </div>

      {/* Explicador informativo de lo que se puede hacer */}
      <div className="tab-info-explainer">
        <div className="info-badge">Información de la sección</div>
        <h3>¿Qué puedes aprender en Educación Ambiental?</h3>
        <div className="info-steps-grid">
          <div className="info-step-card">
            <div className="info-step-card__num">1</div>
            <h4>Decálogo del Turista Consciente</h4>
            <p>
              Pautas indispensables para disfrutar de las costas de BCS sin dejar huella ecológica ni alterar especies protegidas.
            </p>
          </div>
          <div className="info-step-card">
            <div className="info-step-card__num">2</div>
            <h4>Protección de Arrecifes y Manglares</h4>
            <p>
              Descubre por qué los protectores solares químicos dañan corales y cuáles son las alternativas Reef-Safe autorizadas.
            </p>
          </div>
          <div className="info-step-card">
            <div className="info-step-card__num">3</div>
            <h4>Convivencia Respetuosa con la Fauna</h4>
            <p>
              Aprende las distancias mínimas y protocolos oficiales de avistamiento para tiburón ballena, lobos marinos y tortugas.
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Educativo General */}
      <div className="education-content-grid">
        <div className="edu-guide-card">
          <h4>1. Protección de Arrecifes de Coral</h4>
          <p>
            Los corales son colonias de animales vivos muy sensibles. Tocar un coral o pisarlo con aletas destruye décadas de crecimiento en segundos. Nunca apoyes tus pies en el fondo marino.
          </p>
        </div>

        <div className="edu-guide-card">
          <h4>2. Los Manglares: Pulmones y Cunas</h4>
          <p>
            En Balandra, el manglar rojo retiene carbono, filtra el agua y protege a los alevines de peces. Está estrictamente prohibido talar ramas, tirar anclas o amarrar embarcaciones a sus raíces.
          </p>
        </div>

        <div className="edu-guide-card">
          <h4>3. Avistamiento Ético de Fauna</h4>
          <p>
            Al nadar cerca del tiburón ballena o lobos marinos en La Paz, guarda al menos 3 metros de separación. No uses flash subacuático ni intentes montar o sujetar a los animales.
          </p>
        </div>

        <div className="edu-guide-card">
          <h4>4. Política de Basura Cero</h4>
          <p>
            El viento en BCS puede llevar bolsas y envases al mar rápidamente. Llévate de regreso todos tus residuos y, si ves basura dejada por otros, ayuda a recogerla.
          </p>
        </div>
      </div>
    </section>
  );
}
