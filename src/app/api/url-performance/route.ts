import { NextResponse } from 'next/server';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * URL Performance functionality has been removed as it's no longer used
 * @deprecated This API route is no longer used and has been removed
 */
export async function GET() {
  console.log('URL Performance API route: This functionality has been removed');
  return NextResponse.json({
    urlPerformance: [],
    message: 'URL Performance functionality has been removed as it is no longer used'
  });
}
