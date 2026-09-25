import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import ProductImage from '../ui/ProductImage';
import QuantitySelector from './QuantitySelector';
import { formatCurrency } from '../../utils/format';

export default function CartLine({ item, pending, onQuantity, onRemove }) {
  const { product } = item;
  const name = product.name ?? 'Product';
  return (
    <li className={`cart-line${pending ? ' is-pending' : ''}`}>
      <Link to={`/products/${item.productId}`} className="cart-line__image">
        <ProductImage src={product.image} alt="" />
      </Link>

      <div className="cart-line__info">
        <Link to={`/products/${item.productId}`} className="cart-line__name">
          {name}
        </Link>
        <p className="cart-line__unit">{formatCurrency(item.price)} each</p>
        {product.isActive === false ? (
          <p className="cart-line__note cart-line__note--error">This product is no longer available. Remove it to continue.</p>
        ) : product.stock !== null && item.quantity > product.stock ? (
          <p className="cart-line__note cart-line__note--error">Only {product.stock} in stock. Lower the quantity to continue.</p>
        ) : product.stock !== null && item.quantity === product.stock ? (
          <p className="cart-line__note">Maximum available quantity</p>
        ) : null}
      </div>

      <div className="cart-line__qty">
        <QuantitySelector
          value={item.quantity}
          max={product.stock ?? undefined}
          disabled={pending}
          onChange={(q) => q !== item.quantity && onQuantity(item.productId, q)}
          label={`Quantity for ${name}`}
        />
      </div>

      <p className="cart-line__total price">{formatCurrency(item.lineTotal)}</p>

      <button type="button" className="icon-btn cart-line__remove" onClick={() => onRemove(item.productId)} disabled={pending} aria-label={`Remove ${name} from cart`}>
        <Trash2 size={18} />
      </button>
    </li>
  );
}
