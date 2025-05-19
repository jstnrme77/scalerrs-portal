/**
 * API route for fetching available months
 */
import { NextResponse } from 'next/server';
import { getAvailableMonths } from '@/lib/airtable';
import { mockMonths } from '@/lib/mock-data';

export async function GET() {
  try {
    console.log('API route: Fetching available months from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    try {
      // Try to use the imported function
      const months = await getAvailableMonths();

      // If no months found, use mock data
      if (!months || months.length === 0) {
        console.log('API route: No months found, using mock data');

        // Create response with cache control headers
        const response = NextResponse.json(mockMonths); // Return array directly, not wrapped in object

        // Add cache control headers to prevent caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        response.headers.set('Pragma', 'no-cache');

        return response;
      }

      console.log(`API route: Found ${months.length} available months`);

      // Create response with cache control headers
      const response = NextResponse.json(months); // Return array directly, not wrapped in object

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    } catch (functionError) {
      console.error('Error using imported getAvailableMonths function:', functionError);
      console.log('Falling back to mock data');

      // Create response with cache control headers
      const response = NextResponse.json(mockMonths); // Return array directly, not wrapped in object

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }
  } catch (error) {
    console.error('Error fetching available months:', error);

    // Return mock data as fallback
    console.log('API route: Error fetching months, using mock data');

    // Create response with cache control headers
    const response = NextResponse.json(mockMonths); // Return array directly, not wrapped in object

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  }
}
