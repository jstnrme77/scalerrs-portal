import { base } from './config';
import { LRUCache } from 'lru-cache';

export type AirtableRecord<T = any> = {
  id: string;
  fields: T;
};

/* ------------------------------------------------------------------ */
/* A 100-item / 60-second in-memory cache for lightweight deduping.    */
const cache = new LRUCache<string, AirtableRecord<any>[]>({
  max: 100,
  ttl: 60_000, // 60 seconds
});

export async function fetchFromAirtable<T>(
  tableName: string,
  filterByFormula?: string
): Promise<AirtableRecord<T>[]> {
  /* Compose a stable cache key */
  const key = `${tableName}__${filterByFormula ?? ''}`;

  // Special logging for quarterly reports table
  const isQuarterlyTable = tableName === 'Clients By Quarters';
  if (isQuarterlyTable) {
    console.log(`🔍 fetchFromAirtable called for ${tableName}`);
    console.log(`🔍 Filter formula: ${filterByFormula}`);
  }

  /* Return instantly if we already have the records */
  const hit = cache.get(key);
  if (hit) {
    if (isQuarterlyTable) {
      console.log(`🔍 Cache hit for ${tableName}, returning ${hit.length} records`);
    }
    return hit as AirtableRecord<T>[];
  }

  if (isQuarterlyTable) {
    console.log(`🔍 Cache miss for ${tableName}, fetching from Airtable...`);
  }

  const records: AirtableRecord<T>[] = [];

  try {
    // Make sure base is available
    if (!base) {
      console.error(`Error: Airtable base is not initialized for table ${tableName}`);
      return [];
    }

    // Check if the table exists in the base
    let tableExists = true;
    try {
      // Try to access the table - will throw if it doesn't exist
      base(tableName).select({ maxRecords: 1 });
    } catch (tableError) {
      console.error(`Error: Table ${tableName} does not exist in the Airtable base`);
      tableExists = false;
    }

    if (!tableExists) {
      return [];
    }

    await base(tableName)
      .select({ filterByFormula })
      .eachPage((page: any[], next: () => void) => {
        if (isQuarterlyTable) {
          console.log(`🔍 Got page with ${page.length} records for ${tableName}`);
        }
        records.push(...(page as any));
        next();
      });

    if (isQuarterlyTable) {
      console.log(`🔍 Completed fetching ${records.length} records for ${tableName}`);
      if (records.length > 0) {
        const recordFields = records[0].fields as Record<string, any>;
        console.log(`🔍 First record fields: ${Object.keys(recordFields).join(', ')}`);
      }
    }

    cache.set(key, records);
    return records;
  } catch (error) {
    console.error(`Error fetching from Airtable table ${tableName}:`, error);
    
    // Return empty array in case of error
    return [];
  }
} 