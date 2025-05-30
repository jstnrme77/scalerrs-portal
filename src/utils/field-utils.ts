/**
 * Utilities for handling field values across the application
 * This centralizes field manipulation and formatting logic
 */

/**
 * Get a display value from a field that could be string, array, or undefined
 * @param field Field value
 * @param defaultValue Default value if field is empty
 * @returns Display value
 */
export function getDisplayValue(field: string | string[] | undefined, defaultValue: string = 'Unassigned'): string {
  if (!field) return defaultValue;

  if (typeof field === 'string') {
    return field;
  }

  if (Array.isArray(field) && field.length > 0) {
    return typeof field[0] === 'string' ? field[0] : defaultValue;
  }

  return defaultValue;
}

/**
 * Ensure a value is an array
 * @param value Value to ensure is an array
 * @returns Array of values
 */
export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Truncate a string to a maximum length
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Format a record ID for display
 * @param id Record ID
 * @returns Formatted ID
 */
export function formatRecordId(id: string): string {
  if (!id) return '';
  return id.length > 8 ? `${id.substring(0, 8)}...` : id;
}

/**
 * Convert a priority value to a standardized level
 * @param priority Priority value
 * @returns Standardized priority level
 */
export function getPriorityLevel(priority: string | number | undefined): 'high' | 'medium' | 'low' {
  if (!priority) return 'medium';

  if (typeof priority === 'string') {
    const lowerPriority = priority.toLowerCase();
    if (lowerPriority.includes('high') || lowerPriority.includes('urgent')) {
      return 'high';
    } else if (lowerPriority.includes('low')) {
      return 'low';
    }
    return 'medium';
  }

  if (typeof priority === 'number') {
    if (priority >= 8) {
      return 'high';
    } else if (priority <= 3) {
      return 'low';
    }
    return 'medium';
  }

  return 'medium';
}

/**
 * Get a field value with fallbacks
 * @param obj Object to get field from
 * @param fields Array of field names to try
 * @param defaultValue Default value if no field is found
 * @returns Field value or default
 */
export function getFieldWithFallback<T>(obj: any, fields: string[], defaultValue: T): T {
  if (!obj) return defaultValue;

  for (const field of fields) {
    if (obj[field] !== undefined && obj[field] !== null) {
      return obj[field];
    }
  }

  return defaultValue;
}

/**
 * Check if a URL is valid
 * @param url URL to check
 * @returns Whether the URL is valid
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;

  // Try with the original URL
  try {
    new URL(url);
    return true;
  } catch (error) {
    // If it fails, try adding https:// prefix and check again
    if (url.startsWith('www.') || url.includes('.')) {
      try {
        new URL(`https://${url}`);
        return true;
      } catch (innerError) {
        return false;
      }
    }
    return false;
  }
}

/**
 * Ensure a URL has a protocol (http:// or https://)
 * @param url URL to check and fix
 * @returns URL with protocol
 */
export function ensureUrlProtocol(url: string): string {
  if (!url) return '';

  // Check if URL already has a protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Add https:// protocol if missing
  return `https://${url}`;
}

/**
 * Format a date string from Airtable to display only the date part
 * @param dateString The date string to format (ISO format from Airtable)
 * @param fallback Optional fallback string if date is invalid
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDate(dateString: string | undefined | null, fallback: string = ''): string {
  if (!dateString) return fallback;
  
  try {
    // Parse the ISO date string
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return fallback;
    }
    
    // Format as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
}
