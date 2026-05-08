'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearTokens, setTokens } from '@/lib/api';

export type UserRole = 'ADMIN' | 'OPERATOR';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      logout: () => {
        clearTokens();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'eg-auth',
      // Ao reidratar, sincroniza tokens com o módulo axios
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken && state?.refreshToken) {
          setTokens(state.accessToken, state.refreshToken);
        }
      },
    },
  ),
);
