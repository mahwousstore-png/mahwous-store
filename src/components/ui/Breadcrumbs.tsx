import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 space-x-reverse text-sm mb-6">
      {/* الصفحة الرئيسية */}
      <button
        onClick={items[0]?.onClick}
        className="flex items-center gap-1 text-[#B0B0B0] hover:text-[#D4AF37] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>الرئيسية</span>
      </button>

      {/* باقي المسار */}
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronLeft className="w-4 h-4 text-[#707070]" />
          {index === items.length - 1 ? (
            // الصفحة الحالية (غير قابلة للنقر)
            <span className="text-[#D4AF37] font-medium">{item.label}</span>
          ) : (
            // صفحة وسيطة (قابلة للنقر)
            <button
              onClick={item.onClick}
              className="text-[#B0B0B0] hover:text-[#D4AF37] transition-colors"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
