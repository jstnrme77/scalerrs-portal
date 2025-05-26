import { NextResponse, NextRequest } from 'next/server';
import Airtable from 'airtable';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_CLIENTS_BY_MONTH_TABLE_ID } =
  process.env;

Airtable.configure({ apiKey: AIRTABLE_API_KEY! });
const base = new Airtable({ apiKey: AIRTABLE_API_KEY! }).base(AIRTABLE_BASE_ID!);

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId');

  try {
    const records = await base(AIRTABLE_CLIENTS_BY_MONTH_TABLE_ID!)
      .select({
        filterByFormula: `AND(
          {Client Record ID} = '${clientId}',
          DATETIME_DIFF({Month Start}, TODAY(), 'days') <= 0
        )`,
        sort: [{ field: 'Month Start', direction: 'desc' }],
        maxRecords: 1
      })
      .firstPage();

    if (!records.length)
      return NextResponse.json({ error: 'No month progress found' }, { status: 404 });

    const rec = records[0];
    return NextResponse.json({
      monthProgress: rec.get('Month Progress'),
      monthStart: rec.get('Month Start')
    });
  } catch (err) {
    console.error('[month-progress] Airtable error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 