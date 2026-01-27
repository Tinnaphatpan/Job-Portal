import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';

export type UserRole = 'JOBSEEKER' | 'EMPLOYER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  companyName?: string;
  mustChangePassword?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ mustChangePassword: boolean }>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setTokens: (access: string, refresh: string, user: User) => void;
  updateUser: (updates: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyName?: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          sessionStorage.setItem('access_token', data.accessToken);
          sessionStorage.setItem('refresh_token', data.refreshToken);
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
          return { mustChangePassword: data.user.mustChangePassword || false };
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (registerData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', registerData);
          sessionStorage.setItem('access_token', data.accessToken);
          sessionStorage.setItem('refresh_token', data.refreshToken);
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        set({ user: null, accessToken: null, refreshToken: null });
      },

      setTokens: (access, refresh, user) => {
        sessionStorage.setItem('access_token', access);
        sessionStorage.setItem('refresh_token', refresh);
        set({ user, accessToken: access, refreshToken: refresh });
      },

      updateUser: (updates) => {
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : localStorage
      ),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
