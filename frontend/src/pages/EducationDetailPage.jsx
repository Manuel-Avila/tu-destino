import { Link, Navigate, useParams } from 'react-router-dom';
import Icon from '../components/events/EventIcons';
import { educationResources } from '../data/educationResources';
import '../components/home/EventsTab.css';
import './educationDetail.css';

export default function EducationDetailPage() {
  const { id } = useParams();
  const resource = educationResources.find((item) => String(item.id) === id);
  if (!resource) return <Navigate to="/app/educacion" replace />;

  return (
    <div className="ev-tab-wrap">
      <section className="ev-tab ev-detail education-detail">
        <nav className="ev-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/app"><Icon name="home" size={13} /> Inicio</Link>
          <Icon name="chevron-right" size={12} />
          <Link to="/app/educacion">Educación Ambiental</Link>
          <Icon name="chevron-right" size={12} />
          <span className="is-current">{resource.title}</span>
        </nav>
        <header className="ev-hero education-detail__hero">
          <p className="ev-hero__eyebrow"><Icon name="book" size={14} /> {resource.category}</p>
          <h1>{resource.title}</h1>
          <p className="ev-hero__lead">{resource.description}</p>
        </header>
        <img className="education-detail__image" src={resource.image} alt={resource.imageAlt} />
        <article className="education-detail__content">
          <h2>Acerca de este tema</h2>
          {Array.isArray(resource.detail)
            ? resource.detail.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            : <p>{resource.detail}</p>}
          {resource.actions && (
            <section className="education-detail__actions" aria-labelledby="education-detail-actions-title">
              <h2 id="education-detail-actions-title">Acciones para tu visita</h2>
              <ol>
                {resource.actions.map((action) => (
                  <li key={action.title}><strong>{action.title}.</strong> {action.text}</li>
                ))}
              </ol>
            </section>
          )}
          {resource.reportContacts && (
            <section className="education-detail__contacts" aria-labelledby="education-report-contacts-title">
              <h2 id="education-report-contacts-title">Como alternativa, contacta directamente a PROFEPA</h2>
              <div className="education-detail__contact-grid">
                {resource.reportContacts.map((contact) => (
                  <a key={contact.label} className="education-detail__contact" href={contact.href} target={contact.external ? '_blank' : undefined} rel={contact.external ? 'noreferrer' : undefined}>
                    <strong>{contact.label}</strong>
                    <span>{contact.detail}</span>
                  </a>
                ))}
              </div>
            </section>
          )}
          <aside><strong>Recuerda</strong><p>Cuida cada espacio natural y sigue las indicaciones de las autoridades y del personal local durante tu visita.</p></aside>
          <Link className="ev-btn ev-btn--outline" to="/app/educacion">← Volver a Educación Ambiental</Link>
        </article>
      </section>
    </div>
  );
}
