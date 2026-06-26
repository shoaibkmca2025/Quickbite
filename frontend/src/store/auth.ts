import { create } from 'zustand';
import { api, tokenStore } from '../api';
import { connectSocket, disconnectSocket } from '../socket';
import type { AuthUser, Role } from '../types';

interface AuthState {
  user: AuthUser | null;
  bootstrapping: boolean;
  bootstrap: () => Promise<void>;
  requestOtp: (phone: string) => Promise<{ devCode?: string }>;
  verifyOtp: (phone: string, code: string, name?: string, role?: Role) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  bootstrapping: true,

  bootstrap: async () => {
    const token = await tokenStore.get();
    if (!token) {
      set({ bootstrapping: false });
      return;
    }
    try {
      const res = await api.get<AuthUser>('/auth/me');
      set({ user: res.data, bootstrapping: false });
      await connectSocket();
    } catch {
      await tokenStore.clear();
      set({ user: null, bootstrapping: false });
    }
  },

  requestOtp: async (phone) => {
    const res = await api.post<{ devCode?: string }>('/auth/otp/request', { phone }, { auth: false });
    return res.data;
  },

  verifyOtp: async (phone, code, name, role) => {
    const res = await api.post<{ user: AuthUser; accessToken: string; refreshToken: string }>(
      '/auth/otp/verify',
      { phone, code, name, role },
      { auth: false }
    );
    await tokenStore.set(res.data.accessToken, res.data.refreshToken);
    set({ user: res.data.user });
    await connectSocket();
  },

  refreshUser: async () => {
    try {
      const res = await api.get<AuthUser>('/auth/me');
      set({ user: res.data });
    } catch {
      /* ignore */
    }
  },

  logout: async () => {
    await tokenStore.clear();
    disconnectSocket();
    set({ user: null });
  },
}));
