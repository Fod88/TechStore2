import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartService } from '../services/cart.service';
import { getErrorMessage } from '../services/api';
import { buildCart, normalizeCart } from '../utils/normalize';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);
const EMPTY_CART = buildCart([]);

export function CartProvider({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(() => new Set());

  // Administrators use the admin panel, not the shopping cart.
  const enabled = isAuthenticated && !isAdmin;

  const markPending = (productId, on) =>
    setPending((prev) => {
      const next = new Set(prev);
      if (on) next.add(productId);
      else next.delete(productId);
      return next;
    });

  // GET /cart is the only endpoint that returns populated products (name, price, image, stock).
  // POST/PATCH/DELETE return the raw cart with bare product ids, so we re-read after each change.
  // A 404 simply means the customer has no cart yet.
  const fetchCart = useCallback(async () => {
    try {
      return normalizeCart(await cartService.get()) ?? EMPTY_CART;
    } catch (err) {
      if (err.response?.status === 404) return EMPTY_CART;
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setCart(EMPTY_CART);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setCart(await fetchCart());
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't load your cart."));
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchCart]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Quietly re-sync after a mutation (no loading flash)
  const sync = useCallback(async () => {
    try {
      setCart(await fetchCart());
    } catch {
      /* keep the optimistic state; the next refresh will reconcile */
    }
  }, [fetchCart]);

  // POST /cart/items creates the cart on the server when none exists, so no separate POST /cart is needed.
  const addItem = useCallback(
    async (productId, quantity = 1) => {
      try {
        await cartService.addItem(productId, quantity);
        await sync();
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, "We couldn't add this item to your cart."));
        return false;
      }
    },
    [sync, toast]
  );

  const removeItem = useCallback(
    async (productId) => {
      const previous = cart;
      setCart((current) => buildCart(current.items.filter((i) => i.productId !== productId)));
      markPending(productId, true);
      try {
        await cartService.removeItem(productId);
        await sync();
        toast.success('Item removed from your cart.');
      } catch (err) {
        setCart(previous);
        toast.error(getErrorMessage(err, "We couldn't remove this item."));
      } finally {
        markPending(productId, false);
      }
    },
    [cart, sync, toast]
  );

  // Optimistic: the UI updates immediately, then reconciles with the server (or rolls back).
  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity < 1) return removeItem(productId);
      const previous = cart;
      setCart((current) => buildCart(current.items.map((i) => (i.productId === productId ? { ...i, quantity } : i))));
      markPending(productId, true);
      try {
        await cartService.updateItem(productId, quantity);
        await sync();
      } catch (err) {
        setCart(previous);
        toast.error(getErrorMessage(err, "We couldn't update the quantity."));
      } finally {
        markPending(productId, false);
      }
      return undefined;
    },
    [cart, removeItem, sync, toast]
  );

  const clearLocal = useCallback(() => setCart(EMPTY_CART), []);

  const value = useMemo(
    () => ({ cart, loading, error, pending, refresh, addItem, updateQuantity, removeItem, clearLocal }),
    [cart, loading, error, pending, refresh, addItem, updateQuantity, removeItem, clearLocal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
