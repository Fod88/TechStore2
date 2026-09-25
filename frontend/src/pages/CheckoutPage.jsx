import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import OrderSummary from '../components/store/OrderSummary';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ordersService } from '../services/orders.service';
import { getErrorMessage } from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { isLineBlocked } from '../utils/normalize';

const PHONE_PATTERN = /^\+?[\d\s\-()]{7,20}$/;

export default function CheckoutPage() {
  useDocumentTitle('Checkout');
  const { cart, loading, error, refresh, clearLocal } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState({ city: '', street: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (values.city.trim().length < 2) next.city = 'Enter your city.';
    if (values.street.trim().length < 3) next.street = 'Enter your street address.';
    if (!values.phone.trim()) next.phone = 'Enter a phone number.';
    else if (!PHONE_PATTERN.test(values.phone.trim())) next.phone = 'Enter a valid phone number.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    if (cart.items.some(isLineBlocked)) {
      setSubmitError('Some items in your cart are unavailable or exceed the current stock. Update your cart and try again.');
      return;
    }
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order = await ordersService.create({
        city: values.city.trim(),
        street: values.street.trim(),
        phone: values.phone.trim(),
      });
      toast.success('Order created successfully.');
      navigate(order.id ? `/orders/${order.id}` : '/orders', { replace: true, state: { justPlaced: true } });
      clearLocal();
      refresh();
    } catch (err) {
      setSubmitError(getErrorMessage(err, "We couldn't place your order."));
      setSubmitting(false);
    }
  };

  if (loading && cart.items.length === 0) {
    return (
      <div className="container page">
        <PageLoader label="Preparing checkout…" />
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
          message="Add a product to your cart before checking out."
          action={
            <Button as={Link} to="/products">
              Browse products
            </Button>
          }
        />
      </div>
    );
  }

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
          <h1>Checkout</h1>
          <p className="page__sub">Tell us where to deliver your order.</p>
        </div>
      </header>

      <div className="checkout">
        <form id="checkout-form" className="panel form" onSubmit={onSubmit} noValidate>
          <h2>Shipping address</h2>
          {submitError && (
            <div className="alert alert--error" role="alert">
              {submitError}
            </div>
          )}
          <Input label="City" autoComplete="address-level2" value={values.city} onChange={setField('city')} error={errors.city} />
          <Input label="Street address" autoComplete="street-address" value={values.street} onChange={setField('street')} error={errors.street} />
          <Input label="Phone number" type="tel" autoComplete="tel" value={values.phone} onChange={setField('phone')} error={errors.phone} hint="We may call you about your delivery." />
        </form>

        <OrderSummary lines={lines} total={cart.total}>
          <Button type="submit" form="checkout-form" size="lg" block loading={submitting}>
            Place order
          </Button>
          <Button as={Link} to="/cart" variant="ghost" block>
            Back to cart
          </Button>
        </OrderSummary>
      </div>
    </div>
  );
}
