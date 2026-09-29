import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../events/EventIcons';
import { useSavedEvents } from '../../hooks/useSavedEvents';
import { getEventos } from '../../services/eventos.service';
import {
  CATEGORIAS,
  claveMes,
  etiquetaCategoria,
  formatDuracion,
  formatFechaCorta,
  formatHora12,
  nombreMes,
  normalizar,
} from '../events/eventUtils';
import './EventsTab.css';

const PAGE_SIZE = 4;

function EventCard({ evento, saved, onToggleSaved }) {
  const { convocatoria: c } = evento;
  const porcentaje = Math.min(100, Math.round((c.cuposOcupados / c.cupoTotal) * 100));
  const organizadores = evento.organizadores.map((o) => o.nombreCorto).join(' & ');
  // La tarjeta reutiliza la descripción del evento (primer párrafo) y solo la recorta con CSS.
  const etiquetas = evento.lineasImpacto.slice(0, 3);

  return (
    <article className="ev-card">
      <Link to={`/app/eventos/${evento.slug}`} className="ev-card__media" tabIndex={-1} aria-hidden="true">
        <img src={evento.imagenes[0]} alt="" loading="lazy" />
        <span className="ev-card__chips">
          <span className="ev-card__category">{etiquetaCategoria(evento.categoria)}</span>
          {evento.insigniaTarjeta && <span className="ev-card__flag">{evento.insigniaTarjeta}</span>}
        </span>
        {evento.etiquetaImagen && <span className="ev-card__place-tag">{evento.etiquetaImagen}</span>}
      </Link>

      <div className="ev-card__body">
        <button
          type="button"
          className={`ev-card__save ${saved ? 'is-saved' : ''}`.trim()}
          onClick={() => onToggleSaved(evento.slug)}
          aria-pressed={saved}
          aria-label={saved ? 'Quitar de Mis Eventos' : 'Guardar en Mis Eventos'}
        >
          <Icon name="heart" size={17} style={saved ? { fill: 'currentColor' } : undefined} />
        </button>

        <p className="ev-card__meta">
          <span><Icon name="pin" size={13} /> {evento.lugarEvento}, {evento.localidad}</span>
          <span className="ev-card__dot" aria-hidden="true">•</span>
          <span>
            <Icon name="clock" size={13} /> {formatFechaCorta(evento.fecha)} · {formatHora12(evento.horaInicio)} ({formatDuracion(evento.duracionHoras)})
          </span>
        </p>

        <h3 className="ev-card__title">
          <Link to={`/app/eventos/${evento.slug}`}>{evento.tituloEvento}</Link>
        </h3>

        <p className="ev-card__summary">{evento.resumen}</p>

        <ul className="ev-tags" aria-label="Líneas de impacto">
          {etiquetas.map((t) => (
            <li key={t.etiqueta} className={t.destacada ? 'is-highlight' : ''}>#{t.etiqueta}</li>
          ))}
        </ul>

        <div className="ev-card__footer">
          <span className="ev-card__org">
            <span className="ev-card__org-icon"><Icon name="shield" size={14} /></span>
            {organizadores}
          </span>

          <span className="ev-card__capacity">
            <span
              className="ev-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={c.cupoTotal}
              aria-valuenow={c.cuposOcupados}
              aria-label="Cupos ocupados"
            >
              <span style={{ width: `${porcentaje}%` }} />
            </span>
            <span>{c.lleno ? 'Cupo lleno' : `${c.cuposOcupados}/${c.cupoTotal} cupos`}</span>
          </span>

          <Link to={`/app/eventos/${evento.slug}`} className="ev-btn ev-btn--solid">
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function EventsTab() {
  const [eventos, setEventos] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [busqueda, setBusqueda] = useState('');
  const [localidad, setLocalidad] = useState('todas');
  const [fecha, setFecha] = useState('todas');
  const [categoria, setCategoria] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const { isSaved, toggle } = useSavedEvents();

  const cargar = () => {
    setStatus('loading');
    getEventos()
      .then((data) => {
        setEventos(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    let cancelado = false;
    getEventos()
      .then((data) => {
        if (cancelado) return;
        setEventos(data);
        setStatus('ready');
      })
      .catch(() => !cancelado && setStatus('error'));
    return () => {
      cancelado = true;
    };
  }, []);

  const localidades = useMemo(() => [...new Set(eventos.map((e) => e.localidad))].sort(), [eventos]);

  const meses = useMemo(() => {
    const vistos = new Map();
    eventos.forEach((e) => vistos.set(claveMes(e.fecha), `${nombreMes(e.fecha)} ${e.fecha.slice(0, 4)}`));
    return [...vistos.entries()];
  }, [eventos]);

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return eventos.filter((e) => {
      if (categoria !== 'todos' && e.categoria !== categoria) return false;
      if (localidad !== 'todas' && e.localidad !== localidad) return false;
      if (fecha !== 'todas' && claveMes(e.fecha) !== fecha) return false;
      if (!q) return true;
      const pajar = normalizar(
        [
          e.tituloEvento,
          e.descripcionEvento,
          e.lugarEvento,
          e.localidad,
          ...e.lineasImpacto.map((l) => l.etiqueta),
          ...e.organizadores.map((o) => o.nombre),
        ].join(' ')
      );
      return pajar.includes(q);
    });
  }, [eventos, busqueda, localidad, fecha, categoria]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  // Cualquier cambio de filtro regresa a la página 1.
  const conReset = (setter) => (valor) => {
    setter(valor);
    setPagina(1);
  };

  const limpiar = () => {
    setBusqueda('');
    setLocalidad('todas');
    setFecha('todas');
    setCategoria('todos');
    setPagina(1);
  };

  return (
    <div className="ev-tab-wrap">
    <section className="ev-tab" id="eventos" aria-label="Eventos ecológicos y voluntariado">
      <nav className="ev-breadcrumb" aria-label="Ruta de navegación">
        <Link to="/app"><Icon name="building" size={13} /> Inicio</Link>
        <Icon name="chevron-right" size={12} />
        <span className="is-current">Eventos Ecológicos</span>
      </nav>

      <header className="ev-hero">
        <p className="ev-hero__eyebrow"><Icon name="people" size={14} /> INICIATIVAS COMUNITARIAS Y CIENCIA CIUDADANA</p>
        <h1>Eventos Ecológicos y Voluntariado en B.C.S.</h1>
        <p className="ev-hero__lead">
          Súmate a iniciativas de conservación, jornadas de limpieza de costas, reforestación de manglares y
          monitoreo comunitario de especies protegidas en santuarios marinos.
        </p>
      </header>

      <div className="ev-filters">
        <label className="ev-field ev-field--search">
          <Icon name="search" size={17} />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => conReset(setBusqueda)(e.target.value)}
            placeholder="Buscar por nombre, localidad o especie (ej. Balandra, mangle, cetáceos)..."
            aria-label="Buscar eventos"
          />
        </label>

        <label className="ev-field">
          <Icon name="pin" size={17} />
          <select value={localidad} onChange={(e) => conReset(setLocalidad)(e.target.value)} aria-label="Localidad">
            <option value="todas">Todas las localidades (B.C.S.)</option>
            {localidades.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <Icon name="chevron-down" size={14} className="ev-field__caret" />
        </label>

        <label className="ev-field">
          <Icon name="calendar" size={17} />
          <select value={fecha} onChange={(e) => conReset(setFecha)(e.target.value)} aria-label="Fecha">
            <option value="todas">Todas las fechas</option>
            {meses.map(([clave, etiqueta]) => <option key={clave} value={clave}>{etiqueta}</option>)}
          </select>
          <Icon name="chevron-down" size={14} className="ev-field__caret" />
        </label>
      </div>

      <div className="ev-chips" role="tablist" aria-label="Categorías de eventos">
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={categoria === c.id}
            className={`ev-chip ${categoria === c.id ? 'is-active' : ''}`.trim()}
            onClick={() => conReset(setCategoria)(c.id)}
          >
            <Icon name={c.icon} size={14} /> {c.label}
          </button>
        ))}
      </div>

      {status === 'loading' && <p className="ev-state" role="status">Cargando eventos…</p>}

      {status === 'error' && (
        <div className="ev-state" role="alert">
          <p>No pudimos cargar los eventos. Revisa que el servidor esté encendido e inténtalo de nuevo.</p>
          <button type="button" className="ev-btn ev-btn--solid" onClick={cargar}>Reintentar</button>
        </div>
      )}

      {status === 'ready' && filtrados.length === 0 && (
        <div className="ev-state">
          <p>No hay eventos que coincidan con tu búsqueda.</p>
          <button type="button" className="ev-btn ev-btn--outline" onClick={limpiar}>Limpiar filtros</button>
        </div>
      )}

      {status === 'ready' && visibles.length > 0 && (
        <>
          <div className="ev-list">
            {visibles.map((evento) => (
              <EventCard
                key={evento.id}
                evento={evento}
                saved={isSaved(evento.slug)}
                onToggleSaved={toggle}
              />
            ))}
          </div>

          <div className="ev-pagination">
            <p>
              <span className="ev-pagination__dot" aria-hidden="true" />
              Mostrando <strong>{visibles.length}</strong> de {filtrados.length} eventos activos en Baja California Sur
            </p>
            {totalPaginas > 1 && (
              <nav aria-label="Paginación de eventos">
                <button type="button" onClick={() => setPagina(paginaActual - 1)} disabled={paginaActual === 1} aria-label="Página anterior">
                  <Icon name="chevron-left" size={14} />
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n === paginaActual ? 'is-active' : ''}
                    aria-current={n === paginaActual ? 'page' : undefined}
                    onClick={() => setPagina(n)}
                  >
                    {n}
                  </button>
                ))}
                <button type="button" onClick={() => setPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} aria-label="Página siguiente">
                  <Icon name="chevron-right" size={14} />
                </button>
              </nav>
            )}
          </div>
        </>
      )}
    </section>
    </div>
  );
}
