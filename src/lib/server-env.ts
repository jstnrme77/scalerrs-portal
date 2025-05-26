export const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY as string;
export const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID as string;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  // This warning surfaces during local dev if vars are absent
  console.warn("[server-env] AIRTABLE_API_KEY / AIRTABLE_BASE_ID are not set.");
} 