import { LOW_STOCK_THRESHOLD } from '../../utils/constants';
import { isOutOfStock } from '../../utils/normalize';

export default function StockStatus({ product, detailed = false }) {
  if (product.stock === null) return null;
  if (isOutOfStock(product)) return <span className="stock stock--out">Out of stock</span>;
  if (product.stock <= LOW_STOCK_THRESHOLD) return <span className="stock stock--low">Only {product.stock} left</span>;
  return <span className="stock stock--in">{detailed ? `In stock (${product.stock} available)` : 'In stock'}</span>;
}
