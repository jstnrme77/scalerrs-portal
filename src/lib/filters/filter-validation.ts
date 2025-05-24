/**
 * Filter validation utilities and schemas
 */

import { z } from 'zod';
import {
  FilterState,
  FilterValidation,
  FilterValidationResult,
  ApiFilterParams,
  FilterCondition,
  FilterConditionSchema,
  SortConfigSchema,
  PaginationConfigSchema,
  TextSearchFilterSchema,
  DateRangeFilterSchema,
  ApiFilterParamsSchema
} from '@/types/filters';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for status filter validation
 */
export const StatusFilterSchema = z.object({
  statuses: z.array(z.string().min(1)).min(1),
  field: z.string().min(1),
  exclude: z.boolean().optional()
});

/**
 * Schema for category filter validation
 */
export const CategoryFilterSchema = z.object({
  categories: z.array(z.string().min(1)).min(1),
  field: z.string().min(1),
  exclude: z.boolean().optional()
});

/**
 * Schema for client filter validation
 */
export const ClientFilterSchema = z.object({
  clientIds: z.array(z.string().min(1)).min(1),
  field: z.string().optional(),
  exclude: z.boolean().optional()
});

/**
 * Schema for user filter validation
 */
export const UserFilterSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1),
  field: z.string().min(1),
  exclude: z.boolean().optional()
});

/**
 * Schema for priority filter validation
 */
export const PriorityFilterSchema = z.object({
  priorities: z.array(z.string().min(1)).min(1),
  field: z.string().optional(),
  exclude: z.boolean().optional()
});

/**
 * Schema for numeric range filter validation
 */
export const NumericRangeFilterSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  field: z.string().min(1),
  inclusive: z.boolean().optional()
}).refine(data => {
  if (data.min !== undefined && data.max !== undefined) {
    return data.min <= data.max;
  }
  return true;
}, {
  message: "Minimum value must be less than or equal to maximum value"
});

/**
 * Schema for filter group validation
 */
export const FilterGroupSchema = z.lazy(() => z.object({
  operator: z.enum(['AND', 'OR', 'NOT']),
  conditions: z.array(z.any()) // Simplified to avoid circular type issues
}));

/**
 * Complete filter state validation schema
 */
export const FilterStateSchema = z.object({
  textSearch: TextSearchFilterSchema.optional(),
  dateRanges: z.record(z.string(), DateRangeFilterSchema).optional(),
  status: StatusFilterSchema.optional(),
  category: CategoryFilterSchema.optional(),
  client: ClientFilterSchema.optional(),
  users: z.record(z.string(), UserFilterSchema).optional(),
  priority: PriorityFilterSchema.optional(),
  numericRanges: z.record(z.string(), NumericRangeFilterSchema).optional(),
  customFilters: z.record(z.string(), FilterConditionSchema).optional(),
  filterGroups: z.array(FilterGroupSchema).optional(),
  sort: z.array(SortConfigSchema).optional(),
  pagination: PaginationConfigSchema.optional(),
  activeFiltersCount: z.number().int().min(0).optional(),
  lastUpdated: z.date().optional()
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates a complete filter state
 * @param filters - Filter state to validate
 * @param validation - Optional validation configuration
 * @returns Validation result
 */
export function validateFilterState(
  filters: FilterState, 
  validation?: FilterValidation
): FilterValidationResult {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};

  try {
    // Basic schema validation
    FilterStateSchema.parse(filters);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
    }
  }

  // Custom validation rules
  if (validation) {
    // Text search validation
    if (filters.textSearch && validation.minSearchLength) {
      if (filters.textSearch.query.length < validation.minSearchLength) {
        if (!errors.textSearch) errors.textSearch = [];
        errors.textSearch.push(`Search query must be at least ${validation.minSearchLength} characters`);
      }
    }

    if (filters.textSearch && validation.maxSearchLength) {
      if (filters.textSearch.query.length > validation.maxSearchLength) {
        if (!errors.textSearch) errors.textSearch = [];
        errors.textSearch.push(`Search query must be no more than ${validation.maxSearchLength} characters`);
      }
    }

    // Date validation
    if (filters.dateRanges && (validation.minDate || validation.maxDate)) {
      Object.entries(filters.dateRanges).forEach(([field, dateRange]) => {
        if (validation.minDate && dateRange.startDate) {
          const startDate = new Date(dateRange.startDate);
          if (startDate < validation.minDate) {
            if (!errors[`dateRanges.${field}`]) errors[`dateRanges.${field}`] = [];
            errors[`dateRanges.${field}`].push(`Start date cannot be before ${validation.minDate.toLocaleDateString()}`);
          }
        }

        if (validation.maxDate && dateRange.endDate) {
          const endDate = new Date(dateRange.endDate);
          if (endDate > validation.maxDate) {
            if (!errors[`dateRanges.${field}`]) errors[`dateRanges.${field}`] = [];
            errors[`dateRanges.${field}`].push(`End date cannot be after ${validation.maxDate.toLocaleDateString()}`);
          }
        }
      });
    }

    // Numeric range validation
    if (filters.numericRanges && validation.numericRanges) {
      Object.entries(filters.numericRanges).forEach(([field, range]) => {
        const fieldValidation = validation.numericRanges![field];
        if (fieldValidation) {
          if (fieldValidation.min !== undefined && range.min !== undefined && range.min < fieldValidation.min) {
            if (!errors[`numericRanges.${field}`]) errors[`numericRanges.${field}`] = [];
            errors[`numericRanges.${field}`].push(`Minimum value cannot be less than ${fieldValidation.min}`);
          }

          if (fieldValidation.max !== undefined && range.max !== undefined && range.max > fieldValidation.max) {
            if (!errors[`numericRanges.${field}`]) errors[`numericRanges.${field}`] = [];
            errors[`numericRanges.${field}`].push(`Maximum value cannot be greater than ${fieldValidation.max}`);
          }
        }
      });
    }

    // Selection count validation
    if (validation.maxSelections) {
      Object.entries(validation.maxSelections).forEach(([field, maxCount]) => {
        let actualCount = 0;

        if (field === 'status' && filters.status) {
          actualCount = filters.status.statuses.length;
        } else if (field === 'category' && filters.category) {
          actualCount = filters.category.categories.length;
        } else if (field === 'client' && filters.client) {
          actualCount = filters.client.clientIds.length;
        } else if (field === 'priority' && filters.priority) {
          actualCount = filters.priority.priorities.length;
        } else if (filters.users && filters.users[field]) {
          actualCount = filters.users[field].userIds.length;
        }

        if (actualCount > maxCount) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`Cannot select more than ${maxCount} items`);
        }
      });
    }

    // Custom validators
    if (validation.customValidators) {
      Object.entries(validation.customValidators).forEach(([field, validator]) => {
        const fieldValue = getFieldValue(filters, field);
        const result = validator(fieldValue);
        
        if (typeof result === 'string') {
          if (!errors[field]) errors[field] = [];
          errors[field].push(result);
        } else if (result === false) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`Invalid value for ${field}`);
        }
      });
    }
  }

  // Performance warnings
  if (filters.textSearch && filters.textSearch.query.length < 3) {
    if (!warnings.textSearch) warnings.textSearch = [];
    warnings.textSearch.push('Short search queries may return too many results');
  }

  if (filters.pagination && filters.pagination.limit > 100) {
    if (!warnings.pagination) warnings.pagination = [];
    warnings.pagination.push('Large page sizes may impact performance');
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: Object.keys(warnings).length > 0 ? warnings : undefined
  };
}

/**
 * Validates API filter parameters
 * @param params - API parameters to validate
 * @returns Validation result
 */
export function validateApiFilterParams(params: ApiFilterParams): FilterValidationResult {
  const errors: Record<string, string[]> = {};

  try {
    ApiFilterParamsSchema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
    }
  }

  // Additional API-specific validation
  if (params.page && params.page < 1) {
    if (!errors.page) errors.page = [];
    errors.page.push('Page number must be greater than 0');
  }

  if (params.limit && (params.limit < 1 || params.limit > 1000)) {
    if (!errors.limit) errors.limit = [];
    errors.limit.push('Limit must be between 1 and 1000');
  }

  if (params.offset && params.offset < 0) {
    if (!errors.offset) errors.offset = [];
    errors.offset.push('Offset must be greater than or equal to 0');
  }

  if (params.date_from && params.date_to) {
    const fromDate = new Date(params.date_from);
    const toDate = new Date(params.date_to);
    if (fromDate > toDate) {
      if (!errors.date_range) errors.date_range = [];
      errors.date_range.push('Start date must be before or equal to end date');
    }
  }

  if (params.min_value !== undefined && params.max_value !== undefined) {
    if (params.min_value > params.max_value) {
      if (!errors.numeric_range) errors.numeric_range = [];
      errors.numeric_range.push('Minimum value must be less than or equal to maximum value');
    }
  }

  // Validate JSON filters if present
  if (params.filters) {
    try {
      JSON.parse(params.filters);
    } catch {
      if (!errors.filters) errors.filters = [];
      errors.filters.push('Invalid JSON format for filters parameter');
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates individual filter conditions
 * @param condition - Filter condition to validate
 * @returns Validation result
 */
export function validateFilterCondition(condition: FilterCondition): FilterValidationResult {
  const errors: Record<string, string[]> = {};

  try {
    FilterConditionSchema.parse(condition);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
    }
  }

  // Operator-specific validation
  if (condition.operator === 'between' && Array.isArray(condition.value)) {
    if (condition.value.length !== 2) {
      if (!errors.value) errors.value = [];
      errors.value.push('Between operator requires exactly 2 values');
    }
  }

  if (['in', 'not_in'].includes(condition.operator) && !Array.isArray(condition.value)) {
    if (!errors.value) errors.value = [];
    errors.value.push(`${condition.operator} operator requires an array value`);
  }

  if (condition.operator === 'regex') {
    try {
      new RegExp(condition.value as string);
    } catch {
      if (!errors.value) errors.value = [];
      errors.value.push('Invalid regular expression');
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitizes filter state by removing invalid values
 * @param filters - Filter state to sanitize
 * @returns Sanitized filter state
 */
export function sanitizeFilterState(filters: FilterState): FilterState {
  const sanitized: FilterState = { ...filters };

  // Remove empty arrays and null/undefined values
  if (sanitized.status?.statuses) {
    sanitized.status.statuses = sanitized.status.statuses.filter(s => s && s.trim());
    if (sanitized.status.statuses.length === 0) {
      delete sanitized.status;
    }
  }

  if (sanitized.category?.categories) {
    sanitized.category.categories = sanitized.category.categories.filter(c => c && c.trim());
    if (sanitized.category.categories.length === 0) {
      delete sanitized.category;
    }
  }

  if (sanitized.client?.clientIds) {
    sanitized.client.clientIds = sanitized.client.clientIds.filter(id => id && id.trim());
    if (sanitized.client.clientIds.length === 0) {
      delete sanitized.client;
    }
  }

  if (sanitized.priority?.priorities) {
    sanitized.priority.priorities = sanitized.priority.priorities.filter(p => p && p.trim());
    if (sanitized.priority.priorities.length === 0) {
      delete sanitized.priority;
    }
  }

  // Clean up user filters
  if (sanitized.users) {
    Object.keys(sanitized.users).forEach(key => {
      const userFilter = sanitized.users![key];
      userFilter.userIds = userFilter.userIds.filter(id => id && id.trim());
      if (userFilter.userIds.length === 0) {
        delete sanitized.users![key];
      }
    });
    if (Object.keys(sanitized.users).length === 0) {
      delete sanitized.users;
    }
  }

  // Clean up date ranges
  if (sanitized.dateRanges) {
    Object.keys(sanitized.dateRanges).forEach(key => {
      const dateRange = sanitized.dateRanges![key];
      if (!dateRange.startDate && !dateRange.endDate) {
        delete sanitized.dateRanges![key];
      }
    });
    if (Object.keys(sanitized.dateRanges).length === 0) {
      delete sanitized.dateRanges;
    }
  }

  // Clean up numeric ranges
  if (sanitized.numericRanges) {
    Object.keys(sanitized.numericRanges).forEach(key => {
      const range = sanitized.numericRanges![key];
      if (range.min === undefined && range.max === undefined) {
        delete sanitized.numericRanges![key];
      }
    });
    if (Object.keys(sanitized.numericRanges).length === 0) {
      delete sanitized.numericRanges;
    }
  }

  // Clean up text search
  if (sanitized.textSearch?.query) {
    sanitized.textSearch.query = sanitized.textSearch.query.trim();
    if (!sanitized.textSearch.query) {
      delete sanitized.textSearch;
    }
  }

  // Remove empty sort array
  if (sanitized.sort?.length === 0) {
    delete sanitized.sort;
  }

  return sanitized;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets a field value from filter state using dot notation
 * @param filters - Filter state object
 * @param fieldPath - Dot-separated field path
 * @returns Field value
 */
function getFieldValue(filters: FilterState, fieldPath: string): unknown {
  const parts = fieldPath.split('.');
  let current: unknown = filters;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Creates a validation configuration for common use cases
 * @param type - Type of validation configuration
 * @returns Validation configuration
 */
export function createValidationConfig(type: 'strict' | 'lenient' | 'performance'): FilterValidation {
  switch (type) {
    case 'strict':
      return {
        minSearchLength: 3,
        maxSearchLength: 100,
        maxSelections: {
          status: 5,
          category: 3,
          client: 10,
          priority: 3
        }
      };

    case 'lenient':
      return {
        minSearchLength: 1,
        maxSearchLength: 500,
        maxSelections: {
          status: 20,
          category: 20,
          client: 50,
          priority: 10
        }
      };

    case 'performance':
      return {
        minSearchLength: 3,
        maxSearchLength: 50,
        maxSelections: {
          status: 3,
          category: 2,
          client: 5,
          priority: 2
        }
      };

    default:
      return {};
  }
}