import { Link } from 'react-router-dom';
import './auth.css';
import coastHero from '../assets/playa.jpg';
import hoja1 from '../assets/logo.png';
import hoja2 from '../assets/Icon.png';

export default function AuthLayout({ headline, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-visual">
        <img src={coastHero} alt="" className="auth-visual__photo" aria-hidden="true" />
        <div className="auth-visual__tint" aria-hidden="true" />
        <div className="auth-visual__scrim" aria-hidden="true" />

        {/* Clic en el logo o en "TuDestino" regresa al Inicio */}
        <Link to="/" className="auth-visual__brand" aria-label="TuDestino, ir al inicio">
          <img src={hoja1} alt="" className="auth-visual__leaf" />
          <span>TuDestino</span>
        </Link>

        <div className="auth-visual__content">
          <h1>{headline}</h1>

          <div className="auth-visual__stat">
            <img src={hoja2} alt="" className="auth-visual__leaf auth-visual__leaf--small" />
            <span>+1,200 viajeros conscientes ya forman parte.</span>
          </div>
        </div>
      </aside>

      <main className="auth-form-panel">
        <div className="auth-form-panel__inner">{children}</div>
      </main>
    </div>
  );
}