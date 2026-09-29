import pool from '../config/db.js';

/**
 * DATOS DE PRUEBA de eventos. Solo se insertan si la tabla "eventos" está vacía,
 * así que puedes editar/borrar registros directo en la BD sin que se regeneren.
 * Para volver a sembrar: TRUNCATE eventos RESTART IDENTITY CASCADE; y reinicia el backend.
 *
 * Las imágenes viven en frontend/public/eventos/ (cámbialas por las reales).
 */
const FORMS_DEMO = 'https://docs.google.com/forms/d/e/REEMPLAZA_CON_TU_ID/viewform';

const eventos = [
  {
    slug: 'limpieza-microplasticos-balandra',
    titulo_evento: 'Gran Jornada de Limpieza y Caracterización de Microplásticos en Playa Balandra',
    subtitulo_evento: 'Protegiendo la Laguna de Balandra desde sus sedimentos costeros',
    descripcion_evento: [
      'Muestreo y clasificación de partículas plásticas en la línea de marea alta y el borde de manglar, protegiendo aves y fauna marina. Balandra no solo es una de las ensenadas costeras más icónicas y visitadas del mundo; constituye además un santuario ecológico de altísima vulnerabilidad reconocido bajo la convención internacional Ramsar (Sitio no. 1822). Sus tres especies de mangle (Rhizophora mangle, Avicennia germinans y Laguncularia racemosa) actúan como guarderías biológicas críticas para más de 80 especies de peces de valor comercial y ecológico en el Golfo de California.',
      'Durante esta jornada extraordinaria, implementaremos una metodología combinada: la extracción manual de macro residuos arrastrados por las mareas extraordinarias y el primer muestreo participativo de microplásticos secundarios (partículas menores a 5 milímetros). A través de cuadrantes estandarizados de 1m², los participantes aprenderán a utilizar tamices de malla milimétrica guiados directamente por biólogos marinos de la CONANP.',
      'Todos los datos colectados se integrarán formalmente al Censo Peninsular de Calidad de Arena 2026-2027, sirviendo de base técnica para las normativas de capacidad de carga y restricción de plásticos en la ensenada. Tu participación genera evidencia científica para defender la bahía.',
    ].join('\n\n'),
    categoria: 'limpieza',
    etiqueta_imagen: 'ANP BALANDRA',
    insignia_tarjeta: 'Próx. Sábado',
    badges: ['Área de Protección de Flora y Fauna Balandra', 'Actividad Gratuita', 'Crédito Voluntario / Constancia Ambiental'],
    fase_evento: 'Fase 2 de Muestreo 2026',
    imagenes: ['/eventos/balandra-playa.jpg', '/eventos/playa-main.webp', '/eventos/coast-hero.jpg'],
    fecha_evento: '2026-10-24',
    hora_inicio: '07:30',
    hora_fin: '11:30',
    duracion_horas: 4,
    lugar_evento: 'Bahía Balandra',
    localidad: 'La Paz',
    punto_encuentro_nombre: 'Estacionamiento Principal y Caseta de Guardaparques CONANP',
    punto_encuentro_direccion: 'Carretera a Pichilingue Km 16, Bahía de Balandra, La Paz, B.C.S.',
    latitud: 24.3218,
    longitud: -110.3235,
    responsable_nombre: 'Biól. Sofía Altamirano',
    responsable_cargo: 'Coordinadora de Monitoreo Marino',
    responsable_correo: 'coordinacion@balandraviva.org',
    responsable_telefono: '+52 612 123 4567',
    responsable_cita: 'Cada microplástico retirado de la arena es una partícula menos en el sistema respiratorio de nuestros peces e invertebrados de la bahía.',
    cupo_total: 50,
    cupos_ocupados: 35,
    forms_url: FORMS_DEMO,
    metricas: [
      { valor: '12 Cuadrantes', detalle: 'Muestreo científico', icono: 'flask' },
      { valor: '350 kg Est.', detalle: 'Retiro proyectado', icono: 'scale' },
      { valor: 'Folio Oficial', detalle: 'Constancia curricular', icono: 'badge' },
    ],
    reglas_titulo: 'Reglas de Respeto Ecológico en el Santuario Balandra',
    reglas_intro: 'Al tratarse de una Reserva de Protección Estricta, los voluntarios son el principal ejemplo de conducta y custodia ambiental para los visitantes de la bahía.',
    reglas: [
      { titulo: 'Cero Plásticos Desechables', texto: 'Queda estrictamente prohibido el ingreso de bolsas plásticas de un solo uso, unicel, popotes o botellas de PET desechables. Cualquier refrigerio personal debe ir en tupper reutilizable.', icono: 'ban' },
      { titulo: 'Respeto a Veredas y Dunas', texto: 'Se prohíbe ascender a los cerros circundantes fuera de la ruta establecida y pisar las raíces aéreas de los manglares rojos para evitar la compactación de los sedimentos.', icono: 'leaf' },
      { titulo: 'Santuario Libre de Mascotas', texto: 'Por disposición oficial del decreto de área natural protegida, no está permitido ingresar con mascotas o animales de compañía, ya que alteran la fauna silvestre y nidos terrestres.', icono: 'paw' },
      { titulo: 'Respeto de Horarios y Silencio', texto: 'No se permiten altavoces o bocinas bluetooth. Balandra es un aula viva de tranquilidad donde priorizamos el canto de las garzas y el flujo de la marea.', icono: 'clock' },
    ],
    preguntas_frecuentes: [
      { pregunta: '¿Pueden asistir niños o menores de edad?', respuesta: 'Sí, a partir de los 12 años acompañados de un adulto responsable que también se inscriba. Menores de 12 años no pueden participar por el manejo de tamices y el tiempo bajo el sol.' },
      { pregunta: '¿Se requiere experiencia previa en muestreo biológico?', respuesta: 'No. Los biólogos de la CONANP darán una inducción antes de comenzar y cada brigada de 5 personas irá guiada por un biólogo líder.' },
      { pregunta: '¿Hay transporte colectivo provisto desde La Paz?', respuesta: 'No hay transporte oficial. Te recomendamos organizar auto compartido; el estacionamiento del punto de encuentro tiene espacio limitado.' },
    ],
    organizadores: [
      { nombre: 'CONANP Península de BCS', nombre_corto: 'CONANP', descripcion: 'Comisión Nacional de Áreas Naturales Protegidas' },
      { nombre: 'Colectivo Balandra Viva A.C.', nombre_corto: 'Balandra Viva', descripcion: 'Organización de Conservación Ciudadana' },
    ],
    lineas: [
      ['Costas'], ['Manglares'], ['CeroPlásticos', true], ['Preservación'], ['LimpiezaCostera'],
      ['HumedalRamsar', true], ['VoluntariadoBCS', true], ['CienciaCiudadana'],
    ],
    itinerario: [
      { hora: '07:30', titulo: 'Recepción, Acreditación y Entrega de Equipamiento', descripcion: 'Registro de asistencia física, firma de deslinde voluntario y entrega de equipo personal: guantes de trabajo reforzados de nitrilo, costales reutilizables de henequén, bitácoras de campo y gafete foliado.' },
      { hora: '08:00', titulo: 'Inducción de Bioseguridad y Muestreo por CONANP', descripcion: 'Explicación de protocolos de no perturbación en la zona de anidación de aves playeras, zonificación de dunas y calibración de los tamices para la búsqueda de pellets y fibras plásticas.' },
      { hora: '08:30', titulo: 'Despliegue a Sectores: Playa Principal, Duna Norte y Borde de Manglar', descripcion: 'Caminata dirigida por brigadas de 5 voluntarios guiados por un biólogo líder. Recolección selectiva de residuos antropogénicos y extracción de muestras de sedimento superficial en los cuadrantes designados.' },
      { hora: '10:45', titulo: 'Concentración, Pesaje, Clasificación y Conteo de Microfragmentos', descripcion: 'Regreso al campamento central. Pesaje en básculas dinamométricas, categorización por tipo de polímero (PET, PEAD, poliestireno expandido, colillas) y vaciado directo en la base de datos nacional.' },
      { hora: '11:15', titulo: 'Conclusiones, Refrigerio Hidratante Regional y Entrega de Constancias', descripcion: 'Agradecimientos institucionales, agua de frutas locales servida a granel (sin desechables), fruta fresca de temporada de Todos Santos y validación de horas de servicio o constancia ambiental digital.' },
    ],
    incluye: [
      'Guantes de trabajo y protección reutilizables lavados y esterilizados.',
      'Costales de henequén natural y pinzas de acero para recolección ergonómica.',
      'Tamices científicos de separación de microplásticos y lupas entomológicas.',
      'Estación de hidratación continua (agua purificada y electrolitos en garrafón).',
      'Seguro básico de brigadista voluntario y botiquín de primeros auxilios en sitio.',
      'Constancia digital oficial con valor curricular y código QR de validación CONANP.',
    ],
    llevar: [
      '**Termo o cilindro reutilizable** con capacidad mínima de 1.5 litros (habrá rellenado ilimitado).',
      '**Calzado cerrado y cómodo** (tenis o botas de senderismo; no chanclas ni sandalias en las dunas).',
      '**Gorra o sombrero de ala ancha** y camisa ligera de manga larga con protección UV.',
      '**Bloqueador solar 100% biodegradable libre de oxibenzona** (o colocárselo 45 min antes de entrar a zona costera).',
      '**Smartphone cargado** si deseas registrar tus hallazgos en la app iNaturalist / CONABIO.',
    ],
  },

  {
    slug: 'reforestacion-mangle-rojo-el-mogote',
    titulo_evento: 'Reforestación y Vivero de Mangle Rojo',
    subtitulo_evento: 'Devolvemos al Mogote su barrera natural contra la erosión',
    descripcion_evento: [
      'Siembra comunitaria de propágulos en zanjas de amortiguamiento y fortalecimiento del vivero de propagación en la ensenada. El Estero El Mogote, sitio Ramsar 1816, resguarda uno de los manglares más productivos de la Bahía de La Paz y funciona como vivero natural de peces, crustáceos y aves migratorias.',
      'Trabajaremos por parejas: una persona prepara el sustrato y la otra siembra el propágulo de Rhizophora mangle a la profundidad y espaciamiento indicados por el equipo técnico. También daremos mantenimiento a las bolsas del vivero y haremos el conteo de supervivencia de la siembra del año anterior.',
      'Cada árbol plantado captura carbono azul durante décadas y estabiliza el sedimento que protege a la comunidad de la marea de tormenta.',
    ].join('\n\n'),
    categoria: 'reforestacion',
    etiqueta_imagen: 'SITIO RAMSAR 1816',
    insignia_tarjeta: null,
    badges: ['Sitio Ramsar 1816', 'Actividad Gratuita', 'Constancia Ambiental'],
    fase_evento: 'Temporada de siembra 2026',
    imagenes: ['/eventos/playa.jpg', '/eventos/balandra-playa.jpg'],
    fecha_evento: '2026-11-08',
    hora_inicio: '08:00',
    hora_fin: '12:00',
    duracion_horas: 4,
    lugar_evento: 'Estero El Mogote',
    localidad: 'La Paz',
    punto_encuentro_nombre: 'Acceso principal al Estero El Mogote',
    punto_encuentro_direccion: 'Camino a El Mogote, La Paz, B.C.S.',
    latitud: 24.1783,
    longitud: -110.3050,
    responsable_nombre: 'Biól. Ramón Cota',
    responsable_cargo: 'Coordinador de Restauración de Manglar',
    responsable_correo: 'contacto@redmanglar.org',
    responsable_telefono: '+52 612 234 5678',
    responsable_cita: 'Un manglar sano es la mejor infraestructura que puede tener una costa.',
    cupo_total: 30,
    cupos_ocupados: 18,
    forms_url: FORMS_DEMO,
    metricas: [
      { valor: '400 Propágulos', detalle: 'Meta de siembra', icono: 'flask' },
      { valor: '2 Zanjas', detalle: 'De amortiguamiento', icono: 'scale' },
      { valor: 'Folio Oficial', detalle: 'Constancia curricular', icono: 'badge' },
    ],
    reglas_titulo: 'Reglas de Respeto Ecológico en el Estero El Mogote',
    reglas_intro: 'El estero es un humedal protegido: cuidamos cada paso para no compactar el sedimento ni perturbar la fauna.',
    reglas: [
      { titulo: 'Solo en Zonas Autorizadas', texto: 'Se camina únicamente por las rutas marcadas por el equipo técnico para no pisar plántulas ni raíces.', icono: 'leaf' },
      { titulo: 'Cero Plásticos Desechables', texto: 'No se permite el ingreso de botellas de PET, bolsas de un solo uso ni unicel.', icono: 'ban' },
      { titulo: 'Sin Mascotas', texto: 'Las mascotas alteran a las aves que anidan en el estero.', icono: 'paw' },
      { titulo: 'Silencio y Sin Bocinas', texto: 'Evitamos ruido para no espantar a las aves playeras.', icono: 'clock' },
    ],
    preguntas_frecuentes: [
      { pregunta: '¿Pueden asistir niños o menores de edad?', respuesta: 'Sí, desde los 10 años acompañados de un adulto que también se inscriba.' },
      { pregunta: '¿Se requiere experiencia previa?', respuesta: 'No, el equipo técnico da una demostración de siembra al inicio.' },
      { pregunta: '¿Me voy a mojar?', respuesta: 'Sí, se trabaja en lodo y agua somera. Lleva ropa que puedas ensuciar y calzado acuático cerrado.' },
    ],
    organizadores: [
      { nombre: 'EcoAlianza Loreto', nombre_corto: 'EcoAlianza Loreto', descripcion: 'Organización de restauración costera' },
      { nombre: 'Red Manglar B.C.S.', nombre_corto: 'Red Manglar', descripcion: 'Red comunitaria de monitoreo de manglar' },
    ],
    lineas: [['Reforestación', true], ['Manglares'], ['CarbonoAzul'], ['HumedalRamsar'], ['VoluntariadoBCS', true], ['CienciaCiudadana']],
    itinerario: [
      { hora: '08:00', titulo: 'Recepción y Registro', descripcion: 'Registro de asistencia, firma de deslinde voluntario y entrega de guantes y gafete.' },
      { hora: '08:30', titulo: 'Demostración de Siembra', descripcion: 'El equipo técnico explica cómo seleccionar propágulos viables, la profundidad de siembra y el espaciamiento.' },
      { hora: '09:00', titulo: 'Siembra en Zanjas de Amortiguamiento', descripcion: 'Trabajo por parejas en las zanjas asignadas. Cada persona registra en bitácora los propágulos sembrados.' },
      { hora: '11:00', titulo: 'Mantenimiento del Vivero', descripcion: 'Riego, deshierbe y reemplazo de bolsas dañadas en el vivero de propagación.' },
      { hora: '11:45', titulo: 'Cierre y Entrega de Constancias', descripcion: 'Conteo final, agradecimientos y entrega de constancia ambiental digital.' },
    ],
    incluye: [
      'Guantes, palas pequeñas y propágulos seleccionados.',
      'Estación de hidratación (agua purificada).',
      'Seguro básico de brigadista voluntario y botiquín en sitio.',
      'Constancia digital oficial con código QR de validación.',
    ],
    llevar: [
      '**Termo o cilindro reutilizable** de al menos 1 litro.',
      '**Calzado acuático cerrado** o botas de hule que puedan mojarse.',
      '**Gorra y ropa ligera de manga larga** que puedas ensuciar.',
      '**Bloqueador solar biodegradable** libre de oxibenzona.',
    ],
  },

  {
    slug: 'patrullaje-nocturno-tortuga-marina-todos-santos',
    titulo_evento: 'Patrullaje Nocturno de Tortuga Marina',
    subtitulo_evento: 'Una noche para proteger a las hembras anidadoras del Pacífico',
    descripcion_evento: [
      'Recorrido nocturno a pie para detección de hembras anidadoras, biometría y traslado de nidos a corral de incubación. Las playas del Pacífico sudcaliforniano reciben cada temporada a tortugas golfinas, laúd y prieta que regresan a desovar en la misma arena donde nacieron.',
      'Acompañarás a las brigadas del campamento en caminatas de baja intensidad con luz roja para no desorientar a las tortugas. Si aparece una hembra, el personal autorizado tomará las medidas biométricas y colocará el nido en el corral de incubación; los voluntarios apoyan anotando datos y manteniendo la distancia indicada.',
      'Los registros de la noche se suman al programa de conservación que mantiene el campamento desde hace más de veinte años.',
    ].join('\n\n'),
    categoria: 'fauna',
    etiqueta_imagen: 'PACÍFICO SUDCALIFORNIANO',
    insignia_tarjeta: null,
    badges: ['Programa de Conservación de Tortugas', 'Cuota de recuperación', 'Constancia Ambiental'],
    fase_evento: 'Temporada de anidación 2026',
    imagenes: ['/eventos/playa-main.webp', '/eventos/coast-hero.jpg'],
    fecha_evento: '2026-11-13',
    hora_inicio: '19:00',
    hora_fin: '22:30',
    duracion_horas: 3.5,
    lugar_evento: 'Playa San Cristóbal',
    localidad: 'Todos Santos',
    punto_encuentro_nombre: 'Campamento Las Playitas',
    punto_encuentro_direccion: 'Playa San Cristóbal, Todos Santos, B.C.S.',
    latitud: 23.3870,
    longitud: -110.2030,
    responsable_nombre: 'M. en C. Daniela Ojeda',
    responsable_cargo: 'Coordinadora del Campamento Tortuguero',
    responsable_correo: 'campamento@lasplayitas.org',
    responsable_telefono: '+52 612 345 6789',
    responsable_cita: 'Cada nido protegido es una oportunidad para que una tortuga vuelva a casa dentro de treinta años.',
    cupo_total: 20,
    cupos_ocupados: 12,
    forms_url: FORMS_DEMO,
    metricas: [
      { valor: '3 Km', detalle: 'Recorrido a pie', icono: 'flask' },
      { valor: '4 Brigadas', detalle: 'Con guía autorizado', icono: 'scale' },
      { valor: 'Folio Oficial', detalle: 'Constancia curricular', icono: 'badge' },
    ],
    reglas_titulo: 'Reglas de Respeto para el Patrullaje Nocturno',
    reglas_intro: 'Las tortugas son muy sensibles a la luz y al ruido. Estas reglas protegen su anidación.',
    reglas: [
      { titulo: 'Solo Luz Roja', texto: 'Está prohibido usar lámparas blancas, flash o pantallas brillantes en la playa.', icono: 'ban' },
      { titulo: 'Distancia Segura', texto: 'Nadie toca ni se acerca a una tortuga sin indicación del personal autorizado.', icono: 'paw' },
      { titulo: 'Silencio Absoluto', texto: 'Hablamos en voz baja y sin bocinas ni música.', icono: 'clock' },
      { titulo: 'Respeto a Dunas', texto: 'Caminamos por la línea de marea, sin pisar la duna ni los nidos marcados.', icono: 'leaf' },
    ],
    preguntas_frecuentes: [
      { pregunta: '¿Está garantizado ver una tortuga?', respuesta: 'No. Es fauna silvestre; hay noches sin avistamientos. Lo que sí hacemos es el patrullaje y el registro.' },
      { pregunta: '¿Pueden asistir menores de edad?', respuesta: 'Sí, desde los 12 años con un adulto responsable.' },
      { pregunta: '¿Qué pasa si hay mal clima?', respuesta: 'Se reprograma y se avisa por correo a los inscritos.' },
    ],
    organizadores: [
      { nombre: 'Campamento Las Playitas A.C.', nombre_corto: 'Campamento Las Playitas A.C.', descripcion: 'Conservación de tortugas marinas' },
    ],
    lineas: [['TortugasMarinas', true], ['Conservación'], ['Patrullaje'], ['PacíficoBCS'], ['CienciaCiudadana']],
    itinerario: [
      { hora: '19:00', titulo: 'Bienvenida y Registro', descripcion: 'Firma de deslinde, entrega de gafete y formación de brigadas en el campamento.' },
      { hora: '19:30', titulo: 'Plática de Seguridad y Protocolos', descripcion: 'Uso de luz roja, distancias, reglas para no perturbar a las hembras y primeros auxilios básicos.' },
      { hora: '20:00', titulo: 'Patrullaje a Pie', descripcion: 'Recorrido por la playa en brigadas de 5 personas con guía. Detección de huellas y hembras anidadoras.' },
      { hora: '21:45', titulo: 'Biometría y Traslado de Nidos', descripcion: 'Si hay nido, el personal autorizado lo traslada al corral de incubación y registra los datos.' },
      { hora: '22:15', titulo: 'Cierre de Jornada', descripcion: 'Bitácora final, chocolate caliente y entrega de constancia digital.' },
    ],
    incluye: [
      'Guía autorizado por brigada y lámparas de luz roja.',
      'Bitácora de campo y gafete foliado.',
      'Bebida caliente al finalizar.',
      'Constancia digital oficial con código QR de validación.',
    ],
    llevar: [
      '**Ropa abrigadora**: en la playa baja la temperatura.',
      '**Calzado cerrado** que pueda mojarse.',
      '**Repelente sin aroma fuerte** para insectos.',
      '**Termo reutilizable** con agua o bebida caliente.',
    ],
  },

  {
    slug: 'censo-viveros-coral-cabo-pulmo',
    titulo_evento: 'Censo y Viveros de Coral en Cabo Pulmo',
    subtitulo_evento: 'Restauración activa del arrecife más antiguo del Golfo de California',
    descripcion_evento: [
      'Jornada de limpieza y mantenimiento de microfragmentación de coral Pocillopora en arrecife con monitoreo submarino. Cabo Pulmo es el ejemplo mundial más citado de recuperación marina gracias a su comunidad, y hoy el reto es acelerar la recuperación de las zonas dañadas por huracanes.',
      'Los participantes con certificación de buceo apoyarán a los técnicos en la limpieza de las estructuras de vivero, el trasplante de microfragmentos y el censo de peces indicadores. Quienes no buceen pueden sumarse al equipo de superficie con registro de datos y apoyo logístico.',
      'Toda la información se integra al monitoreo anual del parque nacional.',
    ].join('\n\n'),
    categoria: 'preservacion',
    etiqueta_imagen: 'UNESCO CABO PULMO',
    insignia_tarjeta: null,
    badges: ['Parque Nacional Cabo Pulmo', 'Requiere certificación de buceo', 'Constancia Ambiental'],
    fase_evento: 'Programa de Restauración 2026',
    imagenes: ['/eventos/cabo-pulmo.jpg', '/eventos/coast-hero.jpg'],
    fecha_evento: '2026-11-21',
    hora_inicio: '08:30',
    hora_fin: '13:30',
    duracion_horas: 5,
    lugar_evento: 'Parque Nacional Cabo Pulmo',
    localidad: 'Los Cabos',
    punto_encuentro_nombre: 'Muelle y Caseta de Guardaparques de Cabo Pulmo',
    punto_encuentro_direccion: 'Cabo Pulmo, Los Cabos, B.C.S.',
    latitud: 23.4475,
    longitud: -109.4311,
    responsable_nombre: 'Biól. Mauricio Leyva',
    responsable_cargo: 'Coordinador de Restauración de Arrecifes',
    responsable_correo: 'arrecifes@amigoscabopulmo.org',
    responsable_telefono: '+52 624 456 7890',
    responsable_cita: 'Un fragmento de coral bien cuidado hoy es una colonia entera dentro de diez años.',
    cupo_total: 15,
    cupos_ocupados: 8,
    forms_url: FORMS_DEMO,
    metricas: [
      { valor: '60 Fragmentos', detalle: 'Meta de trasplante', icono: 'flask' },
      { valor: '2 Inmersiones', detalle: 'Con técnicos', icono: 'scale' },
      { valor: 'Folio Oficial', detalle: 'Constancia curricular', icono: 'badge' },
    ],
    reglas_titulo: 'Reglas de Respeto Ecológico en Cabo Pulmo',
    reglas_intro: 'El arrecife es frágil: un solo contacto puede matar una colonia de coral.',
    reglas: [
      { titulo: 'No Tocar el Coral', texto: 'Se mantiene control de flotabilidad y nadie apoya manos, aletas ni equipo sobre el arrecife.', icono: 'ban' },
      { titulo: 'Solo con Guía', texto: 'Todas las inmersiones se hacen con guías certificados de la comunidad.', icono: 'leaf' },
      { titulo: 'Bloqueador Reef-Safe', texto: 'Solo se permite bloqueador biodegradable libre de oxibenzona.', icono: 'paw' },
      { titulo: 'Respeto a la Fauna', texto: 'Distancia mínima con tortugas, mantas y tiburones toro.', icono: 'clock' },
    ],
    preguntas_frecuentes: [
      { pregunta: '¿Necesito certificación de buceo?', respuesta: 'Para las inmersiones sí (mínimo Open Water). Sin certificación puedes apoyar en superficie.' },
      { pregunta: '¿Incluye equipo de buceo?', respuesta: 'No. Se puede rentar en la comunidad; pregunta por descuentos a voluntarios.' },
      { pregunta: '¿Y si el mar está agitado?', respuesta: 'Se reprograma por seguridad y se avisa a los inscritos por correo.' },
    ],
    organizadores: [
      { nombre: 'Amigos para la Conservación de Cabo Pulmo', nombre_corto: 'Amigos Conservación Cabo Pulmo', descripcion: 'Organización comunitaria' },
      { nombre: 'Parque Nacional Cabo Pulmo (CONANP)', nombre_corto: 'CONANP', descripcion: 'Autoridad del área protegida' },
    ],
    lineas: [['Restauración', true], ['Arrecifes'], ['Buceo'], ['CoralPocillopora'], ['CienciaCiudadana']],
    itinerario: [
      { hora: '08:30', titulo: 'Registro y Briefing', descripcion: 'Registro, revisión de certificaciones y explicación del plan de inmersión.' },
      { hora: '09:15', titulo: 'Salida en Embarcación', descripcion: 'Traslado al sitio de viveros con los guías y técnicos.' },
      { hora: '10:00', titulo: 'Primera Inmersión: Limpieza de Viveros', descripcion: 'Limpieza de estructuras y retiro de algas competidoras.' },
      { hora: '11:45', titulo: 'Segunda Inmersión: Trasplante y Censo', descripcion: 'Trasplante de microfragmentos y censo de peces indicadores.' },
      { hora: '13:00', titulo: 'Captura de Datos y Cierre', descripcion: 'Captura de bitácoras y entrega de constancias.' },
    ],
    incluye: [
      'Embarcación y guías certificados de la comunidad.',
      'Tanque y lastre para buzos certificados (según disponibilidad).',
      'Agua purificada y fruta al finalizar.',
      'Constancia digital oficial con código QR de validación.',
    ],
    llevar: [
      '**Certificación de buceo vigente** (Open Water o superior) si vas a sumergirte.',
      '**Traje de neopreno** de acuerdo con la temporada.',
      '**Bloqueador solar biodegradable** libre de oxibenzona.',
      '**Termo reutilizable** y toalla.',
    ],
  },
];

export async function seedEventosIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM eventos');
  if (rows[0].total > 0) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const e of eventos) {
      const inserted = await client.query(
        `INSERT INTO eventos (
           slug, titulo_evento, subtitulo_evento, descripcion_evento, categoria, etiqueta_imagen,
           insignia_tarjeta, badges, fase_evento, imagenes, fecha_evento, hora_inicio, hora_fin,
           duracion_horas, lugar_evento, localidad, punto_encuentro_nombre, punto_encuentro_direccion,
           latitud, longitud, responsable_nombre, responsable_cargo, responsable_correo,
           responsable_telefono, responsable_cita, cupo_total, cupos_ocupados, forms_url,
           metricas, reglas_titulo, reglas_intro, reglas, preguntas_frecuentes
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
           $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33
         ) RETURNING id`,
        [
          e.slug, e.titulo_evento, e.subtitulo_evento, e.descripcion_evento, e.categoria, e.etiqueta_imagen,
          e.insignia_tarjeta, e.badges, e.fase_evento, e.imagenes, e.fecha_evento, e.hora_inicio, e.hora_fin,
          e.duracion_horas, e.lugar_evento, e.localidad, e.punto_encuentro_nombre, e.punto_encuentro_direccion,
          e.latitud, e.longitud, e.responsable_nombre, e.responsable_cargo, e.responsable_correo,
          e.responsable_telefono, e.responsable_cita, e.cupo_total, e.cupos_ocupados, e.forms_url,
          JSON.stringify(e.metricas), e.reglas_titulo, e.reglas_intro,
          JSON.stringify(e.reglas), JSON.stringify(e.preguntas_frecuentes),
        ]
      );
      const id = inserted.rows[0].id;

      for (const [i, p] of e.itinerario.entries()) {
        await client.query(
          `INSERT INTO evento_itinerario (evento_id, orden, titulo, hora, descripcion) VALUES ($1,$2,$3,$4,$5)`,
          [id, i + 1, p.titulo, p.hora, p.descripcion]
        );
      }
      for (const [i, o] of e.organizadores.entries()) {
        await client.query(
          `INSERT INTO evento_organizadores (evento_id, orden, nombre, nombre_corto, descripcion) VALUES ($1,$2,$3,$4,$5)`,
          [id, i + 1, o.nombre, o.nombre_corto, o.descripcion]
        );
      }
      for (const [i, [etiqueta, destacada]] of e.lineas.entries()) {
        await client.query(
          `INSERT INTO evento_lineas_impacto (evento_id, orden, etiqueta, destacada) VALUES ($1,$2,$3,$4)`,
          [id, i + 1, etiqueta, Boolean(destacada)]
        );
      }
      for (const [i, texto] of e.incluye.entries()) {
        await client.query(`INSERT INTO evento_incluye (evento_id, orden, texto) VALUES ($1,$2,$3)`, [id, i + 1, texto]);
      }
      for (const [i, texto] of e.llevar.entries()) {
        await client.query(`INSERT INTO evento_llevar (evento_id, orden, texto) VALUES ($1,$2,$3)`, [id, i + 1, texto]);
      }
    }

    await client.query('COMMIT');
    console.log(`[db] ${eventos.length} eventos de prueba insertados.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
