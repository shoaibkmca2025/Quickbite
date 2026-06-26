import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
  type?: 'default' | 'success';
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, type?: Toast['type']) => void;
  remove: (id: number) => void;
}

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (message, type = 'default') => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
