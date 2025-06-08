import { NextResponse } from 'next/server';
import { clearAirtableCache } from '@/lib/rate-limited-airtable';
import { resetStats } from '@/lib/airtable-status';

/**
 * API route for clearing Airtable cache and resetting stats
 * Only available in development mode for security
 */
export async function POST() {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    // Clear the Airtable cache
    clearAirtableCache();
    
    // Reset the stats
    resetStats();
    
    return NextResponse.json({
      success: true,
      message: 'Airtable cache cleared and stats reset',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error clearing Airtable cache:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to clear Airtable cache',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 