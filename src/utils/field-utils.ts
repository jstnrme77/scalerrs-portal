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
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}
