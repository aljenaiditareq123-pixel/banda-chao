'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { productsAPI } from '@/lib/api';

export interface FilterState {
  categories: string[];
  priceRange: { min: number | null; max: number | null };
  makers: string[];
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  products?: any[]; // Optional products prop to avoid fetching (flexible type to accept Product[] or any product-like structure)
}

export default function ProductFilters({ onFilterChange, initialFilters, products }: ProductFiltersProps) {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<string[]>(initialFilters?.categories || []);
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>(
    initialFilters?.priceRange || { min: null, max: null }
  );
  const [makers, setMakers] = useState<string[]>(initialFilters?.makers || []);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableMakers, setAvailableMakers] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  const isRTL = language === 'ar';

  // Extract categories and makers from products prop (if provided) or fetch from API
  useEffect(() => {
    if (products && products.length > 0) {
      // Use products prop to extract categories and makers (no API call needed)
      const uniqueCategories = Array.from(
        new Set(products.map((p) => p.category).filter(Boolean))
      ) as string[];
      setAvailableCategories(uniqueCategories);

      // Use Map to deduplicate makers by ID (Set doesn't work for objects)
      const makersMap = new Map<string, { id: string; name: string }>();
      products
        .map((p) => ({
          id: p.maker?.id || p.userId,
          name: p.maker?.name || p.user?.name || 'Unknown',
        }))
        .filter((m) => m.id && m.name !== 'Unknown')
        .forEach((maker) => {
          if (!makersMap.has(maker.id)) {
            makersMap.set(maker.id, maker);
          }
        });
      setAvailableMakers(Array.from(makersMap.values()));
    } else {
      // Fallback: fetch from API only if products prop is not provided
      fetchFilterOptions();
    }
  }, [products]);

  const fetchFilterOptions = async () => {
    try {
      setLoading(true);
      
      // Fetch limited products to extract unique categories and makers (fallback only)
      // This should rarely execute as products prop should be provided by parent
      const response = await productsAPI.getProducts(undefined, { limit: 100 });
      const fetchedProducts = response.data?.data || response.data || [];

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(fetchedProducts.map((p: any) => p.category).filter(Boolean))
      ) as string[];
      setAvailableCategories(uniqueCategories);

      // Extract unique makers (from userId or maker relation) - use Map to deduplicate by ID
      const makersMap = new Map<string, { id: string; name: string }>();
      fetchedProducts
        .map((p: any) => ({
          id: p.maker?.id || p.userId,
          name: p.maker?.name || p.user?.name || 'Unknown',
        }))
        .filter((m: any) => m.id && m.name !== 'Unknown')
        .forEach((maker: { id: string; name: string }) => {
          if (!makersMap.has(maker.id)) {
            makersMap.set(maker.id, maker);
          }
        });
      setAvailableMakers(Array.from(makersMap.values()));
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  // Notify parent component when filters change
  useEffect(() => {
    onFilterChange({
      categories,
      priceRange,
      makers,
    });
  }, [categories, priceRange, makers, onFilterChange]);

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleMaker = (makerId: string) => {
    setMakers((prev) =>
      prev.includes(makerId) ? prev.filter((m) => m !== makerId) : [...prev, makerId]
    );
  };

  const handlePriceMinChange = (value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setPriceRange((prev) => ({ ...prev, min: numValue }));
  };

  const handlePriceMaxChange = (value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setPriceRange((prev) => ({ ...prev, max: numValue }));
  };

  const clearFilters = () => {
    setCategories([]);
    setPriceRange({ min: null, max: null });
    setMakers([]);
  };

  const hasActiveFilters =
    categories.length > 0 || priceRange.min !== null || priceRange.max !== null || makers.length > 0;

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-8">
        <div className="text-center text-gray-500 py-4">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-8 ${isRTL ? 'rtl' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="pb-4 border-b border-gray-200">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 text-sm text-[#2E7D32] hover:bg-[#2E7D32]/10 rounded-lg transition"
          >
            {t('clearFilters')}
          </button>
        </div>
      )}

      {/* Categories Filter */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('productsFilterCategoriesTitle')}
        </h2>
        <div className="space-y-3 text-sm text-gray-700 max-h-64 overflow-y-auto">
          {availableCategories.length > 0 ? (
            availableCategories.map((category) => (
              <label
                key={category}
                className="flex items-center space-x-3 cursor-pointer hover:text-[#2E7D32] transition"
              >
                <input
                  type="checkbox"
                  checked={categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]"
                />
                <span>{category}</span>
              </label>
            ))
          ) : (
            <div className="text-gray-400 text-xs py-2">{t('noCategories') || t('noContent')}</div>
          )}
        </div>
      </section>

      {/* Price Range Filter */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('productsFilterPriceTitle')}
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={t('minPrice') || t('productsFilterPricePlaceholder') || 'Min price'}
              value={priceRange.min ?? ''}
              onChange={(e) => handlePriceMinChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
              min="0"
              step="0.01"
            />
            <span className="text-gray-500 text-sm">{t('to') || '-'}</span>
            <input
              type="number"
              placeholder={t('maxPrice') || t('productsFilterPricePlaceholder') || 'Max price'}
              value={priceRange.max ?? ''}
              onChange={(e) => handlePriceMaxChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
              min="0"
              step="0.01"
            />
          </div>
          {(priceRange.min !== null || priceRange.max !== null) && (
            <button
              onClick={() => setPriceRange({ min: null, max: null })}
              className="text-xs text-[#2E7D32] hover:underline"
            >
              {t('clearPriceFilter') || t('clearFilters')}
            </button>
          )}
        </div>
      </section>

      {/* Makers Filter */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('productsFilterMakersTitle')}
        </h2>
        <div className="space-y-2 text-sm text-gray-700 max-h-64 overflow-y-auto">
          {availableMakers.length > 0 ? (
            availableMakers.map((maker) => (
              <label
                key={maker.id}
                className="flex items-center space-x-3 cursor-pointer hover:text-[#2E7D32] transition"
              >
                <input
                  type="checkbox"
                  checked={makers.includes(maker.id)}
                  onChange={() => toggleMaker(maker.id)}
                  className="rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]"
                />
                <span className="truncate">{maker.name}</span>
              </label>
            ))
          ) : (
            <div className="text-gray-400 text-xs py-2">{t('noMakersDescription') || t('noContent')}</div>
          )}
        </div>
      </section>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">{t('activeFilters') || 'Active filters'}:</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-1 bg-[#2E7D32]/10 text-[#2E7D32] rounded text-xs"
              >
                {cat}
              </span>
            ))}
            {(priceRange.min !== null || priceRange.max !== null) && (
              <span className="px-2 py-1 bg-[#2E7D32]/10 text-[#2E7D32] rounded text-xs">
                {priceRange.min ?? 0} - {priceRange.max ?? '∞'}
              </span>
            )}
            {makers.length > 0 && (
              <span className="px-2 py-1 bg-[#2E7D32]/10 text-[#2E7D32] rounded text-xs">
                {makers.length} {t('makers')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

