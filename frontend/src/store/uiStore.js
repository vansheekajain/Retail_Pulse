import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      language: 'en',
      activeStoreId: null,
      stores: [],
      isOnline: navigator.onLine,
      darkMode: false,
      _hasHydrated: false,

      setLanguage:    (lang)   => set({ language: lang }),
      setActiveStore: (id)     => set({ activeStoreId: id }),
      setStores:      (stores) => set({ stores }),
      setOnline:      (online) => set({ isOnline: online }),
      toggleDarkMode: ()       => set((s) => ({ darkMode: !s.darkMode })),
      setDarkMode:    (val)    => set({ darkMode: val }),
    }),
    {
      name: 'hl-ui',
      partialize: (s) => ({
        language:     s.language,
        activeStoreId: s.activeStoreId,
        darkMode:     s.darkMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
    }
  )
);

window.addEventListener('online',  () => useUIStore.getState().setOnline(true));
window.addEventListener('offline', () => useUIStore.getState().setOnline(false));