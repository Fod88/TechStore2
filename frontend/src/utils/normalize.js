// The frontend talks to the backend through these normalizers so components never depend on
// exact response shapes (populated vs. unpopulated refs, wrapped vs. bare arrays, _id vs. id).

export const idOf = (value) => (value && typeof value === 'object' ? value._id ?? value.id ?? null : value ?? null);

export const isObject = (v) => v !== null && typeof v === 'object';

export function toList(data, ...keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function normalizeUser(u) {
  return { id: idOf(u), name: u?.name ?? '', email: u?.email ?? '', role: u?.role ?? 'customer' };
}

export function normalizeCategory(c) {
  return { id: idOf(c), name: c?.name ?? 'Untitled', isActive: c?.isActive !== false };
}

export function normalizeProduct(p) {
  const rawCategory = p?.category ?? p?.categoryId ?? null;
  return {
    id: idOf(p),
    name: p?.name ?? 'Unnamed product',
    description: p?.description ?? '',
    price: Number(p?.price) || 0,
    stock: p?.stock == null ? null : Number(p.stock), // null = unknown (e.g. nested in a cart line)
    image: p?.image ?? p?.imageUrl ?? p?.images?.[0] ?? '',
    categoryId: idOf(rawCategory),
    categoryName: isObject(rawCategory) ? rawCategory.name ?? null : null,
    isActive: p?.isActive !== false,
  };
}

export const isOutOfStock = (product) => product.stock !== null && product.stock <= 0;

// A cart line the backend will refuse to order (deactivated product, or more than what is in stock)
export const isLineBlocked = (item) =>
  item.product.isActive === false || (item.product.stock !== null && item.quantity > item.product.stock);

export function buildCart(items) {
  const withTotals = items.map((item) => ({ ...item, lineTotal: item.price * item.quantity }));
  return {
    items: withTotals,
    count: withTotals.reduce((sum, i) => sum + i.quantity, 0),
    total: withTotals.reduce((sum, i) => sum + i.lineTotal, 0),
  };
}

// GET /cart returns { cart: { items: [{ productId: <populated product>, quantity }] }, totalPrice }.
// Returns null when the payload contains no items array.
export function normalizeCart(data) {
  const cart = data?.cart ?? data?.data ?? data;
  const rawItems = cart?.items ?? cart?.products;
  if (!Array.isArray(rawItems)) return null;

  const items = rawItems
    .map((item) => {
      const source = item.product ?? item.productId;
      const productId = idOf(source);
      const populated = isObject(source) ? normalizeProduct(source) : null;
      const price = Number(item.price ?? populated?.price) || 0;
      return {
        productId,
        product: populated ?? { id: productId, name: null, price, image: '', stock: null, categoryName: null },
        price,
        quantity: Number(item.quantity) || 1,
      };
    })
    .filter((item) => item.productId);

  return buildCart(items);
}

export function normalizeOrder(o) {
  const items = (o?.items ?? o?.products ?? []).map((item) => {
    const source = item.product ?? item.productId;
    const product = isObject(source) ? source : null;
    const price = Number(item.price ?? product?.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return {
      productId: idOf(source),
      name: item.productName ?? item.name ?? product?.name ?? 'Product', // orders store productName
      image: item.image ?? product?.image ?? product?.imageUrl ?? '',
      price,
      quantity,
      lineTotal: price * quantity,
    };
  });

  const customerSource = o?.user ?? o?.userId ?? o?.customer;
  const address = o?.shippingAddress ?? {};

  return {
    id: idOf(o),
    status: String(o?.status ?? 'pending').toLowerCase(),
    total: Number(o?.totalPrice ?? o?.total ?? o?.totalAmount ?? items.reduce((s, i) => s + i.lineTotal, 0)) || 0,
    createdAt: o?.createdAt ?? null,
    userId: idOf(o?.userId ?? o?.user),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    items,
    shippingAddress: { city: address.city ?? '', street: address.street ?? '', phone: address.phone ?? '' },
    customer: isObject(customerSource) ? { name: customerSource.name ?? '', email: customerSource.email ?? '' } : null,
  };
}

export const sortNewestFirst = (orders) =>
  [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
