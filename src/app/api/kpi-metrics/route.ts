import { NextRequest, NextResponse } from 'next/server';
import { getKPIMetrics } from '@/lib/airtable/tables/kpi';
import { mockKPIMetrics } from '@/lib/mock-data';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to cache KPI metrics data in memory
let metricsCache: { [key: string]: { data: any, timestamp: number } } = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching KPI metrics from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    // Get clientId from query parameters
    const clientId = request.nextUrl.searchParams.get('clientId');
    const skipCache = request.nextUrl.searchParams.get('skipCache') === 'true';
    const month = request.nextUrl.searchParams.get('month');
    
    console.log('API route: clientId from query:', clientId);
    console.log('API route: month from query:', month);
    console.log('API route: skipCache from query:', skipCache);

    // Generate cache key based on parameters
    const cacheKey = `kpi_metrics_${clientId || 'all'}_${month || 'all'}`;
    
    // Check if we have valid cached data
    if (!skipCache && metricsCache[cacheKey]) {
      const cachedData = metricsCache[cacheKey];
      const now = Date.now();
      
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log(`API route: Using cached KPI metrics (${Math.round((now - cachedData.timestamp) / 1000)}s old)`);
        return NextResponse.json({ kpiMetrics: cachedData.data });
      } else {
        console.log('API route: Cached KPI metrics expired, fetching fresh data');
      }
    }

    // Fetch KPI metrics with client filtering
    const kpiMetrics = clientId 
      ? await getKPIMetrics([clientId], month || null)  
      : await getKPIMetrics(null, month || null);

    if (!kpiMetrics || kpiMetrics.length === 0) {
      console.log('API route: No KPI metrics found, using mock data');
      return NextResponse.json({ kpiMetrics: mockKPIMetrics });
    }

    // Cache the results
    metricsCache[cacheKey] = {
      data: kpiMetrics,
      timestamp: Date.now()
    };

    console.log(`API route: Found ${kpiMetrics.length} KPI metrics`);
    return NextResponse.json({ kpiMetrics });
  } catch (error) {
    console.error('Error fetching KPI metrics:', error);
    console.log('API route: Error fetching KPI metrics, using mock data');
    return NextResponse.json({ kpiMetrics: mockKPIMetrics });
  }
}
