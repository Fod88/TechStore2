import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import AdminSearch from '../../components/admin/AdminSearch';
import DataTable from '../../components/admin/DataTable';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import { Select } from '../../components/ui/Field';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { adminService } from '../../services/admin.service';
import { initials, pluralize } from '../../utils/format';

export default function UsersPage() {
  useDocumentTitle('Users');
  const { data, loading, error, reload } = useFetch(() => adminService.users(), []);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');

  const users = data ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => (!role || u.role === role) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  }, [users, query, role]);

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <AdminSearch value={query} onChange={setQuery} placeholder="Search by name or email" />
        <div className="admin-toolbar__select">
          <Select aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </Select>
        </div>
        <p className="admin-toolbar__count" role="status">
          {data ? pluralize(filtered.length, 'user') : ''}
        </p>
      </div>

      <section className="card">
        {error && !data ? (
          <ErrorState title="Unable to load users" message={error} onRetry={reload} />
        ) : loading && !data ? (
          <div className="card__body stack">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={44} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title={users.length ? 'No users match your search' : 'No users yet'} message={users.length ? 'Try a different name, email or role.' : 'Registered users will appear here.'} />
        ) : (
          <DataTable
            caption="Users"
            rows={filtered}
            rowKey={(u) => u.id}
            columns={[
              {
                key: 'name',
                label: 'Name',
                render: (u) => (
                  <span className="cell-person">
                    <span className="avatar avatar--sm">{initials(u.name)}</span>
                    <strong>{u.name || 'Unnamed'}</strong>
                  </span>
                ),
              },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role', render: (u) => <span className={`badge badge--role-${u.role}`}>{u.role === 'admin' ? 'Admin' : 'Customer'}</span> },
            ]}
          />
        )}
      </section>
    </div>
  );
}
