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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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
        className="card flex items-center justify-between w-40 px-4 py-2 font-medium bg-white border border-lightGray hover:bg-lightGray text-base month-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ ...customStyles, color: '#353233', borderRadius: '9999px' }}
      >
        <span style={customStyles}>{selectedMonth}</span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg z-10 border border-lightGray" style={{ borderRadius: '16px' }}>
          <div className="py-1">
            {months.map((month, index) => (
              <button
                key={month}
                className="block w-full text-left px-4 py-2 text-dark hover:bg-lightGray month-selector-button"
                style={{
                  ...customStyles,
                  borderRadius: index === 0 ? '16px 16px 0 0' : index === months.length - 1 ? '0 0 16px 16px' : '0'
                }}
                onClick={() => handleMonthSelect(month)}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
