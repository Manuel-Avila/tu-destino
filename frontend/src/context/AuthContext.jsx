import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'tudestino_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  // "loading" cubre la verificación inicial del token guardado.
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.me(token);
        if (!cancelled) setUser(data.user);
      } catch {
        // Token vencido/ inválido: limpiamos la sesión.
        if (!cancelled) {
          setToken(null);
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const persistSession = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const register = useCallback(
    async ({ fullName, email, password }) => {
      const data = await api.register({ fullName, email, password });
      persistSession(data.token, data.user);
      return data.user;
    },
    [persistSession]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const data = await api.login({ email, password });
      persistSession(data.token, data.user);
      return data.user;
    },
    [persistSession]
  );

  const loginWithGoogle = useCallback(
    async (idToken) => {
      const data = await api.google(idToken);
      persistSession(data.token, data.user);
      return data.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      register,
      login,
      loginWithGoogle,
      logout,
    }),
    [user, token, loading, register, login, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
