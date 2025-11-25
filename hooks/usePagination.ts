/**
 * Reusable pagination hook for client-side pagination
 */
import { useState, useMemo } from 'react';

interface UsePaginationOptions<T> {
  items: T[];
  pageSize?: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  totalItems: number;
}

export function usePagination<T>({
  items,
  pageSize = 12,
  initialPage = 1,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to page 1 if current page is out of bounds
  const safeCurrentPage = currentPage > totalPages ? 1 : currentPage;
  if (safeCurrentPage !== currentPage) {
    setCurrentPage(1);
  }

  const paginatedItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, safeCurrentPage, pageSize]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (safeCurrentPage < totalPages) {
      setCurrentPage(safeCurrentPage + 1);
    }
  };

  const previousPage = () => {
    if (safeCurrentPage > 1) {
      setCurrentPage(safeCurrentPage - 1);
    }
  };

  return {
    currentPage: safeCurrentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    previousPage,
    canGoNext: safeCurrentPage < totalPages,
    canGoPrevious: safeCurrentPage > 1,
    totalItems: items.length,
  };
}


