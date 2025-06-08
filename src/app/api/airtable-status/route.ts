import { NextResponse } from 'next/server';
import { getAirtableStats } from '@/lib/airtable-status';
import { getCacheStats } from '@/lib/rate-limited-airtable';

/**
 * API route for getting Airtable connection status
 * Only available in development mode for security
 */
export async function GET() {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    // Get Airtable stats
    const stats = getAirtableStats();
    
    // Get cache stats
    let cacheStats;
    try {
      cacheStats = getCacheStats();
    } catch (error) {
      console.error('Error getting cache stats:', error);
      cacheStats = { error: 'Failed to get cache stats' };
    }
    
    // Get environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      hasAirtableApiKey: !!process.env.AIRTABLE_API_KEY,
      hasPublicAirtableApiKey: !!process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
      hasAirtableBaseId: !!process.env.AIRTABLE_BASE_ID,
      hasPublicAirtableBaseId: !!process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
      vercelEnv: process.env.VERCEL_ENV || 'not-vercel'
    };
    
    return NextResponse.json({
      stats,
      cacheStats,
      envInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in airtable-status API route:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get Airtable status',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 