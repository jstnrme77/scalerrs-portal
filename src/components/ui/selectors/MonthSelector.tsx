'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string;
  onChange: (month: string) => void;
}

export default function MonthSelector({ selectedMonth, onChange }: MonthSelectorProps) {
  // Apply custom styles to ensure 16px font size
  const customStyles = {
    fontSize: '16px !important',
    fontFamily: 'Roboto, sans-serif !important',
    lineHeight: '1.5 !important'
  };
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current year and previous year
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const nextYear = currentYear + 1;

  // Define months array
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Create organized options by year
  const nextYearOptions = months.map(month => `${month} ${nextYear}`);
  const currentYearOptions = months.map(month => `${month} ${currentYear}`);
  const previousYearOptions = months.map(month => `${month} ${previousYear}`);

  // Combine all options for the dropdown
  const monthYearOptions = [
    ...nextYearOptions,
    ...currentYearOptions,
    ...previousYearOptions
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMonthSelect = (month: string) => {
    onChange(month);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="card flex items-center justify-between w-52 px-4 py-2 font-medium bg-white border border-lightGray hover:bg-lightGray text-base month-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ ...customStyles, color: '#353233', borderRadius: '9999px' }}
      >
        <span style={customStyles}>{selectedMonth}</span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg z-10 border border-lightGray" style={{ borderRadius: '16px' }}>
          <div className="py-1 max-h-80 overflow-y-auto">
            {/* Next Year Section */}
            <div className="px-4 py-2 font-bold text-primary bg-primary/5 border-b border-lightGray" style={customStyles}>
              {nextYear}
            </div>
            {nextYearOptions.map((monthYear) => (
              <button
                key={monthYear}
                className="block w-full text-left px-4 py-2 text-dark hover:bg-lightGray month-selector-button"
                style={customStyles}
                onClick={() => handleMonthSelect(monthYear)}
              >
                {monthYear}
              </button>
            ))}

            {/* Current Year Section */}
            <div className="px-4 py-2 font-bold text-primary bg-primary/5 border-b border-t border-lightGray" style={customStyles}>
              {currentYear}
            </div>
            {currentYearOptions.map((monthYear) => (
              <button
                key={monthYear}
                className="block w-full text-left px-4 py-2 text-dark hover:bg-lightGray month-selector-button"
                style={customStyles}
                onClick={() => handleMonthSelect(monthYear)}
              >
                {monthYear}
              </button>
            ))}

            {/* Previous Year Section */}
            <div className="px-4 py-2 font-bold text-primary bg-primary/5 border-b border-t border-lightGray" style={customStyles}>
              {previousYear}
            </div>
            {previousYearOptions.map((monthYear) => (
              <button
                key={monthYear}
                className="block w-full text-left px-4 py-2 text-dark hover:bg-lightGray month-selector-button"
                style={customStyles}
                onClick={() => handleMonthSelect(monthYear)}
              >
                {monthYear}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
