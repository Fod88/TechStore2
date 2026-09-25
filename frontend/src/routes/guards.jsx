import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Where to send someone right after they sign in
export function getPostLoginPath(user, location) {
  const from = location?.state?.from?.pathname;
  if (user?.role === 'admin') return from?.startsWith('/admin') ? from : '/admin';
  return from && !from.startsWith('/admin') ? from : '/';
}

// Requires a signed-in user. Optionally restricts by role.
export function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  return <Outlet />;
}

export const CustomerRoute = () => <ProtectedRoute roles={['customer']} />;
export const AdminRoute = () => <ProtectedRoute roles={['admin']} />;

// Login / register: signed-in users get sent onward instead
export function GuestRoute() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (isAuthenticated) return <Navigate to={getPostLoginPath(user, location)} replace />;
  return <Outlet />;
}
