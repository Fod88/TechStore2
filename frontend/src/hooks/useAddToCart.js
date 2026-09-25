import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

// Shared "add to cart" behaviour for product cards and the details page.
export default function useAddToCart() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [adding, setAdding] = useState(false);

  const add = useCallback(
    async (product, quantity = 1) => {
      if (!isAuthenticated) {
        toast.info('Sign in to add items to your cart.');
        navigate('/login', { state: { from: location } });
        return false;
      }
      setAdding(true);
      const ok = await addItem(product.id, quantity);
      setAdding(false);
      if (ok) toast.success(`${product.name} added to your cart.`);
      return ok;
    },
    [isAuthenticated, addItem, toast, navigate, location]
  );

  return { add, adding };
}
