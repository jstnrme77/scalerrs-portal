import { NextRequest, NextResponse } from 'next/server';
import { addComment, getCommentsByTask } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    console.log('API route: Fetching comments for task ID:', taskId);
    const comments = await getCommentsByTask(taskId);
    console.log(`API route: Found ${comments.length} comments for task ${taskId}`);

    // Log the comments to help debug
    if (comments.length > 0) {
      console.log('API route: First comment:', comments[0]);
    }

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { taskId, userId, comment } = await request.json();

    if (!taskId || !userId || !comment) {
      return NextResponse.json(
        { error: 'Task ID, user ID, and comment are required' },
        { status: 400 }
      );
    }

    const newComment = await addComment(taskId, userId, comment);
    return NextResponse.json({ comment: newComment });
  } catch (error: any) {
    console.error('Error adding comment:', error);

    // Return more specific error messages
    if (error.statusCode === 422) {
      return NextResponse.json(
        {
          error: 'Invalid data format for Airtable',
          details: error.message || 'Check that your Task and User IDs are valid'
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to add comment',
        details: error.message || 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
