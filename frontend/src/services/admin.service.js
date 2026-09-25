import api from './api';
import { normalizeOrder, normalizeUser, sortNewestFirst, toList } from '../utils/normalize';

async function fetchUsers() {
  const { data } = await api.get('/admin/users');
  return toList(data, 'users').map(normalizeUser);
}

export const adminService = {
  // GET /admin/dashboard -> { totalUsers, totalProducts, totalOrders, revenue }
  // Note: revenue excludes cancelled orders and totalProducts includes deactivated products.
  async dashboard() {
    const { data } = await api.get('/admin/dashboard');
    return {
      totalUsers: Number(data?.totalUsers) || 0,
      totalProducts: Number(data?.totalProducts) || 0,
      totalOrders: Number(data?.totalOrders) || 0,
      revenue: Number(data?.revenue) || 0,
    };
  },

  users: fetchUsers,

  // GET /admin/orders returns orders with a bare `userId`. Join with the users list so the admin
  // sees who ordered. If the users request fails, orders still load (customer shown as unknown).
  async orders() {
    const [{ data }, users] = await Promise.all([api.get('/admin/orders'), fetchUsers().catch(() => [])]);
    const byId = Object.fromEntries(users.map((u) => [u.id, u]));
    const orders = toList(data, 'orders')
      .map(normalizeOrder)
      .map((order) => {
        const user = byId[order.userId];
        return user ? { ...order, customer: { name: user.name, email: user.email } } : order;
      });
    return sortNewestFirst(orders);
  },

  // PATCH /admin/orders/:id/status  body: { status }
  async updateOrderStatus(id, status) {
    const { data } = await api.patch(`/admin/orders/${id}/status`, { status });
    return normalizeOrder(data);
  },
};
