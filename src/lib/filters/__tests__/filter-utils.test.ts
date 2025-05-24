/**
 * Unit tests for filter utilities
 * 
 * Tests core filtering functions including validation, sanitization,
 * URL encoding/decoding, and filter state management.
 */

import {
  validateFilterState,
  sanitizeFilterState,
  encodeFiltersToUrl,
  decodeFiltersFromUrl,
  buildApiParams,
  mergeFilterStates,
  clearAllFilters,
  countActiveFilters,
  hasActiveFilters
} from '../filter-utils';
import { FilterState, EntityFilterState } from '@/types/filters';

describe('Filter Utils', () => {
  describe('validateFilterState', () => {
    it('should validate a valid filter state', () => {
      const filters: FilterState = {
        search: 'test',
        status: ['active'],
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        pagination: {
          page: 1,
          limit: 20
        }
      };

      const validation = {
        search: { required: false, maxLength: 100 },
        status: { required: false, allowedValues: ['active', 'inactive'] },
        dateRange: { required: false },
        pagination: { required: true }
      };

      const result = validateFilterState(filters, validation);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should detect validation errors', () => {
      const filters: FilterState = {
        search: 'a'.repeat(101), // Too long
        status: ['invalid'], // Not allowed
        pagination: undefined // Required but missing
      };

      const validation = {
        search: { required: false, maxLength: 100 },
        status: { required: false, allowedValues: ['active', 'inactive'] },
        pagination: { required: true }
      };

      const result = validateFilterState(filters, validation);
      expect(result.isValid).toBe(false);
      expect(result.errors.search).toContain('exceeds maximum length');
      expect(result.errors.status).toContain('contains invalid values');
      expect(result.errors.pagination).toContain('is required');
    });

    it('should handle missing validation config', () => {
      const filters: FilterState = {
        search: 'test'
      };

      const result = validateFilterState(filters);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('sanitizeFilterState', () => {
    it('should remove empty and invalid values', () => {
      const filters: FilterState = {
        search: '',
        status: [],
        priority: ['high', ''],
        dateRange: {
          start: '',
          end: '2024-12-31'
        },
        pagination: {
          page: 1,
          limit: 20
        }
      };

      const sanitized = sanitizeFilterState(filters);
      
      expect(sanitized.search).toBeUndefined();
      expect(sanitized.status).toBeUndefined();
      expect(sanitized.priority).toEqual(['high']);
      expect(sanitized.dateRange?.start).toBeUndefined();
      expect(sanitized.dateRange?.end).toBe('2024-12-31');
      expect(sanitized.pagination).toEqual({ page: 1, limit: 20 });
    });

    it('should handle null and undefined values', () => {
      const filters: FilterState = {
        search: null as any,
        status: undefined,
        priority: ['high', null as any, 'low'],
        pagination: {
          page: 1,
          limit: 20
        }
      };

      const sanitized = sanitizeFilterState(filters);
      
      expect(sanitized.search).toBeUndefined();
      expect(sanitized.status).toBeUndefined();
      expect(sanitized.priority).toEqual(['high', 'low']);
    });
  });

  describe('URL encoding/decoding', () => {
    it('should encode filters to URL params', () => {
      const filters: FilterState = {
        search: 'test query',
        status: ['active', 'pending'],
        priority: ['high'],
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        pagination: {
          page: 2,
          limit: 50
        }
      };

      const urlParams = encodeFiltersToUrl(filters);
      
      expect(urlParams.get('search')).toBe('test query');
      expect(urlParams.get('status')).toBe('active,pending');
      expect(urlParams.get('priority')).toBe('high');
      expect(urlParams.get('dateStart')).toBe('2024-01-01');
      expect(urlParams.get('dateEnd')).toBe('2024-12-31');
      expect(urlParams.get('page')).toBe('2');
      expect(urlParams.get('limit')).toBe('50');
    });

    it('should decode filters from URL params', () => {
      const urlParams = new URLSearchParams({
        search: 'test query',
        status: 'active,pending',
        priority: 'high',
        dateStart: '2024-01-01',
        dateEnd: '2024-12-31',
        page: '2',
        limit: '50'
      });

      const filters = decodeFiltersFromUrl(urlParams);
      
      expect(filters.search).toBe('test query');
      expect(filters.status).toEqual(['active', 'pending']);
      expect(filters.priority).toEqual(['high']);
      expect(filters.dateRange?.start).toBe('2024-01-01');
      expect(filters.dateRange?.end).toBe('2024-12-31');
      expect(filters.pagination?.page).toBe(2);
      expect(filters.pagination?.limit).toBe(50);
    });

    it('should handle round-trip encoding/decoding', () => {
      const originalFilters: FilterState = {
        search: 'complex search with spaces & symbols',
        status: ['active', 'pending'],
        priority: ['high', 'medium'],
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        pagination: {
          page: 3,
          limit: 25
        }
      };

      const encoded = encodeFiltersToUrl(originalFilters);
      const decoded = decodeFiltersFromUrl(encoded);
      
      expect(decoded).toEqual(originalFilters);
    });
  });

  describe('buildApiParams', () => {
    it('should build API parameters from filters', () => {
      const filters: FilterState = {
        search: 'test',
        status: ['active', 'pending'],
        priority: ['high'],
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        pagination: {
          page: 2,
          limit: 50
        },
        sorting: {
          field: 'createdAt',
          direction: 'desc'
        }
      };

      const apiParams = buildApiParams(filters);
      
      expect(apiParams.search).toBe('test');
      expect(apiParams.status).toBe('active,pending');
      expect(apiParams.priority).toBe('high');
      expect(apiParams.dateStart).toBe('2024-01-01');
      expect(apiParams.dateEnd).toBe('2024-12-31');
      expect(apiParams.page).toBe(2);
      expect(apiParams.limit).toBe(50);
      expect(apiParams.sortBy).toBe('createdAt');
      expect(apiParams.sortOrder).toBe('desc');
    });

    it('should handle empty filters', () => {
      const filters: FilterState = {};
      const apiParams = buildApiParams(filters);
      
      expect(Object.keys(apiParams)).toHaveLength(0);
    });
  });

  describe('mergeFilterStates', () => {
    it('should merge filter states correctly', () => {
      const base: FilterState = {
        search: 'base search',
        status: ['active'],
        pagination: {
          page: 1,
          limit: 20
        }
      };

      const override: FilterState = {
        search: 'override search',
        priority: ['high'],
        pagination: {
          page: 2,
          limit: 20
        }
      };

      const merged = mergeFilterStates(base, override);
      
      expect(merged.search).toBe('override search');
      expect(merged.status).toEqual(['active']);
      expect(merged.priority).toEqual(['high']);
      expect(merged.pagination?.page).toBe(2);
      expect(merged.pagination?.limit).toBe(20);
    });

    it('should handle nested object merging', () => {
      const base: FilterState = {
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        pagination: {
          page: 1,
          limit: 20
        }
      };

      const override: FilterState = {
        dateRange: {
          start: '2024-06-01'
        },
        pagination: {
          page: 3
        }
      };

      const merged = mergeFilterStates(base, override);
      
      expect(merged.dateRange?.start).toBe('2024-06-01');
      expect(merged.dateRange?.end).toBe('2024-12-31');
      expect(merged.pagination?.page).toBe(3);
      expect(merged.pagination?.limit).toBe(20);
    });
  });

  describe('clearAllFilters', () => {
    it('should clear all filter values', () => {
      const cleared = clearAllFilters();
      
      expect(cleared.search).toBeUndefined();
      expect(cleared.status).toBeUndefined();
      expect(cleared.priority).toBeUndefined();
      expect(cleared.dateRange).toBeUndefined();
      expect(cleared.pagination?.page).toBe(1);
      expect(cleared.pagination?.limit).toBe(20);
    });
  });

  describe('countActiveFilters', () => {
    it('should count active filters correctly', () => {
      const filters: FilterState = {
        search: 'test',
        status: ['active'],
        priority: [],
        dateRange: {
          start: '2024-01-01',
          end: ''
        },
        pagination: {
          page: 1,
          limit: 20
        }
      };

      const count = countActiveFilters(filters);
      expect(count).toBe(3); // search, status, dateRange.start
    });

    it('should not count pagination as active filter', () => {
      const filters: FilterState = {
        pagination: {
          page: 5,
          limit: 50
        }
      };

      const count = countActiveFilters(filters);
      expect(count).toBe(0);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return true when filters are active', () => {
      const filters: FilterState = {
        search: 'test'
      };

      expect(hasActiveFilters(filters)).toBe(true);
    });

    it('should return false when no filters are active', () => {
      const filters: FilterState = {
        pagination: {
          page: 1,
          limit: 20
        }
      };

      expect(hasActiveFilters(filters)).toBe(false);
    });

    it('should return false for empty filters', () => {
      const filters: FilterState = {};
      expect(hasActiveFilters(filters)).toBe(false);
    });
  });
});