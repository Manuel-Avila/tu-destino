import SectionHeading from '../SectionHeading';
import './ReportsTab.css';

export default function ReportsTab() {
  return (
    <section className="home-reports" id="reportes" aria-label="Reportes ambientales">
      <div className="section-header-wrap">
        <SectionHeading
          eyebrow="VIGILANCIA CIUDADANA"
          title="Sistema de Reportes Ambientales"
          className="home-destinations__heading"
        />
        <p className="home-destinations__intro">
          Protegiendo las costas de Baja California Sur a través de la denuncia y vigilancia ciudadana activa.
        </p>
      </div>

      <div className="tab-info-explainer">
        <div className="info-badge">Información del Sistema de Reportes</div>
        <h3>¿Qué se puede reportar en TuDestino?</h3>
        <p className="info-desc-lead">
          El sistema de reportes es una herramienta ciudadana diseñada para documentar incidencias que atenten contra la biodiversidad marina y terrestre de BCS.
        </p>

        <div className="reports-info-grid">
          <div className="report-info-card">
            <h4>1. Contaminación y Residuos</h4>
            <p>
              Acumulación de basura en playas protegidas, vertidos no tratados al mar o fogatas no autorizadas en áreas de anidación.
            </p>
          </div>

          <div className="report-info-card">
            <h4>2. Pesca Ilegal o en Zona Núcleo</h4>
            <p>
              Embarcaciones extrayendo especies dentro de polígonos restringidos de no pesca en Cabo Pulmo o uso de artes prohibidas.
            </p>
          </div>

          <div className="report-info-card">
            <h4>3. Daño a Corales o Manglar</h4>
            <p>
              Anclajes sobre arrecifes vivos, corte o afectación a manglares protegidos y tránsito de vehículos sobre dunas costeras.
            </p>
          </div>

          <div className="report-info-card">
            <h4>4. Acoso a Fauna Marina</h4>
            <p>
              Acoso de embarcaciones a tiburón ballena, perturbación a colonias de lobos marinos o saqueo de nidos de tortugas en BCS.
            </p>
          </div>
        </div>

        <div className="report-workflow-box">
          <h4>Flujo de atención ciudadana</h4>
          <div className="workflow-steps">
            <div className="workflow-step">
              <span className="step-badge">Paso 1</span>
              <strong>Documentación</strong>
              <p>Registro de descripción precisa, coordenadas o playa en BCS y evidencia visual del suceso.</p>
            </div>
            <div className="workflow-step">
              <span className="step-badge">Paso 2</span>
              <strong>Folio y Prioridad</strong>
              <p>Generación de folio único de seguimiento y clasificación según nivel de urgencia ambiental.</p>
            </div>
            <div className="workflow-step">
              <span className="step-badge">Paso 3</span>
              <strong>Canalización</strong>
              <p>Notificación a brigadas comunitarias y autoridades competentes (PROFEPA y CONANP).</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
