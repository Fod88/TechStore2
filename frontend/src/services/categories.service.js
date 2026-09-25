import api from './api';
import { normalizeCategory, toList } from '../utils/normalize';

const unwrap = (data) => data?.category ?? data?.data ?? data;

export const categoriesService = {
  async list() {
    const { data } = await api.get('/categories');
    return toList(data, 'categories').map(normalizeCategory);
  },
  async create(payload) {
    const { data } = await api.post('/categories', payload);
    return normalizeCategory(unwrap(data));
  },
  async update(id, payload) {
    const { data } = await api.patch(`/categories/${id}`, payload);
    return normalizeCategory(unwrap(data));
  },
  // Soft delete (backend sets isActive = false)
  async remove(id) {
    await api.delete(`/categories/${id}`);
  },
};
