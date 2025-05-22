// Shared utility functions for Airtable operations
const { FIELD_MAPPINGS, STATUS_MAPPINGS } = require('./constants');

/**
 * Helper function to get a field value using multiple possible field names
 * @param {Object} fields The record fields
 * @param {string|string[]} fieldNames Field name or array of possible field names
 * @param {any} defaultValue Default value if field not found
 * @returns {any} The field value or default value
 */
function getFieldValue(fields, fieldNames, defaultValue = '') {
  // If fieldNames is a string, convert to array
  const names = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
  
  // Try each field name
  for (const name of names) {
    if (fields[name] !== undefined && fields[name] !== null) {
      return fields[name];
    }
  }
  
  // Return default value if no field found
  return defaultValue;
}

/**
 * Helper function to map Airtable status to UI status
 * @param {string} airtableStatus The status from Airtable
 * @param {Object} fields Optional record fields for checking approval fields
 * @returns {string} The mapped UI status
 */
function mapAirtableStatusToUIStatus(airtableStatus, fields) {
  // If fields are provided, check for dedicated approval fields first
  if (fields) {
    if (fields['Keyword Approval']) {
      return mapStatusString(fields['Keyword Approval']);
    }
    if (fields['Brief Approval']) {
      return mapStatusString(fields['Brief Approval']);
    }
    if (fields['Article Approval']) {
      return mapStatusString(fields['Article Approval']);
    }
  }

  // Otherwise, map the provided status string
  return mapStatusString(airtableStatus);
}

/**
 * Helper function to map a status string to a standardized status
 * @param {string} status The status string to map
 * @returns {string} The standardized status
 */
function mapStatusString(status) {
  if (!status) return 'not_started';
  
  const statusLower = status.toLowerCase();
  
  // Check each status mapping
  for (const [key, values] of Object.entries(STATUS_MAPPINGS)) {
    if (values.some(value => statusLower.includes(value))) {
      return key.toLowerCase();
    }
  }
  
  // Default to not_started if no match
  return 'not_started';
}

/**
 * Helper function to create client filter formula
 * @param {string[]} clientIds Array of client IDs
 * @returns {string} Airtable filter formula for clients
 */
function createClientFilter(clientIds) {
  if (!clientIds || clientIds.length === 0) {
    return '';
  }

  // Create a filter formula for client IDs
  const clientFilters = clientIds.map(clientId =>
    `SEARCH('${clientId}', ARRAYJOIN(Clients, ',')) > 0`
  );

  return `OR(${clientFilters.join(',')})`;
}

/**
 * Helper function to create user filter formula
 * @param {string} userId User ID
 * @param {string[]} fieldNames Array of field names to check
 * @returns {string} Airtable filter formula for user
 */
function createUserFilter(userId, fieldNames) {
  if (!userId || !fieldNames || fieldNames.length === 0) {
    return '';
  }

  const userFilters = fieldNames.map(fieldName =>
    `SEARCH('${userId}', ARRAYJOIN({${fieldName}}, ',')) > 0`
  );

  return `OR(${userFilters.join(',')})`;
}

/**
 * Helper function to combine multiple filter parts with AND
 * @param {string[]} filterParts Array of filter formulas
 * @returns {string} Combined filter formula
 */
function combineFilters(filterParts) {
  const nonEmptyFilters = filterParts.filter(part => part.trim() !== '');

  if (nonEmptyFilters.length === 0) {
    return '';
  }

  if (nonEmptyFilters.length === 1) {
    return nonEmptyFilters[0];
  }

  return `AND(${nonEmptyFilters.join(',')})`;
}

module.exports = {
  getFieldValue,
  mapAirtableStatusToUIStatus,
  mapStatusString,
  createClientFilter,
  createUserFilter,
  combineFilters
};
