import { query } from '../config/db.js';

export async function createDestinosTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS destinos (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      location VARCHAR(200) NOT NULL,
      label VARCHAR(200),
      tag VARCHAR(100),
      category VARCHAR(100),
      description TEXT,
      image TEXT,
      images TEXT[] DEFAULT '{}',
      rules JSONB DEFAULT '[]',
      best_activities TEXT,
      coordinates JSONB DEFAULT '[]',
      rating NUMERIC(3,1),
      review_count INTEGER DEFAULT 0,
      rating_breakdown JSONB DEFAULT '[]',
      reviews JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Las reglas de formato del ID (letras y guiones) se validan solo en el frontend.
  // Por si una versión anterior creó la restricción, se elimina.
  await query(`ALTER TABLE destinos DROP CONSTRAINT IF EXISTS destinos_id_formato_chk;`);

  // Mantiene sincronizadas la imagen principal (tarjeta) y el arreglo del carrusel (detalle).
  await query(`
    CREATE OR REPLACE FUNCTION sync_destino_imagen()
    RETURNS trigger AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        IF NEW.image IS NOT NULL AND (NEW.images IS NULL OR cardinality(NEW.images) = 0) THEN
          NEW.images := ARRAY[NEW.image];
        END IF;
      ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.image IS DISTINCT FROM OLD.image
           AND NEW.images IS NOT DISTINCT FROM OLD.images THEN
          NEW.images := ARRAY[NEW.image];
        ELSIF NEW.images IS DISTINCT FROM OLD.images
              AND NEW.image IS NOT DISTINCT FROM OLD.image
              AND cardinality(NEW.images) > 0 THEN
          NEW.image := NEW.images[1];
        END IF;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await query(`DROP TRIGGER IF EXISTS trg_sync_destino_imagen ON destinos;`);
  await query(`
    CREATE TRIGGER trg_sync_destino_imagen
    BEFORE INSERT OR UPDATE ON destinos
    FOR EACH ROW
    EXECUTE FUNCTION sync_destino_imagen();
  `);

  // Repara registros creados antes del trigger.
  await query(`
    UPDATE destinos
    SET images = ARRAY[image]
    WHERE image IS NOT NULL
      AND (images IS NULL OR NOT (image = ANY(images)));
  `);
}
