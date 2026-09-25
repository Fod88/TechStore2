import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, MapPin, Phone } from 'lucide-react';
import { ErrorState, PageLoader } from '../components/ui/Feedback';
import ProductImage from '../components/ui/ProductImage';
import StatusBadge from '../components/ui/StatusBadge';
import OrderProgress from '../components/store/OrderProgress';
import useFetch from '../hooks/useFetch';
import useOrderProducts from '../hooks/useOrderProducts';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { ordersService } from '../services/orders.service';
import { formatCurrency, formatDateTime, shortId } from '../utils/format';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { data: order, loading, error, reload } = useFetch(() => ordersService.get(id), [id]);
  const products = useOrderProducts(order);
  useDocumentTitle(order ? `Order ${shortId(order.id)}` : 'Order');

  if (loading && !order) {
    return (
      <div className="container page">
        <PageLoader label="Loading order…" />
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="container page">
        <ErrorState title="Unable to load this order" message={error ?? 'We could not find this order.'} onRetry={reload} />
      </div>
    );
  }

  const { shippingAddress: address } = order;

  return (
    <div className="container page">
      <Link to="/orders" className="back-link">
        <ChevronLeft size={16} aria-hidden="true" /> All orders
      </Link>

      {location.state?.justPlaced && (
        <div className="alert alert--success success-banner" role="status">
          <CheckCircle2 size={20} aria-hidden="true" />
          <div>
            <strong>Thank you, your order has been placed.</strong>
            <p>We will keep this page up to date as your order moves along.</p>
          </div>
        </div>
      )}

      <header className="page__head order-head">
        <div>
          <h1>Order {shortId(order.id)}</h1>
          <p className="page__sub">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <section className="panel" aria-label="Order progress">
        <OrderProgress status={order.status} />
      </section>

      <div className="order-detail">
        <section className="panel">
          <h2>Items</h2>
          <ul className="order-items">
            {order.items.map((item, index) => (
              <li key={`${item.productId}-${index}`}>
                <span className="order-items__image">
                  <ProductImage src={item.image || products[item.productId]?.image} alt="" />
                </span>
                <div className="order-items__info">
                  {products[item.productId] ? <Link to={`/products/${item.productId}`}>{item.name}</Link> : <span>{item.name}</span>}
                  <span>
                    {formatCurrency(item.price)} × {item.quantity}
                  </span>
                </div>
                <span className="price">{formatCurrency(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="order-total">
            <span>Total</span>
            <strong className="price">{formatCurrency(order.total)}</strong>
          </div>
        </section>

        <section className="panel">
          <h2>Shipping address</h2>
          <address className="address">
            <p>
              <MapPin size={17} aria-hidden="true" />
              <span>
                {address.street || '—'}
                <br />
                {address.city}
              </span>
            </p>
            <p>
              <Phone size={17} aria-hidden="true" />
              <span>{address.phone || '—'}</span>
            </p>
          </address>
        </section>
      </div>
    </div>
  );
}
