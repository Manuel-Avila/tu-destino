import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Renderiza el botón oficial de Google (vía Google Identity Services,
 * cargado en index.html) y, al recibir el credential (un ID token JWT),
 * lo manda al backend en POST /api/auth/google para que lo verifique
 * y devuelva nuestro propio JWT de sesión.
 *
 * Requiere VITE_GOOGLE_CLIENT_ID en frontend/.env con el mismo Client ID
 * configurado en el backend (GOOGLE_CLIENT_ID).
 */
export default function GoogleSignInButton({ onError }) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(
    typeof window !== 'undefined' && Boolean(window.google?.accounts?.id)
  );

  useEffect(() => {
    if (scriptReady) return undefined;

    // El <script> de Google se carga async en index.html; si este
    // componente monta antes de que termine, esperamos con un poll corto.
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        setScriptReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [scriptReady]);

  useEffect(() => {
    if (!scriptReady || !GOOGLE_CLIENT_ID || !buttonRef.current) return;

    async function handleCredentialResponse(response) {
      try {
        await loginWithGoogle(response.credential);
        // La navegación post-login la maneja quien use este componente
        // (RegisterPage/LoginPage) revisando isAuthenticated, o bien
        // puedes forzar un redirect aquí si lo prefieres.
        window.location.assign('/dashboard');
      } catch (err) {
        onError?.(err.message || 'No se pudo iniciar sesión con Google.');
      }
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      width: 320,
      text: 'continue_with',
    });
  }, [scriptReady, loginWithGoogle, onError]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button type="button" className="auth-google" disabled>
        Continuar con Google (falta configurar VITE_GOOGLE_CLIENT_ID)
      </button>
    );
  }

  // El div lo reemplaza Google con su propio botón renderizado (iframe).
  return <div ref={buttonRef} className="auth-google-mount" />;
}
