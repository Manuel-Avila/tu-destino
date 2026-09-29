import { query } from '../config/db.js';

/**
 * Tablas del módulo de Eventos Ecológicos.
 * Se llama desde initDb() (db/init.js) al arrancar el servidor.
 *
 *  eventos                → datos principales (titulo_evento, descripcion_evento, lugar, coordenadas,
 *                           responsable, cupos, liga de Google Forms, etc.)
 *  evento_itinerario      → pasos del programa (titulo, hora, descripcion). Un renglón por paso.
 *  evento_organizadores   → instituciones que organizan / avalan el evento.
 *  evento_lineas_impacto  → etiquetas (#CeroPlásticos…) que se ven en la tarjeta y en el detalle.
 *  evento_incluye         → lista "Qué incluye la jornada".
 *  evento_llevar          → lista "Qué debes llevar".
 *  evento_inscripciones   → una fila por cada respuesta confirmada del Google Form (evita duplicados).
 */
export async function createEventosTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS eventos (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(120) NOT NULL UNIQUE,

      titulo_evento VARCHAR(200) NOT NULL,
      subtitulo_evento VARCHAR(255),
      -- Párrafos separados por una línea en blanco. La tarjeta usa solo el primero.
      descripcion_evento TEXT NOT NULL,

      -- limpieza | reforestacion | fauna | educacion | preservacion
      categoria VARCHAR(40) NOT NULL,
      etiqueta_imagen VARCHAR(80),
      insignia_tarjeta VARCHAR(40),
      badges TEXT[] NOT NULL DEFAULT '{}',
      fase_evento VARCHAR(80),
      imagenes TEXT[] NOT NULL DEFAULT '{}',

      fecha_evento DATE NOT NULL,
      hora_inicio TIME NOT NULL,
      hora_fin TIME NOT NULL,
      duracion_horas NUMERIC(4,1) NOT NULL,

      -- Dónde será
      lugar_evento VARCHAR(200) NOT NULL,
      localidad VARCHAR(120) NOT NULL,
      punto_encuentro_nombre VARCHAR(200),
      punto_encuentro_direccion TEXT,
      latitud DOUBLE PRECISION NOT NULL,
      longitud DOUBLE PRECISION NOT NULL,

      -- Encargado
      responsable_nombre VARCHAR(150) NOT NULL,
      responsable_cargo VARCHAR(150),
      responsable_correo VARCHAR(255) NOT NULL,
      responsable_telefono VARCHAR(30) NOT NULL,
      responsable_cita TEXT,

      -- Convocatoria
      cupo_total INTEGER NOT NULL CHECK (cupo_total > 0),
      cupos_ocupados INTEGER NOT NULL DEFAULT 0 CHECK (cupos_ocupados >= 0),
      forms_url TEXT,

      metricas JSONB NOT NULL DEFAULT '[]',
      reglas_titulo VARCHAR(200),
      reglas_intro TEXT,
      reglas JSONB NOT NULL DEFAULT '[]',
      preguntas_frecuentes JSONB NOT NULL DEFAULT '[]',

      activo BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CHECK (cupos_ocupados <= cupo_total)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS evento_itinerario (
      id SERIAL PRIMARY KEY,
      evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
      orden INTEGER NOT NULL,
      titulo VARCHAR(200) NOT NULL,
      hora TIME NOT NULL,
      descripcion TEXT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS evento_organizadores (
      id SERIAL PRIMARY KEY,
      evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
      orden INTEGER NOT NULL,
      nombre VARCHAR(200) NOT NULL,
      -- Versión corta que se muestra en la tarjeta ("CONANP", "Balandra Viva")
      nombre_corto VARCHAR(100) NOT NULL,
      descripcion VARCHAR(255)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS evento_lineas_impacto (
      id SERIAL PRIMARY KEY,
      evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
      orden INTEGER NOT NULL,
      etiqueta VARCHAR(60) NOT NULL,
      destacada BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS evento_incluye (
      id SERIAL PRIMARY KEY,
      evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
      orden INTEGER NOT NULL,
      texto TEXT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS evento_llevar (
      id SERIAL PRIMARY KEY,
      evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
      orden INTEGER NOT NULL,
      -- Se puede resaltar con **negritas**
      texto TEXT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS evento_inscripciones (
      id SERIAL PRIMARY KEY,
      evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
      -- ID de la respuesta en Google Forms: evita contar dos veces la misma inscripción.
      respuesta_id VARCHAR(120) NOT NULL,
      nombre VARCHAR(150),
      correo VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (evento_id, respuesta_id)
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos (fecha_evento);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_evento_itinerario ON evento_itinerario (evento_id, orden);`);
}
