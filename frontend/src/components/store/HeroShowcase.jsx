import { Link } from 'react-router-dom';
import ProductImage from '../ui/ProductImage';
import { Skeleton } from '../ui/Feedback';
import DeviceIllustration from './DeviceIllustration';
import { formatCurrency } from '../../utils/format';

function Tile({ product, className }) {
  return (
    <Link to={`/products/${product.id}`} className={className}>
      <div className="showcase__image">
        <ProductImage src={product.image} alt={product.name} />
      </div>
      <div className="showcase__meta">
        <span className="showcase__name">{product.name}</span>
        <span className="price">{formatCurrency(product.price)}</span>
      </div>
    </Link>
  );
}

// Real catalog products when they have images; a drawn illustration otherwise.
export default function HeroShowcase({ products = [], loading = false }) {
  const [main, ...rest] = products;

  if (loading) {
    return (
      <div className="showcase blueprint" aria-hidden="true">
        <Skeleton height="100%" radius="var(--radius-lg)" />
      </div>
    );
  }
  if (!main) {
    return (
      <div className="showcase showcase--art blueprint">
        <DeviceIllustration />
      </div>
    );
  }
  return (
    <div className="showcase blueprint">
      <Tile product={main} className="showcase__main" />
      {rest.slice(0, 2).map((product) => (
        <Tile key={product.id} product={product} className="showcase__tile" />
      ))}
    </div>
  );
}
