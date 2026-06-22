import { create } from 'zustand';

export const useSalesStore = create((set) => ({
  sales: [],
  isLoading: false,
  error: null,

  setSales:   (sales) => set({ sales }),
  setLoading: (isLoading) => set({ isLoading }),
  setError:   (error) => set({ error }),

  addSale: (sale) =>
    set((s) => ({ sales: [sale, ...s.sales] })),

  removeSale: (id) =>
    set((s) => ({ sales: s.sales.filter(x => x.id !== id) })),

  reset: () => set({ sales: [], error: null }),
}));