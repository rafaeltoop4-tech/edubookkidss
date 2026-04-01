import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ADMIN_STORAGE_KEY, isValidAdminCredentials } from '@/lib/adminAuth';

interface AuthStore {
  isAdmin: boolean;
  isLoading: boolean;
  setHydrated: () => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      isLoading: true,
      setHydrated: () => set({ isLoading: false }),
      login: (username: string, password: string) => {
        if (isValidAdminCredentials(username, password)) {
          set({ isAdmin: true, isLoading: false });
          return true;
        }
        set({ isAdmin: false, isLoading: false });
        return false;
      },
      logout: () => {
        set({ isAdmin: false, isLoading: false });
      },
      checkAuth: () => {
        return get().isAdmin;
      }
    }),
    {
      name: ADMIN_STORAGE_KEY,
      partialize: (state) => ({ isAdmin: state.isAdmin }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
