import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

const BASE_KEY = 'tudestino:eventos-guardados';
const EVENT_NAME = 'tudestino:saved-events';

// Cada usuario tiene su propia lista: la llave lleva el id de la cuenta.
const keyFor = (userId) => (userId ? `${BASE_KEY}:${userId}` : null);

function read(key) {
  if (!key) return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Eventos marcados con el corazón ("Mis Eventos"). Se guardan en el navegador, por usuario. */
export function useSavedEvents() {
  const userId = useAuthStore((state) => state.user?.id);
  const key = keyFor(userId);
  const [saved, setSaved] = useState(() => read(key));

  // Al cambiar de cuenta se carga la lista de esa cuenta; también sincroniza pestañas / componentes.
  useEffect(() => {
    setSaved(read(key));
    const sync = () => setSaved(read(key));
    window.addEventListener('storage', sync);
    window.addEventListener(EVENT_NAME, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(EVENT_NAME, sync);
    };
  }, [key]);

  const toggle = useCallback((slug) => {
    if (!key) return; // sin sesión no se guarda nada
    const current = read(key);
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // almacenamiento no disponible: el estado solo vive en memoria
    }
    setSaved(next);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, [key]);

  return { saved, isSaved: (slug) => saved.includes(slug), toggle };
}
