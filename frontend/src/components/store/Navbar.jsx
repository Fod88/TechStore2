import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, PackageCheck, Search, ShoppingCart, X } from 'lucide-react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { initials } from '../../utils/format';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState('');
  const accountRef = useRef(null);

  // Close menus whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountOpen) return undefined;
    const onPointer = (e) => accountRef.current && !accountRef.current.contains(e.target) && setAccountOpen(false);
    const onKey = (e) => e.key === 'Escape' && setAccountOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/products?search=${encodeURIComponent(value)}` : '/products');
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`;

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Logo />

        <nav className="navbar__links" aria-label="Main">
          <NavLink to="/products" className={linkClass}>
            Products
          </NavLink>
          {isAuthenticated && !isAdmin && (
            <NavLink to="/orders" className={linkClass}>
              My orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin panel
            </NavLink>
          )}
        </nav>

        <form className="navbar__search" onSubmit={submitSearch} role="search">
          <Search size={17} aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" aria-label="Search products" />
        </form>

        <div className="navbar__actions">
          {!isAdmin && (
            <Link to="/cart" className="cart-link" aria-label={`Cart${cart.count ? `, ${cart.count} items` : ''}`}>
              <ShoppingCart size={21} />
              {cart.count > 0 && <span className="cart-link__count">{cart.count > 99 ? '99+' : cart.count}</span>}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="account" ref={accountRef}>
              <button type="button" className="account__trigger" onClick={() => setAccountOpen((o) => !o)} aria-expanded={accountOpen} aria-haspopup="menu">
                <span className="avatar">{initials(user.name)}</span>
                <span className="account__name">{user.name.split(' ')[0] || 'Account'}</span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>
              {accountOpen && (
                <div className="menu" role="menu">
                  <div className="menu__header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  {isAdmin ? (
                    <Link to="/admin" role="menuitem" className="menu__item">
                      <LayoutDashboard size={17} /> Admin panel
                    </Link>
                  ) : (
                    <Link to="/orders" role="menuitem" className="menu__item">
                      <PackageCheck size={17} /> My orders
                    </Link>
                  )}
                  <button type="button" role="menuitem" className="menu__item" onClick={handleLogout}>
                    <LogOut size={17} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth">
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button as={Link} to="/register" size="sm">
                Create account
              </Button>
            </div>
          )}

          <button type="button" className="icon-btn navbar__toggle" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <form className="navbar__search navbar__search--mobile" onSubmit={submitSearch} role="search">
            <Search size={17} aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" aria-label="Search products" />
          </form>
          <NavLink to="/products" className={linkClass}>
            Products
          </NavLink>
          {isAuthenticated && !isAdmin && (
            <NavLink to="/orders" className={linkClass}>
              My orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin panel
            </NavLink>
          )}
          {isAuthenticated ? (
            <button type="button" className="nav-link" onClick={handleLogout}>
              Sign out
            </button>
          ) : (
            <div className="mobile-menu__auth">
              <Button as={Link} to="/login" variant="secondary" block>
                Sign in
              </Button>
              <Button as={Link} to="/register" block>
                Create account
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
