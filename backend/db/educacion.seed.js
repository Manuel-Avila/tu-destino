import { query } from '../config/db.js';

/**
 * Contenido inicial de Educación Ambiental. Solo se inserta si la tabla está vacía,
 * así que el admin puede editar o borrar estas publicaciones sin que se regeneren.
 */
const publicaciones = [
  {
    titulo: 'Protección de Arrecifes de Coral',
    categoria: 'Arrecifes',
    imagen: '/eventos/cabo-pulmo.jpg',
    texto:
      'Los corales son colonias de animales vivos muy sensibles. Tocar un coral o pisarlo con aletas destruye décadas de crecimiento en segundos. Nunca apoyes tus pies en el fondo marino.',
  },
  {
    titulo: 'Los Manglares: Pulmones y Cunas',
    categoria: 'Manglares',
    imagen: '/eventos/balandra-playa.jpg',
    texto:
      'En Balandra, el manglar rojo retiene carbono, filtra el agua y protege a los alevines de peces. Está estrictamente prohibido talar ramas, tirar anclas o amarrar embarcaciones a sus raíces.',
  },
  {
    titulo: 'Avistamiento Ético de Fauna',
    categoria: 'Fauna marina',
    imagen: '/eventos/coast-hero.jpg',
    texto:
      'Al nadar cerca del tiburón ballena o lobos marinos en La Paz, guarda al menos 3 metros de separación. No uses flash subacuático ni intentes montar o sujetar a los animales.',
  },
  {
    titulo: 'Política de Basura Cero',
    categoria: 'Residuos',
    imagen: '/eventos/playa.jpg',
    texto:
      'El viento en BCS puede llevar bolsas y envases al mar rápidamente. Llévate de regreso todos tus residuos y, si ves basura dejada por otros, ayuda a recogerla.',
  },
];

export async function seedEducacionIfEmpty() {
  const { rows } = await query('SELECT COUNT(*) AS count FROM educacion_publicaciones');
  if (parseInt(rows[0].count, 10) > 0) return;

  for (const publicacion of publicaciones) {
    await query(
      `INSERT INTO educacion_publicaciones (titulo, imagen, texto, categoria)
       VALUES ($1, $2, $3, $4)`,
      [publicacion.titulo, publicacion.imagen, publicacion.texto, publicacion.categoria]
    );
  }

  console.log('[db] Publicaciones de educación insertadas (seed) correctamente.');
}
