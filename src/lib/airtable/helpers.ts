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

  /* Return instantly if we already have the records */
  const hit = cache.get(key);
  if (hit) return hit as AirtableRecord<T>[];

  const records: AirtableRecord<T>[] = [];

  await base(tableName)
    .select({ filterByFormula })
    .eachPage((page, next) => {
      records.push(...(page as any));
      next();
    });

  cache.set(key, records);
  return records;
} 