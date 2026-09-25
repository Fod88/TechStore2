import api from './api';
import { normalizeProduct, toList } from '../utils/normalize';

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined));

const unwrap = (data) => data?.product ?? data?.data ?? data;

// The backend uses `search` as a case-insensitive $regex, so characters like ( [ + would raise a 500.
// Escaping makes the search behave as a plain "contains" match.
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Both POST /products and PATCH /products/:id check `Object.keys(req.body)` against a fixed
// allow-list that does NOT include "image" — so an image URL sent as a normal field is rejected
// with "Invalid fields". The only way to set an image is a real file, which multer's
// upload.single('image') pulls out of the body into req.file before that check ever runs.
// So: no file -> send plain JSON with the text fields. A file -> send multipart with the file
// under the "image" field name (its own value on req.file, never touching the allow-listed body).
function buildProductBody(fields, imageFile) {
  if (!imageFile) return fields;
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  form.append('image', imageFile);
  return form;
}

export const productsService = {
  async list(params = {}) {
    const query = clean({ ...params, search: params.search ? escapeRegex(params.search.trim()) : '' });
    const { data } = await api.get('/products', { params: query });
    return toList(data, 'products').map(normalizeProduct);
  },

  async get(id) {
    const { data } = await api.get(`/products/${id}`);
    return normalizeProduct(unwrap(data));
  },

  async create(fields, imageFile) {
    const { data } = await api.post('/products', buildProductBody(fields, imageFile));
    return normalizeProduct(unwrap(data));
  },

  async update(id, fields, imageFile) {
    const { data } = await api.patch(`/products/${id}`, buildProductBody(fields, imageFile));
    return normalizeProduct(unwrap(data));
  },

  // DELETE /products/:id is a soft delete (isActive = false)
  async remove(id) {
    await api.delete(`/products/${id}`);
  },
};
