import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Credenciais fixas do admin
const ADMIN_CREDENTIALS = {
  username: 'Prooadmin',
  password: 'Rafa31200'
};

interface AuthStore {
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      isLoading: false,
      login: (username: string, password: string) => {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
          set({ isAdmin: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ isAdmin: false });
      },
      checkAuth: () => {
        return get().isAdmin;
      }
    }),
    {
      name: 'edu-book-admin-auth',
    }
  )
);
