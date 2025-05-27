import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
const TABLE_ID = 'Clients by Month';

type QuarterData = { projected: number; actual: number; months: (string | null | undefined)[] };

Airtable.configure({ apiKey: AIRTABLE_API_KEY! });
const base = new Airtable({ apiKey: AIRTABLE_API_KEY! }).base(AIRTABLE_BASE_ID!);

// Helper function to cache KPI progress data in memory
let progressCache: { [key: string]: { data: any, timestamp: number } } = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL

export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get('clientId');
    const skipCache = req.nextUrl.searchParams.get('skipCache') === 'true';
    
    if (!clientId) return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
    
    console.log('API route: Fetching KPI progress for client:', clientId);
    console.log('API route: skipCache from query:', skipCache);
    
    // Generate cache key based on clientId
    const cacheKey = `kpi_progress_${clientId}`;
    
    // Check if we have valid cached data
    if (!skipCache && progressCache[cacheKey]) {
      const cachedData = progressCache[cacheKey];
      const now = Date.now();
      
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log(`API route: Using cached KPI progress (${Math.round((now - cachedData.timestamp) / 1000)}s old)`);
        return NextResponse.json(cachedData.data);
      } else {
        console.log('API route: Cached KPI progress expired, fetching fresh data');
      }
    }

    const now = new Date();
    const year = now.getFullYear();

    // Fetch all months for this client and year
    const records = await base(TABLE_ID)
      .select({
        filterByFormula: `AND(
          {Client Record ID} = '${clientId}',
          YEAR({Month Start}) = ${year}
        )`,
        maxRecords: 100
      })
      .firstPage();

    // Group by quarter
    const quarterMap: Record<string, QuarterData> = {};
    let annualProjected = 0, annualActual = 0;
    let currentQuarter = '', currentQuarterProjected = 0, currentQuarterActual = 0;

    // For traffic growth calculation
    let currentMonthActual = null;
    let prevMonthActual = null;
    let foundCurrent = false;
    let foundPrev = false;

    // Sort records by Month Start ascending
    const sortedRecords = [...records].sort((a, b) => {
      const aDate = new Date(a.get('Month Start') as string || '');
      const bDate = new Date(b.get('Month Start') as string || '');
      return aDate.getTime() - bDate.getTime();
    });

    for (const rec of sortedRecords) {
      const projected = Number(rec.get('Organic Traffic (Projected)')) || 0;
      const actual = Number(rec.get('Organic Traffic (Actual)')) || 0;
      const quarter = rec.get('Quarter') as string || '';
      const monthStart = rec.get('Month Start') as string | null | undefined;

      annualProjected += projected;
      annualActual += actual;

      if (!quarterMap[quarter]) quarterMap[quarter] = { projected: 0, actual: 0, months: [] };
      quarterMap[quarter].projected += projected;
      quarterMap[quarter].actual += actual;
      quarterMap[quarter].months.push(monthStart);

      // Traffic growth: find current and previous month actuals
      if (monthStart) {
        const mDate = new Date(monthStart);
        if (mDate.getFullYear() === now.getFullYear() && mDate.getMonth() === now.getMonth()) {
          currentMonthActual = actual;
          foundCurrent = true;
        } else if (mDate.getFullYear() === now.getFullYear() && mDate.getMonth() === now.getMonth() - 1) {
          prevMonthActual = actual;
          foundPrev = true;
        }
      }
    }

    // Find the current quarter by checking which quarter contains the current month
    for (const [q, data] of Object.entries(quarterMap)) {
      if (data.months.some((m) => {
        if (!m) return false;
        const mDate = new Date(m);
        return mDate.getMonth() === now.getMonth() && mDate.getFullYear() === now.getFullYear();
      })) {
        currentQuarter = q;
        currentQuarterProjected = data.projected;
        currentQuarterActual = data.actual;
        break;
      }
    }

    const currentQuarterPercent = currentQuarterProjected ? Math.round((currentQuarterActual / currentQuarterProjected) * 100) : null;
    const annualPercent = annualProjected ? Math.round((annualActual / annualProjected) * 100) : null;

    // Calculate traffic growth (MoM %)
    let trafficGrowth = null;
    if (foundCurrent && foundPrev && prevMonthActual && prevMonthActual !== 0 && currentMonthActual !== null) {
      trafficGrowth = +(((currentMonthActual - prevMonthActual) / prevMonthActual) * 100).toFixed(1);
    }

    const result = {
      currentQuarterPercent,
      annualPercent,
      quarterLabel: currentQuarter,
      year,
      trafficGrowth
    };
    
    // Cache the results
    progressCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching KPI progress:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch KPI progress',
      currentQuarterPercent: null,
      annualPercent: null,
      quarterLabel: '',
      year: new Date().getFullYear(),
      trafficGrowth: null
    }, { status: 500 });
  }
} 