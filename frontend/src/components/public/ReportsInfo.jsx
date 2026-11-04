import InfoPage from './InfoPage';

/** Versión informativa de Reportes (antes de iniciar sesión): sin formulario ni consulta de folio. */
export default function ReportsInfo() {
  return (
    <InfoPage
      id="reportes"
      breadcrumb="Reportes"
      icon="shield"
      eyebrow="PARTICIPACIÓN CIUDADANA"
      title="Reportes de Incidentes Ambientales en B.C.S."
      lead="Un canal directo para avisar de daños al entorno, pesca ilegal, residuos o fauna en riesgo, con seguimiento transparente de cada reporte."
      explainerTitle="¿Qué puedes hacer en Reportes?"
      steps={[
        { title: 'Reportar un incidente', text: 'Describe lo que viste, indica el tipo de incidente y adjunta evidencia para que las autoridades y organizaciones puedan actuar.' },
        { title: 'Tu identidad está protegida', text: 'Si lo prefieres, puedes reportar de forma anónima: no se guarda tu cuenta, nombre ni correo junto al reporte.' },
        { title: 'Seguimiento con folio', text: 'Cada reporte recibe un folio. Con él puedes consultar si está pendiente, en revisión o atendido.' },
      ]}
      calloutTitle="Inicia sesión para enviar un reporte"
      calloutText="Con tu cuenta podrás enviar reportes, consultar su estado con tu folio y ver el historial de los que has realizado."
    />
  );
}
