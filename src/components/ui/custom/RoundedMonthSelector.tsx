'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { fetchAvailableMonths } from '@/lib/client-api';

interface RoundedMonthSelectorProps {
  selectedMonth: string;
  onChange: (month: string) => void;
}

export default function RoundedMonthSelector({ selectedMonth, onChange }: RoundedMonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Default current year for fallback
  const currentYear = new Date().getFullYear();

  // Fetch available months from Airtable
  useEffect(() => {
    async function fetchMonths() {
      try {
        setLoading(true);
        const months = await fetchAvailableMonths();
        if (months && months.length > 0) {
          setAvailableMonths(months);
        } else {
          // Fallback to default months if none returned
          setAvailableMonths([
            // 2024 months
            'January 2024',
            'February 2024',
            'March 2024',
            'April 2024',
            'May 2024',
            'June 2024',
            'July 2024',
            'August 2024',
            'September 2024',
            'October 2024',
            'November 2024',
            'December 2024',
            // 2025 months
            'January 2025',
            'February 2025',
            'March 2025',
            'April 2025',
            'May 2025',
            'June 2025',
            'July 2025',
            'August 2025'
          ]);
        }
      } catch (error) {
        console.error('Error fetching available months:', error);
        // Fallback to default months
        setAvailableMonths([
          // 2024 months
          'January 2024',
          'February 2024',
          'March 2024',
          'April 2024',
          'May 2024',
          'June 2024',
          'July 2024',
          'August 2024',
          'September 2024',
          'October 2024',
          'November 2024',
          'December 2024',
          // 2025 months
          'January 2025',
          'February 2025',
          'March 2025',
          'April 2025',
          'May 2025',
          'June 2025',
          'July 2025',
          'August 2025'
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchMonths();
  }, []);

  // Group months by year
  const groupedMonths = availableMonths.reduce<Record<string, string[]>>((acc, month) => {
    const parts = month.split(' ');
    if (parts.length >= 2) {
      const year = parts[parts.length - 1];
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(month);
    }
    return acc;
  }, {});

  // Sort years in descending order
  const sortedYears = Object.keys(groupedMonths).sort((a, b) => parseInt(b) - parseInt(a));

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
            {loading ? (
              <div className="px-3 py-2 text-sm text-gray-700">Loading months...</div>
            ) : sortedYears.length > 0 ? (
              sortedYears.map(year => (
                <div key={year}>
                  <div className="px-3 py-1.5 font-bold text-primary bg-primary/5 border-b border-gray-200" style={{ fontSize: '14px' }}>
                    {year}
                  </div>
                  {groupedMonths[year].map((monthYear) => (
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
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-700">No months available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
