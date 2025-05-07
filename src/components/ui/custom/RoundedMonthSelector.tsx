'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface RoundedMonthSelectorProps {
  selectedMonth: string;
  onChange: (month: string) => void;
}

export default function RoundedMonthSelector({ selectedMonth, onChange }: RoundedMonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hardcode the years to ensure we don't go beyond April 2025
  const currentYear = 2024;
  const previousYear = 2023;
  const nextYear = 2025; // Only show up to April 2025

  // Define months array
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Create organized options by year - each month with a single year
  // For next year, only include up to April
  const nextYearOptions = months.slice(0, 4).map(month => `${month} ${nextYear}`);
  const currentYearOptions = months.map(month => `${month} ${currentYear}`);
  const previousYearOptions = months.map(month => `${month} ${previousYear}`);

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

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center justify-between px-3 py-1.5 font-medium bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer rounded-full month-selector-rounded"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          fontSize: '14px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          maxWidth: '140px'
        }}
      >
        <span className="truncate">
          {(() => {
            // If it already has a space (indicating a year is present)
            if (selectedMonth.includes(' ')) {
              // Extract just the month and year (in case there are multiple years)
              const parts = selectedMonth.split(' ');
              const month = parts[0];
              // Get the last year mentioned (in case there are multiple)
              const year = parts[parts.length - 1];
              // Return the cleaned format
              return `${month} ${year}`;
            } else {
              // If no year, add the current year
              return `${selectedMonth} ${currentYear}`;
            }
          })()}
        </span>
        <ChevronDown className="ml-1 h-3 w-3 flex-shrink-0" />
      </div>

      {isOpen && (
        <div
          className="absolute right-0 top-10 w-52 bg-white shadow-lg z-50 border border-gray-200 rounded-2xl overflow-hidden"
        >
          <div className="py-1 max-h-80 overflow-y-auto">
            {/* Next Year Section (up to April only) */}
            <div className="px-3 py-1.5 font-bold text-primary bg-primary/5 border-b border-gray-200" style={{ fontSize: '14px' }}>
              {nextYear} (Jan-Apr)
            </div>
            {nextYearOptions.map((monthYear) => (
              <div
                key={monthYear}
                className="block w-full text-left px-3 py-1.5 text-gray-800 hover:bg-gray-50 cursor-pointer"
                style={{ fontSize: '14px' }}
                onClick={() => {
                  onChange(monthYear);
                  setIsOpen(false);
                }}
              >
                {monthYear}
              </div>
            ))}

            {/* Current Year Section */}
            <div className="px-3 py-1.5 font-bold text-primary bg-primary/5 border-b border-t border-gray-200" style={{ fontSize: '14px' }}>
              {currentYear}
            </div>
            {currentYearOptions.map((monthYear) => (
              <div
                key={monthYear}
                className="block w-full text-left px-3 py-1.5 text-gray-800 hover:bg-gray-50 cursor-pointer"
                style={{ fontSize: '14px' }}
                onClick={() => {
                  onChange(monthYear);
                  setIsOpen(false);
                }}
              >
                {monthYear}
              </div>
            ))}

            {/* Previous Year Section */}
            <div className="px-3 py-1.5 font-bold text-primary bg-primary/5 border-b border-t border-gray-200" style={{ fontSize: '14px' }}>
              {previousYear}
            </div>
            {previousYearOptions.map((monthYear) => (
              <div
                key={monthYear}
                className="block w-full text-left px-3 py-1.5 text-gray-800 hover:bg-gray-50 cursor-pointer"
                style={{ fontSize: '14px' }}
                onClick={() => {
                  onChange(monthYear);
                  setIsOpen(false);
                }}
              >
                {monthYear}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
