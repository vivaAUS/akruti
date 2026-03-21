import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { categories as defaultCategories, type Category } from "@/data/categories";
import { products as defaultProducts } from "@/data/products";
import { type Product } from "@/lib/types";

interface CatalogStore {
  categories: Category[];
  products: Product[];
  upsertCategory: (cat: Category) => void;
  removeCategory: (id: string) => void;
  moveCategory: (id: string, direction: "up" | "down") => void;
  upsertProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  reset: () => void;
}

export const useCatalogStore = create<CatalogStore>()(
  persist(
    (set) => ({
      categories: defaultCategories,
      products: defaultProducts,

      upsertCategory: (cat) =>
        set((s) => ({
          categories: s.categories.some((c) => c.id === cat.id)
            ? s.categories.map((c) => (c.id === cat.id ? cat : c))
            : [...s.categories, cat],
        })),

      moveCategory: (id, direction) =>
        set((s) => {
          const idx = s.categories.findIndex((c) => c.id === id);
          if (idx === -1) return s;
          const next = direction === "up" ? idx - 1 : idx + 1;
          if (next < 0 || next >= s.categories.length) return s;
          const cats = [...s.categories];
          [cats[idx], cats[next]] = [cats[next], cats[idx]];
          return { categories: cats };
        }),

      removeCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          products: s.products.filter(
            (p) => p.category.toLowerCase() !== id.toLowerCase()
          ),
        })),

      upsertProduct: (product) =>
        set((s) => ({
          products: s.products.some((p) => p.id === product.id)
            ? s.products.map((p) => (p.id === product.id ? product : p))
            : [...s.products, product],
        })),

      removeProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      reset: () =>
        set({ categories: defaultCategories, products: defaultProducts }),
    }),
    {
      name: "akruti-catalog",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
      // Merge persisted state with current defaults so new items added to
      // data files always show up, without losing admin-side edits.
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CatalogStore>;

        const persistedCatIds  = new Set(persisted.categories?.map((c) => c.id) ?? []);
        const persistedProdIds = new Set(persisted.products?.map((p) => p.id) ?? []);

        const newCategories = defaultCategories.filter((c) => !persistedCatIds.has(c.id));
        const newProducts   = defaultProducts.filter((p) => !persistedProdIds.has(p.id));

        return {
          ...currentState,
          ...persisted,
          categories: [...(persisted.categories ?? []), ...newCategories],
          products:   [...(persisted.products   ?? []), ...newProducts],
        };
      },
    }
  )
);
