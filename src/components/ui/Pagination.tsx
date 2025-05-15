import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  totalItems?: number;
  pageSize?: number;
  className?: string;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  totalItems,
  pageSize,
  className = '',
  showPageNumbers = true,
  maxPageButtons = 5
}: PaginationProps) {
  // Calculate the range of page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first and last page
    const firstPage = 1;
    const lastPage = totalPages;

    // Calculate the middle range
    let startPage = Math.max(currentPage - Math.floor(maxPageButtons / 2), firstPage);
    let endPage = startPage + maxPageButtons - 1;

    // Adjust if we're near the end
    if (endPage > lastPage) {
      endPage = lastPage;
      startPage = Math.max(endPage - maxPageButtons + 1, firstPage);
    }

    // Generate the array of page numbers
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    // Add ellipses if needed
    const result = [];
    
    if (startPage > firstPage) {
      result.push(firstPage);
      if (startPage > firstPage + 1) {
        result.push('...');
      }
    }
    
    result.push(...pages);
    
    if (endPage < lastPage) {
      if (endPage < lastPage - 1) {
        result.push('...');
      }
      result.push(lastPage);
    }
    
    return result;
  };

  // Calculate the range of items being displayed
  const getItemRange = () => {
    if (!totalItems || !pageSize) return null;
    
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalItems);
    
    return `${start}-${end} of ${totalItems}`;
  };

  return (
    <div className={`flex items-center justify-between py-3 ${className}`}>
      <div className="flex-1 text-sm text-gray-700">
        {totalItems && pageSize && (
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{getItemRange()}</span>
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className={`p-2 rounded-md ${
            hasPreviousPage
              ? 'text-gray-700 hover:bg-gray-100'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        
        {/* Page numbers */}
        {showPageNumbers && (
          <div className="hidden sm:flex space-x-1">
            {getPageNumbers().map((page, index) => (
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    page === currentPage
                      ? 'bg-[#9EA8FB] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={index} className="px-2 py-1 text-gray-500">
                  {page}
                </span>
              )
            ))}
          </div>
        )}
        
        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={`p-2 rounded-md ${
            hasNextPage
              ? 'text-gray-700 hover:bg-gray-100'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
