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

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center justify-between w-40 px-4 py-2 font-medium bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer rounded-full"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          fontSize: '16px',
          overflow: 'hidden'
        }}
      >
        <span>{selectedMonth}</span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </div>

      {isOpen && (
        <div
          className="absolute right-0 top-12 w-56 bg-white shadow-lg z-20 border border-gray-200 rounded-2xl overflow-hidden"
        >
          <div className="py-1">
            {months.map((month) => (
              <div
                key={month}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-50 cursor-pointer"
                style={{ fontSize: '16px' }}
                onClick={() => {
                  onChange(month);
                  setIsOpen(false);
                }}
              >
                {month}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
