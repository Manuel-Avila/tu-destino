import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/events/EventIcons';
import { educationResources } from '../../data/educationResources';
import '../../components/home/EventsTab.css';
import './AppEducationPage.css';

const CATEGORIES = ['Todos', 'Fauna Marina', 'Biodiversidad', 'Turismo Responsable', 'Guías Prácticas'];

export default function AppEducationPage() {
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    return educationResources.filter((resource) => {
      const matchesCategory = category === 'Todos' || resource.category === category;
      const matchesQuery = !normalizedQuery || `${resource.title} ${resource.description} ${resource.category}`.toLocaleLowerCase('es').includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="ev-tab-wrap">
    <section className="ev-tab app-education" aria-labelledby="app-education-title">
      <nav className="ev-breadcrumb" aria-label="Ruta de navegación">
        <Link to="/app"><Icon name="home" size={13} /> Inicio</Link>
        <Icon name="chevron-right" size={12} />
        <span className="is-current">Educación Ambiental</span>
      </nav>
      <header className="ev-hero app-education__intro">
        <div>
          <p className="ev-hero__eyebrow"><Icon name="book" size={14} /> BIBLIOTECA DIGITAL</p>
          <h1 id="app-education-title">Educación Ambiental</h1>
          <p className="ev-hero__lead">
            Explora nuestros recursos educativos sobre el ecosistema marino de Baja California Sur. Aprende sobre conservación, especies locales y turismo responsable.
          </p>
        </div>
        <label className="app-education__search">
          <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.5 15.5 4.2 4.2" /></svg>
          <span className="app-education__sr-only">Buscar recursos</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar recursos..." />
        </label>
      </header>

      <div className="app-education__filters" aria-label="Filtrar recursos por categoría">
        {CATEGORIES.map((item) => (
          <button key={item} type="button" className={category === item ? 'is-active' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>

      {filteredResources.length ? (
        <div className="app-education__grid">
          {filteredResources.map((resource) => (
            <article className="app-education-card" key={resource.id}>
              <Link className="app-education-card__link" to={`/app/educacion/${resource.id}`} aria-label={`Ver recurso: ${resource.title}`}>
                <div className="app-education-card__image-wrap">
                  <img src={resource.image} alt={resource.imageAlt} loading="lazy" />
                  <span className="app-education-card__category">{resource.category}</span>
                </div>
                <div className="app-education-card__body">
                  <h2>{resource.title}</h2>
                  <p>{resource.description}</p>
                  <span className="app-education-card__details">Ver información </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="app-education__empty" role="status">No encontramos recursos con esa búsqueda. Prueba con otra palabra o categoría.</div>
      )}
    </section>
    </div>
  );
}
