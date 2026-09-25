import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import Button from '../components/ui/Button';
import { EmptyState, ErrorState } from '../components/ui/Feedback';
import { Select } from '../components/ui/Field';
import ProductFilters from '../components/store/ProductFilters';
import ProductGrid from '../components/store/ProductGrid';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import useCategories from '../hooks/useCategories';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { productsService } from '../services/products.service';
import { SORT_OPTIONS } from '../utils/constants';
import { pluralize } from '../utils/format';

// The URL is the source of truth for filters, so filtered views are shareable and survive refresh.
// Text inputs keep local state and are debounced into the URL.
export default function ProductsPage() {
  useDocumentTitle('Products');
  const [params, setParams] = useSearchParams();
  const { activeCategories, byId, loading: loadingCategories } = useCategories();

  const urlSearch = params.get('search') ?? '';
  const category = params.get('category') ?? '';
  const urlMin = params.get('minPrice') ?? '';
  const urlMax = params.get('maxPrice') ?? '';
  const sort = params.get('sort') ?? '';

  const [search, setSearch] = useState(urlSearch);
  const [min, setMin] = useState(urlMin);
  const [max, setMax] = useState(urlMax);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedSearch = useDebounce(search);
  const debouncedMin = useDebounce(min);
  const debouncedMax = useDebounce(max);

  const paramsRef = useRef(params);
  paramsRef.current = params;
  const setParamsRef = useRef(setParams);
  setParamsRef.current = setParams;

  const updateParams = useCallback((patch) => {
    const next = new URLSearchParams(paramsRef.current);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (next.toString() !== paramsRef.current.toString()) setParamsRef.current(next, { replace: true });
  }, []);

  // typed values -> URL
  useEffect(() => {
    updateParams({ search: debouncedSearch.trim(), minPrice: debouncedMin, maxPrice: debouncedMax });
  }, [debouncedSearch, debouncedMin, debouncedMax, updateParams]);

  // URL -> inputs (e.g. the navbar search or a budget link on the home page)
  useEffect(() => {
    if (urlSearch !== debouncedSearch.trim()) setSearch(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch]);
  useEffect(() => {
    if (urlMin !== debouncedMin) setMin(urlMin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlMin]);
  useEffect(() => {
    if (urlMax !== debouncedMax) setMax(urlMax);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlMax]);

  const priceError = urlMin && urlMax && Number(urlMin) > Number(urlMax) ? 'Minimum price cannot be higher than the maximum.' : '';

  const { data, loading, error, reload } = useFetch(
    () => productsService.list({ search: urlSearch, category, minPrice: urlMin, maxPrice: urlMax, sort }),
    [urlSearch, category, urlMin, urlMax, sort],
    { enabled: !priceError }
  );

  const products = data ?? [];
  const activeCount = [urlSearch, category, urlMin, urlMax, sort].filter(Boolean).length;
  const hasFilters = activeCount > 0;

  const clearAll = () => {
    setSearch('');
    setMin('');
    setMax('');
    setParams({}, { replace: true });
  };

  const activeCategoryName = byId[category]?.name;

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1>{activeCategoryName ?? 'All products'}</h1>
          <p className="page__sub" role="status">
            {loading && !data ? 'Loading products…' : error ? '' : pluralize(products.length, 'product') + (hasFilters ? ' match your filters' : '')}
          </p>
        </div>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} aria-hidden="true" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product name" aria-label="Search products" />
          {search && (
            <button type="button" className="search-box__clear" onClick={() => setSearch('')} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="toolbar__sort">
          <Select aria-label="Sort products" value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value ? option.label : 'Sort: Featured'}
              </option>
            ))}
          </Select>
        </div>
        <Button variant="secondary" icon={SlidersHorizontal} className="toolbar__filters" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
          Filters{activeCount ? ` (${activeCount})` : ''}
        </Button>
      </div>

      <div className="shop">
        <aside className={`shop__filters${filtersOpen ? ' is-open' : ''}`} aria-label="Product filters">
          <ProductFilters
            categories={activeCategories}
            loadingCategories={loadingCategories}
            category={category}
            minPrice={min}
            maxPrice={max}
            priceError={priceError}
            activeCount={activeCount}
            onCategory={(value) => updateParams({ category: value })}
            onMin={setMin}
            onMax={setMax}
            onClear={clearAll}
          />
        </aside>

        <section className="shop__results" aria-label="Results">
          {error ? (
            <ErrorState title="Unable to load products" message={error} onRetry={reload} />
          ) : !loading && products.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No products found"
              message={hasFilters ? 'Nothing matches these filters. Try a different search or widen the price range.' : 'There are no products in the catalog yet.'}
              action={hasFilters && <Button variant="secondary" onClick={clearAll}>Clear filters</Button>}
            />
          ) : (
            <ProductGrid products={products} categoriesById={byId} loading={loading} skeletons={9} className="product-grid--shop" />
          )}
        </section>
      </div>
    </div>
  );
}
