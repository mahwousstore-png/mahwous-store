/**
 * مكونات عرض التاريخ والوقت
 * Date Display Components
 */

import React from 'react';
import { formatInvoiceDateTime, formatNotificationDateTime, formatDateOnly, formatTimeOnly } from '../lib/dateTimeUtils';

interface DateDisplayProps {
  date: string | Date;
  className?: string;
}

/**
 * عرض التاريخ والوقت للفواتير والسجلات
 * Format: DD/MM/YYYY - hh:mm A
 * Color: White (#FFFFFF)
 */
export const InvoiceDateTime: React.FC<DateDisplayProps> = ({ date, className = '' }) => {
  if (!date) return <span className={className}>-</span>;
  
  return (
    <span className={`invoice-datetime ${className}`} style={{ color: '#FFFFFF' }}>
      {formatInvoiceDateTime(date)}
    </span>
  );
};

/**
 * عرض التاريخ والوقت للإشعارات والسجلات
 * Format: Relative (ago) if < 24h
 * Color: Grey (#AAAAAA)
 */
export const NotificationDateTime: React.FC<DateDisplayProps> = ({ date, className = '' }) => {
  if (!date) return <span className={className}>-</span>;
  
  return (
    <span className={`notification-datetime ${className}`} style={{ color: '#AAAAAA' }}>
      {formatNotificationDateTime(date)}
    </span>
  );
};

/**
 * عرض التاريخ فقط (بدون وقت)
 * Format: DD/MM/YYYY
 */
export const DateOnly: React.FC<DateDisplayProps> = ({ date, className = '' }) => {
  if (!date) return <span className={className}>-</span>;
  
  return (
    <span className={`date-only ${className}`}>
      {formatDateOnly(date)}
    </span>
  );
};

/**
 * عرض الوقت فقط (بدون تاريخ)
 * Format: hh:mm A
 */
export const TimeOnly: React.FC<DateDisplayProps> = ({ date, className = '' }) => {
  if (!date) return <span className={className}>-</span>;
  
  return (
    <span className={`time-only ${className}`}>
      {formatTimeOnly(date)}
    </span>
  );
};

/**
 * مكون ذكي يختار التنسيق المناسب تلقائياً
 * - للجداول والفواتير: InvoiceDateTime
 * - للإشعارات: NotificationDateTime
 */
interface SmartDateTimeProps extends DateDisplayProps {
  type?: 'invoice' | 'notification' | 'date' | 'time';
}

export const SmartDateTime: React.FC<SmartDateTimeProps> = ({ date, type = 'invoice', className }) => {
  switch (type) {
    case 'invoice':
      return <InvoiceDateTime date={date} className={className} />;
    case 'notification':
      return <NotificationDateTime date={date} className={className} />;
    case 'date':
      return <DateOnly date={date} className={className} />;
    case 'time':
      return <TimeOnly date={date} className={className} />;
    default:
      return <InvoiceDateTime date={date} className={className} />;
  }
};
