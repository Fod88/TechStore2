import { Link } from 'react-router-dom';
import { Boxes, ReceiptText, Tags, Users, Wallet } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import Button from '../../components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import StatusBadge from '../../components/ui/StatusBadge';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { adminService } from '../../services/admin.service';
import { formatCurrency, formatDate, formatNumber, shortId } from '../../utils/format';

const QUICK_LINKS = [
  { to: '/admin/orders', label: 'Review orders', icon: ReceiptText },
  { to: '/admin/products', label: 'Manage products', icon: Boxes },
  { to: '/admin/categories', label: 'Manage categories', icon: Tags },
  { to: '/admin/users', label: 'View users', icon: Users },
];

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const stats = useFetch(() => adminService.dashboard(), []);
  const orders = useFetch(() => adminService.orders(), []);

  const s = stats.data;
  const recent = (orders.data ?? []).slice(0, 5);

  return (
    <div className="admin-page">
      {stats.error && !s ? (
        <ErrorState title="Unable to load dashboard figures" message={stats.error} onRetry={stats.reload} />
      ) : (
        <section className="stat-grid" aria-label="Key figures">
          {!s ? (
            Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height={96} radius="var(--radius)" />)
          ) : (
            <>
              <StatCard icon={Wallet} label="Revenue" value={formatCurrency(s.revenue)} hint="Excludes cancelled orders" />
              <StatCard icon={ReceiptText} label="Total orders" value={formatNumber(s.totalOrders)} tone="blue" />
              <StatCard icon={Boxes} label="Total products" value={formatNumber(s.totalProducts)} hint="Includes deactivated products" tone="amber" />
              <StatCard icon={Users} label="Total users" value={formatNumber(s.totalUsers)} tone="slate" />
            </>
          )}
        </section>
      )}

      <div className="dashboard-grid">
        <section className="card">
          <div className="card__head">
            <h2>Recent orders</h2>
            <Link to="/admin/orders" className="text-link">
              View all
            </Link>
          </div>
          {orders.error && !orders.data ? (
            <ErrorState title="Unable to load orders" message={orders.error} onRetry={orders.reload} />
          ) : !orders.data ? (
            <div className="card__body stack">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={40} />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState icon={ReceiptText} title="No orders yet" message="Orders will appear here as customers check out." />
          ) : (
            <DataTable
              caption="Most recent orders"
              rows={recent}
              rowKey={(o) => o.id}
              columns={[
                { key: 'id', label: 'Order', render: (o) => <strong>{shortId(o.id)}</strong> },
                { key: 'customer', label: 'Customer', render: (o) => o.customer?.name || '—' },
                { key: 'date', label: 'Date', render: (o) => formatDate(o.createdAt) },
                { key: 'total', label: 'Total', className: 'num', render: (o) => formatCurrency(o.total) },
                { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
              ]}
            />
          )}
        </section>

        <section className="card">
          <div className="card__head">
            <h2>Shortcuts</h2>
          </div>
          <div className="card__body quick-links">
            {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
              <Button key={to} as={Link} to={to} variant="secondary" icon={Icon} block>
                {label}
              </Button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
