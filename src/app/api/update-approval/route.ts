import { NextRequest, NextResponse } from 'next/server';
import { updateApprovalStatus } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { type, itemId, status, revisionReason } = body;

    // Validate required fields
    if (!type || !itemId || !status) {
      const response = NextResponse.json(
        { error: 'Missing required fields: type, itemId, or status' },
        { status: 400 }
      );

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }

    // Validate type
    if (!['keywords', 'briefs', 'articles', 'backlinks', 'quickwins', 'youtubetopics', 'youtubethumbnails', 'redditthreads'].includes(type)) {
      const response = NextResponse.json(
        { error: 'Invalid type. Must be one of: keywords, briefs, articles, backlinks, quickwins, youtubetopics, youtubethumbnails, redditthreads' },
        { status: 400 }
      );

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }

    // Call the Airtable function to update the status
    const result = await updateApprovalStatus(
      type as 'keywords' | 'briefs' | 'articles' | 'backlinks' | 'quickwins' | 'youtubetopics' | 'youtubethumbnails' | 'redditthreads',
      itemId,
      status,
      revisionReason
    );

    // Create success response with cache control headers
    const response = NextResponse.json({
      success: true,
      id: itemId,
      status,
      result
    });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    console.error('Error updating approval status:', error);

    // Create error response with cache control headers
    const response = NextResponse.json(
      { error: 'Failed to update approval status', details: (error as Error).message },
      { status: 500 }
    );

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  }
}
