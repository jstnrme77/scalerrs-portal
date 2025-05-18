import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';
import { getCurrentUser } from '@/lib/api-utils';

// Helper function to get Airtable base
function getAirtableBase() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    throw new Error('Missing Airtable credentials');
  }

  const airtable = new Airtable({ apiKey });
  return airtable.base(baseId);
}

/**
 * POST handler for adding a comment
 * @param request NextRequest
 * @returns NextResponse with the added comment
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { contentType, itemId, text } = body;

    // Validate parameters
    if (!contentType || !itemId || !text) {
      return NextResponse.json(
        { error: 'Missing required parameters: contentType, itemId, and text' },
        { status: 400 }
      );
    }

    // Only allow Keywords and Briefs content types
    if (contentType !== 'keywords' && contentType !== 'briefs') {
      return NextResponse.json(
        { error: 'Adding comments is only available for Keywords and Briefs content types' },
        { status: 400 }
      );
    }

    // Get the current user
    const currentUser = getCurrentUser();
    const author = currentUser?.name || 'Anonymous User';

    // Get the Airtable base
    const base = getAirtableBase();

    // Create a new comment in Airtable
    const result = await base('Comments').create({
      Comment: text,
      Author: author,
      ContentType: contentType,
      RecordID: itemId,
      CreatedTime: new Date().toISOString()
    });

    // Return the created comment
    return NextResponse.json({
      id: result.id,
      text,
      author,
      timestamp: new Date().toLocaleDateString(),
      contentType,
      itemId
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
