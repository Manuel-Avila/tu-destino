import { query } from '../config/db.js';

/**
 * Contenido inicial de la biblioteca de Educación Ambiental.
 * Las publicaciones se migraron desde los recursos estáticos que ya existían
 * en el frontend para que ahora puedan administrarse desde la base de datos.
 */
const publicaciones = [
  {
    titulo: '¿Qué hacer si encuentro una tortuga marina?',
    categoria: 'Fauna Marina',
    imagen: '/educacion/tortuga.jpg',
    texto: [
      'Si encuentras una tortuga en la playa, anidando o con crías, obsérvala desde lejos y en silencio. Evita luces, flashes y movimientos bruscos, y no te pongas frente a su camino: la luz y la presencia cercana de personas pueden interferir con su recorrido. No toques a la tortuga, sus huevos o sus crías; mantén también a las mascotas alejadas, no bloquees su paso y retira tu basura. En las playas de anidación, sigue las zonas y horarios que indique el personal responsable.',
      'En el mar, no la persigas, alimentes ni intentes tocarla o subirla a una embarcación. Si navegas cerca de la costa o de un arrecife, reduce la velocidad y mantente atento para evitar colisiones. No te acerques para tomar fotografías ni cambies bruscamente de rumbo alrededor del animal. Respeta siempre las indicaciones del personal del área y de los guías autorizados.',
      'Si está herida, varada o enredada, no entres al agua ni intentes liberarla, retirar anzuelos, moverla o darle primeros auxilios. Esas acciones pueden lastimarla y ponerte en riesgo; mantén a otras personas a distancia y avisa a las autoridades del área o a PROFEPA. Si puedes hacerlo sin acercarte, anota la ubicación y describe lo que observas. Tampoco compres ni consumas tortugas, huevos o productos derivados de ellas.',
    ].join('\n\n'),
  },
  {
    titulo: 'Arrecifes rocosos: hogar de la vida marina',
    categoria: 'Biodiversidad',
    imagen: '/educacion/arrecifes-rocosos.jpeg',
    texto: [
      'Los arrecifes rocosos sostienen comunidades de peces, corales e invertebrados y ayudan a mantener el equilibrio del ecosistema costero. Sus grietas y superficies ofrecen refugio y zonas de alimentación y crianza para distintas especies. También contribuyen a la productividad marina de la que dependen actividades y economías locales, incluida la pesca.',
      'Para estudiar su estado, las personas científicas observan la variedad de especies, la biomasa de los organismos y la presencia de depredadores grandes. Estos indicadores, vistos en conjunto y a lo largo del tiempo, ayudan a detectar cambios en la comunidad. El material de referencia reporta que, en una campaña de monitoreo de 2023 en Baja California Sur, se evaluaron 83 arrecifes y se registraron 255 especies: 127 de peces y 128 de invertebrados.',
      'La sobrepesca puede alterar las cadenas alimentarias, mientras que las olas de calor marinas pueden afectar a organismos incluso en zonas más profundas. Al bucear o hacer esnórquel, evita tocar, pisar o extraer organismos, controla tus aletas para no golpear el fondo y no dejes residuos.',
    ].join('\n\n'),
  },
  {
    titulo: '¿Cómo reportar un problema ambiental?',
    categoria: 'Guías Prácticas',
    imagen: '/educacion/reportar-problema.jpg',
    texto: [
      'Si detectas contaminación, daño a un manglar o arrecife, pesca ilegal o fauna en riesgo, anota qué ocurrió, cuándo y dónde. Incluye el nombre de la playa o del área protegida y una referencia para ubicarla. Si es seguro, puedes conservar fotografías; no manipules animales ni residuos peligrosos, no entres a zonas restringidas y evita confrontar a las personas involucradas.',
      'Puedes usar la sección de Reportes de TuDestino para enviar un aviso de manera anónima si así lo prefieres, sin compartir datos personales. Procura describir los hechos con claridad e incluir la ubicación y cualquier evidencia que hayas podido obtener sin ponerte en riesgo. Si quieres que puedan contactarte para dar seguimiento, también puedes proporcionar tus datos.',
      'Si prefieres presentar una denuncia directamente ante la autoridad, PROFEPA es una alternativa. La denuncia formal requiere datos de contacto, una descripción de los hechos, información para ubicar el posible daño y, si cuentas con ellas, pruebas. Por teléfono, PROFEPA indica que la denuncia debe ratificarse dentro de los tres días hábiles siguientes, de 9:00 a 18:00 horas.',
    ].join('\n\n'),
  },
  {
    titulo: '¿Por qué debemos cuidar los manglares?',
    categoria: 'Biodiversidad',
    imagen: '/educacion/manglares.jpg',
    texto: [
      'Las raíces de los manglares amortiguan el oleaje, ayudan a reducir la erosión y pueden proteger las zonas costeras durante tormentas. También retienen sedimentos y forman áreas de refugio, alimentación y crianza para peces, moluscos y crustáceos. Aves residentes y migratorias, así como otros animales, utilizan estos sitios para alimentarse, descansar o anidar.',
      'Los manglares almacenan carbono en su vegetación y sus suelos, y contribuyen a mantener la calidad del agua al retener sedimentos y filtrar parte de los materiales que llegan desde tierra. El equilibrio de estos ecosistemas depende también del movimiento natural del agua. La contaminación, los plásticos y el desarrollo costero sin planeación pueden afectarlos y fragmentar su hábitat.',
      'Para cuidarlos, evita caminar sobre las raíces, cortar ramas, dejar basura o alterar el flujo natural del agua. No amarres embarcaciones ni tires anclas sobre el manglar; utiliza accesos y puntos autorizados. Elige actividades de bajo impacto y participa en acciones de restauración organizadas por especialistas o por la comunidad local.',
    ].join('\n\n'),
  },
  {
    titulo: 'Ballenas y delfines: observación responsable',
    categoria: 'Fauna Marina',
    imagen: '/educacion/ballenas-delfines.jpg',
    texto: [
      'Observa ballenas y delfines desde una embarcación autorizada y sigue las instrucciones de la tripulación. Antes de reservar, confirma que el operador cuente con autorización y pregúntale por las reglas del sitio. Las distancias, temporadas y condiciones de observación pueden variar por especie y zona; para ballenas, la actividad está regulada por la NOM-131-SEMARNAT-2010.',
      'Durante la aproximación, las embarcaciones deben avanzar con precaución y respetar el rumbo de los animales. No se debe cortarles el paso, rodearlos, perseguirlos ni separar a las crías de sus madres. No nades, bucees, alimentes ni intentes tocar a los cetáceos. Evita pedir al capitán que se acerque más o que prolongue la observación fuera de las reglas.',
      'Si notas que un animal cambia bruscamente de dirección, acelera, se sumerge repetidamente o parece evadir las embarcaciones, informa a la tripulación y sigue sus instrucciones para alejarse. No intentes intervenir por tu cuenta ante un animal herido o enredado.',
    ].join('\n\n'),
  },
  {
    titulo: '7 acciones para visitar una playa sin dejar huella',
    categoria: 'Turismo Responsable',
    imagen: '/educacion/playa-sin-huella.jpg',
    texto: [
      'Una visita cuidadosa ayuda a mantener limpias las playas y a reducir las molestias a la fauna y el daño a la vegetación. Sigue las reglas del área protegida y las indicaciones del personal local; pueden existir restricciones específicas según la temporada, el sitio o las condiciones del ecosistema.',
      '1. Llévate toda tu basura: guarda tus residuos hasta encontrar un contenedor adecuado y, si el lugar no tiene uno, llévalos de regreso contigo. Reduce los plásticos de un solo uso, que pueden llegar al mar o enredar a los animales.',
      '2. Revisa las reglas sobre protector solar: consulta las indicaciones del área antes de entrar al agua. No asumas que una etiqueta como “biodegradable” o “reef-safe” garantiza que un producto sea adecuado para todos los ecosistemas.',
      '3. Deja los elementos naturales en su sitio: no te lleves conchas, caracoles, piedras, arena ni plantas. Estos elementos forman parte del hábitat y también contribuyen a que otras personas disfruten el paisaje.',
      '4. Respeta la flora y la fauna: no alimentes, persigas ni toques animales silvestres. Mantén a las mascotas bajo control y fuera de las zonas de anidación y descanso de la fauna.',
      '5. Usa senderos y accesos autorizados: camina por las rutas señaladas para evitar pisar vegetación, erosionar dunas o acercarte a nidos y otras zonas sensibles.',
      '6. Evita encender fogatas: el fuego puede dañar la vegetación, dejar residuos en la arena y alterar la fauna. Enciéndelo solo si las reglas locales lo permiten en un sitio expresamente habilitado.',
      '7. Consume de manera local y responsable: apoya a comercios, guías y prestadores de servicios de la comunidad que respeten las normas ambientales y las indicaciones del área natural.',
    ].join('\n\n'),
  },
];

const TITULOS_ANTERIORES = [
  'Protección de Arrecifes de Coral',
  'Los Manglares: Pulmones y Cunas',
  'Avistamiento Ético de Fauna',
  'Política de Basura Cero',
];

export async function seedEducacionIfEmpty() {
  const { rows } = await query(
    'SELECT id, titulo, created_at, updated_at FROM educacion_publicaciones'
  );

  const sonSemillasAnterioresSinEditar =
    rows.length === TITULOS_ANTERIORES.length &&
    TITULOS_ANTERIORES.every((titulo) => rows.some((row) => row.titulo === titulo)) &&
    rows.every(
      (row) =>
        new Date(row.created_at).getTime() === new Date(row.updated_at).getTime()
    );

  if (sonSemillasAnterioresSinEditar) {
    // Migración única: reemplaza las 4 publicaciones iniciales por la biblioteca
    // de 6 recursos que ya existía en el frontend. No toca publicaciones editadas.
    await query('DELETE FROM educacion_publicaciones');
  } else if (rows.length > 0) {
    return;
  }

  for (const publicacion of publicaciones) {
    await query(
      `INSERT INTO educacion_publicaciones (titulo, imagen, texto, categoria)
       VALUES ($1, $2, $3, $4)`,
      [publicacion.titulo, publicacion.imagen, publicacion.texto, publicacion.categoria]
    );
  }

  console.log('[db] Publicaciones de educación insertadas (seed) correctamente.');
}
