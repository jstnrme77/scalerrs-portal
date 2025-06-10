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
    console.log('KPI Metrics API: Starting request');
    console.log('KPI Metrics API: API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('KPI Metrics API: Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    // Get clientId from query parameters
    const clientId = request.nextUrl.searchParams.get('clientId');
    const skipCache = request.nextUrl.searchParams.get('skipCache') === 'true';
    const month = request.nextUrl.searchParams.get('month');
    
    console.log('KPI Metrics API: clientId from query:', clientId);
    console.log('KPI Metrics API: month from query:', month);
    console.log('KPI Metrics API: skipCache from query:', skipCache);

    // Generate cache key based on parameters
    const cacheKey = `kpi_metrics_${clientId || 'all'}_${month || 'all'}`;
    
    // Check if we have valid cached data
    if (!skipCache && metricsCache[cacheKey]) {
      const cachedData = metricsCache[cacheKey];
      const now = Date.now();
      
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log(`KPI Metrics API: Using cached KPI metrics (${Math.round((now - cachedData.timestamp) / 1000)}s old)`);
        return NextResponse.json({ kpiMetrics: cachedData.data });
      } else {
        console.log('KPI Metrics API: Cached KPI metrics expired, fetching fresh data');
      }
    }

    // Fetch KPI metrics with client filtering
    let kpiMetrics;
    
    if (clientId) {
      console.log(`KPI Metrics API: Fetching metrics for client ${clientId} and month ${month || 'all'}`);
      kpiMetrics = await getKPIMetrics([clientId], month || null);
      console.log(`KPI Metrics API: Fetched ${kpiMetrics?.length || 0} KPI metrics for client ${clientId}`);
      
      if (kpiMetrics && kpiMetrics.length > 0) {
        // Log structure of first record for debugging
        const firstRecord = kpiMetrics[0];
        console.log('KPI Metrics API: First record fields:', Object.keys(firstRecord.fields || {}).join(', '));
      }
    } else {
      console.log('KPI Metrics API: No clientId provided, fetching metrics for all clients');
      kpiMetrics = await getKPIMetrics(null, month || null);
    }

    if (!kpiMetrics || kpiMetrics.length === 0) {
      console.log('KPI Metrics API: No KPI metrics found from Airtable');
      
      // Add a warning if clientId was provided but no data found
      if (clientId) {
        console.warn(`KPI Metrics API: No KPI metrics found for client ${clientId}`);
      }
      
      return NextResponse.json({ 
        kpiMetrics: [],
        warning: clientId ? `No metrics found for client ID ${clientId}` : 'No metrics found'
      });
    }

    // Cache the results
    metricsCache[cacheKey] = {
      data: kpiMetrics,
      timestamp: Date.now()
    };

    console.log(`KPI Metrics API: Found ${kpiMetrics.length} KPI metrics`);
    return NextResponse.json({ kpiMetrics });
  } catch (error) {
    console.error('KPI Metrics API: Error fetching KPI metrics:', error);
    return NextResponse.json({ 
      kpiMetrics: [],
      error: 'Error fetching metrics from Airtable'
    });
  }
}
