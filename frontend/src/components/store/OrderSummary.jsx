import ProductImage from '../ui/ProductImage';
import { formatCurrency, pluralize } from '../../utils/format';

// Used by the cart, checkout and order details pages. `lines` need: name, image, quantity, lineTotal.
export default function OrderSummary({ title = 'Order summary', lines, total, showLines = true, children }) {
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  return (
    <aside className="summary" aria-label={title}>
      <h2>{title}</h2>
      {showLines && (
        <ul className="summary__lines">
          {lines.map((line) => (
            <li key={line.key}>
              <span className="summary__thumb">
                <ProductImage src={line.image} alt="" />
                <span className="summary__qty">{line.quantity}</span>
              </span>
              <span className="summary__name">{line.name}</span>
              <span className="summary__amount">{formatCurrency(line.lineTotal)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="summary__totals">
        <div>
          <dt>Items</dt>
          <dd>{pluralize(count, 'item')}</dd>
        </div>
        <div className="summary__total">
          <dt>Total</dt>
          <dd className="price">{formatCurrency(total)}</dd>
        </div>
      </dl>
      {children && <div className="summary__actions">{children}</div>}
    </aside>
  );
}
