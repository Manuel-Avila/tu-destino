import { Link } from 'react-router-dom';
import Icon from '../events/EventIcons';
import AuthCallout from './AuthCallout';
import '../home/EventsTab.css';

/**
 * Plantilla de las pantallas informativas (antes de iniciar sesión).
 * Todas comparten el mismo formato y proporciones que las de con sesión:
 * migas de pan + div con título y descripción, explicador en 3 pasos y aviso para iniciar sesión / registrarse.
 */
export default function InfoPage({
  id,
  breadcrumb,
  icon,
  eyebrow,
  title,
  lead,
  explainerTitle,
  steps,
  calloutTitle,
  calloutText,
}) {
  return (
    <div className="ev-tab-wrap">
      <section className="ev-tab" id={id} aria-label={title}>
        <nav className="ev-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/"><Icon name="building" size={13} /> Inicio</Link>
          <Icon name="chevron-right" size={12} />
          <span className="is-current">{breadcrumb}</span>
        </nav>

        <header className="ev-hero">
          <p className="ev-hero__eyebrow"><Icon name={icon} size={14} /> {eyebrow}</p>
          <h1>{title}</h1>
          <p className="ev-hero__lead">{lead}</p>
        </header>

        <div className="tab-info-explainer">
          <div className="info-badge">Información de la sección</div>
          <h3>{explainerTitle}</h3>
          <div className="info-steps-grid">
            {steps.map((step, index) => (
              <div className="info-step-card" key={step.title}>
                <div className="info-step-card__num">{index + 1}</div>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        <AuthCallout title={calloutTitle} text={calloutText} />
      </section>
    </div>
  );
}
