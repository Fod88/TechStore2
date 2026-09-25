import { useEffect, useMemo, useState } from 'react';
import { categoriesService } from '../services/categories.service';
import { getErrorMessage } from '../services/api';

// Categories rarely change, so share one request across every component that needs them.
let cache = null;
let inflight = null;

export const invalidateCategories = () => {
  cache = null;
  inflight = null;
};

export default function useCategories() {
  const [categories, setCategories] = useState(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache) return undefined;
    let active = true;
    inflight = inflight ?? categoriesService.list();
    inflight
      .then((list) => {
        cache = list;
        if (active) setCategories(list);
      })
      .catch((err) => {
        inflight = null;
        if (active) setError(getErrorMessage(err, "We couldn't load categories."));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const activeCategories = useMemo(() => categories.filter((c) => c.isActive), [categories]);
  const byId = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);

  return { categories, activeCategories, byId, loading, error };
}
