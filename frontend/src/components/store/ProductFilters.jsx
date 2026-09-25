import { RotateCcw } from 'lucide-react';
import { Input } from '../ui/Field';
import { Skeleton } from '../ui/Feedback';
import Button from '../ui/Button';

export default function ProductFilters({ categories, loadingCategories, category, minPrice, maxPrice, priceError, onCategory, onMin, onMax, onClear, activeCount }) {
  return (
    <div className="filters">
      <section className="filters__group" aria-labelledby="filter-category">
        <h3 id="filter-category">Category</h3>
        {loadingCategories ? (
          <div className="filters__skeleton">
            {[70, 55, 80, 60].map((w, i) => (
              <Skeleton key={i} height={32} width={`${w}%`} />
            ))}
          </div>
        ) : (
          <ul className="filters__list">
            <li>
              <button type="button" className={`filters__option${!category ? ' is-active' : ''}`} onClick={() => onCategory('')} aria-pressed={!category}>
                All categories
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <button type="button" className={`filters__option${category === c.id ? ' is-active' : ''}`} onClick={() => onCategory(c.id)} aria-pressed={category === c.id}>
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="filters__group" aria-labelledby="filter-price">
        <h3 id="filter-price">Price range</h3>
        <div className="filters__price">
          <Input label="Minimum" type="number" inputMode="decimal" min="0" placeholder="0" value={minPrice} onChange={(e) => onMin(e.target.value)} />
          <Input label="Maximum" type="number" inputMode="decimal" min="0" placeholder="Any" value={maxPrice} onChange={(e) => onMax(e.target.value)} />
        </div>
        {priceError && <p className="field__error">{priceError}</p>}
      </section>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onClear} className="filters__clear">
          Clear filters ({activeCount})
        </Button>
      )}
    </div>
  );
}
