// Lugares de "Inmersión BCS".
// Cada escena es una foto 360° (equirectangular) y un bloque `html` con sus flechas,
// igual que los grupos de bcsxplora:
//   class="adelante" / class="atras"  -> tipo de flecha
//   spot="linkto: c2"                 -> id de la escena a la que lleva (opcional: size: 2)
//   position="x y z"                  -> dónde se coloca (la cámara está en 0 0 0, -z es el
//                                        centro de la imagen, +x la derecha, -y el suelo)
// Al llegar a una escena la cámara mira hacia su flecha "adelante".
const BASE = import.meta.env.BASE_URL;

export const IMMERSION_PLACES = [
  {
    id: 'malecon-la-paz',
    name: 'Malecón de La Paz',
    label: 'Próximamente 360°',
    description: 'El paseo frente a la bahía, muy pronto en recorrido inmersivo.',
    lat: 24.1635,
    lng: -110.3166,
    scenes: [],
  },
  {
    id: 'playa-conchalito',
    name: 'Playa Conchalito',
    label: 'Recorrido 360°',
    description: 'Camina la costa de El Conchalito, entre la playa, el manglar y el malecón de madera.',
    lat: 24.1381,
    lng: -110.3475,
    scenes: [
      {
        id: 'c1',
        src: `${BASE}360/conchalito/c1.jpg`,
        html: `
          <a-image class="adelante" spot="linkto: c2" position="-4.1 -1.7 4.0"></a-image>
        `,
      },
      {
        id: 'c2',
        src: `${BASE}360/conchalito/c2.jpg`,
        html: `
          <a-image class="adelante" spot="linkto: c3" position="-1.6 -1.6 5.6"></a-image>
          <a-image class="atras" spot="linkto: c1" position="-1.3 -0.6 -5.8"></a-image>
        `,
      },
      {
        id: 'c3',
        src: `${BASE}360/conchalito/c3.jpg`,
        html: `
          <a-image class="adelante" spot="linkto: c4" position="-0.9 -1.0 -5.8"></a-image>
          <a-image class="atras" spot="linkto: c2" position="1.1 -1.3 5.7"></a-image>
        `,
      },
      {
        id: 'c4',
        src: `${BASE}360/conchalito/c4.jpg`,
        html: `
          <!-- C4 venía sin marcas: esta posición es estimada, muévela a ojo -->
          <a-image class="atras" spot="linkto: c3" position="0 -0.8 -5.9"></a-image>
        `,
      },
    ],
  },
];

export const SPOT_NEXT = `${BASE}360/spot-next.png`;
export const SPOT_BACK = `${BASE}360/spot-back.png`;

export function getImmersionPlace(id) {
  return IMMERSION_PLACES.find((place) => place.id === id) || null;
}
