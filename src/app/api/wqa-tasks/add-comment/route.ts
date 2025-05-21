import { NextRequest, NextResponse } from 'next/server';
import { addComment } from '@/lib/airtable';
import { getCurrentUser } from '@/lib/api-utils';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { taskId, text } = await request.json();

    if (!taskId || !text) {
      return NextResponse.json(
        { error: 'Task ID and comment text are required' },
        { status: 400 }
      );
    }

    // Get the current user from the request headers
    const currentUser = getCurrentUser(request.headers);
    const userId = currentUser?.id || 'anonymous';

    // Add the comment to the task
    const result = await addComment(taskId, userId, text);
    
    // Return a success response with the new comment
    return NextResponse.json({
      success: true,
      comment: {
        id: result.id || `comment-${Date.now()}`,
        text,
        author: currentUser?.name || 'You',
        timestamp: new Date().toLocaleDateString()
      }
    });
  } catch (error) {
    console.error('Error adding comment to WQA task:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
