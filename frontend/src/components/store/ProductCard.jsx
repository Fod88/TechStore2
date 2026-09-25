import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Button from '../ui/Button';
import ProductImage from '../ui/ProductImage';
import StockStatus from './StockStatus';
import useAddToCart from '../../hooks/useAddToCart';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';
import { isOutOfStock } from '../../utils/normalize';

export default function ProductCard({ product, categoryName }) {
  const { add, adding } = useAddToCart();
  const { isAdmin } = useAuth();
  const soldOut = isOutOfStock(product);
  const category = categoryName ?? product.categoryName;

  return (
    <article className={`product-card${soldOut ? ' product-card--sold-out' : ''}`}>
      <Link to={`/products/${product.id}`} className="product-card__media" tabIndex={-1} aria-hidden="true">
        <ProductImage src={product.image} alt="" />
        {soldOut && <span className="product-card__flag">Out of stock</span>}
      </Link>

      <div className="product-card__body">
        {category && <p className="product-card__category">{category}</p>}
        <h3 className="product-card__name">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="product-card__meta">
          <span className="price">{formatCurrency(product.price)}</span>
          {!soldOut && <StockStatus product={product} />}
        </div>

        <div className="product-card__actions">
          {!isAdmin && (
            <Button size="sm" icon={ShoppingCart} onClick={() => add(product, 1)} loading={adding} disabled={soldOut}>
              {soldOut ? 'Unavailable' : 'Add to cart'}
            </Button>
          )}
          <Button as={Link} to={`/products/${product.id}`} variant="secondary" size="sm" block={isAdmin}>
            View details
          </Button>
        </div>
      </div>
    </article>
  );
}
