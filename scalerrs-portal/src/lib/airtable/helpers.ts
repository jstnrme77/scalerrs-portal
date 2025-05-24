import { base } from '../config';   // ⬅ adjust if your config file lives elsewhere
import LRU from 'lru-cache';          // ❶  add tiny in-memory cache

export type AirtableRecord<T = any> = {
  id: string;
  fields: T;
};

/* ------------------------------------------------------------------ */
/* A 100-item / 60-second LRU cache is enough for the Approvals page. */
const cache = new LRU<string, AirtableRecord<any>[]>({
  max: 100,
  ttl: 60_000, // 60 seconds
});

export async function fetchFromAirtable<T>(
  tableName: string,
  filterByFormula?: string
): Promise<AirtableRecord<T>[]> {
  /* ❷  Compose a stable cache-key */
  const key = `${tableName}__${filterByFormula ?? ''}`;

  /* ❸  Return instantly if we already have the records */
  const hit = cache.get(key);
  if (hit) return hit as AirtableRecord<T>[];

  const records: AirtableRecord<T>[] = [];

  await base(tableName)
    .select({ filterByFormula })
    .eachPage((page, next) => {
      records.push(...(page as any));
      next();
    });

  cache.set(key, records);   // ❹  store for the next caller
  return records;
} 