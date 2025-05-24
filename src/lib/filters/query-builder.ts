/**
 * Query builder utilities for converting filters to API parameters and database queries
 */

import {
  FilterState,
  ApiFilterParams,
  FilterOperator,
  SortConfig
} from '@/types/filters';

// ============================================================================
// QUERY BUILDER INTERFACES
// ============================================================================

/**
 * Database query configuration
 */
export interface DatabaseQuery {
  where: WhereClause[];
  orderBy: OrderByClause[];
  limit?: number;
  offset?: number;
  select?: string[];
  joins?: JoinClause[];
}

/**
 * Where clause for database queries
 */
export interface WhereClause {
  field: string;
  operator: string;
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

/**
 * Order by clause for database queries
 */
export interface OrderByClause {
  field: string;
  direction: 'ASC' | 'DESC';
}

/**
 * Join clause for database queries
 */
export interface JoinClause {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  table: string;
  on: string;
  alias?: string;
}

/**
 * Airtable filter configuration
 */
export interface AirtableFilter {
  filterByFormula: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  maxRecords?: number;
  offset?: string;
  fields?: string[];
}

// ============================================================================
// API PARAMETER BUILDERS
// ============================================================================

/**
 * Converts filter state to API parameters with proper encoding
 * @param filters - Filter state to convert
 * @param options - Conversion options
 * @returns API filter parameters
 */
export function buildApiParams(
  filters: FilterState, 
  options: {
    includeEmpty?: boolean;
    encodeValues?: boolean;
    maxArrayLength?: number;
  } = {}
): ApiFilterParams {
  const params: ApiFilterParams = {};
  const { includeEmpty = false, encodeValues = true, maxArrayLength = 50 } = options;

  // Text search
  if (filters.textSearch?.query) {
    params.q = encodeValues ? encodeURIComponent(filters.textSearch.query) : filters.textSearch.query;
    if (filters.textSearch.fields.length > 0) {
      params.search_fields = filters.textSearch.fields.join(',');
    }
  }

  // Status filter
  if (filters.status?.statuses.length) {
    const statuses = filters.status.statuses.slice(0, maxArrayLength);
    params.status = encodeValues 
      ? statuses.map(s => encodeURIComponent(s)).join(',')
      : statuses.join(',');
  }

  // Category filter
  if (filters.category?.categories.length) {
    const categories = filters.category.categories.slice(0, maxArrayLength);
    params.category = encodeValues
      ? categories.map(c => encodeURIComponent(c)).join(',')
      : categories.join(',');
  }

  // Client filter
  if (filters.client?.clientIds.length) {
    const clientIds = filters.client.clientIds.slice(0, maxArrayLength);
    params.client_id = clientIds.join(',');
  }

  // User filters
  if (filters.users) {
    const assignedToFilter = filters.users.assigned_to || filters.users.assignee;
    if (assignedToFilter?.userIds.length) {
      const userIds = assignedToFilter.userIds.slice(0, maxArrayLength);
      params.assigned_to = userIds.join(',');
    }
  }

  // Priority filter
  if (filters.priority?.priorities.length) {
    const priorities = filters.priority.priorities.slice(0, maxArrayLength);
    params.priority = encodeValues
      ? priorities.map(p => encodeURIComponent(p)).join(',')
      : priorities.join(',');
  }

  // Date ranges
  if (filters.dateRanges) {
    const dateEntries = Object.entries(filters.dateRanges);
    if (dateEntries.length > 0) {
      const [field, range] = dateEntries[0]; // Use first date range
      if (range.startDate) {
        params.date_from = formatDateForApi(range.startDate);
      }
      if (range.endDate) {
        params.date_to = formatDateForApi(range.endDate);
      }
      params.date_field = field;
    }
  }

  // Numeric ranges
  if (filters.numericRanges) {
    const numericEntries = Object.entries(filters.numericRanges);
    if (numericEntries.length > 0) {
      const [field, range] = numericEntries[0]; // Use first numeric range
      if (range.min !== undefined) {
        params.min_value = range.min;
      }
      if (range.max !== undefined) {
        params.max_value = range.max;
      }
      params.numeric_field = field;
    }
  }

  // Sorting
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

  // Complex filters
  if (filters.customFilters || filters.filterGroups) {
    const complexFilters = {
      ...(filters.customFilters && { custom: filters.customFilters }),
      ...(filters.filterGroups && { groups: filters.filterGroups })
    };
    params.filters = JSON.stringify(complexFilters);
  }

  // Remove empty values if not including them
  if (!includeEmpty) {
    Object.keys(params).forEach(key => {
      const value = params[key as keyof ApiFilterParams];
      if (value === undefined || value === null || value === '') {
        delete params[key as keyof ApiFilterParams];
      }
    });
  }

  return params;
}

/**
 * Builds URL query string from filter state
 * @param filters - Filter state to convert
 * @param baseUrl - Base URL to append parameters to
 * @returns Complete URL with query parameters
 */
export function buildUrlWithFilters(filters: FilterState, baseUrl: string): string {
  const apiParams = buildApiParams(filters, { encodeValues: false });
  const searchParams = new URLSearchParams();

  Object.entries(apiParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// ============================================================================
// DATABASE QUERY BUILDERS
// ============================================================================

/**
 * Converts filter state to database query configuration
 * @param filters - Filter state to convert
 * @param tableConfig - Table configuration for field mapping
 * @returns Database query configuration
 */
export function buildDatabaseQuery(
  filters: FilterState,
  tableConfig: {
    tableName: string;
    fieldMappings?: Record<string, string>;
    defaultSort?: SortConfig;
    joins?: JoinClause[];
  }
): DatabaseQuery {
  const query: DatabaseQuery = {
    where: [],
    orderBy: [],
    joins: tableConfig.joins || []
  };

  const { fieldMappings = {} } = tableConfig;

  // Helper function to map field names
  const mapField = (field: string): string => fieldMappings[field] || field;

  // Text search
  if (filters.textSearch?.query) {
    const searchFields = filters.textSearch.fields.map(mapField);
    const searchConditions = searchFields.map(field => ({
      field,
      operator: 'ILIKE',
      value: `%${filters.textSearch!.query}%`,
      logicalOperator: 'OR' as const
    }));
    query.where.push(...searchConditions);
  }

  // Status filter
  if (filters.status?.statuses.length) {
    const field = mapField(filters.status.field);
    const operator = filters.status.exclude ? 'NOT IN' : 'IN';
    query.where.push({
      field,
      operator,
      value: filters.status.statuses,
      logicalOperator: 'AND'
    });
  }

  // Category filter
  if (filters.category?.categories.length) {
    const field = mapField(filters.category.field);
    const operator = filters.category.exclude ? 'NOT IN' : 'IN';
    query.where.push({
      field,
      operator,
      value: filters.category.categories,
      logicalOperator: 'AND'
    });
  }

  // Client filter
  if (filters.client?.clientIds.length) {
    const field = mapField(filters.client.field || 'client_id');
    const operator = filters.client.exclude ? 'NOT IN' : 'IN';
    query.where.push({
      field,
      operator,
      value: filters.client.clientIds,
      logicalOperator: 'AND'
    });
  }

  // User filters
  if (filters.users) {
    Object.entries(filters.users).forEach(([, userFilter]) => {
      const field = mapField(userFilter.field);
      const operator = userFilter.exclude ? 'NOT IN' : 'IN';
      query.where.push({
        field,
        operator,
        value: userFilter.userIds,
        logicalOperator: 'AND'
      });
    });
  }

  // Priority filter
  if (filters.priority?.priorities.length) {
    const field = mapField(filters.priority.field || 'priority');
    const operator = filters.priority.exclude ? 'NOT IN' : 'IN';
    query.where.push({
      field,
      operator,
      value: filters.priority.priorities,
      logicalOperator: 'AND'
    });
  }

  // Date ranges
  if (filters.dateRanges) {
    Object.entries(filters.dateRanges).forEach(([, range]) => {
      const field = mapField(range.field);
      if (range.startDate) {
        query.where.push({
          field,
          operator: '>=',
          value: formatDateForDatabase(range.startDate),
          logicalOperator: 'AND'
        });
      }
      if (range.endDate) {
        query.where.push({
          field,
          operator: '<=',
          value: formatDateForDatabase(range.endDate),
          logicalOperator: 'AND'
        });
      }
    });
  }

  // Numeric ranges
  if (filters.numericRanges) {
    Object.entries(filters.numericRanges).forEach(([, range]) => {
      const field = mapField(range.field);
      if (range.min !== undefined) {
        query.where.push({
          field,
          operator: range.inclusive ? '>=' : '>',
          value: range.min,
          logicalOperator: 'AND'
        });
      }
      if (range.max !== undefined) {
        query.where.push({
          field,
          operator: range.inclusive ? '<=' : '<',
          value: range.max,
          logicalOperator: 'AND'
        });
      }
    });
  }

  // Custom filters
  if (filters.customFilters) {
    Object.entries(filters.customFilters).forEach(([, condition]) => {
      query.where.push({
        field: mapField(condition.field),
        operator: mapOperatorToSql(condition.operator),
        value: condition.value,
        logicalOperator: 'AND'
      });
    });
  }

  // Sorting
  if (filters.sort?.length) {
    query.orderBy = filters.sort.map(sort => ({
      field: mapField(sort.field),
      direction: sort.direction.toUpperCase() as 'ASC' | 'DESC'
    }));
  } else if (tableConfig.defaultSort) {
    query.orderBy = [{
      field: mapField(tableConfig.defaultSort.field),
      direction: tableConfig.defaultSort.direction.toUpperCase() as 'ASC' | 'DESC'
    }];
  }

  // Pagination
  if (filters.pagination) {
    query.limit = filters.pagination.limit;
    query.offset = filters.pagination.offset || (filters.pagination.page - 1) * filters.pagination.limit;
  }

  return query;
}

/**
 * Converts database query to SQL string
 * @param query - Database query configuration
 * @param tableName - Name of the main table
 * @returns SQL query string
 */
export function buildSqlQuery(query: DatabaseQuery, tableName: string): string {
  let sql = `SELECT * FROM ${tableName}`;

  // Add joins
  if (query.joins?.length) {
    query.joins.forEach(join => {
      const alias = join.alias ? ` AS ${join.alias}` : '';
      sql += ` ${join.type} JOIN ${join.table}${alias} ON ${join.on}`;
    });
  }

  // Add where clauses
  if (query.where.length > 0) {
    const whereConditions = query.where.map((clause, index) => {
      const prefix = index === 0 ? '' : ` ${clause.logicalOperator || 'AND'} `;
      return `${prefix}${clause.field} ${clause.operator} ${formatValueForSql(clause.value)}`;
    });
    sql += ` WHERE ${whereConditions.join('')}`;
  }

  // Add order by
  if (query.orderBy.length > 0) {
    const orderClauses = query.orderBy.map(order => `${order.field} ${order.direction}`);
    sql += ` ORDER BY ${orderClauses.join(', ')}`;
  }

  // Add limit and offset
  if (query.limit) {
    sql += ` LIMIT ${query.limit}`;
  }
  if (query.offset) {
    sql += ` OFFSET ${query.offset}`;
  }

  return sql;
}

// ============================================================================
// AIRTABLE QUERY BUILDERS
// ============================================================================

/**
 * Converts filter state to Airtable filter configuration
 * @param filters - Filter state to convert
 * @param fieldMappings - Field name mappings for Airtable
 * @returns Airtable filter configuration
 */
export function buildAirtableFilter(
  filters: FilterState,
  fieldMappings: Record<string, string> = {}
): AirtableFilter {
  const airtableFilter: AirtableFilter = {
    filterByFormula: ''
  };

  const formulas: string[] = [];
  const mapField = (field: string): string => fieldMappings[field] || field;

  // Text search
  if (filters.textSearch?.query) {
    const searchConditions = filters.textSearch.fields.map(field => 
      `SEARCH("${filters.textSearch!.query}", {${mapField(field)}}) > 0`
    );
    if (searchConditions.length > 1) {
      formulas.push(`OR(${searchConditions.join(', ')})`);
    } else {
      formulas.push(searchConditions[0]);
    }
  }

  // Status filter
  if (filters.status?.statuses.length) {
    const field = mapField(filters.status.field);
    const statusConditions = filters.status.statuses.map(status => `{${field}} = "${status}"`);
    const formula = statusConditions.length > 1 ? `OR(${statusConditions.join(', ')})` : statusConditions[0];
    formulas.push(filters.status.exclude ? `NOT(${formula})` : formula);
  }

  // Category filter
  if (filters.category?.categories.length) {
    const field = mapField(filters.category.field);
    const categoryConditions = filters.category.categories.map(category => `{${field}} = "${category}"`);
    const formula = categoryConditions.length > 1 ? `OR(${categoryConditions.join(', ')})` : categoryConditions[0];
    formulas.push(filters.category.exclude ? `NOT(${formula})` : formula);
  }

  // Client filter
  if (filters.client?.clientIds.length) {
    const field = mapField(filters.client.field || 'Client');
    const clientConditions = filters.client.clientIds.map(clientId => `FIND("${clientId}", {${field}}) > 0`);
    const formula = clientConditions.length > 1 ? `OR(${clientConditions.join(', ')})` : clientConditions[0];
    formulas.push(filters.client.exclude ? `NOT(${formula})` : formula);
  }

  // Date ranges
  if (filters.dateRanges) {
    Object.entries(filters.dateRanges).forEach(([, range]) => {
      const field = mapField(range.field);
      if (range.startDate) {
        formulas.push(`{${field}} >= "${formatDateForAirtable(range.startDate)}"`);
      }
      if (range.endDate) {
        formulas.push(`{${field}} <= "${formatDateForAirtable(range.endDate)}"`);
      }
    });
  }

  // Numeric ranges
  if (filters.numericRanges) {
    Object.entries(filters.numericRanges).forEach(([, range]) => {
      const field = mapField(range.field);
      if (range.min !== undefined) {
        formulas.push(`{${field}} >= ${range.min}`);
      }
      if (range.max !== undefined) {
        formulas.push(`{${field}} <= ${range.max}`);
      }
    });
  }

  // Combine all formulas
  if (formulas.length > 0) {
    airtableFilter.filterByFormula = formulas.length > 1 ? `AND(${formulas.join(', ')})` : formulas[0];
  }

  // Sorting
  if (filters.sort?.length) {
    airtableFilter.sort = filters.sort.map(sort => ({
      field: mapField(sort.field),
      direction: sort.direction
    }));
  }

  // Pagination
  if (filters.pagination) {
    airtableFilter.maxRecords = filters.pagination.limit;
    // Note: Airtable uses offset as a record ID, not a number
    // This would need to be handled differently in the actual implementation
  }

  return airtableFilter;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Maps filter operators to SQL operators
 * @param operator - Filter operator
 * @returns SQL operator
 */
function mapOperatorToSql(operator: FilterOperator): string {
  const mapping: Record<FilterOperator, string> = {
    equals: '=',
    not_equals: '!=',
    contains: 'ILIKE',
    not_contains: 'NOT ILIKE',
    starts_with: 'ILIKE',
    ends_with: 'ILIKE',
    greater_than: '>',
    less_than: '<',
    greater_than_or_equal: '>=',
    less_than_or_equal: '<=',
    in: 'IN',
    not_in: 'NOT IN',
    between: 'BETWEEN',
    is_null: 'IS NULL',
    is_not_null: 'IS NOT NULL',
    regex: '~'
  };

  return mapping[operator] || '=';
}

/**
 * Formats a value for SQL query
 * @param value - Value to format
 * @returns Formatted value
 */
function formatValueForSql(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (Array.isArray(value)) {
    const formattedValues = value.map(v => formatValueForSql(v));
    return `(${formattedValues.join(', ')})`;
  }
  return String(value);
}

/**
 * Formats a date for API consumption
 * @param date - Date to format
 * @returns ISO date string
 */
function formatDateForApi(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Formats a date for database storage
 * @param date - Date to format
 * @returns Database-compatible date string
 */
function formatDateForDatabase(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Formats a date for Airtable
 * @param date - Date to format
 * @returns Airtable-compatible date string
 */
function formatDateForAirtable(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}