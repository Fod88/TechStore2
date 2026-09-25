import { useState } from 'react';
import { Pencil, Plus, Tags, Ban } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import Button from '../../components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import { Input } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import useFetch from '../../hooks/useFetch';
import { invalidateCategories } from '../../hooks/useCategories';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { categoriesService } from '../../services/categories.service';
import { getErrorMessage } from '../../services/api';

function CategoryForm({ initial, submitting, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [error, setError] = useState('');
  const editing = Boolean(initial);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError('Enter a category name (at least 2 characters).');
      return;
    }
    onSubmit({ name: name.trim() });
  };

  return (
    <Modal
      open
      onClose={submitting ? () => {} : onCancel}
      title={editing ? 'Edit category' : 'New category'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" loading={submitting}>
            {editing ? 'Save changes' : 'Create category'}
          </Button>
        </>
      }
    >
      <form id="category-form" className="form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Category name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          error={error}
          autoFocus
        />
      </form>
    </Modal>
  );
}

export default function CategoriesPage() {
  useDocumentTitle('Categories');
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => categoriesService.list(), []);
  const [editing, setEditing] = useState(null); // null | 'new' | category
  const [deactivating, setDeactivating] = useState(null);
  const [busy, setBusy] = useState(false);

  const categories = data ?? [];

  const save = async (payload) => {
    setBusy(true);
    try {
      if (editing === 'new') {
        await categoriesService.create(payload);
        toast.success('Category created.');
      } else {
        await categoriesService.update(editing.id, payload);
        toast.success('Category updated.');
      }
      invalidateCategories();
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "We couldn't save this category."));
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async () => {
    setBusy(true);
    try {
      await categoriesService.remove(deactivating.id);
      toast.success('Category deactivated.');
      invalidateCategories();
      setDeactivating(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "We couldn't deactivate this category."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <p className="admin-toolbar__lead">Categories group products in the store and in its filters.</p>
        <Button icon={Plus} onClick={() => setEditing('new')}>
          New category
        </Button>
      </div>

      <section className="card">
        {error && !data ? (
          <ErrorState title="Unable to load categories" message={error} onRetry={reload} />
        ) : loading && !data ? (
          <div className="card__body stack">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={44} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState icon={Tags} title="No categories yet" message="Create your first category to start organizing products." action={<Button icon={Plus} onClick={() => setEditing('new')}>New category</Button>} />
        ) : (
          <DataTable
            caption="Categories"
            rows={categories}
            rowKey={(c) => c.id}
            columns={[
              { key: 'name', label: 'Name', render: (c) => <strong>{c.name}</strong> },
              { key: 'status', label: 'Status', render: (c) => <span className={`badge badge--${c.isActive ? 'active' : 'inactive'}`}><span className="badge__dot" aria-hidden="true" />{c.isActive ? 'Active' : 'Inactive'}</span> },
              {
                key: 'actions',
                label: '',
                className: 'actions',
                render: (c) => (
                  <div className="row-actions">
                    <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditing(c)}>
                      Edit
                    </Button>
                    {c.isActive && (
                      <Button variant="ghost" size="sm" icon={Ban} className="btn--text-danger" onClick={() => setDeactivating(c)}>
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

      {editing && <CategoryForm initial={editing === 'new' ? null : editing} submitting={busy} onSubmit={save} onCancel={() => setEditing(null)} />}

      <ConfirmDialog
        open={Boolean(deactivating)}
        title="Deactivate category"
        message={deactivating ? `“${deactivating.name}” will be removed from the store and from this list. Its products are not deleted.` : ''}
        confirmLabel="Deactivate"
        loading={busy}
        onConfirm={deactivate}
        onCancel={() => setDeactivating(null)}
      />
    </div>
  );
}
