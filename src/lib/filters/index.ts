/**
 * Filter system exports - Complete server-side filtering system
 *
 * This module provides comprehensive filtering capabilities including:
 * - Type-safe filter definitions
 * - URL state management
 * - Query building for different backends
 * - Validation and sanitization
 * - Filter state management with history
 * - Caching for performance
 */

// Core filter types and interfaces
export * from '@/types/filters';

// Filter utilities
export * from './filter-utils';
export * from './filter-validation';
export * from './query-builder';
export * from './filter-state';

// URL state management
export * from '../url-state';

// Cache functionality
export * from '../cache';

// Re-export commonly used functions with shorter names for convenience
export {
  encodeFiltersToUrl as encodeFilters,
  decodeFiltersFromUrl as decodeFilters,
  mergeFilterStates as mergeFilters,
  clearAllFilters as clearFilters,
  countActiveFilters as countFilters,
  hasActiveFilters as hasFilters,
  getFilterDescriptions as describeFilters
} from './filter-utils';

export {
  validateFilterState as validateFilters,
  sanitizeFilterState as sanitizeFilters,
  createValidationConfig as createValidation
} from './filter-validation';

export {
  buildApiParams as buildApi,
  buildDatabaseQuery as buildQuery,
  buildAirtableFilter as buildAirtable,
  buildUrlWithFilters as buildUrl
} from './query-builder';

export {
  createUrlStateManager as createUrlManager,
  encodeFilterState as encodeState,
  decodeFilterState as decodeState,
  updateUrlWithFilters as updateUrl,
  clearFiltersFromUrl as clearUrl,
  getCurrentFiltersFromUrl as getCurrentFilters
} from '../url-state';

// Filter state management
export {
  createFilterStateManager,
  createEntityFilterStateManager,
  compareFilterStates,
  getFilterStateSummary,
  mergeFilterStates
} from './filter-state';

export type {
  FilterStateManager,
  FilterStateConfig
} from './filter-state';