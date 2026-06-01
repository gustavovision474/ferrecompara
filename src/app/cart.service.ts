import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from './types';

export interface CartItem {
  product: Product;
  quantity: number;
  storeName: string;
  storePhone: string;
  addedAt: Date;
}

const CART_STORAGE_KEY = 'ferreexpress_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();

  readonly totalItems = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly totalPrice = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.minPrice * item.quantity, 0)
  );

  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    // Auto-persist whenever items change
    effect(() => {
      const items = this._items();
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {}
    });
  }

  addItem(product: Product, storeName: string, storePhone: string = '') {
    this._items.update(items => {
      const idx = items.findIndex(i => i.product.id === product.id && i.storeName === storeName);
      if (idx !== -1) {
        const updated = [...items];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...items, { product, quantity: 1, storeName, storePhone, addedAt: new Date() }];
    });
  }

  removeItem(productId: string, storeName: string) {
    this._items.update(items => items.filter(i => !(i.product.id === productId && i.storeName === storeName)));
  }

  increaseQty(productId: string, storeName: string) {
    this._items.update(items =>
      items.map(i => i.product.id === productId && i.storeName === storeName
        ? { ...i, quantity: i.quantity + 1 }
        : i
      )
    );
  }

  decreaseQty(productId: string, storeName: string) {
    this._items.update(items =>
      items
        .map(i => i.product.id === productId && i.storeName === storeName
          ? { ...i, quantity: i.quantity - 1 }
          : i
        )
        .filter(i => i.quantity > 0)
    );
  }

  clearCart() {
    this._items.set([]);
  }

  isInCart(productId: string): boolean {
    return this._items().some(i => i.product.id === productId);
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartItem[];
      return parsed.map(i => ({ ...i, addedAt: new Date(i.addedAt) }));
    } catch {
      return [];
    }
  }
}
