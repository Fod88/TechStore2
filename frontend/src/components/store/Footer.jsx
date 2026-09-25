import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';

export default function Footer() {
  const { isAuthenticated, isAdmin } = useAuth();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p>Laptops, phones, audio and accessories with clear pricing, live stock levels and order tracking from checkout to delivery.</p>
        </div>

        <nav aria-label="Shop">
          <h2>Shop</h2>
          <ul>
            <li>
              <Link to="/products">All products</Link>
            </li>
            {!isAdmin && (
              <li>
                <Link to="/cart">Cart</Link>
              </li>
            )}
            {isAuthenticated && !isAdmin && (
              <li>
                <Link to="/orders">My orders</Link>
              </li>
            )}
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2>Account</h2>
          <ul>
            {isAuthenticated ? (
              isAdmin && (
                <li>
                  <Link to="/admin">Admin panel</Link>
                </li>
              )
            ) : (
              <>
                <li>
                  <Link to="/login">Sign in</Link>
                </li>
                <li>
                  <Link to="/register">Create account</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      <div className="container footer__base">
        <p>© {new Date().getFullYear()} TechStore. All rights reserved.</p>
      </div>
    </footer>
  );
}
