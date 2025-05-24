/**
 * Comprehensive server-side filtering hook
 * 
 * This hook provides a complete solution for managing filter state, URL synchronization,
 * and API calls with debounced input handling, loading states, and error handling.
 * 
 * Features:
 * - Filter state management with URL synchronization
 * - Debounced filter input handling (configurable delay)
 * - Loading states and error handling
 * - Filter persistence across page refreshes and navigation
 * - Optimized re-renders only when filter values change
 * - Support for different entity types (tasks, deliverables, etc.)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ApiFilterResponse,
  EntityFilterState,
  FilterValidationResult,
  FilterValidation
} from '@/types/filters';
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
} from '@/lib/filters';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Configuration options for the useServerFilters hook
 */
export interface UseServerFiltersConfig<T extends string = string> {
  /** The entity type being filtered (e.g., 'tasks', 'deliverables') */
  entityType: T;
  
  /** API endpoint to fetch filtered data */
  apiEndpoint: string;
  
  /** Debounce delay for filter input changes in milliseconds */
  debounceDelay?: number;
  
  /** Whether to persist filters in URL */
  persistInUrl?: boolean;
  
  /** Whether to automatically fetch data on filter changes */
  autoFetch?: boolean;
  
  /** Default filter state */
  defaultFilters?: EntityFilterState<T>;
  
  /** Filter validation configuration */
  validation?: FilterValidation;
  
  /** Custom headers to include in API requests */
  headers?: Record<string, string>;
  
  /** Transform function for API response data */
  transformData?: (data: unknown[]) => unknown[];
  
  /** Error handler for API failures */
  onError?: (error: Error) => void;
  
  /** Success handler for successful API calls */
  onSuccess?: (data: unknown[], meta: Record<string, unknown>) => void;
}

/**
 * Return type for the useServerFilters hook
 */
export interface UseServerFiltersReturn<T extends string = string> {
  // Filter state
  filters: EntityFilterState<T>;
  setFilters: (filters: EntityFilterState<T>) => void;
  updateFilter: <K extends keyof EntityFilterState<T>>(
    key: K, 
    value: EntityFilterState<T>[K]
  ) => void;
  clearAllFilters: () => void;
  resetToDefaults: () => void;
  
  // Data and loading states
  data: unknown[];
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  
  // Pagination and meta information
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    executionTime: number;
    cacheHit?: boolean;
    totalUnfiltered?: number;
    activeFiltersCount: number;
    hasActiveFilters: boolean;
  };
  
  // Actions
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Validation
  validation: FilterValidationResult;
  isValid: boolean;
  
  // URL state
  updateUrl: () => void;
  clearUrl: () => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Comprehensive server-side filtering hook
 */
export function useServerFilters<T extends string = string>(
  config: UseServerFiltersConfig<T>
): UseServerFiltersReturn<T> {
  const {
    apiEndpoint,
    debounceDelay = 300,
    persistInUrl = true,
    autoFetch = true,
    defaultFilters = {} as EntityFilterState<T>,
    validation,
    headers = {},
    transformData,
    onError,
    onSuccess
  } = config;

  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Refs for debouncing and preventing unnecessary re-renders
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Initialize filters from URL or defaults
  const initialFilters = useMemo(() => {
    if (persistInUrl && searchParams) {
      try {
        const urlFilters = decodeFiltersFromUrl(searchParams);
        return mergeFilterStates(defaultFilters, urlFilters) as EntityFilterState<T>;
      } catch (error) {
        console.warn('Failed to decode filters from URL:', error);
      }
    }
    return defaultFilters;
  }, [searchParams, defaultFilters, persistInUrl]);

  const [filters, setFiltersState] = useState<EntityFilterState<T>>(initialFilters);
  const [data, setData] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [meta, setMeta] = useState({
    executionTime: 0,
    cacheHit: false,
    totalUnfiltered: 0,
    activeFiltersCount: 0,
    hasActiveFilters: false
  });

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validationResult = useMemo(() => {
    return validateFilterState(filters, validation);
  }, [filters, validation]);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  /**
   * Fetch data from the API with current filters
   */
  const fetchData = useCallback(async (
    filtersToUse: EntityFilterState<T> = filters,
    options: { signal?: AbortSignal } = {}
  ) => {
    try {
      setError(null);
      setIsValidating(true);

      // Build API parameters from filters
      const apiParams = buildApiParams(filtersToUse);
      
      // Create URL with query parameters
      const url = new URL(apiEndpoint, window.location.origin);
      Object.entries(apiParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });

      // Make API request
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: options.signal
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result: ApiFilterResponse = await response.json();
      
      // Transform data if transformer provided
      const processedData = transformData ? transformData(result.data) : result.data;
      
      // Update state
      setData(processedData);
      setPagination(result.pagination);
      setMeta({
        ...result.meta,
        cacheHit: result.meta.cacheHit ?? false,
        totalUnfiltered: result.meta.totalUnfiltered ?? 0,
        activeFiltersCount: countActiveFilters(filtersToUse),
        hasActiveFilters: hasActiveFilters(filtersToUse)
      });

      // Call success handler
      if (onSuccess) {
        onSuccess(processedData, result.meta);
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, don't update error state
        return;
      }
      
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      
      // Call error handler
      if (onError) {
        onError(error);
      }
    } finally {
      setIsValidating(false);
    }
  }, [apiEndpoint, headers, transformData, onError, onSuccess, filters]);

  /**
   * Debounced fetch function
   */
  const debouncedFetch = useCallback((filtersToUse: EntityFilterState<T>) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      fetchData(filtersToUse, { signal: abortControllerRef.current?.signal });
    }, debounceDelay);
  }, [fetchData, debounceDelay]);

  // ============================================================================
  // FILTER ACTIONS
  // ============================================================================

  /**
   * Update filters with validation and URL sync
   */
  const setFilters = useCallback((newFilters: EntityFilterState<T>) => {
    // Sanitize filters
    const sanitizedFilters = sanitizeFilterState(newFilters) as EntityFilterState<T>;
    
    // Update state
    setFiltersState(sanitizedFilters);
    
    // Update URL if persistence is enabled
    if (persistInUrl) {
      const encodedFilters = encodeFiltersToUrl(sanitizedFilters);
      const newUrl = new URL(window.location.href);
      newUrl.search = encodedFilters.toString();
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
    
    // Fetch data if auto-fetch is enabled
    if (autoFetch) {
      debouncedFetch(sanitizedFilters);
    }
  }, [persistInUrl, autoFetch, router, debouncedFetch]);

  /**
   * Update a specific filter property
   */
  const updateFilter = useCallback(<K extends keyof EntityFilterState<T>>(
    key: K,
    value: EntityFilterState<T>[K]
  ) => {
    setFilters({
      ...filters,
      [key]: value
    });
  }, [filters, setFilters]);

  /**
   * Clear all filters
   */
  const clearAllFiltersCallback = useCallback(() => {
    const clearedFilters = clearAllFilters() as EntityFilterState<T>;
    setFilters(clearedFilters);
  }, [setFilters]);

  /**
   * Reset filters to defaults
   */
  const resetToDefaults = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters, setFilters]);

  /**
   * Set page number
   */
  const setPage = useCallback((page: number) => {
    updateFilter('pagination' as keyof EntityFilterState<T>, {
      ...filters.pagination,
      page
    } as EntityFilterState<T>[keyof EntityFilterState<T>]);
  }, [updateFilter, filters.pagination]);

  /**
   * Set page size
   */
  const setPageSize = useCallback((limit: number) => {
    updateFilter('pagination' as keyof EntityFilterState<T>, {
      ...filters.pagination,
      limit,
      page: 1 // Reset to first page when changing page size
    } as EntityFilterState<T>[keyof EntityFilterState<T>]);
  }, [updateFilter, filters.pagination]);

  /**
   * Manual refetch
   */
  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchData();
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  /**
   * Update URL with current filters
   */
  const updateUrl = useCallback(() => {
    if (persistInUrl) {
      const encodedFilters = encodeFiltersToUrl(filters);
      const newUrl = new URL(window.location.href);
      newUrl.search = encodedFilters.toString();
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, [filters, persistInUrl, router]);

  /**
   * Clear filters from URL
   */
  const clearUrl = useCallback(() => {
    if (persistInUrl) {
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [persistInUrl, router]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initial data fetch
  useEffect(() => {
    if (autoFetch) {
      setIsLoading(true);
      fetchData().finally(() => setIsLoading(false));
    }
  }, []); // Only run on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ============================================================================
  // RETURN VALUE
  // ============================================================================

  return {
    // Filter state
    filters,
    setFilters,
    updateFilter,
    clearAllFilters: clearAllFiltersCallback,
    resetToDefaults,
    
    // Data and loading states
    data,
    isLoading,
    isValidating,
    error,
    
    // Pagination and meta
    pagination,
    meta,
    
    // Actions
    refetch,
    setPage,
    setPageSize,
    
    // Validation
    validation: validationResult,
    isValid: validationResult.isValid,
    
    // URL state
    updateUrl,
    clearUrl
  };
}

/**
 * Convenience hook for task board filtering
 */
export function useTaskBoardFilters(config: Omit<UseServerFiltersConfig<'tasks'>, 'entityType'>) {
  return useServerFilters({
    ...config,
    entityType: 'tasks' as const
  });
}

/**
 * Convenience hook for deliverables filtering
 */
export function useDeliverablesFilters(config: Omit<UseServerFiltersConfig<'deliverables'>, 'entityType'>) {
  return useServerFilters({
    ...config,
    entityType: 'deliverables' as const
  });
}