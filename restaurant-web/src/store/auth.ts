import { create } from 'zustand';
import { api, tokenStore } from '../lib/api';
import { disconnectSocket } from '../lib/socket';
import type { AuthUser } from '../lib/types';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  registerRestaurant: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  init: async () => {
    if (!tokenStore.get()) {
      set({ loading: false });
      return;
    }
    try {
      const res = await api.get<AuthUser>('/auth/me');
      set({ user: res.data, loading: false });
    } catch {
      tokenStore.clear();
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const res = await api.post<{ user: AuthUser; accessToken: string; refreshToken: string }>(
        '/auth/login',
        { email, password },
        { auth: false }
      );
      if (res.data.user.role !== 'restaurant' && res.data.user.role !== 'admin') {
        throw new Error('This portal is for restaurant and admin accounts only.');
      }
      tokenStore.set(res.data.accessToken, res.data.refreshToken);
      set({ user: res.data.user });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Login failed' });
      throw err;
    }
  },

  registerRestaurant: async (payload) => {
    set({ error: null });
    await api.post('/restaurants/register', payload, { auth: false });
  },

  logout: () => {
    tokenStore.clear();
    disconnectSocket();
    set({ user: null });
  },
}));
