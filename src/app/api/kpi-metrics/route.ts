import { NextResponse } from 'next/server';
import { getKPIMetrics } from '@/lib/airtable';
import { mockKPIMetrics } from '@/lib/mock-data';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('API route: Fetching KPI metrics from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    const kpiMetrics = await getKPIMetrics();

    if (!kpiMetrics || kpiMetrics.length === 0) {
      console.log('API route: No KPI metrics found, using mock data');
      return NextResponse.json({ kpiMetrics: mockKPIMetrics });
    }

    console.log(`API route: Found ${kpiMetrics.length} KPI metrics`);
    return NextResponse.json({ kpiMetrics });
  } catch (error) {
    console.error('Error fetching KPI metrics:', error);
    console.log('API route: Error fetching KPI metrics, using mock data');
    return NextResponse.json({ kpiMetrics: mockKPIMetrics });
  }
}
