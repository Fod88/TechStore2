import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import Button from '../components/ui/Button';
import { ErrorState, Skeleton } from '../components/ui/Feedback';
import ProductImage from '../components/ui/ProductImage';
import QuantitySelector from '../components/store/QuantitySelector';
import StockStatus from '../components/store/StockStatus';
import useAddToCart from '../hooks/useAddToCart';
import useCategories from '../hooks/useCategories';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { productsService } from '../services/products.service';
import { formatCurrency } from '../utils/format';
import { isOutOfStock } from '../utils/normalize';

function DetailsSkeleton() {
  return (
    <div className="details" aria-hidden="true">
      <Skeleton height="100%" radius="var(--radius-lg)" className="details__media-skeleton" />
      <div className="details__info">
        <Skeleton height={14} width="30%" />
        <Skeleton height={38} width="80%" />
        <Skeleton height={30} width="25%" />
        <Skeleton height={90} />
        <Skeleton height={48} width="60%" />
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const { byId } = useCategories();
  const { add, adding } = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const { data: product, loading, error, reload } = useFetch(() => productsService.get(id), [id]);

  useDocumentTitle(product?.name);
  useEffect(() => setQuantity(1), [id]);

  if (loading && !product) {
    return (
      <div className="container page">
        <DetailsSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container page">
        <ErrorState
          title="Unable to load this product"
          message={error ?? 'It may have been removed or the link is incorrect.'}
          onRetry={reload}
        />
        <p className="center-note">
          <Link to="/products" className="text-link">
            Back to all products
          </Link>
        </p>
      </div>
    );
  }

  const soldOut = isOutOfStock(product);
  const unavailable = soldOut || !product.isActive;
  const categoryName = product.categoryName ?? byId[product.categoryId]?.name;

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/products">Products</Link>
        {categoryName && (
          <>
            <ChevronRight size={14} aria-hidden="true" />
            <Link to={`/products?category=${product.categoryId}`}>{categoryName}</Link>
          </>
        )}
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="details">
        <div className="details__media blueprint">
          <ProductImage src={product.image} alt={product.name} />
        </div>

        <div className="details__info">
          {categoryName && <p className="details__category">{categoryName}</p>}
          <h1>{product.name}</h1>
          <p className="details__price price">{formatCurrency(product.price)}</p>
          <div className="details__stock">
            <StockStatus product={product} detailed />
          </div>

          {product.description && <p className="details__description">{product.description}</p>}

          {!product.isActive && <div className="alert alert--warning">This product is no longer available.</div>}

          {isAdmin ? (
            <div className="alert alert--info">
              You are signed in as an administrator. Manage this product from the <Link to="/admin/products">admin panel</Link>, or sign in with a customer account to place orders.
            </div>
          ) : (
            <div className="details__buy">
              <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock ?? undefined} disabled={unavailable} />
              <Button size="lg" icon={ShoppingCart} loading={adding} disabled={unavailable} onClick={() => add(product, quantity)} className="details__add">
                {unavailable ? 'Unavailable' : 'Add to cart'}
              </Button>
            </div>
          )}

          <dl className="specs">
            <div>
              <dt>Availability</dt>
              <dd>{unavailable ? 'Currently unavailable' : product.stock === null ? 'Available' : `${product.stock} in stock`}</dd>
            </div>
            {categoryName && (
              <div>
                <dt>Category</dt>
                <dd>{categoryName}</dd>
              </div>
            )}
            <div>
              <dt>Price</dt>
              <dd>{formatCurrency(product.price)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

