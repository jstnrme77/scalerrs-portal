import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_ID!);

  const records = await base('Clients')
    .select({ filterByFormula: `RECORD_ID() = '${params.clientId}'`, maxRecords: 1 })
    .firstPage();

  const agreement = records[0]?.get('Agreement') as Airtable.Attachment[] | undefined;
  const url = agreement?.[0]?.url ?? '';

  return NextResponse.json({ url });
} 