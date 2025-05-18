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
  // Log environment variables for debugging (without exposing full credentials)
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
  
  console.log('Airtable credentials check:');
  console.log('API Key exists:', !!apiKey);
  console.log('Base ID exists:', !!baseId);
  
  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    throw new Error('Missing Airtable credentials');
  }

  // Reuse existing instance if available (connection pooling)
  if (!airtableInstance) {
    console.log('Creating new Airtable connection');
    airtableInstance = new Airtable({ 
      apiKey,
      requestTimeout: 8000, // 8 second timeout (to stay under Netlify's 10s limit)
      endpointUrl: 'https://api.airtable.com',
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
    // Set default parameters for optimization
    const optimizedParams = {
      maxRecords: queryParams.maxRecords || 100, // Limit records for performance
      pageSize: 100, // Use maximum page size for fewer API calls
      ...queryParams
    };
    
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
  
  const filters = clientIds.map(id => 
    `FIND("${id}", {Client})`
  );
  
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
