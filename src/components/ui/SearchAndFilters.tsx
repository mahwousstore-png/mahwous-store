import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, SortAsc, SortDesc } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface SearchAndFiltersProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilter?: (filters: Record<string, string>) => void;
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  filterOptions?: {
    name: string;
    label: string;
    options: FilterOption[];
  }[];
  sortOptions?: FilterOption[];
  showFilters?: boolean;
  showSort?: boolean;
}

export default function SearchAndFilters({
  placeholder = 'ابحث...',
  onSearch,
  onFilter,
  onSort,
  filterOptions = [],
  sortOptions = [],
  showFilters = true,
  showSort = true,
}: SearchAndFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // البحث مع Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  // تطبيق الفلاتر
  useEffect(() => {
    if (onFilter) {
      onFilter(activeFilters);
    }
  }, [activeFilters, onFilter]);

  // تطبيق الفرز
  useEffect(() => {
    if (onSort && sortBy) {
      onSort(sortBy, sortOrder);
    }
  }, [sortBy, sortOrder, onSort]);

  const handleFilterChange = (filterName: string, value: string) => {
    if (value === '') {
      const newFilters = { ...activeFilters };
      delete newFilters[filterName];
      setActiveFilters(newFilters);
    } else {
      setActiveFilters({ ...activeFilters, [filterName]: value });
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setSortBy('');
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-4">
      {/* شريط البحث والفلاتر */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* حقل البحث */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0B0B0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pr-10 pl-4 py-3 bg-[#1A1A1A] border border-[rgba(212,175,55,0.2)] rounded-lg text-white placeholder-[#707070] focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.1)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* اقتراحات البحث */}
          {suggestions.length > 0 && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(suggestion)}
                  className="w-full px-4 py-2 text-right text-white hover:bg-[rgba(212,175,55,0.1)] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* أزرار الفلاتر والفرز */}
        <div className="flex gap-2">
          {/* زر الفلاتر */}
          {showFilters && filterOptions.length > 0 && (
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="relative px-4 py-3 bg-[#1A1A1A] border border-[rgba(212,175,55,0.2)] rounded-lg text-white hover:border-[#D4AF37] hover:bg-[rgba(212,175,55,0.05)] transition-all flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              <span>فلاتر</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -left-2 w-6 h-6 bg-[#D4AF37] text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* قائمة الفرز */}
          {showSort && sortOptions.length > 0 && (
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-[#1A1A1A] border border-[rgba(212,175,55,0.2)] rounded-lg text-white hover:border-[#D4AF37] focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.1)] transition-all appearance-none pr-10"
              >
                <option value="">ترتيب حسب</option>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0B0] pointer-events-none" />
            </div>
          )}

          {/* زر اتجاه الفرز */}
          {showSort && sortBy && (
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-3 bg-[#1A1A1A] border border-[rgba(212,175,55,0.2)] rounded-lg text-white hover:border-[#D4AF37] hover:bg-[rgba(212,175,55,0.05)] transition-all"
              title={sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-5 h-5" />
              ) : (
                <SortDesc className="w-5 h-5" />
              )}
            </button>
          )}

          {/* زر مسح الفلاتر */}
          {(activeFilterCount > 0 || searchQuery || sortBy) && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">مسح</span>
            </button>
          )}
        </div>
      </div>

      {/* قائمة الفلاتر المنسدلة */}
      {showFilterMenu && filterOptions.length > 0 && (
        <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-lg p-4 space-y-4 animate-slideDown">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterOptions.map((filter) => (
              <div key={filter.name}>
                <label className="block text-sm font-medium text-[#D4AF37] mb-2">
                  {filter.label}
                </label>
                <select
                  value={activeFilters[filter.name] || ''}
                  onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[rgba(212,175,55,0.2)] rounded-lg text-white focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.1)] transition-all"
                >
                  <option value="">الكل</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* الفلاتر النشطة */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filterOptions.find((f) => f.name === key);
            const option = filter?.options.find((o) => o.value === value);
            return (
              <div
                key={key}
                className="inline-flex items-center gap-2 px-3 py-1 bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] rounded-full text-sm text-[#D4AF37]"
              >
                <span className="font-medium">{filter?.label}:</span>
                <span>{option?.label}</span>
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
