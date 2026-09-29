import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'tudestino:eventos-guardados';

function read() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Eventos marcados con el corazón ("Mis Eventos"). Se guardan en el navegador. */
export function useSavedEvents() {
  const [saved, setSaved] = useState(read);

  // Mantiene sincronizadas varias pestañas / componentes.
  useEffect(() => {
    const sync = () => setSaved(read());
    window.addEventListener('storage', sync);
    window.addEventListener('tudestino:saved-events', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('tudestino:saved-events', sync);
    };
  }, []);

  const toggle = useCallback((slug) => {
    const current = read();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // almacenamiento no disponible: el estado solo vive en memoria
    }
    setSaved(next);
    window.dispatchEvent(new Event('tudestino:saved-events'));
  }, []);

  return { saved, isSaved: (slug) => saved.includes(slug), toggle };
}
