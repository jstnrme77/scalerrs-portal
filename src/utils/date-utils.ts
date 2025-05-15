/**
 * Utilities for handling dates across the application
 * This centralizes date formatting and manipulation logic
 */

/**
 * Format a date as "MMM D" (e.g., "Apr 7")
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatShortDate(dateString?: string): string {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original on error
  }
}

/**
 * Format a date as a relative time string (e.g., "2 days ago")
 * @param dateString ISO date string
 * @returns Formatted relative date string
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Get month abbreviation from month number (0-11)
 * @param month Month number (0-11)
 * @returns Month abbreviation (e.g., "Jan", "Feb")
 */
export function getMonthAbbreviation(month: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month];
}

/**
 * Check if a date is in the past (overdue)
 * @param dateString ISO date string
 * @returns Whether the date is overdue
 */
export function isDateOverdue(dateString?: string): boolean {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return false; // Invalid date is not overdue
    }
    
    return date < new Date();
  } catch (error) {
    console.error('Error checking if date is overdue:', error);
    return false; // Error means not overdue
  }
}

/**
 * Format a date as "YYYY-MM-DD"
 * @param date Date object or ISO date string
 * @returns Formatted date string
 */
export function formatISODate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return ''; // Invalid date
  }
  
  return dateObj.toISOString().split('T')[0];
}

/**
 * Get the current month and year as a string (e.g., "April 2023")
 * @returns Current month and year
 */
export function getCurrentMonthYear(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}
