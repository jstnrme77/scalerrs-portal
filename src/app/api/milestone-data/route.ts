import { NextResponse, NextRequest } from 'next/server';
import Airtable from 'airtable';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_CLIENTS_BY_MONTH_TABLE_ID } =
  process.env;

Airtable.configure({ apiKey: AIRTABLE_API_KEY! });
const base = new Airtable({ apiKey: AIRTABLE_API_KEY! }).base(AIRTABLE_BASE_ID!);

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
  }

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

    if (!records.length) {
      return NextResponse.json({ error: 'No milestone data found' }, { status: 404 });
    }

    const rec = records[0];
    
    // Extract progress fields and convert to percentages
    const getProgressValue = (value: any): number | null => {
      if (value === null || value === undefined || value === 'NaN' || isNaN(Number(value))) {
        return null;
      }
      
      const num = Number(value);
      if (!isFinite(num)) return null;
      
      // Convert to percentage if it's between 0 and 1
      if (num > 0 && num <= 1) {
        return Math.round(num * 100);
      }
      
      return Math.round(num);
    };

    // Map the progress fields
    const progressData = {
      'CRO': getProgressValue(rec.get('Progess (CRO)')),
      'Technical SEO': getProgressValue(rec.get('Progress (WQA)')),
      'Keywords': getProgressValue(rec.get('Progress (Keywords)')),
      'Links Given': getProgressValue(rec.get('Progress (Links Given)')),
      'Link Building': getProgressValue(rec.get('Progress (Backlinks)'))
    };

    // Filter out null values
    const filteredProgress = Object.entries(progressData)
      .filter(([_, value]) => value !== null)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    return NextResponse.json({
      monthProgress: rec.get('Month Progress'),
      monthStart: rec.get('Month Start'),
      progressSections: filteredProgress
    });
  } catch (err) {
    console.error('[milestone-data] Airtable error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 