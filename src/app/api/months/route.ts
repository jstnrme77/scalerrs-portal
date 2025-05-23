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
        const response = NextResponse.json({
          months: mockMonths,
          timestamp: Date.now() // Add timestamp to help client identify fresh responses
        }); 

        // Add cache control headers to prevent caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');
        response.headers.set('X-Response-Time', Date.now().toString());

        return response;
      }

      console.log(`API route: Found ${months.length} available months`);

      // Create response with cache control headers
      const response = NextResponse.json({
        months: months,
        timestamp: Date.now() // Add timestamp to help client identify fresh responses
      });

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      response.headers.set('Surrogate-Control', 'no-store');
      response.headers.set('X-Response-Time', Date.now().toString());

      return response;
    } catch (functionError) {
      console.error('Error using imported getAvailableMonths function:', functionError);
      console.log('Falling back to mock data');

      // Create response with cache control headers
      const response = NextResponse.json({
        months: mockMonths,
        timestamp: Date.now() // Add timestamp to help client identify fresh responses
      });

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      response.headers.set('Surrogate-Control', 'no-store');
      response.headers.set('X-Response-Time', Date.now().toString());

      return response;
    }
  } catch (error) {
    console.error('Error fetching available months:', error);

    // Return mock data as fallback
    console.log('API route: Error fetching months, using mock data');

    // Create response with cache control headers
    const response = NextResponse.json({
      months: mockMonths,
      timestamp: Date.now() // Add timestamp to help client identify fresh responses
    });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-Response-Time', Date.now().toString());

    return response;
  }
}
