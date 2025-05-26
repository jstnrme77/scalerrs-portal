import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID!);

    const records = await base('Clients')
      .select({ 
        filterByFormula: `RECORD_ID() = '${params.clientId}'`, 
        maxRecords: 1,
        fields: ['Google Drive Link', 'Slack Link', 'Name']
      })
      .firstPage();

    if (!records || records.length === 0) {
      return NextResponse.json({ 
        googleDriveUrl: null, 
        slackUrl: null,
        error: 'Client not found'
      }, { status: 404 });
    }

    const record = records[0];
    const googleDriveUrl = record.get('Google Drive Link') as string || null;
    const slackUrl = record.get('Slack Link') as string || null;
    const clientName = record.get('Name') as string || null;

    console.log(`Retrieved links for client ${clientName} (${params.clientId}):`, {
      googleDriveUrl,
      slackUrl
    });

    return NextResponse.json({ 
      googleDriveUrl, 
      slackUrl 
    });
  } catch (error: any) {
    console.error('Error fetching client links:', error);
    return NextResponse.json({ 
      googleDriveUrl: null, 
      slackUrl: null,
      error: error.message || 'An error occurred'
    }, { status: 500 });
  }
} 