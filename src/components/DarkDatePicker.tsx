/**
 * DatePicker مخصص داكن مع تمييز ذهبي
 * Custom Dark DatePicker - Mahwous Professional
 */

import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { getArabicMonthName, getArabicDayName } from '../lib/dateTimeUtils';

interface DarkDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  showTime?: boolean;
}

export const DarkDatePicker: React.FC<DarkDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'اختر التاريخ',
  minDate,
  maxDate,
  disabled = false,
  showTime = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [viewMonth, setViewMonth] = useState(value || new Date());
  const [selectedHour, setSelectedHour] = useState(value ? value.getHours() : 12);
  const [selectedMinute, setSelectedMinute] = useState(value ? value.getMinutes() : 0);
  const [selectedAmPm, setSelectedAmPm] = useState<'AM' | 'PM'>(
    value && value.getHours() >= 12 ? 'PM' : 'AM'
  );
  
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setViewMonth(value);
      if (showTime) {
        setSelectedHour(value.getHours() % 12 || 12);
        setSelectedMinute(value.getMinutes());
        setSelectedAmPm(value.getHours() >= 12 ? 'PM' : 'AM');
      }
    }
  }, [value, showTime]);

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    
    if (showTime) {
      let hours = selectedHour;
      if (selectedAmPm === 'PM' && hours !== 12) hours += 12;
      if (selectedAmPm === 'AM' && hours === 12) hours = 0;
      
      newDate.setHours(hours, selectedMinute);
    }
    
    setSelectedDate(newDate);
    onChange(newDate);
    
    if (!showTime) {
      setIsOpen(false);
    }
  };

  const handleTimeConfirm = () => {
    if (selectedDate) {
      let hours = selectedHour;
      if (selectedAmPm === 'PM' && hours !== 12) hours += 12;
      if (selectedAmPm === 'AM' && hours === 12) hours = 0;
      
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, selectedMinute);
      
      onChange(newDate);
      setIsOpen(false);
    }
  };

  const prevMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1));
  };

  const formatDisplayValue = (): string => {
    if (!selectedDate) return placeholder;
    
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    
    if (showTime) {
      let hours = selectedDate.getHours();
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const hoursStr = String(hours).padStart(2, '0');
      
      return `${day}/${month}/${year} - ${hoursStr}:${minutes} ${ampm}`;
    }
    
    return `${day}/${month}/${year}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewMonth);
    const firstDay = getFirstDayOfMonth(viewMonth);
    const days = [];

    // أيام فارغة قبل بداية الشهر
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    // أيام الشهر
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();
      
      const isToday = new Date().toDateString() === date.toDateString();
      
      const isDisabled = 
        (minDate && date < minDate) ||
        (maxDate && date > maxDate);

      days.push(
        <button
          key={day}
          type="button"
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''}`}
          onClick={() => !isDisabled && handleDateSelect(day)}
          disabled={isDisabled}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="dark-datepicker-container" ref={pickerRef}>
      <button
        type="button"
        className="datepicker-input"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={selectedDate ? 'has-value' : 'placeholder'}>
          {formatDisplayValue()}
        </span>
        <Calendar size={20} />
      </button>

      {isOpen && (
        <div className="datepicker-dropdown">
          {/* رأس التقويم */}
          <div className="calendar-header">
            <button type="button" onClick={nextMonth} className="nav-button">
              ←
            </button>
            <div className="month-year">
              {getArabicMonthName(viewMonth.getMonth())} {viewMonth.getFullYear()}
            </div>
            <button type="button" onClick={prevMonth} className="nav-button">
              →
            </button>
          </div>

          {/* أسماء الأيام */}
          <div className="calendar-weekdays">
            {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
              <div key={day} className="weekday">
                {day.substring(0, 3)}
              </div>
            ))}
          </div>

          {/* الأيام */}
          <div className="calendar-days">
            {renderCalendar()}
          </div>

          {/* اختيار الوقت */}
          {showTime && (
            <div className="time-picker">
              <div className="time-inputs">
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(Number(e.target.value))}
                  className="time-select"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="time-separator">:</span>
                <select
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(Number(e.target.value))}
                  className="time-select"
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedAmPm}
                  onChange={(e) => setSelectedAmPm(e.target.value as 'AM' | 'PM')}
                  className="time-select ampm"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleTimeConfirm}
                className="confirm-time-button"
              >
                تأكيد
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .dark-datepicker-container {
          position: relative;
          width: 100%;
        }

        .datepicker-input {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background-color: #1F1F1F;
          border: 1px solid #2d2d2d;
          border-radius: 8px;
          color: #FFFFFF;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .datepicker-input:hover:not(:disabled) {
          border-color: #D4AF37;
          background-color: #2a2a2a;
        }

        .datepicker-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .datepicker-input .placeholder {
          color: #AAAAAA;
        }

        .datepicker-input .has-value {
          color: #FFFFFF;
        }

        .datepicker-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background-color: #1F1F1F;
          border: 2px solid #D4AF37;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
          z-index: 1000;
          min-width: 320px;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .month-year {
          color: #D4AF37;
          font-weight: 600;
          font-size: 1rem;
        }

        .nav-button {
          background: transparent;
          border: none;
          color: #FFFFFF;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .nav-button:hover {
          background-color: #2a2a2a;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .weekday {
          text-align: center;
          color: #AAAAAA;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.5rem 0;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #FFFFFF;
          font-size: 0.875rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .calendar-day.empty {
          cursor: default;
        }

        .calendar-day:not(.empty):not(.disabled):hover {
          background-color: #2a2a2a;
        }

        .calendar-day.today {
          border: 1px solid #D4AF37;
        }

        .calendar-day.selected {
          background-color: #D4AF37 !important;
          color: #000000 !important;
          font-weight: 600;
        }

        .calendar-day.disabled {
          color: #555555;
          cursor: not-allowed;
        }

        .time-picker {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #2d2d2d;
        }

        .time-inputs {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .time-select {
          background-color: #2a2a2a;
          border: 1px solid #2d2d2d;
          color: #FFFFFF;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .time-select.ampm {
          width: 70px;
        }

        .time-separator {
          color: #D4AF37;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .confirm-time-button {
          width: 100%;
          background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
          color: #000000;
          border: none;
          padding: 0.625rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .confirm-time-button:hover {
          background: linear-gradient(135deg, #F4D03F 0%, #FFE55C 100%);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};
