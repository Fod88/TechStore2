import { productsService } from '../services/products.service';
import useFetch from './useFetch';

// Orders snapshot name/price/quantity but not the image, so look the products up for thumbnails.
// Products that were deactivated since (404) are simply left out.
export default function useOrderProducts(order) {
  const ids = order ? [...new Set(order.items.map((item) => item.productId).filter(Boolean))] : [];
  const { data } = useFetch(
    async () => {
      const list = await Promise.all(ids.map((id) => productsService.get(id).catch(() => null)));
      return Object.fromEntries(list.filter(Boolean).map((product) => [product.id, product]));
    },
    [order?.id],
    { enabled: ids.length > 0 }
  );
  return data ?? {};
}
