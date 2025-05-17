/**
 * Analytics-related Airtable functions (KPI metrics, URL performance, keyword performance)
 */
import { TABLES, getAirtableClient, fetchFromAirtableWithFallback, ensureClientIdArray } from '../airtable-utils';
import { mockKPIMetrics, mockKeywordPerformance } from '../mock-data';

/**
 * Get KPI metrics from Airtable
 * @param clientIds Client IDs to filter by
 * @returns Array of KPI metrics
 */
export async function getKPIMetrics(clientIds?: string | string[]) {
  // Convert clientIds to array if provided
  const clientIdArray = ensureClientIdArray(clientIds);

  // Build filter formula if clientIds are provided
  let filterFormula = '';
  if (clientIdArray.length > 0) {
    const clientFilters = clientIdArray.map(id => `FIND("${id}", {Client})`);
    filterFormula = `OR(${clientFilters.join(',')})`;
  }

  return fetchFromAirtableWithFallback(
    TABLES.KPI_METRICS,
    {
      filterFormula: filterFormula || undefined
    },
    mockKPIMetrics
  );
}

/**
 * URL Performance functionality has been removed as it's no longer used
 * @deprecated This function is no longer used and has been removed
 */

/**
 * Get keyword performance data from Airtable
 * @param clientIds Client IDs to filter by
 * @returns Array of keyword performance data
 */
export async function getKeywordPerformance(clientIds?: string | string[]) {
  // Convert clientIds to array if provided
  const clientIdArray = ensureClientIdArray(clientIds);

  // Build filter formula if clientIds are provided
  let filterFormula = '';
  if (clientIdArray.length > 0) {
    const clientFilters = clientIdArray.map(id => `FIND("${id}", {Client})`);
    filterFormula = `OR(${clientFilters.join(',')})`;
  }

  return fetchFromAirtableWithFallback(
    TABLES.KEYWORD_PERFORMANCE,
    {
      filterFormula: filterFormula || undefined
    },
    mockKeywordPerformance
  );
}
