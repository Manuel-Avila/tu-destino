import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Icon from '../components/events/EventIcons';
import { getPublicacion } from '../services/educacion.service';
import '../components/home/EventsTab.css';
import './educationDetail.css';

export default function EducationDetailPage({ variant = 'app' }) {
  const { id } = useParams();
  const [publicacion, setPublicacion] = useState(null);
  const [status, setStatus] = useState('loading');

  const isApp = variant === 'app';
  const homePath = isApp ? '/app' : '/';
  const backPath = isApp ? '/app/educacion' : '/educacion';

  useEffect(() => {
    let cancelled = false;

    getPublicacion(id)
      .then((data) => {
        if (!cancelled) {
          setPublicacion(data);
          setStatus('ready');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus(err.status === 404 ? 'notfound' : 'error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'notfound') return <Navigate to={backPath} replace />;

  if (status === 'loading') {
    return (
      <div className="ev-tab-wrap">
        <section className="ev-tab ev-detail education-detail">
          <div className="education-detail__state" role="status">Cargando publicación...</div>
        </section>
      </div>
    );
  }

  if (status === 'error' || !publicacion) {
    return (
      <div className="ev-tab-wrap">
        <section className="ev-tab ev-detail education-detail">
          <div className="education-detail__state" role="alert">
            <p>No pudimos cargar esta publicación.</p>
            <Link className="ev-btn ev-btn--outline" to={backPath}>
              ← Volver a Educación Ambiental
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const paragraphs = publicacion.texto
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="ev-tab-wrap">
      <section className="ev-tab ev-detail education-detail">
        <nav className="ev-breadcrumb" aria-label="Ruta de navegación">
          <Link to={homePath}>
            <Icon name="building" size={13} /> Inicio
          </Link>
          <Icon name="chevron-right" size={12} />
          <Link to={backPath}>Educación Ambiental</Link>
          <Icon name="chevron-right" size={12} />
          <span className="is-current">{publicacion.titulo}</span>
        </nav>

        <header className="ev-hero education-detail__hero">
          <p className="ev-hero__eyebrow">
            <Icon name="book" size={14} /> {publicacion.categoria}
          </p>
          <h1>{publicacion.titulo}</h1>
        </header>

        {publicacion.imagen && (
          <img
            className="education-detail__image"
            src={publicacion.imagen}
            alt={publicacion.titulo}
          />
        )}

        <article className="education-detail__content">
          <h2>Acerca de este tema</h2>
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p>{publicacion.texto}</p>
          )}

          <aside>
            <strong>Recuerda</strong>
            <p>
              Cuida cada espacio natural y sigue las indicaciones de las autoridades y del personal
              local durante tu visita.
            </p>
          </aside>

          <Link className="ev-btn ev-btn--outline" to={backPath}>
            ← Volver a Educación Ambiental
          </Link>
        </article>
      </section>
    </div>
  );
}
