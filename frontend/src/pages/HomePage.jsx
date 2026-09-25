import { Link } from 'react-router-dom';
import { Boxes, PackageCheck, ReceiptText, ShieldCheck, ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback';
import HeroShowcase from '../components/store/HeroShowcase';
import ProductGrid from '../components/store/ProductGrid';
import categoryIcon from '../components/store/categoryIcon';
import useFetch from '../hooks/useFetch';
import useCategories from '../hooks/useCategories';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { productsService } from '../services/products.service';
import { formatCurrencyWhole } from '../utils/format';
import { isOutOfStock } from '../utils/normalize';

const BUDGETS = [
  { label: 'Under', value: formatCurrencyWhole(500), to: '/products?maxPrice=500' },
  { label: 'Between', value: `${formatCurrencyWhole(500)} and ${formatCurrencyWhole(1500)}`, to: '/products?minPrice=500&maxPrice=1500' },
  { label: 'Over', value: formatCurrencyWhole(1500), to: '/products?minPrice=1500' },
];

const REASONS = [
  { icon: Boxes, title: 'Live stock levels', text: 'Availability is shown on every product, so you know what can ship before you order.' },
  { icon: PackageCheck, title: 'Order tracking', text: 'Follow each order from pending through processing and shipped to delivered.' },
  { icon: ShieldCheck, title: 'Secure accounts', text: 'Passwords are hashed and every session is protected with a signed token.' },
  { icon: ShoppingBag, title: 'Simple checkout', text: 'Enter your delivery details once and place your order in a single step.' },
];

export default function HomePage() {
  useDocumentTitle('');
  const { data, loading, error, reload } = useFetch(() => productsService.list(), []);
  const { activeCategories, loading: loadingCategories } = useCategories();

  const products = data ?? [];
  const available = products.filter((p) => !isOutOfStock(p));
  const featured = [...available, ...products.filter((p) => isOutOfStock(p))].slice(0, 8);
  const showcase = available.filter((p) => p.image).slice(0, 3);
  const showCategories = loadingCategories || activeCategories.length > 0;

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <h1>Tech that earns its place on your desk.</h1>
            <p className="hero__lead">Laptops, phones, audio and accessories with clear pricing, live stock levels and order tracking from checkout to your door.</p>
            <div className="hero__actions">
              <Button as={Link} to="/products" size="lg">
                Shop all products
              </Button>
              <Button as="a" href="#categories" variant="secondary" size="lg">
                Browse categories
              </Button>
            </div>
            <ul className="hero__facts">
              <li>
                <Boxes size={18} aria-hidden="true" /> Live stock levels
              </li>
              <li>
                <ReceiptText size={18} aria-hidden="true" /> Order tracking
              </li>
              <li>
                <ShieldCheck size={18} aria-hidden="true" /> Secure accounts
              </li>
            </ul>
          </div>
          <HeroShowcase products={showcase} loading={loading && !data} />
        </div>
      </section>

      {showCategories && (
        <section className="section" id="categories" aria-labelledby="categories-title">
          <div className="container">
            <div className="section__head">
              <h2 id="categories-title">Shop by category</h2>
            </div>
            <div className="category-grid">
              {loadingCategories
                ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} height={92} radius="var(--radius)" />)
                : activeCategories.map((category) => {
                    const Icon = categoryIcon(category.name);
                    return (
                      <Link key={category.id} to={`/products?category=${category.id}`} className="category-tile">
                        <span className="category-tile__icon">
                          <Icon size={22} aria-hidden="true" />
                        </span>
                        <span className="category-tile__name">{category.name}</span>
                      </Link>
                    );
                  })}
            </div>
          </div>
        </section>
      )}

      <section className="section section--tight" aria-labelledby="featured-title">
        <div className="container">
          <div className="section__head">
            <h2 id="featured-title">Featured products</h2>
            <Link to="/products" className="text-link">
              View all products
            </Link>
          </div>
          {error && !data ? (
            <ErrorState title="Unable to load products" message={error} onRetry={reload} />
          ) : !loading && featured.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="No products yet" message="New products will appear here as soon as they are added to the catalog." />
          ) : (
            <ProductGrid products={featured} loading={loading} skeletons={4} />
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="budget-title">
        <div className="container">
          <div className="promo">
            <div className="promo__copy">
              <h2 id="budget-title">Start with your budget.</h2>
              <p>Pick a price range and see everything that fits. Prices and stock on every product page are always up to date.</p>
            </div>
            <div className="promo__links">
              {BUDGETS.map((budget) => (
                <Link key={budget.to} to={budget.to} className="promo__link">
                  <span>{budget.label}</span>
                  <strong>{budget.value}</strong>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="why-title">
        <div className="container">
          <div className="section__head">
            <h2 id="why-title">Why shop at TechStore</h2>
          </div>
          <div className="reasons">
            {REASONS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="reason">
                <span className="reason__icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
