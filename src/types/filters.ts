/**
 * Comprehensive filter type definitions for server-side filtering system
 * Supports task-boards, deliverables, and other data filtering requirements
 */

import { z } from 'zod';

// ============================================================================
// CORE FILTER TYPES
// ============================================================================

/**
 * Base filter value types that can be used across different filter contexts
 */
export type FilterValue = string | number | boolean | Date | null | undefined;
export type FilterArray = FilterValue[];
export type FilterRange<T = FilterValue> = { min?: T; max?: T };

/**
 * Filter operator types for different comparison operations
 */
export type FilterOperator = 
  | 'equals' 
  | 'not_equals'
  | 'contains' 
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'in'
  | 'not_in'
  | 'between'
  | 'is_null'
  | 'is_not_null'
  | 'regex';

/**
 * Sort direction for ordering results
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration for a specific field
 */
export interface SortConfig {
  field: string;
  direction: SortDirection;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Base filter condition interface
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: FilterValue | FilterArray | FilterRange;
  caseSensitive?: boolean;
}

/**
 * Logical operators for combining filter conditions
 */
export type LogicalOperator = 'AND' | 'OR' | 'NOT';

/**
 * Complex filter group that can contain multiple conditions
 */
export interface FilterGroup {
  operator: LogicalOperator;
  conditions: (FilterCondition | FilterGroup)[];
}

// ============================================================================
// SPECIFIC FILTER INTERFACES
// ============================================================================

/**
 * Text search filter configuration
 */
export interface TextSearchFilter {
  query: string;
  fields: string[]; // Fields to search across
  caseSensitive?: boolean;
  exactMatch?: boolean;
  operator?: 'AND' | 'OR'; // How to combine multiple search terms
}

/**
 * Date range filter configuration
 */
export interface DateRangeFilter {
  startDate?: Date | string;
  endDate?: Date | string;
  field: string; // The date field to filter on
  includeTime?: boolean;
}

/**
 * Status filter configuration
 */
export interface StatusFilter {
  statuses: string[];
  field: string; // The status field to filter on
  exclude?: boolean; // Whether to exclude these statuses instead
}

/**
 * Category filter configuration
 */
export interface CategoryFilter {
  categories: string[];
  field: string; // The category field to filter on
  exclude?: boolean;
}

/**
 * Client filter configuration
 */
export interface ClientFilter {
  clientIds: string[];
  field?: string; // Default: 'Client' or 'Clients'
  exclude?: boolean;
}

/**
 * User/Assignment filter configuration
 */
export interface UserFilter {
  userIds: string[];
  field: string; // e.g., 'AssignedTo', 'Writer', 'Editor'
  exclude?: boolean;
}

/**
 * Priority filter configuration
 */
export interface PriorityFilter {
  priorities: string[];
  field?: string; // Default: 'Priority'
  exclude?: boolean;
}

/**
 * Numeric range filter configuration
 */
export interface NumericRangeFilter {
  min?: number;
  max?: number;
  field: string;
  inclusive?: boolean;
}

// ============================================================================
// COMPREHENSIVE FILTER STATE
// ============================================================================

/**
 * Complete filter state that can be applied to any data set
 */
export interface FilterState {
  // Text search
  textSearch?: TextSearchFilter;
  
  // Date filters
  dateRanges?: Record<string, DateRangeFilter>;
  
  // Selection filters
  status?: StatusFilter;
  category?: CategoryFilter;
  client?: ClientFilter;
  users?: Record<string, UserFilter>; // Multiple user fields (assignee, writer, etc.)
  priority?: PriorityFilter;
  
  // Numeric filters
  numericRanges?: Record<string, NumericRangeFilter>;
  
  // Custom field filters
  customFilters?: Record<string, FilterCondition>;
  
  // Complex filter groups
  filterGroups?: FilterGroup[];
  
  // Sorting
  sort?: SortConfig[];
  
  // Pagination
  pagination?: PaginationConfig;
  
  // Meta information
  activeFiltersCount?: number;
  lastUpdated?: Date;
}

/**
 * Filter options that define what filters are available
 */
export interface FilterOptions {
  // Available filter types
  enableTextSearch?: boolean;
  enableDateFilters?: boolean;
  enableStatusFilter?: boolean;
  enableCategoryFilter?: boolean;
  enableClientFilter?: boolean;
  enableUserFilters?: boolean;
  enablePriorityFilter?: boolean;
  enableCustomFilters?: boolean;
  
  // Field configurations
  searchableFields?: string[];
  dateFields?: string[];
  statusField?: string;
  categoryField?: string;
  clientField?: string;
  userFields?: Record<string, string>; // label -> field mapping
  priorityField?: string;
  
  // Available options for select filters
  availableStatuses?: string[];
  availableCategories?: string[];
  availableClients?: Array<{ id: string; name: string }>;
  availableUsers?: Array<{ id: string; name: string }>;
  availablePriorities?: string[];
  
  // Sorting options
  sortableFields?: Array<{ field: string; label: string }>;
  defaultSort?: SortConfig;
  
  // Pagination options
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  maxPageSize?: number;
  
  // UI options
  showFilterCount?: boolean;
  showClearAll?: boolean;
  collapsibleFilters?: boolean;
  persistFilters?: boolean; // Whether to save filters in URL/localStorage
}

/**
 * Filter validation configuration
 */
export interface FilterValidation {
  // Text search validation
  minSearchLength?: number;
  maxSearchLength?: number;
  
  // Date validation
  minDate?: Date;
  maxDate?: Date;
  
  // Numeric validation
  numericRanges?: Record<string, { min?: number; max?: number }>;
  
  // Selection validation
  maxSelections?: Record<string, number>;
  
  // Custom validation functions
  customValidators?: Record<string, (value: unknown) => boolean | string>;
}

// ============================================================================
// TASK-SPECIFIC FILTER INTERFACES
// ============================================================================

/**
 * Task board specific filter state
 */
export interface TaskBoardFilterState extends FilterState {
  taskType?: CategoryFilter; // Technical SEO, CRO, Strategy, Ad Hoc
  effort?: StatusFilter; // S, M, L effort levels
  impact?: NumericRangeFilter; // Impact level 1-5
  assignee?: UserFilter;
  dueDate?: DateRangeFilter;
  completedDate?: DateRangeFilter;
}

/**
 * Deliverables specific filter state
 */
export interface DeliverablesFilterState extends FilterState {
  deliverableType?: CategoryFilter; // briefs, articles, backlinks
  month?: StatusFilter; // Month filter
  writer?: UserFilter;
  editor?: UserFilter;
  seoSpecialist?: UserFilter;
  wordCountRange?: NumericRangeFilter;
  publicationStatus?: StatusFilter;
}

// ============================================================================
// API FILTER INTERFACES
// ============================================================================

/**
 * Filter parameters that get sent to API endpoints
 */
export interface ApiFilterParams {
  // Search
  q?: string; // Text search query
  search_fields?: string; // Comma-separated list of fields to search
  
  // Filters
  status?: string; // Comma-separated status values
  category?: string; // Comma-separated category values
  client_id?: string; // Comma-separated client IDs
  assigned_to?: string; // Comma-separated user IDs
  priority?: string; // Comma-separated priority values
  
  // Date filters
  date_from?: string; // ISO date string
  date_to?: string; // ISO date string
  date_field?: string; // Field name for date filtering
  
  // Numeric filters
  min_value?: number;
  max_value?: number;
  numeric_field?: string;
  
  // Sorting
  sort_by?: string; // Field name
  sort_order?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
  offset?: number;
  
  // Advanced filters (JSON encoded)
  filters?: string; // JSON string of complex filter conditions
}

/**
 * API response with filtered data
 */
export interface ApiFilterResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    applied: FilterState;
    available: FilterOptions;
  };
  meta: {
    executionTime: number;
    cacheHit?: boolean;
    totalUnfiltered?: number;
  };
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Zod schema for filter condition validation
 */
export const FilterConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum([
    'equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with',
    'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal',
    'in', 'not_in', 'between', 'is_null', 'is_not_null', 'regex'
  ]),
  value: z.unknown(),
  caseSensitive: z.boolean().optional()
});

/**
 * Zod schema for sort configuration validation
 */
export const SortConfigSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc'])
});

/**
 * Zod schema for pagination validation
 */
export const PaginationConfigSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(1000),
  offset: z.number().int().min(0).optional()
});

/**
 * Zod schema for text search validation
 */
export const TextSearchFilterSchema = z.object({
  query: z.string().min(1).max(500),
  fields: z.array(z.string()).min(1),
  caseSensitive: z.boolean().optional(),
  exactMatch: z.boolean().optional(),
  operator: z.enum(['AND', 'OR']).optional()
});

/**
 * Zod schema for date range validation
 */
export const DateRangeFilterSchema = z.object({
  startDate: z.union([z.date(), z.string()]).optional(),
  endDate: z.union([z.date(), z.string()]).optional(),
  field: z.string().min(1),
  includeTime: z.boolean().optional()
}).refine(data => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  }
  return true;
}, {
  message: "Start date must be before or equal to end date"
});

/**
 * Zod schema for API filter parameters validation
 */
export const ApiFilterParamsSchema = z.object({
  q: z.string().max(500).optional(),
  search_fields: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  client_id: z.string().optional(),
  assigned_to: z.string().optional(),
  priority: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  date_field: z.string().optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  numeric_field: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  offset: z.number().int().min(0).optional(),
  filters: z.string().optional()
});

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract filter state type for a specific entity
 */
export type EntityFilterState<T extends string> = 
  T extends 'tasks' ? TaskBoardFilterState :
  T extends 'deliverables' ? DeliverablesFilterState :
  FilterState;

/**
 * Filter state change handler type
 */
export type FilterStateChangeHandler = (newState: FilterState) => void;

/**
 * Filter validation result
 */
export interface FilterValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

/**
 * Filter preset configuration
 */
export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: FilterState;
  isDefault?: boolean;
  isPublic?: boolean;
  createdBy?: string;
  createdAt?: Date;
}

/**
 * Filter history entry for undo/redo functionality
 */
export interface FilterHistoryEntry {
  id: string;
  previousState: FilterState;
  newState: FilterState;
  action: string;
  timestamp: Date;
  description?: string;
}