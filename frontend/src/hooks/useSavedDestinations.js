import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'tudestino:destinos-guardados';
const EVENT_NAME = 'tudestino:saved-destinos';

function read() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Destinos marcados con el corazón. Se guardan en el navegador (igual que los eventos guardados). */
export function useSavedDestinations() {
  const [saved, setSaved] = useState(read);

  useEffect(() => {
    const sync = () => setSaved(read());
    window.addEventListener('storage', sync);
    window.addEventListener(EVENT_NAME, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(EVENT_NAME, sync);
    };
  }, []);

  const toggle = useCallback((id) => {
    const current = read();
    const next = current.includes(id) ? current.filter((s) => s !== id) : [...current, id];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // almacenamiento no disponible: el estado solo vive en memoria
    }
    setSaved(next);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return { saved, isSaved: (id) => saved.includes(id), toggle };
}
