/**
 * Filter utility functions for URL encoding/decoding and filter manipulation
 */

import {
  FilterState,
  ApiFilterParams,
  DateRangeFilter,
  UserFilter,
  NumericRangeFilter
} from '@/types/filters';

// ============================================================================
// URL ENCODING/DECODING UTILITIES
// ============================================================================

/**
 * Encodes filter state to URL-safe string parameters
 * @param filters - The filter state to encode
 * @returns URLSearchParams object with encoded filters
 */
export function encodeFiltersToUrl(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  // Text search
  if (filters.textSearch?.query) {
    params.set('q', filters.textSearch.query);
    if (filters.textSearch.fields.length > 0) {
      params.set('search_fields', filters.textSearch.fields.join(','));
    }
    if (filters.textSearch.caseSensitive) {
      params.set('case_sensitive', 'true');
    }
    if (filters.textSearch.exactMatch) {
      params.set('exact_match', 'true');
    }
    if (filters.textSearch.operator) {
      params.set('search_operator', filters.textSearch.operator);
    }
  }

  // Date ranges
  if (filters.dateRanges) {
    Object.entries(filters.dateRanges).forEach(([key, dateRange]) => {
      if (dateRange.startDate) {
        params.set(`${key}_from`, formatDateForUrl(dateRange.startDate));
      }
      if (dateRange.endDate) {
        params.set(`${key}_to`, formatDateForUrl(dateRange.endDate));
      }
    });
  }

  // Status filter
  if (filters.status?.statuses.length) {
    params.set('status', filters.status.statuses.join(','));
    if (filters.status.exclude) {
      params.set('status_exclude', 'true');
    }
  }

  // Category filter
  if (filters.category?.categories.length) {
    params.set('category', filters.category.categories.join(','));
    if (filters.category.exclude) {
      params.set('category_exclude', 'true');
    }
  }

  // Client filter
  if (filters.client?.clientIds.length) {
    params.set('client_id', filters.client.clientIds.join(','));
    if (filters.client.exclude) {
      params.set('client_exclude', 'true');
    }
  }

  // User filters
  if (filters.users) {
    Object.entries(filters.users).forEach(([key, userFilter]) => {
      if (userFilter.userIds.length > 0) {
        params.set(key, userFilter.userIds.join(','));
        if (userFilter.exclude) {
          params.set(`${key}_exclude`, 'true');
        }
      }
    });
  }

  // Priority filter
  if (filters.priority?.priorities.length) {
    params.set('priority', filters.priority.priorities.join(','));
    if (filters.priority.exclude) {
      params.set('priority_exclude', 'true');
    }
  }

  // Numeric ranges
  if (filters.numericRanges) {
    Object.entries(filters.numericRanges).forEach(([key, range]) => {
      if (range.min !== undefined) {
        params.set(`${key}_min`, range.min.toString());
      }
      if (range.max !== undefined) {
        params.set(`${key}_max`, range.max.toString());
      }
    });
  }

  // Sorting
  if (filters.sort?.length) {
    params.set('sort_by', filters.sort.map(s => s.field).join(','));
    params.set('sort_order', filters.sort.map(s => s.direction).join(','));
  }

  // Pagination
  if (filters.pagination) {
    if (filters.pagination.page > 1) {
      params.set('page', filters.pagination.page.toString());
    }
    if (filters.pagination.limit !== 20) { // Assuming 20 is default
      params.set('limit', filters.pagination.limit.toString());
    }
    if (filters.pagination.offset) {
      params.set('offset', filters.pagination.offset.toString());
    }
  }

  // Custom filters (encoded as JSON)
  if (filters.customFilters && Object.keys(filters.customFilters).length > 0) {
    params.set('custom_filters', JSON.stringify(filters.customFilters));
  }

  // Filter groups (encoded as JSON)
  if (filters.filterGroups?.length) {
    params.set('filter_groups', JSON.stringify(filters.filterGroups));
  }

  return params;
}

/**
 * Decodes URL parameters back to filter state
 * @param searchParams - URLSearchParams or URL search string
 * @returns Decoded filter state
 */
export function decodeFiltersFromUrl(searchParams: URLSearchParams | string): FilterState {
  const params = typeof searchParams === 'string' 
    ? new URLSearchParams(searchParams) 
    : searchParams;

  const filters: FilterState = {};

  // Text search
  const query = params.get('q');
  if (query) {
    filters.textSearch = {
      query,
      fields: params.get('search_fields')?.split(',') || [],
      caseSensitive: params.get('case_sensitive') === 'true',
      exactMatch: params.get('exact_match') === 'true',
      operator: (params.get('search_operator') as 'AND' | 'OR') || 'AND'
    };
  }

  // Date ranges
  const dateRanges: Record<string, DateRangeFilter> = {};
  for (const [key, value] of params.entries()) {
    if (key.endsWith('_from')) {
      const field = key.replace('_from', '');
      if (!dateRanges[field]) {
        dateRanges[field] = { field };
      }
      dateRanges[field].startDate = parseDateFromUrl(value);
    } else if (key.endsWith('_to')) {
      const field = key.replace('_to', '');
      if (!dateRanges[field]) {
        dateRanges[field] = { field };
      }
      dateRanges[field].endDate = parseDateFromUrl(value);
    }
  }
  if (Object.keys(dateRanges).length > 0) {
    filters.dateRanges = dateRanges;
  }

  // Status filter
  const status = params.get('status');
  if (status) {
    filters.status = {
      statuses: status.split(','),
      field: 'Status', // Default field name
      exclude: params.get('status_exclude') === 'true'
    };
  }

  // Category filter
  const category = params.get('category');
  if (category) {
    filters.category = {
      categories: category.split(','),
      field: 'Category', // Default field name
      exclude: params.get('category_exclude') === 'true'
    };
  }

  // Client filter
  const clientId = params.get('client_id');
  if (clientId) {
    filters.client = {
      clientIds: clientId.split(','),
      exclude: params.get('client_exclude') === 'true'
    };
  }

  // Priority filter
  const priority = params.get('priority');
  if (priority) {
    filters.priority = {
      priorities: priority.split(','),
      exclude: params.get('priority_exclude') === 'true'
    };
  }

  // User filters
  const users: Record<string, UserFilter> = {};
  const userFields = ['assigned_to', 'writer', 'editor', 'seo_specialist'];
  userFields.forEach(field => {
    const userIds = params.get(field);
    if (userIds) {
      users[field] = {
        userIds: userIds.split(','),
        field: field,
        exclude: params.get(`${field}_exclude`) === 'true'
      };
    }
  });
  if (Object.keys(users).length > 0) {
    filters.users = users;
  }

  // Numeric ranges
  const numericRanges: Record<string, NumericRangeFilter> = {};
  for (const [key, value] of params.entries()) {
    if (key.endsWith('_min')) {
      const field = key.replace('_min', '');
      if (!numericRanges[field]) {
        numericRanges[field] = { field };
      }
      numericRanges[field].min = parseFloat(value);
    } else if (key.endsWith('_max')) {
      const field = key.replace('_max', '');
      if (!numericRanges[field]) {
        numericRanges[field] = { field };
      }
      numericRanges[field].max = parseFloat(value);
    }
  }
  if (Object.keys(numericRanges).length > 0) {
    filters.numericRanges = numericRanges;
  }

  // Sorting
  const sortBy = params.get('sort_by');
  const sortOrder = params.get('sort_order');
  if (sortBy) {
    const fields = sortBy.split(',');
    const directions = sortOrder?.split(',') || [];
    filters.sort = fields.map((field, index) => ({
      field,
      direction: (directions[index] as 'asc' | 'desc') || 'asc'
    }));
  }

  // Pagination
  const page = params.get('page');
  const limit = params.get('limit');
  const offset = params.get('offset');
  if (page || limit || offset) {
    filters.pagination = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      ...(offset && { offset: parseInt(offset, 10) })
    };
  }

  // Custom filters
  const customFilters = params.get('custom_filters');
  if (customFilters) {
    try {
      filters.customFilters = JSON.parse(customFilters);
    } catch (error) {
      console.warn('Failed to parse custom filters from URL:', error);
    }
  }

  // Filter groups
  const filterGroups = params.get('filter_groups');
  if (filterGroups) {
    try {
      filters.filterGroups = JSON.parse(filterGroups);
    } catch (error) {
      console.warn('Failed to parse filter groups from URL:', error);
    }
  }

  return filters;
}

/**
 * Converts filter state to API parameters
 * @param filters - The filter state to convert
 * @returns API filter parameters
 */
export function convertFiltersToApiParams(filters: FilterState): ApiFilterParams {
  const params: ApiFilterParams = {};

  // Text search
  if (filters.textSearch?.query) {
    params.q = filters.textSearch.query;
    if (filters.textSearch.fields.length > 0) {
      params.search_fields = filters.textSearch.fields.join(',');
    }
  }

  // Status filter
  if (filters.status?.statuses.length) {
    params.status = filters.status.statuses.join(',');
  }

  // Category filter
  if (filters.category?.categories.length) {
    params.category = filters.category.categories.join(',');
  }

  // Client filter
  if (filters.client?.clientIds.length) {
    params.client_id = filters.client.clientIds.join(',');
  }

  // User filters (use first user filter for assigned_to)
  if (filters.users) {
    const assignedToFilter = filters.users.assigned_to || filters.users.assignee;
    if (assignedToFilter?.userIds.length) {
      params.assigned_to = assignedToFilter.userIds.join(',');
    }
  }

  // Priority filter
  if (filters.priority?.priorities.length) {
    params.priority = filters.priority.priorities.join(',');
  }

  // Date ranges (use first date range)
  if (filters.dateRanges) {
    const firstDateRange = Object.values(filters.dateRanges)[0];
    if (firstDateRange) {
      if (firstDateRange.startDate) {
        params.date_from = formatDateForUrl(firstDateRange.startDate);
      }
      if (firstDateRange.endDate) {
        params.date_to = formatDateForUrl(firstDateRange.endDate);
      }
      params.date_field = firstDateRange.field;
    }
  }

  // Numeric ranges (use first numeric range)
  if (filters.numericRanges) {
    const firstNumericRange = Object.values(filters.numericRanges)[0];
    if (firstNumericRange) {
      if (firstNumericRange.min !== undefined) {
        params.min_value = firstNumericRange.min;
      }
      if (firstNumericRange.max !== undefined) {
        params.max_value = firstNumericRange.max;
      }
      params.numeric_field = firstNumericRange.field;
    }
  }

  // Sorting (use first sort config)
  if (filters.sort?.length) {
    params.sort_by = filters.sort[0].field;
    params.sort_order = filters.sort[0].direction;
  }

  // Pagination
  if (filters.pagination) {
    params.page = filters.pagination.page;
    params.limit = filters.pagination.limit;
    if (filters.pagination.offset) {
      params.offset = filters.pagination.offset;
    }
  }

  // Complex filters as JSON
  if (filters.filterGroups?.length || filters.customFilters) {
    const complexFilters = {
      ...(filters.customFilters && { custom: filters.customFilters }),
      ...(filters.filterGroups && { groups: filters.filterGroups })
    };
    params.filters = JSON.stringify(complexFilters);
  }

  return params;
}

// ============================================================================
// FILTER MANIPULATION UTILITIES
// ============================================================================

/**
 * Merges two filter states, with the second taking precedence
 * @param baseFilters - Base filter state
 * @param newFilters - New filter state to merge
 * @returns Merged filter state
 */
export function mergeFilterStates(baseFilters: FilterState, newFilters: Partial<FilterState>): FilterState {
  return {
    ...baseFilters,
    ...newFilters,
    dateRanges: {
      ...baseFilters.dateRanges,
      ...newFilters.dateRanges
    },
    users: {
      ...baseFilters.users,
      ...newFilters.users
    },
    numericRanges: {
      ...baseFilters.numericRanges,
      ...newFilters.numericRanges
    },
    customFilters: {
      ...baseFilters.customFilters,
      ...newFilters.customFilters
    },
    sort: newFilters.sort || baseFilters.sort,
    pagination: newFilters.pagination || baseFilters.pagination,
    lastUpdated: new Date()
  };
}

/**
 * Clears all filters and returns empty filter state
 * @param keepPagination - Whether to preserve pagination settings
 * @returns Empty filter state
 */
export function clearAllFilters(keepPagination = false): FilterState {
  const filters: FilterState = {
    lastUpdated: new Date(),
    activeFiltersCount: 0
  };

  if (keepPagination) {
    // Keep pagination but reset to page 1
    filters.pagination = { page: 1, limit: 20 };
  }

  return filters;
}

/**
 * Counts the number of active filters
 * @param filters - Filter state to count
 * @returns Number of active filters
 */
export function countActiveFilters(filters: FilterState): number {
  let count = 0;

  if (filters.textSearch?.query) count++;
  if (filters.status?.statuses.length) count++;
  if (filters.category?.categories.length) count++;
  if (filters.client?.clientIds.length) count++;
  if (filters.priority?.priorities.length) count++;
  
  if (filters.dateRanges) {
    count += Object.keys(filters.dateRanges).length;
  }
  
  if (filters.users) {
    count += Object.keys(filters.users).length;
  }
  
  if (filters.numericRanges) {
    count += Object.keys(filters.numericRanges).length;
  }
  
  if (filters.customFilters) {
    count += Object.keys(filters.customFilters).length;
  }
  
  if (filters.filterGroups?.length) {
    count += filters.filterGroups.length;
  }

  return count;
}

/**
 * Checks if any filters are active
 * @param filters - Filter state to check
 * @returns True if any filters are active
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return countActiveFilters(filters) > 0;
}

/**
 * Creates a human-readable description of active filters
 * @param filters - Filter state to describe
 * @returns Array of filter descriptions
 */
export function getFilterDescriptions(filters: FilterState): string[] {
  const descriptions: string[] = [];

  if (filters.textSearch?.query) {
    descriptions.push(`Search: "${filters.textSearch.query}"`);
  }

  if (filters.status?.statuses.length) {
    const prefix = filters.status.exclude ? 'Exclude status' : 'Status';
    descriptions.push(`${prefix}: ${filters.status.statuses.join(', ')}`);
  }

  if (filters.category?.categories.length) {
    const prefix = filters.category.exclude ? 'Exclude category' : 'Category';
    descriptions.push(`${prefix}: ${filters.category.categories.join(', ')}`);
  }

  if (filters.client?.clientIds.length) {
    const prefix = filters.client.exclude ? 'Exclude client' : 'Client';
    descriptions.push(`${prefix}: ${filters.client.clientIds.length} selected`);
  }

  if (filters.priority?.priorities.length) {
    const prefix = filters.priority.exclude ? 'Exclude priority' : 'Priority';
    descriptions.push(`${prefix}: ${filters.priority.priorities.join(', ')}`);
  }

  if (filters.dateRanges) {
    Object.entries(filters.dateRanges).forEach(([field, range]) => {
      if (range.startDate && range.endDate) {
        descriptions.push(`${field}: ${formatDateForDisplay(range.startDate)} - ${formatDateForDisplay(range.endDate)}`);
      } else if (range.startDate) {
        descriptions.push(`${field}: After ${formatDateForDisplay(range.startDate)}`);
      } else if (range.endDate) {
        descriptions.push(`${field}: Before ${formatDateForDisplay(range.endDate)}`);
      }
    });
  }

  if (filters.users) {
    Object.entries(filters.users).forEach(([field, userFilter]) => {
      if (userFilter.userIds.length) {
        const prefix = userFilter.exclude ? `Exclude ${field}` : field;
        descriptions.push(`${prefix}: ${userFilter.userIds.length} selected`);
      }
    });
  }

  if (filters.numericRanges) {
    Object.entries(filters.numericRanges).forEach(([field, range]) => {
      if (range.min !== undefined && range.max !== undefined) {
        descriptions.push(`${field}: ${range.min} - ${range.max}`);
      } else if (range.min !== undefined) {
        descriptions.push(`${field}: ≥ ${range.min}`);
      } else if (range.max !== undefined) {
        descriptions.push(`${field}: ≤ ${range.max}`);
      }
    });
  }

  return descriptions;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats a date for URL encoding
 * @param date - Date to format
 * @returns ISO date string
 */
function formatDateForUrl(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

/**
 * Parses a date from URL parameter
 * @param dateString - Date string from URL
 * @returns Date object
 */
function parseDateFromUrl(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Formats a date for display
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatDateForDisplay(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  }
  return date.toLocaleDateString();
}

/**
 * Sanitizes a string for URL encoding
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeForUrl(str: string): string {
  return encodeURIComponent(str.trim());
}

/**
 * Deserializes a string from URL decoding
 * @param str - String to deserialize
 * @returns Deserialized string
 */
export function deserializeFromUrl(str: string): string {
  return decodeURIComponent(str);
}