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

  // Get current month and year for default selection
  const getCurrentMonthYear = () => {
    const date = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  // Use the provided selectedMonth or default to current month
  const effectiveSelectedMonth = selectedMonth || getCurrentMonthYear();

  // Default current year for fallback
  const currentYear = new Date().getFullYear();

  // Default months to show immediately while loading
  const defaultMonths = [
    // Current and next few months (most relevant)
    'May 2024',
    'June 2024',
    'July 2024',
    'August 2024',
    'September 2024',
    'October 2024',
    'November 2024',
    'December 2024',
    'January 2025',
    'February 2025'
  ];

  // Initialize with default months to avoid empty state
  useEffect(() => {
    setAvailableMonths(defaultMonths);
  }, []);

  // Fetch available months from Airtable with debounce
  useEffect(() => {
    // Set a flag to track if the component is still mounted
    let isMounted = true;

    async function fetchMonths() {
      try {
        // Don't show loading state immediately to avoid flickering
        // Only set loading to true if the fetch takes longer than 200ms
        const loadingTimeout = setTimeout(() => {
          if (isMounted) setLoading(true);
        }, 200);

        const months = await fetchAvailableMonths();

        // Clear the loading timeout
        clearTimeout(loadingTimeout);

        if (!isMounted) return;

        // Check if months is an array and has items
        if (months && Array.isArray(months) && months.length > 0) {
          console.log('Successfully loaded months:', months);
          setAvailableMonths(months);
        } else {
          console.log('No valid months returned, using default months');
          // Fallback to default months if none returned or invalid format
          setAvailableMonths(defaultMonths);
        }
      } catch (error) {
        console.error('Error fetching available months:', error);
        // Fallback to default months
        if (isMounted) {
          setAvailableMonths(defaultMonths);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Fetch months in the background
    fetchMonths();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
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
            if (effectiveSelectedMonth.includes(' ')) {
              // Extract just the month and year (in case there are multiple years)
              const parts = effectiveSelectedMonth.split(' ');
              const month = parts[0];
              // Get the last year mentioned (in case there are multiple)
              const year = parts[parts.length - 1];
              // Return the cleaned format
              return `${month} ${year}`;
            } else {
              // If no year, add the current year
              return `${effectiveSelectedMonth} ${currentYear}`;
            }
          })()}
        </span>
        {loading ? (
          <div className="ml-1 h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-purple-600"></div>
        ) : (
          <ChevronDown className="ml-1 h-3 w-3 flex-shrink-0" />
        )}
      </div>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1 bg-white shadow-lg z-50 border border-gray-200 rounded-2xl overflow-hidden month-selector-dropdown"
          style={{
            width: '240px',
            zIndex: 9999,
            paddingRight: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="py-1 max-h-80 overflow-y-auto" style={{ paddingRight: '8px' }}>
            {loading ? (
              <div className="px-3 py-2 text-sm text-gray-700" style={{ paddingRight: '20px' }}>Loading months...</div>
            ) : sortedYears.length > 0 ? (
              sortedYears.map(year => (
                <div key={year}>
                  <div className="px-3 py-1.5 font-bold text-primary bg-primary/5 border-b border-gray-200" style={{ fontSize: '14px', paddingRight: '20px' }}>
                    {year}
                  </div>
                  {groupedMonths[year].map((monthYear) => (
                    <div
                      key={monthYear}
                      className="block w-full text-left px-3 py-1.5 text-gray-800 hover:bg-gray-50 cursor-pointer"
                      style={{ fontSize: '14px', paddingRight: '20px' }}
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
              <div className="px-3 py-2 text-sm text-gray-700" style={{ paddingRight: '20px' }}>No months available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
