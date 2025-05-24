/**
 * URL state management utilities for encoding/decoding filter state to/from URL searchParams
 * Provides SEO-friendly URL parameter handling with support for complex filter combinations
 */

import { FilterState } from '@/types/filters';
import { 
  encodeFiltersToUrl, 
  decodeFiltersFromUrl, 
  sanitizeForUrl, 
  deserializeFromUrl 
} from '@/lib/filters/filter-utils';

// ============================================================================
// URL STATE MANAGEMENT INTERFACES
// ============================================================================

/**
 * URL state configuration options
 */
export interface UrlStateConfig {
  // URL encoding options
  useCompression?: boolean;
  maxUrlLength?: number;
  encodeSpecialChars?: boolean;
  
  // Parameter naming
  paramPrefix?: string;
  shortParamNames?: boolean;
  
  // State persistence
  persistInHistory?: boolean;
  replaceState?: boolean;
  
  // SEO options
  seoFriendly?: boolean;
  excludeFromSeo?: string[];
  
  // Validation
  validateOnDecode?: boolean;
  fallbackOnError?: boolean;
}

/**
 * URL state change event
 */
export interface UrlStateChangeEvent {
  filters: FilterState;
  url: string;
  source: 'user' | 'programmatic' | 'browser';
  timestamp: Date;
}

/**
 * URL state manager class for handling filter state in URLs
 */
export class UrlStateManager {
  private config: Required<UrlStateConfig>;
  private listeners: Array<(event: UrlStateChangeEvent) => void> = [];
  private currentFilters: FilterState = {};
  private isUpdating = false;

  constructor(config: UrlStateConfig = {}) {
    this.config = {
      useCompression: false,
      maxUrlLength: 2000,
      encodeSpecialChars: true,
      paramPrefix: '',
      shortParamNames: false,
      persistInHistory: true,
      replaceState: false,
      seoFriendly: true,
      excludeFromSeo: ['page', 'limit'],
      validateOnDecode: true,
      fallbackOnError: true,
      ...config
    };

    // Listen for browser navigation events
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.handlePopState.bind(this));
    }
  }

  /**
   * Encodes filter state to URL and updates browser history
   * @param filters - Filter state to encode
   * @param options - Encoding options
   */
  public updateUrl(filters: FilterState, options: { replace?: boolean; silent?: boolean } = {}): void {
    if (this.isUpdating) return;

    try {
      this.isUpdating = true;
      const url = this.encodeFiltersToUrl(filters);
      
      if (typeof window !== 'undefined' && window.history) {
        const method = options.replace || this.config.replaceState ? 'replaceState' : 'pushState';
        window.history[method](null, '', url);
      }

      this.currentFilters = { ...filters };

      if (!options.silent) {
        this.notifyListeners({
          filters,
          url,
          source: 'programmatic',
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.warn('Failed to update URL with filters:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Decodes filter state from current URL
   * @returns Decoded filter state
   */
  public getFiltersFromUrl(): FilterState {
    if (typeof window === 'undefined') return {};

    try {
      const searchParams = new URLSearchParams(window.location.search);
      return this.decodeFiltersFromUrl(searchParams);
    } catch (error) {
      console.warn('Failed to decode filters from URL:', error);
      return this.config.fallbackOnError ? {} : this.currentFilters;
    }
  }

  /**
   * Encodes filter state to URL string
   * @param filters - Filter state to encode
   * @param baseUrl - Base URL (defaults to current pathname)
   * @returns Complete URL with encoded filters
   */
  public encodeFiltersToUrl(filters: FilterState, baseUrl?: string): string {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.pathname : '');
    const params = this.buildUrlParams(filters);
    
    const url = params.toString() ? `${base}?${params.toString()}` : base;
    
    // Check URL length limit
    if (url.length > this.config.maxUrlLength) {
      console.warn(`URL length (${url.length}) exceeds maximum (${this.config.maxUrlLength})`);
      return this.createCompressedUrl(filters, base);
    }
    
    return url;
  }

  /**
   * Decodes filter state from URL parameters
   * @param searchParams - URL search parameters
   * @returns Decoded filter state
   */
  public decodeFiltersFromUrl(searchParams: URLSearchParams | string): FilterState {
    try {
      const params = typeof searchParams === 'string' 
        ? new URLSearchParams(searchParams) 
        : searchParams;

      // Check for compressed state
      const compressed = params.get(this.getParamName('state'));
      if (compressed) {
        return this.decompressFilters(compressed);
      }

      // Decode regular parameters
      const mappedParams = this.mapParamsToStandard(params);
      return decodeFiltersFromUrl(mappedParams);
    } catch (error) {
      console.warn('Failed to decode filters from URL parameters:', error);
      return this.config.fallbackOnError ? {} : {};
    }
  }

  /**
   * Adds a listener for URL state changes
   * @param listener - Function to call when URL state changes
   * @returns Unsubscribe function
   */
  public subscribe(listener: (event: UrlStateChangeEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Clears all filters from URL
   * @param options - Clear options
   */
  public clearUrl(options: { replace?: boolean; keepPath?: boolean } = {}): void {
    this.updateUrl({}, { replace: options.replace });
  }

  /**
   * Creates SEO-friendly URL parameters
   * @param filters - Filter state
   * @returns SEO-optimized parameters
   */
  public createSeoUrl(filters: FilterState): string {
    const seoFilters = { ...filters };
    
    // Remove parameters excluded from SEO
    this.config.excludeFromSeo.forEach(param => {
      if (param === 'page' && seoFilters.pagination) {
        seoFilters.pagination = { ...seoFilters.pagination };
        delete (seoFilters.pagination as { page?: number }).page;
      }
      if (param === 'limit' && seoFilters.pagination) {
        seoFilters.pagination = { ...seoFilters.pagination };
        delete (seoFilters.pagination as { limit?: number }).limit;
      }
    });

    return this.encodeFiltersToUrl(seoFilters);
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private buildUrlParams(filters: FilterState): URLSearchParams {
    if (this.config.useCompression && this.shouldCompress(filters)) {
      const compressed = this.compressFilters(filters);
      const params = new URLSearchParams();
      params.set(this.getParamName('state'), compressed);
      return params;
    }

    const standardParams = encodeFiltersToUrl(filters);
    
    if (this.config.shortParamNames) {
      return this.mapParamsToShort(standardParams);
    }

    if (this.config.paramPrefix) {
      return this.addParamPrefix(standardParams);
    }

    return standardParams;
  }

  private mapParamsToShort(params: URLSearchParams): URLSearchParams {
    const shortParams = new URLSearchParams();
    const mapping: Record<string, string> = {
      'q': 'q',
      'status': 's',
      'category': 'c',
      'client_id': 'cl',
      'assigned_to': 'a',
      'priority': 'p',
      'date_from': 'df',
      'date_to': 'dt',
      'sort_by': 'sb',
      'sort_order': 'so',
      'page': 'pg',
      'limit': 'l'
    };

    for (const [key, value] of params.entries()) {
      const shortKey = mapping[key] || key;
      shortParams.set(shortKey, value);
    }

    return shortParams;
  }

  private mapParamsToStandard(params: URLSearchParams): URLSearchParams {
    if (!this.config.shortParamNames) return params;

    const standardParams = new URLSearchParams();
    const reverseMapping: Record<string, string> = {
      'q': 'q',
      's': 'status',
      'c': 'category',
      'cl': 'client_id',
      'a': 'assigned_to',
      'p': 'priority',
      'df': 'date_from',
      'dt': 'date_to',
      'sb': 'sort_by',
      'so': 'sort_order',
      'pg': 'page',
      'l': 'limit'
    };

    for (const [key, value] of params.entries()) {
      const standardKey = reverseMapping[key] || key;
      standardParams.set(standardKey, value);
    }

    return standardParams;
  }

  private addParamPrefix(params: URLSearchParams): URLSearchParams {
    const prefixedParams = new URLSearchParams();
    
    for (const [key, value] of params.entries()) {
      prefixedParams.set(`${this.config.paramPrefix}${key}`, value);
    }

    return prefixedParams;
  }

  private getParamName(name: string): string {
    const prefixed = this.config.paramPrefix ? `${this.config.paramPrefix}${name}` : name;
    return this.config.shortParamNames ? this.shortenParamName(prefixed) : prefixed;
  }

  private shortenParamName(name: string): string {
    const shortNames: Record<string, string> = {
      'state': 'st',
      'filters': 'f',
      'compressed': 'z'
    };
    return shortNames[name] || name;
  }

  private shouldCompress(filters: FilterState): boolean {
    const serialized = JSON.stringify(filters);
    return serialized.length > 500; // Compress if filters are large
  }

  private compressFilters(filters: FilterState): string {
    try {
      const serialized = JSON.stringify(filters);
      
      if (this.config.encodeSpecialChars) {
        return encodeURIComponent(btoa(serialized));
      }
      
      return btoa(serialized);
    } catch (error) {
      console.warn('Failed to compress filters:', error);
      return '';
    }
  }

  private decompressFilters(compressed: string): FilterState {
    try {
      const decoded = this.config.encodeSpecialChars 
        ? atob(decodeURIComponent(compressed))
        : atob(compressed);
      
      return JSON.parse(decoded);
    } catch (error) {
      console.warn('Failed to decompress filters:', error);
      return {};
    }
  }

  private createCompressedUrl(filters: FilterState, baseUrl: string): string {
    const compressed = this.compressFilters(filters);
    const params = new URLSearchParams();
    params.set(this.getParamName('state'), compressed);
    return `${baseUrl}?${params.toString()}`;
  }

  private handlePopState(): void {
    if (this.isUpdating) return;

    try {
      const filters = this.getFiltersFromUrl();
      this.currentFilters = filters;
      
      this.notifyListeners({
        filters,
        url: window.location.href,
        source: 'browser',
        timestamp: new Date()
      });
    } catch (error) {
      console.warn('Failed to handle popstate event:', error);
    }
  }

  private notifyListeners(event: UrlStateChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Error in URL state listener:', error);
      }
    });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a URL state manager instance with default configuration
 * @param config - Optional configuration
 * @returns URL state manager instance
 */
export function createUrlStateManager(config?: UrlStateConfig): UrlStateManager {
  return new UrlStateManager(config);
}

/**
 * Encodes filter state to URL-safe string
 * @param filters - Filter state to encode
 * @param options - Encoding options
 * @returns URL-safe encoded string
 */
export function encodeFilterState(
  filters: FilterState, 
  options: { compress?: boolean; seoFriendly?: boolean } = {}
): string {
  const manager = new UrlStateManager({
    useCompression: options.compress,
    seoFriendly: options.seoFriendly
  });
  
  return manager.encodeFiltersToUrl(filters);
}

/**
 * Decodes filter state from URL string
 * @param url - URL string to decode
 * @param options - Decoding options
 * @returns Decoded filter state
 */
export function decodeFilterState(
  url: string, 
  options: { validateOnDecode?: boolean; fallbackOnError?: boolean } = {}
): FilterState {
  const manager = new UrlStateManager({
    validateOnDecode: options.validateOnDecode,
    fallbackOnError: options.fallbackOnError
  });
  
  const urlObj = new URL(url, 'http://localhost'); // Provide base for relative URLs
  return manager.decodeFiltersFromUrl(urlObj.searchParams);
}

/**
 * Creates SEO-friendly URL from filter state
 * @param filters - Filter state
 * @param baseUrl - Base URL
 * @returns SEO-optimized URL
 */
export function createSeoFriendlyUrl(filters: FilterState, baseUrl: string): string {
  const manager = new UrlStateManager({ seoFriendly: true });
  return manager.encodeFiltersToUrl(filters, baseUrl);
}

/**
 * Extracts filter state from current browser URL
 * @returns Current filter state from URL
 */
export function getCurrentFiltersFromUrl(): FilterState {
  if (typeof window === 'undefined') return {};
  
  const manager = new UrlStateManager();
  return manager.getFiltersFromUrl();
}

/**
 * Updates browser URL with new filter state
 * @param filters - Filter state to encode in URL
 * @param options - Update options
 */
export function updateUrlWithFilters(
  filters: FilterState, 
  options: { replace?: boolean; silent?: boolean } = {}
): void {
  const manager = new UrlStateManager();
  manager.updateUrl(filters, options);
}

/**
 * Clears all filter parameters from URL
 * @param options - Clear options
 */
export function clearFiltersFromUrl(options: { replace?: boolean } = {}): void {
  const manager = new UrlStateManager();
  manager.clearUrl(options);
}

/**
 * Creates a shareable URL with current filter state
 * @param filters - Filter state to share
 * @param baseUrl - Base URL for sharing
 * @returns Shareable URL
 */
export function createShareableUrl(filters: FilterState, baseUrl?: string): string {
  const manager = new UrlStateManager({ 
    seoFriendly: true,
    useCompression: true 
  });
  
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
  return manager.encodeFiltersToUrl(filters, base);
}

/**
 * Validates URL parameters for filter state
 * @param searchParams - URL search parameters
 * @returns Validation result
 */
export function validateUrlParams(searchParams: URLSearchParams): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for malformed JSON in compressed state
  const compressed = searchParams.get('state') || searchParams.get('st');
  if (compressed) {
    try {
      const decoded = atob(decodeURIComponent(compressed));
      JSON.parse(decoded);
    } catch {
      errors.push('Invalid compressed filter state');
    }
  }

  // Check for reasonable parameter values
  const page = searchParams.get('page') || searchParams.get('pg');
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    errors.push('Invalid page number');
  }

  const limit = searchParams.get('limit') || searchParams.get('l');
  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 1000)) {
    errors.push('Invalid limit value');
  }

  // Check URL length
  const url = `?${searchParams.toString()}`;
  if (url.length > 2000) {
    warnings.push('URL length may cause issues in some browsers');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitizes URL parameters by removing invalid values
 * @param searchParams - URL search parameters to sanitize
 * @returns Sanitized search parameters
 */
export function sanitizeUrlParams(searchParams: URLSearchParams): URLSearchParams {
  const sanitized = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    // Skip empty values
    if (!value || value.trim() === '') continue;

    // Sanitize specific parameter types
    if (key === 'page' || key === 'pg') {
      const pageNum = parseInt(value, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        sanitized.set(key, pageNum.toString());
      }
    } else if (key === 'limit' || key === 'l') {
      const limitNum = parseInt(value, 10);
      if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 1000) {
        sanitized.set(key, limitNum.toString());
      }
    } else {
      // For other parameters, just ensure they're properly encoded
      sanitized.set(key, sanitizeForUrl(deserializeFromUrl(value)));
    }
  }

  return sanitized;
}