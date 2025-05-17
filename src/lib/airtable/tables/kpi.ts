import { base } from '../config';
import { hasAirtableCredentials, TABLES, ALT_TABLES } from '../config';
import {
  mockKPIMetrics,
  mockURLPerformance,
  mockKeywordPerformance
} from '../../mock-data';
import { KPIMetric } from '../types';
import { handleAirtableError, createClientFilter, createMonthFilter, combineFilters } from '../utils';

/**
 * Get KPI metrics from Airtable, filtered by client and month
 * @param clientIds Optional client IDs to filter metrics
 * @param month Optional month to filter metrics
 * @returns Array of KPI metric objects
 */
export async function getKPIMetrics(clientIds?: string[] | null, month?: string | null): Promise<KPIMetric[]> {
  if (!hasAirtableCredentials) {
    console.log('Using mock KPI metrics data (no credentials)');
    return mockKPIMetrics;
  }

  try {
    console.log('Fetching KPI metrics from Airtable...');
    console.log('Using base ID:', base._id);
    console.log('Using table name:', TABLES.KPI_METRICS);

    // Try to list all tables in the base to see what's available
    try {
      console.log('Attempting to list all tables in the base...');
      // This is a workaround to list tables - we try to access a non-existent table
      // which will fail, but the error message will contain the list of valid tables
      try {
        await base('__nonexistent_table__').select().firstPage();
      } catch (listError: any) {
        if (listError.message && listError.message.includes('Table "__nonexistent_table__" not found. Available tables:')) {
          const availableTables = listError.message
            .split('Available tables:')[1]
            .trim()
            .split(',')
            .map((t: string) => t.trim());

          console.log('Available tables in this base:', availableTables);

          // Check if our required tables exist
          const kpiMetricsExists = availableTables.some((t: string) =>
            t === TABLES.KPI_METRICS ||
            t === TABLES.KPI_METRICS.toLowerCase() ||
            t === 'KPI Metrics' ||
            t === 'kpi metrics' ||
            ALT_TABLES.KPI_METRICS.includes(t)
          );

          console.log(`KPI Metrics table exists: ${kpiMetricsExists}`);

          // If table doesn't exist, use mock data
          if (!kpiMetricsExists) {
            console.log('KPI Metrics table does not exist in this base. Using mock data.');
            return mockKPIMetrics;
          }
        }
      }
    } catch (listTablesError) {
      console.error('Error listing tables:', listTablesError);
    }

    // Check if the table exists and we can access it
    try {
      // First, try to get just one record to verify the table exists and is accessible
      const checkRecord = await base(TABLES.KPI_METRICS).select({ maxRecords: 1 }).firstPage();
      console.log('KPI Metrics table check:', checkRecord.length > 0 ? 'Table exists and has records' : 'Table exists but is empty');

      if (checkRecord.length > 0) {
        console.log('Sample KPI Metrics record structure:', checkRecord[0].fields);
        console.log('Available fields in KPI Metrics:', Object.keys(checkRecord[0].fields));
      } else {
        console.log('KPI Metrics table is empty. Using mock data...');
        return mockKPIMetrics;
      }
    } catch (checkError: any) {
      console.error('Error checking KPI Metrics table:', checkError.message);

      if (checkError.message && checkError.message.includes('Table not found')) {
        console.error('The KPI Metrics table does not exist in this base');
        return mockKPIMetrics;
      }

      if (checkError.message && checkError.message.includes('authorized')) {
        console.error('Authorization error. Your token may not have the correct permissions.');
        console.error('Make sure your token has the following scopes: data.records:read, data.records:write, schema.bases:read');
        return mockKPIMetrics;
      }

      // For other errors, fall back to mock data
      return mockKPIMetrics;
    }

    // Build the query with appropriate filters
    const filterParts: string[] = [];

    // If client IDs are specified, add client filter
    if (clientIds && clientIds.length > 0) {
      console.log('Filtering KPI metrics by client:', clientIds);
      filterParts.push(createClientFilter(clientIds));
    }

    // If month is specified, add month filter
    if (month) {
      console.log('Filtering KPI metrics by month:', month);
      filterParts.push(createMonthFilter(month));
    }

    // Combine all filter parts
    const filterFormula = combineFilters(filterParts);

    // Apply the filter if one was created
    let query;
    if (filterFormula) {
      console.log('Using filter formula:', filterFormula);
      query = base(TABLES.KPI_METRICS).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(TABLES.KPI_METRICS).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} KPI metrics records from Airtable`);

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;

      return {
        id: record.id,
        MetricName: fields.MetricName || fields.Name || '',
        CurrentValue: fields.CurrentValue || fields.Value || 0,
        PreviousValue: fields.PreviousValue || fields.Previous || 0,
        ChangePercentage: fields.ChangePercentage || fields.Change || 0,
        Goal: fields.Goal || fields.Target || 0,
        Client: fields.Client || [],
        Date: fields.Date || fields.Month || '',
        Unit: fields.Unit || '',
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    return handleAirtableError(error, mockKPIMetrics, 'getKPIMetrics');
  }
}

/**
 * Get URL performance data from Airtable, filtered by client
 * @param clientIds Optional client IDs to filter URL performance
 * @returns Array of URL performance objects
 */
export async function getURLPerformance(clientIds?: string[] | null): Promise<any[]> {
  if (!hasAirtableCredentials) {
    console.log('Using mock URL performance data (no credentials)');
    return mockURLPerformance;
  }

  try {
    console.log('Fetching URL performance from Airtable...');
    console.log('Using base ID:', base._id);
    console.log('Using table name:', TABLES.URL_PERFORMANCE);

    // Try to list all tables in the base to see what's available
    try {
      console.log('Attempting to list all tables in the base...');
      // This is a workaround to list tables - we try to access a non-existent table
      // which will fail, but the error message will contain the list of valid tables
      try {
        await base('__nonexistent_table__').select().firstPage();
      } catch (listError: any) {
        if (listError.message && listError.message.includes('Table "__nonexistent_table__" not found. Available tables:')) {
          const availableTables = listError.message
            .split('Available tables:')[1]
            .trim()
            .split(',')
            .map((t: string) => t.trim());

          console.log('Available tables in this base:', availableTables);

          // Check if our required tables exist
          const urlPerformanceExists = availableTables.some((t: string) =>
            t === TABLES.URL_PERFORMANCE ||
            t === TABLES.URL_PERFORMANCE.toLowerCase() ||
            t === 'URL Performance' ||
            t === 'url performance' ||
            ALT_TABLES.URL_PERFORMANCE.includes(t)
          );

          console.log(`URL Performance table exists: ${urlPerformanceExists}`);

          // If table doesn't exist, use mock data
          if (!urlPerformanceExists) {
            console.log('URL Performance table does not exist in this base. Using mock data.');
            return mockURLPerformance;
          }
        }
      }
    } catch (listTablesError) {
      console.error('Error listing tables:', listTablesError);
    }

    // Build the query with appropriate filters
    const filterParts: string[] = [];

    // If client IDs are specified, add client filter
    if (clientIds && clientIds.length > 0) {
      console.log('Filtering URL performance by client:', clientIds);
      filterParts.push(createClientFilter(clientIds));
    }

    // Combine all filter parts
    const filterFormula = combineFilters(filterParts);

    // Apply the filter if one was created
    let query;
    if (filterFormula) {
      console.log('Using filter formula:', filterFormula);
      query = base(TABLES.URL_PERFORMANCE).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(TABLES.URL_PERFORMANCE).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} URL performance records from Airtable`);

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;

      return {
        id: record.id,
        URLPath: fields.URLPath || fields.URL || '',
        PageTitle: fields.PageTitle || fields.Title || '',
        Clicks: fields.Clicks || 0,
        Impressions: fields.Impressions || 0,
        CTR: fields.CTR || 0,
        AveragePosition: fields.AveragePosition || fields.Position || 0,
        Client: fields.Client || [],
        Date: fields.Date || '',
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    return handleAirtableError(error, mockURLPerformance, 'getURLPerformance');
  }
}

/**
 * Get keyword performance data from Airtable, filtered by client
 * @param clientIds Optional client IDs to filter keyword performance
 * @returns Array of keyword performance objects
 */
export async function getKeywordPerformance(clientIds?: string[] | null): Promise<any[]> {
  if (!hasAirtableCredentials) {
    console.log('Using mock keyword performance data (no credentials)');
    return mockKeywordPerformance;
  }

  try {
    console.log('Fetching keyword performance from Airtable...');
    console.log('Using base ID:', base._id);
    console.log('Using table name:', TABLES.KEYWORDS);

    // Build the query with appropriate filters
    const filterParts: string[] = [];

    // If client IDs are specified, add client filter
    if (clientIds && clientIds.length > 0) {
      console.log('Filtering keyword performance by client:', clientIds);
      filterParts.push(createClientFilter(clientIds));
    }

    // Combine all filter parts
    const filterFormula = combineFilters(filterParts);

    // Apply the filter if one was created
    let query;
    if (filterFormula) {
      console.log('Using filter formula:', filterFormula);
      query = base(TABLES.KEYWORDS).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(TABLES.KEYWORDS).select();
    }

    // Fetch the records
    const records = await query.all();
    console.log(`Successfully fetched ${records.length} keyword performance records from Airtable`);

    // Map the records to our expected format
    return records.map((record: any) => {
      const fields = record.fields;

      return {
        id: record.id,
        Keyword: fields.Keyword || fields['Main Keyword'] || '',
        Volume: fields.Volume || fields['Search Volume'] || 0,
        Difficulty: fields.Difficulty || fields['Keyword Difficulty'] || 0,
        CurrentPosition: fields.CurrentPosition || fields.Position || 0,
        PreviousPosition: fields.PreviousPosition || fields.PreviousRank || 0,
        PositionChange: fields.PositionChange || fields.Change || 0,
        URL: fields.URL || fields['Target URL'] || '',
        Client: fields.Client || fields['All Clients'] || [],
        Date: fields.Date || '',
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    return handleAirtableError(error, mockKeywordPerformance, 'getKeywordPerformance');
  }
}

/**
 * Get clusters data from Airtable
 * @returns Array of cluster objects
 */
export async function getClusters(): Promise<any[]> {
  if (!hasAirtableCredentials) {
    console.log('Using mock clusters data (no credentials)');
    return [];
  }

  try {
    console.log('Fetching clusters from Airtable...');
    console.log('Using base ID:', base._id);
    console.log('Using table name:', TABLES.CLUSTERS);

    // Fetch all records from the Clusters table
    const records = await base(TABLES.CLUSTERS).select().all();
    console.log(`Successfully fetched ${records.length} clusters from Airtable`);

    // Map the records to our expected format
    return records.map((record: any) => {
      return {
        id: record.id,
        ...record.fields
      };
    });
  } catch (error) {
    return handleAirtableError(error, [], 'getClusters');
  }
}
