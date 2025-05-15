/**
 * Client-related Airtable functions
 */
import { TABLES, getAirtableClient, fetchFromAirtableWithFallback } from '../airtable-utils';
import { mockClients, mockMonths } from '../mock-data';

/**
 * Get clients from Airtable
 * @returns Array of clients
 */
export async function getClients() {
  return fetchFromAirtableWithFallback(
    TABLES.CLIENTS,
    {},
    mockClients
  );
}

/**
 * Get available months from Airtable
 * @returns Array of available months
 */
export async function getAvailableMonths() {
  try {
    const { base, hasCredentials } = getAirtableClient();
    
    if (!hasCredentials || !base) {
      console.log('Using mock months data (no credentials)');
      return mockMonths;
    }

    console.log('Fetching available months from Airtable...');
    
    // Get unique months from the Keywords table
    const records = await base(TABLES.KEYWORDS)
      .select({
        fields: ['Month (Keyword Targets)'],
        sort: [{ field: 'Month (Keyword Targets)', direction: 'desc' }]
      })
      .all();

    // Extract unique months
    const months = new Set<string>();
    records.forEach(record => {
      const month = record.fields['Month (Keyword Targets)'];
      if (month) {
        months.add(month as string);
      }
    });

    // Convert to array and sort
    const monthsArray = Array.from(months);
    
    console.log(`Found ${monthsArray.length} available months`);
    return monthsArray;
  } catch (error) {
    console.error('Error fetching available months:', error);
    return mockMonths;
  }
}
