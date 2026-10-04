import { create } from "zustand";
import type { UserStore, CreateStoreInput, UpdateStoreInput } from "../features/dashboard/types";

export type { UserStore, CreateStoreInput, UpdateStoreInput };

export interface DashboardState {
  stores: UserStore[];
  searchQuery: string;
  selectedStore: UserStore | null;
  isCreateModalOpen: boolean;
  isDetailsModalOpen: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  addStore: (input: CreateStoreInput) => void;
  updateStore: (id: string, updates: UpdateStoreInput) => void;
  deleteStore: (id: string) => void;
  setSelectedStore: (store: UserStore | null) => void;
  setCreateModalOpen: (open: boolean) => void;
  setDetailsModalOpen: (open: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stores: [],
  searchQuery: "",
  selectedStore: null,
  isCreateModalOpen: false,
  isDetailsModalOpen: false,

  setSearchQuery: (query) => set({ searchQuery: query }),

  addStore: (input) =>
    set((state) => {
      const newStore: UserStore = {
        id: `store_${Date.now()}`,
        name: input.name.trim(),
        slug: input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        plan: input.plan,
        allowsDelivery: input.allowsDelivery,
        allowsPickup: input.allowsPickup,
        productsCount: 0,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };
      return {
        stores: [newStore, ...state.stores],
        isCreateModalOpen: false,
      };
    }),

  updateStore: (id, updates) =>
    set((state) => {
      const updatedStores = state.stores.map((store) => {
        if (store.id !== id) return store;
        return {
          ...store,
          ...updates,
          name: updates.name !== undefined ? updates.name.trim() : store.name,
          slug:
            updates.slug !== undefined
              ? updates.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")
              : store.slug,
        };
      });
      const updatedSelected =
        state.selectedStore?.id === id
          ? updatedStores.find((s) => s.id === id) || null
          : state.selectedStore;

      return {
        stores: updatedStores,
        selectedStore: updatedSelected,
      };
    }),

  deleteStore: (id) =>
    set((state) => ({
      stores: state.stores.filter((store) => store.id !== id),
      selectedStore: state.selectedStore?.id === id ? null : state.selectedStore,
      isDetailsModalOpen: state.selectedStore?.id === id ? false : state.isDetailsModalOpen,
    })),

  setSelectedStore: (store) =>
    set({
      selectedStore: store,
      isDetailsModalOpen: store !== null,
    }),

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setDetailsModalOpen: (open) => set({ isDetailsModalOpen: open }),
}));
