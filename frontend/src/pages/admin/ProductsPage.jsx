import { useMemo, useState } from 'react';
import { Ban, Boxes, Pencil, Plus } from 'lucide-react';
import AdminSearch from '../../components/admin/AdminSearch';
import DataTable from '../../components/admin/DataTable';
import ProductForm from '../../components/admin/ProductForm';
import Button from '../../components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import ProductImage from '../../components/ui/ProductImage';
import { useToast } from '../../context/ToastContext';
import useCategories from '../../hooks/useCategories';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useFetch from '../../hooks/useFetch';
import { productsService } from '../../services/products.service';
import { getErrorMessage } from '../../services/api';
import { LOW_STOCK_THRESHOLD } from '../../utils/constants';
import { formatCurrency, pluralize } from '../../utils/format';

export default function AdminProductsPage() {
  useDocumentTitle('Products');
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => productsService.list(), []);
  const { categories, byId } = useCategories();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [deactivating, setDeactivating] = useState(null);
  const [busy, setBusy] = useState(false);

  const products = data ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  }, [products, query]);

  const save = async (fields, imageFile) => {
    setBusy(true);
    try {
      if (editing === 'new') {
        await productsService.create(fields, imageFile);
        toast.success('Product created.');
      } else {
        // The backend rejects a PATCH body that contains any key it doesn't recognize as changed,
        // so only send fields that actually differ. A picked file always goes, since it's carried
        // separately from these fields (see products.service.js).
        const changes = Object.fromEntries(Object.entries(fields).filter(([key, value]) => value !== (editing[key] ?? '')));
        if (Object.keys(changes).length === 0 && !imageFile) {
          toast.info('No changes to save.');
          setEditing(null);
          return;
        }
        await productsService.update(editing.id, changes, imageFile);
        toast.success('Product updated.');
      }
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "We couldn't save this product."));
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async () => {
    setBusy(true);
    try {
      await productsService.remove(deactivating.id);
      toast.success('Product deactivated.');
      setDeactivating(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "We couldn't deactivate this product."));
    } finally {
      setBusy(false);
    }
  };

  const isNew = editing === 'new';

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <AdminSearch value={query} onChange={setQuery} placeholder="Search products" />
        <p className="admin-toolbar__count" role="status">
          {data ? pluralize(filtered.length, 'product') : ''}
        </p>
        <Button icon={Plus} onClick={() => setEditing('new')}>
          New product
        </Button>
      </div>

      <section className="card">
        {error && !data ? (
          <ErrorState title="Unable to load products" message={error} onRetry={reload} />
        ) : loading && !data ? (
          <div className="card__body stack">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={56} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title={products.length ? 'No products match your search' : 'No products yet'}
            message={products.length ? 'Try a different name.' : 'Add your first product to start selling.'}
            action={!products.length && <Button icon={Plus} onClick={() => setEditing('new')}>New product</Button>}
          />
        ) : (
          <DataTable
            caption="Products"
            rows={filtered}
            rowKey={(p) => p.id}
            columns={[
              {
                key: 'name',
                label: 'Product',
                render: (p) => (
                  <span className="cell-product">
                    <span className="cell-product__image">
                      <ProductImage src={p.image} alt="" />
                    </span>
                    <strong>{p.name}</strong>
                  </span>
                ),
              },
              { key: 'category', label: 'Category', render: (p) => p.categoryName ?? byId[p.categoryId]?.name ?? '—' },
              { key: 'price', label: 'Price', className: 'num', render: (p) => formatCurrency(p.price) },
              {
                key: 'stock',
                label: 'Stock',
                className: 'num',
                render: (p) => <span className={p.stock === 0 ? 'text-danger' : p.stock !== null && p.stock <= LOW_STOCK_THRESHOLD ? 'text-warn' : ''}>{p.stock ?? '—'}</span>,
              },
              {
                key: 'status',
                label: 'Status',
                render: (p) => (
                  <span className={`badge badge--${p.isActive ? 'active' : 'inactive'}`}>
                    <span className="badge__dot" aria-hidden="true" />
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: '',
                className: 'actions',
                render: (p) => (
                  <div className="row-actions">
                    <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditing(p)}>
                      Edit
                    </Button>
                    {p.isActive && (
                      <Button variant="ghost" size="sm" icon={Ban} className="btn--text-danger" onClick={() => setDeactivating(p)}>
                        Deactivate
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </section>

      <Modal
        open={Boolean(editing)}
        onClose={busy ? () => {} : () => setEditing(null)}
        title={isNew ? 'New product' : 'Edit product'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" form="product-form" loading={busy}>
              {isNew ? 'Create product' : 'Save changes'}
            </Button>
          </>
        }
      >
        {editing && <ProductForm key={isNew ? 'new' : editing.id} initial={isNew ? null : editing} categories={categories} onSubmit={save} />}
      </Modal>

      <ConfirmDialog
        open={Boolean(deactivating)}
        title="Deactivate product"
        message={deactivating ? `“${deactivating.name}” will be removed from the store and from this list. Existing orders are not affected.` : ''}
        confirmLabel="Deactivate"
        loading={busy}
        onConfirm={deactivate}
        onCancel={() => setDeactivating(null)}
      />
    </div>
  );
}
