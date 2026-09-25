import api from './api';
import { normalizeOrder, sortNewestFirst, toList } from '../utils/normalize';

const unwrap = (data) => data?.order ?? data?.data ?? data;

export const ordersService = {
  async list() {
    const { data } = await api.get('/orders');
    return sortNewestFirst(toList(data, 'orders').map(normalizeOrder));
  },
  async get(id) {
    const { data } = await api.get(`/orders/${id}`);
    return normalizeOrder(unwrap(data));
  },
  // The cart lives on the server, so an order only needs the shipping address.
  async create(shippingAddress) {
    const { data } = await api.post('/orders', { shippingAddress });
    return normalizeOrder(unwrap(data));
  },
};
