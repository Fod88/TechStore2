import api from './api';

// These return raw payloads; CartContext normalizes them so it can decide when to refetch.
export const cartService = {
  get: async () => (await api.get('/cart')).data,
  create: async () => (await api.post('/cart')).data,
  addItem: async (productId, quantity = 1) => (await api.post('/cart/items', { productId, quantity })).data,
  updateItem: async (productId, quantity) => (await api.patch(`/cart/items/${productId}`, { quantity })).data,
  removeItem: async (productId) => (await api.delete(`/cart/items/${productId}`)).data,
};
