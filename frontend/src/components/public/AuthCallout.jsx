import Button from '../Button';

/** Aviso para invitar a iniciar sesión / registrarse (usa .auth-prompt-banner de home.css). */
export default function AuthCallout({ title, text }) {
  return (
    <div className="auth-prompt-banner">
      <div className="auth-prompt-banner__content">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <div className="auth-prompt-banner__actions">
        <Button to="/login">Iniciar sesión</Button>
        <Button to="/register" variant="outline">Registrarse</Button>
      </div>
    </div>
  );
}
