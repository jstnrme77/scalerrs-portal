import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchFromAirtable } from '@/lib/airtable/helpers';

type Item = { id: string; fields: any };

const TABLES = {
  keywords  : { table: 'Keywords',  approvalField : 'Keyword Approvals'  },
  briefs    : { table: 'Briefs',    approvalField : 'Brief Approvals'   },
  articles  : { table: 'Articles',  approvalField : 'Article Approvals' },
  backlinks : { table: 'Backlinks', approvalField : 'Backlink Approvals'}
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { clientId } = req.query as Record<string, string>;

  if (!clientId || clientId === 'all') {
    return res.status(400).json({ error: 'Invalid clientId' });
  }

  /* ─── fetch four tables in parallel; each uses the 60-s LRU cache ─── */
  const results = await Promise.all(
    Object.entries(TABLES).map(async ([key, { table }]) => {
      const formula = `{clientRecordID} = '${clientId}'`;
      const rows    = await fetchFromAirtable<Item>(table, formula);
      return { type: key, rows: rows.map(r => r.fields) };
    })
  );

  /* shape = { keywords: [...], briefs: [...], … }  */
  const payload: Record<string, any[]> = {};
  results.forEach(r => (payload[r.type] = r.rows));

  res.json(payload);
} 