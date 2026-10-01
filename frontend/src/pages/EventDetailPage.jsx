import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import Icon from '../components/events/EventIcons';
import { useSavedEvents } from '../hooks/useSavedEvents';
import { getEvento } from '../services/eventos.service';
import {
  formatDuracion,
  formatFechaLarga,
  formatHora12,
  googleMapsUrl,
  renderNegritas,
  whatsappUrl,
} from '../components/events/eventUtils';
import './home.css';
import '../components/home/EventsTab.css';
import './eventDetail.css';

// Mismo fix del icono de Leaflet que usa la página de destinos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// La convocatoria se vuelve a consultar cada 30 s para reflejar nuevas confirmaciones del Google Form.
const REFRESH_MS = 30000;

function Gallery({ imagenes, titulo }) {
  const [index, setIndex] = useState(0);
  if (!imagenes || imagenes.length === 0) return null;
  const total = imagenes.length;
  const go = (delta) => setIndex((i) => (i + delta + total) % total);

  return (
    <div className="evd-gallery">
      <img src={imagenes[index]} alt={`${titulo} (foto ${index + 1} de ${total})`} />
      {total > 1 && (
        <>
          <button type="button" className="evd-gallery__nav evd-gallery__nav--prev" onClick={() => go(-1)} aria-label="Foto anterior">
            <Icon name="chevron-left" size={18} />
          </button>
          <button type="button" className="evd-gallery__nav evd-gallery__nav--next" onClick={() => go(1)} aria-label="Foto siguiente">
            <Icon name="chevron-right" size={18} />
          </button>
        </>
      )}
    </div>
  );
}

function Convocatoria({ convocatoria }) {
  const { cupoTotal, cuposOcupados, cuposRestantes, lleno, formsUrl } = convocatoria;
  const porcentaje = Math.min(100, Math.round((cuposOcupados / cupoTotal) * 100));
  // Se avisa "últimos espacios" cuando queda el 30 % o menos del cupo.
  const ultimos = !lleno && cuposRestantes <= Math.ceil(cupoTotal * 0.3);

  return (
    <div className="evd-card evd-convocatoria">
      <div className="evd-convocatoria__top">
        <span className="evd-eyebrow">{lleno ? 'CONVOCATORIA CERRADA' : 'CONVOCATORIA ABIERTA'}</span>
        {ultimos && (
          <span className="evd-alert">¡Últimos {cuposRestantes} {cuposRestantes === 1 ? 'espacio' : 'espacios'}!</span>
        )}
      </div>

      <p className="evd-convocatoria__count" aria-live="polite">
        <strong>{cuposOcupados} de {cupoTotal}</strong> lugares ocupados ({porcentaje}%)
      </p>
      <div className="evd-bar" role="progressbar" aria-valuemin={0} aria-valuemax={cupoTotal} aria-valuenow={cuposOcupados} aria-label="Lugares ocupados">
        <span style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="evd-convocatoria__note">
        <Icon name="shield" size={14} /> Cupo regulado para salvaguardar la capacidad de carga del ecosistema.
      </p>

      {lleno || !formsUrl ? (
        <span className="evd-cta is-disabled" aria-disabled="true">
          {lleno ? 'Cupo lleno' : 'Inscripción próximamente'}
        </span>
      ) : (
        <a className="evd-cta" href={formsUrl} target="_blank" rel="noreferrer">
          Llenar Formulario de Inscripción <Icon name="external" size={15} />
        </a>
      )}
      <p className="evd-convocatoria__hint">Apertura externa oficial en Google Forms</p>
    </div>
  );
}

function EventDetail({ slug }) {
  const [evento, setEvento] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | error
  const { isSaved, toggle } = useSavedEvents();

  useEffect(() => {
    let cancelado = false;
    getEvento(slug)
      .then((data) => {
        if (cancelado) return;
        setEvento(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelado) return;
        setStatus(err.status === 404 ? 'notfound' : 'error');
      });
    window.scrollTo({ top: 0 });
    return () => {
      cancelado = true;
    };
  }, [slug]);

  // Refresca solo la convocatoria (cupos) mientras la página está abierta.
  useEffect(() => {
    if (status !== 'ready') return undefined;
    const refrescar = () => {
      if (document.hidden) return;
      getEvento(slug)
        .then((data) => setEvento((prev) => (prev ? { ...prev, convocatoria: data.convocatoria } : data)))
        .catch(() => {});
    };
    const timer = setInterval(refrescar, REFRESH_MS);
    window.addEventListener('focus', refrescar);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refrescar);
    };
  }, [slug, status]);

  const handleShare = async () => {
    const shareData = { title: evento.tituloEvento, text: evento.resumen, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // el usuario canceló el share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles.');
    }
  };

  let contenido;

  if (status === 'loading') {
    contenido = <p className="evd-state" role="status">Cargando evento…</p>;
  } else if (status === 'notfound' || status === 'error') {
    contenido = (
      <div className="evd-state" role="alert">
        <p>{status === 'notfound' ? 'No encontramos este evento.' : 'No pudimos cargar el evento. Inténtalo de nuevo en un momento.'}</p>
        <Link to="/app/eventos" className="ev-btn ev-btn--solid">Volver a Eventos</Link>
      </div>
    );
  } else {
    const e = evento;
    const guardado = isSaved(e.slug);
    const parrafos = e.descripcionEvento.split(/\n{2,}/);
    const tituloCorto = e.tituloEvento;
    const wa = whatsappUrl(e.responsable.telefono);

    contenido = (
      <>
        <nav className="ev-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/app"><Icon name="building" size={13} /> Inicio</Link>
          <Icon name="chevron-right" size={12} />
          <Link to="/app/eventos">Eventos Ecológicos</Link>
          <Icon name="chevron-right" size={12} />
          <span>Detalle</span>
          <Icon name="chevron-right" size={12} />
          <span className="is-current">{tituloCorto}</span>
        </nav>

        <div className="evd-badges">
          {e.badges.map((b, i) => (
            <span key={b} className={`evd-badge ${i === 0 ? 'evd-badge--strong' : ''}`.trim()}>{b}</span>
          ))}
          {e.faseEvento && (
            <span className="evd-badge evd-badge--outline"><Icon name="clock" size={13} /> {e.faseEvento}</span>
          )}
        </div>

        <div className="evd-heading">
          <div>
            <h1>{e.tituloEvento}</h1>
            <p className="evd-meta">
              <span><Icon name="calendar" size={15} /> {formatFechaLarga(e.fecha)}</span>
              <span>
                <Icon name="clock" size={15} /> {formatHora12(e.horaInicio)} – {formatHora12(e.horaFin)} ({formatDuracion(e.duracionHoras)} de campo)
              </span>
              <span><Icon name="pin" size={15} /> {e.lugarEvento}, {e.localidad}, B.C.S.</span>
            </p>
          </div>
          <div className="evd-actions">
            <button type="button" className={`ev-btn ev-btn--outline ${guardado ? 'is-saved' : ''}`.trim()} onClick={() => toggle(e.slug)} aria-pressed={guardado}>
              <Icon name="heart" size={15} style={guardado ? { fill: 'currentColor' } : undefined} />
              {guardado ? 'Guardado en Mis Eventos' : 'Guardar en Mis Eventos'}
            </button>
            <button type="button" className="ev-btn ev-btn--solid" onClick={handleShare}>
              <Icon name="share" size={15} /> Compartir evento
            </button>
          </div>
        </div>

        <Gallery imagenes={e.imagenes} titulo={e.tituloEvento} />

        <div className="evd-grid">
          <div className="evd-main">
            <section className="evd-card evd-about">
              {e.subtituloEvento && <h2 className="evd-title">{e.subtituloEvento}</h2>}
              {parrafos.map((p, i) => <p key={i}>{p}</p>)}

              {e.metricas.length > 0 && (
                <ul className="evd-metrics">
                  {e.metricas.map((m) => (
                    <li key={m.valor}>
                      <span className="evd-metrics__icon"><Icon name={m.icono} size={18} /></span>
                      <span><strong>{m.valor}</strong><small>{m.detalle}</small></span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="evd-eyebrow evd-eyebrow--muted">LÍNEAS DE IMPACTO Y EJES TEMÁTICOS</p>
              <ul className="ev-tags">
                {e.lineasImpacto.map((t) => (
                  <li key={t.etiqueta} className={t.destacada ? 'is-highlight' : ''}>#{t.etiqueta}</li>
                ))}
              </ul>
            </section>

            <section className="evd-card evd-program" aria-labelledby="evd-programa">
              <div className="evd-program__head">
                <div>
                  <p className="evd-eyebrow">CRONOGRAMA OPERATIVO</p>
                  <h2 id="evd-programa" className="evd-title">Programa de la Jornada</h2>
                </div>
                <span className="evd-pill"><Icon name="clock" size={13} /> {formatDuracion(e.duracionHoras)} continuas de actividad</span>
              </div>

              {/* Un bloque por paso: la cantidad depende de las filas de evento_itinerario */}
              <ol className="evd-timeline">
                {e.itinerario.map((paso) => (
                  <li key={`${paso.hora}-${paso.titulo}`}>
                    <span className="evd-timeline__dot" aria-hidden="true" />
                    <div className="evd-step">
                      <time className="evd-step__time">{formatHora12(paso.hora)}</time>
                      <h3>{paso.titulo}</h3>
                      <p>{paso.descripcion}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <div className="evd-two">
              <section className="evd-card evd-list">
                <h2 className="evd-list__title"><Icon name="list" size={16} /> QUÉ INCLUYE LA JORNADA</h2>
                <ul>
                  {e.incluye.map((t) => <li key={t}><Icon name="check" size={14} /> <span>{t}</span></li>)}
                </ul>
              </section>
              <section className="evd-card evd-list evd-list--bring">
                <h2 className="evd-list__title"><Icon name="bag" size={16} /> QUÉ DEBES LLEVAR</h2>
                <ul>
                  {e.llevar.map((t) => <li key={t}><Icon name="check" size={14} /> <span>{renderNegritas(t)}</span></li>)}
                </ul>
              </section>
            </div>

            {e.reglas.length > 0 && (
              <section className="evd-card evd-rules">
                <p className="evd-eyebrow">NORMATIVA OBLIGATORIA</p>
                <h2 className="evd-title">{e.reglasTitulo || 'Reglas de Respeto Ecológico'}</h2>
                {e.reglasIntro && <p className="evd-rules__intro">{e.reglasIntro}</p>}
                <div className="evd-rules__grid">
                  {e.reglas.map((r) => (
                    <div className="evd-rule" key={r.titulo}>
                      <h3><Icon name={r.icono} size={15} /> {r.titulo}</h3>
                      <p>{r.texto}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {e.preguntasFrecuentes.length > 0 && (
              <section className="evd-card evd-faq">
                <p className="evd-eyebrow">RESOLUCIÓN DE DUDAS</p>
                <h2 className="evd-title">Preguntas Frecuentes de Voluntarios</h2>
                {e.preguntasFrecuentes.map((f) => (
                  <details key={f.pregunta}>
                    <summary>
                      <Icon name="help" size={15} /> <span>{f.pregunta}</span>
                      <Icon name="chevron-down" size={16} className="evd-faq__caret" />
                    </summary>
                    <p>{f.respuesta}</p>
                  </details>
                ))}
              </section>
            )}
          </div>

          <aside className="evd-side">
            <Convocatoria convocatoria={e.convocatoria} />

            <section className="evd-card evd-committee">
              <p className="evd-eyebrow evd-eyebrow--muted">COMITÉ ORGANIZADOR &amp; AVAL CIENTÍFICO</p>
              <ul className="evd-orgs">
                {e.organizadores.map((o) => (
                  <li key={o.nombre}>
                    <span className="evd-orgs__icon"><Icon name="building" size={16} /></span>
                    <span><strong>{o.nombre}</strong>{o.descripcion && <small>{o.descripcion}</small>}</span>
                  </li>
                ))}
              </ul>

              <div className="evd-person">
                <span className="evd-person__avatar" aria-hidden="true">
                  {e.responsable.nombre.replace(/^(Biól\.|M\. en C\.|Dr\.|Dra\.|Mtro\.|Mtra\.)\s*/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <span>
                  <strong>{e.responsable.nombre}</strong>
                  {e.responsable.cargo && <small>{e.responsable.cargo}</small>}
                </span>
              </div>
              {e.responsable.cita && <blockquote>“{e.responsable.cita}”</blockquote>}

              <a className="evd-contact" href={`mailto:${e.responsable.correo}`}>
                <Icon name="mail" size={15} /> {e.responsable.correo}
              </a>
              <a className="evd-contact" href={wa} target="_blank" rel="noreferrer">
                <Icon name="chat" size={15} /> WhatsApp de soporte a voluntarios
                <small>{e.responsable.telefono}</small>
              </a>
            </section>

            <section className="evd-card evd-place">
              <div className="evd-place__head">
                <p className="evd-eyebrow evd-eyebrow--muted">PUNTO DE ENCUENTRO</p>
                <span><Icon name="pin" size={13} /> {e.localidad}, B.C.S.</span>
              </div>
              {e.puntoEncuentro.nombre && <strong className="evd-place__name">{e.puntoEncuentro.nombre}</strong>}
              {e.puntoEncuentro.direccion && <p>{e.puntoEncuentro.direccion}</p>}

              <div className="evd-map">
                <MapContainer center={e.coordenadas} zoom={13} scrollWheelZoom={false} className="evd-map__canvas">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={e.coordenadas} />
                </MapContainer>
                <span className="evd-map__label"><Icon name="pin" size={12} /> Punto de Reunión Oficial</span>
              </div>

              <a className="ev-btn ev-btn--outline evd-place__link" href={googleMapsUrl(e.coordenadas)} target="_blank" rel="noreferrer">
                Google Maps <Icon name="external" size={13} />
              </a>
              <p className="evd-place__coords">
                Coordenadas GPS: {Math.abs(e.coordenadas[0]).toFixed(4)}° {e.coordenadas[0] >= 0 ? 'N' : 'S'}, {Math.abs(e.coordenadas[1]).toFixed(4)}° {e.coordenadas[1] >= 0 ? 'E' : 'W'}
              </p>
            </section>
          </aside>
        </div>

        <Link to="/app/eventos" className="evd-back"><Icon name="chevron-left" size={14} /> Volver a Eventos</Link>
      </>
    );
  }

  return (
    <div className="ev-detail">
      <div className="evd-wrap">{contenido}</div>
    </div>
  );
}

// `key` reinicia el estado al pasar de un evento a otro sin necesidad de un setState dentro del efecto.
export default function EventDetailPage() {
  const { id } = useParams();
  return <EventDetail key={id} slug={id} />;
}
