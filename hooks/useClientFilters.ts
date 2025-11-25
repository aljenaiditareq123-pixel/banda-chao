/**
 * Reusable client-side filtering hook
 */
import { useMemo, useState } from 'react';

interface FilterOptions {
  search?: string;
  category?: string;
  makerId?: string;
  country?: string;
  language?: string;
}

interface UseClientFiltersOptions<T> {
  items: T[];
  filters: FilterOptions;
  getSearchableText?: (item: T) => string;
  getCategory?: (item: T) => string | undefined;
  getMakerId?: (item: T) => string | undefined;
  getCountry?: (item: T) => string | undefined;
  getLanguage?: (item: T) => string | undefined;
}

export function useClientFilters<T>({
  items,
  filters,
  getSearchableText,
  getCategory,
  getMakerId,
  getCountry,
  getLanguage,
}: UseClientFiltersOptions<T>): T[] {
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (filters.search && getSearchableText) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((item) => {
        const text = getSearchableText(item).toLowerCase();
        return text.includes(searchLower);
      });
    }

    // Category filter
    if (filters.category && getCategory) {
      result = result.filter((item) => {
        const category = getCategory(item);
        return category === filters.category;
      });
    }

    // Maker filter
    if (filters.makerId && getMakerId) {
      result = result.filter((item) => {
        const makerId = getMakerId(item);
        return makerId === filters.makerId;
      });
    }

    // Country filter
    if (filters.country && getCountry) {
      result = result.filter((item) => {
        const country = getCountry(item);
        return country === filters.country;
      });
    }

    // Language filter
    if (filters.language && getLanguage) {
      result = result.filter((item) => {
        const language = getLanguage(item);
        // Check if language string contains the filter or if it's an array
        if (Array.isArray(language)) {
          return language.includes(filters.language);
        }
        return language && (language.includes(filters.language) || language === filters.language);
      });
    }

    return result;
  }, [items, filters, getSearchableText, getCategory, getMakerId, getCountry, getLanguage]);

  return filteredItems;
}

