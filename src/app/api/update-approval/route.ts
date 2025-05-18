import { NextRequest, NextResponse } from 'next/server';
import { updateApprovalStatus } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { type, itemId, status, revisionReason } = body;

    // Validate required fields
    if (!type || !itemId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: type, itemId, or status' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['keywords', 'briefs', 'articles', 'backlinks'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: keywords, briefs, articles, backlinks' },
        { status: 400 }
      );
    }

    // Call the Airtable function to update the status
    const result = await updateApprovalStatus(
      type as 'keywords' | 'briefs' | 'articles' | 'backlinks',
      itemId,
      status,
      revisionReason
    );

    // Return success response
    return NextResponse.json({
      success: true,
      id: itemId,
      status,
      result
    });
  } catch (error) {
    console.error('Error updating approval status:', error);

    // Return error response
    return NextResponse.json(
      { error: 'Failed to update approval status', details: (error as Error).message },
      { status: 500 }
    );
  }
}
