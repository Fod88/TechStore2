import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import StoreLayout from '../layouts/StoreLayout';
import AuthLayout from '../layouts/AuthLayout';
import { PageLoader } from '../components/ui/Feedback';
import { AdminRoute, CustomerRoute, GuestRoute } from './guards';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import OrderDetailsPage from '../pages/OrderDetailsPage';
import NotFoundPage from '../pages/NotFoundPage';

// The admin area is a separate bundle: customers never download it.
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'));
const UsersPage = lazy(() => import('../pages/admin/UsersPage'));
const AdminProductsPage = lazy(() => import('../pages/admin/ProductsPage'));
const CategoriesPage = lazy(() => import('../pages/admin/CategoriesPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/OrdersPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Storefront */}
        <Route element={<StoreLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailsPage />} />

          <Route element={<CustomerRoute />}>
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Sign in / register (signed-in users are redirected away) */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route path="admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
