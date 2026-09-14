import balandraImage from '../assets/balandra-playa.jpg';
import caboImage from '../assets/cabo-pulmo.jpg';
import espirituImage from '../assets/coast-hero.jpg';
import loretoImage from '../assets/playa.jpg';

export const destinationsData = [
  {
    id: 'balandra',
    name: 'Playa Balandra',
    location: 'La Paz, B.C.S.',
    label: 'Área de Protección de Flora y Fauna',
    category: 'kayak',
    description: 'Reconocida como una de las playas más hermosas de México, su ecosistema frágil de manglares y aguas cristalinas de poca profundidad necesita tu cuidado constante.',
    image: balandraImage,
    rules: [
      'Sin plásticos de un solo uso',
      'Uso de protector solar biodegradable (Reef-Safe)',
      'Aforo controlado por turnos matutino y vespertino',
      'Prohibido pisar o dañar los manglares',
    ],
    bestActivities: 'Kayak suave, paddle board y senderismo por rutas autorizadas.',
    coordinates: [24.3216, -110.3242],
  },
  {
    id: 'pulmo',
    name: 'Parque Nacional Cabo Pulmo',
    location: 'Los Cabos / La Ribera, B.C.S.',
    label: 'Parque Nacional y Arrecife Vivo',
    category: 'snorkel',
    description: 'El arrecife de coral duro más antiguo del Golfo de California y el ejemplo mundial más exitoso de regeneración marina protegida por su comunidad.',
    image: caboImage,
    rules: [
      'Prohibido tocar o pararse sobre los corales vivos',
      'Ingreso exclusivamente con guías certificados de la comunidad',
      'Prohibida la pesca deportiva y comercial en la zona núcleo',
      'Distancia mínima con tortugas, mantas y tiburones toro',
    ],
    bestActivities: 'Buceo y snorkel en arrecife, observación de cardúmenes masivos.',
    coordinates: [23.4475, -109.4311],
  },
  {
    id: 'espiritu',
    name: 'Isla Espíritu Santo',
    location: 'Bahía de La Paz, B.C.S.',
    label: 'Reserva de la Biósfera UNESCO',
    category: 'senderismo',
    description: 'Joya insular de contrastes desérticos y caletas turquesas, hogar de una colonia protegida de lobos marinos y aves marinas protegidas.',
    image: espirituImage,
    rules: [
      'Distancia mínima reglamentaria con los lobos marinos',
      'Todo residuo generado debe regresar a tierra continental',
      'Prohibido ingresar con mascotas o especies exóticas',
      'Senderismo únicamente por senderos trazados por CONANP',
    ],
    bestActivities: 'Nado respetuoso con lobos marinos en temporada, kayak y campamento regulado.',
    coordinates: [24.4842, -110.3164],
  },
  {
    id: 'loreto',
    name: 'Parque Nacional Bahía de Loreto',
    location: 'Loreto, B.C.S.',
    label: 'Santuario de Cetáceos y Parque Marino',
    category: 'snorkel',
    description: 'Cinco islas vírgenes que constituyen el santuario de alimentación y crianza de la ballena azul, delfines y gigantes marinos del Mar de Cortés.',
    image: loretoImage,
    rules: [
      'Velocidad de navegación reducida en zonas de avistamiento',
      'No alimentar ni perseguir a mamíferos marinos',
      'Portar brazalete CONANP obligatorio para conservación',
      'Uso de chaleco salvavidas obligatorio en recorridos',
    ],
    bestActivities: 'Avistamiento responsable de ballena azul, snorkel en aguas abiertas y senderismo.',
    coordinates: [25.9928, -111.1215],
  },
];
