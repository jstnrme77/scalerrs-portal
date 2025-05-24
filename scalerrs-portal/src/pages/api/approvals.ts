import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchFromAirtable } from '../../lib/airtable/helpers';

/* Map UI tabs to Airtable tables + approval-field names */
const TABLE_MAP = {
  keywords : { table: 'Keywords', approvalField: 'Keyword Approvals' },
  briefs   : { table: 'Briefs',   approvalField: 'Brief Approvals' },
  articles : { table: 'Articles', approvalField: 'Article Approvals' }, // adjust if different
  backlinks: { table: 'Backlinks', approvalField: 'Backlink Approvals' },  // NEW
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type = 'keywords', page = 1, pageSize = 100, clientId } = req.query as Record<string, string>;

  /* ─── Hard-stop if the client id is missing **or** equals "all" ─── */
  if (!clientId || clientId === 'all') {
    return res.status(400).json({ error: 'Invalid clientId value' });
  }

  /* ─── Validate the tab / type coming from the UI ─────────────────── */
  if (!(type in TABLE_MAP)) return res.status(400).json({ error: `Unknown approval type: ${type}` });

  const { table, approvalField } = TABLE_MAP[type as keyof typeof TABLE_MAP];

  /* ─── Single Airtable query – filters **inside** Airtable ────────── */
  /*  Clients is a linked-record field → use FIND on the csv of IDs   */
  const formula =
    `AND(` +
      `FIND('${clientId}', ARRAYJOIN({Clients}, ',')) > 0,` +   // only this client
      `{${approvalField}}`                                      // and status not empty
    `)`;
  const raw     = await fetchFromAirtable<any>(table, formula);

  /* ─── Paginate the already-filtered rows ─────────────────────────── */
  const start     = (Number(page) - 1) * Number(pageSize);
  const pageItems = raw.slice(start, start + Number(pageSize));

  return res.json({
    total    : raw.length,
    page     : Number(page),
    pageSize : Number(pageSize),
    items    : pageItems.map(r => r.fields),
  });
} 