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
}

export default function ProductFilters({ onFilterChange, initialFilters }: ProductFiltersProps) {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<string[]>(initialFilters?.categories || []);
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>(
    initialFilters?.priceRange || { min: null, max: null }
  );
  const [makers, setMakers] = useState<string[]>(initialFilters?.makers || []);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableMakers, setAvailableMakers] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  const isRTL = language === 'ar';

  // Fetch available categories and makers
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setLoading(true);
      
      // Fetch all products to extract unique categories and makers
      const response = await productsAPI.getProducts();
      const products = response.data?.data || response.data || [];

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(products.map((p: any) => p.category).filter(Boolean))
      ) as string[];
      setAvailableCategories(uniqueCategories);

      // Extract unique makers (from userId or maker relation)
      const uniqueMakers = Array.from(
        new Set(
          products
            .map((p: any) => ({
              id: p.maker?.id || p.userId,
              name: p.maker?.name || p.user?.name || 'Unknown',
            }))
            .filter((m: any) => m.id && m.name !== 'Unknown')
        )
      ) as Array<{ id: string; name: string }>;
      setAvailableMakers(uniqueMakers);
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
        <div className="text-center text-gray-500 py-4">加载筛选选项...</div>
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
            清除所有筛选
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
            <div className="text-gray-400 text-xs py-2">暂无分类</div>
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
              placeholder="最低价"
              value={priceRange.min ?? ''}
              onChange={(e) => handlePriceMinChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32]"
              min="0"
              step="0.01"
            />
            <span className="text-gray-500 text-sm">至</span>
            <input
              type="number"
              placeholder="最高价"
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
              清除价格筛选
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
            <div className="text-gray-400 text-xs py-2">暂无制造商</div>
          )}
        </div>
      </section>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">已选筛选:</div>
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
                {makers.length} 制造商
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

