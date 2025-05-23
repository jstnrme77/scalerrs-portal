// Optimized Airtable connection utility for Netlify Functions
const Airtable = require('airtable');

// Singleton instances for connection pooling
let airtableInstance = null;
let baseInstance = null;

/**
 * Get Airtable base instance with connection pooling
 * @returns {Object} Airtable base instance
 */
const getAirtableBase = () => {
  // Get environment variables
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
  const requestTimeout = parseInt(process.env.AIRTABLE_REQUEST_TIMEOUT || '8000', 10);
  const useConnectionPooling = process.env.AIRTABLE_USE_CONNECTION_POOLING !== 'false';

  console.log('Airtable configuration:');
  console.log('API Key exists:', !!apiKey);
  console.log('Base ID exists:', !!baseId);
  console.log('Request timeout:', requestTimeout);
  console.log('Using connection pooling:', useConnectionPooling);

  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    throw new Error('Missing Airtable credentials');
  }

  // Reuse existing instance if connection pooling is enabled
  if (!airtableInstance || !useConnectionPooling) {
    console.log('Creating new Airtable connection');
    airtableInstance = new Airtable({
      apiKey,
      requestTimeout: requestTimeout, // Use configured timeout
      endpointUrl: 'https://api.airtable.com',
      apiVersion: '0.1.0' // Specify API version for stability
    });
    baseInstance = airtableInstance.base(baseId);
  } else {
    console.log('Reusing existing Airtable connection');
  }

  return baseInstance;
};

/**
 * Execute an Airtable query with optimized settings and error handling
 * @param {Object} base - Airtable base instance
 * @param {string} tableName - Table name to query
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Array>} Array of records
 */
const executeQuery = async (base, tableName, queryParams = {}) => {
  console.log(`Executing query on table: ${tableName}`);
  console.log('Query params:', JSON.stringify(queryParams));

  try {
    // Get environment variables for query optimization
    const maxRecords = parseInt(process.env.AIRTABLE_MAX_RECORDS || '50', 10);
    const pageSize = parseInt(process.env.AIRTABLE_PAGE_SIZE || '50', 10);

    // Set default parameters for optimization
    const optimizedParams = {
      maxRecords: queryParams.maxRecords || maxRecords, // Use configured limit
      pageSize: queryParams.pageSize || pageSize, // Use configured page size
      ...queryParams
    };

    console.log(`Query params: maxRecords=${optimizedParams.maxRecords}, pageSize=${optimizedParams.pageSize}`);

    // Use firstPage instead of all() to avoid timeouts
    const records = await base(tableName).select(optimizedParams).firstPage();
    console.log(`Query successful, returned ${records.length} records`);
    return records;
  } catch (error) {
    console.error(`Error executing Airtable query on ${tableName}:`, error);
    // Provide detailed error information for debugging
    if (error.statusCode) {
      console.error(`Airtable API error: ${error.statusCode} - ${error.message}`);
    }
    throw error;
  }
};

/**
 * Get field value with fallbacks for different field names
 * @param {Object} record - Airtable record
 * @param {Array|string} fieldNames - Field name or array of possible field names
 * @param {*} defaultValue - Default value if field not found
 * @returns {*} Field value or default
 */
const getFieldValue = (record, fieldNames, defaultValue = '') => {
  if (!record || !record.fields) return defaultValue;

  const fields = record.fields;
  const names = Array.isArray(fieldNames) ? fieldNames : [fieldNames];

  for (const name of names) {
    if (fields[name] !== undefined) {
      return fields[name];
    }
  }

  return defaultValue;
};

/**
 * Create a client filter formula for Airtable
 * @param {Array} clientIds - Array of client IDs
 * @returns {string} Airtable formula for filtering by client
 */
const createClientFilter = (clientIds) => {
  if (!clientIds || !clientIds.length) return '';

  // Create filters for both Clients and Client fields
  const filters = clientIds.flatMap(id => [
    `FIND("${id}", {Clients})`,
    `FIND("${id}", {Client})`,
    `{Clients} = "${id}"`,
    `{Client} = "${id}"`
  ]);

  return filters.length > 1
    ? `OR(${filters.join(',')})`
    : filters[0];
};

/**
 * Combine multiple filter parts with AND
 * @param {Array} filterParts - Array of filter formulas
 * @returns {string} Combined filter formula
 */
const combineFilters = (filterParts) => {
  const validParts = filterParts.filter(part => part && part.trim());

  if (!validParts.length) return '';
  if (validParts.length === 1) return validParts[0];

  return `AND(${validParts.join(',')})`;
};

module.exports = {
  getAirtableBase,
  executeQuery,
  getFieldValue,
  createClientFilter,
  combineFilters
};
