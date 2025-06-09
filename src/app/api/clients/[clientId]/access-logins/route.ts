import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { type NextRequest } from 'next/server';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

const TABLE = 'client access & logins'; // exactly as in Airtable

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const records = await base(TABLE)
    .select({ filterByFormula: `{Client Record ID} = '${params.clientId}'` })
    .all();

  return NextResponse.json(
    records.map(r => ({
      id: r.id,
      name: r.get('Name') as string | undefined,
      username: r.get('Username') as string | null | undefined,
      password: r.get('Password') as string | null | undefined,
      notes: r.get('Notes') as string | null | undefined,
      lastModified: r.get('Last Modified') as string | undefined,
    }))
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const body = await request.json();
  const record = await base(TABLE).create({
    Name: body.name,
    Username: body.username ?? '',
    Password: body.password ?? '',
    Notes: body.notes ?? '',
    "Client Record ID": params.clientId,
  });
  return NextResponse.json({ id: record.id });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const { id, ...fields } = await request.json();

  const airtableFields: Airtable.FieldSet = {};
  if (fields.username !== undefined) airtableFields['Username'] = fields.username;
  if (fields.password !== undefined) airtableFields['Password'] = fields.password;
  if (fields.notes !== undefined) airtableFields['Notes'] = fields.notes;

  await base(TABLE).update(id, airtableFields);
  return NextResponse.json({ ok: true });
} 