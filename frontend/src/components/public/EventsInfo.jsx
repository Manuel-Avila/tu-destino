import InfoPage from './InfoPage';

/** Versión informativa de Eventos (antes de iniciar sesión): sin listado ni inscripción. */
export default function EventsInfo() {
  return (
    <InfoPage
      id="eventos"
      breadcrumb="Eventos"
      icon="calendar"
      eyebrow="INICIATIVAS COMUNITARIAS Y CIENCIA CIUDADANA"
      title="Eventos Ecológicos y Voluntariado en B.C.S."
      lead="Jornadas de limpieza de costas, reforestación de manglares y monitoreo comunitario de especies protegidas en santuarios marinos."
      explainerTitle="¿Qué encontrarás en Eventos ecológicos?"
      steps={[
        { title: 'Jornadas de conservación', text: 'Limpieza de playas, reforestación de manglares, monitoreo de fauna y talleres de educación ambiental.' },
        { title: 'Organizadas por expertos', text: 'Cada evento indica quién lo organiza, dónde y cuándo es, qué incluye y qué debes llevar.' },
        { title: 'Cupos e inscripción', text: 'Consulta los lugares disponibles y confirma tu asistencia con el formulario de inscripción de cada jornada.' },
      ]}
      calloutTitle="Inicia sesión para ver los eventos disponibles"
      calloutText="Con tu cuenta puedes explorar el calendario completo, guardar tus eventos favoritos e inscribirte."
    />
  );
}
