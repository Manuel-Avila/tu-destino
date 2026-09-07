import { create } from 'zustand';
import { me, login as loginService, register as registerService } from '../services/auth.service';

const TOKEN_KEY = 'tudestino_token';

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,
  user: null,
  loading: Boolean(localStorage.getItem(TOKEN_KEY)),

  isAuthenticated: () => Boolean(get().token && get().user),

  persistSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  loadCurrentUser: async () => {
    const { token } = get();
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const data = await me();
      set({ user: data.user, loading: false });
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
      set({ token: null, user: null, loading: false });
    }
  },

  register: async ({ fullName, email, password }) => {
    const data = await registerService({ fullName, email, password });
    get().persistSession(data.token, data.user);
    return data.user;
  },

  login: async ({ email, password }) => {
    const data = await loginService({ email, password });
    get().persistSession(data.token, data.user);
    return data.user;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },
}));
