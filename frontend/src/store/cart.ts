import { create } from 'zustand';
import type { CartLine, MenuItem } from '../types';

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  lines: CartLine[];
  add: (
    restaurantId: string,
    restaurantName: string,
    item: MenuItem,
    options: { groupName: string; label: string; priceDelta: number }[]
  ) => void;
  inc: (key: string) => void;
  dec: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  loadReorder: (
    restaurantId: string,
    restaurantName: string,
    items: {
      menuItemId: string;
      name: string;
      price: number;
      isVeg: boolean;
      quantity: number;
      options: { groupName: string; label: string; priceDelta: number }[];
    }[]
  ) => void;
  itemCount: () => number;
  subtotal: () => number;
}

function lineKey(menuItemId: string, options: { label: string }[]) {
  return `${menuItemId}::${options.map((o) => o.label).sort().join('|')}`;
}

export const useCart = create<CartState>((set, get) => ({
  restaurantId: null,
  restaurantName: null,
  lines: [],

  add: (restaurantId, restaurantName, item, options) => {
    const state = get();
    // Single-restaurant cart rule (PRD FR-CART-02).
    if (state.restaurantId && state.restaurantId !== restaurantId) {
      set({ restaurantId, restaurantName, lines: [] });
    }
    const key = lineKey(item._id, options);
    const existing = get().lines.find((l) => l.key === key);
    if (existing) {
      set({ lines: get().lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + 1 } : l)) });
    } else {
      const line: CartLine = {
        key,
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        isVeg: item.isVeg,
        options,
      };
      set({
        restaurantId,
        restaurantName,
        lines: [...get().lines, line],
      });
    }
  },

  inc: (key) => set({ lines: get().lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + 1 } : l)) }),
  dec: (key) =>
    set({
      lines: get()
        .lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0),
    }),
  remove: (key) => set({ lines: get().lines.filter((l) => l.key !== key) }),
  clear: () => set({ restaurantId: null, restaurantName: null, lines: [] }),

  // Replace the cart with the contents of a past order (PRD FR-POST-02 "order again").
  loadReorder: (restaurantId, restaurantName, items) => {
    const lines: CartLine[] = [];
    for (const it of items) {
      const key = lineKey(it.menuItemId, it.options);
      const existing = lines.find((l) => l.key === key);
      if (existing) existing.quantity += it.quantity;
      else
        lines.push({
          key,
          menuItemId: it.menuItemId,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          isVeg: it.isVeg,
          options: it.options,
        });
    }
    set({ restaurantId, restaurantName, lines });
  },

  itemCount: () => get().lines.reduce((s, l) => s + l.quantity, 0),
  subtotal: () =>
    get().lines.reduce(
      (s, l) => s + (l.price + l.options.reduce((a, o) => a + o.priceDelta, 0)) * l.quantity,
      0
    ),
}));
