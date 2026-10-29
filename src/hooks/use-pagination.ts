import { useCallback, useMemo, useState } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  reset: () => void;
  offset: number;
}

export function usePagination(initialLimit = 10): PaginationState {
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);

  const setPage = useCallback((next: number) => setPageState(Math.max(1, next)), []);

  const setLimit = useCallback((next: number) => {
    setLimitState(next);
    setPageState(1);
  }, []);

  const reset = useCallback(() => setPageState(1), []);

  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  return { page, limit, setPage, setLimit, reset, offset };
}
