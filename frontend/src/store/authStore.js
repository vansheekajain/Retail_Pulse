import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      _hasHydrated: false,

      setAuth:     (token, user) => set({ token, user }),
      setUser:     (user)        => set({ user }),
      clearAuth:   ()            => set({ token: null, user: null }),
      setHydrated: ()            => set({ _hasHydrated: true }),
      isAuthenticated: ()        => !!get().token,
    }),
    {
      name: 'hl-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);