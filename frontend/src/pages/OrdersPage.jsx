import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback';
import StatusBadge from '../components/ui/StatusBadge';
import useFetch from '../hooks/useFetch';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { ordersService } from '../services/orders.service';
import { formatCurrency, formatDate, pluralize, shortId } from '../utils/format';

export default function OrdersPage() {
  useDocumentTitle('My orders');
  const { data, loading, error, reload } = useFetch(() => ordersService.list(), []);
  const orders = data ?? [];

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1>My orders</h1>
          <p className="page__sub">{loading && !data ? 'Loading your orders…' : pluralize(orders.length, 'order')}</p>
        </div>
      </header>

      {error ? (
        <ErrorState title="Unable to load your orders" message={error} onRetry={reload} />
      ) : loading && !data ? (
        <div className="order-list" role="status" aria-label="Loading orders">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={84} radius="var(--radius)" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No orders yet"
          message="When you place an order it will show up here."
          action={
            <Button as={Link} to="/products">
              Start shopping
            </Button>
          }
        />
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="order-row">
              <div className="order-row__main">
                <Link to={`/orders/${order.id}`} className="order-row__id">
                  Order {shortId(order.id)}
                </Link>
                <span className="order-row__date">{formatDate(order.createdAt)}</span>
              </div>
              <span className="order-row__items">{pluralize(order.itemCount, 'item')}</span>
              <span className="order-row__total price">{formatCurrency(order.total)}</span>
              <StatusBadge status={order.status} />
              <Button as={Link} to={`/orders/${order.id}`} variant="secondary" size="sm">
                View order
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
