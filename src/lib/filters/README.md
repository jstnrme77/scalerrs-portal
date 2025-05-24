# Server-Side Filtering System - Phase 1 Foundation

This directory contains the foundational components for the server-side filtering system, providing comprehensive type definitions, utilities, and core interfaces for filtering data across the application.

## Overview

Phase 1 implements the foundation layer with:

- **Comprehensive TypeScript interfaces** for all filter types
- **URL state management** utilities for SEO-friendly parameter handling
- **Query builders** for converting filters to API parameters and database queries
- **Validation schemas** using Zod for type safety
- **Filter utilities** for encoding, decoding, and manipulating filter state

## Architecture

```
src/lib/filters/
├── index.ts              # Main exports and convenience functions
├── filter-utils.ts       # URL encoding/decoding and filter manipulation
├── filter-validation.ts  # Validation schemas and functions
├── query-builder.ts      # API and database query builders
└── README.md            # This documentation

src/types/
└── filters.ts           # Comprehensive filter type definitions

src/lib/
└── url-state.ts         # URL state management utilities
```

## Core Components

### 1. Filter Type Definitions (`src/types/filters.ts`)

Comprehensive TypeScript interfaces supporting:

- **Text Search**: Multi-field search with case sensitivity options
- **Date Ranges**: Flexible date filtering with time inclusion
- **Status/Category Filters**: Multi-select with exclusion support
- **Client/User Filters**: Assignment and ownership filtering
- **Numeric Ranges**: Min/max filtering with inclusive/exclusive options
- **Custom Filters**: Advanced filter conditions with operators
- **Sorting & Pagination**: Complete ordering and pagination support

#### Key Interfaces

```typescript
// Main filter state interface
interface FilterState {
  textSearch?: TextSearchFilter;
  dateRanges?: Record<string, DateRangeFilter>;
  status?: StatusFilter;
  category?: CategoryFilter;
  client?: ClientFilter;
  users?: Record<string, UserFilter>;
  priority?: PriorityFilter;
  numericRanges?: Record<string, NumericRangeFilter>;
  customFilters?: Record<string, FilterCondition>;
  filterGroups?: FilterGroup[];
  sort?: SortConfig[];
  pagination?: PaginationConfig;
}

// Specialized filter states for different contexts
interface TaskBoardFilterState extends FilterState {
  taskType?: CategoryFilter;
  effort?: StatusFilter;
  impact?: NumericRangeFilter;
  assignee?: UserFilter;
  dueDate?: DateRangeFilter;
}

interface DeliverablesFilterState extends FilterState {
  deliverableType?: CategoryFilter;
  month?: StatusFilter;
  writer?: UserFilter;
  editor?: UserFilter;
  wordCountRange?: NumericRangeFilter;
}
```

### 2. Filter Utilities (`src/lib/filters/filter-utils.ts`)

Core utilities for filter manipulation:

#### URL Encoding/Decoding
```typescript
// Encode filters to URL parameters
const params = encodeFiltersToUrl(filterState);

// Decode filters from URL
const filters = decodeFiltersFromUrl(searchParams);

// Convert to API parameters
const apiParams = convertFiltersToApiParams(filterState);
```

#### Filter Manipulation
```typescript
// Merge filter states
const merged = mergeFilterStates(baseFilters, newFilters);

// Clear all filters
const empty = clearAllFilters(keepPagination);

// Count active filters
const count = countActiveFilters(filterState);

// Get human-readable descriptions
const descriptions = getFilterDescriptions(filterState);
```

### 3. Filter Validation (`src/lib/filters/filter-validation.ts`)

Zod-based validation with comprehensive schemas:

#### Validation Functions
```typescript
// Validate complete filter state
const result = validateFilterState(filters, validationConfig);

// Validate API parameters
const apiResult = validateApiFilterParams(apiParams);

// Sanitize filter state
const clean = sanitizeFilterState(filters);

// Create validation configurations
const strictConfig = createValidationConfig('strict');
```

#### Validation Schemas
- `FilterStateSchema`: Complete filter state validation
- `ApiFilterParamsSchema`: API parameter validation
- `TextSearchFilterSchema`: Text search validation
- `DateRangeFilterSchema`: Date range validation with logical constraints

### 4. Query Builders (`src/lib/filters/query-builder.ts`)

Convert filters to different query formats:

#### API Query Building
```typescript
// Build API parameters
const apiParams = buildApiParams(filters, options);

// Build complete URL with filters
const url = buildUrlWithFilters(filters, baseUrl);
```

#### Database Query Building
```typescript
// Build database query configuration
const dbQuery = buildDatabaseQuery(filters, tableConfig);

// Convert to SQL
const sql = buildSqlQuery(dbQuery, tableName);
```

#### Airtable Integration
```typescript
// Build Airtable filter formula
const airtableFilter = buildAirtableFilter(filters, fieldMappings);
```

### 5. URL State Management (`src/lib/url-state.ts`)

Advanced URL state management with SEO optimization:

#### URL State Manager
```typescript
// Create manager with configuration
const manager = createUrlStateManager({
  seoFriendly: true,
  useCompression: true,
  maxUrlLength: 2000
});

// Update URL with filters
manager.updateUrl(filterState);

// Get filters from current URL
const filters = manager.getFiltersFromUrl();

// Subscribe to URL changes
const unsubscribe = manager.subscribe(event => {
  console.log('Filters changed:', event.filters);
});
```

#### Utility Functions
```typescript
// Encode filter state to URL
const url = encodeFilterState(filters, { compress: true });

// Decode from URL string
const filters = decodeFilterState(urlString);

// Create SEO-friendly URL
const seoUrl = createSeoFriendlyUrl(filters, baseUrl);

// Update browser URL
updateUrlWithFilters(filters, { replace: true });
```

## Usage Examples

### Basic Filter Implementation

```typescript
import { 
  FilterState, 
  TaskBoardFilterState,
  encodeFilters,
  decodeFilters,
  validateFilters,
  buildApi,
  updateUrl
} from '@/lib/filters';

// Create filter state
const filters: TaskBoardFilterState = {
  textSearch: {
    query: 'SEO optimization',
    fields: ['task', 'description'],
    caseSensitive: false
  },
  status: {
    statuses: ['In Progress', 'Not Started'],
    field: 'Status'
  },
  assignee: {
    userIds: ['user123'],
    field: 'AssignedTo'
  },
  dueDate: {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    field: 'DueDate'
  },
  sort: [{
    field: 'Priority',
    direction: 'desc'
  }],
  pagination: {
    page: 1,
    limit: 20
  }
};

// Validate filters
const validation = validateFilters(filters);
if (!validation.isValid) {
  console.error('Invalid filters:', validation.errors);
}

// Convert to API parameters
const apiParams = buildApi(filters);

// Update URL
updateUrl(filters);

// Fetch data with filters
const response = await fetch(`/api/tasks?${new URLSearchParams(apiParams)}`);
```

### Advanced URL State Management

```typescript
import { UrlStateManager } from '@/lib/filters';

// Create manager with custom configuration
const urlManager = new UrlStateManager({
  seoFriendly: true,
  useCompression: true,
  shortParamNames: true,
  excludeFromSeo: ['page', 'limit']
});

// Subscribe to URL changes
urlManager.subscribe(event => {
  if (event.source === 'browser') {
    // Handle browser navigation
    applyFilters(event.filters);
  }
});

// Update URL when filters change
const handleFilterChange = (newFilters: FilterState) => {
  urlManager.updateUrl(newFilters);
  fetchData(newFilters);
};
```

## Integration with Existing Pages

### Task Boards Integration

The filter system is designed to integrate seamlessly with the existing task-boards page:

```typescript
// In task-boards/page.tsx
import { TaskBoardFilterState, buildApi } from '@/lib/filters';

const [filters, setFilters] = useState<TaskBoardFilterState>({});

// Apply filters to API calls
const fetchTasks = async () => {
  const apiParams = buildApi(filters);
  const response = await fetch(`/api/tasks?${new URLSearchParams(apiParams)}`);
  // Handle response...
};
```

### Deliverables Integration

For the deliverables page:

```typescript
// In deliverables/page.tsx
import { DeliverablesFilterState, buildAirtable } from '@/lib/filters';

const [filters, setFilters] = useState<DeliverablesFilterState>({});

// Convert to Airtable filters
const airtableFilter = buildAirtable(filters, {
  'Status': 'Keyword/Content Status',
  'Client': 'Clients',
  'Writer': 'Content Writer'
});
```

## Configuration Options

### Validation Configuration

```typescript
const validationConfig = {
  minSearchLength: 3,
  maxSearchLength: 100,
  maxSelections: {
    status: 5,
    category: 3,
    client: 10
  },
  customValidators: {
    priority: (value) => ['High', 'Medium', 'Low'].includes(value)
  }
};
```

### URL State Configuration

```typescript
const urlConfig = {
  useCompression: true,
  maxUrlLength: 2000,
  seoFriendly: true,
  shortParamNames: true,
  excludeFromSeo: ['page', 'limit'],
  persistInHistory: true
};
```

## Type Safety

The entire system is built with TypeScript-first design:

- **Comprehensive interfaces** for all filter types
- **Generic types** for entity-specific filtering
- **Zod schemas** for runtime validation
- **Type guards** for safe type checking
- **Utility types** for common patterns

## Performance Considerations

- **URL compression** for large filter states
- **Efficient encoding** with minimal URL parameters
- **Lazy validation** to avoid unnecessary processing
- **Memoization-friendly** immutable state updates
- **Optimized queries** with proper indexing hints

## Next Steps (Phase 2+)

This foundation enables:

1. **UI Components**: Filter panels, search bars, sort controls
2. **API Integration**: Server-side filtering implementation
3. **Caching**: Intelligent filter result caching
4. **Analytics**: Filter usage tracking and optimization
5. **Presets**: Saved filter configurations
6. **Real-time**: Live filter updates and collaboration

## Testing

The foundation includes comprehensive type checking and validation:

```typescript
// Example test structure
describe('Filter System', () => {
  test('encodes and decodes filters correctly', () => {
    const filters = createTestFilters();
    const encoded = encodeFilters(filters);
    const decoded = decodeFilters(encoded);
    expect(decoded).toEqual(filters);
  });

  test('validates filter state', () => {
    const invalidFilters = { /* invalid data */ };
    const result = validateFilters(invalidFilters);
    expect(result.isValid).toBe(false);
  });
});
```

This foundation provides a robust, type-safe, and extensible filtering system ready for integration with the existing application architecture.