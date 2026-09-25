import { useMemo, useState } from 'react';
import { Eye, ReceiptText } from 'lucide-react';
import AdminSearch from '../../components/admin/AdminSearch';
import DataTable from '../../components/admin/DataTable';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import Button from '../../components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import { ConfirmDialog } from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useFetch from '../../hooks/useFetch';
import { adminService } from '../../services/admin.service';
import { getErrorMessage } from '../../services/api';
import { ORDER_STATUSES, STATUS_LABELS } from '../../utils/constants';
import { formatCurrency, formatDate, pluralize, shortId } from '../../utils/format';

export default function AdminOrdersPage() {
  useDocumentTitle('Orders');
  const toast = useToast();
  const { data, loading, error, reload, setData } = useFetch(() => adminService.orders(), []);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState(null);
  const [change, setChange] = useState(null); // { order, status }
  const [busy, setBusy] = useState(false);

  const orders = data ?? [];
  const counts = useMemo(() => {
    const result = { all: orders.length };
    ORDER_STATUSES.forEach((s) => (result[s] = orders.filter((o) => o.status === s).length));
    return result;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return [o.id, shortId(o.id), o.customer?.name, o.customer?.email].some((v) => String(v ?? '').toLowerCase().includes(q));
    });
  }, [orders, statusFilter, query]);

  const applyChange = async () => {
    setBusy(true);
    try {
      await adminService.updateOrderStatus(change.order.id, change.status);
      setData((list) => (list ?? []).map((o) => (o.id === change.order.id ? { ...o, status: change.status } : o)));
      toast.success(`Order ${shortId(change.order.id)} marked as ${STATUS_LABELS[change.status].toLowerCase()}.`);
      setChange(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "We couldn't update the order status."));
    } finally {
      setBusy(false);
    }
  };

  const tabs = [{ value: 'all', label: 'All' }, ...ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))];

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <AdminSearch value={query} onChange={setQuery} placeholder="Search by order ID or customer" />
        <p className="admin-toolbar__count" role="status">
          {data ? pluralize(filtered.length, 'order') : ''}
        </p>
      </div>

      <div className="tabs" role="tablist" aria-label="Filter orders by status">
        {tabs.map((tab) => (
          <button key={tab.value} type="button" role="tab" aria-selected={statusFilter === tab.value} className={`tabs__tab${statusFilter === tab.value ? ' is-active' : ''}`} onClick={() => setStatusFilter(tab.value)}>
            {tab.label}
            <span className="tabs__count">{counts[tab.value] ?? 0}</span>
          </button>
        ))}
      </div>

      <section className="card">
        {error && !data ? (
          <ErrorState title="Unable to load orders" message={error} onRetry={reload} />
        ) : loading && !data ? (
          <div className="card__body stack">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={48} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={ReceiptText} title={orders.length ? 'No orders match these filters' : 'No orders yet'} message={orders.length ? 'Try another status or search term.' : 'Orders will appear here as customers check out.'} />
        ) : (
          <DataTable
            caption="Orders"
            rows={filtered}
            rowKey={(o) => o.id}
            columns={[
              { key: 'id', label: 'Order', render: (o) => <strong>{shortId(o.id)}</strong> },
              {
                key: 'customer',
                label: 'Customer',
                render: (o) => (
                  <span className="cell-stack">
                    <span>{o.customer?.name || '—'}</span>
                    {o.customer?.email && <span className="muted">{o.customer.email}</span>}
                  </span>
                ),
              },
              { key: 'date', label: 'Date', render: (o) => formatDate(o.createdAt) },
              { key: 'total', label: 'Total', className: 'num', render: (o) => formatCurrency(o.total) },
              { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
              {
                key: 'update',
                label: 'Change status',
                render: (o) => (
                  <select className="input select select--compact" aria-label={`Change status for order ${shortId(o.id)}`} value={o.status} onChange={(e) => e.target.value !== o.status && setChange({ order: o, status: e.target.value })}>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                ),
              },
              {
                key: 'actions',
                label: '',
                className: 'actions',
                render: (o) => (
                  <Button variant="secondary" size="sm" icon={Eye} onClick={() => setViewing(o)}>
                    View details
                  </Button>
                ),
              },
            ]}
          />
        )}
      </section>

      <OrderDetailModal order={viewing} onClose={() => setViewing(null)} />

      <ConfirmDialog
        open={Boolean(change)}
        title="Update order status"
        tone={change?.status === 'cancelled' ? 'danger' : 'primary'}
        message={change ? `Change order ${shortId(change.order.id)} from ${STATUS_LABELS[change.order.status].toLowerCase()} to ${STATUS_LABELS[change.status].toLowerCase()}?${change.status === 'cancelled' ? ' The customer will see this order as cancelled.' : ''}` : ''}
        confirmLabel={change ? `Mark as ${STATUS_LABELS[change.status].toLowerCase()}` : 'Confirm'}
        loading={busy}
        onConfirm={applyChange}
        onCancel={() => setChange(null)}
      />
    </div>
  );
}
