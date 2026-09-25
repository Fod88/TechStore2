import ProductCard from './ProductCard';
import { Skeleton } from '../ui/Feedback';

export function ProductCardSkeleton() {
  return (
    <div className="product-card product-card--skeleton" aria-hidden="true">
      <div className="product-card__media">
        <Skeleton height="100%" radius="0" />
      </div>
      <div className="product-card__body">
        <Skeleton height={12} width="35%" />
        <Skeleton height={18} width="80%" />
        <Skeleton height={18} width="40%" />
        <Skeleton height={34} />
      </div>
    </div>
  );
}

export default function ProductGrid({ products, categoriesById = {}, loading = false, skeletons = 8, className = '' }) {
  if (loading && !products.length) {
    return (
      <div className={`product-grid ${className}`} role="status" aria-label="Loading products">
        {Array.from({ length: skeletons }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className={`product-grid${loading ? ' is-refreshing' : ''} ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} categoryName={categoriesById[product.categoryId]?.name} />
      ))}
    </div>
  );
}
