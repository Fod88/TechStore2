import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../services/api';

// Small data-fetching hook: loading / error / reload, ignores stale responses, and keeps the
// previous data on screen while a new request is in flight (smooth filtering).
export default function useFetch(fetcher, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const requestId = useRef(0);

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      if (id === requestId.current) setState({ data, loading: false, error: null });
    } catch (err) {
      if (id === requestId.current) setState((s) => ({ ...s, loading: false, error: getErrorMessage(err) }));
    }
  }, []);

  useEffect(() => {
    if (enabled) run();
    return () => {
      requestId.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload: run, setData };
}
