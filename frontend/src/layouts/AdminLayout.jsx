import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Boxes, LayoutDashboard, LogOut, Menu, ReceiptText, Store, Tags, Users, X } from 'lucide-react';
import Logo from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/format';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ReceiptText },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const current = NAV.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)));

  return (
    <div className="admin">
      <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label="Admin navigation">
        <div className="sidebar__head">
          <Logo to="/admin" suffix="Admin" />
          <button type="button" className="icon-btn sidebar__close" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__foot">
          <Link to="/" className="sidebar__link">
            <Store size={18} aria-hidden="true" />
            View storefront
          </Link>
          <button
            type="button"
            className="sidebar__link"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={18} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {open && <div className="admin__scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <div className="admin__body">
        <header className="topbar">
          <button type="button" className="icon-btn topbar__menu" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu size={22} />
          </button>
          <h1 className="topbar__title">{current?.label ?? 'Admin'}</h1>
          <div className="topbar__user">
            <span className="avatar avatar--admin">{initials(user?.name)}</span>
            <div className="topbar__identity">
              <strong>{user?.name}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <main className="admin__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
