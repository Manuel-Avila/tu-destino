import InfoPage from './InfoPage';

/** Versión informativa de Educación Ambiental (antes de iniciar sesión): sin tarjetas de publicaciones. */
export default function EducationInfo() {
  return (
    <InfoPage
      id="educacion"
      breadcrumb="Educación Ambiental"
      icon="book"
      eyebrow="CONCIENCIA Y PRESERVACIÓN"
      title="Educación Ambiental"
      lead="Publicaciones sobre el ecosistema marino de Baja California Sur: conservación, especies locales y turismo responsable."
      explainerTitle="¿Qué encontrarás en Educación ambiental?"
      steps={[
        { title: 'Publicaciones por tema', text: 'Fauna marina, biodiversidad, turismo responsable y guías prácticas explicadas de forma clara y sencilla.' },
        { title: 'Conoce las especies locales', text: 'Aprende sobre tortugas, ballenas, arrecifes y manglares, y por qué su cuidado depende también de los visitantes.' },
        { title: 'Busca y filtra', text: 'Encuentra rápido lo que te interesa con el buscador y los filtros por categoría de la biblioteca.' },
      ]}
      calloutTitle="Inicia sesión para leer las publicaciones"
      calloutText="Con tu cuenta puedes consultar toda la biblioteca de Educación Ambiental y abrir cada publicación completa."
    />
  );
}
