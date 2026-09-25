import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';
import { EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import CartLine from '../components/store/CartLine';
import OrderSummary from '../components/store/OrderSummary';
import { useCart } from '../context/CartContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { pluralize } from '../utils/format';
import { isLineBlocked } from '../utils/normalize';

export default function CartPage() {
  useDocumentTitle('Your cart');
  const { cart, loading, error, pending, refresh, updateQuantity, removeItem } = useCart();

  if (loading && cart.items.length === 0) {
    return (
      <div className="container page">
        <PageLoader label="Loading your cart…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page">
        <ErrorState title="Unable to load your cart" message={error} onRetry={refresh} />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container page">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Browse the catalog and add something you like."
          action={
            <Button as={Link} to="/products">
              Start shopping
            </Button>
          }
        />
      </div>
    );
  }

  const blocked = cart.items.some(isLineBlocked);

  const lines = cart.items.map((item) => ({
    key: item.productId,
    name: item.product.name ?? 'Product',
    image: item.product.image,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  }));

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1>Your cart</h1>
          <p className="page__sub">{pluralize(cart.count, 'item')}</p>
        </div>
      </header>

      {blocked && (
        <div className="alert alert--warning cart-alert" role="alert">
          Some items in your cart are unavailable or exceed the current stock. Update them to continue to checkout.
        </div>
      )}

      <div className="cart">
        <ul className="cart__lines" aria-label="Cart items">
          {cart.items.map((item) => (
            <CartLine key={item.productId} item={item} pending={pending.has(item.productId)} onQuantity={updateQuantity} onRemove={removeItem} />
          ))}
        </ul>

        <OrderSummary title="Summary" lines={lines} total={cart.total} showLines={false}>
          {blocked ? (
            <Button size="lg" block disabled>
              Proceed to checkout
            </Button>
          ) : (
            <Button as={Link} to="/checkout" size="lg" block>
              Proceed to checkout
            </Button>
          )}
          <Button as={Link} to="/products" variant="secondary" block>
            Continue shopping
          </Button>
        </OrderSummary>
      </div>
    </div>
  );
}
