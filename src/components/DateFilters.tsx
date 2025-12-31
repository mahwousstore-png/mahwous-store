import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export type DateFilterType = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all';

interface DateFiltersProps {
  activeFilter: DateFilterType;
  onFilterChange: (filter: DateFilterType) => void;
  fromDate?: string;
  toDate?: string;
  onFromDateChange?: (date: string) => void;
  onToDateChange?: (date: string) => void;
  showAllOption?: boolean;
}

const DateFilters: React.FC<DateFiltersProps> = ({
  activeFilter,
  onFilterChange,
  fromDate = '',
  toDate = '',
  onFromDateChange,
  onToDateChange,
  showAllOption = true,
}) => {
  const filters: { value: DateFilterType; label: string }[] = [
    ...(showAllOption ? [{ value: 'all' as DateFilterType, label: 'الكل' }] : []),
    { value: 'today' as DateFilterType, label: 'اليوم' },
    { value: 'week' as DateFilterType, label: 'هذا الأسبوع' },
    { value: 'month' as DateFilterType, label: 'هذا الشهر' },
    { value: 'year' as DateFilterType, label: 'هذه السنة' },
    { value: 'custom' as DateFilterType, label: 'مخصص' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-gold" />
        <h3 className="font-bold text-gray-900">الفترة الزمنية</h3>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`filter-button ${
              activeFilter === filter.value ? 'active' : ''
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {activeFilter === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilters;

// Helper functions for date filtering
export const getDateRange = (filterType: DateFilterType, fromDate?: string, toDate?: string): { start: Date; end: Date } | null => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filterType) {
    case 'all':
      return null;

    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };

    case 'week': {
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return { start: startOfWeek, end: endOfWeek };
    }

    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: startOfMonth, end: endOfMonth };
    }

    case 'year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start: startOfYear, end: endOfYear };
    }

    case 'custom':
      if (fromDate && toDate) {
        const start = new Date(fromDate);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
      return null;

    default:
      return null;
  }
};

export const filterByDateRange = <T extends { date?: string; created_at?: string; transaction_date?: string; payment_date?: string }>(
  items: T[],
  filterType: DateFilterType,
  fromDate?: string,
  toDate?: string
): T[] => {
  const range = getDateRange(filterType, fromDate, toDate);
  
  if (!range) return items;

  return items.filter((item) => {
    const itemDate = new Date(
      item.date || item.transaction_date || item.payment_date || item.created_at || ''
    );
    return itemDate >= range.start && itemDate <= range.end;
  });
};
