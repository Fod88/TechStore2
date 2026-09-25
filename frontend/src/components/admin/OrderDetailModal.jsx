import { MapPin, Phone, User } from 'lucide-react';
import { Modal } from '../ui/Modal';
import ProductImage from '../ui/ProductImage';
import StatusBadge from '../ui/StatusBadge';
import OrderProgress from '../store/OrderProgress';
import useOrderProducts from '../../hooks/useOrderProducts';
import { formatCurrency, formatDateTime, shortId } from '../../utils/format';

export default function OrderDetailModal({ order, onClose }) {
  const products = useOrderProducts(order);
  if (!order) return null;
  const { shippingAddress: address, customer } = order;
  return (
    <Modal open onClose={onClose} title={`Order ${shortId(order.id)}`} size="lg">
      <div className="order-modal__top">
        <span className="muted">Placed {formatDateTime(order.createdAt)}</span>
        <StatusBadge status={order.status} />
      </div>

      <OrderProgress status={order.status} />

      <div className="order-modal__cols">
        <div>
          <h3 className="modal__section">Items</h3>
          <ul className="order-items">
            {order.items.map((item, index) => (
              <li key={`${item.productId}-${index}`}>
                <span className="order-items__image">
                  <ProductImage src={item.image || products[item.productId]?.image} alt="" />
                </span>
                <div className="order-items__info">
                  <span>{item.name}</span>
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
        </div>

        <div>
          <h3 className="modal__section">Customer</h3>
          <address className="address">
            <p>
              <User size={17} aria-hidden="true" />
              <span>
                {customer?.name || 'Unknown customer'}
                {customer?.email && (
                  <>
                    <br />
                    <span className="muted">{customer.email}</span>
                  </>
                )}
              </span>
            </p>
          </address>
          <h3 className="modal__section">Shipping address</h3>
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
        </div>
      </div>
    </Modal>
  );
}
