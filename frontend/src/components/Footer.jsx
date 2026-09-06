import Brand from './Brand';
import './shared.css';

export default function Footer({
  description = 'Turismo responsable para Baja California Sur.',
  backTo = '#inicio',
  links = [],
  legal,
  className = '',
}) {
  return (
    <footer className={`app-footer ${className}`.trim()}>
      <Brand className="app-footer__brand" />
      {links.length > 0 ? (
        <div className="app-footer__links">
          {links.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
        </div>
      ) : <p>{description}</p>}
      {legal ? <p className="app-footer__legal">{legal}</p> : <a href={backTo}>Volver arriba ↑</a>}
    </footer>
  );
}
