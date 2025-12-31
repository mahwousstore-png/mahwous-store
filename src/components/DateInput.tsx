/**
 * DateInput - مكون متوافق 100% مع <input type="date">
 * لكن بتصميم داكن واحترافي
 */

import React from 'react';
import { DarkDatePicker } from './DarkDatePicker';

interface DateInputProps {
  value?: string; // YYYY-MM-DD format
  onChange?: (e: { target: { value: string } }) => void;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  min,
  max,
  required,
  disabled,
  className,
  placeholder,
}) => {
  // تحويل string إلى Date
  const dateValue = value ? new Date(value) : undefined;
  const minDate = min ? new Date(min) : undefined;
  const maxDate = max ? new Date(max) : undefined;

  // معالج التغيير - يحول Date إلى string بصيغة YYYY-MM-DD
  const handleChange = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    // محاكاة event object مثل input العادي
    onChange?.({ target: { value: dateString } } as any);
  };

  return (
    <div className={className}>
      <DarkDatePicker
        value={dateValue}
        onChange={handleChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        placeholder={placeholder || 'اختر التاريخ'}
        showTime={false}
      />
    </div>
  );
};
